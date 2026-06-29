import { describe, it, expect } from "vitest";
import { getDeviceById, DEVICES } from "@/lib/devices/devices";
import {
  buildCompositionInstructions,
  enhancePrompt,
  VARIATION_DIRECTIVES,
} from "./optimization-engine";

const iphone = getDeviceById("iphone-16-pro-max") ?? DEVICES[0];

describe("optimization engine", () => {
  it("composition instructions reference the clock area, focal zone, and resolution", () => {
    const text = buildCompositionInstructions(iphone);
    expect(text).toMatch(/lock-screen clock/i);
    expect(text).toMatch(/lower-middle safe zone/i);
    expect(text).toContain(`${iphone.width}x${iphone.height}`);
    expect(text).toMatch(/no text|no watermarks/i);
  });

  it("mentions the Dynamic Island for iPhones that have one", () => {
    const text = buildCompositionInstructions(iphone);
    expect(text).toMatch(/Dynamic Island/i);
  });

  it("prompt mode keeps the user's prompt and reports its category", () => {
    const r = enhancePrompt({ mode: "prompt", device: iphone, prompt: "a neon dragon" });
    expect(r.prompt).toContain("a neon dragon");
    expect(r.description).toBe("a neon dragon");
  });

  it("random mode always resolves a category", () => {
    for (let i = 0; i < 20; i++) {
      const r = enhancePrompt({ mode: "random", device: iphone });
      expect(r.category).not.toBeNull();
      expect(r.prompt.length).toBeGreaterThan(20);
    }
  });

  it("surprise mode weaves mood/palette/style into the prompt", () => {
    const r = enhancePrompt({
      mode: "surprise",
      device: iphone,
      category: "Space",
      surprise: { mood: "Epic", palette: "Black & Gold", style: "Cinematic", complexity: "Detailed" },
    });
    expect(r.prompt).toMatch(/Black & Gold/);
    expect(r.prompt).toMatch(/Cinematic/i);
  });

  it("applies a distinct variation directive per index", () => {
    const a = enhancePrompt({ mode: "prompt", device: iphone, prompt: "x" }, 0);
    const b = enhancePrompt({ mode: "prompt", device: iphone, prompt: "x" }, 1);
    expect(a.prompt).toContain(VARIATION_DIRECTIVES[0]);
    expect(b.prompt).toContain(VARIATION_DIRECTIVES[1]);
    expect(a.prompt).not.toBe(b.prompt);
  });

  it("requests 4K only when highRes is set", () => {
    const hi = enhancePrompt({ mode: "prompt", device: iphone, prompt: "x", highRes: true });
    const lo = enhancePrompt({ mode: "prompt", device: iphone, prompt: "x" });
    expect(hi.prompt).toMatch(/4K/i);
    expect(lo.prompt).not.toMatch(/4K/i);
  });
});
