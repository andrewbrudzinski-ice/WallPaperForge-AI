"use client";

import { motion } from "framer-motion";
import type { WallpaperCategory } from "@/types";
import {
  CATEGORY_STYLES,
  FEATURED_CATEGORIES,
} from "@/lib/generation/category-style";
import { CategoryArt } from "./CategoryArt";

interface StyleGridProps {
  onPick: (category: WallpaperCategory) => void;
  disabled?: boolean;
}

/**
 * Large, image-led category cards. Tapping a card immediately generates a
 * wallpaper in that style (the core "2-tap" flow). Cards use rich gradient
 * thumbnails so the grid is instant and beautiful with zero API calls.
 */
export function StyleGrid({ onPick, disabled }: StyleGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FEATURED_CATEGORIES.map((category, i) => {
        const s = CATEGORY_STYLES[category];
        return (
          <motion.button
            key={category}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
            whileTap={{ scale: 0.96 }}
            disabled={disabled}
            onClick={() => onPick(category)}
            className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 text-left shadow-lg disabled:opacity-60"
          >
            <CategoryArt
              category={category}
              className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-110"
            />
            {/* Frosted glyph watermark */}
            <span className="absolute right-3 top-3 text-3xl opacity-80 drop-shadow-lg">
              {s.glyph}
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3.5">
              <div className="text-base font-bold drop-shadow">{category}</div>
              <div className="text-xs text-white/70">{s.tagline}</div>
            </div>
            {/* Tap-to-generate affordance */}
            <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
              Tap to generate
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
