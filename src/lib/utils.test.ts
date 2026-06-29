import { describe, it, expect } from "vitest";
import { slugify, imageExtension, cn } from "./utils";

describe("slugify", () => {
  it("lowercases, strips punctuation, and hyphenates", () => {
    expect(slugify("Neon Racing Car!! (rain)")).toBe("neon-racing-car-rain");
  });
  it("trims leading/trailing hyphens and caps length", () => {
    expect(slugify("  hi  ")).toBe("hi");
    expect(slugify("a".repeat(100)).length).toBeLessThanOrEqual(48);
  });
});

describe("imageExtension", () => {
  it("derives extension from data-URL mime types", () => {
    expect(imageExtension("data:image/svg+xml;base64,AAAA")).toBe("svg");
    expect(imageExtension("data:image/png;base64,AAAA")).toBe("png");
    expect(imageExtension("data:image/jpeg;base64,AAAA")).toBe("jpg");
    expect(imageExtension("data:image/webp;base64,AAAA")).toBe("webp");
  });
  it("derives extension from file paths and defaults to png", () => {
    expect(imageExtension("https://x.com/a.jpg?v=2")).toBe("jpg");
    expect(imageExtension("https://x.com/a.webp")).toBe("webp");
    expect(imageExtension("https://x.com/no-extension")).toBe("png");
  });
});

describe("cn", () => {
  it("merges and dedupes tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-white", false && "hidden", "font-bold")).toBe("text-white font-bold");
  });
});
