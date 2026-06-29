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
