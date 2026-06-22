import type { Entitlements, Tier } from "@/types";

/**
 * Premium architecture.
 *
 * Entitlements are derived purely from a user's tier. Payments are intentionally
 * NOT implemented yet — but every gate in the app (daily limits, 4K output,
 * exclusive styles, ads, queue priority) reads from here, so wiring a billing
 * provider later only requires flipping a user's tier in the database.
 */

const FREE_DAILY_LIMIT = Number(process.env.FREE_DAILY_GENERATION_LIMIT ?? 10);

export const ENTITLEMENTS: Record<Tier, Entitlements> = {
  free: {
    tier: "free",
    dailyLimit: FREE_DAILY_LIMIT,
    maxResolution: "1x",
    exclusiveStyles: false,
    ads: true,
    priorityQueue: false,
  },
  premium: {
    tier: "premium",
    dailyLimit: null, // unlimited
    maxResolution: "4k",
    exclusiveStyles: true,
    ads: false,
    priorityQueue: true,
  },
};

export function getEntitlements(tier: Tier): Entitlements {
  return ENTITLEMENTS[tier];
}

export function canUseHighRes(tier: Tier): boolean {
  return getEntitlements(tier).maxResolution === "4k";
}

/** Returns remaining generations for the day, or null when unlimited. */
export function remainingGenerations(tier: Tier, usedToday: number): number | null {
  const limit = getEntitlements(tier).dailyLimit;
  if (limit === null) return null;
  return Math.max(0, limit - usedToday);
}

export function hasReachedDailyLimit(tier: Tier, usedToday: number): boolean {
  const remaining = remainingGenerations(tier, usedToday);
  return remaining !== null && remaining <= 0;
}
