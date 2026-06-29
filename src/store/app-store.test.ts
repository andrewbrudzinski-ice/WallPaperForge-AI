import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "./app-store";
import type { GeneratedWallpaper } from "@/types";

function wp(id: string, over: Partial<GeneratedWallpaper> = {}): GeneratedWallpaper {
  return {
    id,
    imageUrl: `data:image/svg+xml;base64,${id}`,
    description: `wallpaper ${id}`,
    enhancedPrompt: "prompt",
    category: "Space",
    mode: "random",
    deviceId: "iphone-16-pro",
    width: 1206,
    height: 2622,
    provider: "mock",
    createdAt: new Date().toISOString(),
    ...over,
  };
}

const today = new Date().toISOString().slice(0, 10);

beforeEach(() => {
  useAppStore.setState({
    favorites: [],
    history: [],
    collections: [],
    current: null,
    variations: [],
    usage: { dayKey: today, count: 0 },
    tier: "free",
  });
});

describe("favorites", () => {
  it("toggles a wallpaper on and off", () => {
    const s = useAppStore.getState();
    expect(s.isFavorite("a")).toBe(false);
    s.toggleFavorite(wp("a"));
    expect(useAppStore.getState().isFavorite("a")).toBe(true);
    expect(useAppStore.getState().favorites).toHaveLength(1);
    useAppStore.getState().toggleFavorite(wp("a"));
    expect(useAppStore.getState().isFavorite("a")).toBe(false);
    expect(useAppStore.getState().favorites).toHaveLength(0);
  });
});

describe("usage quota", () => {
  it("increments within the same day", () => {
    useAppStore.getState().incrementUsage();
    useAppStore.getState().incrementUsage();
    expect(useAppStore.getState().usageToday()).toBe(2);
  });

  it("resets the count when the stored day is stale", () => {
    useAppStore.setState({ usage: { dayKey: "2000-01-01", count: 7 } });
    expect(useAppStore.getState().usageToday()).toBe(0);
    useAppStore.getState().incrementUsage();
    expect(useAppStore.getState().usageToday()).toBe(1);
  });
});

describe("history", () => {
  it("prepends generated wallpapers (newest first)", () => {
    useAppStore.getState().addToHistory(wp("old"));
    useAppStore.getState().addToHistory(wp("new"));
    const hist = useAppStore.getState().history;
    expect(hist[0].wallpaper.id).toBe("new");
    expect(hist).toHaveLength(2);
  });
});

describe("collections", () => {
  it("creates, adds to, and removes collections", () => {
    const col = useAppStore.getState().createCollection("Faves");
    expect(useAppStore.getState().collections).toHaveLength(1);

    useAppStore.getState().addToCollection(col.id, wp("a"));
    useAppStore.getState().addToCollection(col.id, wp("a")); // dedupes
    const updated = useAppStore.getState().collections[0];
    expect(updated.wallpaperIds).toEqual(["a"]);
    expect(updated.coverUrl).toBeTruthy();

    useAppStore.getState().removeCollection(col.id);
    expect(useAppStore.getState().collections).toHaveLength(0);
  });
});

describe("hydrateFromServer", () => {
  it("merges server + local wallpapers, favorites, and collections", () => {
    // Local-only state.
    useAppStore.getState().addToHistory(wp("local"));
    useAppStore.getState().toggleFavorite(wp("local"));

    useAppStore.getState().hydrateFromServer({
      wallpapers: [wp("server", { createdAt: "2030-01-01T00:00:00.000Z" })],
      favoriteIds: ["server"],
      collections: [
        {
          id: "c1",
          name: "Server collection",
          coverUrl: null,
          wallpaperIds: ["server"],
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const s = useAppStore.getState();
    const ids = s.history.map((h) => h.wallpaper.id);
    expect(ids).toContain("local");
    expect(ids).toContain("server");
    // Newest (server, 2030) sorts first.
    expect(s.history[0].wallpaper.id).toBe("server");
    // Both favorites preserved.
    expect(s.favorites.map((f) => f.id).sort()).toEqual(["local", "server"]);
    expect(s.collections.map((c) => c.id)).toContain("c1");
  });
});
