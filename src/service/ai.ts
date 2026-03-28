// ── Unified AI Facade ────────────────────────────────────────────────────────
// Single entry point for all AI pipelines. Resolves the provider from config
// and delegates to the appropriate provider implementation.

import { resolveAIConfig } from './ai-config';
import { anthropicProvider } from './providers/anthropic';
import { openaiCompatibleProvider } from './providers/openai-compatible';

const PROVIDERS: Record<AIProviderName, AIProvider> = {
  anthropic: anthropicProvider,
  'openai-compatible': openaiCompatibleProvider,
};

/**
 * Send a single-turn AI message through the resolved provider.
 *
 * @param request — System prompt + user content (+ optional model/maxTokens overrides).
 * @param pipeline — Optional pipeline prefix for per-pipeline env overrides (e.g. `"ATMOSPHERE"`).
 * @returns Normalized `AIResult` with extracted text on success.
 */
export function sendMessage(
  request: AIRequest,
  pipeline?: string,
): Promise<AIResult> {
  const config = resolveAIConfig(pipeline);
  const provider = PROVIDERS[config.provider];
  return provider(config, request);
}

/**
 * Send a message and return both the result and the resolved config metadata.
 * Used by API routes that need to include provider/model in the response.
 */
export async function sendMessageWithMeta(
  request: AIRequest,
  pipeline?: string,
): Promise<{ result: AIResult; provider: AIProviderName; model: string }> {
  const config = resolveAIConfig(pipeline);
  const provider = PROVIDERS[config.provider];
  const result = await provider(config, request);
  const effectiveModel = request.model ?? config.model;
  return { result, provider: config.provider, model: effectiveModel };
}
