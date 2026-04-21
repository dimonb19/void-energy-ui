import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateNextBeat } from '../src/lib/story-beat-client';
import type { StoryBeat } from '../src/lib/story-beat-types';

const validBeat: StoryBeat = {
  id: 'static-garden',
  title: 'Static Garden',
  tagline: 'CRT garden / unease',
  text: 'The hedges hum at a frequency just below hearing, and every leaf is the same shade of television grey.',
  ambient: {
    atmosphere: [{ layer: 'rain', intensity: 'low' }],
    actions: [{ atWord: 17, variant: 'shake', intensity: 'medium' }],
  },
  kinetic: {
    revealStyle: 'scramble',
    continuous: 'static',
    speed: 'slow',
    oneShots: [{ atWord: 17, effect: 'tremble' }],
  },
};

function mockFetchJson(body: unknown, init?: ResponseInit) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: init?.status ?? 200,
      headers: { 'content-type': 'application/json' },
    }),
  );
}

describe('generateNextBeat', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the parsed beat on a happy response', async () => {
    vi.stubGlobal('fetch', mockFetchJson({ beat: validBeat }));

    const result = await generateNextBeat({ recentTitles: [] });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.id).toBe('static-garden');
  });

  it('POSTs recentTitles JSON to /api/generate-story-beat', async () => {
    const fetchMock = mockFetchJson({ beat: validBeat });
    vi.stubGlobal('fetch', fetchMock);

    await generateNextBeat({ recentTitles: ['Previous Vibe'] });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/generate-story-beat',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.recentTitles).toEqual(['Previous Vibe']);
  });

  it('defaults recentTitles to [] when omitted', async () => {
    const fetchMock = mockFetchJson({ beat: validBeat });
    vi.stubGlobal('fetch', fetchMock);

    await generateNextBeat();

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.recentTitles).toEqual([]);
  });

  it('returns http_error with server message when status is non-2xx', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchJson({ error: 'Rate limit exceeded.' }, { status: 429 }),
    );

    const result = await generateNextBeat();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('http_error');
      expect(result.error.status).toBe(429);
      expect(result.error.message).toBe('Rate limit exceeded.');
    }
  });

  it('returns network error when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    const result = await generateNextBeat();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('network');
  });

  it('returns "Generation cancelled." when the signal aborts', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));
    const controller = new AbortController();
    controller.abort();

    const result = await generateNextBeat({ signal: controller.signal });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('Generation cancelled.');
  });

  it('rejects a server response whose beat is malformed', async () => {
    // Pick a rule the schema enforces: atmosphere + psychology at the same
    // time is explicitly forbidden ("one ambient signal per beat").
    const malformed = {
      ...validBeat,
      ambient: {
        atmosphere: [{ layer: 'rain', intensity: 'low' }],
        psychology: [{ layer: 'tension', intensity: 'low' }],
      },
    };
    vi.stubGlobal('fetch', mockFetchJson({ beat: malformed }));

    const result = await generateNextBeat();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('invalid_shape');
  });

  it('rejects a 2xx response that omits the beat field', async () => {
    vi.stubGlobal('fetch', mockFetchJson({ error: 'something went wrong' }));

    const result = await generateNextBeat();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('invalid_shape');
  });
});
