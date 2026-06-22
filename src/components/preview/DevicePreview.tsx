"use client";

import { useState } from "react";
import type { DeviceProfile, NormalizedRect } from "@/types";
import { cn } from "@/lib/utils";

export type PreviewMode = "full" | "lock" | "home";

interface DevicePreviewProps {
  device: DeviceProfile;
  imageUrl?: string | null;
  mode?: PreviewMode;
  /** Show translucent overlays marking the safe zones (debug/explainer). */
  showZones?: boolean;
  className?: string;
}

function pctStyle(r: NormalizedRect): React.CSSProperties {
  return {
    left: `${r.x * 100}%`,
    top: `${r.y * 100}%`,
    width: `${r.width * 100}%`,
    height: `${r.height * 100}%`,
  };
}

/** A faux clock for the lock-screen simulation. */
function LockOverlay({ device }: { device: DeviceProfile }) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute flex flex-col items-center justify-center text-white drop-shadow-lg"
        style={pctStyle(device.safeZones.lockClock)}
      >
        <span className="text-sm font-medium opacity-90">{date}</span>
        <span className="text-5xl font-semibold tracking-tight md:text-6xl">
          {time}
        </span>
      </div>
      {/* Flashlight + camera affordances at the bottom, iOS-style. */}
      <div className="absolute bottom-[3%] left-1/2 flex -translate-x-1/2 gap-16">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur">
          <span className="text-white/90">🔦</span>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur">
          <span className="text-white/90">📷</span>
        </div>
      </div>
    </div>
  );
}

/** A faux app-icon grid for the home-screen simulation. */
function HomeOverlay({ device }: { device: DeviceProfile }) {
  const icons = Array.from({ length: 16 });
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute grid grid-cols-4 gap-x-4 gap-y-5"
        style={pctStyle(device.safeZones.homeIcons)}
      >
        {icons.map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-white/20 backdrop-blur-md ring-1 ring-white/20"
          />
        ))}
      </div>
      {/* Dock */}
      <div className="absolute bottom-[3%] left-1/2 flex w-[88%] -translate-x-1/2 justify-around rounded-3xl bg-white/10 p-3 backdrop-blur-xl ring-1 ring-white/15">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square w-[18%] rounded-2xl bg-white/25" />
        ))}
      </div>
    </div>
  );
}

function ZoneOverlay({ device }: { device: DeviceProfile }) {
  const z = device.safeZones;
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute rounded-lg border border-sky-300/70 bg-sky-400/10"
        style={pctStyle(z.lockClock)}
      >
        <span className="absolute left-1 top-1 text-[8px] font-medium text-sky-100">
          clock
        </span>
      </div>
      <div
        className="absolute rounded-lg border border-emerald-300/70 bg-emerald-400/10"
        style={pctStyle(z.focalSafeZone)}
      >
        <span className="absolute left-1 top-1 text-[8px] font-medium text-emerald-100">
          focal safe zone
        </span>
      </div>
      {z.cutouts.map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-rose-300/80 bg-rose-500/20"
          style={pctStyle(c.rect)}
        />
      ))}
    </div>
  );
}

/**
 * Renders a device-accurate phone frame at the exact aspect ratio, with the
 * wallpaper inside and optional lock/home/zone overlays. Used for the hero
 * preview and the preview screen simulations.
 */
export function DevicePreview({
  device,
  imageUrl,
  mode = "full",
  showZones = false,
  className,
}: DevicePreviewProps) {
  const [loaded, setLoaded] = useState(false);
  const island = device.safeZones.cutouts[0];

  return (
    <div
      className={cn(
        "relative mx-auto overflow-hidden rounded-[2.2rem] border border-white/15 bg-surface shadow-2xl ring-1 ring-black/40",
        className,
      )}
      style={{ aspectRatio: `${device.width} / ${device.height}` }}
    >
      {/* Wallpaper */}
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Wallpaper preview"
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}

      {!imageUrl || !loaded ? (
        <div className="shimmer absolute inset-0 bg-gradient-to-br from-white/[0.04] to-white/[0.01]" />
      ) : null}

      {/* Physical cutout (Dynamic Island / notch / punch-hole) */}
      {island ? (
        <div
          className={cn(
            "absolute z-20 bg-black",
            island.type === "punch-hole" ? "rounded-full" : "rounded-full",
          )}
          style={pctStyle(island.rect)}
        />
      ) : null}

      {/* Mode overlays */}
      {mode === "lock" && <LockOverlay device={device} />}
      {mode === "home" && <HomeOverlay device={device} />}
      {showZones && <ZoneOverlay device={device} />}
    </div>
  );
}
