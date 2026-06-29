"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, ImageOff, Loader2, Sparkles, Clock, Flame } from "lucide-react";
import type { GallerySort, PublicWallpaper, WallpaperCategory } from "@/types";
import { CATEGORIES } from "@/lib/generation/catalog";
import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LikeButton } from "@/components/gallery/LikeButton";
import { cn } from "@/lib/utils";

export default function GalleryPage() {
  const [wallpapers, setWallpapers] = useState<PublicWallpaper[] | null>(null);
  const [configured, setConfigured] = useState(true);
  const [category, setCategory] = useState<WallpaperCategory | null>(null);
  const [sort, setSort] = useState<GallerySort>("recent");
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setWallpapers(null);
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      params.set("sort", sort);
      params.set("offset", String(offset));
      try {
        const res = await fetch(`/api/gallery?${params.toString()}`);
        const data = await res.json();
        setConfigured(data.configured !== false);
        setNextOffset(data.nextOffset ?? null);
        setWallpapers((prev) =>
          append && prev ? [...prev, ...(data.wallpapers ?? [])] : (data.wallpapers ?? []),
        );
      } catch {
        if (!append) setWallpapers([]);
      } finally {
        setLoadingMore(false);
      }
    },
    [category, sort],
  );

  useEffect(() => {
    void fetchPage(0, false);
  }, [fetchPage]);

  return (
    <>
      <AmbientBackground />
      <AppHeader showBrand={false} />

      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Compass className="h-6 w-6 text-accent" /> Community Gallery
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Wallpapers shared by the community. Tap any to view and remix.
          </p>
        </div>

        {/* Sort toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-black/30 p-1 text-sm">
          {(
            [
              { id: "recent", label: "Recent", icon: Clock },
              { id: "popular", label: "Popular", icon: Flame },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl py-2 font-semibold transition-all",
                sort === s.id ? "bg-white/10 text-white" : "text-white/50",
              )}
            >
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip active={category === null} onClick={() => setCategory(null)}>
            ✨ All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>

        {wallpapers === null && (
          <div className="flex items-center justify-center gap-2 py-16 text-white/50">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading gallery…
          </div>
        )}

        {wallpapers !== null && !configured && (
          <GlassCard className="flex flex-col items-center gap-2 p-10 text-center text-white/50">
            <ImageOff className="h-8 w-8" />
            <p className="max-w-xs text-sm">
              The community gallery needs Supabase configured. It&apos;s available
              once the backend is connected.
            </p>
            <Link href="/home" className="mt-2 text-sm font-semibold text-accent hover:underline">
              Back to creating
            </Link>
          </GlassCard>
        )}

        {wallpapers !== null && configured && wallpapers.length === 0 && (
          <GlassCard className="flex flex-col items-center gap-2 p-10 text-center text-white/50">
            <Sparkles className="h-8 w-8" />
            <p className="max-w-xs text-sm">
              {category ? `No public ${category} wallpapers yet.` : "No public wallpapers yet."}{" "}
              Generate one and tap{" "}
              <span className="font-semibold text-white/70">Share to gallery</span>.
            </p>
          </GlassCard>
        )}

        {wallpapers && wallpapers.length > 0 && (
          <>
            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
              {wallpapers.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="break-inside-avoid"
                >
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                    <Link href={`/w/${w.slug}`} className="block">
                      <div className="relative" style={{ aspectRatio: `${w.width} / ${w.height}` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={w.imageUrl}
                          alt={w.description}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="line-clamp-2 text-xs font-medium text-white/90">
                            {w.description}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="absolute right-2 top-2">
                      <LikeButton
                        wallpaperId={w.id}
                        initialCount={w.likeCount}
                        initialLiked={w.likedByMe}
                        size="sm"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {nextOffset !== null && (
              <div className="flex justify-center pt-1">
                <Button
                  variant="secondary"
                  onClick={() => fetchPage(nextOffset, true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </>
  );
}

function Chip({
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
