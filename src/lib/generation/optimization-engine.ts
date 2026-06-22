import type {
  DeviceProfile,
  GenerateRequest,
  NormalizedRect,
  WallpaperCategory,
} from "@/types";
import {
  CATEGORY_IDEAS,
  COMPLEXITY_DESCRIPTORS,
  MOOD_DESCRIPTORS,
  pick,
} from "./catalog";

/**
 * The AI Wallpaper Optimization Engine.
 *
 * Translates a device's safe-zone profile into natural-language composition
 * instructions, then combines them with the user's creative intent into a
 * single enhanced prompt. Users never see these instructions — they only see
 * the short, friendly `description`.
 */

export interface EnhancedPrompt {
  /** The full prompt sent to the image model. */
  prompt: string;
  /** A short, user-facing summary of what is being generated. */
  description: string;
  /** The resolved category (for tagging / history). */
  category: WallpaperCategory | null;
}

function pct(n: number): number {
  return Math.round(n * 100);
}

/** Describe a normalized rect in plain words an image model understands. */
function describeRegion(label: string, r: NormalizedRect): string {
  const top = pct(r.y);
  const bottom = pct(r.y + r.height);
  const left = pct(r.x);
  const right = pct(r.x + r.width);
  return `${label} occupies roughly the area from ${left}%–${right}% horizontally and ${top}%–${bottom}% vertically`;
}

/**
 * Build the device-specific composition constraints. This is the heart of the
 * "device-aware" promise: the model is told exactly which regions to keep clean
 * and where to anchor the focal subject.
 */
export function buildCompositionInstructions(device: DeviceProfile): string {
  const { safeZones: z } = device;
  const lines: string[] = [];

  lines.push(
    `Compose for a vertical ${device.aspectRatio} phone screen (${device.width}x${device.height}px).`,
  );

  // Top clearance for the lock-screen clock.
  const clockBottom = pct(z.lockClock.y + z.lockClock.height);
  lines.push(
    `Leave the top ~${clockBottom}% of the frame visually calm and uncluttered for the lock-screen clock and date — no important subjects, faces, or text there.`,
  );

  // Camera cutouts.
  if (z.cutouts.length > 0) {
    const c = z.cutouts[0];
    const kind =
      c.type === "dynamic-island"
        ? "Dynamic Island"
        : c.type === "notch"
          ? "display notch"
          : "punch-hole camera";
    lines.push(
      `Keep the very top-center clear of fine detail to sit cleanly behind the ${kind}.`,
    );
  }

  // Focal anchoring.
  lines.push(
    `Place the main focal subject within the lower-middle safe zone (${describeRegion("this band", z.focalSafeZone)}), fully visible and well-composed.`,
  );

  // Home-screen icon legibility.
  lines.push(
    `Keep the lower ~60% relatively balanced so home-screen app icons stay legible; avoid harsh high-frequency clutter across the icon grid.`,
  );

  lines.push(
    "Full-bleed edge-to-edge composition, no borders, no UI elements, no watermarks, no text.",
  );

  return lines.join(" ");
}

/** Resolve the creative concept depending on the generation mode. */
function resolveConcept(req: GenerateRequest): {
  concept: string;
  description: string;
  category: WallpaperCategory | null;
} {
  switch (req.mode) {
    case "prompt": {
      const p = (req.prompt ?? "").trim() || "an abstract gradient wallpaper";
      return { concept: p, description: p, category: req.category ?? null };
    }
    case "surprise": {
      const s = req.surprise;
      const mood = s?.mood ?? "Epic";
      const palette = s?.palette ?? "Midnight Blue";
      const style = s?.style ?? "Cinematic";
      const complexity = s?.complexity ?? "Balanced";
      const category = req.category ?? null;
      const seed = category
        ? pick(CATEGORY_IDEAS[category])
        : "an imaginative original scene";
      const concept = `${seed}, ${style} style, ${palette} color palette, ${MOOD_DESCRIPTORS[mood]}, ${COMPLEXITY_DESCRIPTORS[complexity]}`;
      const description = `${mood} ${style.toLowerCase()} in ${palette.toLowerCase()}`;
      return { concept, description, category };
    }
    case "random":
    default: {
      const category =
        req.category ??
        (Object.keys(CATEGORY_IDEAS) as WallpaperCategory[])[
          Math.floor(Math.random() * Object.keys(CATEGORY_IDEAS).length)
        ];
      const idea = pick(CATEGORY_IDEAS[category]);
      return {
        concept: `${category}: ${idea}`,
        description: `${category} — ${idea}`,
        category,
      };
    }
  }
}

/** Variation directives applied when generating alternates of a base concept. */
export const VARIATION_DIRECTIVES: string[] = [
  "with a strikingly different color palette and lighting",
  "from a different camera angle and perspective",
  "in a different artistic style and mood",
  "with dramatically different time-of-day lighting and atmosphere",
];

/**
 * Combine creative intent + device constraints into the final enhanced prompt.
 * `variationIndex` (when provided) appends a variation directive so a set of
 * alternates stays diverse.
 */
export function enhancePrompt(
  req: GenerateRequest,
  variationIndex?: number,
): EnhancedPrompt {
  const { concept, description, category } = resolveConcept(req);
  const composition = buildCompositionInstructions(req.device);

  const variation =
    typeof variationIndex === "number"
      ? ` ${VARIATION_DIRECTIVES[variationIndex % VARIATION_DIRECTIVES.length]}`
      : "";

  const quality = req.highRes
    ? "Ultra-high-resolution, 4K, crisp details, professional quality."
    : "High-resolution, crisp details, professional quality.";

  const prompt = [
    `Create a stunning phone wallpaper of ${concept}${variation}.`,
    composition,
    quality,
  ].join(" ");

  return { prompt, description, category };
}
