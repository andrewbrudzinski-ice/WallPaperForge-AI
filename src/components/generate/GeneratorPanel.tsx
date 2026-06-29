"use client";

import { useState } from "react";
import { Shuffle, Wand2, Dice5, Sparkles } from "lucide-react";
import type {
  Complexity,
  Mood,
  SurpriseOptions,
  WallpaperCategory,
} from "@/types";
import {
  CATEGORIES,
  COMPLEXITIES,
  MOODS,
  PALETTES,
  STYLES,
} from "@/lib/generation/catalog";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type Mode = "random" | "prompt" | "surprise";

interface GeneratorPanelProps {
  loading: boolean;
  onRandom: (category?: WallpaperCategory) => void;
  onPrompt: (prompt: string) => void;
  onSurprise: (opts: SurpriseOptions) => void;
  /** Pre-fill the prompt box and open the Prompt tab (e.g. gallery remix). */
  initialPrompt?: string;
}

const PROMPT_EXAMPLES = [
  "Futuristic cyberpunk city at night",
  "Dragon flying over snowy mountains",
  "Minimal black and gold luxury wallpaper",
  "Neon racing car under rain",
  "Space station orbiting Saturn",
];

const TABS: { id: Mode; label: string; icon: typeof Shuffle }[] = [
  { id: "random", label: "Random", icon: Shuffle },
  { id: "prompt", label: "Prompt", icon: Wand2 },
  { id: "surprise", label: "Surprise", icon: Dice5 },
];

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-all",
        active
          ? "border-accent/60 bg-accent/20 text-white"
          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

/** The three-mode generation control surface for the main screen. */
export function GeneratorPanel({
  loading,
  onRandom,
  onPrompt,
  onSurprise,
  initialPrompt = "",
}: GeneratorPanelProps) {
  const [tab, setTab] = useState<Mode>(initialPrompt ? "prompt" : "random");

  // random
  const [randomCategory, setRandomCategory] = useState<WallpaperCategory | null>(
    null,
  );

  // prompt
  const [prompt, setPrompt] = useState(initialPrompt);

  // surprise
  const [mood, setMood] = useState<Mood>("Epic");
  const [palette, setPalette] = useState(PALETTES[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [complexity, setComplexity] = useState<Complexity>("Balanced");

  return (
    <GlassCard className="p-4 sm:p-5">
      {/* Tabs */}
      <div className="mb-5 grid grid-cols-3 gap-1 rounded-2xl bg-black/30 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all",
              tab === id
                ? "bg-white/10 text-white shadow-inner"
                : "text-white/50 hover:text-white/80",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Random */}
      {tab === "random" && (
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Every press creates something brand new. Pick a category or leave it
            to chance.
          </p>
          <div className="no-scrollbar flex flex-wrap gap-2">
            <Chip
              active={randomCategory === null}
              onClick={() => setRandomCategory(null)}
            >
              ✨ Any
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                active={randomCategory === c}
                onClick={() => setRandomCategory(c)}
              >
                {c}
              </Chip>
            ))}
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={() => onRandom(randomCategory ?? undefined)}
          >
            {loading ? <Spinner /> : <Shuffle className="h-5 w-5" />}
            Generate Random Wallpaper
          </Button>
        </div>
      )}

      {/* Prompt */}
      {tab === "prompt" && (
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your wallpaper…"
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm outline-none ring-accent/40 placeholder:text-white/30 focus:ring-2"
          />
          <div className="no-scrollbar flex flex-wrap gap-2">
            {PROMPT_EXAMPLES.map((ex) => (
              <Chip key={ex} active={false} onClick={() => setPrompt(ex)}>
                {ex}
              </Chip>
            ))}
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={loading || prompt.trim().length === 0}
            onClick={() => onPrompt(prompt.trim())}
          >
            {loading ? <Spinner /> : <Wand2 className="h-5 w-5" />}
            Generate
          </Button>
        </div>
      )}

      {/* Surprise */}
      {tab === "surprise" && (
        <div className="space-y-5">
          <p className="text-sm text-white/60">
            Set the vibe — the AI invents the rest.
          </p>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
              Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <Chip key={m} active={mood === m} onClick={() => setMood(m)}>
                  {m}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
              Color palette
            </label>
            <div className="flex flex-wrap gap-2">
              {PALETTES.map((p) => (
                <Chip key={p} active={palette === p} onClick={() => setPalette(p)}>
                  {p}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
              Style
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <Chip key={s} active={style === s} onClick={() => setStyle(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
              Complexity
            </label>
            <div className="flex flex-wrap gap-2">
              {COMPLEXITIES.map((c) => (
                <Chip
                  key={c}
                  active={complexity === c}
                  onClick={() => setComplexity(c)}
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={() => onSurprise({ mood, palette, style, complexity })}
          >
            {loading ? <Spinner /> : <Sparkles className="h-5 w-5" />}
            Surprise Me
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
