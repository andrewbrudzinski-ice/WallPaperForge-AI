"use client";

import Link from "next/link";
import { ArrowLeft, Download, Trash2, FolderOpen } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { collectionWallpapers, wallpaperPool } from "@/lib/collections";
import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { DevicePreview } from "@/components/preview/DevicePreview";
import { downloadImage, slugify } from "@/lib/utils";

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  const device = useAppStore((s) => s.device);
  const collections = useAppStore((s) => s.collections);
  const history = useAppStore((s) => s.history);
  const favorites = useAppStore((s) => s.favorites);
  const removeFromCollection = useAppStore((s) => s.removeFromCollection);

  const collection = collections.find((c) => c.id === params.id);
  const wallpapers = collection
    ? collectionWallpapers(collection, wallpaperPool(history, favorites))
    : [];

  return (
    <>
      <AmbientBackground />
      <AppHeader showBrand={false} />

      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        <Link
          href="/favorites"
          className="flex w-fit items-center gap-1.5 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Favorites
        </Link>

        {!collection ? (
          <GlassCard className="flex flex-col items-center gap-2 p-10 text-center text-white/50">
            <FolderOpen className="h-8 w-8" />
            <p>This collection no longer exists.</p>
          </GlassCard>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{collection.name}</h1>
              <p className="mt-1 text-sm text-white/50">
                {wallpapers.length} wallpaper{wallpapers.length === 1 ? "" : "s"}
              </p>
            </div>

            {wallpapers.length === 0 ? (
              <GlassCard className="flex flex-col items-center gap-2 p-10 text-center text-white/50">
                <FolderOpen className="h-8 w-8" />
                <p className="max-w-xs text-sm">
                  This collection is empty. Add wallpapers from Favorites using the
                  folder button.
                </p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {wallpapers.map((w) => (
                  <div key={w.id}>
                    {device && (
                      <DevicePreview device={device} imageUrl={w.imageUrl} mode="full" />
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        onClick={() =>
                          downloadImage(w.imageUrl, `wallpaperforge-${slugify(w.description)}`)
                        }
                        className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                        aria-label="Download"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCollection(collection.id, w.id)}
                        className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-rose-300"
                        aria-label="Remove from collection"
                        title="Remove from collection"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </>
  );
}
