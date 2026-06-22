"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { GeneratedWallpaper } from "@/types";
import { CATEGORY_STYLES, FEATURED_CATEGORIES } from "@/lib/generation/category-style";

interface Slide {
  key: string;
  imageUrl?: string;
  gradient: string;
  title: string;
  subtitle: string;
}

/**
 * Large full-width hero at the top of Home. Auto-rotates between the user's
 * most recent creations (when available) and curated gradient "featured"
 * art, with a subtle parallax lift as the page scrolls.
 */
export function HeroCarousel({ recent }: { recent: GeneratedWallpaper[] }) {
  const slides: Slide[] = (() => {
    const fromRecent: Slide[] = recent.slice(0, 4).map((w, i) => ({
      key: `recent-${w.id}-${i}`,
      imageUrl: w.imageUrl,
      gradient: "linear-gradient(135deg,#7c5cff,#38bdf8)",
      title: "Your latest creation",
      subtitle: w.description,
    }));
    const fromCurated: Slide[] = FEATURED_CATEGORIES.slice(0, 4).map((c) => ({
      key: `curated-${c}`,
      gradient: CATEGORY_STYLES[c].gradient,
      title: `Featured · ${c}`,
      subtitle: CATEGORY_STYLES[c].tagline,
    }));
    return fromRecent.length >= 2 ? fromRecent : fromCurated;
  })();

  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 60]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.08]);
  const slide = slides[i];

  return (
    <div className="relative h-[44vh] min-h-[320px] w-full overflow-hidden rounded-b-[2.5rem]">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={slide.key}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ y, scale }}
        >
          {slide.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.imageUrl}
              alt={slide.subtitle}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full" style={{ background: slide.gradient }} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Legibility gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

      {/* Copy */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> WallpaperForge AI
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.key + "-text"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold tracking-tight">{slide.title}</h1>
            <p className="mt-1 line-clamp-1 text-sm text-white/60">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        {slides.length > 1 && (
          <div className="mt-3 flex gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.key}
                onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
