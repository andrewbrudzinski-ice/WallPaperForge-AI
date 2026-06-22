import type {
  ImageGenerationParams,
  ImageGenerationResult,
  ImageProvider,
} from "./types";

/**
 * OpenAI image provider (gpt-image-1 / DALL·E 3).
 *
 * gpt-image-1 returns base64 image data which we wrap as a data URL. The model
 * only supports a fixed set of sizes, so we snap the device aspect ratio to the
 * nearest portrait option.
 */
export class OpenAIProvider implements ImageProvider {
  readonly id = "openai";
  private readonly apiKey = process.env.OPENAI_API_KEY ?? "";
  private readonly model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private resolveSize(width: number, height: number): string {
    // gpt-image-1 supports 1024x1024, 1024x1536 (portrait), 1536x1024.
    return height >= width ? "1024x1536" : "1536x1024";
  }

  async generate(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    if (!this.isConfigured()) {
      throw new Error("OpenAI provider is not configured (missing OPENAI_API_KEY).");
    }

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        prompt: params.prompt,
        size: this.resolveSize(params.width, params.height),
        quality: params.highRes ? "high" : "medium",
        n: 1,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI image generation failed (${res.status}): ${text}`);
    }

    const json = (await res.json()) as {
      data: Array<{ b64_json?: string; url?: string }>;
    };
    const item = json.data?.[0];
    if (!item) throw new Error("OpenAI returned no image data.");

    const imageUrl = item.b64_json
      ? `data:image/png;base64,${item.b64_json}`
      : item.url;
    if (!imageUrl) throw new Error("OpenAI returned an empty image.");

    return { imageUrl, provider: this.id };
  }
}
