import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// resolveAIConfig reads import.meta.env, which vitest stubs via vi.stubEnv
const loadModule = async () => {
  const mod = await import('../src/service/ai-config');
  return mod.resolveAIConfig;
};

describe('resolveAIConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to anthropic provider with claude-sonnet-4-6', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-test');
    const resolveAIConfig = await loadModule();
    const config = resolveAIConfig();
    expect(config.provider).toBe('anthropic');
    expect(config.model).toBe('claude-sonnet-4-6');
    expect(config.apiKey).toBe('sk-test');
    expect(config.baseUrl).toBeUndefined();
  });

  it('respects AI_PROVIDER and AI_MODEL globals', async () => {
    vi.stubEnv('AI_PROVIDER', 'openai-compatible');
    vi.stubEnv('AI_MODEL', 'gpt-4o-mini');
    vi.stubEnv('AI_API_KEY', 'sk-openai-test');
    const resolveAIConfig = await loadModule();
    const config = resolveAIConfig();
    expect(config.provider).toBe('openai-compatible');
    expect(config.model).toBe('gpt-4o-mini');
    expect(config.apiKey).toBe('sk-openai-test');
  });

  it('pipeline-specific env overrides global defaults', async () => {
    vi.stubEnv('AI_PROVIDER', 'anthropic');
    vi.stubEnv('AI_MODEL', 'claude-sonnet-4-6');
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-anthro');
    vi.stubEnv('AI_API_KEY', 'sk-openai');
    vi.stubEnv('ATMOSPHERE_AI_PROVIDER', 'openai-compatible');
    vi.stubEnv('ATMOSPHERE_AI_MODEL', 'gpt-4o');
    const resolveAIConfig = await loadModule();
    const config = resolveAIConfig('ATMOSPHERE');
    expect(config.provider).toBe('openai-compatible');
    expect(config.model).toBe('gpt-4o');
    expect(config.apiKey).toBe('sk-openai');
  });

  it('throws when API key is missing for selected provider', async () => {
    vi.stubEnv('AI_PROVIDER', 'anthropic');
    // No ANTHROPIC_API_KEY set
    const resolveAIConfig = await loadModule();
    expect(() => resolveAIConfig()).toThrow('Missing ANTHROPIC_API_KEY');
  });

  it('throws when AI_API_KEY is missing for openai-compatible', async () => {
    vi.stubEnv('AI_PROVIDER', 'openai-compatible');
    // No AI_API_KEY set
    const resolveAIConfig = await loadModule();
    expect(() => resolveAIConfig()).toThrow('Missing AI_API_KEY');
  });

  it('throws on invalid provider value', async () => {
    vi.stubEnv('AI_PROVIDER', 'invalid-provider');
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-test');
    const resolveAIConfig = await loadModule();
    expect(() => resolveAIConfig()).toThrow('Invalid AI_PROVIDER');
  });

  it('uses default OpenAI base URL when AI_BASE_URL is not set', async () => {
    vi.stubEnv('AI_PROVIDER', 'openai-compatible');
    vi.stubEnv('AI_API_KEY', 'sk-test');
    const resolveAIConfig = await loadModule();
    const config = resolveAIConfig();
    expect(config.baseUrl).toBe('https://api.openai.com/v1');
  });

  it('uses custom AI_BASE_URL for openai-compatible', async () => {
    vi.stubEnv('AI_PROVIDER', 'openai-compatible');
    vi.stubEnv('AI_API_KEY', 'sk-test');
    vi.stubEnv('AI_BASE_URL', 'https://api.groq.com/openai/v1');
    const resolveAIConfig = await loadModule();
    const config = resolveAIConfig();
    expect(config.baseUrl).toBe('https://api.groq.com/openai/v1');
  });
});
