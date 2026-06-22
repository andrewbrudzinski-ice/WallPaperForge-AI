import { NextResponse } from "next/server";
import type { GenerateRequest, Tier } from "@/types";
import { generateVariations } from "@/lib/generation/generate-service";
import { canUseHighRes } from "@/lib/entitlements";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Body extends GenerateRequest {
  tier?: Tier;
  count?: number;
}

/**
 * POST /api/variations
 *
 * Produces N (default 4) diverse variations of a concept — each with a
 * different color/lighting/angle/style directive from the optimization engine.
 * Variations do not count individually against the daily quota beyond the
 * single generating action that triggered them (client-controlled).
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.device?.id) {
    return NextResponse.json({ error: "A device profile is required" }, { status: 400 });
  }

  const tier: Tier = body.tier ?? "free";
  const highRes = body.highRes && canUseHighRes(tier);
  const count = Math.min(Math.max(body.count ?? 4, 1), 4);

  try {
    const wallpapers = await generateVariations({ ...body, highRes }, count);
    return NextResponse.json({ wallpapers, remaining: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Variation generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
