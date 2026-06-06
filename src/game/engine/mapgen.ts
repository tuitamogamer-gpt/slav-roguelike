import type { GameMap, MapNode, NodeKind, World } from '../types';

const LANES = 7;
const FLOORS = 15; // floors 0..14, then boss

const COL_W = 150;
const ROW_H = 92;
const X0 = 90;
const Y0 = 70;

function nid(f: number, l: number) {
  return `n_${f}_${l}`;
}

function weightedKind(floor: number, rng: () => number): NodeKind {
  const opts: { k: NodeKind; w: number }[] = [
    { k: 'borba', w: 45 },
    { k: 'dogadjaj', w: 22 },
    { k: 'trgovac', w: 6 },
  ];
  if (floor >= 5) opts.push({ k: 'elita', w: 16 });
  if (floor >= 6) opts.push({ k: 'odmor', w: 12 });
  const total = opts.reduce((s, o) => s + o.w, 0);
  let r = rng() * total;
  for (const o of opts) {
    r -= o.w;
    if (r <= 0) return o.k;
  }
  return 'borba';
}

export function generateMap(rng: () => number, world: World, act: number): GameMap {
  const present = new Set<string>();
  const edges = new Map<string, Set<string>>();
  const addEdge = (a: string, b: string) => {
    if (!edges.has(a)) edges.set(a, new Set());
    edges.get(a)!.add(b);
  };

  // build 6 random-walk paths
  const startLanes = new Set<number>();
  const NUM_PATHS = 6;
  for (let p = 0; p < NUM_PATHS; p++) {
    let lane = Math.floor(rng() * LANES);
    // ensure first two paths start distinct for variety
    if (p === 1 && startLanes.has(lane)) lane = (lane + 2) % LANES;
    startLanes.add(lane);
    present.add(nid(0, lane));
    for (let f = 0; f < FLOORS - 1; f++) {
      let delta = Math.floor(rng() * 3) - 1; // -1, 0, 1
      let next = Math.max(0, Math.min(LANES - 1, lane + delta));
      present.add(nid(f + 1, next));
      addEdge(nid(f, lane), nid(f + 1, next));
      lane = next;
      void delta;
    }
  }

  // assign kinds
  const nodes: Record<string, MapNode> = {};
  const columns: string[][] = Array.from({ length: FLOORS + 1 }, () => []);
  const midTreasure = 8;

  for (let f = 0; f < FLOORS; f++) {
    for (let l = 0; l < LANES; l++) {
      const id = nid(f, l);
      if (!present.has(id)) continue;
      let kind: NodeKind;
      if (f === 0) kind = 'borba';
      else if (f === midTreasure) kind = 'blago';
      else if (f === FLOORS - 1) kind = 'odmor';
      else kind = weightedKind(f, rng);
      const node: MapNode = {
        id,
        kind,
        x: f,
        y: l,
        px: X0 + f * COL_W,
        py: Y0 + l * ROW_H + (f % 2) * 14,
        next: [],
        world,
        visited: false,
        available: f === 0,
      };
      nodes[id] = node;
      columns[f].push(id);
    }
  }

  // wire edges
  for (const [a, set] of edges) {
    if (!nodes[a]) continue;
    for (const b of set) if (nodes[b]) nodes[a].next.push(b);
  }

  // boss node
  const bossId = `boss_${act}`;
  const lastFloorIds = columns[FLOORS - 1];
  const avgLane =
    lastFloorIds.reduce((s, id) => s + nodes[id].y, 0) / Math.max(1, lastFloorIds.length);
  nodes[bossId] = {
    id: bossId,
    kind: 'gazda',
    x: FLOORS,
    y: avgLane,
    px: X0 + FLOORS * COL_W,
    py: Y0 + avgLane * ROW_H + 14,
    next: [],
    world,
    visited: false,
    available: false,
  };
  columns[FLOORS].push(bossId);
  for (const id of lastFloorIds) nodes[id].next.push(bossId);

  const startIds = columns[0].slice();

  return {
    world,
    act,
    nodes,
    columns,
    startIds,
    bossId,
    currentNodeId: null,
  };
}

// reachable next nodes from current position
export function availableNext(map: GameMap): string[] {
  if (!map.currentNodeId) return map.startIds;
  const cur = map.nodes[map.currentNodeId];
  return cur ? cur.next : [];
}
