// Resize + convert public/assets PNGs to WebP, then remove the originals.
// Display sizes in-game are small, so we downscale aggressively per category.
import sharp from 'sharp';
import { readdir, unlink, stat } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('../public/assets/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

// max width per category (display size ×2-3 for retina headroom)
const PLAN = {
  sprites: { width: 512, quality: 82 },
  cards: { width: 512, quality: 80 },
  relics: { width: 192, quality: 82 },
  potions: { width: 160, quality: 82 },
  bg: { width: 1920, quality: 72 },
};

let before = 0;
let after = 0;

for (const [dir, opts] of Object.entries(PLAN)) {
  const folder = join(ROOT, dir);
  let files;
  try {
    files = await readdir(folder);
  } catch {
    continue;
  }
  for (const f of files) {
    if (!f.endsWith('.png')) continue;
    const src = join(folder, f);
    const out = join(folder, f.replace(/\.png$/, '.webp'));
    const s = await stat(src);
    before += s.size;
    await sharp(src)
      .resize({ width: opts.width, withoutEnlargement: true })
      .webp({ quality: opts.quality })
      .toFile(out);
    const o = await stat(out);
    after += o.size;
    await unlink(src);
  }
  console.log(`${dir}: done`);
}

console.log(`BEFORE: ${(before / 1024 / 1024).toFixed(1)} MB`);
console.log(`AFTER:  ${(after / 1024 / 1024).toFixed(1)} MB`);
