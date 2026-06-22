// ─────────────────────────────────────────────────────────────
// Core domain types for WallpaperForge AI
// ─────────────────────────────────────────────────────────────

export type Manufacturer =
  | "Apple"
  | "Samsung"
  | "Google Pixel"
  | "OnePlus"
  | "Motorola"
  | "Other";

/**
 * A rectangular region of the screen expressed as fractions (0..1) of the
 * full device resolution. This keeps zones resolution-independent so the
 * same definitions scale to any preview size.
 */
export interface NormalizedRect {
  /** Left edge, 0 (left) .. 1 (right). */
  x: number;
  /** Top edge, 0 (top) .. 1 (bottom). */
  y: number;
  /** Width as a fraction of screen width. */
  width: number;
  /** Height as a fraction of screen height. */
  height: number;
}

export type CutoutType =
  | "dynamic-island"
  | "notch"
  | "punch-hole"
  | "pill"
  | "none";

export interface ScreenCutout {
  type: CutoutType;
  /** Normalized rectangle describing the physical cutout. */
  rect: NormalizedRect;
}

/**
 * The complete set of compositional constraints for a device. Every zone is
 * normalized so it can be rendered at any size and translated into the AI
 * prompt without device-specific math elsewhere.
 */
export interface SafeZoneProfile {
  /** Camera cutout(s) physically punched into the display. */
  cutouts: ScreenCutout[];
  /** Lock-screen clock region — keep this visually clean. */
  lockClock: NormalizedRect;
  /** Lock-screen widget row (iOS) / at-a-glance area (Android). */
  lockWidgets: NormalizedRect;
  /** Home-screen app icon grid — busy foreground here hurts legibility. */
  homeIcons: NormalizedRect;
  /** System status bar height region. */
  statusBar: NormalizedRect;
  /**
   * The recommended region for the focal subject. The optimization engine
   * steers the AI to keep the main subject inside this band.
   */
  focalSafeZone: NormalizedRect;
}

export interface DeviceProfile {
  id: string;
  manufacturer: Manufacturer;
  model: string;
  /** Marketing / display name shown in the UI. */
  displayName: string;
  /** Native screen width in physical pixels. */
  width: number;
  /** Native screen height in physical pixels. */
  height: number;
  /** Aspect ratio string, e.g. "19.5:9". */
  aspectRatio: string;
  /** Numeric aspect ratio (height / width) for layout math. */
  aspectRatioValue: number;
  /** Release year — used for sorting "recent" devices first. */
  releaseYear: number;
  safeZones: SafeZoneProfile;
}

// ─────────────────────────────────────────────────────────────
// Generation
// ─────────────────────────────────────────────────────────────

export type GenerationMode = "random" | "prompt" | "surprise";

export type WallpaperCategory =
  | "Space"
  | "Fantasy"
  | "Cyberpunk"
  | "Nature"
  | "Mountains"
  | "Cities"
  | "Minimalist"
  | "Anime-inspired"
  | "Sci-fi"
  | "Abstract"
  | "Cars"
  | "Sports"
  | "Ocean"
  | "Fire & Ice"
  | "Neon"
  | "Gaming";

export type Mood =
  | "Relaxing"
  | "Energetic"
  | "Dark"
  | "Mysterious"
  | "Epic"
  | "Luxury"
  | "Futuristic";

export type Complexity = "Minimal" | "Balanced" | "Detailed" | "Maximal";

export interface SurpriseOptions {
  mood: Mood;
  palette: string;
  style: string;
  complexity: Complexity;
}

export interface GenerateRequest {
  mode: GenerationMode;
  device: DeviceProfile;
  /** User-supplied prompt for `prompt` mode. */
  prompt?: string;
  /** Category for `random` mode (omit to pick at random server-side). */
  category?: WallpaperCategory;
  /** Surprise-mode knobs. */
  surprise?: SurpriseOptions;
  /** Premium tier unlocks 4K output. */
  highRes?: boolean;
  /** When set, produce N stylistic variations of a base concept. */
  variationOf?: string;
  /** User-selected image provider; falls back to the env default if omitted. */
  provider?: ProviderId;
}

/** Available image-generation backends (mirrors the provider registry). */
export type ProviderId = "openai" | "gemini" | "stability" | "mock";

export interface GeneratedWallpaper {
  id: string;
  /** Public URL or data URL for the rendered image. */
  imageUrl: string;
  /** The user-facing description of what was generated. */
  description: string;
  /** The fully enhanced prompt actually sent to the model (server-side). */
  enhancedPrompt: string;
  category: WallpaperCategory | null;
  mode: GenerationMode;
  deviceId: string;
  width: number;
  height: number;
  provider: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface GenerateResponse {
  wallpapers: GeneratedWallpaper[];
  /** Remaining generations today for free-tier users (null = unlimited). */
  remaining: number | null;
}

// ─────────────────────────────────────────────────────────────
// Library: favorites, collections, history
// ─────────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  coverUrl: string | null;
  wallpaperIds: string[];
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  wallpaper: GeneratedWallpaper;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// Account / entitlements
// ─────────────────────────────────────────────────────────────

export type Tier = "free" | "premium";

export interface Entitlements {
  tier: Tier;
  dailyLimit: number | null; // null = unlimited
  maxResolution: "1x" | "4k";
  exclusiveStyles: boolean;
  ads: boolean;
  priorityQueue: boolean;
}
