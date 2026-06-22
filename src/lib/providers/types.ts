/**
 * AI image-provider abstraction.
 *
 * Every concrete provider (OpenAI, Gemini, Stability, Mock) implements
 * {@link ImageProvider}. The rest of the app depends only on this interface,
 * so swapping or adding a provider never touches generation logic or the UI.
 */

export interface ImageGenerationParams {
  /** The fully-enhanced prompt produced by the optimization engine. */
  prompt: string;
  /** Target pixel width. Providers may snap to their nearest supported size. */
  width: number;
  /** Target pixel height. */
  height: number;
  /** Premium tier requests the highest quality the provider supports. */
  highRes?: boolean;
}

export interface ImageGenerationResult {
  /**
   * Either a hosted https URL or a `data:` URL. Callers persist/return this
   * as-is, so providers normalize to one of these two forms.
   */
  imageUrl: string;
  /** Identifier of the provider that produced the image. */
  provider: string;
}

export interface ImageProvider {
  /** Stable provider id, e.g. "openai". */
  readonly id: string;
  /** Whether the required credentials are present in the environment. */
  isConfigured(): boolean;
  /** Generate a single image. Throws on hard failure. */
  generate(params: ImageGenerationParams): Promise<ImageGenerationResult>;
}

export type ProviderId = "openai" | "gemini" | "stability" | "mock";
