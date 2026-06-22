"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Collection,
  DeviceProfile,
  GeneratedWallpaper,
  HistoryEntry,
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
  removeCollection: (collectionId: string) => void;
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

      removeCollection: (collectionId) =>
        set((s) => ({
          collections: s.collections.filter((c) => c.id !== collectionId),
        })),
    }),
    {
      name: "wallpaperforge-store",
      partialize: (s) => ({
        device: s.device,
        onboarded: s.onboarded,
        tier: s.tier,
        usage: s.usage,
        history: s.history,
        favorites: s.favorites,
        collections: s.collections,
      }),
    },
  ),
);
