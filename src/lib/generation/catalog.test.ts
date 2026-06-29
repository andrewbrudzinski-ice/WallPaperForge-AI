import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  CATEGORY_IDEAS,
  MOODS,
  PALETTES,
  STYLES,
  COMPLEXITIES,
  randomSurprise,
  pick,
} from "./catalog";

describe("creative catalog", () => {
  it("provides at least one idea for every category", () => {
    for (const c of CATEGORIES) {
      expect(CATEGORY_IDEAS[c]).toBeDefined();
      expect(CATEGORY_IDEAS[c].length).toBeGreaterThan(0);
    }
  });

  it("randomSurprise only returns valid catalog members", () => {
    for (let i = 0; i < 50; i++) {
      const s = randomSurprise();
      expect(MOODS).toContain(s.mood);
      expect(PALETTES).toContain(s.palette);
      expect(STYLES).toContain(s.style);
      expect(COMPLEXITIES).toContain(s.complexity);
    }
  });

  it("pick returns an element of the array", () => {
    const arr = ["a", "b", "c"] as const;
    for (let i = 0; i < 20; i++) expect(arr).toContain(pick(arr));
  });
});
