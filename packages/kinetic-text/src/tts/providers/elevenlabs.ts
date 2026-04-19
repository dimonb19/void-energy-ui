import type { TTSResult, WordTimestamp } from '../types';

export interface ElevenLabsOptions {
  /** ElevenLabs voice ID. From the ElevenLabs dashboard (`VoiceLab` → copy ID). */
  voiceId: string;
  /**
   * ElevenLabs API key. Sent as `xi-api-key` per their documented scheme.
   */
  apiKey: string;
  /**
   * Model ID. Default `'eleven_multilingual_v2'` — balances quality and
   * timestamp support. `'eleven_turbo_v2_5'` is cheaper/faster if your use
   * case tolerates slightly less nuanced prosody.
   */
  modelId?: string;
  /**
   * Output audio format. Default `'mp3_44100_128'` (MP3, 44.1kHz, 128kbps)
   * so the returned Blob plays natively in `<audio>`. Other accepted values
   * per ElevenLabs: `'mp3_44100_192'`, `'pcm_16000'`, `'pcm_22050'`,
   * `'pcm_24000'`, `'pcm_44100'`, `'ulaw_8000'`.
   */
  outputFormat?: string;
  /**
   * Use the normalized alignment (reflects ElevenLabs' text normalization
   * — e.g. "2024" → "twenty twenty four") for word timestamps. Default true,
   * which aligns the reveal with what's actually spoken. Set false to align
   * with the literal source text, accepting mismatches where numbers, dates,
   * or currency get expanded.
   */
  useNormalizedAlignment?: boolean;
  /** Voice-tuning params passed through untouched. Optional. */
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  /** Override the REST endpoint. Mostly for tests. */
  endpoint?: string;
}

interface ElevenLabsAlignment {
  characters?: string[];
  character_start_times_seconds?: number[];
  character_end_times_seconds?: number[];
}

interface ElevenLabsResponse {
  audio_base64: string;
  alignment?: ElevenLabsAlignment;
  normalized_alignment?: ElevenLabsAlignment;
}

const DEFAULT_ENDPOINT = 'https://api.elevenlabs.io/v1/text-to-speech';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';
const DEFAULT_OUTPUT_FORMAT = 'mp3_44100_128';

/**
 * Synthesize speech via ElevenLabs TTS and return the universal `TTSResult`.
 *
 * Uses the `/with-timestamps` endpoint so we get character-level alignment,
 * then aggregates consecutive non-whitespace characters into `WordTimestamp[]`.
 *
 * The caller owns the returned `audioUrl` and must `URL.revokeObjectURL`
 * it when done. (When paired with `<TtsKineticBlock>`, pass `audioBlob`
 * directly and the component handles URL lifecycle.)
 */
export async function synthesize(
  text: string,
  options: ElevenLabsOptions,
): Promise<TTSResult> {
  const {
    voiceId,
    apiKey,
    modelId = DEFAULT_MODEL_ID,
    outputFormat = DEFAULT_OUTPUT_FORMAT,
    useNormalizedAlignment = true,
    voiceSettings,
    endpoint = DEFAULT_ENDPOINT,
  } = options;

  const url = `${endpoint}/${encodeURIComponent(voiceId)}/with-timestamps?output_format=${encodeURIComponent(outputFormat)}`;

  const body: Record<string, unknown> = {
    text,
    model_id: modelId,
  };
  if (voiceSettings) body.voice_settings = voiceSettings;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `ElevenLabs TTS request failed: ${response.status} ${response.statusText} ${errBody}`,
    );
  }

  const json = (await response.json()) as ElevenLabsResponse;

  const audioBlob = base64ToBlob(json.audio_base64, mimeFor(outputFormat));
  const audioUrl = URL.createObjectURL(audioBlob);

  const alignment = useNormalizedAlignment
    ? (json.normalized_alignment ?? json.alignment)
    : (json.alignment ?? json.normalized_alignment);
  const wordTimestamps = aggregateCharTimestamps(alignment);

  const lastEnd = wordTimestamps[wordTimestamps.length - 1]?.endMs ?? 0;

  return { audioBlob, audioUrl, wordTimestamps, durationMs: lastEnd };
}

/**
 * Aggregate ElevenLabs' character-level timestamps into word timestamps by
 * collapsing non-whitespace runs. Whitespace boundaries mark word edges —
 * the same logic `wordSpansOf` uses over source text, so downstream helpers
 * stay aligned.
 *
 * Exported for unit testing; not re-exported from the package.
 */
export function aggregateCharTimestamps(
  alignment: ElevenLabsAlignment | undefined,
): WordTimestamp[] {
  if (!alignment) return [];
  const chars = alignment.characters ?? [];
  const starts = alignment.character_start_times_seconds ?? [];
  const ends = alignment.character_end_times_seconds ?? [];
  const n = Math.min(chars.length, starts.length, ends.length);
  if (n === 0) return [];

  const words: WordTimestamp[] = [];
  let i = 0;
  while (i < n) {
    while (i < n && /\s/.test(chars[i])) i++;
    if (i >= n) break;
    const wordStart = starts[i];
    let wordEnd = ends[i];
    let word = chars[i];
    i++;
    while (i < n && !/\s/.test(chars[i])) {
      word += chars[i];
      wordEnd = ends[i];
      i++;
    }
    words.push({
      word,
      startMs: wordStart * 1000,
      endMs: wordEnd * 1000,
    });
  }
  return words;
}

function mimeFor(outputFormat: string): string {
  if (outputFormat.startsWith('pcm')) return 'audio/wav';
  if (outputFormat.startsWith('ulaw')) return 'audio/basic';
  return 'audio/mpeg';
}

function base64ToBlob(b64: string, mime: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
