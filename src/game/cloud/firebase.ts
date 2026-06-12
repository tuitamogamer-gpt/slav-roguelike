// Firebase auth + cloud save. The SDK is loaded lazily so the game UI
// renders before any network weight; everything degrades gracefully to
// local-only play when offline or logged out.
import type { MetaState, RunState } from '../types';

const firebaseConfig = {
  apiKey: 'AIzaSyDZDzdXwMe6a2cx00FnAs9DpKSfPvqzcsQ',
  authDomain: 'triglav-game.firebaseapp.com',
  projectId: 'triglav-game',
  storageBucket: 'triglav-game.firebasestorage.app',
  messagingSenderId: '469470957154',
  appId: '1:469470957154:web:6aa145a0b8138b0e078b3b',
};

export interface CloudUser {
  uid: string;
  name: string;
  email: string;
  photo: string | null;
}

type AuthCb = (user: CloudUser | null) => void;
type StatusCb = (status: 'off' | 'syncing' | 'ok' | 'error') => void;

let authCb: AuthCb = () => {};
let statusCb: StatusCb = () => {};
let currentUser: CloudUser | null = null;
interface Sdk {
  auth: import('firebase/auth').Auth;
  db: import('firebase/firestore').Firestore;
}
let sdk: Sdk | null = null;
let sdkPromise: Promise<Sdk> | null = null;

async function loadSdk(): Promise<Sdk> {
  if (sdk) return sdk;
  if (!sdkPromise) {
    sdkPromise = (async () => {
      const [{ initializeApp }, authMod, fsMod] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
      ]);
      const app = initializeApp(firebaseConfig);
      const auth = authMod.getAuth(app);
      const db = fsMod.getFirestore(app);
      authMod.onAuthStateChanged(auth, (u) => {
        currentUser = u
          ? {
              uid: u.uid,
              name: u.displayName ?? 'Igrač',
              email: u.email ?? '',
              photo: u.photoURL,
            }
          : null;
        authCb(currentUser);
      });
      sdk = { auth, db };
      return sdk;
    })();
  }
  return sdkPromise;
}

/** Start listening for auth state (call once on app boot). */
export function initCloud(onAuth: AuthCb, onStatus: StatusCb) {
  authCb = onAuth;
  statusCb = onStatus;
  // load in background; never block the UI
  loadSdk().catch(() => statusCb('error'));
}

export async function loginGoogle(): Promise<void> {
  const s = await loadSdk();
  if (!s) throw new Error('SDK nije učitan');
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  await signInWithPopup(s.auth, new GoogleAuthProvider());
}

export async function logout(): Promise<void> {
  const s = await loadSdk();
  if (!s) return;
  const { signOut } = await import('firebase/auth');
  await signOut(s.auth);
}

export interface CloudData {
  meta?: MetaState;
  run?: RunState | null;
}

/** Fetch this user's cloud save (null if none). */
export async function fetchCloud(): Promise<CloudData | null> {
  if (!currentUser) return null;
  const s = await loadSdk();
  if (!s) return null;
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(s.db, 'users', currentUser.uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { meta?: MetaState; run?: unknown };
  // run je spremljen kao JSON string (Firestore ne podržava ugniježdene nizove)
  let run: RunState | null = null;
  if (typeof data.run === 'string') {
    try {
      run = JSON.parse(data.run) as RunState;
    } catch {
      run = null;
    }
  } else if (data.run && typeof data.run === 'object') {
    run = data.run as RunState; // stariji format (bez mape ne bi prošao, ali za svaki slučaj)
  }
  return { meta: data.meta, run };
}

// ---- debounced save ----
let pending: { meta?: MetaState; run?: RunState | null } = {};
let timer: number | null = null;

export function queueCloudSave(data: { meta?: MetaState; run?: RunState | null }) {
  if (!currentUser) return;
  pending = { ...pending, ...data };
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(flushCloudSave, 1500);
}

export async function flushCloudSave() {
  if (timer) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (!currentUser) return;
  const data = pending;
  pending = {};
  if (data.meta === undefined && data.run === undefined) return;
  try {
    statusCb('syncing');
    const s = await loadSdk();
    if (!s) throw new Error('no sdk');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const payload: Record<string, unknown> = {
      name: currentUser.name,
      email: currentUser.email,
      updatedAt: serverTimestamp(),
    };
    if (data.meta !== undefined) payload.meta = JSON.parse(JSON.stringify(data.meta));
    // run kao JSON string — RunState sadrži ugniježdene nizove (map.columns)
    // koje Firestore ne prihvata kao polja
    if (data.run !== undefined) payload.run = data.run ? JSON.stringify(data.run) : null;
    await setDoc(doc(s.db, 'users', currentUser.uid), payload, { merge: true });
    statusCb('ok');
  } catch {
    statusCb('error');
  }
}

/** Union/max merge — never loses progress from either side. */
export function mergeMeta(local: MetaState, cloud: MetaState): MetaState {
  const uniq = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])];
  return {
    unlockedClasses: uniq(local.unlockedClasses, cloud.unlockedClasses) as MetaState['unlockedClasses'],
    unlockedCards: uniq(local.unlockedCards, cloud.unlockedCards),
    unlockedRelics: uniq(local.unlockedRelics, cloud.unlockedRelics),
    seenEnemies: uniq(local.seenEnemies, cloud.seenEnemies),
    highestAct: Math.max(local.highestAct, cloud.highestAct ?? 0),
    wins: Math.max(local.wins, cloud.wins ?? 0),
    losses: Math.max(local.losses, cloud.losses ?? 0),
    totalRuns: Math.max(local.totalRuns, cloud.totalRuns ?? 0),
    bestAscension: Math.max(local.bestAscension, cloud.bestAscension ?? 0),
  };
}
