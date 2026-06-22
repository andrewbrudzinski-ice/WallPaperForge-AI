import { GeminiProvider } from "./gemini-provider";
import { MockProvider } from "./mock-provider";
import { OpenAIProvider } from "./openai-provider";
import { StabilityProvider } from "./stability-provider";
import type { ImageProvider, ProviderId } from "./types";

export * from "./types";

/**
 * Provider registry + selection.
 *
 * The active provider is chosen by the IMAGE_PROVIDER env var. If the selected
 * provider isn't configured (missing keys), we fall back to the mock provider
 * so the app always works. This is the single seam the whole generation
 * pipeline depends on.
 */

const REGISTRY: Record<ProviderId, () => ImageProvider> = {
  openai: () => new OpenAIProvider(),
  gemini: () => new GeminiProvider(),
  stability: () => new StabilityProvider(),
  mock: () => new MockProvider(),
};

export function getProvider(id?: ProviderId): ImageProvider {
  const requested = (id ??
    (process.env.IMAGE_PROVIDER as ProviderId | undefined) ??
    "mock") as ProviderId;

  const factory = REGISTRY[requested] ?? REGISTRY.mock;
  const provider = factory();

  if (!provider.isConfigured()) {
    // Graceful degradation: never hard-fail because keys are missing.
    return REGISTRY.mock();
  }
  return provider;
}

export function listProviders(): ProviderId[] {
  return Object.keys(REGISTRY) as ProviderId[];
}
