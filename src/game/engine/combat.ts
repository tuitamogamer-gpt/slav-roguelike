// ============================================================
// Combat engine — pure data mutations on CombatState.
// The store clones state before invoking these; engine mutates in place.
// ============================================================

import type {
  CombatState,
  CombatApi,
  Combatant,
  EnemyState,
  RunState,
  CardInstance,
  Status,
  FxEvent,
  CardAction,
} from '../types';
import { getCard, getEnemy, getRelic } from '../content/registry';
import { shuffle, mulberry32 } from './rng';

export const BASE_ENERGY = 3;
export const HAND_SIZE = 5;

// ---------- helpers ----------
function st(c: Combatant, s: Status): number {
  return c.statuses[s] ?? 0;
}
function setSt(c: Combatant, s: Status, v: number) {
  if (v <= 0) delete c.statuses[s];
  else c.statuses[s] = v;
}
function addSt(c: Combatant, s: Status, v: number) {
  setSt(c, s, st(c, s) + v);
}

// ---------- RNG bound to combat ----------
function combatRng(state: CombatState): () => number {
  const fn = mulberry32(state.seedRng);
  return () => {
    const v = fn();
    state.seedRng = (state.seedRng + 0x9e3779b9) >>> 0;
    return v;
  };
}

// ---------- API factory ----------
export function makeApi(state: CombatState, _run: RunState): CombatApi {
  const rng = combatRng(state);

  const enemyIndex = (e: EnemyState) => state.enemies.indexOf(e);

  const pushFx = (e: Omit<FxEvent, 'id'>) => {
    state.fx.push({ ...e, id: state.fxSeq++ });
    if (state.fx.length > 60) state.fx.splice(0, state.fx.length - 60);
  };

  const computeAttack = (base: number): number => {
    let dmg = base + (state.player.statuses.strength ?? 0);
    if ((state.player.statuses.weak ?? 0) > 0) dmg = Math.floor(dmg * 0.75);
    return Math.max(0, dmg);
  };
  const resolveTarget = (ti: number | null): EnemyState | null => {
    if (ti !== null && state.enemies[ti] && state.enemies[ti].hp > 0) return state.enemies[ti];
    return state.enemies.find((e) => e.hp > 0) ?? null;
  };

  const api: CombatApi = {
    enemyIndex,
    bjes: () => state.player.statuses.bjes ?? 0,
    attack(base, targetIndex, hits = 1) {
      const tgt = resolveTarget(targetIndex);
      if (!tgt) return;
      for (let h = 0; h < hits; h++) {
        if (tgt.hp <= 0) break;
        api.dealDamage('player', tgt, state.enemies.indexOf(tgt), computeAttack(base), {
          fromCard: true,
        });
      }
    },
    attackAll(base, hits = 1) {
      for (let h = 0; h < hits; h++) {
        for (const e of state.enemies) {
          if (e.hp <= 0) continue;
          api.dealDamage('player', e, state.enemies.indexOf(e), computeAttack(base), {
            fromCard: true,
          });
        }
      }
    },
    livingEnemies: () => state.enemies.filter((e) => e.hp > 0),
    log: (s: string) => {
      state.log.push(s);
      if (state.log.length > 40) state.log.shift();
    },
    fx: pushFx,

    dealDamage(source, target, targetRef, amount, opts = {}) {
      if (target.hp <= 0) return 0;
      let dmg = amount;
      // strength on attacker (only true attacks include source statuses)
      if (source !== 'player' && !opts.fromCard) {
        dmg += st(source, 'strength');
        if (st(source, 'weak') > 0) dmg = Math.floor(dmg * 0.75);
      }
      // (player attack strength/weak handled by card layer before calling with fromCard)
      // vulnerable on defender
      if (st(target, 'vulnerable') > 0) dmg = Math.floor(dmg * 1.5);
      if (st(target, 'intangible') > 0) dmg = Math.min(dmg, 1);
      dmg = Math.max(0, dmg);

      // block absorption
      let toHp = dmg;
      if (target.block > 0 && !opts.ignoreBlock) {
        const absorbed = Math.min(target.block, toHp);
        target.block -= absorbed;
        toHp -= absorbed;
        if (absorbed > 0) pushFx({ kind: 'block', target: targetRef, amount: absorbed });
      }
      if (toHp > 0) {
        target.hp = Math.max(0, target.hp - toHp);
        // plated armor decays when taking unblocked attack damage
        if (st(target, 'metal') > 0) addSt(target, 'metal', -1);
        pushFx({
          kind: 'hit',
          target: targetRef,
          amount: toHp,
          color: 'damage',
          intensity: toHp >= 12 ? 'heavy' : 'light',
        });
      } else if (dmg === 0) {
        pushFx({ kind: 'hit', target: targetRef, amount: 0, color: 'damage', intensity: 'light' });
      }

      // thorns: the defender's thorns reflect onto whoever attacked
      if (st(target, 'thorns') > 0) {
        const thorn = st(target, 'thorns');
        if (source === 'player') {
          // enemy has thorns, player attacked → player takes thorns
          state.player.hp = Math.max(0, state.player.hp - thorn);
          pushFx({ kind: 'hit', target: 'player', amount: thorn, color: 'damage' });
        } else {
          // player attacked? handled above. enemy-as-source w/ player thorns:
          source.hp = Math.max(0, source.hp - thorn);
          pushFx({ kind: 'hit', target: enemyIndex(source), amount: thorn, color: 'damage' });
        }
      }

      if (target.hp <= 0) {
        pushFx({ kind: 'death', target: targetRef });
      }
      return toHp;
    },

    gainBlock(target, ref, amount) {
      let b = amount;
      if (target.isPlayer) {
        b += st(target, 'dexterity');
        if (st(target, 'frail') > 0) b = Math.floor(b * 0.75);
      }
      b = Math.max(0, b);
      target.block += b;
      if (b > 0) pushFx({ kind: 'block', target: ref, amount: b });
    },

    applyStatus(target, ref, status, amount) {
      addSt(target, status, amount);
      const negative =
        status === 'vulnerable' ||
        status === 'weak' ||
        status === 'frail' ||
        status === 'poison' ||
        status === 'kletva' ||
        status === 'okovi';
      pushFx({
        kind: status === 'poison' ? 'poison' : negative ? 'status' : 'buff',
        target: ref,
        amount,
        text: statusLabel(status),
      });
    },

    heal(target, ref, amount) {
      const before = target.hp;
      target.hp = Math.min(target.maxHp, target.hp + amount);
      const healed = target.hp - before;
      if (healed > 0) pushFx({ kind: 'heal', target: ref, amount: healed });
    },

    loseHp(target, ref, amount) {
      let a = amount;
      if (st(target, 'intangible') > 0) a = Math.min(a, 1);
      target.hp = Math.max(0, target.hp - a);
      pushFx({ kind: 'hit', target: ref, amount: a, color: 'damage', intensity: 'light' });
      if (target.hp <= 0) pushFx({ kind: 'death', target: ref });
    },

    draw(n) {
      for (let i = 0; i < n; i++) drawOne(state);
    },
    gainEnergy(n) {
      state.energy += n;
    },
    addCardToHand(cardId, n = 1) {
      for (let i = 0; i < n; i++) {
        if (state.hand.length >= 10) break;
        state.hand.push(makeInstance(cardId, false));
      }
    },
  };

  return Object.assign(api, { _rng: rng });
}

export function statusLabel(s: Status): string {
  const map: Record<Status, string> = {
    vulnerable: 'Ranjiv',
    weak: 'Nemoć',
    frail: 'Krhkost',
    strength: 'Snaga',
    dexterity: 'Spretnost',
    bjes: 'Bijes',
    poison: 'Otrov',
    regen: 'Obnova',
    thorns: 'Trnje',
    intangible: 'Sjenovit',
    metal: 'Oklop',
    ritual: 'Obred',
    kletva: 'Kletva',
    okovi: 'Okovi',
    echo: 'Odjek',
  };
  return map[s];
}

// ---------- card instance ----------
let instSeq = 0;
export function makeInstance(cardId: string, upgraded: boolean): CardInstance {
  instSeq += 1;
  return { uid: `i${instSeq}_${Math.floor(Math.random() * 1e6).toString(36)}`, id: cardId, upgraded };
}

export function cardCost(inst: CardInstance): number {
  if (inst.costOverride !== undefined) return inst.costOverride;
  return getCard(inst.id).cost;
}

// ---------- piles ----------
function drawOne(state: CombatState) {
  if (state.hand.length >= 10) return;
  if (state.drawPile.length === 0) {
    if (state.discardPile.length === 0) return;
    const rng = mulberry32(state.seedRng);
    state.seedRng = (state.seedRng + 0x12345) >>> 0;
    state.drawPile = shuffle(state.discardPile, rng);
    state.discardPile = [];
  }
  const card = state.drawPile.shift();
  if (card) state.hand.push(card);
}

// ---------- difficulty scaling ----------
// Enemies grow stronger the deeper you go: more HP, bonus Strength,
// and from floor 4 a chance of an affix (named modifier with a status).
const AFFIXES: { prefix: string; status: Status; amount: number }[] = [
  { prefix: 'Bijesni', status: 'strength', amount: 2 },
  { prefix: 'Okovani', status: 'metal', amount: 4 },
  { prefix: 'Trnoviti', status: 'thorns', amount: 3 },
  { prefix: 'Prokleti', status: 'ritual', amount: 1 },
];

function scaleEnemy(
  e: EnemyState,
  floors: number,
  isElite: boolean,
  isBoss: boolean,
  rng: () => number,
) {
  // bosses scale at half rate — their base is already a wall
  const hpMult = 1 + (isBoss ? 0.025 : 0.05) * floors;
  e.maxHp = Math.round(e.maxHp * hpMult);
  e.hp = e.maxHp;

  const bonusStr = Math.floor(floors / 5) + (isElite ? 1 : 0);
  if (bonusStr > 0) e.statuses.strength = (e.statuses.strength ?? 0) + bonusStr;

  // affix roll — never on bosses (they have their own drama)
  if (!isBoss && floors >= 5 && rng() < 0.3) {
    const affix = AFFIXES[Math.floor(rng() * AFFIXES.length)];
    e.name = `${affix.prefix} ${e.name.toLowerCase()}`;
    e.statuses[affix.status] = (e.statuses[affix.status] ?? 0) + affix.amount;
  }
}

// ---------- combat setup ----------
export function buildCombat(
  run: RunState,
  enemyIds: string[],
  opts: { isElite?: boolean; isBoss?: boolean; encounterId: string },
): CombatState {
  const player: Combatant = {
    id: 'player',
    name: run.cls === 'vukodlak' ? 'Vukodlak' : 'Vještica',
    hp: run.hp,
    maxHp: run.maxHp,
    block: 0,
    statuses: {},
    isPlayer: true,
  };

  const baseSeed = (Math.floor(Math.random() * 0xffffffff) ^ run.floorsCleared * 2654435761) >>> 0;

  const enemies: EnemyState[] = enemyIds.map((eid, i) => {
    const def = getEnemy(eid);
    const rng = mulberry32((baseSeed + i * 7919) >>> 0);
    const hp = def.hpRange[0] + Math.floor(rng() * (def.hpRange[1] - def.hpRange[0] + 1));
    const e: EnemyState = {
      id: `enemy_${i}`,
      defId: eid,
      name: def.name,
      hp,
      maxHp: hp,
      block: 0,
      statuses: {},
      isPlayer: false,
      spriteKey: def.sprite,
      scale: def.scale ?? 1,
      intent: null,
      nextMoveId: null,
      history: [],
      turnCount: 0,
      data: {},
    };
    if (def.onSpawn) def.onSpawn(e);
    scaleEnemy(e, run.floorsCleared, !!opts.isElite, !!opts.isBoss, rng);
    return e;
  });

  const drawPile = shuffle(
    run.deck.map((c) => ({ ...c })),
    mulberry32(baseSeed),
  );

  const state: CombatState = {
    player,
    enemies,
    energy: BASE_ENERGY,
    maxEnergy: BASE_ENERGY,
    hand: [],
    drawPile,
    discardPile: [],
    exhaustPile: [],
    turn: 0,
    phase: 'intro',
    cardsPlayedThisTurn: 0,
    attacksThisTurn: 0,
    fx: [],
    fxSeq: 1,
    log: [],
    encounterId: opts.encounterId,
    isElite: !!opts.isElite,
    isBoss: !!opts.isBoss,
    rewardClaimed: false,
    firstCardPlayed: false,
    seedRng: baseSeed,
  };

  // innate cards to opening pile front
  const innate = drawPile.filter((c) => getCard(c.id).innate);
  if (innate.length) {
    state.drawPile = [...innate, ...drawPile.filter((c) => !getCard(c.id).innate)];
  }

  refreshIntents(state, run);
  startPlayerTurn(state, run, true);

  // relic combat-start hooks (after first turn setup so block/energy survive)
  const api = makeApi(state, run);
  for (const rid of run.relics) {
    const relic = getRelic(rid);
    if (relic?.hook === 'combatStart' && relic.onTrigger) {
      relic.onTrigger({ state, run, api });
    }
  }
  return state;
}

// ---------- intents ----------
export function refreshIntents(state: CombatState, _run: RunState) {
  for (const e of state.enemies) {
    if (e.hp <= 0) {
      e.intent = null;
      continue;
    }
    const def = getEnemy(e.defId);
    const rng = mulberry32((state.seedRng ^ (e.turnCount * 2246822519)) >>> 0);
    const roll = (n: number) => Math.floor(rng() * n);
    const move = def.ai({ state, self: e, selfIndex: state.enemies.indexOf(e), rng, roll });
    e.nextMoveId = move.id;
    e.intent = move.intent;
  }
}

// ---------- turn flow ----------
export function startPlayerTurn(state: CombatState, run: RunState, first = false) {
  state.turn += 1;
  state.phase = 'player';
  state.cardsPlayedThisTurn = 0;
  state.attacksThisTurn = 0;
  state.firstCardPlayed = false;

  const api = makeApi(state, run);

  // player block reset
  state.player.block = 0;

  // poison tick on player
  tickPoison(state.player, 'player', api);
  if (state.player.hp <= 0) {
    state.phase = 'lost';
    return;
  }

  state.energy = state.maxEnergy;

  // player powers that fire at turn start
  const ritual = state.player.statuses.ritual ?? 0;
  if (ritual > 0) api.applyStatus(state.player, 'player', 'strength', ritual);
  // witch hex aura: poison all enemies each turn
  const hex = state.player.statuses.kletva ?? 0;
  if (hex > 0)
    for (const e of state.enemies)
      if (e.hp > 0) api.applyStatus(e, state.enemies.indexOf(e), 'poison', hex);

  // relic turnStart
  for (const rid of run.relics) {
    const relic = getRelic(rid);
    if (relic?.hook === 'turnStart' && relic.onTrigger) relic.onTrigger({ state, run, api });
  }

  api.draw(HAND_SIZE);
  void first;
}

function tickPoison(c: Combatant, ref: 'player' | number, api: CombatApi) {
  const p = c.statuses.poison ?? 0;
  if (p > 0) {
    api.loseHp(c, ref, p);
    c.statuses.poison = p - 1;
    if (c.statuses.poison <= 0) delete c.statuses.poison;
  }
}

function decrementDebuffs(c: Combatant) {
  for (const key of ['vulnerable', 'weak', 'frail'] as Status[]) {
    if (c.statuses[key]) {
      c.statuses[key]! -= 1;
      if (c.statuses[key]! <= 0) delete c.statuses[key];
    }
  }
}

export function endPlayerTurn(state: CombatState, run: RunState) {
  if (state.phase !== 'player') return;
  const api = makeApi(state, run);

  // burn cards in hand deal damage at end of turn
  for (const c of state.hand) {
    if (c.id === 'opekotina') api.loseHp(state.player, 'player', c.upgraded ? 4 : 2);
  }

  // ethereal cards exhaust; rest discard (retain stays)
  const retained: CardInstance[] = [];
  for (const c of state.hand) {
    const def = getCard(c.id);
    if (def.ethereal) {
      state.exhaustPile.push(c);
    } else if (def.retain) {
      retained.push(c);
    } else {
      state.discardPile.push(c);
    }
  }
  state.hand = retained;

  // player regen
  const reg = state.player.statuses.regen ?? 0;
  if (reg > 0) api.heal(state.player, 'player', reg);

  // player metal → block
  const metal = state.player.statuses.metal ?? 0;
  if (metal > 0) api.gainBlock(state.player, 'player', metal);

  decrementDebuffs(state.player);

  // relic turnEnd
  for (const rid of run.relics) {
    const relic = getRelic(rid);
    if (relic?.hook === 'turnEnd' && relic.onTrigger) relic.onTrigger({ state, run, api });
  }

  state.phase = 'enemy';
}

// Perform a single enemy's turn (driven step-by-step by the store for pacing).
export function enemyStep(state: CombatState, run: RunState, i: number) {
  const e = state.enemies[i];
  if (!e || e.hp <= 0) return;
  const api = makeApi(state, run);
  e.block = 0;
  e.turnCount += 1;

  tickPoison(e, i, api);
  if (e.hp <= 0) return;

  // okovi (stun): skip turn, consume
  if ((e.statuses.okovi ?? 0) > 0) {
    e.statuses.okovi! -= 1;
    if (e.statuses.okovi! <= 0) delete e.statuses.okovi;
    return;
  }

  if ((e.statuses.ritual ?? 0) > 0) addSt(e, 'strength', e.statuses.ritual!);

  const moveId = e.nextMoveId;
  if (moveId) {
    performEnemyMoveById(state, run, e, i, moveId, api);
    e.history.push(moveId);
    if (e.history.length > 6) e.history.shift();
  }

  decrementDebuffs(e);

  if (state.player.hp <= 0) state.phase = 'lost';
}

// After all enemies acted: pick next intents and begin the player's turn.
export function finishEnemyTurn(state: CombatState, run: RunState) {
  if (state.phase === 'lost') return;
  refreshIntents(state, run);
  startPlayerTurn(state, run);
}

// Synchronous full enemy turn (used by tests / fallback).
export function runEnemyTurn(state: CombatState, run: RunState) {
  for (let i = 0; i < state.enemies.length; i++) {
    enemyStep(state, run, i);
    if (state.phase === 'lost') return;
  }
  finishEnemyTurn(state, run);
}

// resolve the move object for a given id by asking the AI repeatedly is unreliable;
// instead enemy defs expose moves via a side table.
import { getEnemyMove } from '../content/registry';
function performEnemyMoveById(
  state: CombatState,
  run: RunState,
  e: EnemyState,
  idx: number,
  moveId: string,
  api: CombatApi,
) {
  const move = getEnemyMove(e.defId, moveId);
  if (move) {
    move.perform({ state, run, self: e, selfIndex: idx, api });
  }
}

// ---------- play card ----------
export function playCard(
  state: CombatState,
  run: RunState,
  uid: string,
  targetIndex: number | null,
): boolean {
  if (state.phase !== 'player') return false;
  const idx = state.hand.findIndex((c) => c.uid === uid);
  if (idx < 0) return false;
  const inst = state.hand[idx];
  const def = getCard(inst.id);
  const cost = cardCost(inst);
  if (cost === -2) return false; // unplayable
  const realCost = cost < 0 ? state.energy : cost; // X cost spends all
  if (state.energy < realCost) return false;

  state.hand.splice(idx, 1);
  state.energy -= realCost;

  const api = makeApi(state, run);
  const echoBefore = state.player.statuses.echo ?? 0;
  resolveCardEffects(state, run, inst, def, targetIndex, api, realCost);

  // echo: replay this card if echo was active before it was played
  if (echoBefore > 0 && def.type !== 'moc') {
    state.player.statuses.echo = echoBefore - 1;
    if (state.player.statuses.echo! <= 0) delete state.player.statuses.echo;
    resolveCardEffects(state, run, inst, def, targetIndex, api, realCost);
  }
  state.firstCardPlayed = true;
  state.cardsPlayedThisTurn += 1;
  if (def.type === 'napad') state.attacksThisTurn += 1;

  // relic onPlayCard / onAttack
  for (const rid of run.relics) {
    const relic = getRelic(rid);
    if (relic?.hook === 'onPlayCard' && relic.onTrigger)
      relic.onTrigger({ state, run, api, data: { cardId: inst.id, type: def.type } });
    if (relic?.hook === 'onAttack' && def.type === 'napad' && relic.onTrigger)
      relic.onTrigger({ state, run, api, data: { cardId: inst.id } });
  }

  // discard / exhaust
  if (def.exhaust) state.exhaustPile.push(inst);
  else state.discardPile.push(inst);

  checkDeaths(state);
  if (state.enemies.every((e) => e.hp <= 0)) {
    state.phase = 'won';
  }
  return true;
}

function checkDeaths(state: CombatState) {
  for (const e of state.enemies) {
    if (e.hp <= 0) {
      e.intent = null;
      e.statuses = {};
      e.block = 0;
    }
  }
}

function resolveCardEffects(
  state: CombatState,
  run: RunState,
  inst: CardInstance,
  def: ReturnType<typeof getCard>,
  targetIndex: number | null,
  api: CombatApi,
  _cost: number,
) {
  const upgraded = inst.upgraded;
  const actions = (upgraded && def.upgradedActions) || def.actions;
  const player = state.player;

  const targetEnemy = (): EnemyState | null => {
    if (targetIndex !== null && state.enemies[targetIndex] && state.enemies[targetIndex].hp > 0)
      return state.enemies[targetIndex];
    const living = state.enemies.filter((e) => e.hp > 0);
    return living[0] ?? null;
  };

  for (const a of actions as CardAction[]) {
    switch (a.kind) {
      case 'damage':
        api.attack(a.amount, targetIndex, a.hits ?? 1);
        break;
      case 'damageAll':
        api.attackAll(a.amount, a.hits ?? 1);
        break;
      case 'block':
        api.gainBlock(player, 'player', a.amount);
        break;
      case 'status': {
        const tgt = targetEnemy();
        if (tgt) api.applyStatus(tgt, state.enemies.indexOf(tgt), a.status, a.amount);
        break;
      }
      case 'statusAll':
        for (const e of state.enemies)
          if (e.hp > 0) api.applyStatus(e, state.enemies.indexOf(e), a.status, a.amount);
        break;
      case 'selfStatus':
        api.applyStatus(player, 'player', a.status, a.amount);
        break;
      case 'draw':
        api.draw(a.amount);
        break;
      case 'energy':
        api.gainEnergy(a.amount);
        break;
      case 'heal':
        api.heal(player, 'player', a.amount);
        break;
      case 'loseHp':
        api.loseHp(player, 'player', a.amount);
        break;
      case 'gainBjes':
        api.applyStatus(player, 'player', 'bjes', a.amount);
        break;
      case 'addCard':
        api.addCardToHand(a.cardId, a.amount ?? 1);
        break;
      case 'exhaustHand': {
        const h = [...state.hand];
        state.hand = [];
        for (const c of h) state.exhaustPile.push(c);
        break;
      }
    }
  }

  // unique hook
  if (def.onPlay) {
    def.onPlay({ state, run, card: inst, upgraded, targetIndex, energySpent: _cost, api });
  }
}

// expose for potions used in combat
export { makeApi as makeCombatApi };
