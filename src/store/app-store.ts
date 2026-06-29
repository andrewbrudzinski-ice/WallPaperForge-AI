"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Collection,
  DeviceProfile,
  GeneratedWallpaper,
  HistoryEntry,
  ProviderId,
  Tier,
} from "@/types";

/**
 * Client app store (Zustand + localStorage persistence).
 *
 * This is the source of truth on the client and makes the entire app work with
 * zero backend configuration. When Supabase credentials are present, the same
 * shapes map 1:1 to the SQL schema, so a sync layer can be added without
 * changing components. Device selection persists permanently here, satisfying
 * the "remember the device" requirement.
 */

interface AppState {
  // Onboarding / device
  device: DeviceProfile | null;
  onboarded: boolean;
  setDevice: (device: DeviceProfile) => void;
  clearDevice: () => void;

  // Entitlements
  tier: Tier;
  setTier: (tier: Tier) => void;

  // Selected AI image provider (remembered across sessions).
  provider: ProviderId;
  setProvider: (provider: ProviderId) => void;

  // Daily usage (UTC day key + count) — mirrors generation_history quota.
  usage: { dayKey: string; count: number };
  incrementUsage: () => void;
  usageToday: () => number;

  // Current preview
  current: GeneratedWallpaper | null;
  variations: GeneratedWallpaper[];
  setCurrent: (w: GeneratedWallpaper | null) => void;
  setVariations: (w: GeneratedWallpaper[]) => void;

  // Library
  history: HistoryEntry[];
  favorites: GeneratedWallpaper[];
  collections: Collection[];

  addToHistory: (w: GeneratedWallpaper) => void;
  toggleFavorite: (w: GeneratedWallpaper) => void;
  isFavorite: (id: string) => boolean;

  createCollection: (name: string) => Collection;
  addToCollection: (collectionId: string, w: GeneratedWallpaper) => void;
  removeFromCollection: (collectionId: string, wallpaperId: string) => void;
  removeCollection: (collectionId: string) => void;

  /** Merge a Supabase snapshot into local state (used on sign-in). */
  hydrateFromServer: (data: {
    wallpapers: GeneratedWallpaper[];
    favoriteIds: string[];
    collections: Collection[];
  }) => void;

  /** Wipe all local data (Settings → clear data). */
  resetAll: () => void;
}

function utcDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      device: null,
      onboarded: false,
      setDevice: (device) => set({ device, onboarded: true }),
      clearDevice: () => set({ device: null, onboarded: false }),

      tier: "free",
      setTier: (tier) => set({ tier }),

      provider: "openai",
      setProvider: (provider) => set({ provider }),

      usage: { dayKey: utcDayKey(), count: 0 },
      incrementUsage: () => {
        const today = utcDayKey();
        const { usage } = get();
        const count = usage.dayKey === today ? usage.count + 1 : 1;
        set({ usage: { dayKey: today, count } });
      },
      usageToday: () => {
        const { usage } = get();
        return usage.dayKey === utcDayKey() ? usage.count : 0;
      },

      current: null,
      variations: [],
      setCurrent: (current) => set({ current }),
      setVariations: (variations) => set({ variations }),

      history: [],
      favorites: [],
      collections: [],

      addToHistory: (w) =>
        set((s) => ({
          history: [
            { id: w.id, wallpaper: w, createdAt: w.createdAt },
            ...s.history,
          ].slice(0, 200),
        })),

      toggleFavorite: (w) =>
        set((s) => {
          const exists = s.favorites.some((f) => f.id === w.id);
          return {
            favorites: exists
              ? s.favorites.filter((f) => f.id !== w.id)
              : [{ ...w, isFavorite: true }, ...s.favorites],
          };
        }),

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      createCollection: (name) => {
        const collection: Collection = {
          id: crypto.randomUUID(),
          name,
          coverUrl: null,
          wallpaperIds: [],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ collections: [collection, ...s.collections] }));
        return collection;
      },

      addToCollection: (collectionId, w) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  coverUrl: c.coverUrl ?? w.imageUrl,
                  wallpaperIds: c.wallpaperIds.includes(w.id)
                    ? c.wallpaperIds
                    : [w.id, ...c.wallpaperIds],
                }
              : c,
          ),
        })),

      removeFromCollection: (collectionId, wallpaperId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, wallpaperIds: c.wallpaperIds.filter((id) => id !== wallpaperId) }
              : c,
          ),
        })),

      removeCollection: (collectionId) =>
        set((s) => ({
          collections: s.collections.filter((c) => c.id !== collectionId),
        })),

      hydrateFromServer: ({ wallpapers, favoriteIds, collections }) =>
        set((s) => {
          // Union all known wallpapers by id (server wins on conflict).
          const byId = new Map<string, GeneratedWallpaper>();
          for (const e of s.history) byId.set(e.wallpaper.id, e.wallpaper);
          for (const f of s.favorites) byId.set(f.id, f);
          for (const w of wallpapers) byId.set(w.id, w);
          const all = Array.from(byId.values()).sort(
            (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
          );

          const favSet = new Set<string>([
            ...favoriteIds,
            ...s.favorites.map((f) => f.id),
          ]);
          const favorites = all
            .filter((w) => favSet.has(w.id))
            .map((w) => ({ ...w, isFavorite: true }));
          const history = all
            .map((w) => ({ id: w.id, wallpaper: w, createdAt: w.createdAt }))
            .slice(0, 200);

          // Merge collections by id, unioning membership.
          const colById = new Map<string, Collection>();
          for (const c of s.collections) colById.set(c.id, c);
          for (const c of collections) {
            const local = colById.get(c.id);
            colById.set(
              c.id,
              local
                ? {
                    ...c,
                    wallpaperIds: Array.from(
                      new Set([...c.wallpaperIds, ...local.wallpaperIds]),
                    ),
                  }
                : c,
            );
          }

          return { history, favorites, collections: Array.from(colById.values()) };
        }),

      resetAll: () =>
        set({
          device: null,
          onboarded: false,
          tier: "free",
          provider: "openai",
          usage: { dayKey: utcDayKey(), count: 0 },
          current: null,
          variations: [],
          history: [],
          favorites: [],
          collections: [],
        }),
    }),
    {
      name: "wallpaperforge-store",
      partialize: (s) => ({
        device: s.device,
        onboarded: s.onboarded,
        tier: s.tier,
        provider: s.provider,
        usage: s.usage,
        history: s.history,
        favorites: s.favorites,
        collections: s.collections,
      }),
    },
  ),
);
