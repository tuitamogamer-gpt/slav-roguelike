import { useEffect, useRef } from 'react';
import { drawCreature } from '../render/creatures';
import { drawRelicIcon, drawPotion } from '../render/icons';
import { useGameImage, spriteRel, relicRel, potionRel } from '../assets/loader';

export function CreatureCanvas({
  ckey,
  size,
  animate = true,
}: {
  ckey: string;
  size: number;
  animate?: boolean;
}) {
  const img = useGameImage(spriteRel(ckey));
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (img) return; // real sprite present → skip procedural draw
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    let raf = 0;
    let start = 0;
    const loop = (ts: number) => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      drawCreature(ctx, ckey, size, animate ? t : 0.4);
      if (animate) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ckey, size, animate, img]);

  if (img) {
    return (
      <img
        src={img.src}
        alt=""
        draggable={false}
        className={`sprite-img ${animate ? 'sprite-idle' : ''}`}
        style={{ width: size, height: size, display: 'block', objectFit: 'contain' }}
      />
    );
  }
  return <canvas ref={ref} style={{ width: size, height: size, display: 'block' }} />;
}

export function RelicBadge({
  sprite,
  id,
  rarity,
  size = 44,
}: {
  sprite: string;
  id?: string;
  rarity?: string;
  size?: number;
}) {
  const img = useGameImage(id ? relicRel(id) : null);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (img) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawRelicIcon(ctx, sprite, size, rarity);
  }, [sprite, rarity, size, img]);
  if (img)
    return (
      <img
        src={img.src}
        alt=""
        draggable={false}
        style={{ width: size, height: size, borderRadius: '50%' }}
      />
    );
  return <canvas ref={ref} style={{ width: size, height: size }} />;
}

export function PotionBadge({
  color,
  id,
  size = 40,
}: {
  color: string;
  id?: string;
  size?: number;
}) {
  const img = useGameImage(id ? potionRel(id) : null);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (img) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawPotion(ctx, color, size);
  }, [color, size, img]);
  if (img)
    return <img src={img.src} alt="" draggable={false} style={{ width: size, height: size }} />;
  return <canvas ref={ref} style={{ width: size, height: size }} />;
}
