import { describe, it, expect } from "vitest";
import { subscriptionStatusToTier } from "./stripe";

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
