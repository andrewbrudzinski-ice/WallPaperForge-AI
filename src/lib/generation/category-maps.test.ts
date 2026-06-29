import { describe, it, expect } from "vitest";
import { CATEGORIES } from "./catalog";
import { CATEGORY_STYLES, FEATURED_CATEGORIES } from "./category-style";
import { CATEGORY_ART } from "./category-art";

describe("category visual maps", () => {
  it("every category has a style and an art definition", () => {
    for (const c of CATEGORIES) {
      expect(CATEGORY_STYLES[c]).toBeDefined();
      expect(CATEGORY_STYLES[c].gradient).toMatch(/gradient/);
      expect(CATEGORY_ART[c]).toBeDefined();
      expect(CATEGORY_ART[c].colors[0]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(CATEGORY_ART[c].colors[1]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("featured categories are all real categories", () => {
    for (const c of FEATURED_CATEGORIES) {
      expect(CATEGORIES).toContain(c);
    }
    expect(new Set(FEATURED_CATEGORIES).size).toBe(FEATURED_CATEGORIES.length);
  });
});
