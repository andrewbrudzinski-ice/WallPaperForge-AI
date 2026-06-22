"use client";

import { motion } from "framer-motion";
import { Dice5, PenLine, Sparkles } from "lucide-react";

interface QuickActionsProps {
  onRandom: () => void;
  onPrompt: () => void;
  onSurprise: () => void;
  disabled?: boolean;
}

/**
 * The three dominant quick-actions. "Surprise Me" is the hero (full width,
 * one-tap generation); Random and Create-from-prompt sit beneath it. Each has
 * tactile press feedback.
 */
export function QuickActions({
  onRandom,
  onPrompt,
  onSurprise,
  disabled,
}: QuickActionsProps) {
  return (
    <div className="space-y-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={disabled}
        onClick={onSurprise}
        className="relative flex w-full items-center gap-4 overflow-hidden rounded-3xl border border-white/15 p-5 text-left shadow-xl disabled:opacity-60"
        style={{
          background:
            "linear-gradient(120deg,#7c5cff 0%,#b14bff 45%,#38bdf8 100%)",
        }}
      >
        <div className="shimmer pointer-events-none absolute inset-0 opacity-40" />
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
          ✨
        </span>
        <span className="relative">
          <span className="block text-lg font-bold">Surprise Me</span>
          <span className="block text-sm text-white/80">
            One tap — AI invents everything
          </span>
        </span>
        <Sparkles className="relative ml-auto h-5 w-5 text-white/80" />
      </motion.button>

      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={disabled}
          onClick={onRandom}
          className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/[0.06] p-4 text-left backdrop-blur-xl transition-colors hover:bg-white/[0.1] disabled:opacity-60"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/30 to-orange-500/30 text-xl">
            🎲
          </span>
          <span className="text-base font-semibold">Random</span>
          <span className="text-xs text-white/50">Instant surprise</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={disabled}
          onClick={onPrompt}
          className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/[0.06] p-4 text-left backdrop-blur-xl transition-colors hover:bg-white/[0.1] disabled:opacity-60"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-400/30 to-indigo-500/30 text-xl">
            ✍️
          </span>
          <span className="text-base font-semibold">Create</span>
          <span className="text-xs text-white/50">From your prompt</span>
        </motion.button>
      </div>
    </div>
  );
}
