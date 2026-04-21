import type { TTSResult, WordTimestamp } from '../types';

export interface KokoroOptions {
  /**
   * Base URL of a Kokoro-FastAPI instance — https://github.com/remsky/Kokoro-FastAPI.
   * Default `'http://localhost:8880'`. Point this at your deployment.
   *
   * The adapter appends `/dev/captioned_speech` or `/v1/audio/speech`
   * depending on `mode`; do NOT include a path here.
   */
  endpoint?: string;
  /**
   * Voice name. Default `'af_bella'`. Scheme: `{lang}{gender}_{name}` where
   * lang ∈ `a|b|e|f|h|i|j|p|z` (American, British, Spanish, French, Hindi,
   * Italian, Japanese, BR Portuguese, Mandarin) and gender ∈ `f|m`.
   *
   * Kokoro-FastAPI also accepts weighted blends: `'af_bella(2)+af_sky(1)'`.
   * See https://huggingface.co/hexgrad/Kokoro-82M#voices for the full list.
   */
  voice?: string;
  /**
   * Which FastAPI endpoint to call:
   *
   * - `'captioned'` (default) — `POST /dev/captioned_speech`, returns JSON
   *   with base64 audio + `timestamps: [{ word, start_time, end_time }]`.
   *   This is the reason to use Kokoro for kinetic sync.
   * - `'plain'` — `POST /v1/audio/speech` (OpenAI-compatible), returns a
   *   streamed audio Blob with no timestamps. `<TtsKineticBlock>` falls
   *   back to even-distribution word timing over the clip duration.
   */
  mode?: 'captioned' | 'plain';
  /**
   * Response audio format. Default `'mp3'` so the Blob plays natively in
   * `<audio>`. Kokoro-FastAPI accepts: `'mp3'`, `'wav'`, `'opus'`, `'flac'`,
   * `'m4a'`, `'pcm'`.
   */
  responseFormat?: 'mp3' | 'wav' | 'opus' | 'flac' | 'm4a' | 'pcm';
  /** 0.25–4.0. Default 1.0. Passed through to FastAPI unchanged. */
  speed?: number;
  /**
   * Language override. Default is inferred by FastAPI from the first
   * letter of `voice` (`'a' → 'en-us'`, `'b' → 'en-gb'`, etc.).
   */
  language?: string;
  /**
   * Optional bearer token. Kokoro-FastAPI is keyless by default, but
   * deployments commonly sit behind an auth proxy. When set, sent as
   * `Authorization: Bearer <apiKey>`.
   */
  apiKey?: string;
}

interface CaptionedResponse {
  /** Base64-encoded audio bytes in the requested `responseFormat`. */
  audio: string;
  /** Per-word timing. Times are in seconds. */
  timestamps: Array<{
    word: string;
    start_time: number;
    end_time: number;
  }>;
}

const DEFAULT_ENDPOINT = 'http://localhost:8880';
const DEFAULT_VOICE = 'af_bella';
const DEFAULT_MODE: NonNullable<KokoroOptions['mode']> = 'captioned';
const DEFAULT_FORMAT: NonNullable<KokoroOptions['responseFormat']> = 'mp3';

/**
 * Synthesize speech via a Kokoro-FastAPI instance and return the universal
 * `TTSResult`.
 *
 * Kokoro is an Apache-2.0 82M-param open-weight TTS model by hexgrad
 * (https://huggingface.co/hexgrad/Kokoro-82M), competitive with hosted
 * providers on English naturalness. Kokoro-FastAPI wraps it with two
 * endpoints:
 *
 * - `POST /dev/captioned_speech` — JSON response with base64 audio +
 *   per-word timestamps. Use this for kinetic-text sync (`mode: 'captioned'`,
 *   the default).
 * - `POST /v1/audio/speech` — OpenAI-compatible streaming audio, no
 *   timestamps. Use this when the dev endpoint is unavailable (proxies that
 *   whitelist only the public OpenAI-compatible path).
 *
 * The caller owns the returned `audioUrl` and must `URL.revokeObjectURL`
 * it when done. (When paired with `<TtsKineticBlock>`, pass `audioBlob`
 * directly and the component handles URL lifecycle.)
 */
export async function synthesize(
  text: string,
  options: KokoroOptions = {},
): Promise<TTSResult> {
  const {
    endpoint = DEFAULT_ENDPOINT,
    voice = DEFAULT_VOICE,
    mode = DEFAULT_MODE,
    responseFormat = DEFAULT_FORMAT,
    speed,
    language,
    apiKey,
  } = options;

  const base = endpoint.replace(/\/+$/, '');
  const path =
    mode === 'captioned' ? '/dev/captioned_speech' : '/v1/audio/speech';
  const url = `${base}${path}`;

  const body: Record<string, unknown> = {
    model: 'kokoro',
    input: text,
    voice,
    response_format: responseFormat,
  };
  if (typeof speed === 'number') body.speed = speed;
  if (language) body.lang_code = language;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `Kokoro TTS request failed: ${response.status} ${response.statusText} ${errBody}`,
    );
  }

  const mime = mimeFor(responseFormat);

  if (mode === 'captioned') {
    const json = (await response.json()) as CaptionedResponse;
    const audioBlob = base64ToBlob(json.audio, mime);
    const audioUrl = URL.createObjectURL(audioBlob);
    const wordTimestamps = normalizeTimestamps(json.timestamps);
    const lastEnd = wordTimestamps[wordTimestamps.length - 1]?.endMs ?? 0;
    return { audioBlob, audioUrl, wordTimestamps, durationMs: lastEnd };
  }

  const raw = await response.blob();
  const typed =
    raw.type && raw.type !== 'application/octet-stream'
      ? raw
      : new Blob([raw], { type: mime });
  const audioUrl = URL.createObjectURL(typed);

  return {
    audioBlob: typed,
    audioUrl,
    wordTimestamps: [],
    durationMs: 0,
  };
}

/**
 * Convert Kokoro-FastAPI's `{ word, start_time, end_time }` shape (seconds)
 * into `WordTimestamp[]` (milliseconds). Exported for unit testing; not
 * re-exported from the package.
 */
export function normalizeTimestamps(
  timestamps: CaptionedResponse['timestamps'] | undefined,
): WordTimestamp[] {
  if (!timestamps?.length) return [];
  return timestamps.map((t) => ({
    word: t.word,
    startMs: t.start_time * 1000,
    endMs: t.end_time * 1000,
  }));
}

function mimeFor(format: NonNullable<KokoroOptions['responseFormat']>): string {
  switch (format) {
    case 'opus':
      return 'audio/ogg';
    case 'flac':
      return 'audio/flac';
    case 'm4a':
      return 'audio/mp4';
    case 'wav':
    case 'pcm':
      return 'audio/wav';
    case 'mp3':
    default:
      return 'audio/mpeg';
  }
}

function base64ToBlob(b64: string, mime: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
