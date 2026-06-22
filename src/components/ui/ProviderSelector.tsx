"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Cpu } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { PROVIDERS_UI, providerUI } from "@/lib/providers/ui";
import { cn } from "@/lib/utils";

/**
 * Premium pill + floating dropdown for choosing the AI image provider. The
 * selection is persisted in the store (and survives reloads). The backend
 * already routes by this value and falls back to the mock provider when a
 * chosen provider has no API key configured.
 */
export function ProviderSelector({ className }: { className?: string }) {
  const provider = useAppStore((s) => s.provider);
  const setProvider = useAppStore((s) => s.setProvider);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = providerUI(provider);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-semibold backdrop-blur-xl transition-all hover:bg-white/15 active:scale-95"
      >
        <Cpu className="h-4 w-4 text-accent" />
        <span className="text-white/60">Model</span>
        <span>{active.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-white/50 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-1.5 shadow-2xl backdrop-blur-2xl"
          >
            {PROVIDERS_UI.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  p.id === provider ? "bg-white/10" : "hover:bg-white/5",
                )}
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent/30 to-accent-soft/30 text-base">
                  {p.glyph}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    {p.label}
                    {p.dev && (
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/50">
                        dev
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-white/45">{p.tagline}</span>
                </span>
                {p.id === provider && <Check className="h-4 w-4 text-accent" />}
              </button>
            ))}
            <p className="px-3 py-2 text-[11px] leading-snug text-white/35">
              Uses the mock provider automatically if the selected model has no
              API key configured.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
