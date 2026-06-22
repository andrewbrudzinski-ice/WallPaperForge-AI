import type { WallpaperCategory } from "@/types";
import {
  CATEGORY_ART,
  seededRng,
  type Motif,
} from "./category-art";

/**
 * Framework-agnostic SVG motif generator — the single source of truth for the
 * illustrated artwork used in BOTH the home-screen style cards (rendered as a
 * data-URL <img>) and the mock provider's generated wallpapers. Producing the
 * same scenes from one place is what makes the demo results visually match the
 * browse cards.
 *
 * Pure string output (no React), so it runs identically on the server (mock
 * provider, Node) and the client (cards, SSR + hydration).
 */

// ── Color helpers ────────────────────────────────────────────
function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function darken(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l * (1 - amount)));
}

function shiftHue(hex: string, deg: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex((h + deg + 360) % 360, s, l);
}

// ── Prompt → motif inference (when no explicit category) ─────
const KEYWORD_CATEGORY: [RegExp, WallpaperCategory][] = [
  [/space|galaxy|cosmos|saturn|planet|nebula|star|orbit|astronaut/i, "Space"],
  [/cyber|neon|night city|blade|hologram/i, "Cyberpunk"],
  [/city|skyline|downtown|urban|street/i, "Cities"],
  [/mountain|peak|alps|valley|cliff/i, "Mountains"],
  [/forest|nature|tree|meadow|jungle|flower/i, "Nature"],
  [/ocean|sea|wave|underwater|reef|beach/i, "Ocean"],
  [/dragon|fantasy|magic|elf|myth|castle/i, "Fantasy"],
  [/car|racing|race|supercar|drift|road/i, "Cars"],
  [/sport|athlete|stadium|run|basketball|soccer/i, "Sports"],
  [/fire|ice|lava|glacier|ember|frost/i, "Fire & Ice"],
  [/game|gaming|arena|quest|dungeon/i, "Gaming"],
  [/minimal|simple|clean|luxury|gold|abstract/i, "Minimalist"],
];

const ALL_CATEGORIES = Object.keys(CATEGORY_ART) as WallpaperCategory[];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export interface ResolvedArt {
  motif: Motif;
  bg: string;
  accent: string;
}

/**
 * Decide the motif + palette for a generation. Prefers an explicit category;
 * otherwise infers one from prompt keywords; otherwise hashes the prompt to a
 * stable category. `variationIndex` rotates the palette hue so a set of
 * variations reads as distinct.
 */
export function resolveArt(opts: {
  category?: WallpaperCategory | null;
  prompt?: string;
  variationIndex?: number;
}): ResolvedArt {
  let category = opts.category ?? null;
  if (!category && opts.prompt) {
    const match = KEYWORD_CATEGORY.find(([re]) => re.test(opts.prompt!));
    category = match
      ? match[1]
      : ALL_CATEGORIES[hash(opts.prompt) % ALL_CATEGORIES.length];
  }
  const spec = CATEGORY_ART[category ?? "Abstract"];
  const shift = (opts.variationIndex ?? 0) * 47;
  return {
    motif: spec.motif,
    bg: shift ? shiftHue(spec.colors[0], shift) : spec.colors[0],
    accent: shift ? shiftHue(spec.colors[1], shift) : spec.colors[1],
  };
}

// ── Scene builders (string SVG) ──────────────────────────────
interface SceneCtx {
  rng: () => number;
  W: number;
  H: number;
  accent: string;
  uid: string;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function cosmos({ rng, W, H, accent, uid }: SceneCtx): string {
  const count = Math.min(180, Math.round((28 * (W * H)) / (200 * 250)));
  let stars = "";
  for (let i = 0; i < count; i++) {
    stars += `<circle cx="${r2(rng() * W)}" cy="${r2(rng() * H * 0.85)}" r="${r2(
      0.4 + rng() * 1.4,
    )}" fill="#fff" opacity="${r2(0.3 + rng() * 0.7)}"/>`;
  }
  const px = W * (0.32 + rng() * 0.18);
  const py = H * (0.6 + rng() * 0.12);
  const pr = Math.min(W, H) * 0.14;
  return (
    `<circle cx="${r2(W * 0.7)}" cy="${r2(H * 0.28)}" r="${r2(
      Math.min(W, H) * 0.32,
    )}" fill="url(#${uid}-neb)" opacity="0.6"/>` +
    stars +
    `<circle cx="${r2(px)}" cy="${r2(py)}" r="${r2(pr)}" fill="url(#${uid}-planet)"/>` +
    `<ellipse cx="${r2(px)}" cy="${r2(py)}" rx="${r2(pr * 1.7)}" ry="${r2(
      pr * 0.42,
    )}" fill="none" stroke="${accent}" stroke-width="${r2(
      Math.min(W, H) * 0.012,
    )}" opacity="0.7" transform="rotate(-18 ${r2(px)} ${r2(py)})"/>`
  );
}

function peaks({ rng, W, H, accent, uid }: SceneCtx): string {
  const sunX = W * (0.6 + rng() * 0.22);
  const sunY = H * (0.24 + rng() * 0.08);
  const sr = Math.min(W, H) * 0.09;
  const ridge = (base: number, jag: number) => {
    let d = `M0 ${r2(H)} L0 ${r2(base)}`;
    for (let x = 0; x <= W; x += W / 6) {
      d += ` L${r2(x)} ${r2(base - rng() * jag)}`;
    }
    return d + ` L${r2(W)} ${r2(H)} Z`;
  };
  return (
    `<circle cx="${r2(sunX)}" cy="${r2(sunY)}" r="${r2(sr)}" fill="${accent}" opacity="0.9"/>` +
    `<circle cx="${r2(sunX)}" cy="${r2(sunY)}" r="${r2(sr * 1.9)}" fill="url(#${uid}-glow)" opacity="0.7"/>` +
    `<path d="${ridge(H * 0.6, H * 0.12)}" fill="${darken(accent, 0.55)}" opacity="0.7"/>` +
    `<path d="${ridge(H * 0.72, H * 0.15)}" fill="${darken(accent, 0.72)}" opacity="0.85"/>` +
    `<path d="${ridge(H * 0.85, H * 0.1)}" fill="#05060a" opacity="0.9"/>`
  );
}

function skyline({ rng, W, H, accent, uid }: SceneCtx): string {
  const horizon = H * 0.66;
  const vx = W / 2;
  let grid = "";
  for (let i = 0; i <= 8; i++) {
    const x = (i / 8) * W;
    grid += `<line x1="${r2(x)}" y1="${r2(H)}" x2="${r2(
      vx + (x - vx) * 0.18,
    )}" y2="${r2(horizon)}" stroke="${accent}" stroke-width="${r2(
      W * 0.004,
    )}" opacity="0.28"/>`;
  }
  for (let i = 0; i < 5; i++) {
    const y = horizon + ((H - horizon) * (i + 1)) / 6;
    grid += `<line x1="0" y1="${r2(y)}" x2="${r2(W)}" y2="${r2(
      y,
    )}" stroke="${accent}" stroke-width="${r2(W * 0.004)}" opacity="0.2"/>`;
  }
  let buildings = "";
  let bx = W * 0.03;
  while (bx < W * 0.97) {
    const bw = W * (0.06 + rng() * 0.1);
    const bh = H * (0.1 + rng() * 0.22);
    buildings += `<rect x="${r2(bx)}" y="${r2(horizon - bh)}" width="${r2(
      bw,
    )}" height="${r2(bh)}" fill="#05060a" opacity="0.92"/>`;
    if (rng() > 0.4) {
      buildings += `<rect x="${r2(bx + bw * 0.3)}" y="${r2(
        horizon - bh * 0.7,
      )}" width="${r2(W * 0.01)}" height="${r2(W * 0.01)}" fill="${accent}" opacity="0.9"/>`;
    }
    bx += bw + W * (0.015 + rng() * 0.025);
  }
  return (
    `<ellipse cx="${r2(vx)}" cy="${r2(horizon)}" rx="${r2(W * 0.7)}" ry="${r2(
      H * 0.1,
    )}" fill="url(#${uid}-glow)" opacity="0.8"/>` +
    grid +
    buildings
  );
}

function waves({ W, H, accent, uid }: SceneCtx): string {
  const band = (y: number, amp: number, op: number, fill: string) =>
    `<path d="M0 ${r2(y)} C ${r2(W * 0.25)} ${r2(y - amp)}, ${r2(
      W * 0.4,
    )} ${r2(y + amp)}, ${r2(W * 0.55)} ${r2(y)} S ${r2(W * 0.9)} ${r2(
      y - amp,
    )}, ${r2(W)} ${r2(y)} L ${r2(W)} ${r2(H)} L 0 ${r2(H)} Z" fill="${fill}" opacity="${op}"/>`;
  return (
    `<circle cx="${r2(W * 0.5)}" cy="${r2(H * 0.24)}" r="${r2(
      Math.min(W, H) * 0.16,
    )}" fill="url(#${uid}-glow)" opacity="0.7"/>` +
    band(H * 0.5, H * 0.06, 0.5, darken(accent, 0.5)) +
    band(H * 0.62, H * 0.075, 0.6, darken(accent, 0.3)) +
    band(H * 0.74, H * 0.06, 0.8, accent) +
    band(H * 0.86, H * 0.04, 0.95, darken(accent, 0.1))
  );
}

function orb({ W, H, accent, uid }: SceneCtx): string {
  return (
    `<circle cx="${r2(W * 0.5)}" cy="${r2(H * 0.52)}" r="${r2(
      Math.min(W, H) * 0.32,
    )}" fill="url(#${uid}-orb)"/>` +
    `<line x1="${r2(W * 0.16)}" y1="${r2(H * 0.78)}" x2="${r2(
      W * 0.84,
    )}" y2="${r2(H * 0.78)}" stroke="${accent}" stroke-width="${r2(
      W * 0.005,
    )}" opacity="0.4"/>` +
    `<circle cx="${r2(W * 0.5)}" cy="${r2(H * 0.52)}" r="${r2(
      W * 0.016,
    )}" fill="${accent}" opacity="0.95"/>`
  );
}

function motion({ rng, W, H, accent, uid }: SceneCtx): string {
  let streaks = "";
  const n = 8;
  for (let i = 0; i < n; i++) {
    const y = H * (0.3 + i * 0.07) + rng() * H * 0.03;
    const len = W * (0.4 + rng() * 0.5);
    const x = rng() * (W - len);
    streaks += `<line x1="${r2(x)}" y1="${r2(y)}" x2="${r2(x + len)}" y2="${r2(
      y + len * 0.18,
    )}" stroke="${accent}" stroke-width="${r2(
      W * 0.004 + rng() * W * 0.01,
    )}" opacity="${r2(0.25 + rng() * 0.5)}" stroke-linecap="round"/>`;
  }
  return (
    `<circle cx="${r2(W * 0.72)}" cy="${r2(H * 0.42)}" r="${r2(
      Math.min(W, H) * 0.2,
    )}" fill="url(#${uid}-glow)" opacity="0.7"/>` + streaks
  );
}

const SCENES: Record<Motif, (ctx: SceneCtx) => string> = {
  cosmos,
  peaks,
  skyline,
  waves,
  orb,
  motion,
};

function defs(uid: string, bg: string, accent: string): string {
  return (
    `<defs>` +
    `<linearGradient id="${uid}-bg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="${darken(
      bg,
      0.45,
    )}"/></linearGradient>` +
    `<radialGradient id="${uid}-glow"><stop offset="0%" stop-color="${accent}" stop-opacity="0.9"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${uid}-neb"><stop offset="0%" stop-color="${accent}" stop-opacity="0.55"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${uid}-planet" cx="0.38" cy="0.35"><stop offset="0%" stop-color="${accent}"/><stop offset="100%" stop-color="${darken(
      accent,
      0.6,
    )}"/></radialGradient>` +
    `<radialGradient id="${uid}-orb" cx="0.42" cy="0.4"><stop offset="0%" stop-color="${accent}" stop-opacity="0.95"/><stop offset="60%" stop-color="${darken(
      accent,
      0.35,
    )}" stop-opacity="0.7"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${uid}-vig" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#000" stop-opacity="0.12"/><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.32"/></linearGradient>` +
    `</defs>`
  );
}

export interface BuildMotifOptions {
  category?: WallpaperCategory | null;
  prompt?: string;
  variationIndex?: number;
  width: number;
  height: number;
  /** Extra entropy so each generation differs even within a category. */
  seed?: string;
  /** "image" → standalone doc with pixel size; "inline" → 100% for embedding. */
  mode?: "image" | "inline";
}

/** Build a complete SVG document string for the resolved motif. */
export function buildMotifSvg(opts: BuildMotifOptions): string {
  const { width: W, height: H } = opts;
  const { motif, bg, accent } = resolveArt(opts);
  const seedStr = `${opts.seed ?? ""}|${opts.category ?? ""}|${
    opts.prompt ?? ""
  }|${opts.variationIndex ?? 0}`;
  const uid = `m${hash(seedStr).toString(36)}`;
  const rng = seededRng(seedStr || motif);

  const scene = SCENES[motif]({ rng, W, H, accent, uid });
  const sizeAttrs =
    opts.mode === "inline"
      ? `width="100%" height="100%"`
      : `width="${W}" height="${H}"`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${sizeAttrs} preserveAspectRatio="xMidYMid slice">` +
    defs(uid, bg, accent) +
    `<rect width="${W}" height="${H}" fill="url(#${uid}-bg)"/>` +
    scene +
    `<rect width="${W}" height="${H}" fill="url(#${uid}-vig)"/>` +
    `</svg>`
  );
}

/** Isomorphic data-URL (utf8-encoded) suitable for an <img src>. */
export function motifDataUrl(opts: BuildMotifOptions): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(buildMotifSvg(opts))}`;
}
