import { describe, it, expect } from "vitest";
import { collectionWallpapers, wallpaperPool } from "./collections";
import type { Collection, GeneratedWallpaper } from "@/types";

function wp(id: string): GeneratedWallpaper {
  return {
    id,
    imageUrl: id,
    description: id,
    enhancedPrompt: "p",
    category: null,
    mode: "random",
    deviceId: "d",
    width: 1,
    height: 2,
    provider: "mock",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

const collection: Collection = {
  id: "c1",
  name: "Faves",
  coverUrl: null,
  wallpaperIds: ["b", "a", "missing"],
  createdAt: "x",
};

describe("collectionWallpapers", () => {
  it("resolves ids in collection order and drops missing ones", () => {
    const result = collectionWallpapers(collection, [wp("a"), wp("b")]);
    expect(result.map((w) => w.id)).toEqual(["b", "a"]);
  });

  it("returns empty for an empty pool", () => {
    expect(collectionWallpapers(collection, [])).toEqual([]);
  });
});

describe("wallpaperPool", () => {
  it("de-duplicates history + favorites by id", () => {
    const pool = wallpaperPool(
      [{ id: "a", wallpaper: wp("a"), createdAt: "x" }],
      [wp("a"), wp("c")],
    );
    expect(pool.map((w) => w.id).sort()).toEqual(["a", "c"]);
  });
});
