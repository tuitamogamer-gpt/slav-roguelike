import { useState } from 'react';
import { useGame } from '../game/store/gameStore';
import { getCard } from '../game/content/registry';
import CardView from './CardView';
import TopBar from './TopBar';

export default function RestView() {
  const run = useGame((s) => s.run);
  const restHeal = useGame((s) => s.restHeal);
  const restUpgrade = useGame((s) => s.restUpgrade);
  const [upgrading, setUpgrading] = useState(false);
  if (!run) return null;

  const heal = Math.floor(run.maxHp * 0.25);
  const upgradable = run.deck.filter((c) => !c.upgraded && getCard(c.id).type !== 'kletva' && getCard(c.id).type !== 'stanje');

  return (
    <div className="scene rest-scene vignette fade-in">
      <TopBar />
      <div className="rest-fire">
        <div className="fire-glow" />
        <div className="fire-flames" />
      </div>
      <h2 className="screen-title rest-title">Ognjište u noći</h2>
      <p className="rest-flavor">
        Plamen pucketa. Možeš predahnuti i obnoviti snagu, ili izoštriti svoje umijeće.
      </p>

      <div className="rest-options">
        <button className="rest-option panel" onClick={restHeal}>
          <span className="rest-opt-icon">♥</span>
          <span className="rest-opt-name">Odmori</span>
          <span className="rest-opt-desc">Izliječi {heal} zdravlja</span>
        </button>
        <button
          className="rest-option panel"
          disabled={upgradable.length === 0}
          onClick={() => setUpgrading(true)}
        >
          <span className="rest-opt-icon">✦</span>
          <span className="rest-opt-name">Ukuj</span>
          <span className="rest-opt-desc">
            {upgradable.length === 0 ? 'nema karata za nadogradnju' : 'Nadogradi jednu kartu'}
          </span>
        </button>
      </div>

      {upgrading && (
        <div className="modal-overlay" onClick={() => setUpgrading(false)}>
          <div className="deck-modal panel" onClick={(e) => e.stopPropagation()}>
            <div className="deck-modal-head">
              <h3>Nadogradi kartu</h3>
              <button className="btn btn-ghost" onClick={() => setUpgrading(false)}>
                Otkaži
              </button>
            </div>
            <div className="deck-grid">
              {upgradable
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((c) => (
                  <CardView
                    key={c.uid}
                    inst={c}
                    compact
                    highlight
                    onClick={() => {
                      restUpgrade(c.uid);
                      setUpgrading(false);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
