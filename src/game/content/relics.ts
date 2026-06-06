import type { RelicDef } from '../types';

const R = (r: RelicDef): RelicDef => r;

// Run-level relics (max HP, gold, potion slots) are applied at pickup time
// by the store; their onTrigger is left empty. Combat relics use hooks.
export const RELICS: RelicDef[] = [
  // ---- starter / common ----
  R({
    id: 'pasje_srce',
    name: 'Pasje srce',
    rarity: 'cesta',
    sprite: 'heart',
    text: 'Maksimalno zdravlje +8.',
    flavor: 'Vjerno kuca i nakon smrti.',
    hook: 'passive',
  }),
  R({
    id: 'vucja_koza',
    name: 'Vučja koža',
    rarity: 'cesta',
    sprite: 'pelt',
    text: 'Na početku svake borbe stekni 4 štita.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => api.gainBlock(state.player, 'player', 4),
  }),
  R({
    id: 'perunov_kamen',
    name: 'Perunov kamen',
    rarity: 'cesta',
    sprite: 'stone',
    text: 'Na početku svake borbe stekni 1 Snagu.',
    flavor: 'Pao je s neba kad je grom udario hrast.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => api.applyStatus(state.player, 'player', 'strength', 1),
  }),
  R({
    id: 'mokosin_vez',
    name: 'Mokošin vez',
    rarity: 'cesta',
    sprite: 'cloth',
    text: 'Na početku svake borbe stekni 6 štita.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => api.gainBlock(state.player, 'player', 6),
  }),
  R({
    id: 'amajlija',
    name: 'Amajlija',
    rarity: 'cesta',
    sprite: 'amulet',
    text: 'Na početku svake borbe stekni 1 Spretnost.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => api.applyStatus(state.player, 'player', 'dexterity', 1),
  }),
  R({
    id: 'crni_petao',
    name: 'Crni pijetao',
    rarity: 'cesta',
    sprite: 'rooster',
    text: 'Na početku svake borbe daj svim neprijateljima 1 Ranjivost.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => {
      for (const e of state.enemies)
        if (e.hp > 0) api.applyStatus(e, state.enemies.indexOf(e), 'vulnerable', 1);
    },
  }),
  R({
    id: 'runski_kamen',
    name: 'Runski kamen',
    rarity: 'cesta',
    sprite: 'rune',
    text: 'Na početku svake borbe daj svim neprijateljima 1 Nemoć.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => {
      for (const e of state.enemies)
        if (e.hp > 0) api.applyStatus(e, state.enemies.indexOf(e), 'weak', 1);
    },
  }),

  // ---- uncommon ----
  R({
    id: 'crna_kokos',
    name: 'Crna kokoš',
    rarity: 'neobicna',
    sprite: 'hen',
    text: 'Na početku poteza, ako nemaš štita, stekni 3 štita.',
    hook: 'turnStart',
    onTrigger: ({ api, state }) => {
      if (state.player.block <= 0) api.gainBlock(state.player, 'player', 3);
    },
  }),
  R({
    id: 'kovacev_nakovanj',
    name: 'Kovačev nakovanj',
    rarity: 'neobicna',
    sprite: 'anvil',
    text: 'Kad odigraš Vještinu, stekni 2 štita.',
    hook: 'onPlayCard',
    onTrigger: ({ api, state, data }) => {
      if (data && (data as { type?: string }).type === 'vjestina')
        api.gainBlock(state.player, 'player', 2);
    },
  }),
  R({
    id: 'trnov_vijenac',
    name: 'Trnov vijenac',
    rarity: 'neobicna',
    sprite: 'thorn',
    text: 'Na početku svake borbe stekni 3 Trnja.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => api.applyStatus(state.player, 'player', 'thorns', 3),
  }),
  R({
    id: 'divlje_srce',
    name: 'Divlje srce',
    rarity: 'neobicna',
    sprite: 'wildheart',
    text: 'Na početku svake borbe stekni 2 Bijesa.',
    flavor: 'Kuca brže kad osjeti krv.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => api.applyStatus(state.player, 'player', 'bjes', 2),
  }),
  R({
    id: 'zlatni_zub',
    name: 'Zlatni zub',
    rarity: 'neobicna',
    sprite: 'goldtooth',
    text: 'Dobijaš 25% više zlata.',
    hook: 'passive',
  }),
  R({
    id: 'putnikova_torba',
    name: 'Putnikova torba',
    rarity: 'neobicna',
    sprite: 'bag',
    text: 'Dobijaš +1 mjesto za napitke.',
    hook: 'passive',
  }),
  R({
    id: 'medvjeda_sapa',
    name: 'Medvjeđa šapa',
    rarity: 'neobicna',
    sprite: 'paw',
    text: 'Na početku svake borbe stekni 3 Snage, ali i 2 Nemoći.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => {
      api.applyStatus(state.player, 'player', 'strength', 3);
      api.applyStatus(state.player, 'player', 'weak', 2);
    },
  }),

  // ---- rare / boss ----
  R({
    id: 'velesov_rog',
    name: 'Velesov rog',
    rarity: 'rijetka',
    sprite: 'horn',
    text: 'Stekni +1 energije svakog poteza.',
    flavor: 'Iz njega teče med zaborava.',
    hook: 'combatStart',
    onTrigger: ({ state }) => {
      state.maxEnergy += 1;
      state.energy += 1;
    },
  }),
  R({
    id: 'svarogov_ugljen',
    name: 'Svarogov ugljen',
    rarity: 'rijetka',
    sprite: 'coal',
    text: 'Na početku svake borbe stekni 2 Snage.',
    flavor: 'Žar iz nebeske kovačnice.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => api.applyStatus(state.player, 'player', 'strength', 2),
  }),
  R({
    id: 'zmajev_zub',
    name: 'Zmajev zub',
    rarity: 'rijetka',
    sprite: 'fang',
    text: 'Na početku svake borbe stekni 1 Snagu i 1 Spretnost.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => {
      api.applyStatus(state.player, 'player', 'strength', 1);
      api.applyStatus(state.player, 'player', 'dexterity', 1);
    },
  }),
  R({
    id: 'zora_i_sumrak',
    name: 'Zora i sumrak',
    rarity: 'rijetka',
    sprite: 'sun',
    text: 'Na početku borbe izvuci 2 dodatne karte. Prvog poteza imaš -1 energije.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => {
      api.draw(2);
      state.energy = Math.max(0, state.energy - 1);
    },
  }),
  R({
    id: 'mrtvacka_para',
    name: 'Mrtvačka para',
    rarity: 'rijetka',
    sprite: 'skull',
    text: 'Na početku svake borbe daj svim neprijateljima 3 Otrova.',
    hook: 'combatStart',
    onTrigger: ({ api, state }) => {
      for (const e of state.enemies)
        if (e.hp > 0) api.applyStatus(e, state.enemies.indexOf(e), 'poison', 3);
    },
  }),
  R({
    id: 'zlatna_jabuka',
    name: 'Zlatna jabuka',
    rarity: 'rijetka',
    sprite: 'apple',
    text: 'Maksimalno zdravlje +15.',
    flavor: 'Podmlađuje onoga ko je okusi.',
    hook: 'passive',
  }),
];
