import { describe, it, expect } from "vitest";
import { buildExport, parseImport, LIBRARY_EXPORT_VERSION } from "./portability";
import type { GeneratedWallpaper } from "@/types";

function wp(id: string): GeneratedWallpaper {
  return {
    id,
    imageUrl: `data:image/svg+xml;base64,${id}`,
    description: `wp ${id}`,
    enhancedPrompt: "p",
    category: "Space",
    mode: "random",
    deviceId: "iphone-16-pro",
    width: 1206,
    height: 2622,
    provider: "mock",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("portability", () => {
  it("buildExport captures device, tier, wallpapers, favorites, collections", () => {
    const out = buildExport({
      device: null,
      tier: "premium",
      history: [{ wallpaper: wp("a") }, { wallpaper: wp("b") }],
      favorites: [wp("a")],
      collections: [
        { id: "c", name: "C", coverUrl: null, wallpaperIds: ["a"], createdAt: "x" },
      ],
    });
    expect(out.version).toBe(LIBRARY_EXPORT_VERSION);
    expect(out.tier).toBe("premium");
    expect(out.wallpapers.map((w) => w.id)).toEqual(["a", "b"]);
    expect(out.favoriteIds).toEqual(["a"]);
    expect(out.collections).toHaveLength(1);
  });

  it("round-trips through parseImport", () => {
    const exported = buildExport({
      device: null,
      tier: "free",
      history: [{ wallpaper: wp("a") }],
      favorites: [],
      collections: [],
    });
    const parsed = parseImport(JSON.stringify(exported));
    expect(parsed.wallpapers.map((w) => w.id)).toEqual(["a"]);
    expect(parsed.tier).toBe("free");
  });

  it("rejects malformed input", () => {
    expect(() => parseImport("not json")).toThrow();
    expect(() => parseImport(JSON.stringify({ foo: 1 }))).toThrow();
  });

  it("coerces a missing collections array and unknown tier", () => {
    const parsed = parseImport(
      JSON.stringify({ wallpapers: [], favoriteIds: [], tier: "???" }),
    );
    expect(parsed.collections).toEqual([]);
    expect(parsed.tier).toBe("free");
  });
});
