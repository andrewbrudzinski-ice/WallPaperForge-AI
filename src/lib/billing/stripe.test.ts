import { describe, it, expect } from "vitest";
import {
  subscriptionStatusToTier,
  isoFromUnix,
  mapSubscriptionToUpdate,
} from "./stripe";

describe("subscriptionStatusToTier", () => {
  it("grants premium for active and trialing subscriptions", () => {
    expect(subscriptionStatusToTier("active")).toBe("premium");
    expect(subscriptionStatusToTier("trialing")).toBe("premium");
  });

  it("is free for any non-active status", () => {
    for (const s of ["canceled", "past_due", "unpaid", "incomplete", "paused", ""]) {
      expect(subscriptionStatusToTier(s)).toBe("free");
    }
  });
});

describe("isoFromUnix", () => {
  it("converts seconds to an ISO timestamp", () => {
    expect(isoFromUnix(0)).toBeNull();
    expect(isoFromUnix(null)).toBeNull();
    expect(isoFromUnix(undefined)).toBeNull();
    expect(isoFromUnix(1_700_000_000)).toBe(new Date(1_700_000_000_000).toISOString());
  });
});

describe("mapSubscriptionToUpdate", () => {
  it("maps an active subscription to a premium update", () => {
    const update = mapSubscriptionToUpdate({
      id: "sub_123",
      status: "active",
      current_period_end: 1_700_000_000,
    });
    expect(update).toEqual({
      tier: "premium",
      stripe_subscription_id: "sub_123",
      premium_until: new Date(1_700_000_000_000).toISOString(),
    });
  });

  it("maps a canceled subscription to a free update with no expiry", () => {
    const update = mapSubscriptionToUpdate({ id: "sub_9", status: "canceled" });
    expect(update.tier).toBe("free");
    expect(update.stripe_subscription_id).toBe("sub_9");
    expect(update.premium_until).toBeNull();
  });
});
