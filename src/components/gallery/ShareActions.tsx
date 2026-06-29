"use client";

import { Download, Share2 } from "lucide-react";
import { downloadImage, slugify } from "@/lib/utils";

/** Download / share buttons for the public wallpaper page (client-side). */
export function ShareActions({
  imageUrl,
  description,
}: {
  imageUrl: string;
  description: string;
}) {
  async function download() {
    await downloadImage(imageUrl, `wallpaperforge-${slugify(description)}`);
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : undefined;
    if (navigator.share) {
      try {
        await navigator.share({ title: "WallpaperForge AI", text: description, url });
      } catch {
        /* cancelled */
      }
    } else if (navigator.clipboard && url) {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <button
        onClick={download}
        className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur-xl active:scale-95"
      >
        <Download className="h-4 w-4" /> Download
      </button>
      <button
        onClick={share}
        className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur-xl active:scale-95"
      >
        <Share2 className="h-4 w-4" /> Share
      </button>
    </div>
  );
}
