import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { listPublicWallpapers } from "@/lib/gallery/gallery-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/gallery — recent public wallpapers. Returns an empty list (not an
 * error) when Supabase isn't configured, so the gallery page degrades cleanly.
 */
export async function GET() {
  const sb = getServerSupabase();
  if (!sb) return NextResponse.json({ wallpapers: [], configured: false });
  const wallpapers = await listPublicWallpapers(sb);
  return NextResponse.json({ wallpapers, configured: true });
}
