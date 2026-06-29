import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { listPublicWallpapers, parseGalleryQuery } from "@/lib/gallery/gallery-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/gallery?category=&sort=&offset= — public wallpapers with filtering,
 * sorting (recent|popular), and offset pagination. Returns an empty list (not
 * an error) when Supabase isn't configured so the gallery page degrades.
 */
export async function GET(req: Request) {
  const sb = getServerSupabase();
  if (!sb) {
    return NextResponse.json({ wallpapers: [], nextOffset: null, configured: false });
  }

  const url = new URL(req.url);
  const query = parseGalleryQuery({
    category: url.searchParams.get("category"),
    sort: url.searchParams.get("sort"),
    offset: url.searchParams.get("offset"),
  });

  const { data: auth } = await sb.auth.getUser();
  const { wallpapers, nextOffset } = await listPublicWallpapers(
    sb,
    query,
    auth?.user?.id,
  );

  return NextResponse.json({ wallpapers, nextOffset, configured: true });
}
