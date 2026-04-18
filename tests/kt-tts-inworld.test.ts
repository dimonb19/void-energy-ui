import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { synthesize } from '../packages/kinetic-text/src/tts/providers/inworld';

function btoaSafe(s: string): string {
  return Buffer.from(s, 'binary').toString('base64');
}

function mockTimestampResponse(
  words: { word: string; startSeconds: number; endSeconds: number }[],
  durationSeconds?: number,
) {
  return {
    audioContent: btoaSafe('fake-audio-bytes'),
    timestampInfo: {
      wordAlignment: {
        words: words.map((w) => w.word),
        wordStartTimeSeconds: words.map((w) => w.startSeconds),
        wordEndTimeSeconds: words.map((w) => w.endSeconds),
      },
    },
    durationSeconds,
  };
}

describe('InWorld adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts to the default InWorld endpoint with Basic auth using the raw key', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        mockTimestampResponse(
          [{ word: 'hi', startSeconds: 0, endSeconds: 0.2 }],
          0.5,
        ),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await synthesize('hi', { voiceId: 'Dennis', apiKey: 'raw-key' });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.inworld.ai/tts/v1/voice');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Basic raw-key');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('sends text, voiceId, modelId, audioConfig, and timestampInfo in the body', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        mockTimestampResponse([
          { word: 'hi', startSeconds: 0, endSeconds: 0.2 },
        ]),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await synthesize('hi', { voiceId: 'Dennis', apiKey: 'k' });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toBe('hi');
    expect(body.voiceId).toBe('Dennis');
    expect(body.modelId).toBe('inworld-tts-1.5-max');
    expect(body.audioConfig).toEqual({
      audioEncoding: 'MP3',
      sampleRateHertz: 22050,
    });
    expect(body.timestampInfo).toEqual({ timestampType: 'WORD' });
  });

  it('normalizes word alignment arrays from seconds to milliseconds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () =>
          mockTimestampResponse(
            [
              { word: 'hello', startSeconds: 0, endSeconds: 0.4 },
              { word: 'world', startSeconds: 0.5, endSeconds: 0.9 },
            ],
            1,
          ),
      }),
    );

    const result = await synthesize('hello world', {
      voiceId: 'Dennis',
      apiKey: 'k',
    });

    expect(result.wordTimestamps).toEqual([
      { word: 'hello', startMs: 0, endMs: 400 },
      { word: 'world', startMs: 500, endMs: 900 },
    ]);
    expect(result.durationMs).toBe(1000);
    expect(result.audioUrl).toBe('blob:mock-url');
    expect(result.audioBlob).toBeInstanceOf(Blob);
  });

  it('derives durationMs from last word endMs when response omits duration', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () =>
          mockTimestampResponse([
            { word: 'hi', startSeconds: 0, endSeconds: 0.75 },
          ]),
      }),
    );

    const result = await synthesize('hi', { voiceId: 'Dennis', apiKey: 'k' });
    expect(result.durationMs).toBe(750);
  });

  it('returns empty wordTimestamps when timestamps are disabled', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        audioContent: btoaSafe('raw'),
        durationSeconds: 0.3,
      }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await synthesize('hi', {
      voiceId: 'Dennis',
      apiKey: 'k',
      includeWordTimestamps: false,
    });
    expect(result.wordTimestamps).toEqual([]);
    expect(result.durationMs).toBe(300);
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.timestampInfo).toBeUndefined();
  });

  it('throws with status and body when the API returns non-OK', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'invalid key',
      }),
    );

    await expect(
      synthesize('hi', { voiceId: 'Dennis', apiKey: 'bad' }),
    ).rejects.toThrow(/401 Unauthorized/);
  });

  it('honors custom endpoint + audioEncoding + modelId overrides', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTimestampResponse([], 0),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await synthesize('hi', {
      voiceId: 'Dennis',
      apiKey: 'k',
      endpoint: 'https://custom/tts',
      audioEncoding: 'LINEAR16',
      sampleRateHertz: 48000,
      modelId: 'inworld-tts-1.5-mini',
    });

    expect(fetchSpy.mock.calls[0][0]).toBe('https://custom/tts');
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.audioConfig.audioEncoding).toBe('LINEAR16');
    expect(body.audioConfig.sampleRateHertz).toBe(48000);
    expect(body.modelId).toBe('inworld-tts-1.5-mini');
  });
});
