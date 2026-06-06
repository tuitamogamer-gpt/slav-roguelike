import type { EnemyDef, EnemyState, CombatState, Intent } from '../types';

// ---- helpers ----
function str(e: EnemyState): number {
  return e.statuses.strength ?? 0;
}
// final damage a hit would deal to the player (attacker + defender mods)
function atk(state: CombatState, self: EnemyState, base: number): number {
  let d = base + str(self);
  if ((self.statuses.weak ?? 0) > 0) d = Math.floor(d * 0.75);
  if ((state.player.statuses.vulnerable ?? 0) > 0) d = Math.floor(d * 1.5);
  return Math.max(0, d);
}
const attackIntent = (state: CombatState, self: EnemyState, base: number, hits = 1): Intent => ({
  type: hits > 1 ? 'attack-multi' : 'attack',
  value: atk(state, self, base),
  hits,
});

// ============================================================
// ACT 1 — common
// ============================================================
const drekavac: EnemyDef = {
  id: 'drekavac',
  name: 'Drekavac',
  world: 'jav',
  hpRange: [22, 26],
  sprite: 'drekavac',
  flavor: 'Krik nekrštene duše para noć.',
  moves: [
    {
      id: 'krik',
      name: 'Krik',
      intent: { type: 'debuff', label: 'Nemoć' },
      perform: ({ api, state }) => api.applyStatus(state.player, 'player', 'weak', 2),
    },
    {
      id: 'kandze',
      name: 'Kandže',
      intent: { type: 'attack', value: 7 },
      perform: ({ api, state, self }) =>
        api.dealDamage(self, state.player, 'player', 7),
    },
  ],
  ai: ({ state, self }) => {
    const last = self.history[self.history.length - 1];
    if (last !== 'krik' && self.turnCount % 3 === 1)
      return { ...drekavac.moves[0] };
    return { ...drekavac.moves[1], intent: attackIntent(state, self, 7) };
  },
};

const vodnjak: EnemyDef = {
  id: 'vodnjak',
  name: 'Vodnjak',
  world: 'jav',
  hpRange: [28, 33],
  sprite: 'vodnjak',
  flavor: 'Vuče utopljenike na dno rijeke.',
  moves: [
    {
      id: 'povlacenje',
      name: 'Povlačenje',
      intent: { type: 'attack', value: 9 },
      perform: ({ api, state, self }) => api.dealDamage(self, state.player, 'player', 9),
    },
    {
      id: 'mjehur',
      name: 'Mjehur',
      intent: { type: 'block', value: 8 },
      perform: ({ api, self }) => api.gainBlock(self, api.enemyIndex(self), 8),
    },
  ],
  ai: ({ state, self }) => {
    if (self.history[self.history.length - 1] === 'povlacenje') return { ...vodnjak.moves[1] };
    return { ...vodnjak.moves[0], intent: attackIntent(state, self, 9) };
  },
};

const bauk: EnemyDef = {
  id: 'bauk',
  name: 'Bauk',
  world: 'jav',
  hpRange: [30, 35],
  sprite: 'bauk',
  flavor: 'Vreba iz mraka pod podom.',
  moves: [
    {
      id: 'grebanje',
      name: 'Dvostruki ogreb',
      intent: { type: 'attack-multi', value: 4, hits: 2 },
      perform: ({ api, state, self }) => {
        api.dealDamage(self, state.player, 'player', 4);
        api.dealDamage(self, state.player, 'player', 4);
      },
    },
    {
      id: 'rezanje',
      name: 'Režanje',
      intent: { type: 'buff', label: 'Snaga' },
      perform: ({ api, self }) => api.applyStatus(self, api.enemyIndex(self), 'strength', 2),
    },
  ],
  ai: ({ state, self }) => {
    if (self.turnCount % 4 === 2) return { ...bauk.moves[1] };
    return { ...bauk.moves[0], intent: attackIntent(state, self, 4, 2) };
  },
};

const mora: EnemyDef = {
  id: 'mora',
  name: 'Mora',
  world: 'jav',
  hpRange: [26, 30],
  sprite: 'mora',
  flavor: 'Sjeda na grudi usnulih i pije dah.',
  moves: [
    {
      id: 'tlapnja',
      name: 'Tlapnja',
      intent: { type: 'debuff', label: 'Nemoć + Ranjivost' },
      perform: ({ api, state }) => {
        api.applyStatus(state.player, 'player', 'weak', 1);
        api.applyStatus(state.player, 'player', 'vulnerable', 1);
      },
    },
    {
      id: 'gusenje',
      name: 'Gušenje',
      intent: { type: 'attack', value: 8 },
      perform: ({ api, state, self }) => api.dealDamage(self, state.player, 'player', 8),
    },
  ],
  ai: ({ state, self }) => {
    if (self.turnCount % 2 === 1) return { ...mora.moves[0] };
    return { ...mora.moves[1], intent: attackIntent(state, self, 8) };
  },
};

const karakondzula: EnemyDef = {
  id: 'karakondzula',
  name: 'Karakondžula',
  world: 'jav',
  hpRange: [40, 46],
  sprite: 'karakondzula',
  flavor: 'Zimski demon nekrštenih dana.',
  moves: [
    {
      id: 'mlat',
      name: 'Ledeni mlat',
      intent: { type: 'attack', value: 12 },
      perform: ({ api, state, self }) => api.dealDamage(self, state.player, 'player', 12),
    },
    {
      id: 'led',
      name: 'Okivanje ledom',
      intent: { type: 'debuff', label: 'Krhkost' },
      perform: ({ api, state }) => api.applyStatus(state.player, 'player', 'frail', 2),
    },
    {
      id: 'oklop',
      name: 'Ledena kora',
      intent: { type: 'block', value: 10 },
      perform: ({ api, self }) => api.gainBlock(self, api.enemyIndex(self), 10),
    },
  ],
  ai: ({ state, self }) => {
    const t = self.turnCount % 3;
    if (t === 1) return { ...karakondzula.moves[1] };
    if (t === 2) return { ...karakondzula.moves[2] };
    return { ...karakondzula.moves[0], intent: attackIntent(state, self, 12) };
  },
};

const vuk: EnemyDef = {
  id: 'vuk',
  name: 'Izgladnjeli vuk',
  world: 'jav',
  hpRange: [20, 24],
  sprite: 'vuk',
  flavor: 'Glad ga čini sve bržim.',
  moves: [
    {
      id: 'ujed',
      name: 'Ujed',
      intent: { type: 'attack', value: 6 },
      perform: ({ api, state, self }) => api.dealDamage(self, state.player, 'player', 6),
    },
    {
      id: 'copor',
      name: 'Zov čopora',
      intent: { type: 'buff', label: 'Obred' },
      perform: ({ api, self }) => api.applyStatus(self, api.enemyIndex(self), 'ritual', 1),
    },
  ],
  ai: ({ state, self }) => {
    if (self.turnCount === 1) return { ...vuk.moves[1] };
    return { ...vuk.moves[0], intent: attackIntent(state, self, 6) };
  },
};

const senka: EnemyDef = {
  id: 'senka',
  name: 'Senka',
  world: 'jav',
  hpRange: [16, 19],
  sprite: 'senka',
  flavor: 'Otkinuta sjena luta sama.',
  moves: [
    {
      id: 'dodir',
      name: 'Hladni dodir',
      intent: { type: 'attack', value: 5 },
      perform: ({ api, state, self }) => api.dealDamage(self, state.player, 'player', 5),
    },
    {
      id: 'mrak',
      name: 'Zastiranje',
      intent: { type: 'debuff', label: 'Krhkost' },
      perform: ({ api, state }) => api.applyStatus(state.player, 'player', 'frail', 1),
    },
  ],
  ai: ({ state, self, roll }) =>
    roll(3) === 0
      ? { ...senka.moves[1] }
      : { ...senka.moves[0], intent: attackIntent(state, self, 5) },
};

const grobna_vjestica: EnemyDef = {
  id: 'grobna_vjestica',
  name: 'Grobna vještica',
  world: 'jav',
  hpRange: [24, 28],
  sprite: 'grobna_vjestica',
  flavor: 'Plete kletve od korijenja i kosti.',
  moves: [
    {
      id: 'otrov',
      name: 'Otrovni prah',
      intent: { type: 'debuff', label: 'Otrov' },
      perform: ({ api, state }) => api.applyStatus(state.player, 'player', 'poison', 4),
    },
    {
      id: 'stap',
      name: 'Udar štapom',
      intent: { type: 'attack', value: 7 },
      perform: ({ api, state, self }) => api.dealDamage(self, state.player, 'player', 7),
    },
  ],
  ai: ({ state, self }) => {
    if (self.turnCount % 3 === 1) return { ...grobna_vjestica.moves[0] };
    return { ...grobna_vjestica.moves[1], intent: attackIntent(state, self, 7) };
  },
};

// ============================================================
// ACT 1 — elites
// ============================================================
const vampir: EnemyDef = {
  id: 'vampir',
  name: 'Vampir',
  world: 'jav',
  isElite: true,
  hpRange: [62, 68],
  sprite: 'vampir',
  scale: 1.15,
  flavor: 'Mrtvac koji noću ustaje iz groba.',
  moves: [
    {
      id: 'ugriz',
      name: 'Krvavi ugriz',
      intent: { type: 'attack', value: 11 },
      perform: ({ api, state, self }) => {
        const dealt = api.dealDamage(self, state.player, 'player', 11);
        if (dealt > 0) api.heal(self, api.enemyIndex(self), dealt);
      },
    },
    {
      id: 'sazi',
      name: 'Crna magla',
      intent: { type: 'debuff', label: 'Nemoć + Krhkost' },
      perform: ({ api, state }) => {
        api.applyStatus(state.player, 'player', 'weak', 2);
        api.applyStatus(state.player, 'player', 'frail', 2);
      },
    },
    {
      id: 'obred',
      name: 'Krvni obred',
      intent: { type: 'buff', label: 'Obred' },
      perform: ({ api, self }) => api.applyStatus(self, api.enemyIndex(self), 'ritual', 1),
    },
  ],
  ai: ({ state, self }) => {
    if (self.turnCount === 1) return { ...vampir.moves[2] };
    if (self.turnCount % 4 === 0) return { ...vampir.moves[1] };
    return { ...vampir.moves[0], intent: attackIntent(state, self, 11) };
  },
};

const azdaja: EnemyDef = {
  id: 'azdaja',
  name: 'Aždaja mladunče',
  world: 'jav',
  isElite: true,
  hpRange: [70, 78],
  sprite: 'azdaja',
  scale: 1.25,
  flavor: 'Troglava neman još uvijek raste.',
  moves: [
    {
      id: 'plamen',
      name: 'Dah plamena',
      intent: { type: 'attack', value: 9 },
      perform: ({ api, state, self }) => {
        api.dealDamage(self, state.player, 'player', 9);
        api.addCardToHand('opekotina'); // shove a Burn into hand
      },
    },
    {
      id: 'rep',
      name: 'Zamah repom',
      intent: { type: 'attack-multi', value: 5, hits: 2 },
      perform: ({ api, state, self }) => {
        api.dealDamage(self, state.player, 'player', 5);
        api.dealDamage(self, state.player, 'player', 5);
      },
    },
    {
      id: 'rika',
      name: 'Rika',
      intent: { type: 'buff', label: 'Snaga' },
      perform: ({ api, self }) => api.applyStatus(self, api.enemyIndex(self), 'strength', 3),
    },
  ],
  ai: ({ state, self }) => {
    const t = self.turnCount % 3;
    if (t === 1) return { ...azdaja.moves[2] };
    if (t === 2) return { ...azdaja.moves[1], intent: attackIntent(state, self, 5, 2) };
    return { ...azdaja.moves[0], intent: attackIntent(state, self, 9) };
  },
};

const lesnik: EnemyDef = {
  id: 'lesnik',
  name: 'Lešnik',
  world: 'jav',
  isElite: true,
  hpRange: [80, 88],
  sprite: 'lesnik',
  scale: 1.3,
  flavor: 'Gospodar šume, visok kao stoljetni hrast.',
  moves: [
    {
      id: 'gazenje',
      name: 'Gaženje',
      intent: { type: 'attack', value: 15 },
      perform: ({ api, state, self }) => api.dealDamage(self, state.player, 'player', 15),
    },
    {
      id: 'korijenje',
      name: 'Korijenje',
      intent: { type: 'debuff', label: 'Nemoć' },
      perform: ({ api, state }) => api.applyStatus(state.player, 'player', 'weak', 2),
    },
    {
      id: 'kora',
      name: 'Kora hrasta',
      intent: { type: 'block', value: 14 },
      perform: ({ api, self }) => {
        api.gainBlock(self, api.enemyIndex(self), 14);
        api.applyStatus(self, api.enemyIndex(self), 'strength', 1);
      },
    },
  ],
  ai: ({ state, self }) => {
    const t = self.turnCount % 3;
    if (t === 1) return { ...lesnik.moves[2] };
    if (t === 0) return { ...lesnik.moves[1] };
    return { ...lesnik.moves[0], intent: attackIntent(state, self, 15) };
  },
};

// ============================================================
// ACT 1 — BOSS: Babaroga (two phases)
// ============================================================
const babaroga: EnemyDef = {
  id: 'babaroga',
  name: 'Babaroga',
  world: 'jav',
  isBoss: true,
  hpRange: [150, 150],
  sprite: 'babaroga',
  scale: 1.5,
  flavor: 'Gasi vatru i svjetlost; u njenoj torbi nestaju neposlušni.',
  onSpawn: (e) => {
    e.data.phase = 0;
  },
  moves: [
    {
      id: 'grabljenje',
      name: 'Grabljenje',
      intent: { type: 'attack', value: 11 },
      perform: ({ api, state, self }) => api.dealDamage(self, state.player, 'player', 11),
    },
    {
      id: 'krik_noci',
      name: 'Krik noći',
      intent: { type: 'debuff', label: 'Nemoć + Krhkost' },
      perform: ({ api, state }) => {
        api.applyStatus(state.player, 'player', 'weak', 2);
        api.applyStatus(state.player, 'player', 'frail', 2);
      },
    },
    {
      id: 'gasenje',
      name: 'Gašenje svjetla',
      intent: { type: 'attack-multi', value: 4, hits: 3 },
      perform: ({ api, state, self }) => {
        for (let i = 0; i < 3; i++) api.dealDamage(self, state.player, 'player', 4);
        api.addCardToHand('rana');
      },
    },
    {
      id: 'torba',
      name: 'Vreća tame',
      intent: { type: 'attack', value: 20 },
      perform: ({ api, state, self }) => {
        api.dealDamage(self, state.player, 'player', 20);
        api.heal(self, api.enemyIndex(self), 8);
      },
    },
    {
      id: 'bijes',
      name: 'Babin bijes',
      intent: { type: 'buff', label: 'Snaga' },
      perform: ({ api, self }) => api.applyStatus(self, api.enemyIndex(self), 'strength', 3),
    },
  ],
  ai: ({ state, self }) => {
    const half = self.hp <= self.maxHp / 2;
    if (half && self.data.phase === 0) {
      self.data.phase = 1;
      return { ...babaroga.moves[4] }; // enrage on entering phase 2
    }
    if (self.data.phase === 1) {
      const t = self.turnCount % 3;
      if (t === 0) return { ...babaroga.moves[3], intent: attackIntent(state, self, 20) };
      if (t === 1) return { ...babaroga.moves[2], intent: attackIntent(state, self, 4, 3) };
      return { ...babaroga.moves[1] };
    }
    const t = self.turnCount % 3;
    if (t === 1) return { ...babaroga.moves[1] };
    if (t === 2) return { ...babaroga.moves[2], intent: attackIntent(state, self, 4, 3) };
    return { ...babaroga.moves[0], intent: attackIntent(state, self, 11) };
  },
};

export const ENEMIES: EnemyDef[] = [
  drekavac,
  vodnjak,
  bauk,
  mora,
  karakondzula,
  vuk,
  senka,
  grobna_vjestica,
  vampir,
  azdaja,
  lesnik,
  babaroga,
];

// Encounter pools for act 1
export const ACT1_ENCOUNTERS = {
  easy: [['vuk', 'vuk'], ['drekavac'], ['senka', 'senka'], ['bauk']],
  normal: [
    ['drekavac', 'vodnjak'],
    ['mora', 'senka'],
    ['karakondzula'],
    ['grobna_vjestica', 'vuk'],
    ['bauk', 'bauk'],
    ['vodnjak', 'mora'],
  ],
  elite: [['vampir'], ['azdaja'], ['lesnik']],
  boss: [['babaroga']],
};
