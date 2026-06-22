"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, Smartphone } from "lucide-react";
import type { DeviceProfile, Manufacturer } from "@/types";
import {
  MANUFACTURERS,
  getDevicesByManufacturer,
} from "@/lib/devices/devices";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { DevicePreview } from "@/components/preview/DevicePreview";
import { cn } from "@/lib/utils";

type Step = "welcome" | "manufacturer" | "model";

const MANUFACTURER_EMOJI: Record<Manufacturer, string> = {
  Apple: "",
  Samsung: "",
  "Google Pixel": "",
  OnePlus: "",
  Motorola: "",
  Other: "",
};

export default function Onboarding() {
  const router = useRouter();
  const setDevice = useAppStore((s) => s.setDevice);

  const [step, setStep] = useState<Step>("welcome");
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [selected, setSelected] = useState<DeviceProfile | null>(null);

  const models = manufacturer ? getDevicesByManufacturer(manufacturer) : [];

  function save() {
    if (!selected) return;
    setDevice(selected);
    router.replace("/generate");
  }

  return (
    <div className="flex min-h-screen flex-col px-5 py-8">
      {/* Progress dots */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {(["welcome", "manufacturer", "model"] as Step[]).map((s) => (
          <span
            key={s}
            className={cn(
              "h-1.5 rounded-full transition-all",
              step === s ? "w-8 bg-accent" : "w-1.5 bg-white/20",
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-accent to-accent-soft shadow-2xl shadow-accent/30">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              WallpaperForge AI
            </h1>
            <p className="mt-3 max-w-xs text-balance text-white/60">
              AI wallpapers crafted for your exact phone — subjects stay clear of
              clocks, widgets, notches, and app icons.
            </p>
            <Button
              size="lg"
              className="mt-10 w-full max-w-xs"
              onClick={() => setStep("manufacturer")}
            >
              Get started <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {step === "manufacturer" && (
          <motion.div
            key="manufacturer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-1 flex-col"
          >
            <h2 className="text-2xl font-bold">Who makes your phone?</h2>
            <p className="mt-1 text-white/50">Pick your manufacturer.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {MANUFACTURERS.map((m) => (
                <GlassCard
                  key={m}
                  interactive
                  onClick={() => {
                    setManufacturer(m);
                    setSelected(null);
                    setStep("model");
                  }}
                  className="flex h-28 flex-col items-center justify-center gap-2 p-4 text-center"
                >
                  <span className="text-2xl">{MANUFACTURER_EMOJI[m]}</span>
                  <span className="font-semibold">{m}</span>
                </GlassCard>
              ))}
            </div>
            <Button
              variant="ghost"
              className="mt-6 self-start"
              onClick={() => setStep("welcome")}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </motion.div>
        )}

        {step === "model" && (
          <motion.div
            key="model"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-1 flex-col"
          >
            <h2 className="text-2xl font-bold">Select your model</h2>
            <p className="mt-1 text-white/50">{manufacturer} devices</p>

            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto]">
              <div className="no-scrollbar flex max-h-[52vh] flex-col gap-2 overflow-y-auto pr-1">
                {models.map((d) => (
                  <GlassCard
                    key={d.id}
                    interactive
                    onClick={() => setSelected(d)}
                    className={cn(
                      "flex items-center justify-between gap-3 p-4",
                      selected?.id === d.id && "border-accent/60 bg-accent/10",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-white/60" />
                      <div>
                        <div className="font-semibold">{d.displayName}</div>
                        <div className="text-xs text-white/50">
                          {d.width}×{d.height} · {d.aspectRatio} · {d.releaseYear}
                        </div>
                      </div>
                    </div>
                    {selected?.id === d.id && (
                      <Check className="h-5 w-5 text-accent" />
                    )}
                  </GlassCard>
                ))}
              </div>

              {selected && (
                <div className="hidden w-40 shrink-0 md:block">
                  <DevicePreview
                    device={selected}
                    mode="lock"
                    imageUrl={null}
                    showZones
                  />
                  <p className="mt-2 text-center text-xs text-white/50">
                    Safe-zone preview
                  </p>
                </div>
              )}
            </div>

            <div className="mt-auto flex items-center gap-3 pt-6">
              <Button
                variant="ghost"
                onClick={() => setStep("manufacturer")}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                className="flex-1"
                size="lg"
                disabled={!selected}
                onClick={save}
              >
                Save device <Check className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
