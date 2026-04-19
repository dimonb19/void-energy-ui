import type { TTSResult } from '../types';

export interface DeepgramOptions {
  /**
   * Deepgram API key. Sent as `Authorization: Token <apiKey>`. Browser-safe
   * for user-provided keys; for app-issued keys use a temporary token
   * issued by your backend (`projects/{project_id}/keys` with a short TTL).
   */
  apiKey: string;
  /**
   * Voice/model, e.g. `'aura-2-asteria-en'`, `'aura-2-thalia-en'`,
   * `'aura-helios-en'`. Full catalog:
   * https://developers.deepgram.com/docs/tts-models.
   */
  model: string;
  /**
   * Audio encoding. Default `'mp3'` so the Blob plays natively in `<audio>`.
   * Accepts: `'mp3'`, `'opus'`, `'flac'`, `'aac'`, `'linear16'`, `'mulaw'`.
   * (Container inferred from encoding per Deepgram's defaults.)
   */
  encoding?: 'mp3' | 'opus' | 'flac' | 'aac' | 'linear16' | 'mulaw';
  /** Sample rate in Hz. Default is encoding-dependent. */
  sampleRate?: number;
  /** Override the REST endpoint. Mostly for tests. */
  endpoint?: string;
}

const DEFAULT_ENDPOINT = 'https://api.deepgram.com/v1/speak';
const DEFAULT_ENCODING = 'mp3';

/**
 * Synthesize speech via Deepgram Aura TTS and return the universal
 * `TTSResult`.
 *
 * **Deepgram's speak endpoint does not return word-level timestamps.**
 * (Timestamps are available for transcription via `/v1/listen`, not
 * synthesis.) `wordTimestamps` is always empty; `<TtsKineticBlock>` falls
 * back to even-distribution timing over the clip's duration. For
 * character-accurate sync, use InWorld or ElevenLabs.
 */
export async function synthesize(
  text: string,
  options: DeepgramOptions,
): Promise<TTSResult> {
  const {
    apiKey,
    model,
    encoding = DEFAULT_ENCODING,
    sampleRate,
    endpoint = DEFAULT_ENDPOINT,
  } = options;

  const params = new URLSearchParams({ model, encoding });
  if (typeof sampleRate === 'number') {
    params.set('sample_rate', String(sampleRate));
  }

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `Deepgram TTS request failed: ${response.status} ${response.statusText} ${errBody}`,
    );
  }

  const raw = await response.blob();
  const typed =
    raw.type && raw.type !== 'application/octet-stream'
      ? raw
      : new Blob([raw], { type: mimeFor(encoding) });
  const audioUrl = URL.createObjectURL(typed);

  return {
    audioBlob: typed,
    audioUrl,
    wordTimestamps: [],
    durationMs: 0,
  };
}

function mimeFor(encoding: NonNullable<DeepgramOptions['encoding']>): string {
  switch (encoding) {
    case 'opus':
      return 'audio/ogg';
    case 'flac':
      return 'audio/flac';
    case 'aac':
      return 'audio/aac';
    case 'linear16':
      return 'audio/wav';
    case 'mulaw':
      return 'audio/basic';
    case 'mp3':
    default:
      return 'audio/mpeg';
  }
}
