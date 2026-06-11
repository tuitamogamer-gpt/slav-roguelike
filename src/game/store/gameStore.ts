import { create } from 'zustand';
import type { CharClass, RunState, CombatState, MetaState } from '../types';
import {
  buildCombat,
  playCard as enginePlayCard,
  endPlayerTurn,
  enemyStep,
  finishEnemyTurn,
  makeCombatApi,
  makeInstance,
} from '../engine/combat';
import { createRun } from '../engine/run';
import { generateMap } from '../engine/mapgen';
import { makeRng, randomSeed, pick } from '../engine/rng';
import {
  rollCardRewards,
  rollRelic,
  rollPotion,
  randomCardOfRarity,
  generateShop,
  type ShopState,
} from '../engine/rewards';
import { ACT1_ENCOUNTERS } from '../content/enemies';
import { EVENTS, type EventDef, type EventApi } from '../content/events';
import { getCard, getPotion } from '../content/registry';
import {
  loadMeta,
  saveMeta,
  loadSettings,
  saveSettings,
  saveRun,
  loadRun,
  type SettingsState,
} from './save';
import { sfx, setVolumes, startMusic } from '../audio/audio';

export type Screen =
  | 'menu'
  | 'classSelect'
  | 'map'
  | 'combat'
  | 'reward'
  | 'shop'
  | 'rest'
  | 'event'
  | 'compendium'
  | 'settings'
  | 'gameover'
  | 'victory';

interface RewardScreenState {
  source: 'normal' | 'elite' | 'boss' | 'treasure';
  gold: number;
  goldTaken: boolean;
  cardChoices: string[];
  cardTaken: boolean;
  relicId: string | null;
  relicTaken: boolean;
  potionId: string | null;
  potionTaken: boolean;
  afterBoss: boolean;
}

interface EventOutcome {
  text: string;
}

interface GameStore {
  screen: Screen;
  prevScreen: Screen;
  meta: MetaState;
  settings: SettingsState;
  run: RunState | null;
  combat: CombatState | null;
  reward: RewardScreenState | null;
  shop: ShopState | null;
  event: EventDef | null;
  eventOutcome: EventOutcome | null;
  enemyActing: boolean;
  flashWorld: boolean;

  // lifecycle
  bootstrap: () => void;
  goMenu: () => void;
  goScreen: (s: Screen) => void;
  openClassSelect: () => void;
  startRun: (cls: CharClass, seed?: string) => void;
  abandonRun: () => void;

  // map
  chooseNode: (nodeId: string) => void;

  // combat
  playCard: (uid: string, targetIndex: number | null) => void;
  endTurn: () => void;
  usePotion: (slot: number, targetIndex: number | null) => void;
  discardPotion: (slot: number) => void;
  _stepEnemies: (i: number) => void;
  _onCombatResolved: () => void;

  // reward
  takeGold: () => void;
  takeCard: (id: string) => void;
  skipCard: () => void;
  takeRelic: () => void;
  takePotion: () => void;
  leaveReward: () => void;

  // shop
  buyShopCard: (id: string) => void;
  buyShopRelic: (id: string) => void;
  buyShopPotion: (id: string) => void;
  shopRemoveCard: (uid: string) => void;
  leaveShop: () => void;

  // rest
  restHeal: () => void;
  restUpgrade: (uid: string) => void;
  leaveRest: () => void;

  // event
  resolveEvent: (choiceIndex: number) => void;
  closeEvent: () => void;

  // settings
  updateSettings: (s: Partial<SettingsState>) => void;
}

function clone<T>(o: T): T {
  return structuredClone(o);
}

function addGold(run: RunState, n: number): number {
  const mult = run.relics.includes('zlatni_zub') ? 1.25 : 1;
  const amt = Math.floor(n * mult);
  run.gold += amt;
  return amt;
}

function applyRelicAtPickup(run: RunState, id: string) {
  if (run.relics.includes(id)) return;
  run.relics.push(id);
  if (id === 'pasje_srce') {
    run.maxHp += 8;
    run.hp += 8;
  } else if (id === 'zlatna_jabuka') {
    run.maxHp += 15;
    run.hp += 15;
  } else if (id === 'putnikova_torba') {
    run.potionSlots += 1;
    run.potions.push(null);
  }
}

function addPotionToRun(run: RunState, id: string): boolean {
  const idx = run.potions.findIndex((p) => p === null);
  if (idx < 0) return false;
  run.potions[idx] = id;
  return true;
}

function rngForFloor(run: RunState, salt: string): () => number {
  return makeRng(`${run.seed}:${run.act}:${run.floorsCleared}:${salt}`);
}

function pickEncounter(run: RunState, kind: 'borba' | 'elita' | 'gazda'): {
  enemies: string[];
  isElite: boolean;
  isBoss: boolean;
} {
  const rng = rngForFloor(run, kind);
  if (kind === 'gazda') return { enemies: pick(ACT1_ENCOUNTERS.boss, rng), isElite: false, isBoss: true };
  if (kind === 'elita') return { enemies: pick(ACT1_ENCOUNTERS.elite, rng), isElite: true, isBoss: false };
  const pool =
    run.floorsCleared <= 1
      ? ACT1_ENCOUNTERS.easy
      : run.floorsCleared >= 6
        ? ACT1_ENCOUNTERS.hard
        : ACT1_ENCOUNTERS.normal;
  return { enemies: pick(pool, rng), isElite: false, isBoss: false };
}

function markNodeChosen(run: RunState, nodeId: string) {
  const map = run.map;
  const node = map.nodes[nodeId];
  if (!node) return;
  node.visited = true;
  map.currentNodeId = nodeId;
  // reset availability
  for (const id of Object.keys(map.nodes)) map.nodes[id].available = false;
  for (const nx of node.next) if (map.nodes[nx]) map.nodes[nx].available = true;
}

export const useGame = create<GameStore>((set, get) => ({
  screen: 'menu',
  prevScreen: 'menu',
  meta: { unlockedClasses: ['vukodlak'], unlockedCards: [], unlockedRelics: [], highestAct: 0, wins: 0, losses: 0, totalRuns: 0, bestAscension: 0, seenEnemies: [] },
  settings: { music: 0.4, sfx: 0.6, muted: false, fast: false },
  run: null,
  combat: null,
  reward: null,
  shop: null,
  event: null,
  eventOutcome: null,
  enemyActing: false,
  flashWorld: false,

  bootstrap: () => {
    const meta = loadMeta();
    const settings = loadSettings();
    setVolumes(settings.music, settings.sfx, settings.muted);
    set({ meta, settings, run: loadRun() });
  },

  goMenu: () => {
    sfx('button');
    set({ screen: 'menu' });
  },
  goScreen: (s) => set((st) => ({ prevScreen: st.screen, screen: s })),
  openClassSelect: () => {
    sfx('button');
    startMusic();
    set({ screen: 'classSelect' });
  },

  startRun: (cls, seed) => {
    const s = seed || randomSeed();
    const run = createRun(cls, s);
    sfx('button');
    saveRun(run);
    set((st) => ({
      run,
      screen: 'map',
      combat: null,
      reward: null,
      meta: { ...st.meta, totalRuns: st.meta.totalRuns + 1 },
    }));
    saveMeta(get().meta);
  },

  abandonRun: () => {
    saveRun(null);
    set({ run: null, combat: null, screen: 'menu' });
  },

  chooseNode: (nodeId) => {
    const { run } = get();
    if (!run) return;
    const node = run.map.nodes[nodeId];
    if (!node || (!node.available && node.kind !== 'start')) return;
    sfx('button');
    const r2 = clone(run);
    markNodeChosen(r2, nodeId);

    if (node.kind === 'borba' || node.kind === 'elita' || node.kind === 'gazda') {
      const enc = pickEncounter(r2, node.kind);
      const meta = clone(get().meta);
      for (const e of enc.enemies) if (!meta.seenEnemies.includes(e)) meta.seenEnemies.push(e);
      const combat = buildCombat(r2, enc.enemies, {
        isElite: enc.isElite,
        isBoss: enc.isBoss,
        encounterId: nodeId,
      });
      saveRun(r2);
      saveMeta(meta);
      set({ run: r2, combat, screen: 'combat', meta });
    } else if (node.kind === 'dogadjaj') {
      const rng = rngForFloor(r2, 'event');
      const ev = pick(EVENTS, rng);
      saveRun(r2);
      set({ run: r2, event: ev, eventOutcome: null, screen: 'event' });
    } else if (node.kind === 'odmor') {
      saveRun(r2);
      set({ run: r2, screen: 'rest' });
    } else if (node.kind === 'trgovac') {
      const shop = generateShop(r2.cls, r2, rngForFloor(r2, 'shop'));
      saveRun(r2);
      set({ run: r2, shop, screen: 'shop' });
    } else if (node.kind === 'blago') {
      const rng = rngForFloor(r2, 'treasure');
      const relicId = rollRelic(r2, rng);
      const reward: RewardScreenState = {
        source: 'treasure',
        gold: 0,
        goldTaken: true,
        cardChoices: [],
        cardTaken: true,
        relicId,
        relicTaken: false,
        potionId: rng() < 0.4 ? rollPotion(rng) : null,
        potionTaken: false,
        afterBoss: false,
      };
      saveRun(r2);
      set({ run: r2, reward, screen: 'reward' });
    }
  },

  // ---------------- combat ----------------
  playCard: (uid, targetIndex) => {
    const { combat, run } = get();
    if (!combat || !run || combat.phase !== 'player') return;
    const inst = combat.hand.find((c) => c.uid === uid);
    if (!inst) return;
    const def = getCard(inst.id);
    const next = clone(combat);
    const ok = enginePlayCard(next, run, uid, targetIndex);
    if (!ok) return;
    sfx(def.type === 'napad' ? 'hit' : def.type === 'moc' ? 'bjes' : 'card');
    set({ combat: next });
    if (next.phase === 'won' || next.phase === 'lost') get()._onCombatResolved();
  },

  endTurn: () => {
    const { combat, run, enemyActing } = get();
    if (!combat || !run || combat.phase !== 'player' || enemyActing) return;
    sfx('button');
    const next = clone(combat);
    endPlayerTurn(next, run);
    set({ combat: next, enemyActing: true });
    if (next.phase === 'lost') {
      get()._onCombatResolved();
      return;
    }
    const delay = get().settings.fast ? 280 : 650;
    window.setTimeout(() => get()._stepEnemies(0), delay);
  },

  _stepEnemies: (i) => {
    const { combat, run } = get();
    if (!combat || !run) return;
    if (combat.phase === 'lost') {
      set({ enemyActing: false });
      get()._onCombatResolved();
      return;
    }
    let idx = i;
    while (idx < combat.enemies.length && combat.enemies[idx].hp <= 0) idx++;
    if (idx >= combat.enemies.length) {
      const next = clone(combat);
      finishEnemyTurn(next, run);
      set({ combat: next, enemyActing: false });
      if (next.phase === 'lost') get()._onCombatResolved();
      return;
    }
    const next = clone(combat);
    enemyStep(next, run, idx);
    const intent = next.enemies[idx]?.intent;
    if (intent && (intent.type === 'attack' || intent.type === 'attack-multi'))
      sfx((intent.value ?? 0) >= 12 ? 'heavy' : 'hit');
    set({ combat: next });
    if (next.phase === 'lost') {
      window.setTimeout(() => {
        set({ enemyActing: false });
        get()._onCombatResolved();
      }, 500);
      return;
    }
    const delay = get().settings.fast ? 320 : 620;
    window.setTimeout(() => get()._stepEnemies(idx + 1), delay);
  },

  usePotion: (slot, targetIndex) => {
    const { combat, run } = get();
    if (!combat || !run || combat.phase !== 'player') return;
    const id = run.potions[slot];
    if (!id) return;
    const def = getPotion(id);
    if (!def) return;
    const next = clone(combat);
    const r2 = clone(run);
    const api = makeCombatApi(next, r2);
    def.use({ state: next, run: r2, targetIndex, api });
    r2.potions[slot] = null;
    sfx(def.target === 'enemy' ? 'magic' : 'heal');
    set({ combat: next, run: r2 });
    if (next.phase === 'won' || next.phase === 'lost') get()._onCombatResolved();
  },

  discardPotion: (slot) => {
    const { run } = get();
    if (!run) return;
    const r2 = clone(run);
    r2.potions[slot] = null;
    sfx('button');
    set({ run: r2 });
  },

  _onCombatResolved: () => {
    const { combat, run, meta } = get();
    if (!combat || !run) return;
    if (combat.phase === 'won') {
      const r2 = clone(run);
      r2.hp = combat.player.hp;
      r2.floorsCleared += 1;
      const rng = makeRng(`${r2.seed}:reward:${r2.floorsCleared}`);
      let source: RewardScreenState['source'] = 'normal';
      if (combat.isBoss) source = 'boss';
      else if (combat.isElite) source = 'elite';
      const extraEnemies = Math.max(0, combat.enemies.length - 1);
      const goldBase = combat.isBoss
        ? 95 + Math.floor(rng() * 15)
        : combat.isElite
          ? 30 + Math.floor(rng() * 15)
          : 12 + Math.floor(rng() * 12) + extraEnemies * 5;
      const cardChoices = rollCardRewards(r2.cls, rng, source === 'boss' ? 'boss' : source === 'elite' ? 'elite' : 'normal');
      const relicId = combat.isBoss || combat.isElite ? rollRelic(r2, rng) : null;
      const potionId = !combat.isBoss && rng() < 0.4 ? rollPotion(rng) : null;
      const reward: RewardScreenState = {
        source,
        gold: goldBase,
        goldTaken: false,
        cardChoices,
        cardTaken: false,
        relicId,
        relicTaken: false,
        potionId,
        potionTaken: false,
        afterBoss: !!combat.isBoss,
      };
      sfx('victory');
      saveRun(r2);
      set({ run: r2, combat: null, reward, screen: 'reward' });
    } else if (combat.phase === 'lost') {
      sfx('defeat');
      const m = clone(meta);
      m.losses += 1;
      m.highestAct = Math.max(m.highestAct, run.act);
      saveMeta(m);
      saveRun(null);
      set({ meta: m, combat: null, enemyActing: false, screen: 'gameover' });
    }
  },

  // ---------------- reward ----------------
  takeGold: () => {
    const { run, reward } = get();
    if (!run || !reward || reward.goldTaken) return;
    const r2 = clone(run);
    addGold(r2, reward.gold);
    sfx('coin');
    saveRun(r2);
    set({ run: r2, reward: { ...reward, goldTaken: true } });
  },
  takeCard: (id) => {
    const { run, reward } = get();
    if (!run || !reward || reward.cardTaken) return;
    const r2 = clone(run);
    r2.deck.push(makeInstance(id, false));
    sfx('card');
    saveRun(r2);
    set({ run: r2, reward: { ...reward, cardTaken: true } });
  },
  skipCard: () => {
    const { reward } = get();
    if (!reward) return;
    sfx('button');
    set({ reward: { ...reward, cardTaken: true } });
  },
  takeRelic: () => {
    const { run, reward } = get();
    if (!run || !reward || !reward.relicId || reward.relicTaken) return;
    const r2 = clone(run);
    applyRelicAtPickup(r2, reward.relicId);
    sfx('coin');
    saveRun(r2);
    set({ run: r2, reward: { ...reward, relicTaken: true } });
  },
  takePotion: () => {
    const { run, reward } = get();
    if (!run || !reward || !reward.potionId || reward.potionTaken) return;
    const r2 = clone(run);
    const ok = addPotionToRun(r2, reward.potionId);
    if (!ok) return;
    sfx('button');
    saveRun(r2);
    set({ run: r2, reward: { ...reward, potionTaken: true } });
  },
  leaveReward: () => {
    const { reward, run, meta } = get();
    if (!run) return;
    sfx('button');
    if (reward?.afterBoss) {
      // Act 1 is the full game for now → victory
      const m = clone(meta);
      m.wins += 1;
      m.highestAct = Math.max(m.highestAct, run.act + 1);
      if (!m.unlockedClasses.includes('vjestica')) m.unlockedClasses.push('vjestica');
      saveMeta(m);
      saveRun(null);
      set({ meta: m, reward: null, screen: 'victory' });
      return;
    }
    set({ reward: null, screen: 'map' });
  },

  // ---------------- shop ----------------
  buyShopCard: (id) => {
    const { run, shop } = get();
    if (!run || !shop) return;
    const entry = shop.cards.find((c) => c.id === id && !c.sold);
    if (!entry || run.gold < entry.price) return;
    const r2 = clone(run);
    r2.gold -= entry.price;
    r2.deck.push(makeInstance(id, false));
    sfx('coin');
    saveRun(r2);
    set({
      run: r2,
      shop: { ...shop, cards: shop.cards.map((c) => (c.id === id ? { ...c, sold: true } : c)) },
    });
  },
  buyShopRelic: (id) => {
    const { run, shop } = get();
    if (!run || !shop) return;
    const entry = shop.relics.find((r) => r.id === id && !r.sold);
    if (!entry || run.gold < entry.price) return;
    const r2 = clone(run);
    r2.gold -= entry.price;
    applyRelicAtPickup(r2, id);
    sfx('coin');
    saveRun(r2);
    set({
      run: r2,
      shop: { ...shop, relics: shop.relics.map((r) => (r.id === id ? { ...r, sold: true } : r)) },
    });
  },
  buyShopPotion: (id) => {
    const { run, shop } = get();
    if (!run || !shop) return;
    const entry = shop.potions.find((p) => p.id === id && !p.sold);
    if (!entry || run.gold < entry.price) return;
    const r2 = clone(run);
    if (!addPotionToRun(r2, id)) return;
    r2.gold -= entry.price;
    sfx('coin');
    saveRun(r2);
    // mark the first matching unsold entry as sold
    let done = false;
    const potions = shop.potions.map((p) => {
      if (!done && p.id === id && !p.sold) {
        done = true;
        return { ...p, sold: true };
      }
      return p;
    });
    set({ run: r2, shop: { ...shop, potions } });
  },
  shopRemoveCard: (uid) => {
    const { run, shop } = get();
    if (!run || !shop || shop.removeUsed || run.gold < shop.removeCost) return;
    const r2 = clone(run);
    r2.gold -= shop.removeCost;
    r2.deck = r2.deck.filter((c) => c.uid !== uid);
    sfx('coin');
    saveRun(r2);
    set({ run: r2, shop: { ...shop, removeUsed: true } });
  },
  leaveShop: () => {
    sfx('button');
    set({ shop: null, screen: 'map' });
  },

  // ---------------- rest ----------------
  restHeal: () => {
    const { run } = get();
    if (!run) return;
    const r2 = clone(run);
    const heal = Math.floor(r2.maxHp * 0.25);
    r2.hp = Math.min(r2.maxHp, r2.hp + heal);
    sfx('heal');
    saveRun(r2);
    set({ run: r2, screen: 'map' });
  },
  restUpgrade: (uid) => {
    const { run } = get();
    if (!run) return;
    const r2 = clone(run);
    const card = r2.deck.find((c) => c.uid === uid);
    if (card) card.upgraded = true;
    sfx('magic');
    saveRun(r2);
    set({ run: r2, screen: 'map' });
  },
  leaveRest: () => {
    sfx('button');
    set({ screen: 'map' });
  },

  // ---------------- event ----------------
  resolveEvent: (choiceIndex) => {
    const { run, event } = get();
    if (!run || !event) return;
    const choice = event.choices[choiceIndex];
    if (!choice) return;
    if (choice.enabled && !choice.enabled(run)) return;
    const r2 = clone(run);
    const rng = rngForFloor(r2, `event-resolve-${choiceIndex}`);
    const api: EventApi = {
      run: r2,
      rng,
      heal: (n) => {
        r2.hp = Math.min(r2.maxHp, r2.hp + n);
      },
      loseHp: (n) => {
        r2.hp = Math.max(1, r2.hp - n);
      },
      gainGold: (n) => addGold(r2, n),
      loseGold: (n) => {
        r2.gold = Math.max(0, r2.gold - n);
      },
      gainMaxHp: (n) => {
        r2.maxHp += n;
        r2.hp += n;
      },
      loseMaxHp: (n) => {
        r2.maxHp = Math.max(1, r2.maxHp - n);
        r2.hp = Math.min(r2.hp, r2.maxHp);
      },
      addCard: (id, upgraded) => r2.deck.push(makeInstance(id, !!upgraded)),
      addRandomCardOfRarity: (rarity) => {
        const id = randomCardOfRarity(r2.cls, rarity, rng);
        if (id) r2.deck.push(makeInstance(id, false));
        return id;
      },
      removeRandomCard: () => {
        const removable = r2.deck.filter((c) => {
          const d = getCard(c.id);
          return d.rarity !== 'osnovna' || r2.deck.length > 5;
        });
        if (removable.length === 0) return null;
        const target = pick(removable, rng);
        r2.deck = r2.deck.filter((c) => c.uid !== target.uid);
        return target.id;
      },
      upgradeRandomCard: () => {
        const upgradable = r2.deck.filter((c) => !c.upgraded && getCard(c.id).type !== 'kletva');
        if (upgradable.length === 0) return null;
        const target = pick(upgradable, rng);
        target.upgraded = true;
        return target.id;
      },
      addRelic: () => {
        const id = rollRelic(r2, rng);
        if (id) applyRelicAtPickup(r2, id);
        return id;
      },
      addCurse: () => {
        const curses = ['kletva_jad', 'kletva_klin'];
        r2.deck.push(makeInstance(pick(curses, rng), false));
      },
      addPotion: () => {
        const id = rollPotion(rng);
        return addPotionToRun(r2, id) ? id : null;
      },
    };
    const text = choice.resolve(api);
    sfx('button');
    saveRun(r2);
    set({ run: r2, eventOutcome: { text } });
  },
  closeEvent: () => {
    sfx('button');
    set({ event: null, eventOutcome: null, screen: 'map' });
  },

  // ---------------- settings ----------------
  updateSettings: (s) => {
    const next = { ...get().settings, ...s };
    setVolumes(next.music, next.sfx, next.muted);
    saveSettings(next);
    set({ settings: next });
  },
}));

// re-export for convenience
export { generateMap };
export type { ShopState };

// dev-only debug hook for testing
if (import.meta.env.DEV) {
  (window as unknown as { __game: typeof useGame }).__game = useGame;
}
