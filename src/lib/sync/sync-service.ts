import type { SupabaseClient } from "@supabase/supabase-js";
import type { Collection, GeneratedWallpaper } from "@/types";
import {
  collectionToRow,
  rowToCollection,
  rowToWallpaper,
  wallpaperToRow,
  type CollectionItemRow,
  type CollectionRow,
  type WallpaperRow,
} from "./mappers";

/**
 * Client-side sync service. All writes go through the browser client and are
 * scoped by Row Level Security to the signed-in user, so no service key is
 * needed. Every function is defensive: failures are swallowed (logged) so a
 * sync hiccup never breaks the UX — the local store remains authoritative.
 */

export interface PulledData {
  wallpapers: GeneratedWallpaper[];
  favoriteIds: string[];
  collections: Collection[];
}

function warn(scope: string, error: unknown) {
  if (error) console.warn(`[sync] ${scope}:`, error);
}

/** Load the user's entire library from Supabase into store-ready shapes. */
export async function pullAll(
  sb: SupabaseClient,
  userId: string,
): Promise<PulledData> {
  const [wRes, favRes, colRes, itemRes] = await Promise.all([
    sb
      .from("generated_wallpapers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    sb.from("favorites").select("wallpaper_id").eq("user_id", userId),
    sb
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    sb.from("collection_items").select("collection_id, wallpaper_id"),
  ]);

  warn("pull wallpapers", wRes.error);
  warn("pull favorites", favRes.error);
  warn("pull collections", colRes.error);
  warn("pull collection_items", itemRes.error);

  const favoriteIds = (favRes.data ?? []).map(
    (r: { wallpaper_id: string }) => r.wallpaper_id,
  );
  const favSet = new Set(favoriteIds);

  const wallpapers = ((wRes.data ?? []) as WallpaperRow[]).map((r) =>
    rowToWallpaper(r, favSet.has(r.id)),
  );

  const items = (itemRes.data ?? []) as CollectionItemRow[];
  const collections = ((colRes.data ?? []) as CollectionRow[]).map((c) =>
    rowToCollection(
      c,
      items.filter((i) => i.collection_id === c.id).map((i) => i.wallpaper_id),
    ),
  );

  return { wallpapers, favoriteIds, collections };
}

/** Upsert a wallpaper (id == client id keeps client/server references aligned). */
export async function upsertWallpaper(
  sb: SupabaseClient,
  userId: string,
  w: GeneratedWallpaper,
): Promise<void> {
  const { error } = await sb
    .from("generated_wallpapers")
    .upsert(wallpaperToRow(w, userId), { onConflict: "id" });
  warn("upsert wallpaper", error);
}

export async function upsertWallpapers(
  sb: SupabaseClient,
  userId: string,
  ws: GeneratedWallpaper[],
): Promise<void> {
  if (ws.length === 0) return;
  const { error } = await sb
    .from("generated_wallpapers")
    .upsert(
      ws.map((w) => wallpaperToRow(w, userId)),
      { onConflict: "id" },
    );
  warn("upsert wallpapers", error);
}

/** Toggle a favorite, ensuring the referenced wallpaper exists first. */
export async function setFavorite(
  sb: SupabaseClient,
  userId: string,
  wallpaper: GeneratedWallpaper,
  on: boolean,
): Promise<void> {
  if (on) {
    await upsertWallpaper(sb, userId, wallpaper);
    const { error } = await sb
      .from("favorites")
      .upsert(
        { user_id: userId, wallpaper_id: wallpaper.id },
        { onConflict: "user_id,wallpaper_id" },
      );
    warn("add favorite", error);
  } else {
    const { error } = await sb
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("wallpaper_id", wallpaper.id);
    warn("remove favorite", error);
  }
}

/** Upsert a collection and reconcile its membership rows. */
export async function syncCollection(
  sb: SupabaseClient,
  userId: string,
  collection: Collection,
): Promise<void> {
  const { error: cErr } = await sb
    .from("collections")
    .upsert(collectionToRow(collection, userId), { onConflict: "id" });
  warn("upsert collection", cErr);

  if (collection.wallpaperIds.length > 0) {
    const rows = collection.wallpaperIds.map((wid) => ({
      collection_id: collection.id,
      wallpaper_id: wid,
    }));
    const { error } = await sb
      .from("collection_items")
      .upsert(rows, { onConflict: "collection_id,wallpaper_id" });
    warn("upsert collection_items", error);
  }
}

export async function deleteCollection(
  sb: SupabaseClient,
  collectionId: string,
): Promise<void> {
  const { error } = await sb.from("collections").delete().eq("id", collectionId);
  warn("delete collection", error);
}
