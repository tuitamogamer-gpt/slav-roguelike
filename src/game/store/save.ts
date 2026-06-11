import type { MetaState, RunState } from '../types';
import { queueCloudSave } from '../cloud/firebase';

const META_KEY = 'triglav.meta.v1';
const RUN_KEY = 'triglav.run.v1';
const SETTINGS_KEY = 'triglav.settings.v1';

export interface SettingsState {
  music: number;
  sfx: number;
  muted: boolean;
  fast: boolean; // faster animations
}

export const DEFAULT_SETTINGS: SettingsState = {
  music: 0.4,
  sfx: 0.6,
  muted: false,
  fast: false,
};

export const DEFAULT_META: MetaState = {
  unlockedClasses: ['vukodlak'],
  unlockedCards: [],
  unlockedRelics: [],
  highestAct: 0,
  wins: 0,
  losses: 0,
  totalRuns: 0,
  bestAscension: 0,
  seenEnemies: [],
};

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return { ...DEFAULT_META };
    return { ...DEFAULT_META, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_META };
  }
}

export function saveMeta(meta: MetaState) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // ignore
  }
  queueCloudSave({ meta });
}

export function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: SettingsState) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function loadRun(): RunState | null {
  try {
    const raw = localStorage.getItem(RUN_KEY);
    return raw ? (JSON.parse(raw) as RunState) : null;
  } catch {
    return null;
  }
}

export function saveRun(run: RunState | null) {
  try {
    if (run) localStorage.setItem(RUN_KEY, JSON.stringify(run));
    else localStorage.removeItem(RUN_KEY);
  } catch {
    // ignore
  }
  queueCloudSave({ run });
}
