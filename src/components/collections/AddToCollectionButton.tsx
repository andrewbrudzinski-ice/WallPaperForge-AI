"use client";

import { useState } from "react";
import { FolderPlus, Plus, Check } from "lucide-react";
import type { GeneratedWallpaper } from "@/types";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * "Add to collection" control with an inline expanding panel (rendered in flow,
 * not as an absolute popover, so it never clips inside a scrollable sheet).
 * Lists existing collections and lets the user create a new one on the spot.
 */
export function AddToCollectionButton({ wallpaper }: { wallpaper: GeneratedWallpaper }) {
  const collections = useAppStore((s) => s.collections);
  const createCollection = useAppStore((s) => s.createCollection);
  const addToCollection = useAppStore((s) => s.addToCollection);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [addedTo, setAddedTo] = useState<string | null>(null);

  function add(id: string, label: string) {
    addToCollection(id, wallpaper);
    setAddedTo(label);
    setOpen(false);
  }

  function createAndAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const c = createCollection(trimmed);
    addToCollection(c.id, wallpaper);
    setAddedTo(c.name);
    setName("");
    setOpen(false);
  }

  function inCollection(id: string): boolean {
    return collections.find((c) => c.id === id)?.wallpaperIds.includes(wallpaper.id) ?? false;
  }

  return (
    <div className="mt-2">
      <Button
        variant="glass"
        size="lg"
        className="w-full"
        onClick={() => {
          setOpen((v) => !v);
          setAddedTo(null);
        }}
      >
        {addedTo ? <Check className="h-5 w-5 text-emerald-400" /> : <FolderPlus className="h-5 w-5" />}
        {addedTo ? `Added to ${addedTo}` : "Add to collection"}
      </Button>

      {open && (
        <div className="mt-2 space-y-2 rounded-2xl border border-white/10 bg-black/30 p-3">
          {collections.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {collections.map((c) => {
                const already = inCollection(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => add(c.id, c.name)}
                    disabled={already}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      already
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                        : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
                    )}
                  >
                    {already ? <Check className="h-3.5 w-3.5" /> : null}
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
              placeholder="New collection…"
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-accent/40 placeholder:text-white/30 focus:ring-2"
            />
            <button
              onClick={createAndAdd}
              disabled={!name.trim()}
              aria-label="Create collection and add"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-soft text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
