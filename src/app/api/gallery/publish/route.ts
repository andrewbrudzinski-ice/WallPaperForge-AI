import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { makeShareSlug } from "@/lib/gallery/gallery-service";

export const runtime = "nodejs";

interface Body {
  wallpaperId: string;
  publish: boolean;
}

/**
 * POST /api/gallery/publish — publish or unpublish one of the caller's
 * wallpapers to the public gallery. Authenticated; the update is RLS-scoped to
 * the owner (the `.eq("user_id", …)` is belt-and-suspenders).
 */
export async function POST(req: Request) {
  const sb = getServerSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "Gallery requires Supabase configuration." },
      { status: 503 },
    );
  }

  const { data: auth } = await sb.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: "Sign in to share to the gallery." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.wallpaperId) {
    return NextResponse.json({ error: "wallpaperId is required" }, { status: 400 });
  }

  if (!body.publish) {
    const { error } = await sb
      .from("generated_wallpapers")
      .update({ is_public: false })
      .eq("id", body.wallpaperId)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, published: false });
  }

  // Reuse an existing slug if already published, else mint a new one.
  const { data: existing } = await sb
    .from("generated_wallpapers")
    .select("description, share_slug")
    .eq("id", body.wallpaperId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json(
      { error: "Wallpaper not found. Make sure you're signed in on the device that created it." },
      { status: 404 },
    );
  }

  const slug =
    (existing.share_slug as string | null) ??
    makeShareSlug((existing.description as string) ?? "wallpaper");

  const { error } = await sb
    .from("generated_wallpapers")
    .update({
      is_public: true,
      share_slug: slug,
      published_at: new Date().toISOString(),
    })
    .eq("id", body.wallpaperId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const origin = new URL(req.url).origin;
  return NextResponse.json({
    ok: true,
    published: true,
    slug,
    url: `${origin}/w/${slug}`,
  });
}
