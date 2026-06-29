/**
 * Client-safe billing flags. Kept separate from `stripe.ts` so client
 * components can read configuration without pulling the server-only Stripe SDK
 * into the browser bundle.
 */
export function isBillingEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_BILLING_ENABLED === "true";
}
