import Stripe from "stripe";
import type { Tier } from "@/types";

/**
 * Stripe billing integration for the premium tier. Everything degrades
 * gracefully when keys are absent: `isBillingConfigured()` is false, the
 * client gets a null Stripe instance, and API routes return 503. No live
 * charges happen without configuration.
 */

/** Server-side: are the Stripe secret + price configured? */
export function isBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

export const PREMIUM_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";

let cached: Stripe | null = null;

/** Lazily-constructed Stripe client, or null when no secret key is set. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}

/**
 * Map a Stripe subscription status to an app tier. Active/trialing grant
 * premium; everything else (canceled, past_due, unpaid, incomplete…) is free.
 * Pure — unit-tested.
 */
export function subscriptionStatusToTier(status: string): Tier {
  return status === "active" || status === "trialing" ? "premium" : "free";
}

/** Convert a Stripe unix timestamp (seconds) to an ISO string, or null. */
export function isoFromUnix(seconds?: number | null): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

/** The minimal shape we read off a Stripe subscription. */
export interface SubscriptionLike {
  id: string;
  status: string;
  current_period_end?: number | null;
}

export interface UserTierUpdate {
  tier: Tier;
  stripe_subscription_id: string;
  premium_until: string | null;
}

/**
 * Pure mapping from a Stripe subscription to the user-row fields the webhook
 * writes. Centralised + unit-tested so the (money-handling) webhook stays a
 * thin, predictable adapter.
 */
export function mapSubscriptionToUpdate(sub: SubscriptionLike): UserTierUpdate {
  return {
    tier: subscriptionStatusToTier(sub.status),
    stripe_subscription_id: sub.id,
    premium_until: isoFromUnix(sub.current_period_end),
  };
}
