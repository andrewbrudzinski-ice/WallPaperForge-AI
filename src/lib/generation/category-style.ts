import type { WallpaperCategory } from "@/types";

/**
 * Visual identity for each wallpaper category — a CSS gradient "thumbnail" and
 * an emoji glyph. Used by the home-screen style cards so every category has a
 * beautiful, instant, zero-cost preview (no API calls needed to render the
 * grid). Tapping a card still triggers a real generation.
 */
export interface CategoryStyle {
  gradient: string;
  glyph: string;
  /** Short evocative tagline shown under the name. */
  tagline: string;
}

export const CATEGORY_STYLES: Record<WallpaperCategory, CategoryStyle> = {
  Cyberpunk: {
    gradient: "linear-gradient(135deg,#ff2e97 0%,#7a00ff 45%,#00e5ff 100%)",
    glyph: "🌃",
    tagline: "Neon & chrome",
  },
  Nature: {
    gradient: "linear-gradient(135deg,#0fd850 0%,#0b8793 100%)",
    glyph: "🌿",
    tagline: "Calm & green",
  },
  Space: {
    gradient: "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#7b4397 100%)",
    glyph: "🪐",
    tagline: "Cosmic depths",
  },
  Fantasy: {
    gradient: "linear-gradient(135deg,#8e2de2 0%,#ff6a88 100%)",
    glyph: "🐉",
    tagline: "Myth & magic",
  },
  Mountains: {
    gradient: "linear-gradient(135deg,#283e51 0%,#4b79a1 100%)",
    glyph: "🏔️",
    tagline: "Peaks & sky",
  },
  Cities: {
    gradient: "linear-gradient(135deg,#1f1c2c 0%,#928dab 100%)",
    glyph: "🌆",
    tagline: "Skylines",
  },
  Minimalist: {
    gradient: "linear-gradient(135deg,#e0eafc 0%,#9aa7c7 100%)",
    glyph: "◻️",
    tagline: "Less is more",
  },
  "Anime-inspired": {
    gradient: "linear-gradient(135deg,#ff9a9e 0%,#fad0c4 50%,#a18cd1 100%)",
    glyph: "🌸",
    tagline: "Dreamy scenes",
  },
  "Sci-fi": {
    gradient: "linear-gradient(135deg,#00c6ff 0%,#0072ff 100%)",
    glyph: "🚀",
    tagline: "Future worlds",
  },
  Abstract: {
    gradient: "linear-gradient(135deg,#fc466b 0%,#3f5efb 100%)",
    glyph: "🌀",
    tagline: "Pure form",
  },
  Cars: {
    gradient: "linear-gradient(135deg,#141e30 0%,#243b55 100%)",
    glyph: "🏎️",
    tagline: "Speed & steel",
  },
  Sports: {
    gradient: "linear-gradient(135deg,#f7971e 0%,#ffd200 100%)",
    glyph: "⚡",
    tagline: "In motion",
  },
  Ocean: {
    gradient: "linear-gradient(135deg,#2193b0 0%,#6dd5ed 100%)",
    glyph: "🌊",
    tagline: "Deep blue",
  },
  "Fire & Ice": {
    gradient: "linear-gradient(135deg,#f12711 0%,#1fa2ff 100%)",
    glyph: "🔥",
    tagline: "Hot meets cold",
  },
  Neon: {
    gradient: "linear-gradient(135deg,#f857a6 0%,#ff5858 50%,#00f2fe 100%)",
    glyph: "💜",
    tagline: "Electric glow",
  },
  Gaming: {
    gradient: "linear-gradient(135deg,#5f0a87 0%,#a4508b 60%,#ffd86f 100%)",
    glyph: "🎮",
    tagline: "Epic quests",
  },
};

/** Categories surfaced as large cards on the home screen, in priority order. */
export const FEATURED_CATEGORIES: WallpaperCategory[] = [
  "Cyberpunk",
  "Nature",
  "Space",
  "Fantasy",
  "Sports",
  "Gaming",
  "Minimalist",
  "Neon",
  "Cities",
  "Ocean",
  "Abstract",
  "Sci-fi",
];

export function categoryStyle(category: WallpaperCategory): CategoryStyle {
  return CATEGORY_STYLES[category];
}
