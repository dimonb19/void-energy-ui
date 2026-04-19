import type { TTSResult } from '../types';

export interface GoogleOptions {
  /**
   * Google Cloud API key with Text-to-Speech API enabled. Browser-safe when
   * restricted to the Text-to-Speech endpoint + HTTP referrer allow-list.
   * For OAuth service-account auth (required for advanced features), proxy
   * through your backend and adapt this function's signature accordingly.
   */
  apiKey: string;
  /**
   * Voice name, e.g. `'en-US-Chirp3-HD-Achernar'`, `'en-US-Wavenet-D'`.
   * Full catalog: https://cloud.google.com/text-to-speech/docs/voices.
   */
  voiceName: string;
  /** BCP-47 language code, e.g. `'en-US'`. Default inferred from `voiceName`. */
  languageCode?: string;
  /**
   * Audio encoding. Default `'MP3'` so the Blob plays natively in `<audio>`.
   * Accepts: `'MP3'`, `'LINEAR16'`, `'OGG_OPUS'`, `'MULAW'`, `'ALAW'`.
   */
  audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS' | 'MULAW' | 'ALAW';
  /** Voice effects: -20 to 20 (dB) for volume, 0.25–4.0 for speed, -20 to 20 (semitones) for pitch. */
  effectsProfileId?: string[];
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
  /** Override the REST endpoint. Mostly for tests. */
  endpoint?: string;
}

interface GoogleResponse {
  audioContent: string;
}

const DEFAULT_ENDPOINT =
  'https://texttospeech.googleapis.com/v1/text:synthesize';
const DEFAULT_AUDIO_ENCODING = 'MP3';

/**
 * Synthesize speech via Google Cloud Text-to-Speech (REST + API key) and
 * return the universal `TTSResult`.
 *
 * **Google REST does not return word-level timestamps.** (Timing is only
 * available via SSML `<mark>` tags, which would require pre-marking every
 * word — impractical for free-form text.) `wordTimestamps` is always empty;
 * `<TtsKineticBlock>` falls back to even-distribution timing over the
 * clip's duration. For character-accurate sync, use InWorld or ElevenLabs.
 */
export async function synthesize(
  text: string,
  options: GoogleOptions,
): Promise<TTSResult> {
  const {
    apiKey,
    voiceName,
    languageCode = voiceName.slice(0, 5),
    audioEncoding = DEFAULT_AUDIO_ENCODING,
    effectsProfileId,
    speakingRate,
    pitch,
    volumeGainDb,
    endpoint = DEFAULT_ENDPOINT,
  } = options;

  const body: Record<string, unknown> = {
    input: { text },
    voice: { languageCode, name: voiceName },
    audioConfig: {
      audioEncoding,
      ...(effectsProfileId ? { effectsProfileId } : {}),
      ...(typeof speakingRate === 'number' ? { speakingRate } : {}),
      ...(typeof pitch === 'number' ? { pitch } : {}),
      ...(typeof volumeGainDb === 'number' ? { volumeGainDb } : {}),
    },
  };

  const response = await fetch(
    `${endpoint}?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `Google TTS request failed: ${response.status} ${response.statusText} ${errBody}`,
    );
  }

  const json = (await response.json()) as GoogleResponse;
  const audioBlob = base64ToBlob(json.audioContent, mimeFor(audioEncoding));
  const audioUrl = URL.createObjectURL(audioBlob);

  return {
    audioBlob,
    audioUrl,
    wordTimestamps: [],
    durationMs: 0,
  };
}

function mimeFor(
  encoding: NonNullable<GoogleOptions['audioEncoding']>,
): string {
  if (encoding === 'OGG_OPUS') return 'audio/ogg';
  if (encoding === 'LINEAR16') return 'audio/wav';
  if (encoding === 'MULAW' || encoding === 'ALAW') return 'audio/basic';
  return 'audio/mpeg';
}

function base64ToBlob(b64: string, mime: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
