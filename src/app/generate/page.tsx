"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { GeneratedWallpaper, SurpriseOptions, WallpaperCategory } from "@/types";
import { useAppStore } from "@/store/app-store";
import { useGenerate } from "@/hooks/useGenerate";
import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { GeneratorPanel } from "@/components/generate/GeneratorPanel";
import { VariationsGrid } from "@/components/generate/VariationsGrid";
import { WallpaperPreview } from "@/components/preview/WallpaperPreview";
import { DevicePreview } from "@/components/preview/DevicePreview";
import { GlassCard } from "@/components/ui/GlassCard";

export default function GeneratePage() {
  const router = useRouter();
  const device = useAppStore((s) => s.device);
  const onboarded = useAppStore((s) => s.onboarded);
  const current = useAppStore((s) => s.current);
  const variations = useAppStore((s) => s.variations);
  const setCurrent = useAppStore((s) => s.setCurrent);

  const { generate, makeVariations, loading, variationsLoading, error, setError } =
    useGenerate();

  // Remember the last request so "Regenerate" repeats it.
  const [lastRequest, setLastRequest] = useState<
    | { mode: "random"; category?: WallpaperCategory }
    | { mode: "prompt"; prompt: string }
    | { mode: "surprise"; surprise: SurpriseOptions }
    | null
  >(null);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!onboarded || !device) router.replace("/onboarding");
    }, 60);
    return () => clearTimeout(id);
  }, [onboarded, device, router]);

  if (!device) return null;

  async function handleRandom(category?: WallpaperCategory) {
    setLastRequest({ mode: "random", category });
    await generate({ mode: "random", category });
  }
  async function handlePrompt(prompt: string) {
    setLastRequest({ mode: "prompt", prompt });
    await generate({ mode: "prompt", prompt });
  }
  async function handleSurprise(surprise: SurpriseOptions) {
    setLastRequest({ mode: "surprise", surprise });
    await generate({ mode: "surprise", surprise });
  }
  async function handleRegenerate() {
    if (!lastRequest) return;
    await generate(lastRequest);
  }
  async function handleVariations() {
    if (current) await makeVariations(current);
  }
  function handleSelectVariation(w: GeneratedWallpaper) {
    setCurrent(w);
  }

  return (
    <>
      <AppHeader />

      <main className="flex flex-1 flex-col gap-5 px-4 pb-6">
        {/* Hero preview */}
        <section className="pt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-[240px]"
          >
            <DevicePreview
              device={device}
              imageUrl={current?.imageUrl ?? null}
              mode={current ? "full" : "lock"}
            />
          </motion.div>
          {!current && (
            <p className="mt-3 text-center text-sm text-white/50">
              Your device-perfect wallpaper appears here.
            </p>
          )}
        </section>

        {error && (
          <GlassCard className="flex items-center gap-3 border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-200/70 hover:text-white"
            >
              Dismiss
            </button>
          </GlassCard>
        )}

        {/* Preview + actions (only after a generation) */}
        {current && (
          <WallpaperPreview
            device={device}
            wallpaper={current}
            onRegenerate={handleRegenerate}
            onVariations={handleVariations}
            variationsLoading={variationsLoading}
            loading={loading}
          />
        )}

        {/* Variations */}
        <VariationsGrid
          device={device}
          variations={variations}
          onSelect={handleSelectVariation}
        />

        {/* Generator controls */}
        <GeneratorPanel
          loading={loading}
          onRandom={handleRandom}
          onPrompt={handlePrompt}
          onSurprise={handleSurprise}
        />
      </main>

      <BottomNav />
    </>
  );
}
