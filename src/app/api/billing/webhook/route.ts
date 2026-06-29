import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getServiceSupabase } from "@/lib/supabase/server";
import { getStripe, subscriptionStatusToTier } from "@/lib/billing/stripe";

export const runtime = "nodejs";
// Stripe needs the raw, unparsed body to verify the signature.
export const dynamic = "force-dynamic";

function isoFromUnix(seconds?: number | null): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

/**
 * POST /api/billing/webhook — Stripe subscription lifecycle. Verifies the
 * signature, then flips the user's tier via the service client (this is the
 * only place tier is changed server-side). Always returns 200 to acknowledge,
 * even when persistence is unavailable, so Stripe doesn't retry forever.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Billing not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "bad signature";
    return NextResponse.json({ error: `Webhook signature failed: ${message}` }, { status: 400 });
  }

  const service = getServiceSupabase();
  if (!service) return NextResponse.json({ received: true }); // can't persist; ack

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.client_reference_id;
        const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
        let premiumUntil: string | null = null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          premiumUntil = isoFromUnix(sub.current_period_end);
        }
        if (userId) {
          await service
            .from("users")
            .update({
              tier: "premium",
              stripe_subscription_id: subId ?? null,
              stripe_customer_id:
                typeof s.customer === "string" ? s.customer : s.customer?.id ?? null,
              premium_until: premiumUntil,
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await service
          .from("users")
          .update({
            tier: subscriptionStatusToTier(sub.status),
            stripe_subscription_id: sub.id,
            premium_until: isoFromUnix(sub.current_period_end),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await service
          .from("users")
          .update({ tier: "free", stripe_subscription_id: null, premium_until: null })
          .eq("stripe_customer_id", customerId);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[billing webhook]", err);
    // Still acknowledge; Stripe retries are for delivery failures, not app bugs.
  }

  return NextResponse.json({ received: true });
}
