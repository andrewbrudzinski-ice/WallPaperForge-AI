import type {
  ImageGenerationParams,
  ImageGenerationResult,
  ImageProvider,
} from "./types";

/**
 * Google Gemini / Imagen image provider.
 *
 * Uses the Imagen `:predict` endpoint, which returns base64-encoded image
 * bytes. Aspect ratio is passed as one of Imagen's supported enums.
 */
export class GeminiProvider implements ImageProvider {
  readonly id = "gemini";
  private readonly apiKey = process.env.GEMINI_API_KEY ?? "";
  private readonly model =
    process.env.GEMINI_IMAGE_MODEL ?? "imagen-3.0-generate-002";

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private resolveAspectRatio(width: number, height: number): string {
    // Imagen supports "9:16", "3:4", "1:1", "4:3", "16:9".
    const ratio = height / width;
    if (ratio >= 1.6) return "9:16";
    if (ratio >= 1.2) return "3:4";
    if (ratio <= 0.85) return "16:9";
    return "1:1";
  }

  async generate(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    if (!this.isConfigured()) {
      throw new Error("Gemini provider is not configured (missing GEMINI_API_KEY).");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:predict?key=${this.apiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: params.prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: this.resolveAspectRatio(params.width, params.height),
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini image generation failed (${res.status}): ${text}`);
    }

    const json = (await res.json()) as {
      predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
    };
    const pred = json.predictions?.[0];
    if (!pred?.bytesBase64Encoded) {
      throw new Error("Gemini returned no image data.");
    }

    const mime = pred.mimeType ?? "image/png";
    return {
      imageUrl: `data:${mime};base64,${pred.bytesBase64Encoded}`,
      provider: this.id,
    };
  }
}
