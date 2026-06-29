import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GalleryQuery,
  GallerySort,
  PublicWallpaper,
  WallpaperCategory,
} from "@/types";
import { CATEGORIES } from "@/lib/generation/catalog";
import { slugify } from "@/lib/utils";

/**
 * Server-side helpers for the public gallery. Reads rely on the
 * "wallpapers public read" RLS policy (anon may read rows where is_public),
 * so they work for signed-out visitors.
 */

export const GALLERY_PAGE_SIZE = 24;

const PUBLIC_COLUMNS =
  "id, share_slug, image_url, description, category, width, height, like_count, published_at, created_at";

interface PublicRow {
  id: string;
  share_slug: string | null;
  image_url: string;
  description: string;
  category: string | null;
  width: number;
  height: number;
  like_count: number | null;
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
    likeCount: r.like_count ?? 0,
    createdAt: r.published_at ?? r.created_at,
  };
}

/** A URL-safe, reasonably unique slug for a published wallpaper. */
export function makeShareSlug(description: string): string {
  const base = slugify(description).slice(0, 40) || "wallpaper";
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Validate/normalize raw gallery query params. Pure (unit-tested): clamps the
 * offset, defaults the sort, and only accepts known categories.
 */
export function parseGalleryQuery(params: {
  category?: string | null;
  sort?: string | null;
  offset?: string | null;
}): GalleryQuery {
  const category =
    params.category && (CATEGORIES as string[]).includes(params.category)
      ? (params.category as WallpaperCategory)
      : null;
  const sort: GallerySort = params.sort === "popular" ? "popular" : "recent";
  const parsed = Number.parseInt(params.offset ?? "0", 10);
  const offset = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 100_000) : 0;
  return { category, sort, offset };
}

/** Annotate a list with which wallpapers the given user has liked. */
async function withLikedByMe(
  sb: SupabaseClient,
  userId: string,
  wallpapers: PublicWallpaper[],
): Promise<PublicWallpaper[]> {
  if (wallpapers.length === 0) return wallpapers;
  const ids = wallpapers.map((w) => w.id);
  const { data } = await sb
    .from("gallery_likes")
    .select("wallpaper_id")
    .eq("user_id", userId)
    .in("wallpaper_id", ids);
  const liked = new Set((data ?? []).map((r: { wallpaper_id: string }) => r.wallpaper_id));
  return wallpapers.map((w) => ({ ...w, likedByMe: liked.has(w.id) }));
}

export interface ListResult {
  wallpapers: PublicWallpaper[];
  nextOffset: number | null;
}

export async function listPublicWallpapers(
  sb: SupabaseClient,
  query: GalleryQuery,
  userId?: string | null,
): Promise<ListResult> {
  let q = sb
    .from("generated_wallpapers")
    .select(PUBLIC_COLUMNS)
    .eq("is_public", true)
    .not("share_slug", "is", null);

  if (query.category) q = q.eq("category", query.category);
  q =
    query.sort === "popular"
      ? q.order("like_count", { ascending: false }).order("published_at", { ascending: false })
      : q.order("published_at", { ascending: false });

  const { data, error } = await q.range(query.offset, query.offset + GALLERY_PAGE_SIZE - 1);
  if (error) {
    console.warn("[gallery] list:", error.message);
    return { wallpapers: [], nextOffset: null };
  }

  let wallpapers = (data as PublicRow[]).map(rowToPublic);
  if (userId) wallpapers = await withLikedByMe(sb, userId, wallpapers);

  const nextOffset =
    wallpapers.length === GALLERY_PAGE_SIZE ? query.offset + GALLERY_PAGE_SIZE : null;
  return { wallpapers, nextOffset };
}

export async function getPublicWallpaper(
  sb: SupabaseClient,
  slug: string,
  userId?: string | null,
): Promise<PublicWallpaper | null> {
  const { data, error } = await sb
    .from("generated_wallpapers")
    .select(PUBLIC_COLUMNS)
    .eq("share_slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  if (error || !data) return null;

  const wallpaper = rowToPublic(data as PublicRow);
  if (userId) {
    const [annotated] = await withLikedByMe(sb, userId, [wallpaper]);
    return annotated;
  }
  return wallpaper;
}
