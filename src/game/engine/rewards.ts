import type { CharClass, CardDef, RunState, CardRarity } from '../types';
import { allCards, allRelics, allPotions } from '../content/registry';
import { pick, weightedPick } from './rng';

// pool of obtainable cards for a class (no basics, status, curse)
export function cardPool(cls: CharClass): CardDef[] {
  return allCards().filter(
    (c) =>
      (c.cls === cls || c.cls === 'neutral') &&
      c.rarity !== 'osnovna' &&
      c.rarity !== 'posebna' &&
      c.type !== 'stanje' &&
      c.type !== 'kletva',
  );
}

const RARITY_WEIGHTS: Record<string, { cesta: number; neobicna: number; rijetka: number }> = {
  normal: { cesta: 60, neobicna: 33, rijetka: 7 },
  elite: { cesta: 45, neobicna: 40, rijetka: 15 },
  boss: { cesta: 0, neobicna: 60, rijetka: 40 },
};

export function rollCardRewards(
  cls: CharClass,
  rng: () => number,
  kind: 'normal' | 'elite' | 'boss' = 'normal',
  count = 3,
): string[] {
  const pool = cardPool(cls);
  const weights = RARITY_WEIGHTS[kind];
  const out: string[] = [];
  let guard = 0;
  while (out.length < count && guard++ < 200) {
    const rarity = weightedPick<CardRarity>(
      [
        { item: 'cesta', weight: weights.cesta },
        { item: 'neobicna', weight: weights.neobicna },
        { item: 'rijetka', weight: weights.rijetka },
      ],
      rng,
    );
    const candidates = pool.filter((c) => c.rarity === rarity && !out.includes(c.id));
    if (candidates.length === 0) continue;
    out.push(pick(candidates, rng).id);
  }
  return out;
}

export function randomCardOfRarity(
  cls: CharClass,
  rarity: 'cesta' | 'neobicna' | 'rijetka',
  rng: () => number,
): string | null {
  const candidates = cardPool(cls).filter((c) => c.rarity === rarity);
  if (!candidates.length) return null;
  return pick(candidates, rng).id;
}

export function rollRelic(run: RunState, rng: () => number, tier?: CardRarity): string | null {
  let pool = allRelics().filter((r) => !run.relics.includes(r.id));
  if (tier) pool = pool.filter((r) => r.rarity === tier);
  if (pool.length === 0) {
    pool = allRelics().filter((r) => !run.relics.includes(r.id));
    if (pool.length === 0) return null;
  }
  // weight by rarity
  const w = (r: { rarity: CardRarity }) =>
    r.rarity === 'cesta' ? 50 : r.rarity === 'neobicna' ? 35 : 15;
  return weightedPick(
    pool.map((r) => ({ item: r.id, weight: w(r) })),
    rng,
  );
}

export function rollPotion(rng: () => number): string {
  const pool = allPotions();
  return weightedPick(
    pool.map((p) => ({ item: p.id, weight: p.rarity === 'cesta' ? 50 : 30 })),
    rng,
  );
}

// ---- shop ----
export interface ShopEntry<T extends string = string> {
  id: T;
  price: number;
  sold?: boolean;
}
export interface ShopState {
  cards: ShopEntry[];
  relics: ShopEntry[];
  potions: ShopEntry[];
  removeCost: number;
  removeUsed: boolean;
}

export function generateShop(cls: CharClass, run: RunState, rng: () => number): ShopState {
  const pool = cardPool(cls);
  const chosen: string[] = [];
  let guard = 0;
  while (chosen.length < 5 && guard++ < 100) {
    const c = pick(pool, rng);
    if (!chosen.includes(c.id)) chosen.push(c.id);
  }
  const cardPrice = (id: string) => {
    const def = pool.find((c) => c.id === id)!;
    const base =
      def.rarity === 'rijetka' ? 145 : def.rarity === 'neobicna' ? 80 : 50;
    return Math.round((base + (rng() * 20 - 10)) / 5) * 5;
  };
  const cards = chosen.map((id) => ({ id, price: cardPrice(id) }));

  const relicIds: string[] = [];
  for (let i = 0; i < 3; i++) {
    const r = rollRelic({ ...run, relics: [...run.relics, ...relicIds] }, rng);
    if (r) relicIds.push(r);
  }
  const relics = relicIds.map((id) => {
    const def = allRelics().find((r) => r.id === id)!;
    const base = def.rarity === 'rijetka' ? 250 : def.rarity === 'neobicna' ? 180 : 130;
    return { id, price: Math.round((base + (rng() * 40 - 20)) / 5) * 5 };
  });

  const potions = [rollPotion(rng), rollPotion(rng)].map((id) => ({
    id,
    price: Math.round((55 + (rng() * 20 - 10)) / 5) * 5,
  }));

  return { cards, relics, potions, removeCost: 75, removeUsed: false };
}
