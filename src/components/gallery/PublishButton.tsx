"use client";

import { useState } from "react";
import { Globe, Check, Loader2, Copy } from "lucide-react";
import type { GeneratedWallpaper } from "@/types";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

/**
 * "Share to gallery" control. Visible only when Supabase is configured and the
 * user is signed in (publishing requires an owner). On success it publishes the
 * wallpaper and copies the public link.
 */
export function PublishButton({ wallpaper }: { wallpaper: GeneratedWallpaper }) {
  const { configured, user } = useAuthContext();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (!configured || !user) return null;

  async function publish() {
    setState("busy");
    setMsg(null);
    try {
      const res = await fetch("/api/gallery/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallpaperId: wallpaper.id, publish: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMsg(data.error ?? "Couldn't publish.");
        return;
      }
      setUrl(data.url);
      setState("done");
      if (navigator.clipboard && data.url) {
        await navigator.clipboard.writeText(data.url);
        setMsg("Public link copied to clipboard");
      }
    } catch {
      setState("error");
      setMsg("Network error.");
    }
  }

  async function copy() {
    if (url && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setMsg("Link copied");
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={state === "done" ? copy : publish}
        disabled={state === "busy"}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors active:scale-[0.98]",
          state === "done"
            ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
            : "border-white/15 bg-white/10 text-white hover:bg-white/15",
        )}
      >
        {state === "busy" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : state === "done" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        {state === "done" ? "Shared — copy link" : "Share to gallery"}
        {state === "done" && <Copy className="h-3.5 w-3.5 opacity-70" />}
      </button>
      {msg && (
        <p
          className={cn(
            "mt-1.5 text-center text-xs",
            state === "error" ? "text-rose-300" : "text-white/50",
          )}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
