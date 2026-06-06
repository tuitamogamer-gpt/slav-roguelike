import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../game/store/gameStore';
import type { CombatState, EnemyState, Status, Combatant, Intent } from '../game/types';
import { getCard, getPotion, getRelic } from '../game/content/registry';
import { CreatureCanvas, PotionBadge, RelicBadge } from './shared';
import CardView from './CardView';
import ParticleCanvas, { type ParticleHandle, type BurstKind } from './ParticleCanvas';
import { useGameImage, bgRel } from '../assets/loader';

const STATUS_META: Record<Status, { label: string; cls: string; short: string }> = {
  vulnerable: { label: 'Ranjiv', cls: 's-vuln', short: 'RNJ' },
  weak: { label: 'Nemoć', cls: 's-weak', short: 'NEM' },
  frail: { label: 'Krhkost', cls: 's-frail', short: 'KRH' },
  strength: { label: 'Snaga', cls: 's-str', short: 'SNG' },
  dexterity: { label: 'Spretnost', cls: 's-dex', short: 'SPR' },
  bjes: { label: 'Bijes', cls: 's-bjes', short: 'BJS' },
  poison: { label: 'Otrov', cls: 's-poison', short: 'OTR' },
  regen: { label: 'Obnova', cls: 's-regen', short: 'OBN' },
  thorns: { label: 'Trnje', cls: 's-thorns', short: 'TRN' },
  intangible: { label: 'Sjenovit', cls: 's-intan', short: 'SJN' },
  metal: { label: 'Oklop', cls: 's-metal', short: 'OKL' },
  ritual: { label: 'Obred', cls: 's-ritual', short: 'OBR' },
  kletva: { label: 'Kletva', cls: 's-kletva', short: 'KLT' },
  okovi: { label: 'Okovi', cls: 's-okovi', short: 'OKV' },
  echo: { label: 'Odjek', cls: 's-echo', short: 'ODJ' },
};

function StatusPips({ c }: { c: Combatant }) {
  const entries = Object.entries(c.statuses).filter(([, v]) => (v ?? 0) !== 0) as [Status, number][];
  if (entries.length === 0) return null;
  return (
    <div className="status-pips">
      {entries.map(([s, v]) => {
        const m = STATUS_META[s];
        return (
          <span key={s} className={`pip ${m.cls}`} title={`${m.label}: ${v}`}>
            <span className="pip-short">{m.short}</span>
            <span className="pip-val">{v}</span>
          </span>
        );
      })}
    </div>
  );
}

function IntentBubble({ intent }: { intent: Intent | null }) {
  if (!intent) return null;
  const total =
    (intent.type === 'attack' || intent.type === 'attack-multi') && intent.value
      ? intent.value * (intent.hits ?? 1)
      : 0;
  let icon = '?';
  let cls = 'i-unknown';
  if (intent.type === 'attack' || intent.type === 'attack-multi') {
    icon = '⚔';
    cls = total >= 12 ? 'i-attack-big' : 'i-attack';
  } else if (intent.type === 'block') {
    icon = '◈';
    cls = 'i-block';
  } else if (intent.type === 'buff') {
    icon = '▲';
    cls = 'i-buff';
  } else if (intent.type === 'debuff') {
    icon = '▼';
    cls = 'i-debuff';
  } else if (intent.type === 'sleep') {
    icon = 'z';
    cls = 'i-sleep';
  }
  return (
    <div className={`intent ${cls}`} title={intent.label}>
      <span className="intent-icon">{icon}</span>
      {(intent.type === 'attack' || intent.type === 'attack-multi') && (
        <span className="intent-val">
          {intent.value}
          {intent.hits && intent.hits > 1 ? `×${intent.hits}` : ''}
        </span>
      )}
    </div>
  );
}

function HpBlock({ c, big = false }: { c: Combatant; big?: boolean }) {
  const pct = Math.max(0, (c.hp / c.maxHp) * 100);
  return (
    <div className={`unit-bars ${big ? 'big' : ''}`}>
      <div className="unit-hp-bg">
        <div className="unit-hp-fill" style={{ width: `${pct}%` }} />
        <span className="unit-hp-text">
          {c.hp}/{c.maxHp}
        </span>
      </div>
      {c.block > 0 && <div className="unit-block" title="Štit">◈ {c.block}</div>}
    </div>
  );
}

interface Float {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  big?: boolean;
}

export default function CombatView() {
  const combat = useGame((s) => s.combat) as CombatState | null;
  const run = useGame((s) => s.run);
  const playCard = useGame((s) => s.playCard);
  const endTurn = useGame((s) => s.endTurn);
  const usePotion = useGame((s) => s.usePotion);
  const discardPotion = useGame((s) => s.discardPotion);
  const enemyActing = useGame((s) => s.enemyActing);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const enemyRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const particleRef = useRef<ParticleHandle>(null);
  const lastFx = useRef(0);

  const [pending, setPending] = useState<
    | { type: 'card'; uid: string }
    | { type: 'potion'; slot: number }
    | null
  >(null);
  const [floats, setFloats] = useState<Float[]>([]);
  const [shake, setShake] = useState<'' | 'shake-light' | 'shake-heavy'>('');
  const [flash, setFlash] = useState<Record<string, number>>({});
  const floatId = useRef(1);
  const bgImg = useGameImage(run ? bgRel(run.map.world) : null);

  const centerOf = useCallback((target: 'player' | number): { x: number; y: number } => {
    const el = target === 'player' ? playerRef.current : enemyRefs.current[target];
    if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.4 };
  }, []);

  const addFloat = useCallback((x: number, y: number, text: string, color: string, big = false) => {
    const id = floatId.current++;
    setFloats((f) => [...f, { id, x: x + (Math.random() * 24 - 12), y, text, color, big }]);
    window.setTimeout(() => setFloats((f) => f.filter((fl) => fl.id !== id)), 950);
  }, []);

  // process FX queue
  useEffect(() => {
    if (!combat) return;
    const news = combat.fx.filter((f) => f.id > lastFx.current);
    if (news.length === 0) return;
    lastFx.current = combat.fx[combat.fx.length - 1]?.id ?? lastFx.current;
    let heavy = false;
    for (const f of news) {
      const pos = centerOf(f.target);
      const burst = (kind: BurstKind, power = 1) => particleRef.current?.burst(pos.x, pos.y, kind, power);
      switch (f.kind) {
        case 'hit':
          if ((f.amount ?? 0) > 0) {
            addFloat(pos.x, pos.y, `${f.amount}`, '#ff6a4a', (f.amount ?? 0) >= 12);
            burst('blood', Math.min(2.2, 0.6 + (f.amount ?? 0) / 14));
            setFlash((s) => ({ ...s, [String(f.target)]: (s[String(f.target)] ?? 0) + 1 }));
            if (f.intensity === 'heavy' || (f.amount ?? 0) >= 14) heavy = true;
          }
          break;
        case 'block':
          addFloat(pos.x, pos.y, `◈${f.amount}`, '#bfe0ee');
          burst('block', 0.8);
          break;
        case 'heal':
          addFloat(pos.x, pos.y, `+${f.amount}`, '#b6e06a');
          burst('heal', 1);
          break;
        case 'poison':
          if (f.amount) addFloat(pos.x, pos.y, `☣${f.amount}`, '#9fc25a');
          burst('poison', 0.8);
          break;
        case 'status':
          if (f.text) addFloat(pos.x, pos.y, f.text, '#d8a0ff');
          break;
        case 'buff':
          if (f.text) addFloat(pos.x, pos.y, f.text, '#ffd23a');
          burst('spark', 0.7);
          break;
        case 'bjes':
          burst('rage', 1.2);
          break;
        case 'death':
          burst('shadow', 2.2);
          break;
      }
    }
    if (heavy) {
      setShake('shake-heavy');
      window.setTimeout(() => setShake(''), 320);
    } else if (news.some((f) => f.kind === 'hit' && (f.amount ?? 0) > 0)) {
      setShake('shake-light');
      window.setTimeout(() => setShake(''), 180);
    }
  }, [combat, addFloat, centerOf]);

  // clear flash classes shortly after
  useEffect(() => {
    if (Object.keys(flash).length === 0) return;
    const t = window.setTimeout(() => setFlash({}), 240);
    return () => clearTimeout(t);
  }, [flash]);

  if (!combat || !run) return null;
  const living = combat.enemies.filter((e) => e.hp > 0);

  const canPlay = (uid: string): boolean => {
    const inst = combat.hand.find((c) => c.uid === uid);
    if (!inst) return false;
    const def = getCard(inst.id);
    const cost = inst.costOverride ?? def.cost;
    if (cost === -2) return false;
    const need = cost < 0 ? 1 : cost;
    return combat.phase === 'player' && !enemyActing && combat.energy >= need;
  };

  const onCardClick = (uid: string) => {
    if (!canPlay(uid)) return;
    const inst = combat.hand.find((c) => c.uid === uid)!;
    const def = getCard(inst.id);
    const needsTarget = (def.target === 'enemy' || def.target === 'random-enemy') && living.length > 1;
    if (needsTarget) {
      setPending({ type: 'card', uid });
    } else {
      const ti =
        def.target === 'enemy' || def.target === 'random-enemy'
          ? combat.enemies.findIndex((e) => e.hp > 0)
          : null;
      playCard(uid, ti);
    }
  };

  const onEnemyClick = (idx: number) => {
    if (!pending) return;
    if (combat.enemies[idx].hp <= 0) return;
    if (pending.type === 'card') playCard(pending.uid, idx);
    else usePotion(pending.slot, idx);
    setPending(null);
  };

  const onPotionClick = (slot: number) => {
    const pid = run.potions[slot];
    if (!pid || combat.phase !== 'player' || enemyActing) return;
    const def = getPotion(pid)!;
    if (def.target === 'enemy' && living.length > 1) {
      setPending({ type: 'potion', slot });
    } else {
      const ti = def.target === 'enemy' ? combat.enemies.findIndex((e) => e.hp > 0) : null;
      usePotion(slot, ti);
    }
  };

  const targeting = pending !== null;

  return (
    <div
      ref={containerRef}
      className={`scene combat-scene vignette ${shake}`}
      onContextMenu={(e) => {
        e.preventDefault();
        setPending(null);
      }}
    >
      <div
        className="combat-bg"
        style={bgImg ? { backgroundImage: `url(${bgImg.src})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      />

      {/* top status line */}
      <div className="combat-top">
        <div className="combat-relics">
          {run.relics.slice(0, 8).map((rid) => {
            const r = getRelic(rid);
            return r ? (
              <RelicBadge key={rid} id={rid} sprite={r.sprite} rarity={r.rarity} size={30} />
            ) : null;
          })}
        </div>
        <div className="combat-turn">
          {combat.isBoss ? 'GAZDA' : combat.isElite ? 'ELITA' : 'Borba'} · Potez {combat.turn}
          {enemyActing && <span className="enemy-acting"> — neprijatelj djeluje…</span>}
        </div>
      </div>

      {/* enemies */}
      <div className="enemy-area">
        {combat.enemies.map((e, i) => (
          <EnemyUnit
            key={e.id}
            e={e}
            idx={i}
            refCb={(el) => (enemyRefs.current[i] = el)}
            targeting={targeting}
            flashNonce={flash[String(i)] ?? 0}
            onClick={() => onEnemyClick(i)}
          />
        ))}
      </div>

      {/* player */}
      <div className="player-area">
        <div
          ref={playerRef}
          className={`player-unit ${flash['player'] ? 'flashing' : ''}`}
        >
          <CreatureCanvas ckey={`player_${run.cls}`} size={150} />
          <div className="unit-name">{combat.player.name}</div>
          <HpBlock c={combat.player} big />
          <StatusPips c={combat.player} />
        </div>
        <div className="energy-orb">
          <div className="energy-val">
            {combat.energy}
            <span className="energy-max">/{combat.maxEnergy}</span>
          </div>
          <div className="energy-label">moć</div>
        </div>
      </div>

      {/* piles + end turn */}
      <div className="combat-controls">
        <div className="pile pile-draw" title="Špil za vučenje">
          <span className="pile-count">{combat.drawPile.length}</span>
          <span className="pile-label">vuci</span>
        </div>
        <div className="hand-zone">
          {combat.hand.map((c, idx) => {
            const n = combat.hand.length;
            const spread = Math.min(14, 70 / Math.max(1, n));
            const rot = (idx - (n - 1) / 2) * (n > 1 ? spread / 6 : 0);
            const lift = Math.abs(idx - (n - 1) / 2) * 6;
            return (
              <div
                key={c.uid}
                className="hand-card-wrap"
                style={{ transform: `rotate(${rot}deg) translateY(${lift}px)` }}
              >
                <CardView
                  inst={c}
                  playable={canPlay(c.uid)}
                  selected={pending?.type === 'card' && pending.uid === c.uid}
                  onClick={() => onCardClick(c.uid)}
                />
              </div>
            );
          })}
        </div>
        <div className="right-controls">
          <button
            className="btn btn-primary end-turn"
            disabled={combat.phase !== 'player' || enemyActing}
            onClick={endTurn}
          >
            Kraj poteza
          </button>
          <div className="pile pile-discard" title="Odbačene">
            <span className="pile-count">{combat.discardPile.length}</span>
            <span className="pile-label">odbačeno</span>
          </div>
          {combat.exhaustPile.length > 0 && (
            <div className="pile pile-exhaust" title="Iscrpljene">
              <span className="pile-count">{combat.exhaustPile.length}</span>
              <span className="pile-label">iscrpljeno</span>
            </div>
          )}
        </div>
      </div>

      {/* potions */}
      <div className="combat-potions">
        {run.potions.map((pid, i) => {
          const p = pid ? getPotion(pid) : null;
          return (
            <div key={i} className={`combat-potion ${p ? 'has' : ''} ${pending?.type === 'potion' && pending.slot === i ? 'sel' : ''}`}>
              {p ? (
                <div className="potion-actions">
                  <button className="potion-btn" title={`${p.name}\n${p.text}`} onClick={() => onPotionClick(i)}>
                    <PotionBadge id={pid!} color={p.color} size={38} />
                  </button>
                  <button className="potion-discard" title="Baci" onClick={() => discardPotion(i)}>
                    ×
                  </button>
                </div>
              ) : (
                <div className="potion-empty-c" />
              )}
            </div>
          );
        })}
      </div>

      {targeting && <div className="targeting-hint">Izaberi metu (desni klik za otkaz)</div>}

      <ParticleCanvas ref={particleRef} />
      <div className="floats-layer">
        {floats.map((f) => (
          <span
            key={f.id}
            className={`float ${f.big ? 'float-big' : ''}`}
            style={{ left: f.x, top: f.y, color: f.color }}
          >
            {f.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function EnemyUnit({
  e,
  idx,
  refCb,
  targeting,
  flashNonce,
  onClick,
}: {
  e: EnemyState;
  idx: number;
  refCb: (el: HTMLDivElement | null) => void;
  targeting: boolean;
  flashNonce: number;
  onClick: () => void;
}) {
  const dead = e.hp <= 0;
  return (
    <div
      ref={refCb}
      className={[
        'enemy-unit',
        dead ? 'enemy-dead' : '',
        targeting && !dead ? 'enemy-targetable' : '',
        flashNonce ? 'flashing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      key={`${e.id}-${flashNonce}`}
      data-idx={idx}
    >
      {!dead && <IntentBubble intent={e.intent} />}
      <div className="enemy-sprite">
        <CreatureCanvas ckey={e.spriteKey} size={Math.round(150 * (e.scale || 1))} animate={!dead} />
      </div>
      {!dead && (
        <>
          <div className="unit-name enemy-name">{e.name}</div>
          <HpBlock c={e} />
          <StatusPips c={e} />
        </>
      )}
    </div>
  );
}
