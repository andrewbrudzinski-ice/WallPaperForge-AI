"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, ImageOff, Loader2, Sparkles } from "lucide-react";
import type { PublicWallpaper } from "@/types";
import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { GlassCard } from "@/components/ui/GlassCard";

export default function GalleryPage() {
  const [wallpapers, setWallpapers] = useState<PublicWallpaper[] | null>(null);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setWallpapers(d.wallpapers ?? []);
        setConfigured(d.configured !== false);
      })
      .catch(() => active && setWallpapers([]));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <AmbientBackground />
      <AppHeader showBrand={false} />

      <main className="flex flex-1 flex-col gap-5 px-4 pb-6 pt-2">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Compass className="h-6 w-6 text-accent" /> Community Gallery
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Wallpapers shared by the community. Tap any to view and remix.
          </p>
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
            <Link
              href="/home"
              className="mt-2 text-sm font-semibold text-accent hover:underline"
            >
              Back to creating
            </Link>
          </GlassCard>
        )}

        {wallpapers !== null && configured && wallpapers.length === 0 && (
          <GlassCard className="flex flex-col items-center gap-2 p-10 text-center text-white/50">
            <Sparkles className="h-8 w-8" />
            <p className="max-w-xs text-sm">
              No public wallpapers yet. Generate one and tap{" "}
              <span className="font-semibold text-white/70">Share to gallery</span>{" "}
              to be the first.
            </p>
          </GlassCard>
        )}

        {wallpapers && wallpapers.length > 0 && (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
            {wallpapers.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                className="break-inside-avoid"
              >
                <Link
                  href={`/w/${w.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-white/10 shadow-lg"
                >
                  <div className="relative" style={{ aspectRatio: `${w.width} / ${w.height}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={w.imageUrl}
                      alt={w.description}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="line-clamp-2 text-xs font-medium text-white/90">
                        {w.description}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}
