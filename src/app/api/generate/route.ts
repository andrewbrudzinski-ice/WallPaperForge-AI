import { NextResponse } from "next/server";
import type { GenerateRequest, Tier } from "@/types";
import { generateWallpaper } from "@/lib/generation/generate-service";
import { canUseHighRes, hasReachedDailyLimit, remainingGenerations } from "@/lib/entitlements";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body extends GenerateRequest {
  /** Client-reported usage for offline mode (no Supabase auth). */
  usedToday?: number;
  tier?: Tier;
}

/**
 * POST /api/generate
 *
 * Enforces the daily quota, runs the optimization engine + provider, and
 * persists the result when a Supabase session exists. In offline mode (no
 * Supabase), quota is enforced from the client-reported `usedToday` and nothing
 * is persisted server-side — the client store is the source of truth.
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
  // Premium gate: silently disable 4K for free users.
  const highRes = body.highRes && canUseHighRes(tier);

  // ── Quota enforcement ──────────────────────────────────────
  const supabase = getServerSupabase();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const userId = auth?.user?.id ?? null;

  let usedToday = body.usedToday ?? 0;
  const service = getServiceSupabase();

  if (userId && service) {
    const { data } = await service.rpc("generations_today", { p_user: userId });
    if (typeof data === "number") usedToday = data;
  }

  if (hasReachedDailyLimit(tier, usedToday)) {
    return NextResponse.json(
      {
        error: "Daily generation limit reached. Upgrade to premium for unlimited wallpapers.",
        remaining: 0,
      },
      { status: 429 },
    );
  }

  // ── Generate ───────────────────────────────────────────────
  let wallpaper;
  try {
    wallpaper = await generateWallpaper({ ...body, highRes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // ── Persist (best-effort) ──────────────────────────────────
  // Use the client-generated wallpaper id as the row id so favorites,
  // collections, and history (written by the client sync layer) all reference
  // the same identifier.
  if (userId && service) {
    await service.from("generated_wallpapers").upsert(
      {
        id: wallpaper.id,
        user_id: userId,
        device_key: wallpaper.deviceId,
        image_url: wallpaper.imageUrl,
        description: wallpaper.description,
        enhanced_prompt: wallpaper.enhancedPrompt,
        category: wallpaper.category,
        mode: wallpaper.mode,
        provider: wallpaper.provider,
        width: wallpaper.width,
        height: wallpaper.height,
        is_high_res: Boolean(highRes),
      },
      { onConflict: "id" },
    );

    await service.from("generation_history").insert({
      user_id: userId,
      wallpaper_id: wallpaper.id,
      mode: wallpaper.mode,
      prompt: body.prompt ?? null,
    });

    usedToday += 1;
  }

  return NextResponse.json({
    wallpapers: [wallpaper],
    remaining: remainingGenerations(tier, usedToday),
  });
}
