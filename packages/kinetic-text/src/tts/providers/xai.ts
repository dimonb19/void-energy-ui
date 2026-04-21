import type { TTSResult } from '../types';

export interface XaiOptions {
  /**
   * xAI API key. Sent as `Authorization: Bearer <apiKey>`. Shares the same
   * `XAI_API_KEY` as the Grok chat API. Note that any key embedded in a
   * browser bundle is visible to end users — in production, proxy this
   * call through your backend and pass an app-issued short-lived token as
   * `apiKey` instead.
   */
  apiKey: string;
  /**
   * Voice ID. Default `'eve'`. Built-ins:
   *   `eve` (energetic) | `ara` (warm) | `rex` (confident) |
   *   `sal` (smooth) | `leo` (authoritative).
   */
  voiceId?: string;
  /**
   * BCP-47-ish language tag. Default `'en'`. Accepts `'auto'` for
   * auto-detect. Full list at https://docs.x.ai/ — includes `zh`, `fr`,
   * `de`, `ja`, `ko`, `ar-EG/SA/AE`, `bn`, `id`, `it`, `pt-BR/PT`, `ru`,
   * `es-MX/ES`, `tr`, `vi`, `hi`.
   */
  language?: string;
  /**
   * Audio codec. Default `'mp3'` so the Blob plays natively in `<audio>`.
   * Other accepted values: `'wav'`, `'pcm'`, `'mulaw'`, `'alaw'`.
   */
  codec?: 'mp3' | 'wav' | 'pcm' | 'mulaw' | 'alaw';
  /**
   * Sample rate in Hz. Default `24000`. Accepted: 8000 | 16000 | 22050 |
   * 24000 | 44100 | 48000.
   */
  sampleRate?: number;
  /**
   * Bit rate in bps (MP3 only). Default `128000`. Accepted: 32000 | 64000 |
   * 96000 | 128000 | 192000.
   */
  bitRate?: number;
  /** Override the REST endpoint. Mostly for tests. */
  endpoint?: string;
}

const DEFAULT_ENDPOINT = 'https://api.x.ai/v1/tts';
const DEFAULT_VOICE = 'eve';
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_CODEC: NonNullable<XaiOptions['codec']> = 'mp3';
const DEFAULT_SAMPLE_RATE = 24_000;
const DEFAULT_BIT_RATE = 128_000;

/**
 * Synthesize speech via xAI's Grok TTS API and return the universal
 * `TTSResult`.
 *
 * **xAI does not return word-level timestamps** (the TTS response is raw
 * audio bytes — only the STT endpoint exposes per-word timing).
 * `wordTimestamps` is always an empty array. When paired with
 * `<TtsKineticBlock>`, the component falls back to even-distribution word
 * timing across the clip's audible duration — the reveal stays paced to
 * the voice, just not character-accurate. For character-accurate sync,
 * use ElevenLabs, InWorld, or Kokoro-FastAPI captioned mode.
 *
 * `durationMs` is 0 at return — the real duration is read from the audio
 * element's `loadedmetadata` event by the consumer.
 *
 * **Expressive markup.** The xAI endpoint accepts inline tags that slot
 * well into AI-generated story beats: `[laugh]`, `[sigh]`, `[breath]`,
 * `<whisper>…</whisper>`, `<emphasis>…</emphasis>`. These pass through
 * `text` untouched — no escaping.
 *
 * **Browser-origin note.** xAI's chat API historically does not set
 * permissive CORS headers; the TTS endpoint may reject cross-origin
 * browser calls and require a backend proxy. Test from your actual origin
 * before relying on it directly from the client.
 *
 * The caller owns the returned `audioUrl` and must `URL.revokeObjectURL`
 * it when done. (When paired with `<TtsKineticBlock>`, pass `audioBlob`
 * directly and the component handles URL lifecycle.)
 */
export async function synthesize(
  text: string,
  options: XaiOptions,
): Promise<TTSResult> {
  const {
    apiKey,
    voiceId = DEFAULT_VOICE,
    language = DEFAULT_LANGUAGE,
    codec = DEFAULT_CODEC,
    sampleRate = DEFAULT_SAMPLE_RATE,
    bitRate = DEFAULT_BIT_RATE,
    endpoint = DEFAULT_ENDPOINT,
  } = options;

  const body: Record<string, unknown> = {
    text,
    voice_id: voiceId,
    language,
    output_format: {
      codec,
      sample_rate: sampleRate,
      ...(codec === 'mp3' ? { bit_rate: bitRate } : {}),
    },
  };

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
      `xAI TTS request failed: ${response.status} ${response.statusText} ${errBody}`,
    );
  }

  const raw = await response.blob();
  const typed =
    raw.type && raw.type !== 'application/octet-stream'
      ? raw
      : new Blob([raw], { type: mimeFor(codec) });
  const audioUrl = URL.createObjectURL(typed);

  return {
    audioBlob: typed,
    audioUrl,
    wordTimestamps: [],
    durationMs: 0,
  };
}

function mimeFor(codec: NonNullable<XaiOptions['codec']>): string {
  switch (codec) {
    case 'wav':
    case 'pcm':
      return 'audio/wav';
    case 'mulaw':
    case 'alaw':
      return 'audio/basic';
    case 'mp3':
    default:
      return 'audio/mpeg';
  }
}
