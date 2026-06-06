import type { PotionDef } from '../types';

const P = (p: PotionDef): PotionDef => p;

export const POTIONS: PotionDef[] = [
  P({
    id: 'napitak_snage',
    name: 'Napitak snage',
    rarity: 'cesta',
    color: '#d86a4a',
    target: 'self',
    text: 'Stekni 2 Snage.',
    use: ({ api, state }) => {
      if (api && state) api.applyStatus(state.player, 'player', 'strength', 2);
    },
  }),
  P({
    id: 'napitak_okretnosti',
    name: 'Napitak okretnosti',
    rarity: 'cesta',
    color: '#6db3c8',
    target: 'self',
    text: 'Stekni 2 Spretnosti.',
    use: ({ api, state }) => {
      if (api && state) api.applyStatus(state.player, 'player', 'dexterity', 2);
    },
  }),
  P({
    id: 'krvavi_napitak',
    name: 'Krvavi napitak',
    rarity: 'cesta',
    color: '#9c1f1f',
    target: 'self',
    text: 'Izliječi 20% maksimalnog zdravlja.',
    use: ({ api, state, run }) => {
      if (api && state) api.heal(state.player, 'player', Math.floor(run.maxHp * 0.2));
    },
  }),
  P({
    id: 'napitak_energije',
    name: 'Napitak energije',
    rarity: 'cesta',
    color: '#f4d160',
    target: 'self',
    text: 'Stekni 2 energije.',
    use: ({ api }) => {
      if (api) api.gainEnergy(2);
    },
  }),
  P({
    id: 'napitak_bijesa',
    name: 'Napitak bijesa',
    rarity: 'neobicna',
    color: '#d83232',
    target: 'self',
    text: 'Stekni 5 Bijesa.',
    use: ({ api, state }) => {
      if (api && state) api.applyStatus(state.player, 'player', 'bjes', 5);
    },
  }),
  P({
    id: 'otrovni_napitak',
    name: 'Otrovni napitak',
    rarity: 'neobicna',
    color: '#7aa83f',
    target: 'enemy',
    text: 'Daj meti 8 Otrova.',
    use: ({ api, state, targetIndex }) => {
      if (api && state && targetIndex !== null) {
        const e = state.enemies[targetIndex];
        if (e) api.applyStatus(e, targetIndex, 'poison', 8);
      }
    },
  }),
  P({
    id: 'napitak_vatre',
    name: 'Napitak vatre',
    rarity: 'neobicna',
    color: '#e07b2c',
    target: 'enemy',
    text: 'Nanesi meti 20 štete.',
    use: ({ api, state, targetIndex }) => {
      if (api && state && targetIndex !== null) {
        const e = state.enemies[targetIndex];
        if (e) api.dealDamage('player', e, targetIndex, 20, { fromCard: true });
      }
    },
  }),
  P({
    id: 'napitak_stita',
    name: 'Napitak štita',
    rarity: 'cesta',
    color: '#7fb0c4',
    target: 'self',
    text: 'Stekni 12 štita.',
    use: ({ api, state }) => {
      if (api && state) api.gainBlock(state.player, 'player', 12);
    },
  }),
];
