import { useState } from 'react';
import { useGame } from '../game/store/gameStore';
import { getRelic, getPotion } from '../game/content/registry';
import { RelicBadge, PotionBadge } from './shared';
import CardView from './CardView';

export default function RewardScreen() {
  const reward = useGame((s) => s.reward);
  const run = useGame((s) => s.run);
  const takeGold = useGame((s) => s.takeGold);
  const takeCard = useGame((s) => s.takeCard);
  const skipCard = useGame((s) => s.skipCard);
  const takeRelic = useGame((s) => s.takeRelic);
  const takePotion = useGame((s) => s.takePotion);
  const leaveReward = useGame((s) => s.leaveReward);
  const [picking, setPicking] = useState(false);
  if (!reward || !run) return null;

  const r = getRelic(reward.relicId ?? '');
  const p = getPotion(reward.potionId ?? '');
  const potionFull = run.potions.every((x) => x !== null);

  const title =
    reward.source === 'boss'
      ? 'Gazda je pao'
      : reward.source === 'elite'
        ? 'Elita poražena'
        : reward.source === 'treasure'
          ? 'Blago'
          : 'Plijen';

  return (
    <div className="scene reward-scene vignette fade-in">
      <h2 className="screen-title">{title}</h2>
      <div className="reward-list">
        {reward.gold > 0 && (
          <button className="reward-row panel" disabled={reward.goldTaken} onClick={takeGold}>
            <span className="reward-icon">⛀</span>
            <span className="reward-label">{reward.gold} zlata</span>
            {reward.goldTaken && <span className="reward-taken">uzeto</span>}
          </button>
        )}

        {reward.cardChoices.length > 0 && !reward.cardTaken && (
          <button className="reward-row panel" onClick={() => setPicking(true)}>
            <span className="reward-icon">✦</span>
            <span className="reward-label">Dodaj kartu u špil</span>
          </button>
        )}
        {reward.cardTaken && reward.cardChoices.length > 0 && (
          <div className="reward-row panel disabled">
            <span className="reward-icon">✦</span>
            <span className="reward-label">Karta</span>
            <span className="reward-taken">riješeno</span>
          </div>
        )}

        {r && (
          <button className="reward-row panel" disabled={reward.relicTaken} onClick={takeRelic}>
            <span className="reward-icon-c">
              <RelicBadge id={r.id} sprite={r.sprite} rarity={r.rarity} size={40} />
            </span>
            <span className="reward-label">
              {r.name}
              <span className="reward-sub">{r.text}</span>
            </span>
            {reward.relicTaken && <span className="reward-taken">uzeto</span>}
          </button>
        )}

        {p && (
          <button
            className="reward-row panel"
            disabled={reward.potionTaken || potionFull}
            onClick={takePotion}
          >
            <span className="reward-icon-c">
              <PotionBadge id={p.id} color={p.color} size={36} />
            </span>
            <span className="reward-label">
              {p.name}
              <span className="reward-sub">{potionFull && !reward.potionTaken ? 'nema mjesta' : p.text}</span>
            </span>
            {reward.potionTaken && <span className="reward-taken">uzeto</span>}
          </button>
        )}
      </div>

      <button className="btn btn-primary reward-continue" onClick={leaveReward}>
        {reward.afterBoss ? 'Nastavi' : 'Natrag na mapu'}
      </button>

      {picking && (
        <div className="modal-overlay" onClick={() => setPicking(false)}>
          <div className="card-pick" onClick={(e) => e.stopPropagation()}>
            <h3 className="pick-title">Izaberi jednu kartu</h3>
            <div className="pick-cards">
              {reward.cardChoices.map((id) => (
                <CardView
                  key={id}
                  defId={id}
                  highlight
                  onClick={() => {
                    takeCard(id);
                    setPicking(false);
                  }}
                />
              ))}
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => {
                skipCard();
                setPicking(false);
              }}
            >
              Preskoči
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
