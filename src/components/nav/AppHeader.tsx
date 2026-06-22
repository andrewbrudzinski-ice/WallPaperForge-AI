"use client";

import Link from "next/link";
import { Sparkles, Crown, Zap } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { getEntitlements } from "@/lib/entitlements";
import { ProviderSelector } from "@/components/ui/ProviderSelector";

interface AppHeaderProps {
  /** Hide the brand lockup (e.g. when a page renders its own title). */
  showBrand?: boolean;
  /** Hide the model selector on screens where it isn't relevant. */
  showProvider?: boolean;
}

/** Top app bar: brand, model selector, and remaining-quota indicator. */
export function AppHeader({ showBrand = true, showProvider = true }: AppHeaderProps) {
  const tier = useAppStore((s) => s.tier);
  const usageToday = useAppStore((s) => s.usageToday)();
  const ent = getEntitlements(tier);
  const remaining =
    ent.dailyLimit === null ? null : Math.max(0, ent.dailyLimit - usageToday);

  return (
    <header className="safe-top sticky top-0 z-30 flex items-center justify-between gap-2 px-4 py-3 backdrop-blur-xl">
      {showBrand ? (
        <Link href="/home" className="flex items-center gap-2 font-bold">
          <Sparkles className="h-5 w-5 text-accent" />
          <span>WallpaperForge</span>
        </Link>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-2">
        {remaining === null ? (
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-600/20 px-3 py-1.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/30">
            <Crown className="h-3.5 w-3.5" /> Premium
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/10">
            <Zap className="h-3.5 w-3.5 text-accent" /> {remaining} left
          </span>
        )}
        {showProvider && <ProviderSelector />}
      </div>
    </header>
  );
}
