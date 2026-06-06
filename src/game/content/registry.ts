import type { CardDef, EnemyDef, RelicDef, PotionDef, EnemyMove } from '../types';
import { CARDS } from './cards';
import { ENEMIES } from './enemies';
import { RELICS } from './relics';
import { POTIONS } from './potions';

const cardMap = new Map<string, CardDef>(CARDS.map((c) => [c.id, c]));
const enemyMap = new Map<string, EnemyDef>(ENEMIES.map((e) => [e.id, e]));
const relicMap = new Map<string, RelicDef>(RELICS.map((r) => [r.id, r]));
const potionMap = new Map<string, PotionDef>(POTIONS.map((p) => [p.id, p]));
const enemyMoveMap = new Map<string, Map<string, EnemyMove>>();
for (const e of ENEMIES) {
  enemyMoveMap.set(e.id, new Map(e.moves.map((m) => [m.id, m])));
}

export function getCard(id: string): CardDef {
  const c = cardMap.get(id);
  if (!c) throw new Error(`Unknown card: ${id}`);
  return c;
}
export function getEnemy(id: string): EnemyDef {
  const e = enemyMap.get(id);
  if (!e) throw new Error(`Unknown enemy: ${id}`);
  return e;
}
export function getRelic(id: string): RelicDef | undefined {
  return relicMap.get(id);
}
export function getPotion(id: string): PotionDef | undefined {
  return potionMap.get(id);
}
export function getEnemyMove(defId: string, moveId: string): EnemyMove | undefined {
  return enemyMoveMap.get(defId)?.get(moveId);
}

export function allCards(): CardDef[] {
  return CARDS;
}
export function allRelics(): RelicDef[] {
  return RELICS;
}
export function allEnemies(): EnemyDef[] {
  return ENEMIES;
}
export function allPotions(): PotionDef[] {
  return POTIONS;
}
