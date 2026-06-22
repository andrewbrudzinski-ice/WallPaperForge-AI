import type { SupabaseClient } from "@supabase/supabase-js";
import type { PublicWallpaper, WallpaperCategory } from "@/types";
import { slugify } from "@/lib/utils";

/**
 * Server-side helpers for the public gallery. Reads rely on the
 * "wallpapers public read" RLS policy (anon may read rows where is_public),
 * so they work for signed-out visitors. Pure mapping kept here so the API
 * routes stay thin.
 */

const PUBLIC_COLUMNS =
  "id, share_slug, image_url, description, category, width, height, published_at, created_at";

interface PublicRow {
  id: string;
  share_slug: string | null;
  image_url: string;
  description: string;
  category: string | null;
  width: number;
  height: number;
  published_at: string | null;
  created_at: string;
}

function rowToPublic(r: PublicRow): PublicWallpaper {
  return {
    id: r.id,
    slug: r.share_slug ?? r.id,
    imageUrl: r.image_url,
    description: r.description,
    category: (r.category as WallpaperCategory | null) ?? null,
    width: r.width,
    height: r.height,
    createdAt: r.published_at ?? r.created_at,
  };
}

/** A URL-safe, reasonably unique slug for a published wallpaper. */
export function makeShareSlug(description: string): string {
  const base = slugify(description).slice(0, 40) || "wallpaper";
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listPublicWallpapers(
  sb: SupabaseClient,
  limit = 40,
): Promise<PublicWallpaper[]> {
  const { data, error } = await sb
    .from("generated_wallpapers")
    .select(PUBLIC_COLUMNS)
    .eq("is_public", true)
    .not("share_slug", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[gallery] list:", error.message);
    return [];
  }
  return (data as PublicRow[]).map(rowToPublic);
}

export async function getPublicWallpaper(
  sb: SupabaseClient,
  slug: string,
): Promise<PublicWallpaper | null> {
  const { data, error } = await sb
    .from("generated_wallpapers")
    .select(PUBLIC_COLUMNS)
    .eq("share_slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  if (error || !data) return null;
  return rowToPublic(data as PublicRow);
}
