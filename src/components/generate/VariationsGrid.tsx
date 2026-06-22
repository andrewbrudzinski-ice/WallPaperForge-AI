"use client";

import type { DeviceProfile, GeneratedWallpaper } from "@/types";
import { DevicePreview } from "@/components/preview/DevicePreview";
import { GlassCard } from "@/components/ui/GlassCard";

interface VariationsGridProps {
  device: DeviceProfile;
  variations: GeneratedWallpaper[];
  onSelect: (w: GeneratedWallpaper) => void;
}

/** 2×2 grid of generated variations; tapping one promotes it to the preview. */
export function VariationsGrid({
  device,
  variations,
  onSelect,
}: VariationsGridProps) {
  if (variations.length === 0) return null;
  return (
    <GlassCard className="p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-white/70">
        Variations — tap to preview
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {variations.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v)}
            className="group text-left"
          >
            <DevicePreview
              device={device}
              imageUrl={v.imageUrl}
              mode="full"
              className="transition-transform group-hover:scale-[1.03] group-active:scale-95"
            />
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
