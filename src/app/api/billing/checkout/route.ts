import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getStripe, isBillingConfigured, PREMIUM_PRICE_ID } from "@/lib/billing/stripe";

export const runtime = "nodejs";

/**
 * POST /api/billing/checkout — start a Stripe Checkout subscription for the
 * premium tier. Ensures a Stripe customer exists for the user (stored on their
 * row) and returns the hosted checkout URL.
 */
export async function POST(req: Request) {
  if (!isBillingConfigured()) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }
  const sb = getServerSupabase();
  const stripe = getStripe();
  if (!sb || !stripe) {
    return NextResponse.json({ error: "Billing is unavailable." }, { status: 503 });
  }

  const { data: auth } = await sb.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: "Sign in to upgrade." }, { status: 401 });
  }

  // Reuse the customer id if we already created one (RLS: own row).
  const { data: row } = await sb
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  let customerId = (row?.stripe_customer_id as string | null) ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await sb.from("users").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const origin = new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/device?upgraded=1`,
    cancel_url: `${origin}/device`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
