"use client";

import Link from "next/link";
import { Sparkles, Crown, Zap } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { getEntitlements } from "@/lib/entitlements";

/** Top app bar: brand, device chip, and remaining-quota indicator. */
export function AppHeader() {
  const device = useAppStore((s) => s.device);
  const tier = useAppStore((s) => s.tier);
  const usageToday = useAppStore((s) => s.usageToday)();
  const ent = getEntitlements(tier);
  const remaining =
    ent.dailyLimit === null ? null : Math.max(0, ent.dailyLimit - usageToday);

  return (
    <header className="safe-top sticky top-0 z-30 flex items-center justify-between gap-2 px-5 py-3 backdrop-blur-xl">
      <Link href="/generate" className="flex items-center gap-2 font-bold">
        <Sparkles className="h-5 w-5 text-accent" />
        <span>WallpaperForge</span>
      </Link>

      <div className="flex items-center gap-2">
        {device && (
          <Link
            href="/device"
            className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 sm:block"
          >
            {device.displayName}
          </Link>
        )}
        {remaining === null ? (
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-600/20 px-3 py-1.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/30">
            <Crown className="h-3.5 w-3.5" /> Premium
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/10">
            <Zap className="h-3.5 w-3.5 text-accent" /> {remaining} left
          </span>
        )}
      </div>
    </header>
  );
}
