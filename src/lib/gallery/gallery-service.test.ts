import { describe, it, expect } from "vitest";
import { makeShareSlug } from "./gallery-service";

describe("makeShareSlug", () => {
  it("produces a url-safe slug derived from the description", () => {
    const slug = makeShareSlug("Neon Racing Car under Rain!");
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.startsWith("neon-racing-car-under-rain-")).toBe(true);
  });

  it("falls back to 'wallpaper' for empty descriptions", () => {
    expect(makeShareSlug("")).toMatch(/^wallpaper-[a-z0-9]+$/);
  });

  it("appends a random suffix so repeated calls differ", () => {
    const a = makeShareSlug("same title");
    const b = makeShareSlug("same title");
    expect(a).not.toBe(b);
  });
});
