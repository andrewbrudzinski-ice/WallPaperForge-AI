"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Crown, Zap } from "lucide-react";
import type { GeneratedWallpaper, WallpaperCategory } from "@/types";
import { useAppStore } from "@/store/app-store";
import { useGenerationFlow } from "@/hooks/useGenerationFlow";
import { getEntitlements } from "@/lib/entitlements";
import { randomSurprise } from "@/lib/generation/catalog";
import { BottomNav } from "@/components/nav/BottomNav";
import { ProviderSelector } from "@/components/ui/ProviderSelector";
import { GlassCard } from "@/components/ui/GlassCard";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { QuickActions } from "@/components/home/QuickActions";
import { StyleGrid } from "@/components/home/StyleGrid";
import { RecentStrip } from "@/components/home/RecentStrip";
import { GenerationOverlay } from "@/components/generate/GenerationOverlay";
import { ResultSheet } from "@/components/preview/ResultSheet";

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const device = useAppStore((s) => s.device);
  const onboarded = useAppStore((s) => s.onboarded);
  const tier = useAppStore((s) => s.tier);
  const usageToday = useAppStore((s) => s.usageToday)();
  const history = useAppStore((s) => s.history);
  const setCurrent = useAppStore((s) => s.setCurrent);

  const flow = useGenerationFlow();

  const ent = getEntitlements(tier);
  const remaining =
    ent.dailyLimit === null ? null : Math.max(0, ent.dailyLimit - usageToday);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!onboarded || !device) router.replace("/onboarding");
    }, 60);
    return () => clearTimeout(id);
  }, [onboarded, device, router]);

  if (!device) return null;

  const recent: GeneratedWallpaper[] = history.map((h) => h.wallpaper);

  function openRecent(w: GeneratedWallpaper) {
    setCurrent(w);
    flow.openResult();
  }

  function handleStyle(category: WallpaperCategory) {
    void flow.run({ mode: "random", category });
  }

  return (
    <>
      <AmbientBackground />

      <main className="relative flex flex-1 flex-col pb-4">
        {/* Floating top controls over the hero */}
        <div className="safe-top pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3">
          {remaining === null ? (
            <span className="pointer-events-auto flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/30 to-amber-600/30 px-3 py-1.5 text-xs font-semibold text-amber-100 ring-1 ring-amber-400/40 backdrop-blur-xl">
              <Crown className="h-3.5 w-3.5" /> Premium
            </span>
          ) : (
            <span className="pointer-events-auto flex items-center gap-1 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/10 backdrop-blur-xl">
              <Zap className="h-3.5 w-3.5 text-accent" /> {remaining} left
            </span>
          )}
          <ProviderSelector className="pointer-events-auto" />
        </div>

        {/* Hero */}
        <HeroCarousel recent={recent} />

        {/* Content */}
        <div className="space-y-7 px-4 pt-6">
          {flow.error && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="flex-1">{flow.error}</span>
              <button onClick={() => flow.setError(null)} className="text-rose-200/70">
                Dismiss
              </button>
            </div>
          )}

          <QuickActions
            disabled={flow.loading}
            onRandom={() => flow.run({ mode: "random" })}
            onPrompt={() => router.push("/generate")}
            onSurprise={() => flow.run({ mode: "surprise", surprise: randomSurprise() })}
          />

          <section>
            <SectionHeader
              title="Browse styles"
              action={
                <span className="text-xs font-medium text-white/40">Tap to generate</span>
              }
            />
            <StyleGrid disabled={flow.loading} onPick={handleStyle} />
          </section>

          <section>
            <SectionHeader title="Recently generated" />
            <RecentStrip device={device} recent={recent} onOpen={openRecent} />
          </section>

          <Link href="/gallery" className="block">
            <GlassCard
              interactive
              className="flex items-center gap-3 p-4"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-sky-500/30 text-xl">
                🧭
              </span>
              <div className="flex-1">
                <div className="font-semibold">Explore the community gallery</div>
                <div className="text-xs text-white/50">
                  Discover wallpapers shared by others
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-white/40" />
            </GlassCard>
          </Link>
        </div>
      </main>

      <BottomNav />

      <GenerationOverlay show={flow.loading} />
      <ResultSheet
        open={flow.resultOpen}
        device={device}
        wallpaper={flow.current}
        variations={flow.variations}
        loading={flow.loading}
        variationsLoading={flow.variationsLoading}
        onClose={flow.closeResult}
        onRegenerate={flow.regenerate}
        onVariations={flow.makeVariations}
      />
    </>
  );
}
