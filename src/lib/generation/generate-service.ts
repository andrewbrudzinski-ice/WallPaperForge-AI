import { randomUUID } from "crypto";
import type {
  GenerateRequest,
  GeneratedWallpaper,
} from "@/types";
import { getProvider } from "@/lib/providers";
import { enhancePrompt } from "./optimization-engine";
import { targetDimensions } from "./dimensions";

/**
 * Server-side generation service.
 *
 * Orchestrates: optimization engine (enhance prompt) → provider (render image)
 * → normalized {@link GeneratedWallpaper}. This is the only place that knows
 * how to turn a request into finished wallpaper records; API routes are thin
 * wrappers around it.
 */

async function renderOne(
  req: GenerateRequest,
  variationIndex?: number,
): Promise<GeneratedWallpaper> {
  const enhanced = enhancePrompt(req, variationIndex);
  const provider = getProvider(req.provider);
  const { width, height } = targetDimensions(
    req.device.width,
    req.device.height,
    req.highRes,
  );

  const result = await provider.generate({
    prompt: enhanced.prompt,
    width,
    height,
    highRes: req.highRes,
    category: enhanced.category,
    variationIndex,
  });

  return {
    id: randomUUID(),
    imageUrl: result.imageUrl,
    description: enhanced.description,
    enhancedPrompt: enhanced.prompt,
    category: enhanced.category,
    mode: req.mode,
    deviceId: req.device.id,
    width,
    height,
    provider: result.provider,
    createdAt: new Date().toISOString(),
    isFavorite: false,
  };
}

/** Generate a single wallpaper for the given request. */
export async function generateWallpaper(
  req: GenerateRequest,
): Promise<GeneratedWallpaper> {
  return renderOne(req);
}

/**
 * Generate `count` diverse variations of the request's concept. Each variation
 * receives a different directive (color, angle, style, lighting) from the
 * optimization engine so the set stays visually distinct.
 */
export async function generateVariations(
  req: GenerateRequest,
  count = 4,
): Promise<GeneratedWallpaper[]> {
  const tasks = Array.from({ length: count }, (_, i) => renderOne(req, i));
  return Promise.all(tasks);
}
