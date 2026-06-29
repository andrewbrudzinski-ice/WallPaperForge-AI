import { describe, it, expect } from "vitest";
import { filterHistory, historyCategories } from "./history-filter";
import type { GeneratedWallpaper, HistoryEntry, WallpaperCategory } from "@/types";

function entry(
  id: string,
  description: string,
  category: WallpaperCategory | null,
  mode: GeneratedWallpaper["mode"] = "random",
): HistoryEntry {
  return {
    id,
    createdAt: "2026-01-01T00:00:00.000Z",
    wallpaper: {
      id,
      imageUrl: id,
      description,
      enhancedPrompt: "p",
      category,
      mode,
      deviceId: "d",
      width: 1,
      height: 2,
      provider: "mock",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  };
}

const history: HistoryEntry[] = [
  entry("1", "Neon cyberpunk city", "Cyberpunk", "prompt"),
  entry("2", "Snowy mountain peak", "Mountains"),
  entry("3", "Deep ocean wave", "Ocean"),
];

describe("filterHistory", () => {
  it("returns all entries with an empty filter", () => {
    expect(filterHistory(history, { query: "", category: null })).toHaveLength(3);
  });

  it("matches the query against description, category, and mode (case-insensitive)", () => {
    expect(filterHistory(history, { query: "NEON", category: null }).map((e) => e.id)).toEqual(["1"]);
    expect(filterHistory(history, { query: "ocean", category: null }).map((e) => e.id)).toEqual(["3"]);
    expect(filterHistory(history, { query: "prompt", category: null }).map((e) => e.id)).toEqual(["1"]);
  });

  it("filters by category", () => {
    expect(filterHistory(history, { query: "", category: "Mountains" }).map((e) => e.id)).toEqual(["2"]);
  });

  it("combines query and category", () => {
    expect(filterHistory(history, { query: "peak", category: "Ocean" })).toHaveLength(0);
  });
});

describe("historyCategories", () => {
  it("lists distinct categories present", () => {
    expect(historyCategories(history).sort()).toEqual(["Cyberpunk", "Mountains", "Ocean"]);
  });
});
