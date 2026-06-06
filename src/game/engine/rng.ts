// Mulberry32 — small, fast, seedable PRNG. Deterministic per seed.

export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed: string | number): () => number {
  const s = typeof seed === 'string' ? hashSeed(seed) : seed >>> 0;
  return mulberry32(s);
}

export function randomSeed(): string {
  const words = [
    'veles',
    'perun',
    'mokos',
    'svarog',
    'dazbog',
    'morana',
    'vid',
    'triglav',
    'crnobog',
    'zora',
    'navi',
    'jarilo',
  ];
  let out = '';
  for (let i = 0; i < 3; i++) {
    out += words[Math.floor(Math.random() * words.length)] + '-';
  }
  return out + Math.floor(Math.random() * 9000 + 1000);
}

export function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// weighted pick: items with weights
export function weightedPick<T>(items: { item: T; weight: number }[], rng: () => number): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it.item;
  }
  return items[items.length - 1].item;
}

let uidCounter = 0;
export function uid(prefix = 'c'): string {
  uidCounter += 1;
  return `${prefix}${uidCounter}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}
