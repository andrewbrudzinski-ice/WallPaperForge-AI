"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Heart,
  Layers,
  RefreshCw,
  Share2,
  X,
  Maximize2,
  Eye,
} from "lucide-react";
import type { DeviceProfile, GeneratedWallpaper } from "@/types";
import { DevicePreview, type PreviewMode } from "./DevicePreview";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAppStore } from "@/store/app-store";
import { PublishButton } from "@/components/gallery/PublishButton";
import { AddToCollectionButton } from "@/components/collections/AddToCollectionButton";
import { downloadImage, slugify, cn } from "@/lib/utils";

interface ResultSheetProps {
  open: boolean;
  device: DeviceProfile;
  wallpaper: GeneratedWallpaper | null;
  variations: GeneratedWallpaper[];
  loading: boolean;
  variationsLoading: boolean;
  onClose: () => void;
  onRegenerate: () => void;
  onVariations: () => void;
}

const SIM_TABS: { id: PreviewMode; label: string }[] = [
  { id: "full", label: "Full" },
  { id: "lock", label: "Lock" },
  { id: "home", label: "Home" },
];

/**
 * Bottom-sheet result experience: a swipeable carousel of the generated
 * wallpaper plus any variations, lock/home/full simulations, a safe-zone
 * toggle, fullscreen mode, and large touch-friendly actions with tactile
 * (scale) feedback.
 */
export function ResultSheet({
  open,
  device,
  wallpaper,
  variations,
  loading,
  variationsLoading,
  onClose,
  onRegenerate,
  onVariations,
}: ResultSheetProps) {
  const [sim, setSim] = useState<PreviewMode>("lock");
  const [showZones, setShowZones] = useState(false);
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollToIndex(i: number) {
    const el = carouselRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFavoriteFn = useAppStore((s) => s.isFavorite);

  // The carousel shows the current wallpaper first, then variations.
  const slides = useMemo(() => {
    if (!wallpaper) return [] as GeneratedWallpaper[];
    const rest = variations.filter((v) => v.id !== wallpaper.id);
    return [wallpaper, ...rest];
  }, [wallpaper, variations]);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open, wallpaper?.id]);

  // Keyboard: Escape closes, arrows move through the carousel.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (fullscreen) setFullscreen(false);
        else onClose();
      } else if (e.key === "ArrowRight") {
        scrollToIndex(Math.min(slides.length - 1, index + 1));
      } else if (e.key === "ArrowLeft") {
        scrollToIndex(Math.max(0, index - 1));
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, fullscreen, index, slides.length, onClose]);

  const activeSlide = slides[Math.min(index, slides.length - 1)] ?? wallpaper;
  const isFavorite = activeSlide ? isFavoriteFn(activeSlide.id) : false;

  async function handleDownload() {
    if (!activeSlide) return;
    await downloadImage(
      activeSlide.imageUrl,
      `wallpaperforge-${slugify(activeSlide.description)}-${device.id}`,
    );
  }

  async function handleShare() {
    if (!activeSlide) return;
    const data = {
      title: "WallpaperForge AI",
      text: activeSlide.description,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* cancelled */
      }
    } else if (navigator.clipboard && data.url) {
      await navigator.clipboard.writeText(data.url);
    }
  }

  return (
    <AnimatePresence>
      {open && wallpaper && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Wallpaper result"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border-t border-white/15 bg-surface/90 px-4 pb-8 pt-3 backdrop-blur-2xl"
          >
            {/* Grabber + header */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" />
            <div className="mb-3 flex items-center justify-between">
              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-black/30 p-1 text-sm">
                {SIM_TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSim(t.id)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 font-medium transition-all",
                      sim === t.id ? "bg-white/15 text-white" : "text-white/50",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowZones((v) => !v)}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl transition-colors",
                    showZones ? "bg-accent/20 text-white" : "text-white/50 hover:bg-white/10",
                  )}
                  title="Toggle safe zones"
                  aria-label="Toggle safe-zone overlay"
                  aria-pressed={showZones}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setFullscreen(true)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-white/50 hover:bg-white/10"
                  title="Fullscreen"
                  aria-label="View fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-xl text-white/50 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Swipeable carousel */}
            <div
              ref={carouselRef}
              className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto"
              onScroll={(e) => {
                const el = e.currentTarget;
                const i = Math.round(el.scrollLeft / el.clientWidth);
                if (i !== index) setIndex(i);
              }}
            >
              {slides.map((w) => (
                <div
                  key={w.id}
                  className="w-full shrink-0 snap-center"
                >
                  <div className="mx-auto max-w-[240px]">
                    <DevicePreview
                      device={device}
                      imageUrl={w.imageUrl}
                      mode={sim}
                      showZones={showZones}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel dots */}
            {slides.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToIndex(i)}
                    aria-label={`Go to wallpaper ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === index ? "w-5 bg-accent" : "w-1.5 bg-white/25",
                    )}
                  />
                ))}
              </div>
            )}

            <p className="mt-3 text-center text-sm text-white/60">
              {activeSlide?.description}
            </p>

            {/* Actions (Button variants carry their own active:scale feedback) */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Button
                variant={isFavorite ? "primary" : "glass"}
                size="lg"
                onClick={() => activeSlide && toggleFavorite(activeSlide)}
              >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                {isFavorite ? "Saved" : "Save"}
              </Button>
              <Button variant="glass" size="lg" onClick={handleDownload}>
                <Download className="h-5 w-5" /> Download
              </Button>
              <Button variant="glass" size="lg" onClick={onRegenerate} disabled={loading}>
                {loading ? <Spinner className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
                Regenerate
              </Button>
              <Button variant="glass" size="lg" onClick={handleShare}>
                <Share2 className="h-5 w-5" /> Share
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="col-span-2 w-full"
                onClick={onVariations}
                disabled={variationsLoading}
              >
                {variationsLoading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <Layers className="h-5 w-5" />
                )}
                Generate 4 Variations
              </Button>
            </div>

            {activeSlide && <AddToCollectionButton wallpaper={activeSlide} />}
            {activeSlide && <PublishButton wallpaper={activeSlide} />}
          </motion.div>

          {/* Fullscreen preview */}
          <AnimatePresence>
            {fullscreen && activeSlide && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[70] flex items-center justify-center bg-black"
                onClick={() => setFullscreen(false)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeSlide.imageUrl}
                  alt={activeSlide.description}
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  onClick={() => setFullscreen(false)}
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur-xl"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
