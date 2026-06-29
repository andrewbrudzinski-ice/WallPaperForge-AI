import type { HistoryEntry, WallpaperCategory } from "@/types";

/**
 * Pure search/filter for the generation history. Shared by the History screen
 * and unit-tested so the matching rules stay predictable.
 */

export interface HistoryFilter {
  query: string;
  category: WallpaperCategory | null;
}

export function filterHistory(
  entries: HistoryEntry[],
  filter: HistoryFilter,
): HistoryEntry[] {
  const q = filter.query.trim().toLowerCase();
  return entries.filter((e) => {
    const w = e.wallpaper;
    if (filter.category && w.category !== filter.category) return false;
    if (q) {
      const haystack = `${w.description} ${w.category ?? ""} ${w.mode}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/** Distinct categories present in the history (for filter chips), in order. */
export function historyCategories(entries: HistoryEntry[]): WallpaperCategory[] {
  const seen = new Set<WallpaperCategory>();
  for (const e of entries) {
    if (e.wallpaper.category) seen.add(e.wallpaper.category);
  }
  return Array.from(seen);
}
