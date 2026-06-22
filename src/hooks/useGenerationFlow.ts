"use client";

import { useCallback, useRef, useState } from "react";
import type { SurpriseOptions, WallpaperCategory } from "@/types";
import { useAppStore } from "@/store/app-store";
import { useGenerate } from "./useGenerate";

type GenInput =
  | { mode: "random"; category?: WallpaperCategory }
  | { mode: "prompt"; prompt: string }
  | { mode: "surprise"; surprise: SurpriseOptions; category?: WallpaperCategory };

/**
 * High-level generation flow used by the Home and Create screens. Wraps
 * {@link useGenerate} and adds: the premium loading overlay trigger, automatic
 * opening of the result sheet on success, and a remembered last request so
 * "Regenerate" repeats it. Keeps the page components declarative — they just
 * call `run(...)` and render the overlay + sheet from the returned state.
 */
export function useGenerationFlow() {
  const gen = useGenerate();
  const current = useAppStore((s) => s.current);
  const variations = useAppStore((s) => s.variations);

  const [resultOpen, setResultOpen] = useState(false);
  const lastRequest = useRef<GenInput | null>(null);

  const run = useCallback(
    async (input: GenInput) => {
      lastRequest.current = input;
      const w = await gen.generate(input);
      if (w) setResultOpen(true);
    },
    [gen],
  );

  const regenerate = useCallback(async () => {
    if (lastRequest.current) await gen.generate(lastRequest.current);
  }, [gen]);

  const makeVariations = useCallback(async () => {
    if (current) await gen.makeVariations(current);
  }, [gen, current]);

  return {
    run,
    regenerate,
    makeVariations,
    current,
    variations,
    loading: gen.loading,
    variationsLoading: gen.variationsLoading,
    error: gen.error,
    setError: gen.setError,
    resultOpen,
    openResult: () => setResultOpen(true),
    closeResult: () => setResultOpen(false),
  };
}
