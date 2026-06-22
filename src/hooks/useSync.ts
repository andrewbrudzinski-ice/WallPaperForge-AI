"use client";

import { useEffect, useRef } from "react";
import type { Collection, GeneratedWallpaper } from "@/types";
import { useAppStore } from "@/store/app-store";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useAuthContext } from "@/components/providers/AuthProvider";
import {
  deleteCollection,
  pullAll,
  setFavorite,
  syncCollection,
  upsertWallpapers,
} from "@/lib/sync/sync-service";

/**
 * Two-way cloud sync, active only when Supabase is configured AND a user is
 * signed in. Otherwise completely inert — the local store stays authoritative.
 *
 * On sign-in: pulls the server library, merges it into the store, then pushes
 * any local-only items up (so nothing made offline is lost). After that, it
 * write-throughs favorite and collection changes as they happen. (Generated
 * wallpapers + history are persisted server-side by the /api/generate route.)
 */
export function useSync() {
  const { configured, user } = useAuthContext();

  const syncedFor = useRef<string | null>(null);
  const prevFavorites = useRef<GeneratedWallpaper[]>([]);
  const prevCollections = useRef<Collection[]>([]);

  // ── Initial reconcile on sign-in ───────────────────────────
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!configured || !sb || !user) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === user.id) return;
    syncedFor.current = user.id;

    let cancelled = false;
    (async () => {
      try {
        const server = await pullAll(sb, user.id);
        if (cancelled) return;

        const before = useAppStore.getState();
        const localWallpapers = new Map<string, GeneratedWallpaper>();
        before.history.forEach((h) => localWallpapers.set(h.wallpaper.id, h.wallpaper));
        before.favorites.forEach((f) => localWallpapers.set(f.id, f));

        useAppStore.getState().hydrateFromServer(server);

        // Push local-only items the server didn't have.
        const serverWallpaperIds = new Set(server.wallpapers.map((w) => w.id));
        const localOnly = Array.from(localWallpapers.values()).filter(
          (w) => !serverWallpaperIds.has(w.id),
        );
        await upsertWallpapers(sb, user.id, localOnly);

        const serverFavs = new Set(server.favoriteIds);
        for (const fav of before.favorites) {
          if (!serverFavs.has(fav.id)) await setFavorite(sb, user.id, fav, true);
        }

        const serverCollectionIds = new Set(server.collections.map((c) => c.id));
        for (const col of before.collections) {
          if (!serverCollectionIds.has(col.id)) await syncCollection(sb, user.id, col);
        }

        const after = useAppStore.getState();
        prevFavorites.current = after.favorites;
        prevCollections.current = after.collections;
      } catch (err) {
        console.warn("[sync] reconcile failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [configured, user]);

  // ── Write-through favorite + collection changes ────────────
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!configured || !sb || !user) return;

    const unsub = useAppStore.subscribe((state) => {
      // Favorites diff.
      const prevF = prevFavorites.current;
      if (state.favorites !== prevF) {
        const prevIds = new Set(prevF.map((f) => f.id));
        const curIds = new Set(state.favorites.map((f) => f.id));
        for (const f of state.favorites) {
          if (!prevIds.has(f.id)) void setFavorite(sb, user.id, f, true);
        }
        for (const f of prevF) {
          if (!curIds.has(f.id)) void setFavorite(sb, user.id, f, false);
        }
        prevFavorites.current = state.favorites;
      }

      // Collections diff.
      const prevC = prevCollections.current;
      if (state.collections !== prevC) {
        const prevById = new Map(prevC.map((c) => [c.id, c]));
        const curIds = new Set(state.collections.map((c) => c.id));
        for (const c of state.collections) {
          const before = prevById.get(c.id);
          if (
            !before ||
            before.wallpaperIds.length !== c.wallpaperIds.length ||
            before.name !== c.name
          ) {
            void syncCollection(sb, user.id, c);
          }
        }
        for (const c of prevC) {
          if (!curIds.has(c.id)) void deleteCollection(sb, c.id);
        }
        prevCollections.current = state.collections;
      }
    });

    return () => unsub();
  }, [configured, user]);
}
