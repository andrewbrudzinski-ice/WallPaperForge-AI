import type { Collection, GeneratedWallpaper, HistoryEntry } from "@/types";

/**
 * Resolve a collection's wallpaper ids into full wallpaper objects, preserving
 * collection order and dropping any ids whose wallpaper is no longer available.
 * Pure — unit-tested and shared by the collection detail view.
 */
export function collectionWallpapers(
  collection: Collection,
  pool: GeneratedWallpaper[],
): GeneratedWallpaper[] {
  const byId = new Map(pool.map((w) => [w.id, w]));
  return collection.wallpaperIds
    .map((id) => byId.get(id))
    .filter((w): w is GeneratedWallpaper => Boolean(w));
}

/** Build the de-duplicated wallpaper pool from history + favorites. */
export function wallpaperPool(
  history: HistoryEntry[],
  favorites: GeneratedWallpaper[],
): GeneratedWallpaper[] {
  const byId = new Map<string, GeneratedWallpaper>();
  for (const f of favorites) byId.set(f.id, f);
  for (const h of history) byId.set(h.wallpaper.id, h.wallpaper);
  return Array.from(byId.values());
}
