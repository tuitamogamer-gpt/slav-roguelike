import { useState } from 'react';
import { useGame } from '../game/store/gameStore';
import { getRelic, getPotion } from '../game/content/registry';
import { RelicBadge, PotionBadge } from './shared';
import CardView from './CardView';

export default function TopBar({ showMenu = true }: { showMenu?: boolean }) {
  const run = useGame((s) => s.run);
  const goScreen = useGame((s) => s.goScreen);
  const [deckOpen, setDeckOpen] = useState(false);
  const [relicTip, setRelicTip] = useState<string | null>(null);
  if (!run) return null;

  const hpPct = Math.max(0, (run.hp / run.maxHp) * 100);

  return (
    <div className="topbar">
      <div className="tb-left">
        <div className="hp-chip">
          <div className="hp-bar-bg">
            <div className="hp-bar-fill" style={{ width: `${hpPct}%` }} />
            <span className="hp-text">
              {run.hp} / {run.maxHp}
            </span>
          </div>
        </div>
        <div className="gold-chip">{run.gold} ⛀</div>
      </div>

      <div className="tb-relics">
        {run.relics.map((rid) => {
          const r = getRelic(rid);
          if (!r) return null;
          return (
            <div
              key={rid}
              className="relic-slot"
              onMouseEnter={() => setRelicTip(rid)}
              onMouseLeave={() => setRelicTip(null)}
            >
              <RelicBadge sprite={r.sprite} rarity={r.rarity} size={40} />
              {relicTip === rid && (
                <div className="relic-tip panel">
                  <div className="relic-tip-name">{r.name}</div>
                  <div className="relic-tip-text">{r.text}</div>
                  {r.flavor && <div className="relic-tip-flavor">„{r.flavor}“</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="tb-right">
        <div className="potions-row">
          {run.potions.map((pid, i) => {
            const p = pid ? getPotion(pid) : null;
            return (
              <div key={i} className="potion-slot" title={p?.name}>
                {p ? <PotionBadge color={p.color} size={34} /> : <div className="potion-empty" />}
              </div>
            );
          })}
        </div>
        <button className="btn btn-ghost" onClick={() => setDeckOpen(true)}>
          Špil ({run.deck.length})
        </button>
        {showMenu && (
          <button className="btn btn-ghost" onClick={() => goScreen('settings')}>
            ☰
          </button>
        )}
      </div>

      {deckOpen && (
        <div className="modal-overlay" onClick={() => setDeckOpen(false)}>
          <div className="deck-modal panel" onClick={(e) => e.stopPropagation()}>
            <div className="deck-modal-head">
              <h3>Tvoj špil — {run.deck.length} karata</h3>
              <button className="btn btn-ghost" onClick={() => setDeckOpen(false)}>
                Zatvori
              </button>
            </div>
            <div className="deck-grid">
              {[...run.deck]
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((c) => (
                  <CardView key={c.uid} inst={c} compact playable />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
