import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface Body {
  wallpaperId: string;
  like: boolean;
}

/**
 * POST /api/gallery/like — like or unlike a public wallpaper. Authenticated;
 * RLS scopes the like row to the caller. The like_count column is maintained by
 * a DB trigger.
 */
export async function POST(req: Request) {
  const sb = getServerSupabase();
  if (!sb) {
    return NextResponse.json({ error: "Gallery requires Supabase." }, { status: 503 });
  }

  const { data: auth } = await sb.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: "Sign in to like wallpapers." }, { status: 401 });
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

  if (body.like) {
    const { error } = await sb
      .from("gallery_likes")
      .upsert(
        { user_id: user.id, wallpaper_id: body.wallpaperId },
        { onConflict: "user_id,wallpaper_id" },
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await sb
      .from("gallery_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("wallpaper_id", body.wallpaperId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, liked: body.like });
}
