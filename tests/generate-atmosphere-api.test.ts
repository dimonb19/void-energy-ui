import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../src/pages/api/generate-atmosphere';

// Mock the AI facade so route tests don't hit real providers
vi.mock('../src/service/ai', () => ({
  sendMessageWithMeta: vi.fn(),
}));

import { sendMessageWithMeta } from '../src/service/ai';

const mockSendMessage = vi.mocked(sendMessageWithMeta);

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/generate-atmosphere', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/generate-atmosphere', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSendMessage.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns normalized { text, provider, model } on success', async () => {
    mockSendMessage.mockResolvedValue({
      result: { ok: true, text: '{"mode":"dark","physics":"glass"}' },
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
    });

    const response = await POST({
      request: makeRequest({ vibe: 'deep space' }),
    } as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      text: '{"mode":"dark","physics":"glass"}',
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
    });
  });

  it('passes system prompt and user message to the AI facade', async () => {
    mockSendMessage.mockResolvedValue({
      result: { ok: true, text: '{}' },
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
    });

    await POST({
      request: makeRequest({
        vibe: 'deep space',
        physics: 'glass',
        mode: 'dark',
        retry: true,
      }),
    } as never);

    expect(mockSendMessage).toHaveBeenCalledTimes(1);

    const [request, pipeline] = mockSendMessage.mock.calls[0];
    expect(request.system).toContain(
      'You are a theme designer for the Void Energy UI design system.',
    );
    expect(request.userContent).toContain(
      'Create an atmosphere for: "deep space"',
    );
    expect(request.userContent).toContain('physics MUST be exactly "glass"');
    expect(request.userContent).toContain('mode MUST be exactly "dark"');
    expect(pipeline).toBe('ATMOSPHERE');
  });

  it('rejects impossible physics and mode combinations before calling AI', async () => {
    const response = await POST({
      request: makeRequest({
        vibe: 'deep space',
        physics: 'glass',
        mode: 'light',
      }),
    } as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid request body.');
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('returns AI error status and message on provider failure', async () => {
    mockSendMessage.mockResolvedValue({
      result: {
        ok: false,
        status: 502,
        message: 'Upstream AI request failed.',
      },
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
    });

    const response = await POST({
      request: makeRequest({ vibe: 'deep space' }),
    } as never);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Upstream AI request failed.',
    });
  });

  it('returns 500 when config resolution throws (missing API key)', async () => {
    mockSendMessage.mockImplementation(() => {
      throw new Error(
        '[ai-config] Missing ANTHROPIC_API_KEY for provider "anthropic".',
      );
    });

    const response = await POST({
      request: makeRequest({ vibe: 'deep space' }),
    } as never);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain('Missing ANTHROPIC_API_KEY');
  });

  it('returns 400 for malformed JSON body', async () => {
    const response = await POST({
      request: new Request('http://localhost/api/generate-atmosphere', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not json',
      }),
    } as never);

    expect(response.status).toBe(400);
  });

  it('returns 400 for empty vibe string', async () => {
    const response = await POST({
      request: makeRequest({ vibe: '' }),
    } as never);

    expect(response.status).toBe(400);
  });
});
