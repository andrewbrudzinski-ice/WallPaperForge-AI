import type {
  CutoutType,
  NormalizedRect,
  SafeZoneProfile,
  ScreenCutout,
} from "@/types";

/**
 * Builders that turn a handful of high-level parameters into a complete,
 * normalized {@link SafeZoneProfile}. Centralising the geometry here keeps the
 * device table (devices.ts) terse and makes the rules easy to audit/extend.
 *
 * All rectangles are fractions of the full screen (0..1).
 */

function rect(x: number, y: number, width: number, height: number): NormalizedRect {
  return { x, y, width, height };
}

interface CutoutSpec {
  type: CutoutType;
  /** Horizontal center of the cutout, 0..1. Default 0.5 (centered). */
  centerX?: number;
  /** Vertical center of the cutout, 0..1. */
  centerY: number;
  /** Cutout width as a fraction of screen width. */
  width: number;
  /** Cutout height as a fraction of screen height. */
  height: number;
}

function cutout(spec: CutoutSpec): ScreenCutout {
  const centerX = spec.centerX ?? 0.5;
  return {
    type: spec.type,
    rect: rect(
      centerX - spec.width / 2,
      spec.centerY - spec.height / 2,
      spec.width,
      spec.height,
    ),
  };
}

interface ProfileSpec {
  cutouts: CutoutSpec[];
  /** Where the OS draws the lock-screen clock (iOS: top-center large clock). */
  platform: "ios" | "android";
}

/**
 * Produce a full safe-zone profile from the cutout list and platform. The
 * lock clock, widget row, icon grid and focal band differ between iOS and
 * Android because the two systems lay out their lock/home screens differently.
 */
export function buildSafeZones({ cutouts, platform }: ProfileSpec): SafeZoneProfile {
  const resolvedCutouts = cutouts.map(cutout);

  if (platform === "ios") {
    return {
      cutouts: resolvedCutouts,
      // iOS lock clock is large, top-center, roughly 8%–26% down the screen.
      lockClock: rect(0.1, 0.08, 0.8, 0.18),
      // Widget row sits just under the clock.
      lockWidgets: rect(0.1, 0.26, 0.8, 0.07),
      // App icon grid occupies the lower ~62% of the home screen.
      homeIcons: rect(0.06, 0.3, 0.88, 0.62),
      statusBar: rect(0, 0, 1, 0.06),
      // Keep the focal subject in the lower-middle band, clear of the clock.
      focalSafeZone: rect(0.12, 0.4, 0.76, 0.42),
    };
  }

  // Android (Material / One UI / Pixel) layout.
  return {
    cutouts: resolvedCutouts,
    lockClock: rect(0.06, 0.1, 0.6, 0.14),
    lockWidgets: rect(0.06, 0.24, 0.88, 0.06),
    homeIcons: rect(0.04, 0.32, 0.92, 0.6),
    statusBar: rect(0, 0, 1, 0.045),
    focalSafeZone: rect(0.12, 0.42, 0.76, 0.4),
  };
}
