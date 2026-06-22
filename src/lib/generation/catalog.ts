import type { Complexity, Mood, WallpaperCategory } from "@/types";

/**
 * Static creative catalog used by the random + surprise generators and by the
 * UI selectors. Kept in one place so the options shown to users and the
 * prompts produced server-side never drift apart.
 */

export const CATEGORIES: WallpaperCategory[] = [
  "Space",
  "Fantasy",
  "Cyberpunk",
  "Nature",
  "Mountains",
  "Cities",
  "Minimalist",
  "Anime-inspired",
  "Sci-fi",
  "Abstract",
  "Cars",
  "Sports",
  "Ocean",
  "Fire & Ice",
  "Neon",
  "Gaming",
];

/** Seed ideas per category — the random generator stitches these together. */
export const CATEGORY_IDEAS: Record<WallpaperCategory, string[]> = {
  Space: [
    "a swirling spiral galaxy in deep violet and teal",
    "a ringed gas giant rising over a barren moon",
    "a nebula nursery glowing with newborn stars",
    "an astronaut drifting beside a glowing wormhole",
  ],
  Fantasy: [
    "an ancient dragon coiled around a crystal spire",
    "a floating elven city wreathed in mist",
    "a glowing enchanted forest with bioluminescent flora",
    "a lone knight before a colossal stone gate",
  ],
  Cyberpunk: [
    "a rain-slicked neon megacity at midnight",
    "a holographic samurai in a crowded night market",
    "a chrome motorcycle under flickering neon signs",
    "a towering arcology pierced by skybridges",
  ],
  Nature: [
    "a misty redwood forest at golden hour",
    "a tranquil waterfall into a turquoise pool",
    "a field of wildflowers under drifting clouds",
    "a fox standing in a frost-covered meadow",
  ],
  Mountains: [
    "snow-capped peaks under a sea of stars",
    "an alpine lake mirroring jagged ridgelines",
    "a lone cabin beneath towering granite cliffs",
    "sunrise breaking over a misty mountain valley",
  ],
  Cities: [
    "a sweeping skyline at blue hour with light trails",
    "a rooftop view over a glowing financial district",
    "a foggy bridge fading into a luminous downtown",
    "an aerial grid of city lights at night",
  ],
  Minimalist: [
    "a single gradient orb on a matte backdrop",
    "soft overlapping pastel shapes",
    "a thin golden line dividing two muted fields",
    "a calm duotone gradient with subtle grain",
  ],
  "Anime-inspired": [
    "a girl on a hill watching a vast sunset sky",
    "a quiet rainy street with glowing lanterns",
    "cherry blossoms swirling around a shrine gate",
    "a dramatic cloudscape with a soaring figure",
  ],
  "Sci-fi": [
    "a sleek starship docking at an orbital ring",
    "a terraformed colony beneath twin suns",
    "a glowing reactor core in a vast hangar",
    "an explorer overlooking an alien canyon",
  ],
  Abstract: [
    "flowing liquid metal ribbons",
    "fractal geometry in iridescent tones",
    "smoky color clouds blending into darkness",
    "crystalline shards refracting colored light",
  ],
  Cars: [
    "a supercar drifting through neon-lit rain",
    "a vintage roadster on a coastal highway at dusk",
    "a matte black hypercar in a concrete studio",
    "headlights streaking through a midnight tunnel",
  ],
  Sports: [
    "a basketball mid-arc against stadium lights",
    "a sprinter exploding off the blocks",
    "a surfer carving a glowing barrel wave",
    "a football stadium under dramatic floodlights",
  ],
  Ocean: [
    "a bioluminescent shoreline at night",
    "a humpback whale gliding through sunbeams",
    "a glassy turquoise reef from above",
    "a towering wave curling in slow motion",
  ],
  "Fire & Ice": [
    "a landscape split between molten lava and glacier",
    "a phoenix rising from frost and embers",
    "swirling flames meeting crystalline ice",
    "a volcano erupting beside a frozen lake",
  ],
  Neon: [
    "glowing neon tubes bent into abstract waves",
    "a synthwave sun over a neon grid horizon",
    "electric pink and cyan light streaks",
    "a glowing neon palm on a dark gradient",
  ],
  Gaming: [
    "an epic fantasy battlefield at dawn",
    "a neon esports arena bathed in stage light",
    "a heroic figure overlooking a ruined kingdom",
    "a glowing loot chest in a mystic dungeon",
  ],
};

export const MOODS: Mood[] = [
  "Relaxing",
  "Energetic",
  "Dark",
  "Mysterious",
  "Epic",
  "Luxury",
  "Futuristic",
];

export const MOOD_DESCRIPTORS: Record<Mood, string> = {
  Relaxing: "calm, soft, soothing, gentle light, spacious composition",
  Energetic: "vibrant, dynamic, high-contrast, motion and energy",
  Dark: "moody, low-key lighting, deep shadows, dramatic atmosphere",
  Mysterious: "enigmatic, foggy, atmospheric, hidden depth",
  Epic: "grand scale, cinematic, sweeping vistas, heroic",
  Luxury: "opulent, refined, gold and black, premium materials",
  Futuristic: "sleek, advanced technology, clean lines, glowing accents",
};

export const PALETTES: string[] = [
  "Black & Gold",
  "Midnight Blue",
  "Neon Pink & Cyan",
  "Emerald & Teal",
  "Sunset Orange",
  "Monochrome",
  "Pastel Dream",
  "Deep Purple",
  "Crimson & Ember",
  "Ice & Silver",
];

export const STYLES: string[] = [
  "Photorealistic",
  "Digital Painting",
  "3D Render",
  "Cinematic",
  "Watercolor",
  "Synthwave",
  "Low Poly",
  "Concept Art",
  "Surreal",
];

export const COMPLEXITIES: Complexity[] = [
  "Minimal",
  "Balanced",
  "Detailed",
  "Maximal",
];

export const COMPLEXITY_DESCRIPTORS: Record<Complexity, string> = {
  Minimal: "very simple, lots of negative space, a single clear focal element",
  Balanced: "moderate detail with a clear focal subject and clean background",
  Detailed: "rich detail and texture while keeping a readable focal point",
  Maximal: "intricate, highly detailed, layered composition",
};

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Fully-randomized Surprise Me settings for the one-tap home action. */
export function randomSurprise(): import("@/types").SurpriseOptions {
  return {
    mood: pick(MOODS),
    palette: pick(PALETTES),
    style: pick(STYLES),
    complexity: pick(COMPLEXITIES),
  };
}
