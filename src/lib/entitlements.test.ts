import { describe, it, expect } from "vitest";
import {
  ENTITLEMENTS,
  getEntitlements,
  canUseHighRes,
  remainingGenerations,
  hasReachedDailyLimit,
} from "./entitlements";

describe("entitlements", () => {
  it("free tier is limited, no 4K, ads on", () => {
    const free = getEntitlements("free");
    expect(free.dailyLimit).toBeGreaterThan(0);
    expect(free.maxResolution).toBe("1x");
    expect(free.ads).toBe(true);
    expect(canUseHighRes("free")).toBe(false);
  });

  it("premium is unlimited with 4K and no ads", () => {
    const premium = ENTITLEMENTS.premium;
    expect(premium.dailyLimit).toBeNull();
    expect(premium.maxResolution).toBe("4k");
    expect(premium.ads).toBe(false);
    expect(canUseHighRes("premium")).toBe(true);
  });

  it("counts remaining generations for free tier", () => {
    const limit = ENTITLEMENTS.free.dailyLimit as number;
    expect(remainingGenerations("free", 0)).toBe(limit);
    expect(remainingGenerations("free", limit + 5)).toBe(0); // never negative
    expect(remainingGenerations("premium", 9999)).toBeNull(); // unlimited
  });

  it("detects when the daily limit is reached", () => {
    const limit = ENTITLEMENTS.free.dailyLimit as number;
    expect(hasReachedDailyLimit("free", limit - 1)).toBe(false);
    expect(hasReachedDailyLimit("free", limit)).toBe(true);
    expect(hasReachedDailyLimit("premium", 1_000_000)).toBe(false);
  });
});
