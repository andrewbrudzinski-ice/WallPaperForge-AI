import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getStripe, isBillingConfigured } from "@/lib/billing/stripe";

export const runtime = "nodejs";

/**
 * POST /api/billing/portal — open the Stripe billing portal so a subscriber can
 * manage or cancel their plan.
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
    return NextResponse.json({ error: "Sign in to manage billing." }, { status: 401 });
  }

  const { data: row } = await sb
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const customerId = row?.stripe_customer_id as string | null;
  if (!customerId) {
    return NextResponse.json({ error: "No billing account found." }, { status: 404 });
  }

  const origin = new URL(req.url).origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/device`,
  });

  return NextResponse.json({ url: session.url });
}
