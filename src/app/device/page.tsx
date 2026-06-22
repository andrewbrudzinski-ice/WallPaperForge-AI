"use client";

import { useRouter } from "next/navigation";
import { Smartphone, Crown, Check, RefreshCw, Shield } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { getEntitlements } from "@/lib/entitlements";
import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { DevicePreview } from "@/components/preview/DevicePreview";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 text-sm last:border-0">
      <span className="text-white/50">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function DevicePage() {
  const router = useRouter();
  const device = useAppStore((s) => s.device);
  const tier = useAppStore((s) => s.tier);
  const setTier = useAppStore((s) => s.setTier);
  const ent = getEntitlements(tier);

  if (!device) {
    return (
      <>
        <AppHeader />
        <main className="flex flex-1 items-center justify-center px-4">
          <Button onClick={() => router.push("/onboarding")}>Select a device</Button>
        </main>
        <BottomNav />
      </>
    );
  }

  const z = device.safeZones;
  const cutout = z.cutouts[0];

  return (
    <>
      <AmbientBackground />
      <AppHeader showBrand={false} />
      <main className="flex flex-1 flex-col gap-5 px-4 pb-6 pt-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Smartphone className="h-6 w-6 text-accent" /> Profile
        </h1>

        <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
          <div className="mx-auto w-40">
            <DevicePreview device={device} mode="lock" imageUrl={null} showZones />
            <p className="mt-2 text-center text-xs text-white/50">
              Safe-zone map
            </p>
          </div>

          <GlassCard className="p-4">
            <h2 className="mb-1 text-lg font-semibold">{device.displayName}</h2>
            <p className="mb-3 text-sm text-white/50">
              {device.manufacturer} · {device.releaseYear}
            </p>
            <Row label="Resolution" value={`${device.width} × ${device.height}px`} />
            <Row label="Aspect ratio" value={device.aspectRatio} />
            <Row
              label="Camera cutout"
              value={cutout ? cutout.type.replace("-", " ") : "none"}
            />
            <Row
              label="Lock-clock clearance"
              value={`top ${Math.round((z.lockClock.y + z.lockClock.height) * 100)}%`}
            />
            <Row
              label="Focal safe zone"
              value={`${Math.round(z.focalSafeZone.y * 100)}–${Math.round(
                (z.focalSafeZone.y + z.focalSafeZone.height) * 100,
              )}% vertical`}
            />
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => router.push("/onboarding")}
            >
              <RefreshCw className="h-4 w-4" /> Change device
            </Button>
          </GlassCard>
        </div>

        {/* Plan / premium architecture demo */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
            <Crown className="h-4 w-4 text-amber-300" /> Plan
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <GlassCard
              className={`p-4 ${tier === "free" ? "ring-2 ring-accent" : ""}`}
            >
              <h3 className="font-semibold">Free</h3>
              <ul className="mt-2 space-y-1 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" /> 10 generations/day
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" /> Device-perfect optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" /> Variations & favorites
                </li>
              </ul>
              {tier !== "free" && (
                <Button
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() => setTier("free")}
                >
                  Switch to Free
                </Button>
              )}
            </GlassCard>

            <GlassCard
              className={`p-4 ${tier === "premium" ? "ring-2 ring-amber-400" : ""}`}
            >
              <h3 className="flex items-center gap-2 font-semibold">
                Premium <Crown className="h-4 w-4 text-amber-300" />
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-300" /> Unlimited generations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-300" /> 4K wallpapers & faster queue
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-300" /> Exclusive styles · no ads
                </li>
              </ul>
              <Button
                className="mt-4 w-full"
                onClick={() => setTier(tier === "premium" ? "free" : "premium")}
              >
                {tier === "premium" ? "Active — tap to simulate Free" : "Simulate Premium"}
              </Button>
            </GlassCard>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-white/40">
            <Shield className="h-3.5 w-3.5" />
            Payments aren&apos;t wired up yet — the toggle simulates entitlements so
            premium gating ({ent.maxResolution === "4k" ? "4K enabled" : "1× output"})
            can be tested end-to-end.
          </p>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
