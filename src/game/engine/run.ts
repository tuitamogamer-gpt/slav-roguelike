import type { CharClass, RunState, CardInstance } from '../types';
import { STARTER_DECKS } from '../content/cards';
import { generateMap } from './mapgen';
import { makeRng } from './rng';
import { makeInstance } from './combat';

export const BASE_STATS: Record<CharClass, { hp: number }> = {
  vukodlak: { hp: 75 },
  vjestica: { hp: 70 },
};

export function buildStarterDeck(cls: CharClass): CardInstance[] {
  const deck: CardInstance[] = [];
  for (const entry of STARTER_DECKS[cls]) {
    for (let i = 0; i < entry.count; i++) deck.push(makeInstance(entry.id, false));
  }
  return deck;
}

export function createRun(cls: CharClass, seed: string, ascension = 0): RunState {
  const hp = BASE_STATS[cls].hp - (ascension >= 1 ? 5 : 0);
  const rng = makeRng(seed + ':map1');
  const map = generateMap(rng, 'jav', 1);
  return {
    cls,
    seed,
    hp,
    maxHp: hp,
    gold: 99,
    deck: buildStarterDeck(cls),
    relics: [],
    potions: [null, null, null],
    potionSlots: 3,
    map,
    act: 1,
    floorsCleared: 0,
    ascension,
  };
}
