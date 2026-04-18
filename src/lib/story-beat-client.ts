import { err, ok } from '@lib/result';
import { parseStoryBeat } from '@lib/story-beat-schema';
import type { StoryBeat } from '@lib/story-beat-types';

const PROXY_URL = '/api/generate-story-beat';

export interface GenerateNextBeatOptions {
  /**
   * Recent vibe titles the client has already seen this session. Passed to the
   * server so Claude can steer away from repetition. Not persisted.
   */
  recentTitles?: string[];
  signal?: AbortSignal;
}

/**
 * Ask the server to emit a fresh `StoryBeat` for the Vibe Machine. Each call
 * produces a fully random vibe (palette, ambient, kinetic). The client
 * re-validates defensively so a misconfigured server can never inject a
 * malformed beat into the engine.
 */
export async function generateNextBeat(
  options: GenerateNextBeatOptions = {},
): Promise<VoidResult<StoryBeat, BoundaryError>> {
  const { recentTitles = [], signal } = options;

  let response: Response;
  try {
    response = await fetch(PROXY_URL, {
      method: 'POST',
      signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recentTitles }),
    });
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return err({
        code: 'network',
        source: 'VibeMachine.generate',
        message: 'Generation cancelled.',
      });
    }
    return err({
      code: 'network',
      source: 'VibeMachine.generate',
      message: 'Network error — check your connection.',
    });
  }

  if (!response.ok) {
    const status = response.status;
    let upstreamMessage: string | undefined;
    try {
      const body = (await response.json()) as { error?: string };
      upstreamMessage = body?.error;
    } catch {
      // swallow — fall through to status-based messages
    }

    const message =
      upstreamMessage ??
      (status === 401
        ? 'Invalid API key.'
        : status === 429
          ? 'Rate limited — try again in a moment.'
          : status === 500
            ? 'Server error — AI provider may not be configured.'
            : status === 502
              ? 'AI provider could not be reached — try again.'
              : status === 503
                ? 'Generation is temporarily unavailable.'
                : status === 504
                  ? 'AI provider took too long — try again.'
                  : status === 529
                    ? 'AI provider is busy — try again shortly.'
                    : `API error (${status}).`);

    return err({
      code: 'http_error',
      source: 'VibeMachine.generate',
      message,
      status,
    });
  }

  let body: { beat?: unknown; error?: string };
  try {
    body = (await response.json()) as typeof body;
  } catch {
    return err({
      code: 'invalid_json',
      source: 'VibeMachine.generate',
      message: 'Server returned malformed JSON.',
    });
  }

  if (!body.beat) {
    return err({
      code: 'invalid_shape',
      source: 'VibeMachine.generate',
      message: body.error ?? 'Server response did not include a beat.',
    });
  }

  const parsed = parseStoryBeat(body.beat, 'VibeMachine.generate');
  if (!parsed.ok) return parsed;
  return ok(parsed.data);
}
