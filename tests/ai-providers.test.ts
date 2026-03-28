import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { anthropicProvider } from '../src/service/providers/anthropic';
import { openaiCompatibleProvider } from '../src/service/providers/openai-compatible';

const BASE_CONFIG: AIConfig = {
  provider: 'anthropic',
  model: 'claude-sonnet-4-6',
  apiKey: 'sk-test',
};

const BASE_REQUEST: AIRequest = {
  system: 'You are a test assistant.',
  userContent: 'Hello',
};

describe('anthropicProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends correct payload to Anthropic Messages API', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ type: 'text', text: 'Hello back!' }],
        }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await anthropicProvider(BASE_CONFIG, BASE_REQUEST);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.anthropic.com/v1/messages',
    );

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.model).toBe('claude-sonnet-4-6');
    expect(body.max_tokens).toBe(2048);
    expect(body.system).toBe('You are a test assistant.');
    expect(body.messages[0]).toEqual({ role: 'user', content: 'Hello' });

    expect(result).toEqual({ ok: true, text: 'Hello back!' });
  });

  it('extracts text from content[] envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [
              { type: 'thinking', text: 'internal' },
              { type: 'text', text: 'The actual response' },
            ],
          }),
      }),
    );

    const result = await anthropicProvider(BASE_CONFIG, BASE_REQUEST);
    expect(result).toEqual({ ok: true, text: 'The actual response' });
  });

  it('returns structured error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')));

    const result = await anthropicProvider(BASE_CONFIG, BASE_REQUEST);
    expect(result).toEqual({
      ok: false,
      status: 502,
      message: 'Upstream AI request failed.',
    });
  });

  it('returns provider error message on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: () =>
          Promise.resolve({
            error: { message: 'Rate limit exceeded' },
          }),
      }),
    );

    const result = await anthropicProvider(BASE_CONFIG, BASE_REQUEST);
    expect(result).toEqual({
      ok: false,
      status: 429,
      message: 'Rate limit exceeded',
    });
  });

  it('returns error when response contains no text block', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ content: [] }),
      }),
    );

    const result = await anthropicProvider(BASE_CONFIG, BASE_REQUEST);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('no text');
    }
  });
});

describe('openaiCompatibleProvider', () => {
  const oaiConfig: AIConfig = {
    provider: 'openai-compatible',
    model: 'gpt-4o',
    apiKey: 'sk-openai-test',
    baseUrl: 'https://api.openai.com/v1',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends correct payload to chat/completions endpoint', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: 'GPT says hello' } }],
        }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await openaiCompatibleProvider(oaiConfig, BASE_REQUEST);

    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.openai.com/v1/chat/completions',
    );

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.model).toBe('gpt-4o');
    expect(body.messages).toEqual([
      { role: 'system', content: 'You are a test assistant.' },
      { role: 'user', content: 'Hello' },
    ]);

    expect(result).toEqual({ ok: true, text: 'GPT says hello' });
  });

  it('uses custom base URL for alternative providers', async () => {
    const groqConfig: AIConfig = {
      ...oaiConfig,
      baseUrl: 'https://api.groq.com/openai/v1',
      model: 'llama-3.1-70b-versatile',
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: 'Groq response' } }],
        }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await openaiCompatibleProvider(groqConfig, BASE_REQUEST);

    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.groq.com/openai/v1/chat/completions',
    );
  });

  it('returns structured error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')));

    const result = await openaiCompatibleProvider(oaiConfig, BASE_REQUEST);
    expect(result).toEqual({
      ok: false,
      status: 502,
      message: 'Upstream AI request failed.',
    });
  });

  it('returns error when response has no choices', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [] }),
      }),
    );

    const result = await openaiCompatibleProvider(oaiConfig, BASE_REQUEST);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('no text');
    }
  });
});
