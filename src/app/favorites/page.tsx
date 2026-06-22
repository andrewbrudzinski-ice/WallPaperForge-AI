"use client";

import { useState } from "react";
import { Heart, FolderPlus, Trash2, Download, FolderOpen } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { DevicePreview } from "@/components/preview/DevicePreview";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { downloadImage, slugify } from "@/lib/utils";

export default function FavoritesPage() {
  const device = useAppStore((s) => s.device);
  const favorites = useAppStore((s) => s.favorites);
  const collections = useAppStore((s) => s.collections);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const createCollection = useAppStore((s) => s.createCollection);
  const addToCollection = useAppStore((s) => s.addToCollection);
  const removeCollection = useAppStore((s) => s.removeCollection);
  const setCurrent = useAppStore((s) => s.setCurrent);

  const [newName, setNewName] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <>
      <AmbientBackground />
      <AppHeader showBrand={false} />
      <main className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-2">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Heart className="h-6 w-6 text-accent" /> Favorites
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {favorites.length} saved wallpaper{favorites.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Collections */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white/70">
              <FolderOpen className="h-4 w-4" /> Collections
            </h2>
          </div>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New collection name"
              className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none ring-accent/40 placeholder:text-white/30 focus:ring-2"
            />
            <Button
              variant="secondary"
              disabled={!newName.trim()}
              onClick={() => {
                createCollection(newName.trim());
                setNewName("");
              }}
            >
              <FolderPlus className="h-4 w-4" /> Create
            </Button>
          </div>
          {collections.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {collections.map((c) => (
                <GlassCard
                  key={c.id}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <div className="flex items-center gap-3">
                    {c.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.coverUrl}
                        alt=""
                        className="h-12 w-9 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-9 rounded-lg bg-white/10" />
                    )}
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-white/50">
                        {c.wallpaperIds.length} item
                        {c.wallpaperIds.length === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCollection(c.id)}
                    className="rounded-xl p-2 text-white/40 hover:bg-white/10 hover:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* Favorites grid */}
        <section>
          {favorites.length === 0 ? (
            <GlassCard className="flex flex-col items-center gap-2 p-10 text-center text-white/50">
              <Heart className="h-8 w-8" />
              <p>No favorites yet. Tap the heart on any wallpaper to save it.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {favorites.map((w) => (
                <div key={w.id} className="relative">
                  {device && (
                    <button
                      className="block w-full"
                      onClick={() => setCurrent(w)}
                    >
                      <DevicePreview device={device} imageUrl={w.imageUrl} mode="full" />
                    </button>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <button
                      onClick={() =>
                        downloadImage(
                          w.imageUrl,
                          `wallpaperforge-${slugify(w.description)}.png`,
                        )
                      }
                      className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveMenu(activeMenu === w.id ? null : w.id)
                      }
                      className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                      title="Add to collection"
                    >
                      <FolderPlus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(w)}
                      className="rounded-lg p-1.5 text-accent hover:bg-white/10"
                      title="Remove favorite"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  {activeMenu === w.id && collections.length > 0 && (
                    <GlassCard className="absolute z-10 mt-1 w-full p-2 text-xs">
                      {collections.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            addToCollection(c.id, w);
                            setActiveMenu(null);
                          }}
                          className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-white/10"
                        >
                          {c.name}
                        </button>
                      ))}
                    </GlassCard>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </>
  );
}
