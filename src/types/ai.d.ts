// ── AI Provider Types ────────────────────────────────────────────────────────
// Ambient globals for the server-side AI service layer.

/** Supported AI provider identifiers. */
type AIProviderName = 'anthropic' | 'openai-compatible';

/** Resolved configuration for calling an AI provider. */
interface AIConfig {
  provider: AIProviderName;
  model: string;
  apiKey: string;
  /** Base URL for OpenAI-compatible providers (ignored for Anthropic). */
  baseUrl?: string;
}

/** Input to the unified AI facade. */
interface AIRequest {
  system: string;
  userContent: string;
  /** Override resolved model for this call. */
  model?: string;
  /** Override resolved max tokens for this call. */
  maxTokens?: number;
}

/** Successful AI response — provider-agnostic. */
interface AISuccess {
  ok: true;
  text: string;
}

/** Failed AI response — provider-agnostic. */
interface AIFailure {
  ok: false;
  status: number;
  message: string;
}

/** Discriminated union returned by all providers. */
type AIResult = AISuccess | AIFailure;

/** A provider function that sends a single-turn message and returns normalized text. */
type AIProvider = (config: AIConfig, request: AIRequest) => Promise<AIResult>;

/** Normalized API route response for AI pipelines. */
interface AIPipelineResponse {
  text: string;
  provider: AIProviderName;
  model: string;
}
