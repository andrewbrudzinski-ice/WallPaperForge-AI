"use client";

import { useCallback, useState } from "react";
import type {
  GenerateRequest,
  GeneratedWallpaper,
  SurpriseOptions,
  WallpaperCategory,
} from "@/types";
import { useAppStore } from "@/store/app-store";
import { getEntitlements, hasReachedDailyLimit } from "@/lib/entitlements";

interface GenerateOpts {
  mode: GenerateRequest["mode"];
  prompt?: string;
  category?: WallpaperCategory;
  surprise?: SurpriseOptions;
}

/**
 * Drives wallpaper generation from client components: enforces the local daily
 * quota for offline/free mode, calls the API, and writes results into the store
 * (current preview + history + usage).
 */
export function useGenerate() {
  const device = useAppStore((s) => s.device);
  const tier = useAppStore((s) => s.tier);
  const usageToday = useAppStore((s) => s.usageToday);
  const incrementUsage = useAppStore((s) => s.incrementUsage);
  const setCurrent = useAppStore((s) => s.setCurrent);
  const setVariations = useAppStore((s) => s.setVariations);
  const addToHistory = useAppStore((s) => s.addToHistory);

  const [loading, setLoading] = useState(false);
  const [variationsLoading, setVariationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entitlements = getEntitlements(tier);

  const generate = useCallback(
    async (opts: GenerateOpts): Promise<GeneratedWallpaper | null> => {
      if (!device) {
        setError("Select your device first.");
        return null;
      }
      if (hasReachedDailyLimit(tier, usageToday())) {
        setError("You've hit today's free limit. Upgrade for unlimited generations.");
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        const req: GenerateRequest & { tier: string; usedToday: number } = {
          mode: opts.mode,
          device,
          prompt: opts.prompt,
          category: opts.category,
          surprise: opts.surprise,
          highRes: entitlements.maxResolution === "4k",
          tier,
          usedToday: usageToday(),
        };

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Generation failed.");
          return null;
        }

        const wallpaper = data.wallpapers[0] as GeneratedWallpaper;
        incrementUsage();
        setCurrent(wallpaper);
        setVariations([]);
        addToHistory(wallpaper);
        return wallpaper;
      } catch {
        setError("Network error. Please try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      device,
      tier,
      usageToday,
      entitlements.maxResolution,
      incrementUsage,
      setCurrent,
      setVariations,
      addToHistory,
    ],
  );

  const makeVariations = useCallback(
    async (base: GeneratedWallpaper): Promise<GeneratedWallpaper[]> => {
      if (!device) return [];
      setVariationsLoading(true);
      setError(null);
      try {
        const req = {
          mode: "prompt" as const,
          device,
          prompt: base.description,
          category: base.category ?? undefined,
          highRes: entitlements.maxResolution === "4k",
          variationOf: base.id,
          tier,
          count: 4,
        };
        const res = await fetch("/api/variations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Could not generate variations.");
          return [];
        }
        const wallpapers = data.wallpapers as GeneratedWallpaper[];
        setVariations(wallpapers);
        wallpapers.forEach(addToHistory);
        return wallpapers;
      } catch {
        setError("Network error generating variations.");
        return [];
      } finally {
        setVariationsLoading(false);
      }
    },
    [device, tier, entitlements.maxResolution, setVariations, addToHistory],
  );

  return { generate, makeVariations, loading, variationsLoading, error, setError };
}
