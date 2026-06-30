import { describe, it, expect } from "vitest";
import { targetDimensions, MAX_NON_4K_SIDE } from "./dimensions";

describe("targetDimensions", () => {
  it("returns native resolution for high-res (4K)", () => {
    expect(targetDimensions(1320, 2868, true)).toEqual({ width: 1320, height: 2868 });
  });

  it("scales the longest side down to the cap for non-4K, preserving aspect ratio", () => {
    const out = targetDimensions(1320, 2868, false);
    expect(Math.max(out.width, out.height)).toBe(MAX_NON_4K_SIDE);
    // aspect ratio preserved
    expect(out.width / out.height).toBeCloseTo(1320 / 2868, 2);
  });

  it("never upscales an already-small device", () => {
    expect(targetDimensions(750, 1334, false)).toEqual({ width: 750, height: 1334 });
  });

  it("defaults to non-4K scaling when highRes is omitted", () => {
    const out = targetDimensions(2000, 4000);
    expect(Math.max(out.width, out.height)).toBe(MAX_NON_4K_SIDE);
  });
});
