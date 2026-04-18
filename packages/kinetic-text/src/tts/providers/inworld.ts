import type { TTSResult, WordTimestamp } from '../types';

export interface InWorldOptions {
  voiceId: string;
  /**
   * InWorld API key from the Studio. Sent verbatim as the Basic-auth
   * credential (`Authorization: Basic <apiKey>`) — no additional
   * encoding, matching InWorld's documented scheme.
   */
  apiKey: string;
  /** InWorld model ID. Default `'inworld-tts-1.5-max'` (current recommendation). */
  modelId?: string;
  /**
   * Audio encoding. Default `'MP3'` so the returned blob plays
   * natively in `<audio>`. `'LINEAR16'` returns raw PCM.
   */
  audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
  /** Sample rate in Hz. Default 22050 (per InWorld sample). */
  sampleRateHertz?: number;
  /** Request word-level timestamps. Default `true`. */
  includeWordTimestamps?: boolean;
  /** Override the REST endpoint. Mostly useful for tests. */
  endpoint?: string;
}

/**
 * Raw InWorld response shape. Word alignment arrives as parallel arrays
 * under `timestampInfo.wordAlignment`. We zip them into `WordTimestamp[]`
 * at the normalization layer.
 */
interface InWorldResponse {
  audioContent: string;
  timestampInfo?: {
    wordAlignment?: {
      words?: string[];
      wordStartTimeSeconds?: number[];
      wordEndTimeSeconds?: number[];
    };
  };
  durationSeconds?: number;
}

const DEFAULT_ENDPOINT = 'https://api.inworld.ai/tts/v1/voice';
const DEFAULT_MODEL_ID = 'inworld-tts-1.5-max';

/**
 * Synthesize speech via InWorld TTS and return the universal `TTSResult`.
 *
 * Normalization:
 * - base64 `audioContent` → `Blob` + Object URL
 * - `timestampInfo.wordAlignment.{words, wordStartTimeSeconds, wordEndTimeSeconds}`
 *   → `WordTimestamp[]` in ms
 * - `durationSeconds` (or derived from the last timestamp) → `durationMs`
 *
 * The caller owns the returned `audioUrl` and must `URL.revokeObjectURL`
 * it when done (typically in the same effect that played the audio).
 */
export async function synthesize(
  text: string,
  options: InWorldOptions,
): Promise<TTSResult> {
  const {
    voiceId,
    apiKey,
    modelId = DEFAULT_MODEL_ID,
    audioEncoding = 'MP3',
    sampleRateHertz = 22050,
    includeWordTimestamps = true,
    endpoint = DEFAULT_ENDPOINT,
  } = options;

  const body: Record<string, unknown> = {
    text,
    voiceId,
    modelId,
    audioConfig: {
      audioEncoding,
      sampleRateHertz,
    },
  };

  if (includeWordTimestamps) {
    body.timestampInfo = { timestampType: 'WORD' };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `InWorld TTS request failed: ${response.status} ${response.statusText} ${errBody}`,
    );
  }

  const json = (await response.json()) as InWorldResponse;

  const audioBlob = base64ToBlob(json.audioContent, mimeFor(audioEncoding));
  const audioUrl = URL.createObjectURL(audioBlob);

  const wordTimestamps = zipWordAlignment(json);

  const durationMs =
    (json.durationSeconds !== undefined
      ? json.durationSeconds * 1000
      : wordTimestamps[wordTimestamps.length - 1]?.endMs) ?? 0;

  return { audioBlob, audioUrl, wordTimestamps, durationMs };
}

function zipWordAlignment(json: InWorldResponse): WordTimestamp[] {
  const wa = json.timestampInfo?.wordAlignment;
  if (!wa) return [];
  const words = wa.words ?? [];
  const starts = wa.wordStartTimeSeconds ?? [];
  const ends = wa.wordEndTimeSeconds ?? [];
  const n = Math.min(words.length, starts.length, ends.length);
  const out: WordTimestamp[] = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = {
      word: words[i],
      startMs: starts[i] * 1000,
      endMs: ends[i] * 1000,
    };
  }
  return out;
}

function mimeFor(encoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS'): string {
  if (encoding === 'OGG_OPUS') return 'audio/ogg';
  if (encoding === 'LINEAR16') return 'audio/wav';
  return 'audio/mpeg';
}

function base64ToBlob(b64: string, mime: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
