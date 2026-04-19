import type { TTSResult } from '../types';

export interface OpenAIOptions {
  /**
   * OpenAI voice ID. One of the built-ins:
   *   `alloy` | `ash` | `ballad` | `coral` | `echo` | `fable` | `onyx` | `nova` |
   *   `sage` | `shimmer` | `verse`.
   */
  voice: string;
  /**
   * OpenAI API key. Sent as `Authorization: Bearer <apiKey>`. Note that any
   * key embedded in a browser bundle is visible to end users — in production,
   * proxy this call through your backend and pass an app-issued short-lived
   * token as `apiKey` instead.
   */
  apiKey: string;
  /**
   * Model ID. Default `'gpt-4o-mini-tts'` — the cheap multi-voice baseline.
   * `'tts-1'` and `'tts-1-hd'` are the older single-speaker models; `'gpt-4o-tts'`
   * is the high-quality variant. None return word timestamps.
   */
  model?: string;
  /**
   * Audio format. Default `'mp3'` so the Blob plays natively in `<audio>`.
   * Other accepted values: `'opus'`, `'aac'`, `'flac'`, `'wav'`, `'pcm'`.
   */
  responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
  /** 0.25–4.0. Default 1.0. */
  speed?: number;
  /**
   * Free-form instructions shaping tone/pace/emotion. Supported on
   * `gpt-4o-*-tts` models. Ignored for `tts-1` / `tts-1-hd`.
   */
  instructions?: string;
  /** Override the REST endpoint. Mostly for tests. */
  endpoint?: string;
}

const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/audio/speech';
const DEFAULT_MODEL = 'gpt-4o-mini-tts';

/**
 * Synthesize speech via OpenAI TTS and return the universal `TTSResult`.
 *
 * **OpenAI does not return word-level timestamps.** `wordTimestamps` is
 * always an empty array. When paired with `<TtsKineticBlock>`, the
 * component falls back to even-distribution word timing across the clip's
 * audible duration — the reveal stays paced to the voice, just not
 * character-accurate. For precise sync, use a provider that exposes
 * alignment (InWorld, ElevenLabs).
 *
 * `durationMs` is 0 at return — the real duration is read from the audio
 * element's `loadedmetadata` event by the consumer.
 *
 * The caller owns the returned `audioUrl` and must `URL.revokeObjectURL`
 * it when done. (When paired with `<TtsKineticBlock>`, pass `audioBlob`
 * directly and the component handles URL lifecycle.)
 */
export async function synthesize(
  text: string,
  options: OpenAIOptions,
): Promise<TTSResult> {
  const {
    voice,
    apiKey,
    model = DEFAULT_MODEL,
    responseFormat = 'mp3',
    speed,
    instructions,
    endpoint = DEFAULT_ENDPOINT,
  } = options;

  const body: Record<string, unknown> = {
    model,
    input: text,
    voice,
    response_format: responseFormat,
  };
  if (typeof speed === 'number') body.speed = speed;
  if (instructions) body.instructions = instructions;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `OpenAI TTS request failed: ${response.status} ${response.statusText} ${errBody}`,
    );
  }

  const audioBlob = await response.blob();
  // Normalize the MIME — fetch() often returns `application/octet-stream`
  // for audio responses, which some browsers refuse to play. Coerce to the
  // format we asked for.
  const typed =
    audioBlob.type && audioBlob.type !== 'application/octet-stream'
      ? audioBlob
      : new Blob([audioBlob], { type: mimeFor(responseFormat) });
  const audioUrl = URL.createObjectURL(typed);

  return {
    audioBlob: typed,
    audioUrl,
    wordTimestamps: [],
    durationMs: 0,
  };
}

function mimeFor(format: OpenAIOptions['responseFormat']): string {
  switch (format) {
    case 'opus':
      return 'audio/ogg';
    case 'aac':
      return 'audio/aac';
    case 'flac':
      return 'audio/flac';
    case 'wav':
    case 'pcm':
      return 'audio/wav';
    case 'mp3':
    default:
      return 'audio/mpeg';
  }
}
