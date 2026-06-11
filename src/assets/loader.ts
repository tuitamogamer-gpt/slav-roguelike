// ============================================================
// Asset loader with graceful fallback.
//
// If a PNG exists at the expected path under /public/assets/, components
// use it; otherwise they fall back to the built-in procedural canvas art.
// The game is fully playable with zero image files present.
//
// Drop generated images into:
//   public/assets/sprites/{creatureKey}.png   (e.g. player_vukodlak.png, babaroga.png)
//   public/assets/cards/{cardId}.png          (e.g. ugriz.png, v_uros.png)
//   public/assets/relics/{relicId}.png        (e.g. pasje_srce.png)
//   public/assets/potions/{potionId}.png      (e.g. napitak_snage.png)
//   public/assets/bg/{world}.png              (jav.png, prav.png, nav.png)
//
// Filenames match the IDs used in image-prompts.md.
// ============================================================

import { useEffect, useState } from 'react';

const BASE = import.meta.env.BASE_URL || '/';

// module-level cache so a missing/loaded asset is probed only once per session
const cache = new Map<string, HTMLImageElement | null>();

export function assetUrl(rel: string): string {
  return `${BASE}assets/${rel}`.replace(/([^:])\/{2,}/g, '$1/');
}

export const spriteRel = (key: string) => `sprites/${key}.webp`;
export const cardRel = (id: string) => `cards/${id}.webp`;
export const relicRel = (id: string) => `relics/${id}.webp`;
export const potionRel = (id: string) => `potions/${id}.webp`;
export const bgRel = (world: string) => `bg/${world}.webp`;

/**
 * Returns a loaded HTMLImageElement for the asset, or null if it does not
 * exist (or has not loaded yet). Probes each URL at most once per session.
 */
export function useGameImage(rel: string | null): HTMLImageElement | null {
  const url = rel ? assetUrl(rel) : null;
  const [img, setImg] = useState<HTMLImageElement | null>(() =>
    url && cache.has(url) ? cache.get(url)! : null,
  );

  useEffect(() => {
    if (!url) {
      setImg(null);
      return;
    }
    if (cache.has(url)) {
      setImg(cache.get(url)!);
      return;
    }
    let alive = true;
    const im = new Image();
    im.onload = () => {
      cache.set(url, im);
      if (alive) setImg(im);
    };
    im.onerror = () => {
      cache.set(url, null);
      if (alive) setImg(null);
    };
    im.src = url;
    return () => {
      alive = false;
    };
  }, [url]);

  return img;
}
