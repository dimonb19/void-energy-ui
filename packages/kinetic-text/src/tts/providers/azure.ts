import type { TTSResult } from '../types';

export interface AzureOptions {
  /**
   * Azure subscription key. Sent as `Ocp-Apim-Subscription-Key`. Browser-safe
   * for user-provided keys; for app-issued keys, proxy through your backend.
   */
  subscriptionKey: string;
  /**
   * Azure region (e.g. `'eastus'`, `'westeurope'`). The endpoint is derived
   * from this — `https://<region>.tts.speech.microsoft.com/cognitiveservices/v1`.
   * Ignored when `endpoint` is set explicitly.
   */
  region: string;
  /**
   * Voice name, e.g. `'en-US-JennyNeural'`. The full catalog is at
   * https://learn.microsoft.com/azure/ai-services/speech-service/language-support.
   */
  voice: string;
  /** BCP-47 language tag. Default inferred from the voice name's prefix. */
  language?: string;
  /**
   * Audio format. Default `'audio-24khz-160kbitrate-mono-mp3'` so the Blob
   * plays natively in `<audio>`. Full list in `X-Microsoft-OutputFormat`
   * documentation.
   */
  outputFormat?: string;
  /**
   * Optional SSML prosody — pitch, rate, volume. Applied inside a `<prosody>`
   * wrapper. Example: `{ rate: '+10%', pitch: '-2st' }`.
   */
  prosody?: {
    rate?: string;
    pitch?: string;
    volume?: string;
  };
  /** Override the REST endpoint. Mostly for tests. */
  endpoint?: string;
}

const DEFAULT_OUTPUT_FORMAT = 'audio-24khz-160kbitrate-mono-mp3';

/**
 * Synthesize speech via Azure Cognitive Services Speech (REST) and return
 * the universal `TTSResult`.
 *
 * **Azure REST does not return word-level timestamps.** (WordBoundary events
 * are only available via the streaming Speech SDK.) `wordTimestamps` is
 * always empty; `<TtsKineticBlock>` falls back to even-distribution timing
 * over the clip's duration. For character-accurate sync, use InWorld or
 * ElevenLabs; for Azure + sync, you'd need the Speech SDK path which
 * doesn't fit the Blob-based adapter.
 */
export async function synthesize(
  text: string,
  options: AzureOptions,
): Promise<TTSResult> {
  const {
    subscriptionKey,
    region,
    voice,
    language = voice.slice(0, 5), // first 5 chars are the BCP-47 prefix (e.g. "en-US")
    outputFormat = DEFAULT_OUTPUT_FORMAT,
    prosody,
    endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
  } = options;

  const ssml = buildSsml(text, { language, voice, prosody });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': outputFormat,
      'User-Agent': 'void-energy-kinetic-text',
    },
    body: ssml,
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `Azure TTS request failed: ${response.status} ${response.statusText} ${errBody}`,
    );
  }

  const raw = await response.blob();
  const typed =
    raw.type && raw.type !== 'application/octet-stream'
      ? raw
      : new Blob([raw], { type: mimeFor(outputFormat) });
  const audioUrl = URL.createObjectURL(typed);

  return {
    audioBlob: typed,
    audioUrl,
    wordTimestamps: [],
    durationMs: 0,
  };
}

function buildSsml(
  text: string,
  {
    language,
    voice,
    prosody,
  }: { language: string; voice: string; prosody?: AzureOptions['prosody'] },
): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const inner = prosody
    ? `<prosody${prosody.rate ? ` rate="${prosody.rate}"` : ''}${prosody.pitch ? ` pitch="${prosody.pitch}"` : ''}${prosody.volume ? ` volume="${prosody.volume}"` : ''}>${escaped}</prosody>`
    : escaped;

  return `<speak version="1.0" xml:lang="${language}"><voice name="${voice}">${inner}</voice></speak>`;
}

function mimeFor(outputFormat: string): string {
  if (outputFormat.includes('mp3')) return 'audio/mpeg';
  if (outputFormat.includes('ogg') || outputFormat.includes('opus'))
    return 'audio/ogg';
  if (outputFormat.includes('webm')) return 'audio/webm';
  if (outputFormat.includes('pcm') || outputFormat.includes('riff'))
    return 'audio/wav';
  return 'audio/mpeg';
}
