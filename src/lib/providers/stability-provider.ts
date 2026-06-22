import type {
  ImageGenerationParams,
  ImageGenerationResult,
  ImageProvider,
} from "./types";

/**
 * Stability AI image provider (Stable Image Core / Ultra).
 *
 * The v2beta endpoint accepts an `aspect_ratio` enum and returns raw image
 * bytes (image/*). We read the bytes and encode them as a data URL.
 */
export class StabilityProvider implements ImageProvider {
  readonly id = "stability";
  private readonly apiKey = process.env.STABILITY_API_KEY ?? "";
  private readonly model = process.env.STABILITY_IMAGE_MODEL ?? "core";

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private resolveAspectRatio(width: number, height: number): string {
    const ratio = height / width;
    if (ratio >= 1.6) return "9:16";
    if (ratio >= 1.2) return "2:3";
    if (ratio <= 0.85) return "16:9";
    return "1:1";
  }

  async generate(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    if (!this.isConfigured()) {
      throw new Error(
        "Stability provider is not configured (missing STABILITY_API_KEY).",
      );
    }

    const form = new FormData();
    form.append("prompt", params.prompt);
    form.append(
      "aspect_ratio",
      this.resolveAspectRatio(params.width, params.height),
    );
    form.append("output_format", "png");

    const res = await fetch(
      `https://api.stability.ai/v2beta/stable-image/generate/${this.model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "image/*",
        },
        body: form,
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Stability image generation failed (${res.status}): ${text}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      imageUrl: `data:image/png;base64,${buffer.toString("base64")}`,
      provider: this.id,
    };
  }
}
