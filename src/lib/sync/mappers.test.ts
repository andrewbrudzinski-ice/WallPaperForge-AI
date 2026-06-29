import { describe, it, expect } from "vitest";
import { rowToWallpaper, wallpaperToRow, type WallpaperRow } from "./mappers";
import type { GeneratedWallpaper } from "@/types";

const wallpaper: GeneratedWallpaper = {
  id: "w1",
  imageUrl: "data:image/svg+xml;base64,AAAA",
  description: "a cyberpunk city",
  enhancedPrompt: "Create a stunning phone wallpaper of a cyberpunk city...",
  category: "Cyberpunk",
  mode: "random",
  deviceId: "iphone-16-pro-max",
  width: 1320,
  height: 2868,
  provider: "mock",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("sync mappers", () => {
  it("wallpaperToRow maps store fields to DB columns with the owner id", () => {
    const row = wallpaperToRow(wallpaper, "user-123");
    expect(row.id).toBe("w1");
    expect(row.user_id).toBe("user-123");
    expect(row.device_key).toBe("iphone-16-pro-max");
    expect(row.image_url).toBe(wallpaper.imageUrl);
    expect(row.enhanced_prompt).toBe(wallpaper.enhancedPrompt);
  });

  it("rowToWallpaper round-trips back to the store shape", () => {
    const row = wallpaperToRow(wallpaper, "user-123");
    const back = rowToWallpaper(row as WallpaperRow, true);
    expect(back.id).toBe(wallpaper.id);
    expect(back.deviceId).toBe(wallpaper.deviceId);
    expect(back.description).toBe(wallpaper.description);
    expect(back.category).toBe("Cyberpunk");
    expect(back.isFavorite).toBe(true);
  });

  it("normalizes a null category", () => {
    const row = { ...wallpaperToRow(wallpaper, "u"), category: null };
    expect(rowToWallpaper(row as WallpaperRow, false).category).toBeNull();
  });
});
