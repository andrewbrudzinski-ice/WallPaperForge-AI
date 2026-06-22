import type { ProviderId } from "@/types";

/**
 * Client-safe UI metadata for the provider selector. This file deliberately
 * imports nothing server-side (no keys, no fetch) so it can ship to the
 * browser. The actual provider implementations live in `./` and are selected
 * server-side in `index.ts`.
 */
export interface ProviderUI {
  id: ProviderId;
  label: string;
  tagline: string;
  glyph: string;
  /** Marks developer-mode/no-key providers shown lower in the list. */
  dev?: boolean;
}

export const PROVIDERS_UI: ProviderUI[] = [
  { id: "openai", label: "OpenAI", tagline: "gpt-image-1", glyph: "✦" },
  { id: "gemini", label: "Gemini", tagline: "Imagen 3", glyph: "✸" },
  { id: "stability", label: "Stability AI", tagline: "Stable Image", glyph: "✺" },
  {
    id: "mock",
    label: "Mock Provider",
    tagline: "Developer mode",
    glyph: "◍",
    dev: true,
  },
];

export function providerUI(id: ProviderId): ProviderUI {
  return PROVIDERS_UI.find((p) => p.id === id) ?? PROVIDERS_UI[0];
}
