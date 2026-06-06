import { useEffect, useRef } from 'react';
import type { CardDef, CardInstance, CardType } from '../game/types';
import { getCard } from '../game/content/registry';

const TYPE_LABEL: Record<CardType, string> = {
  napad: 'Napad',
  vjestina: 'Vještina',
  moc: 'Moć',
  stanje: 'Stanje',
  kletva: 'Kletva',
};

function costDisplay(cost: number): string {
  if (cost === -1) return 'X';
  if (cost === -2) return '–';
  return String(cost);
}

function CardArt({ type, cls }: { type: CardType; cls: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = 168;
    const H = 78;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    const tint =
      type === 'napad'
        ? ['#3a1614', '#160a0a']
        : type === 'vjestina'
          ? ['#16242e', '#0a1014']
          : type === 'moc'
            ? ['#2a1830', '#120a16']
            : ['#241f14', '#100c08'];
    bg.addColorStop(0, tint[0]);
    bg.addColorStop(1, tint[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H / 2 + 4;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    if (type === 'napad') {
      // claw slashes
      ctx.strokeStyle = '#e07b4a';
      ctx.shadowColor = '#e07b2c';
      ctx.shadowBlur = 8;
      for (const off of [-12, 0, 12]) {
        ctx.beginPath();
        ctx.moveTo(off - 18, -26);
        ctx.quadraticCurveTo(off, 0, off - 10, 28);
        ctx.stroke();
      }
    } else if (type === 'vjestina') {
      ctx.strokeStyle = '#7fb0c4';
      ctx.fillStyle = 'rgba(127,176,196,0.18)';
      ctx.shadowColor = '#7fb0c4';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(26, -16);
      ctx.lineTo(20, 18);
      ctx.lineTo(0, 30);
      ctx.lineTo(-20, 18);
      ctx.lineTo(-26, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type === 'moc') {
      ctx.strokeStyle = '#c98ad8';
      ctx.shadowColor = '#9b59b6';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.2) {
        const r = a * 3.2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#8a7a55';
      ctx.fillStyle = '#8a7a55';
      ctx.beginPath();
      ctx.arc(0, -4, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-9, 6, 18, 10);
      ctx.fillStyle = '#100c08';
      ctx.beginPath();
      ctx.arc(-5, -4, 3.4, 0, Math.PI * 2);
      ctx.arc(5, -4, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    void cls;
  }, [type, cls]);
  return <canvas ref={ref} className="card-art-canvas" />;
}

export default function CardView({
  inst,
  defId,
  upgraded: upgradedProp,
  onClick,
  playable = true,
  selected = false,
  highlight = false,
  compact = false,
  dimmed = false,
}: {
  inst?: CardInstance;
  defId?: string;
  upgraded?: boolean;
  onClick?: () => void;
  playable?: boolean;
  selected?: boolean;
  highlight?: boolean;
  compact?: boolean;
  dimmed?: boolean;
}) {
  const id = inst?.id ?? defId!;
  const def: CardDef = getCard(id);
  const upgraded = inst?.upgraded ?? upgradedProp ?? false;
  const cost = inst?.costOverride ?? def.cost;
  const text = (upgraded && def.upgradedText) || def.text;

  return (
    <div
      className={[
        'card',
        `card-${def.type}`,
        upgraded ? 'card-up' : '',
        selected ? 'card-selected' : '',
        highlight ? 'card-highlight' : '',
        !playable ? 'card-unplayable' : '',
        compact ? 'card-compact' : '',
        dimmed ? 'card-dimmed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <div className={`card-cost cost-${def.type}`}>{costDisplay(cost)}</div>
      <div className="card-inner">
        <div className="card-name" title={def.name}>
          {def.name}
          {upgraded ? '+' : ''}
        </div>
        <CardArt type={def.type} cls={def.cls} />
        <div className="card-type-row">
          <span className={`card-rarity rar-${def.rarity}`} />
          <span className="card-type">{TYPE_LABEL[def.type]}</span>
        </div>
        <div className="card-text">{text}</div>
        {def.keywords && def.keywords.length > 0 && (
          <div className="card-keywords">{def.keywords.join(' · ')}</div>
        )}
      </div>
    </div>
  );
}
