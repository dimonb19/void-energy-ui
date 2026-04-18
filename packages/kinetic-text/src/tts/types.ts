/**
 * Provider-agnostic types for TTS integration.
 *
 * Every provider adapter normalizes its API response into these shapes.
 * The core TTS utilities (marks, cues, sync, fallback) only ever see
 * `TTSResult` — they don't know which provider produced it. Adding a new
 * provider is a single file in `./providers/` that returns `TTSResult`.
 */

/**
 * Universal result returned by every TTS provider adapter.
 *
 * - `audioBlob` / `audioUrl` — the rendered speech. The caller owns the
 *   Object URL and must revoke it when done.
 * - `wordTimestamps` — precise per-word timing. Empty when the provider
 *   cannot return timestamps (fall back to `estimateCharSpeed`).
 * - `durationMs` — total duration, used by the fallback path.
 */
export interface TTSResult {
  audioBlob: Blob;
  audioUrl: string;
  wordTimestamps: WordTimestamp[];
  durationMs: number;
}

export interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}

/**
 * Shape every provider adapter implements. Adapters are callable as
 * `synthesize(text, options)` — the `TTSProvider` interface is for when
 * a consumer wants to store/pass adapters as values.
 */
export interface TTSProvider<
  Options extends Record<string, unknown> = Record<string, unknown>,
> {
  synthesize(text: string, options: Options): Promise<TTSResult>;
}
