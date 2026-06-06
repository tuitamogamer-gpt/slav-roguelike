import { useState } from 'react';
import { useGame } from '../game/store/gameStore';
import { getRelic, getPotion } from '../game/content/registry';
import { RelicBadge, PotionBadge, CreatureCanvas } from './shared';
import CardView from './CardView';
import TopBar from './TopBar';

export default function ShopView() {
  const run = useGame((s) => s.run);
  const shop = useGame((s) => s.shop);
  const buyCard = useGame((s) => s.buyShopCard);
  const buyRelic = useGame((s) => s.buyShopRelic);
  const buyPotion = useGame((s) => s.buyShopPotion);
  const removeCard = useGame((s) => s.shopRemoveCard);
  const leaveShop = useGame((s) => s.leaveShop);
  const [removing, setRemoving] = useState(false);
  if (!run || !shop) return null;

  const can = (price: number) => run.gold >= price;

  return (
    <div className="scene shop-scene vignette fade-in">
      <TopBar />
      <div className="shop-head">
        <CreatureCanvas ckey="grobna_vjestica" size={90} />
        <div>
          <h2 className="screen-title shop-title">Trgovac s raskršća</h2>
          <p className="shop-flavor">„Sve ima svoju cijenu, putniče. I ono što ne vidiš.“</p>
        </div>
      </div>

      <div className="shop-body">
        <div className="shop-cards">
          {shop.cards.map((c) => (
            <div key={c.id} className={`shop-card ${c.sold ? 'sold' : ''}`}>
              <CardView
                defId={c.id}
                playable={can(c.price) && !c.sold}
                dimmed={c.sold || !can(c.price)}
                onClick={() => !c.sold && buyCard(c.id)}
              />
              <div className={`price ${can(c.price) ? '' : 'too-much'}`}>
                {c.sold ? 'prodano' : `${c.price} ⛀`}
              </div>
            </div>
          ))}
        </div>

        <div className="shop-side">
          <div className="shop-relics">
            {shop.relics.map((r) => {
              const def = getRelic(r.id)!;
              return (
                <button
                  key={r.id}
                  className={`shop-item panel ${r.sold ? 'sold' : ''}`}
                  disabled={r.sold || !can(r.price)}
                  onClick={() => buyRelic(r.id)}
                >
                  <RelicBadge id={def.id} sprite={def.sprite} rarity={def.rarity} size={40} />
                  <div className="shop-item-info">
                    <div className="shop-item-name">{def.name}</div>
                    <div className="shop-item-text">{def.text}</div>
                  </div>
                  <div className={`price ${can(r.price) ? '' : 'too-much'}`}>
                    {r.sold ? '—' : `${r.price} ⛀`}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="shop-potions">
            {shop.potions.map((p, i) => {
              const def = getPotion(p.id)!;
              return (
                <button
                  key={i}
                  className={`shop-item panel ${p.sold ? 'sold' : ''}`}
                  disabled={p.sold || !can(p.price)}
                  onClick={() => buyPotion(p.id)}
                >
                  <PotionBadge id={def.id} color={def.color} size={34} />
                  <div className="shop-item-info">
                    <div className="shop-item-name">{def.name}</div>
                    <div className="shop-item-text">{def.text}</div>
                  </div>
                  <div className={`price ${can(p.price) ? '' : 'too-much'}`}>
                    {p.sold ? '—' : `${p.price} ⛀`}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            className="btn shop-remove"
            disabled={shop.removeUsed || run.gold < shop.removeCost}
            onClick={() => setRemoving(true)}
          >
            {shop.removeUsed ? 'Uklanjanje iskorišteno' : `Ukloni kartu (${shop.removeCost} ⛀)`}
          </button>
        </div>
      </div>

      <button className="btn btn-primary shop-leave" onClick={leaveShop}>
        Napusti trgovca
      </button>

      {removing && (
        <div className="modal-overlay" onClick={() => setRemoving(false)}>
          <div className="deck-modal panel" onClick={(e) => e.stopPropagation()}>
            <div className="deck-modal-head">
              <h3>Ukloni kartu iz špila</h3>
              <button className="btn btn-ghost" onClick={() => setRemoving(false)}>
                Otkaži
              </button>
            </div>
            <div className="deck-grid">
              {[...run.deck]
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((c) => (
                  <CardView
                    key={c.uid}
                    inst={c}
                    compact
                    highlight
                    onClick={() => {
                      removeCard(c.uid);
                      setRemoving(false);
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
