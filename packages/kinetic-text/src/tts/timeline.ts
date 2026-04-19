import type {
  KineticCue,
  KineticSpeedPreset,
  KineticTextEffect,
  TextRange,
} from '../types';
import type { WordTimestamp } from './types';

/**
 * Milliseconds-per-word estimates keyed by the public `KineticSpeedPreset`.
 * Used when no TTS timestamps are available — the fallback path times bursts
 * and cues to a uniform word cadence that roughly matches the requested speed.
 *
 * These are deliberately different from `SPEED_PRESETS` (which is char-level
 * reveal timing). A 260ms/word estimate for "default" corresponds to the
 * cadence of natural narration, not the per-character reveal animation.
 */
export const SPEED_TO_WORD_MS: Record<KineticSpeedPreset, number> = {
  slow: 420,
  default: 260,
  fast: 160,
};

/**
 * A cue that fires a one-shot effect during or after reveal. Distinct from
 * `KineticCue` in that the trigger position can be specified as a word index
 * (`atWord`) resolved via `wordStartTimes`, which lets narrative consumers
 * author in terms of "fire shake on word 7" without pre-computing the time.
 *
 * Precedence when multiple trigger fields are set:
 *   1. `onComplete: true` — fires after reveal finishes
 *   2. `atMs` — absolute time from reveal start
 *   3. `atWord` — resolved via `wordStarts`
 *
 * If none are set, the cue is silently dropped.
 */
export interface TimedCue {
  effect: KineticTextEffect;
  /** Stable cue id. Auto-generated from effect + index if omitted. */
  id?: string;
  /** Target character range. Omit for block-wide effect. */
  range?: TextRange;
  seed?: number;
  durationMs?: number;
  /** Fire after reveal completes. Takes precedence over atMs / atWord. */
  onComplete?: boolean;
  /** Absolute time from reveal start (ms). Takes precedence over atWord. */
  atMs?: number;
  /** 0-indexed word position. Resolved via `wordStarts`. */
  atWord?: number;
}

/**
 * A generic timed action — fires an arbitrary `payload` at a point in the
 * audio timeline. The `payload` is opaque to this package; consumers decide
 * what to do with it via the `onFire` callback passed to `attachAudioActions`.
 *
 * Typical payloads: ambient burst descriptors, analytics events, custom
 * side effects timed to narration.
 */
export interface TimedAction<T = unknown> {
  /** Absolute time from audio start (ms). Takes precedence over atWord. */
  atMs?: number;
  /** 0-indexed word position. Resolved via `wordStarts`. */
  atWord?: number;
  payload: T;
}

/**
 * Split `text` into `{start, end}` character spans, one per word. Whitespace
 * runs collapse into the gap between words; punctuation attaches to the
 * preceding word. Index into the returned array is the word number narrative
 * authors reference via `atWord`.
 *
 * Pure — deterministic for identical input.
 */
export function wordSpansOf(
  text: string,
): Array<{ start: number; end: number }> {
  const spans: Array<{ start: number; end: number }> = [];
  let i = 0;
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i])) i++;
    if (i >= text.length) break;
    const start = i;
    while (i < text.length && !/\s/.test(text[i])) i++;
    spans.push({ start, end: i });
  }
  return spans;
}

/**
 * Return the ms at which each word starts. Two sources, in priority order:
 *
 *   1. `wordTimestamps` from TTS — map by linear index. When the TTS splits
 *      differently (punctuation stripped, contractions expanded), trailing
 *      words the provider didn't cover extend uniformly from the last known
 *      timestamp at the `speedPreset` cadence.
 *   2. `speedPreset` — uniform estimate `wordIndex * SPEED_TO_WORD_MS[preset]`.
 *
 * The returned array length always matches `wordSpansOf(text).length`, so
 * callers can safely index by `atWord` without bounds checking.
 *
 * Pure — deterministic for identical input.
 */
export function wordStartTimes(
  text: string,
  speedPreset: KineticSpeedPreset = 'default',
  wordTimestamps?: WordTimestamp[],
): number[] {
  const spans = wordSpansOf(text);
  const count = spans.length;
  if (count === 0) return [];

  const fallbackMs = SPEED_TO_WORD_MS[speedPreset];
  const out = new Array<number>(count);

  if (wordTimestamps && wordTimestamps.length > 0) {
    const limit = Math.min(count, wordTimestamps.length);
    for (let i = 0; i < limit; i++) out[i] = wordTimestamps[i].startMs;
    const lastKnown = out[limit - 1] ?? 0;
    for (let i = limit; i < count; i++) {
      out[i] = lastKnown + (i - limit + 1) * fallbackMs;
    }
    return out;
  }

  for (let i = 0; i < count; i++) out[i] = i * fallbackMs;
  return out;
}

/** Resolve a TimedCue's trigger position to (trigger, atMs) or null when invalid. */
function resolveCueTrigger(
  cue: TimedCue,
  wordStarts: number[],
): { trigger: 'on-complete' } | { trigger: 'at-time'; atMs: number } | null {
  if (cue.onComplete) return { trigger: 'on-complete' };
  if (typeof cue.atMs === 'number') {
    return { trigger: 'at-time', atMs: Math.max(0, cue.atMs) };
  }
  if (typeof cue.atWord === 'number' && wordStarts.length > 0) {
    const clamped = Math.max(0, Math.min(cue.atWord, wordStarts.length - 1));
    return { trigger: 'at-time', atMs: wordStarts[clamped] };
  }
  return null;
}

/**
 * Convert a list of `TimedCue` into the `KineticCue[]` shape `<KineticText>`
 * accepts. Cues without a valid trigger are dropped silently.
 *
 * Pure — deterministic for identical input.
 */
export function buildKineticCues(
  cues: TimedCue[] | undefined,
  wordStarts: number[],
): KineticCue[] {
  if (!cues || cues.length === 0) return [];
  const out: KineticCue[] = [];
  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    const resolved = resolveCueTrigger(cue, wordStarts);
    if (!resolved) continue;
    out.push({
      id: cue.id ?? `cue-${i}-${cue.effect}`,
      effect: cue.effect,
      trigger: resolved.trigger,
      ...(resolved.trigger === 'at-time' ? { atMs: resolved.atMs } : {}),
      ...(cue.range !== undefined ? { range: cue.range } : {}),
      ...(cue.seed !== undefined ? { seed: cue.seed } : {}),
      ...(cue.durationMs !== undefined ? { durationMs: cue.durationMs } : {}),
    });
  }
  return out;
}

/**
 * Resolve a list of `TimedAction<T>` into sorted `{atMs, payload}` tuples
 * ready for `attachAudioActions`. Actions without a usable time (no `atMs`
 * and no `wordStarts`, or an out-of-range `atWord` with empty `wordStarts`)
 * are dropped silently. Out-of-range `atWord` with a non-empty `wordStarts`
 * clamps to the last word so a mis-counted index still fires near the end.
 *
 * Pure — deterministic for identical input.
 */
export function resolveActionTimes<T>(
  actions: TimedAction<T>[] | undefined,
  wordStarts: number[],
): Array<{ atMs: number; payload: T }> {
  if (!actions || actions.length === 0) return [];
  const out: Array<{ atMs: number; payload: T }> = [];
  const lastStart =
    wordStarts.length > 0 ? wordStarts[wordStarts.length - 1] : 0;
  for (const action of actions) {
    let atMs: number | null = null;
    if (typeof action.atMs === 'number') {
      atMs = Math.max(0, action.atMs);
    } else if (typeof action.atWord === 'number') {
      if (wordStarts.length === 0) continue;
      const clamped = Math.max(
        0,
        Math.min(action.atWord, wordStarts.length - 1),
      );
      atMs = wordStarts[clamped] ?? lastStart;
    }
    if (atMs === null) continue;
    out.push({ atMs, payload: action.payload });
  }
  out.sort((a, b) => a.atMs - b.atMs);
  return out;
}
