import type { WallpaperCategory } from "@/types";
import { categoryArt, seededRng, type Motif } from "@/lib/generation/category-art";
import { slugify } from "@/lib/utils";

/**
 * Renders a small, designed-looking illustrated scene for a wallpaper category
 * as a self-contained SVG. Deterministic (seeded by category) so SSR and client
 * markup match exactly. Pure/presentational — safe in server or client trees.
 */

const W = 200;
const H = 250;

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 255) * (1 - amount)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function Cosmos({ rng, accent, uid }: { rng: () => number; accent: string; uid: string }) {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    key: i,
    cx: rng() * W,
    cy: rng() * H * 0.85,
    r: 0.4 + rng() * 1.3,
    o: 0.3 + rng() * 0.7,
  }));
  const px = W * (0.32 + rng() * 0.18);
  const py = H * (0.62 + rng() * 0.12);
  const pr = 28 + rng() * 10;
  return (
    <>
      <circle cx={W * 0.7} cy={H * 0.3} r={70} fill={`url(#${uid}-neb)`} opacity={0.6} />
      {stars.map((s) => (
        <circle key={s.key} cx={s.cx} cy={s.cy} r={s.r} fill="#ffffff" opacity={s.o} />
      ))}
      <circle cx={px} cy={py} r={pr} fill={`url(#${uid}-planet)`} />
      <ellipse
        cx={px}
        cy={py}
        rx={pr * 1.7}
        ry={pr * 0.42}
        fill="none"
        stroke={accent}
        strokeWidth={2.4}
        opacity={0.7}
        transform={`rotate(-18 ${px} ${py})`}
      />
    </>
  );
}

function Peaks({ rng, accent, uid }: { rng: () => number; accent: string; uid: string }) {
  const sunX = W * (0.62 + rng() * 0.2);
  const sunY = H * (0.26 + rng() * 0.08);
  const ridge = (base: number, jag: number) => {
    let d = `M0 ${H} L0 ${base}`;
    for (let x = 0; x <= W; x += W / 5) {
      d += ` L${x} ${base - rng() * jag} `;
    }
    return d + ` L${W} ${H} Z`;
  };
  return (
    <>
      <circle cx={sunX} cy={sunY} r={18} fill={accent} opacity={0.9} />
      <circle cx={sunX} cy={sunY} r={34} fill={`url(#${uid}-glow)`} opacity={0.7} />
      <path d={ridge(H * 0.62, 26)} fill={darken(accent, 0.55)} opacity={0.7} />
      <path d={ridge(H * 0.74, 34)} fill={darken(accent, 0.72)} opacity={0.85} />
      <path d={ridge(H * 0.86, 22)} fill="#05060a" opacity={0.9} />
    </>
  );
}

function Skyline({ rng, accent, uid }: { rng: () => number; accent: string; uid: string }) {
  const horizon = H * 0.66;
  const vx = W / 2;
  const grid = Array.from({ length: 9 }, (_, i) => {
    const x = (i / 8) * W;
    return <line key={`g${i}`} x1={x} y1={H} x2={vx + (x - vx) * 0.18} y2={horizon} stroke={accent} strokeWidth={0.8} opacity={0.28} />;
  });
  const hbands = Array.from({ length: 4 }, (_, i) => {
    const y = horizon + ((H - horizon) * (i + 1)) / 5;
    return <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} stroke={accent} strokeWidth={0.8} opacity={0.22} />;
  });
  let bx = 6;
  const buildings: JSX.Element[] = [];
  let i = 0;
  while (bx < W - 6) {
    const bw = 12 + rng() * 20;
    const bh = 24 + rng() * 56;
    buildings.push(
      <rect key={`b${i}`} x={bx} y={horizon - bh} width={bw} height={bh} fill="#05060a" opacity={0.92} rx={1} />,
    );
    if (rng() > 0.4) {
      buildings.push(
        <rect key={`w${i}`} x={bx + bw * 0.3} y={horizon - bh * 0.7} width={2} height={2} fill={accent} opacity={0.9} />,
      );
    }
    bx += bw + 3 + rng() * 5;
    i++;
  }
  return (
    <>
      <ellipse cx={vx} cy={horizon} rx={W * 0.7} ry={26} fill={`url(#${uid}-glow)`} opacity={0.8} />
      {hbands}
      {grid}
      {buildings}
    </>
  );
}

function Waves({ accent, uid }: { rng: () => number; accent: string; uid: string }) {
  const band = (y: number, amp: number, op: number, fill: string) => {
    const d = `M0 ${y} C ${W * 0.25} ${y - amp}, ${W * 0.4} ${y + amp}, ${W * 0.55} ${y} S ${W * 0.9} ${y - amp}, ${W} ${y} L ${W} ${H} L 0 ${H} Z`;
    return <path d={d} fill={fill} opacity={op} />;
  };
  return (
    <>
      <circle cx={W * 0.5} cy={H * 0.26} r={30} fill={`url(#${uid}-glow)`} opacity={0.7} />
      {band(H * 0.5, 14, 0.5, darken(accent, 0.5))}
      {band(H * 0.62, 18, 0.6, darken(accent, 0.3))}
      {band(H * 0.74, 14, 0.8, accent)}
      {band(H * 0.86, 10, 0.95, darken(accent, 0.1))}
    </>
  );
}

function Orb({ accent, uid }: { rng: () => number; accent: string; uid: string }) {
  return (
    <>
      <circle cx={W * 0.5} cy={H * 0.55} r={62} fill={`url(#${uid}-orb)`} />
      <line x1={W * 0.16} y1={H * 0.78} x2={W * 0.84} y2={H * 0.78} stroke={accent} strokeWidth={1} opacity={0.4} />
      <circle cx={W * 0.5} cy={H * 0.55} r={3} fill={accent} opacity={0.95} />
    </>
  );
}

function Motion({ rng, accent, uid }: { rng: () => number; accent: string; uid: string }) {
  const streaks = Array.from({ length: 7 }, (_, i) => {
    const y = H * (0.3 + i * 0.08) + rng() * 8;
    const len = W * (0.4 + rng() * 0.5);
    const x = rng() * (W - len);
    return (
      <line key={i} x1={x} y1={y} x2={x + len} y2={y + len * 0.18} stroke={accent} strokeWidth={1 + rng() * 2} opacity={0.25 + rng() * 0.5} strokeLinecap="round" />
    );
  });
  return (
    <>
      <circle cx={W * 0.72} cy={H * 0.42} r={40} fill={`url(#${uid}-glow)`} opacity={0.7} />
      {streaks}
    </>
  );
}

function MotifLayer(props: { motif: Motif; rng: () => number; accent: string; uid: string }) {
  switch (props.motif) {
    case "cosmos":
      return <Cosmos {...props} />;
    case "peaks":
      return <Peaks {...props} />;
    case "skyline":
      return <Skyline {...props} />;
    case "waves":
      return <Waves {...props} />;
    case "orb":
      return <Orb {...props} />;
    case "motion":
      return <Motion {...props} />;
  }
}

export function CategoryArt({
  category,
  className,
}: {
  category: WallpaperCategory;
  className?: string;
}) {
  const { motif, colors } = categoryArt(category);
  const [bg, accent] = colors;
  const uid = `art-${slugify(category)}`;
  const rng = seededRng(category);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor={darken(bg, 0.45)} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-neb`}>
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-planet`} cx="0.38" cy="0.35">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={darken(accent, 0.6)} />
        </radialGradient>
        <radialGradient id={`${uid}-orb`} cx="0.42" cy="0.4">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="60%" stopColor={darken(accent, 0.35)} stopOpacity="0.7" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-vig`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.12" />
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${uid}-bg)`} />
      <MotifLayer motif={motif} rng={rng} accent={accent} uid={uid} />
      <rect width={W} height={H} fill={`url(#${uid}-vig)`} />
    </svg>
  );
}
