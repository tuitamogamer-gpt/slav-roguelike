import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export type BurstKind = 'blood' | 'spark' | 'shadow' | 'block' | 'heal' | 'poison' | 'rage';

export interface ParticleHandle {
  burst: (x: number, y: number, kind: BurstKind, power?: number) => void;
}

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  grav: number;
  shape: 'rect' | 'circle';
}

const PALETTES: Record<BurstKind, string[]> = {
  blood: ['#d83232', '#9c1f1f', '#6a1414', '#ff5a3a'],
  spark: ['#f4d160', '#d4af37', '#fff0c0', '#e07b2c'],
  shadow: ['#6b3a7a', '#3d2a4d', '#c04aff', '#1c1822'],
  block: ['#7fb0c4', '#bfe0ee', '#4a7e92'],
  heal: ['#9fc25a', '#d6f06a', '#6a8c3f'],
  poison: ['#7aa83f', '#9fc25a', '#3a5a20'],
  rage: ['#d83232', '#ff9e4a', '#e07b2c', '#ffcf3a'],
};

const ParticleCanvas = forwardRef<ParticleHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<P[]>([]);
  const dprRef = useRef(1);

  useImperativeHandle(ref, () => ({
    burst(x, y, kind, power = 1) {
      const pal = PALETTES[kind];
      const count = Math.round((kind === 'spark' ? 10 : 16) * power);
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (1.5 + Math.random() * 5) * power;
        const isHeal = kind === 'heal' || kind === 'poison';
        particles.current.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - (isHeal ? 1.5 : 0),
          life: 0,
          max: 28 + Math.random() * 30,
          size: (kind === 'spark' ? 2 : 3) + Math.random() * 3,
          color: pal[Math.floor(Math.random() * pal.length)],
          grav: isHeal ? -0.04 : 0.18,
          shape: kind === 'spark' || kind === 'rage' ? 'rect' : Math.random() < 0.5 ? 'rect' : 'circle',
        });
      }
      if (particles.current.length > 600)
        particles.current.splice(0, particles.current.length - 600);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      dprRef.current = dpr;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);
    let raf = 0;
    const loop = () => {
      const dpr = dprRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const ps = particles.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life++;
        p.vy += p.grav;
        p.vx *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        const a = 1 - p.life / p.max;
        if (a <= 0) {
          ps.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.2);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
});

ParticleCanvas.displayName = 'ParticleCanvas';
export default ParticleCanvas;
