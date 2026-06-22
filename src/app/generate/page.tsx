"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useGenerationFlow } from "@/hooks/useGenerationFlow";
import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { GeneratorPanel } from "@/components/generate/GeneratorPanel";
import { DevicePreview } from "@/components/preview/DevicePreview";
import { GenerationOverlay } from "@/components/generate/GenerationOverlay";
import { ResultSheet } from "@/components/preview/ResultSheet";

export default function CreatePage() {
  const router = useRouter();
  const device = useAppStore((s) => s.device);
  const onboarded = useAppStore((s) => s.onboarded);
  const flow = useGenerationFlow();

  useEffect(() => {
    const id = setTimeout(() => {
      if (!onboarded || !device) router.replace("/onboarding");
    }, 60);
    return () => clearTimeout(id);
  }, [onboarded, device, router]);

  if (!device) return null;

  return (
    <>
      <AmbientBackground />
      <AppHeader showBrand={false} />

      <main className="flex flex-1 flex-col gap-5 px-4 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create</h1>
          <p className="mt-1 text-sm text-white/50">
            Pick a vibe or describe your dream wallpaper.
          </p>
        </div>

        {/* Hero preview of the latest result */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => flow.current && flow.openResult()}
          className="mx-auto w-full max-w-[220px]"
        >
          <DevicePreview
            device={device}
            imageUrl={flow.current?.imageUrl ?? null}
            mode={flow.current ? "full" : "lock"}
          />
          <p className="mt-2 text-center text-xs text-white/45">
            {flow.current ? "Tap to open result" : "Your wallpaper appears here"}
          </p>
        </motion.button>

        {flow.error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="flex-1">{flow.error}</span>
            <button onClick={() => flow.setError(null)} className="text-rose-200/70">
              Dismiss
            </button>
          </div>
        )}

        <GeneratorPanel
          loading={flow.loading}
          onRandom={(category) => flow.run({ mode: "random", category })}
          onPrompt={(prompt) => flow.run({ mode: "prompt", prompt })}
          onSurprise={(surprise) => flow.run({ mode: "surprise", surprise })}
        />
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
