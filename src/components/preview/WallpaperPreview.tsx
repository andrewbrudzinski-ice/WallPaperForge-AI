"use client";

import { useState } from "react";
import {
  Download,
  Heart,
  RefreshCw,
  Share2,
  Layers,
  Eye,
} from "lucide-react";
import type { DeviceProfile, GeneratedWallpaper } from "@/types";
import { DevicePreview, type PreviewMode } from "./DevicePreview";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Spinner } from "@/components/ui/Spinner";
import { useAppStore } from "@/store/app-store";
import { downloadImage, slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WallpaperPreviewProps {
  device: DeviceProfile;
  wallpaper: GeneratedWallpaper;
  onRegenerate: () => void;
  onVariations: () => void;
  variationsLoading: boolean;
  loading: boolean;
}

const SIM_TABS: { id: PreviewMode; label: string }[] = [
  { id: "full", label: "Full" },
  { id: "lock", label: "Lock Screen" },
  { id: "home", label: "Home Screen" },
];

/** Preview screen: simulation tabs + the full action bar. */
export function WallpaperPreview({
  device,
  wallpaper,
  onRegenerate,
  onVariations,
  variationsLoading,
  loading,
}: WallpaperPreviewProps) {
  const [sim, setSim] = useState<PreviewMode>("lock");
  const [showZones, setShowZones] = useState(false);

  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFavorite = useAppStore((s) => s.isFavorite)(wallpaper.id);

  async function handleDownload() {
    await downloadImage(
      wallpaper.imageUrl,
      `wallpaperforge-${slugify(wallpaper.description)}-${device.id}.png`,
    );
  }

  async function handleShare() {
    const shareData = {
      title: "WallpaperForge AI",
      text: wallpaper.description,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url ?? "");
    }
  }

  return (
    <GlassCard className="overflow-hidden p-4 sm:p-5">
      {/* Simulation switcher */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-black/30 p-1 text-sm">
          {SIM_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSim(t.id)}
              className={cn(
                "rounded-xl px-3 py-1.5 font-medium transition-all",
                sim === t.id ? "bg-white/10 text-white" : "text-white/50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowZones((v) => !v)}
          className={cn(
            "flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
            showZones ? "bg-accent/20 text-white" : "text-white/50 hover:text-white/80",
          )}
          title="Toggle safe-zone overlay"
        >
          <Eye className="h-4 w-4" /> Zones
        </button>
      </div>

      {/* Preview */}
      <div className="mx-auto max-w-[260px]">
        <DevicePreview
          device={device}
          imageUrl={wallpaper.imageUrl}
          mode={sim}
          showZones={showZones}
        />
      </div>

      <p className="mt-3 text-center text-sm text-white/60">
        {wallpaper.description}
      </p>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button
          variant={isFavorite ? "primary" : "glass"}
          onClick={() => toggleFavorite(wallpaper)}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          {isFavorite ? "Saved" : "Save"}
        </Button>
        <Button variant="glass" onClick={handleDownload}>
          <Download className="h-4 w-4" /> Download
        </Button>
        <Button variant="glass" onClick={handleShare}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
        <Button variant="glass" onClick={onRegenerate} disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
          Regenerate
        </Button>
        <Button
          variant="secondary"
          className="col-span-2 sm:col-span-1"
          onClick={onVariations}
          disabled={variationsLoading}
        >
          {variationsLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Layers className="h-4 w-4" />
          )}
          Variations
        </Button>
      </div>
    </GlassCard>
  );
}
