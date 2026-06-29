import type {
  Collection,
  DeviceProfile,
  GeneratedWallpaper,
  Tier,
} from "@/types";

/**
 * Pure (de)serialization for the "export / import my library" feature. Keeping
 * the shape + validation here means the Settings UI stays thin and the format
 * is unit-tested.
 */

export const LIBRARY_EXPORT_VERSION = 1;

export interface LibraryExport {
  version: number;
  exportedAt: string;
  device: DeviceProfile | null;
  tier: Tier;
  wallpapers: GeneratedWallpaper[];
  favoriteIds: string[];
  collections: Collection[];
}

export interface ExportableState {
  device: DeviceProfile | null;
  tier: Tier;
  history: { wallpaper: GeneratedWallpaper }[];
  favorites: GeneratedWallpaper[];
  collections: Collection[];
}

/** Build the export payload from the current store state. */
export function buildExport(state: ExportableState): LibraryExport {
  return {
    version: LIBRARY_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    device: state.device,
    tier: state.tier,
    wallpapers: state.history.map((h) => h.wallpaper),
    favoriteIds: state.favorites.map((f) => f.id),
    collections: state.collections,
  };
}

/**
 * Parse + validate an imported JSON string. Throws a friendly error on
 * malformed input; coerces missing collections/arrays to safe defaults.
 */
export function parseImport(text: string): LibraryExport {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (!raw || typeof raw !== "object") {
    throw new Error("Unrecognized backup file.");
  }
  const obj = raw as Partial<LibraryExport>;
  if (!Array.isArray(obj.wallpapers) || !Array.isArray(obj.favoriteIds)) {
    throw new Error("This doesn't look like a WallpaperForge backup.");
  }
  return {
    version: typeof obj.version === "number" ? obj.version : LIBRARY_EXPORT_VERSION,
    exportedAt: typeof obj.exportedAt === "string" ? obj.exportedAt : new Date().toISOString(),
    device: obj.device ?? null,
    tier: obj.tier === "premium" ? "premium" : "free",
    wallpapers: obj.wallpapers,
    favoriteIds: obj.favoriteIds,
    collections: Array.isArray(obj.collections) ? obj.collections : [],
  };
}
