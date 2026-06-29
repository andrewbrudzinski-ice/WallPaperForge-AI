import { describe, it, expect } from "vitest";
import { parseGalleryQuery } from "./gallery-service";

describe("parseGalleryQuery", () => {
  it("defaults to recent / no category / offset 0", () => {
    expect(parseGalleryQuery({})).toEqual({ category: null, sort: "recent", offset: 0 });
  });

  it("accepts known categories and rejects unknown ones", () => {
    expect(parseGalleryQuery({ category: "Cyberpunk" }).category).toBe("Cyberpunk");
    expect(parseGalleryQuery({ category: "NotACategory" }).category).toBeNull();
  });

  it("only honours the 'popular' sort, otherwise recent", () => {
    expect(parseGalleryQuery({ sort: "popular" }).sort).toBe("popular");
    expect(parseGalleryQuery({ sort: "weird" }).sort).toBe("recent");
    expect(parseGalleryQuery({ sort: null }).sort).toBe("recent");
  });

  it("clamps the offset to a sane non-negative range", () => {
    expect(parseGalleryQuery({ offset: "24" }).offset).toBe(24);
    expect(parseGalleryQuery({ offset: "-5" }).offset).toBe(0);
    expect(parseGalleryQuery({ offset: "abc" }).offset).toBe(0);
    expect(parseGalleryQuery({ offset: "999999" }).offset).toBe(100000);
  });
});
