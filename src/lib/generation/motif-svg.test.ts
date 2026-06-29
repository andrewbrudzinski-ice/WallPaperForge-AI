import { describe, it, expect } from "vitest";
import { resolveArt, buildMotifSvg, motifDataUrl } from "./motif-svg";
import { seededRng } from "./category-art";

describe("motif art generator", () => {
  it("resolves a category's configured motif", () => {
    expect(resolveArt({ category: "Space" }).motif).toBe("cosmos");
    expect(resolveArt({ category: "Ocean" }).motif).toBe("waves");
    expect(resolveArt({ category: "Cyberpunk" }).motif).toBe("skyline");
  });

  it("infers a motif from prompt keywords when no category is given", () => {
    expect(resolveArt({ prompt: "a giant wave over a coral reef" }).motif).toBe("waves");
    expect(resolveArt({ prompt: "snowy mountain peak at dawn" }).motif).toBe("peaks");
    expect(resolveArt({ prompt: "a galaxy full of stars" }).motif).toBe("cosmos");
  });

  it("shifts the palette for variations", () => {
    const base = resolveArt({ category: "Cyberpunk" });
    const v1 = resolveArt({ category: "Cyberpunk", variationIndex: 1 });
    expect(v1.accent).not.toBe(base.accent);
  });

  it("builds a well-formed SVG with no NaN/undefined", () => {
    const svg = buildMotifSvg({ category: "Space", width: 600, height: 1300, seed: "x" });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
    expect(svg).not.toMatch(/NaN|undefined|null/);
    expect(svg).toContain('viewBox="0 0 600 1300"');
  });

  it("scales detail with canvas size (more stars when larger)", () => {
    const small = buildMotifSvg({ category: "Space", width: 200, height: 250, seed: "s" });
    const large = buildMotifSvg({ category: "Space", width: 600, height: 1300, seed: "s" });
    const count = (s: string) => (s.match(/<circle/g) ?? []).length;
    expect(count(large)).toBeGreaterThan(count(small));
  });

  it("produces an encodable data URL", () => {
    const url = motifDataUrl({ category: "Neon", width: 200, height: 250, seed: "n" });
    expect(url.startsWith("data:image/svg+xml;utf8,")).toBe(true);
  });

  it("seededRng is deterministic for the same seed", () => {
    const a = seededRng("hello");
    const b = seededRng("hello");
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
    seqA.forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    });
  });
});
