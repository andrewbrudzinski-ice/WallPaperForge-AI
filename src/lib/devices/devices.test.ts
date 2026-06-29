import { describe, it, expect } from "vitest";
import {
  DEVICES,
  MANUFACTURERS,
  getDeviceById,
  getDevicesByManufacturer,
} from "./devices";
import type { NormalizedRect } from "@/types";

function inBounds(r: NormalizedRect): boolean {
  return (
    r.x >= 0 &&
    r.y >= 0 &&
    r.width > 0 &&
    r.height > 0 &&
    r.x + r.width <= 1.0001 &&
    r.y + r.height <= 1.0001
  );
}

describe("device database", () => {
  it("has a healthy number of devices with unique ids", () => {
    expect(DEVICES.length).toBeGreaterThanOrEqual(50);
    const ids = DEVICES.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every device is portrait with a sensible aspect ratio", () => {
    for (const d of DEVICES) {
      expect(d.height).toBeGreaterThan(d.width);
      expect(d.aspectRatioValue).toBeCloseTo(d.height / d.width, 5);
      expect(d.aspectRatioValue).toBeGreaterThan(1);
    }
  });

  it("every safe zone rect stays within the screen", () => {
    for (const d of DEVICES) {
      const z = d.safeZones;
      expect(inBounds(z.lockClock)).toBe(true);
      expect(inBounds(z.focalSafeZone)).toBe(true);
      expect(inBounds(z.homeIcons)).toBe(true);
      for (const c of z.cutouts) expect(inBounds(c.rect)).toBe(true);
    }
  });

  it("keeps the focal zone clear of the very top (lock clock area)", () => {
    for (const d of DEVICES) {
      expect(d.safeZones.focalSafeZone.y).toBeGreaterThan(0.3);
    }
  });

  it("covers every manufacturer and looks up by id", () => {
    for (const m of MANUFACTURERS) {
      expect(getDevicesByManufacturer(m).length).toBeGreaterThan(0);
    }
    const first = DEVICES[0];
    expect(getDeviceById(first.id)).toEqual(first);
    expect(getDeviceById("does-not-exist")).toBeUndefined();
  });

  it("sorts a manufacturer's devices newest-first", () => {
    const apple = getDevicesByManufacturer("Apple");
    for (let i = 1; i < apple.length; i++) {
      expect(apple[i - 1].releaseYear).toBeGreaterThanOrEqual(apple[i].releaseYear);
    }
  });
});
