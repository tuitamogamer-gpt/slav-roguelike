// Small canvas medallions for relics and flasks for potions.

const RARITY_RING: Record<string, string> = {
  cesta: '#9a8c6a',
  neobicna: '#6db3c8',
  rijetka: '#d4af37',
  posebna: '#c04aff',
};

export function drawRelicIcon(
  ctx: CanvasRenderingContext2D,
  sprite: string,
  size: number,
  rarity = 'cesta',
) {
  const s = size;
  const c = s / 2;
  ctx.clearRect(0, 0, s, s);
  // medallion base
  const g = ctx.createRadialGradient(c, c * 0.7, s * 0.1, c, c, c);
  g.addColorStop(0, '#3a3120');
  g.addColorStop(1, '#1a160e');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(c, c, c - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.strokeStyle = RARITY_RING[rarity] ?? '#9a8c6a';
  ctx.stroke();

  ctx.save();
  ctx.translate(c, c);
  const u = s / 100;
  ctx.lineWidth = Math.max(1.5, s * 0.03);
  ctx.strokeStyle = '#e8dcc0';
  ctx.fillStyle = '#e8dcc0';
  const glyph = GLYPH[sprite] ?? 'rune';
  drawGlyph(ctx, glyph, u);
  ctx.restore();
}

const GLYPH: Record<string, string> = {
  heart: 'heart',
  wildheart: 'heart',
  pelt: 'pelt',
  stone: 'stone',
  rune: 'rune',
  cloth: 'weave',
  amulet: 'eye',
  rooster: 'feather',
  hen: 'feather',
  anvil: 'anvil',
  thorn: 'thorn',
  goldtooth: 'tooth',
  fang: 'tooth',
  bag: 'bag',
  paw: 'paw',
  horn: 'horn',
  coal: 'flame',
  sun: 'sun',
  skull: 'skull',
  apple: 'apple',
};

function drawGlyph(ctx: CanvasRenderingContext2D, glyph: string, u: number) {
  const fill = () => ctx.fill();
  const stroke = () => ctx.stroke();
  switch (glyph) {
    case 'heart':
      ctx.fillStyle = '#c0405a';
      ctx.beginPath();
      ctx.moveTo(0, 22 * u);
      ctx.bezierCurveTo(-26 * u, 0, -14 * u, -22 * u, 0, -8 * u);
      ctx.bezierCurveTo(14 * u, -22 * u, 26 * u, 0, 0, 22 * u);
      fill();
      break;
    case 'flame':
      ctx.fillStyle = '#e07b2c';
      ctx.beginPath();
      ctx.moveTo(0, 24 * u);
      ctx.quadraticCurveTo(-20 * u, 6 * u, -6 * u, -8 * u);
      ctx.quadraticCurveTo(-4 * u, -22 * u, 6 * u, -24 * u);
      ctx.quadraticCurveTo(2 * u, -10 * u, 12 * u, -6 * u);
      ctx.quadraticCurveTo(22 * u, 8 * u, 0, 24 * u);
      fill();
      break;
    case 'sun':
      ctx.fillStyle = '#f4d160';
      ctx.beginPath();
      ctx.arc(0, 0, 12 * u, 0, Math.PI * 2);
      fill();
      ctx.strokeStyle = '#f4d160';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 16 * u, Math.sin(a) * 16 * u);
        ctx.lineTo(Math.cos(a) * 24 * u, Math.sin(a) * 24 * u);
        stroke();
      }
      break;
    case 'skull':
      ctx.beginPath();
      ctx.arc(0, -4 * u, 16 * u, 0, Math.PI * 2);
      fill();
      ctx.fillRect(-10 * u, 6 * u, 20 * u, 12 * u);
      ctx.fillStyle = '#1a160e';
      ctx.beginPath();
      ctx.arc(-6 * u, -4 * u, 4 * u, 0, Math.PI * 2);
      ctx.arc(6 * u, -4 * u, 4 * u, 0, Math.PI * 2);
      fill();
      break;
    case 'apple':
      ctx.fillStyle = '#f4d160';
      ctx.beginPath();
      ctx.arc(0, 4 * u, 16 * u, 0, Math.PI * 2);
      fill();
      ctx.strokeStyle = '#6a8c3f';
      ctx.beginPath();
      ctx.moveTo(0, -10 * u);
      ctx.lineTo(0, -20 * u);
      stroke();
      break;
    case 'tooth':
      ctx.beginPath();
      ctx.moveTo(-12 * u, -16 * u);
      ctx.lineTo(12 * u, -16 * u);
      ctx.lineTo(6 * u, 22 * u);
      ctx.lineTo(0, 8 * u);
      ctx.lineTo(-6 * u, 22 * u);
      ctx.closePath();
      fill();
      break;
    case 'horn':
      ctx.beginPath();
      ctx.moveTo(-16 * u, 18 * u);
      ctx.quadraticCurveTo(20 * u, 16 * u, 14 * u, -20 * u);
      ctx.quadraticCurveTo(2 * u, 4 * u, -16 * u, 18 * u);
      fill();
      break;
    case 'thorn':
      ctx.strokeStyle = '#9fc25a';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, 22 * u);
        ctx.lineTo(0, -22 * u);
        ctx.moveTo(0, -6 * u);
        ctx.lineTo(s * 14 * u, -16 * u);
        ctx.moveTo(0, 6 * u);
        ctx.lineTo(s * 14 * u, -2 * u);
        stroke();
      }
      break;
    case 'eye':
      ctx.beginPath();
      ctx.ellipse(0, 0, 20 * u, 12 * u, 0, 0, Math.PI * 2);
      stroke();
      ctx.fillStyle = '#6db3c8';
      ctx.beginPath();
      ctx.arc(0, 0, 6 * u, 0, Math.PI * 2);
      fill();
      break;
    case 'paw':
      ctx.beginPath();
      ctx.arc(0, 6 * u, 11 * u, 0, Math.PI * 2);
      fill();
      for (const dx of [-12, -4, 4, 12]) {
        ctx.beginPath();
        ctx.arc(dx * u, -12 * u, 4 * u, 0, Math.PI * 2);
        fill();
      }
      break;
    case 'anvil':
      ctx.fillRect(-18 * u, -4 * u, 36 * u, 10 * u);
      ctx.fillRect(-8 * u, 6 * u, 16 * u, 12 * u);
      ctx.beginPath();
      ctx.moveTo(-18 * u, -4 * u);
      ctx.lineTo(-24 * u, -12 * u);
      ctx.lineTo(-10 * u, -4 * u);
      fill();
      break;
    case 'feather':
      ctx.beginPath();
      ctx.ellipse(0, 0, 8 * u, 22 * u, 0, 0, Math.PI * 2);
      fill();
      ctx.strokeStyle = '#1a160e';
      ctx.beginPath();
      ctx.moveTo(0, -20 * u);
      ctx.lineTo(0, 20 * u);
      stroke();
      break;
    case 'bag':
      ctx.beginPath();
      ctx.moveTo(-16 * u, 22 * u);
      ctx.quadraticCurveTo(-22 * u, -10 * u, 0, -14 * u);
      ctx.quadraticCurveTo(22 * u, -10 * u, 16 * u, 22 * u);
      ctx.closePath();
      fill();
      ctx.strokeStyle = '#1a160e';
      ctx.beginPath();
      ctx.moveTo(-16 * u, -2 * u);
      ctx.lineTo(16 * u, -2 * u);
      stroke();
      break;
    case 'pelt':
      ctx.beginPath();
      ctx.moveTo(0, -20 * u);
      ctx.quadraticCurveTo(24 * u, -8 * u, 16 * u, 22 * u);
      ctx.quadraticCurveTo(0, 12 * u, -16 * u, 22 * u);
      ctx.quadraticCurveTo(-24 * u, -8 * u, 0, -20 * u);
      fill();
      break;
    case 'weave':
      ctx.strokeStyle = '#e8dcc0';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 8 * u, -20 * u);
        ctx.lineTo(i * 8 * u, 20 * u);
        ctx.moveTo(-20 * u, i * 8 * u);
        ctx.lineTo(20 * u, i * 8 * u);
        stroke();
      }
      break;
    case 'stone':
      ctx.beginPath();
      ctx.moveTo(-16 * u, 8 * u);
      ctx.lineTo(-8 * u, -16 * u);
      ctx.lineTo(12 * u, -12 * u);
      ctx.lineTo(18 * u, 6 * u);
      ctx.lineTo(4 * u, 18 * u);
      ctx.closePath();
      fill();
      break;
    case 'rune':
    default:
      ctx.beginPath();
      ctx.moveTo(0, -20 * u);
      ctx.lineTo(0, 20 * u);
      ctx.moveTo(0, -10 * u);
      ctx.lineTo(14 * u, -20 * u);
      ctx.moveTo(0, 6 * u);
      ctx.lineTo(-14 * u, 18 * u);
      stroke();
      break;
  }
}

export function drawPotion(ctx: CanvasRenderingContext2D, color: string, size: number) {
  const s = size;
  ctx.clearRect(0, 0, s, s);
  const c = s / 2;
  const u = s / 100;
  // flask body
  ctx.fillStyle = 'rgba(220,220,230,0.18)';
  ctx.strokeStyle = '#cfc8b8';
  ctx.lineWidth = Math.max(2, s * 0.03);
  ctx.beginPath();
  ctx.moveTo(c - 14 * u, c - 28 * u);
  ctx.lineTo(c - 14 * u, c - 8 * u);
  ctx.quadraticCurveTo(c - 26 * u, c + 4 * u, c - 22 * u, c + 24 * u);
  ctx.quadraticCurveTo(c, c + 38 * u, c + 22 * u, c + 24 * u);
  ctx.quadraticCurveTo(c + 26 * u, c + 4 * u, c + 14 * u, c - 8 * u);
  ctx.lineTo(c + 14 * u, c - 28 * u);
  ctx.stroke();
  // liquid
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(c - 18 * u, c + 2 * u);
  ctx.quadraticCurveTo(c - 24 * u, c + 6 * u, c - 20 * u, c + 22 * u);
  ctx.quadraticCurveTo(c, c + 34 * u, c + 20 * u, c + 22 * u);
  ctx.quadraticCurveTo(c + 24 * u, c + 6 * u, c + 18 * u, c + 2 * u);
  ctx.closePath();
  ctx.clip();
  const g = ctx.createLinearGradient(0, c, 0, c + 34 * u);
  g.addColorStop(0, color);
  g.addColorStop(1, '#000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  ctx.restore();
  // cork
  ctx.fillStyle = '#6e5a3a';
  ctx.fillRect(c - 10 * u, c - 36 * u, 20 * u, 10 * u);
  // shine
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(c - 8 * u, c + 8 * u, 3 * u, 8 * u, -0.3, 0, Math.PI * 2);
  ctx.fill();
}
