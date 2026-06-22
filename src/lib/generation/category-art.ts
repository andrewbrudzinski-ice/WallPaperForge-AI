import type { WallpaperCategory } from "@/types";

/**
 * Procedural art definitions for category thumbnails. Each category maps to a
 * "motif" (a small illustrated scene) plus a color pair. The renderer
 * (CategoryArt.tsx) draws a self-contained SVG from these — deterministic, so
 * server and client produce identical markup (no hydration mismatch) and no
 * API calls are needed for a rich, designed-looking grid.
 */

export type Motif =
  | "cosmos"
  | "peaks"
  | "skyline"
  | "waves"
  | "orb"
  | "motion";

export interface CategoryArtSpec {
  motif: Motif;
  /** [deep background, bright accent] */
  colors: [string, string];
}

export const CATEGORY_ART: Record<WallpaperCategory, CategoryArtSpec> = {
  Cyberpunk: { motif: "skyline", colors: ["#220a3f", "#ff2e97"] },
  Nature: { motif: "peaks", colors: ["#08311f", "#34d17a"] },
  Space: { motif: "cosmos", colors: ["#0a0a2e", "#8a5cff"] },
  Fantasy: { motif: "cosmos", colors: ["#2a0a3a", "#ff6a88"] },
  Mountains: { motif: "peaks", colors: ["#15263a", "#6aa6cf"] },
  Cities: { motif: "skyline", colors: ["#0f1226", "#8a90c8"] },
  Minimalist: { motif: "orb", colors: ["#1a1d27", "#c2cbe6"] },
  "Anime-inspired": { motif: "cosmos", colors: ["#3a1648", "#ffb3c6"] },
  "Sci-fi": { motif: "skyline", colors: ["#001230", "#00c6ff"] },
  Abstract: { motif: "waves", colors: ["#260a40", "#5f7bff"] },
  Cars: { motif: "motion", colors: ["#0a0e16", "#4f8fd1"] },
  Sports: { motif: "motion", colors: ["#3a2600", "#ffd200"] },
  Ocean: { motif: "waves", colors: ["#062a3e", "#2bd0e0"] },
  "Fire & Ice": { motif: "waves", colors: ["#2a0a0a", "#36a8ff"] },
  Neon: { motif: "skyline", colors: ["#1a0533", "#00f2fe"] },
  Gaming: { motif: "skyline", colors: ["#1c0640", "#c062c0"] },
};

/** Tiny seeded PRNG (mulberry32) for stable, deterministic placement. */
export function seededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function categoryArt(category: WallpaperCategory): CategoryArtSpec {
  return CATEGORY_ART[category];
}
