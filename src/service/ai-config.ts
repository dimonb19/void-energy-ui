// ── AI Config Resolver ───────────────────────────────────────────────────────
// Central place to resolve provider, model, API key, and base URL.
// Reads env vars with per-pipeline overrides taking precedence over globals.

const VALID_PROVIDERS: ReadonlySet<string> = new Set([
  'anthropic',
  'openai-compatible',
]);

const DEFAULT_MODELS: Record<AIProviderName, string> = {
  anthropic: 'claude-sonnet-4-6',
  'openai-compatible': 'gpt-4o',
};

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';

/**
 * Read an env var from `import.meta.env`, trimming whitespace.
 * Returns `undefined` for empty or missing values.
 */
function env(key: string): string | undefined {
  const value = (import.meta.env as Record<string, string | undefined>)[
    key
  ]?.trim();
  return value || undefined;
}

/**
 * Resolve AI configuration for a given pipeline.
 *
 * Precedence (highest → lowest):
 *   1. Pipeline-specific env vars: `{PIPELINE}_AI_PROVIDER`, `{PIPELINE}_AI_MODEL`
 *   2. Global env vars: `AI_PROVIDER`, `AI_MODEL`
 *   3. Built-in defaults: `anthropic` / `claude-sonnet-4-6`
 *
 * API key resolution:
 *   - Anthropic: `ANTHROPIC_API_KEY`
 *   - OpenAI-compatible: `AI_API_KEY`
 *
 * @param pipeline — Optional uppercase pipeline prefix (e.g. `"ATMOSPHERE"`).
 *   When provided, checks `ATMOSPHERE_AI_PROVIDER` and `ATMOSPHERE_AI_MODEL` first.
 */
export function resolveAIConfig(pipeline?: string): AIConfig {
  const prefix = pipeline ? `${pipeline}_` : '';

  // ── Provider ──────────────────────────────────────────────────────────
  const rawProvider = env(`${prefix}AI_PROVIDER`) ?? env('AI_PROVIDER');

  if (rawProvider && !VALID_PROVIDERS.has(rawProvider)) {
    throw new Error(
      `[ai-config] Invalid AI_PROVIDER "${rawProvider}". Valid values: ${[...VALID_PROVIDERS].join(', ')}`,
    );
  }

  const provider: AIProviderName = rawProvider
    ? (rawProvider as AIProviderName)
    : 'anthropic';

  // ── Model ─────────────────────────────────────────────────────────────
  const model =
    env(`${prefix}AI_MODEL`) ?? env('AI_MODEL') ?? DEFAULT_MODELS[provider];

  // ── API Key ───────────────────────────────────────────────────────────
  const apiKey =
    provider === 'anthropic' ? env('ANTHROPIC_API_KEY') : env('AI_API_KEY');

  if (!apiKey) {
    const keyName =
      provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'AI_API_KEY';
    throw new Error(
      `[ai-config] Missing ${keyName} for provider "${provider}". Set it in your .env file or hosting dashboard.`,
    );
  }

  // ── Base URL (OpenAI-compatible only) ─────────────────────────────────
  const baseUrl =
    provider === 'openai-compatible'
      ? (env('AI_BASE_URL') ?? DEFAULT_OPENAI_BASE_URL)
      : undefined;

  return { provider, model, apiKey, baseUrl };
}
