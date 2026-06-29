"use client";

import { useState } from "react";
import { Clock, Download, Heart, Eye, Search } from "lucide-react";
import type { WallpaperCategory } from "@/types";
import { useAppStore } from "@/store/app-store";
import { filterHistory, historyCategories } from "@/lib/history-filter";
import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { DevicePreview } from "@/components/preview/DevicePreview";
import { GlassCard } from "@/components/ui/GlassCard";
import { downloadImage, formatDate, slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const device = useAppStore((s) => s.device);
  const history = useAppStore((s) => s.history);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFavorite = useAppStore((s) => s.isFavorite);
  const setCurrent = useAppStore((s) => s.setCurrent);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<WallpaperCategory | null>(null);
  const categories = historyCategories(history);
  const filtered = filterHistory(history, { query, category });

  return (
    <>
      <AmbientBackground />
      <AppHeader showBrand={false} />
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Clock className="h-6 w-6 text-accent" /> Generation History
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {history.length} generation{history.length === 1 ? "" : "s"} · re-download anytime
          </p>
        </div>

        {history.length === 0 ? (
          <GlassCard className="flex flex-col items-center gap-2 p-10 text-center text-white/50">
            <Clock className="h-8 w-8" />
            <p>Nothing generated yet. Create your first wallpaper!</p>
          </GlassCard>
        ) : (
          <>
            {/* Search + category filter */}
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3">
              <Search className="h-4 w-4 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your history…"
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-white/30"
              />
            </div>
            {categories.length > 0 && (
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                <FilterChip active={category === null} onClick={() => setCategory(null)}>
                  All
                </FilterChip>
                {categories.map((c) => (
                  <FilterChip
                    key={c}
                    active={category === c}
                    onClick={() => setCategory(category === c ? null : c)}
                  >
                    {c}
                  </FilterChip>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <GlassCard className="flex flex-col items-center gap-2 p-10 text-center text-white/50">
                <Search className="h-8 w-8" />
                <p>No generations match your search.</p>
              </GlassCard>
            ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((entry) => {
              const w = entry.wallpaper;
              const fav = isFavorite(w.id);
              return (
                <GlassCard key={entry.id} className="flex items-center gap-3 p-3">
                  {device && (
                    <div className="w-14 shrink-0">
                      <DevicePreview device={device} imageUrl={w.imageUrl} mode="full" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {w.description}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-white/45">
                      <span className="capitalize">{w.mode}</span>
                      {w.category && <span>· {w.category}</span>}
                      <span>· {formatDate(w.createdAt)}</span>
                      <span>· {w.provider}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setCurrent(w)}
                      className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(w)}
                      className={cn(
                        "rounded-lg p-2 hover:bg-white/10",
                        fav ? "text-accent" : "text-white/60 hover:text-white",
                      )}
                      title="Favorite"
                    >
                      <Heart className={cn("h-4 w-4", fav && "fill-current")} />
                    </button>
                    <button
                      onClick={() =>
                        downloadImage(
                          w.imageUrl,
                          `wallpaperforge-${slugify(w.description)}`,
                        )
                      }
                      className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-all",
        active
          ? "border-accent/60 bg-accent/20 text-white"
          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}
