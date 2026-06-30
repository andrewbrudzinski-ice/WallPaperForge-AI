/**
 * Output dimension sizing for a generation. Premium (4K) keeps the device's
 * native resolution; the free tier scales the longest side down to a cap to
 * keep payloads/data-URLs reasonable while preserving the exact aspect ratio.
 * Pure — unit-tested.
 */

/** Longest-side cap (px) for non-4K output. */
export const MAX_NON_4K_SIDE = 1536;

export interface Dimensions {
  width: number;
  height: number;
}

export function targetDimensions(
  width: number,
  height: number,
  highRes = false,
): Dimensions {
  if (highRes) return { width, height };
  const scale = Math.min(1, MAX_NON_4K_SIDE / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}
