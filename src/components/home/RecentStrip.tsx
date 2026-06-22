"use client";

import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import type { DeviceProfile, GeneratedWallpaper } from "@/types";

interface RecentStripProps {
  device: DeviceProfile;
  recent: GeneratedWallpaper[];
  onOpen: (w: GeneratedWallpaper) => void;
}

/**
 * Horizontally-scrolling strip of the user's recent creations. Tapping a card
 * reopens it in the result sheet. Renders a soft empty state before the first
 * generation so the section never looks broken.
 */
export function RecentStrip({ device, recent, onOpen }: RecentStripProps) {
  if (recent.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-white/45">
        <ImageIcon className="h-5 w-5" />
        Your generated wallpapers will appear here.
      </div>
    );
  }

  const ratio = `${device.width} / ${device.height}`;

  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
      {recent.slice(0, 12).map((w, i) => (
        <motion.button
          key={w.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: Math.min(i * 0.05, 0.3) }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpen(w)}
          className="relative w-28 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 shadow-lg"
          style={{ aspectRatio: ratio }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={w.imageUrl}
            alt={w.description}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <span className="line-clamp-1 text-[10px] font-medium text-white/80">
              {w.category ?? w.mode}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
