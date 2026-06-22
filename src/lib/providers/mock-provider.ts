import { buildMotifSvg } from "@/lib/generation/motif-svg";
import type {
  ImageGenerationParams,
  ImageGenerationResult,
  ImageProvider,
} from "./types";

/**
 * Mock provider — the default when no real API keys are configured.
 *
 * Renders the SAME motif artwork as the home-screen style cards (via the shared
 * `buildMotifSvg` generator), at the device's exact resolution and aspect
 * ratio. This makes the zero-config demo produce results that visually match
 * the browse cards. Swap `IMAGE_PROVIDER` to a real provider once keys are set.
 */
export class MockProvider implements ImageProvider {
  readonly id = "mock";

  isConfigured(): boolean {
    return true;
  }

  async generate(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    // Simulate realistic latency so the premium loading overlay is visible.
    await new Promise((r) => setTimeout(r, 350));

    const svg = buildMotifSvg({
      category: params.category ?? null,
      prompt: params.prompt,
      variationIndex: params.variationIndex,
      width: params.width,
      height: params.height,
      seed: params.prompt,
      mode: "image",
    });

    const base64 = Buffer.from(svg).toString("base64");
    return {
      imageUrl: `data:image/svg+xml;base64,${base64}`,
      provider: this.id,
    };
  }
}
