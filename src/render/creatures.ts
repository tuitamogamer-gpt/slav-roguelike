// Procedural creature rendering on canvas.
// Each creature is a hand-tuned descriptor drawn with paths, shading and
// glowing eyes — stylized folklore monsters, not emoji or simple shapes.

export type BodyType =
  | 'wolf'
  | 'beast'
  | 'humanoid'
  | 'hag'
  | 'spectre'
  | 'blob'
  | 'dragon'
  | 'giant'
  | 'fish'
  | 'werewolf'
  | 'witch';

export interface CreatureDesc {
  body: BodyType;
  main: string;
  dark: string;
  light: string;
  eye: string;
  accent?: string;
  horns?: boolean;
}

export const CREATURES: Record<string, CreatureDesc> = {
  // player avatars
  player_vukodlak: { body: 'werewolf', main: '#5a4a3a', dark: '#2e251c', light: '#7d6850', eye: '#ffcf3a' },
  player_vjestica: { body: 'witch', main: '#3a2d45', dark: '#221a2a', light: '#5a4870', eye: '#9fe6c0', accent: '#c0405a' },

  // enemies
  drekavac: { body: 'spectre', main: '#b8c4cf', dark: '#6d7e8c', light: '#e8f0f5', eye: '#ff5a3a' },
  vodnjak: { body: 'fish', main: '#3f7a6e', dark: '#23463f', light: '#6db3a0', eye: '#d6f06a' },
  bauk: { body: 'beast', main: '#4a3c52', dark: '#261d2c', light: '#6a5675', eye: '#ff7a2a' },
  mora: { body: 'spectre', main: '#5a4570', dark: '#2f2340', light: '#8a6db0', eye: '#ff4a8a' },
  karakondzula: { body: 'humanoid', main: '#7a8fa8', dark: '#3f4d60', light: '#b4cee0', eye: '#6df0ff', horns: true },
  vuk: { body: 'wolf', main: '#6a6258', dark: '#393530', light: '#938a7c', eye: '#ffd23a' },
  senka: { body: 'blob', main: '#1c1822', dark: '#0c0a10', light: '#3a3346', eye: '#c04aff' },
  grobna_vjestica: { body: 'hag', main: '#5c6a3f', dark: '#323a22', light: '#869a5c', eye: '#e8f06a', accent: '#7a4a2a' },
  vampir: { body: 'humanoid', main: '#3a1f2a', dark: '#1e0f16', light: '#6a3548', eye: '#ff2a3a', accent: '#c0c0c8' },
  azdaja: { body: 'dragon', main: '#4a6a32', dark: '#26381a', light: '#7a9c4a', eye: '#ffae2a', horns: true },
  lesnik: { body: 'giant', main: '#5a4632', dark: '#2e241a', light: '#7d6444', eye: '#9fe06a' },
  babaroga: { body: 'hag', main: '#3a2c34', dark: '#1c151a', light: '#5a4550', eye: '#ff3a2a', accent: '#7a2a3a', horns: true },
};

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function eyes(
  ctx: CanvasRenderingContext2D,
  color: string,
  positions: [number, number][],
  rad: number,
  glow: number,
) {
  for (const [ex, ey] of positions) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 + glow * 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(ex, ey, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(ex - rad * 0.3, ey - rad * 0.3, rad * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// draw within a box of size S centered horizontally; baseline near bottom.
export function drawCreature(
  ctx: CanvasRenderingContext2D,
  key: string,
  S: number,
  t: number,
) {
  const d = CREATURES[key] ?? CREATURES.bauk;
  const cx = S / 2;
  const bob = Math.sin(t * 1.6) * S * 0.012;
  const glow = (Math.sin(t * 2.2) + 1) / 2;
  ctx.save();
  ctx.translate(0, bob);
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, S * 0.018);
  ctx.strokeStyle = 'rgba(8,7,10,0.9)';

  const u = S / 100; // unit

  const grad = (x: number, y: number, r: number) => {
    const g = ctx.createRadialGradient(x, y - r * 0.3, r * 0.2, x, y, r);
    g.addColorStop(0, d.light);
    g.addColorStop(0.55, d.main);
    g.addColorStop(1, d.dark);
    return g;
  };

  switch (d.body) {
    case 'wolf':
    case 'beast': {
      const lowH = d.body === 'beast' ? 30 : 24;
      // legs
      ctx.fillStyle = d.dark;
      for (const lx of [28, 44, 60, 72]) {
        rr(ctx, cx + (lx - 50) * u, (78 - 0) * u, 7 * u, (16 + lowH * 0) * u, 3 * u);
        ctx.fill();
      }
      // tail
      ctx.fillStyle = d.main;
      ctx.beginPath();
      ctx.moveTo(cx - 30 * u, 70 * u);
      ctx.quadraticCurveTo(cx - 48 * u, 62 * u, cx - 40 * u, 48 * u);
      ctx.quadraticCurveTo(cx - 34 * u, 58 * u, cx - 22 * u, 66 * u);
      ctx.fill();
      ctx.stroke();
      // body
      ctx.fillStyle = grad(cx, 64 * u, 40 * u);
      rr(ctx, cx - 32 * u, 50 * u, 60 * u, 32 * u, 16 * u);
      ctx.fill();
      ctx.stroke();
      // head
      ctx.fillStyle = grad(cx + 30 * u, 48 * u, 26 * u);
      ctx.beginPath();
      ctx.moveTo(cx + 18 * u, 40 * u);
      ctx.lineTo(cx + 52 * u, 36 * u);
      ctx.lineTo(cx + 58 * u, 52 * u);
      ctx.lineTo(cx + 40 * u, 60 * u);
      ctx.lineTo(cx + 18 * u, 58 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // ears
      ctx.fillStyle = d.dark;
      ctx.beginPath();
      ctx.moveTo(cx + 22 * u, 40 * u);
      ctx.lineTo(cx + 26 * u, 24 * u);
      ctx.lineTo(cx + 34 * u, 38 * u);
      ctx.fill();
      ctx.stroke();
      eyes(ctx, d.eye, [[cx + 44 * u, 46 * u]], 4 * u, glow);
      break;
    }
    case 'werewolf': {
      // upright wolf-man
      ctx.fillStyle = d.dark;
      rr(ctx, cx - 22 * u, 70 * u, 14 * u, 22 * u, 4 * u); // leg
      rr(ctx, cx + 8 * u, 70 * u, 14 * u, 22 * u, 4 * u);
      ctx.fill();
      // torso
      ctx.fillStyle = grad(cx, 50 * u, 40 * u);
      ctx.beginPath();
      ctx.moveTo(cx - 26 * u, 78 * u);
      ctx.lineTo(cx - 30 * u, 36 * u);
      ctx.quadraticCurveTo(cx, 22 * u, cx + 30 * u, 36 * u);
      ctx.lineTo(cx + 26 * u, 78 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // arms/claws
      ctx.strokeStyle = 'rgba(8,7,10,0.9)';
      ctx.fillStyle = d.main;
      rr(ctx, cx - 42 * u, 40 * u, 12 * u, 36 * u, 5 * u);
      ctx.fill();
      ctx.stroke();
      rr(ctx, cx + 30 * u, 40 * u, 12 * u, 36 * u, 5 * u);
      ctx.fill();
      ctx.stroke();
      // head (snout)
      ctx.fillStyle = grad(cx, 22 * u, 22 * u);
      ctx.beginPath();
      ctx.arc(cx, 22 * u, 16 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // ears
      ctx.fillStyle = d.dark;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + s * 10 * u, 10 * u);
        ctx.lineTo(cx + s * 16 * u, -6 * u);
        ctx.lineTo(cx + s * 20 * u, 12 * u);
        ctx.fill();
        ctx.stroke();
      }
      // snout
      ctx.fillStyle = d.light;
      rr(ctx, cx + 8 * u, 22 * u, 14 * u, 8 * u, 3 * u);
      ctx.fill();
      eyes(ctx, d.eye, [[cx - 6 * u, 18 * u], [cx + 6 * u, 18 * u]], 3.4 * u, glow);
      break;
    }
    case 'witch': {
      // cloaked witch with hat
      ctx.fillStyle = grad(cx, 60 * u, 46 * u);
      ctx.beginPath();
      ctx.moveTo(cx, 30 * u);
      ctx.lineTo(cx - 34 * u, 90 * u);
      ctx.lineTo(cx + 34 * u, 90 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // head
      ctx.fillStyle = d.light;
      ctx.beginPath();
      ctx.arc(cx, 26 * u, 13 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // hat
      ctx.fillStyle = d.dark;
      ctx.beginPath();
      ctx.moveTo(cx - 20 * u, 16 * u);
      ctx.lineTo(cx + 20 * u, 16 * u);
      ctx.lineTo(cx + 6 * u, -18 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      rr(ctx, cx - 24 * u, 14 * u, 48 * u, 6 * u, 3 * u);
      ctx.fill();
      ctx.stroke();
      // accent brooch
      if (d.accent) {
        ctx.fillStyle = d.accent;
        ctx.beginPath();
        ctx.arc(cx, 44 * u, 4 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      eyes(ctx, d.eye, [[cx - 5 * u, 26 * u], [cx + 5 * u, 26 * u]], 3 * u, glow);
      break;
    }
    case 'humanoid': {
      ctx.fillStyle = grad(cx, 58 * u, 44 * u);
      ctx.beginPath();
      ctx.moveTo(cx - 26 * u, 90 * u);
      ctx.lineTo(cx - 22 * u, 34 * u);
      ctx.quadraticCurveTo(cx, 24 * u, cx + 22 * u, 34 * u);
      ctx.lineTo(cx + 26 * u, 90 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // hood
      ctx.fillStyle = d.dark;
      ctx.beginPath();
      ctx.arc(cx, 28 * u, 18 * u, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      ctx.stroke();
      // face shadow
      ctx.fillStyle = '#0b0a0e';
      ctx.beginPath();
      ctx.arc(cx, 30 * u, 11 * u, 0, Math.PI * 2);
      ctx.fill();
      if (d.horns) {
        ctx.fillStyle = d.light;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx + s * 12 * u, 16 * u);
          ctx.quadraticCurveTo(cx + s * 24 * u, 2 * u, cx + s * 16 * u, -8 * u);
          ctx.quadraticCurveTo(cx + s * 18 * u, 6 * u, cx + s * 8 * u, 14 * u);
          ctx.fill();
          ctx.stroke();
        }
      }
      if (d.accent) {
        ctx.strokeStyle = d.accent;
        ctx.lineWidth = Math.max(1.5, S * 0.012);
        ctx.beginPath();
        ctx.moveTo(cx - 18 * u, 40 * u);
        ctx.lineTo(cx, 56 * u);
        ctx.lineTo(cx + 18 * u, 40 * u);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(8,7,10,0.9)';
        ctx.lineWidth = Math.max(2, S * 0.018);
      }
      eyes(ctx, d.eye, [[cx - 5 * u, 30 * u], [cx + 5 * u, 30 * u]], 3 * u, glow);
      break;
    }
    case 'hag': {
      // hunched crone
      ctx.fillStyle = grad(cx + 4 * u, 64 * u, 46 * u);
      ctx.beginPath();
      ctx.moveTo(cx - 30 * u, 90 * u);
      ctx.quadraticCurveTo(cx - 40 * u, 40 * u, cx - 4 * u, 34 * u);
      ctx.quadraticCurveTo(cx + 34 * u, 36 * u, cx + 30 * u, 90 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // head leaning forward
      ctx.fillStyle = d.light;
      ctx.beginPath();
      ctx.arc(cx - 10 * u, 26 * u, 14 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // nose
      ctx.fillStyle = d.main;
      ctx.beginPath();
      ctx.moveTo(cx - 22 * u, 24 * u);
      ctx.lineTo(cx - 34 * u, 32 * u);
      ctx.lineTo(cx - 20 * u, 32 * u);
      ctx.fill();
      ctx.stroke();
      if (d.horns) {
        ctx.fillStyle = d.dark;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx - 10 * u + s * 10 * u, 14 * u);
          ctx.lineTo(cx - 10 * u + s * 16 * u, -4 * u);
          ctx.lineTo(cx - 10 * u + s * 4 * u, 12 * u);
          ctx.fill();
          ctx.stroke();
        }
      }
      // staff
      if (d.accent) {
        ctx.strokeStyle = d.accent;
        ctx.lineWidth = Math.max(2.5, S * 0.022);
        ctx.beginPath();
        ctx.moveTo(cx + 30 * u, 20 * u);
        ctx.lineTo(cx + 34 * u, 92 * u);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(8,7,10,0.9)';
        ctx.lineWidth = Math.max(2, S * 0.018);
      }
      eyes(ctx, d.eye, [[cx - 14 * u, 24 * u], [cx - 6 * u, 24 * u]], 2.6 * u, glow);
      break;
    }
    case 'spectre': {
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = grad(cx, 40 * u, 40 * u);
      // wispy tattered body
      ctx.beginPath();
      ctx.moveTo(cx - 26 * u, 40 * u);
      ctx.quadraticCurveTo(cx - 30 * u, 8 * u, cx, 8 * u);
      ctx.quadraticCurveTo(cx + 30 * u, 8 * u, cx + 26 * u, 40 * u);
      const tails = 5;
      for (let i = 0; i <= tails; i++) {
        const tx = cx + 26 * u - (52 * u * i) / tails;
        const ty = 78 * u + Math.sin(t * 3 + i) * 8 * u;
        ctx.quadraticCurveTo(tx + 4 * u, 60 * u, tx, ty);
        ctx.quadraticCurveTo(tx - 4 * u, 60 * u, tx - (52 * u) / tails / 2, 56 * u);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
      // dark face hollow
      ctx.fillStyle = '#0b0a0e';
      ctx.beginPath();
      ctx.ellipse(cx, 30 * u, 12 * u, 14 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      eyes(ctx, d.eye, [[cx - 5 * u, 28 * u], [cx + 5 * u, 28 * u]], 3.2 * u, glow);
      // gaping mouth
      ctx.fillStyle = d.eye;
      ctx.globalAlpha = 0.5 + glow * 0.4;
      ctx.beginPath();
      ctx.ellipse(cx, 40 * u, 3 * u, 6 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'blob': {
      ctx.fillStyle = grad(cx, 60 * u, 46 * u);
      ctx.beginPath();
      const pts = 12;
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2;
        const wob = 1 + Math.sin(a * 3 + t * 2) * 0.08;
        const rx = 38 * u * wob;
        const ry = 34 * u * wob;
        const x = cx + Math.cos(a) * rx;
        const y = 56 * u + Math.sin(a) * ry;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      eyes(ctx, d.eye, [[cx - 10 * u, 50 * u], [cx + 12 * u, 54 * u]], 4 * u, glow);
      break;
    }
    case 'fish': {
      // hunched river spirit
      ctx.fillStyle = grad(cx, 56 * u, 44 * u);
      ctx.beginPath();
      ctx.ellipse(cx, 56 * u, 30 * u, 38 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // fins
      ctx.fillStyle = d.dark;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + s * 28 * u, 50 * u);
        ctx.lineTo(cx + s * 48 * u, 40 * u);
        ctx.lineTo(cx + s * 44 * u, 64 * u);
        ctx.fill();
        ctx.stroke();
      }
      // crown of reeds
      ctx.strokeStyle = d.light;
      ctx.lineWidth = Math.max(1.5, S * 0.012);
      for (const s of [-12, 0, 12]) {
        ctx.beginPath();
        ctx.moveTo(cx + s * u, 26 * u);
        ctx.lineTo(cx + s * u + Math.sin(t) * 4 * u, 6 * u);
        ctx.stroke();
      }
      ctx.lineWidth = Math.max(2, S * 0.018);
      ctx.strokeStyle = 'rgba(8,7,10,0.9)';
      eyes(ctx, d.eye, [[cx - 9 * u, 44 * u], [cx + 9 * u, 44 * u]], 4 * u, glow);
      // frown
      ctx.strokeStyle = '#0b0a0e';
      ctx.beginPath();
      ctx.arc(cx, 64 * u, 8 * u, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      break;
    }
    case 'dragon': {
      // body
      ctx.fillStyle = grad(cx, 64 * u, 40 * u);
      rr(ctx, cx - 26 * u, 54 * u, 52 * u, 34 * u, 14 * u);
      ctx.fill();
      ctx.stroke();
      // wings
      ctx.fillStyle = d.dark;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + s * 18 * u, 56 * u);
        ctx.lineTo(cx + s * 52 * u, 30 * u);
        ctx.lineTo(cx + s * 46 * u, 58 * u);
        ctx.lineTo(cx + s * 56 * u, 56 * u);
        ctx.lineTo(cx + s * 30 * u, 70 * u);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      // three necks/heads
      for (const s of [-16, 0, 16]) {
        ctx.fillStyle = grad(cx + s * u, 30 * u, 16 * u);
        ctx.beginPath();
        ctx.moveTo(cx + s * u - 6 * u, 56 * u);
        ctx.lineTo(cx + s * u - 5 * u, 24 * u);
        ctx.lineTo(cx + s * u + 5 * u, 24 * u);
        ctx.lineTo(cx + s * u + 6 * u, 56 * u);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + s * u, 22 * u, 8 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        eyes(ctx, d.eye, [[cx + s * u, 20 * u]], 2.4 * u, glow);
      }
      break;
    }
    case 'giant': {
      // bark-skinned forest giant
      ctx.fillStyle = grad(cx, 56 * u, 50 * u);
      ctx.beginPath();
      ctx.moveTo(cx - 30 * u, 92 * u);
      ctx.lineTo(cx - 26 * u, 30 * u);
      ctx.quadraticCurveTo(cx, 18 * u, cx + 26 * u, 30 * u);
      ctx.lineTo(cx + 30 * u, 92 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // arms
      ctx.fillStyle = d.main;
      rr(ctx, cx - 46 * u, 34 * u, 16 * u, 50 * u, 7 * u);
      ctx.fill();
      ctx.stroke();
      rr(ctx, cx + 30 * u, 34 * u, 16 * u, 50 * u, 7 * u);
      ctx.fill();
      ctx.stroke();
      // bark cracks
      ctx.strokeStyle = d.dark;
      ctx.lineWidth = Math.max(1.5, S * 0.01);
      for (const oy of [44, 58, 72]) {
        ctx.beginPath();
        ctx.moveTo(cx - 16 * u, oy * u);
        ctx.lineTo(cx + 10 * u, (oy + 6) * u);
        ctx.stroke();
      }
      ctx.lineWidth = Math.max(2, S * 0.018);
      ctx.strokeStyle = 'rgba(8,7,10,0.9)';
      // head
      ctx.fillStyle = grad(cx, 22 * u, 18 * u);
      ctx.beginPath();
      ctx.arc(cx, 22 * u, 15 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // antlers
      ctx.strokeStyle = d.light;
      ctx.lineWidth = Math.max(2, S * 0.014);
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + s * 8 * u, 12 * u);
        ctx.lineTo(cx + s * 18 * u, -4 * u);
        ctx.moveTo(cx + s * 14 * u, 2 * u);
        ctx.lineTo(cx + s * 24 * u, 0 * u);
        ctx.stroke();
      }
      ctx.lineWidth = Math.max(2, S * 0.018);
      ctx.strokeStyle = 'rgba(8,7,10,0.9)';
      eyes(ctx, d.eye, [[cx - 6 * u, 22 * u], [cx + 6 * u, 22 * u]], 3 * u, glow);
      break;
    }
  }
  ctx.restore();
}
