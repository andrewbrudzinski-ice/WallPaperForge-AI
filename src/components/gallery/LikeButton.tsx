"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

/**
 * Like / unlike a public wallpaper with optimistic update. The count is always
 * shown; the control is only interactive when Supabase is configured and the
 * user is signed in.
 */
export function LikeButton({
  wallpaperId,
  initialCount,
  initialLiked = false,
  size = "md",
}: {
  wallpaperId: string;
  initialCount: number;
  initialLiked?: boolean;
  size?: "sm" | "md";
}) {
  const { configured, user } = useAuthContext();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);
  const canLike = Boolean(configured && user);

  async function toggle() {
    if (!canLike || busy) return;
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    setBusy(true);
    try {
      const res = await fetch("/api/gallery/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallpaperId, like: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLiked(!next); // revert
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={!canLike}
      title={canLike ? (liked ? "Unlike" : "Like") : "Sign in to like"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3.5 py-2 text-sm",
        liked
          ? "bg-rose-500/20 text-rose-200"
          : "bg-white/10 text-white/80 hover:bg-white/15",
        canLike ? "active:scale-95" : "cursor-default opacity-90",
      )}
    >
      <Heart
        className={cn(
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
          liked && "fill-current",
        )}
      />
      {count}
    </button>
  );
}
