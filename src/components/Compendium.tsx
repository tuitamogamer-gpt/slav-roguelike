import { useState } from 'react';
import { useGame } from '../game/store/gameStore';
import { allCards, allRelics, allEnemies } from '../game/content/registry';
import CardView from './CardView';
import { RelicBadge, CreatureCanvas } from './shared';

type Tab = 'karte' | 'relikvije' | 'bica';

export default function Compendium() {
  const goMenu = useGame((s) => s.goMenu);
  const meta = useGame((s) => s.meta);
  const [tab, setTab] = useState<Tab>('karte');
  const [cls, setCls] = useState<'vukodlak' | 'vjestica' | 'neutral'>('vukodlak');

  return (
    <div className="scene compendium-scene vignette fade-in">
      <button className="btn btn-ghost back-btn" onClick={goMenu}>
        ‹ Nazad
      </button>
      <h2 className="screen-title">Zbirka</h2>
      <div className="comp-tabs">
        {(['karte', 'relikvije', 'bica'] as Tab[]).map((t) => (
          <button key={t} className={`comp-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'karte' ? 'Karte' : t === 'relikvije' ? 'Relikvije' : 'Bića'}
          </button>
        ))}
      </div>

      {tab === 'karte' && (
        <>
          <div className="comp-subtabs">
            {(['vukodlak', 'vjestica', 'neutral'] as const).map((c) => (
              <button key={c} className={`comp-subtab ${cls === c ? 'active' : ''}`} onClick={() => setCls(c)}>
                {c === 'vukodlak' ? 'Vukodlak' : c === 'vjestica' ? 'Vještica' : 'Neutralno'}
              </button>
            ))}
          </div>
          <div className="comp-scroll">
            <div className="deck-grid">
              {allCards()
                .filter((c) => c.cls === cls)
                .map((c) => (
                  <CardView key={c.id} defId={c.id} compact playable />
                ))}
            </div>
          </div>
        </>
      )}

      {tab === 'relikvije' && (
        <div className="comp-scroll">
          <div className="comp-relics">
            {allRelics().map((r) => (
              <div key={r.id} className="comp-relic panel">
                <RelicBadge sprite={r.sprite} rarity={r.rarity} size={48} />
                <div className="comp-relic-info">
                  <div className="comp-relic-name">{r.name}</div>
                  <div className="comp-relic-text">{r.text}</div>
                  {r.flavor && <div className="comp-relic-flavor">„{r.flavor}“</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'bica' && (
        <div className="comp-scroll">
          <div className="comp-enemies">
            {allEnemies().map((e) => {
              const seen = meta.seenEnemies.includes(e.id);
              return (
                <div key={e.id} className={`comp-enemy panel ${e.isBoss ? 'boss' : e.isElite ? 'elite' : ''}`}>
                  <CreatureCanvas ckey={e.sprite} size={96} animate={seen} />
                  <div className="comp-enemy-name">{seen ? e.name : '???'}</div>
                  <div className="comp-enemy-hp">
                    {e.hpRange[0]}–{e.hpRange[1]} HP
                  </div>
                  {seen && e.flavor && <div className="comp-enemy-flavor">„{e.flavor}“</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
