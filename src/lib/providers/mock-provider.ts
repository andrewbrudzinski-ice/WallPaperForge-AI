import type {
  ImageGenerationParams,
  ImageGenerationResult,
  ImageProvider,
} from "./types";

/**
 * Mock provider — the default when no real API keys are configured.
 *
 * Produces a deterministic, device-correct SVG gradient (as a data URL) so the
 * entire app — onboarding, generation, previews, favorites, history — is fully
 * functional out of the box with zero credentials. Swap `IMAGE_PROVIDER` to a
 * real provider once keys are set.
 */
export class MockProvider implements ImageProvider {
  readonly id = "mock";

  isConfigured(): boolean {
    return true;
  }

  private hash(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  async generate(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    const seed = this.hash(params.prompt);
    const h1 = seed % 360;
    const h2 = (h1 + 60 + (seed % 120)) % 360;
    const h3 = (h1 + 200) % 360;
    const w = params.width;
    const h = params.height;

    // Simulate realistic latency.
    await new Promise((r) => setTimeout(r, 350));

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="g" cx="50%" cy="68%" r="80%">
      <stop offset="0%" stop-color="hsl(${h2} 85% 60%)"/>
      <stop offset="55%" stop-color="hsl(${h1} 70% 38%)"/>
      <stop offset="100%" stop-color="hsl(${h3} 75% 12%)"/>
    </radialGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0.35)"/>
      <stop offset="22%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.25)"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w * 0.5}" cy="${h * 0.62}" r="${w * 0.32}" fill="hsl(${h2} 90% 70%)" opacity="0.35"/>
  <circle cx="${w * 0.5}" cy="${h * 0.62}" r="${w * 0.2}" fill="hsl(${h2} 95% 80%)" opacity="0.45"/>
  <rect width="${w}" height="${h}" fill="url(#v)"/>
</svg>`;

    const base64 = Buffer.from(svg).toString("base64");
    return {
      imageUrl: `data:image/svg+xml;base64,${base64}`,
      provider: this.id,
    };
  }
}
