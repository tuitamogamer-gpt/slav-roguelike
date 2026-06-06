// ============================================================
// TRIGLAV — core type system
// ============================================================

export type World = 'prav' | 'jav' | 'nav';

export type CharClass = 'vukodlak' | 'vjestica';

export type CardType = 'napad' | 'vjestina' | 'moc' | 'stanje' | 'kletva';
export type CardRarity = 'osnovna' | 'cesta' | 'neobicna' | 'rijetka' | 'posebna';
export type CardTarget = 'enemy' | 'self' | 'all-enemies' | 'random-enemy' | 'none';

// Status / debuff keys
export type Status =
  | 'vulnerable' // +50% damage taken
  | 'weak' // -25% damage dealt
  | 'frail' // -25% block gained
  | 'strength' // +dmg per attack hit
  | 'dexterity' // +block per block card
  | 'bjes' // Vukodlak rage: spends to boost attacks
  | 'poison' // dot, decays
  | 'regen' // heal per turn, decays
  | 'thorns' // reflect on being hit
  | 'intangible' // all incoming damage reduced to 1
  | 'metal' // plated: gain block at end of turn (decays by 1 when hit)
  | 'ritual' // enemy gains strength each turn
  | 'kletva' // cursed mark: takes +dmg from witch
  | 'okovi' // stun: skips next turn (enemy)
  | 'echo'; // vjestica: first card each turn played twice

export type FloatColor = 'damage' | 'block' | 'heal' | 'status' | 'bjes' | 'poison';

// ---- Card actions (declarative) -------------------------------------------
export type CardAction =
  | { kind: 'damage'; amount: number; hits?: number }
  | { kind: 'damageAll'; amount: number; hits?: number }
  | { kind: 'block'; amount: number }
  | { kind: 'status'; status: Status; amount: number } // to target enemy
  | { kind: 'statusAll'; status: Status; amount: number }
  | { kind: 'selfStatus'; status: Status; amount: number }
  | { kind: 'draw'; amount: number }
  | { kind: 'energy'; amount: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'loseHp'; amount: number }
  | { kind: 'addCard'; cardId: string; amount?: number; toHand?: boolean }
  | { kind: 'gainBjes'; amount: number }
  | { kind: 'exhaustHand' };

// CardDef — static content. onPlay is an optional escape hatch for unique cards.
export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cls: CharClass | 'neutral' | 'status';
  cost: number; // -1 = X cost, -2 = unplayable
  target: CardTarget;
  text: string;
  upgradedText?: string;
  flavor?: string;
  actions: CardAction[];
  upgradedActions?: CardAction[];
  exhaust?: boolean;
  ethereal?: boolean; // exhausts at end of turn if still in hand
  innate?: boolean; // starts in opening hand
  retain?: boolean; // not discarded at end of turn
  keywords?: string[];
  // unique-card hook; runs after declarative actions
  onPlay?: (ctx: PlayCtx) => void;
}

export interface CardInstance {
  uid: string;
  id: string;
  upgraded: boolean;
  costOverride?: number; // for temporary cost reduction
}

// ---- Combatants -----------------------------------------------------------
export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  statuses: Partial<Record<Status, number>>;
  isPlayer: boolean;
}

export type IntentType =
  | 'attack'
  | 'attack-multi'
  | 'block'
  | 'buff'
  | 'debuff'
  | 'unknown'
  | 'sleep'
  | 'stun';

export interface Intent {
  type: IntentType;
  value?: number; // damage per hit, or block, etc.
  hits?: number;
  label?: string;
}

export interface EnemyMove {
  id: string;
  name: string;
  intent: Intent;
  perform: (ctx: EnemyCtx) => void;
}

export interface EnemyDef {
  id: string;
  name: string;
  world: World;
  hpRange: [number, number];
  isElite?: boolean;
  isBoss?: boolean;
  sprite: string; // sprite key
  scale?: number;
  flavor?: string;
  moves: EnemyMove[]; // all possible moves, resolvable by id
  // returns the move for the upcoming turn given current state
  ai: (ctx: EnemyAiCtx) => EnemyMove;
  // optional on-spawn (apply innate statuses)
  onSpawn?: (e: EnemyState) => void;
}

export interface EnemyState extends Combatant {
  defId: string;
  spriteKey: string;
  scale: number;
  intent: Intent | null;
  nextMoveId: string | null;
  history: string[]; // recent move ids
  turnCount: number;
  data: Record<string, number>; // per-enemy memory (phase, counters)
}

// ---- Relics ---------------------------------------------------------------
export type RelicTrigger =
  | 'combatStart'
  | 'turnStart'
  | 'turnEnd'
  | 'onPlayCard'
  | 'onAttack'
  | 'onDamaged'
  | 'onRest'
  | 'passive';

export interface RelicDef {
  id: string;
  name: string;
  rarity: CardRarity;
  text: string;
  flavor?: string;
  sprite: string;
  hook?: RelicTrigger;
  // generic effect handler
  onTrigger?: (ctx: RelicCtx) => void;
}

// ---- Potions --------------------------------------------------------------
export interface PotionDef {
  id: string;
  name: string;
  rarity: CardRarity;
  text: string;
  color: string;
  target: 'enemy' | 'self';
  use: (ctx: PotionCtx) => void;
}

// ---- Map ------------------------------------------------------------------
export type NodeKind =
  | 'borba'
  | 'elita'
  | 'dogadjaj'
  | 'odmor'
  | 'trgovac'
  | 'blago'
  | 'gazda'
  | 'start';

export interface MapNode {
  id: string;
  kind: NodeKind;
  x: number; // column 0..n
  y: number; // row within column (0 top)
  px: number; // pixel layout
  py: number;
  next: string[]; // node ids reachable
  world: World;
  visited: boolean;
  available: boolean;
}

export interface GameMap {
  world: World;
  act: number;
  nodes: Record<string, MapNode>;
  columns: string[][]; // node ids per column
  startIds: string[];
  bossId: string;
  currentNodeId: string | null;
}

// ---- Run / meta -----------------------------------------------------------
export interface Reward {
  kind: 'gold' | 'card' | 'relic' | 'potion';
  gold?: number;
  cardChoices?: string[];
  relicId?: string;
  potionId?: string;
  taken?: boolean;
}

export interface RunState {
  cls: CharClass;
  seed: string;
  hp: number;
  maxHp: number;
  gold: number;
  deck: CardInstance[];
  relics: string[];
  potions: (string | null)[];
  potionSlots: number;
  map: GameMap;
  act: number;
  floorsCleared: number;
  ascension: number;
  bjesStartBonus?: number;
}

export interface MetaState {
  unlockedClasses: CharClass[];
  unlockedCards: string[];
  unlockedRelics: string[];
  highestAct: number;
  wins: number;
  losses: number;
  totalRuns: number;
  bestAscension: number;
  seenEnemies: string[];
}

// ---- FX queue (logic → render decoupling) ---------------------------------
export interface FxEvent {
  id: number;
  kind: 'hit' | 'block' | 'heal' | 'status' | 'death' | 'buff' | 'poison' | 'bjes' | 'shake';
  target: 'player' | number; // enemy index
  amount?: number;
  color?: FloatColor;
  intensity?: 'light' | 'heavy';
  text?: string;
}

// ---- Combat state ---------------------------------------------------------
export type CombatPhase = 'intro' | 'player' | 'enemy' | 'won' | 'lost';

export interface CombatState {
  player: Combatant;
  enemies: EnemyState[];
  energy: number;
  maxEnergy: number;
  hand: CardInstance[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];
  turn: number;
  phase: CombatPhase;
  cardsPlayedThisTurn: number;
  attacksThisTurn: number;
  fx: FxEvent[];
  fxSeq: number;
  log: string[];
  encounterId: string;
  isElite: boolean;
  isBoss: boolean;
  rewardClaimed: boolean;
  firstCardPlayed: boolean;
  seedRng: number;
}

// ---- Contexts passed to content hooks -------------------------------------
export interface PlayCtx {
  state: CombatState;
  run: RunState;
  card: CardInstance;
  upgraded: boolean;
  targetIndex: number | null;
  energySpent: number;
  api: CombatApi;
}

export interface EnemyCtx {
  state: CombatState;
  run: RunState;
  self: EnemyState;
  selfIndex: number;
  api: CombatApi;
}

export interface EnemyAiCtx {
  state: CombatState;
  self: EnemyState;
  selfIndex: number;
  rng: () => number;
  roll: (n: number) => number;
}

export interface RelicCtx {
  state: CombatState;
  run: RunState;
  api: CombatApi;
  data?: Record<string, unknown>;
}

export interface PotionCtx {
  state: CombatState | null;
  run: RunState;
  targetIndex: number | null;
  api: CombatApi | null;
}

// CombatApi — mutation helpers shared by cards/enemies/relics/potions.
export interface CombatApi {
  // player attack: applies Strength + Weak then resolves vs target (default = chosen target)
  attack: (base: number, targetIndex: number | null, hits?: number) => void;
  attackAll: (base: number, hits?: number) => void;
  bjes: () => number;
  dealDamage: (
    source: 'player' | EnemyState,
    target: Combatant,
    targetRef: 'player' | number,
    amount: number,
    opts?: { fromCard?: boolean; ignoreBlock?: boolean },
  ) => number;
  gainBlock: (target: Combatant, ref: 'player' | number, amount: number) => void;
  applyStatus: (target: Combatant, ref: 'player' | number, status: Status, amount: number) => void;
  heal: (target: Combatant, ref: 'player' | number, amount: number) => void;
  loseHp: (target: Combatant, ref: 'player' | number, amount: number) => void;
  draw: (n: number) => void;
  gainEnergy: (n: number) => void;
  addCardToHand: (cardId: string, n?: number) => void;
  fx: (e: Omit<FxEvent, 'id'>) => void;
  log: (s: string) => void;
  enemyIndex: (e: EnemyState) => number;
  livingEnemies: () => EnemyState[];
}
