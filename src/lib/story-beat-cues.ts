import type {
  KineticCue,
  KineticSpeedPreset,
  KineticTextEffect,
} from '@dgrslabs/void-energy-kinetic-text/types';
import type { WordTimestamp } from '@dgrslabs/void-energy-kinetic-text/tts';
import type { ActionLayer } from '@dgrslabs/void-energy-ambient-layers/types';
import type {
  AmbientIntensity,
  StoryAction,
  StoryBeat,
  StoryOneShot,
} from '@lib/story-beat-types';

const SPEED_TO_WORD_MS: Record<KineticSpeedPreset, number> = {
  slow: 420,
  default: 260,
  fast: 160,
};

/**
 * Split `text` into `{start, end}` character spans, one per word. Whitespace
 * runs collapse into the gap between words; punctuation attaches to the
 * preceding word. Index into the returned array is the word number the LLM
 * emits via `atWord`.
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
 *      differently (punctuation stripped, contractions expanded), we fall
 *      through to the fallback for any trailing words the provider didn't
 *      cover.
 *   2. `speedPreset` — uniform estimate `wordIndex * ms/word`.
 *
 * The returned array length always matches `wordSpansOf(text).length` so
 * callers can safely index by `atWord` from a story beat.
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
    // Pad trailing indices the provider didn't cover with a uniform extension
    // from the last known timestamp.
    const lastKnown = out[limit - 1] ?? 0;
    for (let i = limit; i < count; i++) {
      out[i] = lastKnown + (i - limit + 1) * fallbackMs;
    }
    return out;
  }

  for (let i = 0; i < count; i++) out[i] = i * fallbackMs;
  return out;
}

/**
 * Build a `KineticCue[]` from a beat's `kinetic.oneShots` array. Each cue's
 * `atMs` comes from `wordStarts[atWord]` (or 0 if out of range). `scope: 'block'`
 * so the effect plays across the whole text — matching the dramatic-word-as-cue
 * intent from the prompt.
 */
export function buildCuesFromOneShots(
  oneShots: StoryOneShot[] | undefined,
  wordStarts: number[],
): KineticCue[] {
  if (!oneShots || oneShots.length === 0) return [];
  return oneShots.map((shot, i) => ({
    id: `beat-oneshot-${i}-${shot.effect}`,
    effect: shot.effect,
    trigger: 'at-time' as const,
    atMs: wordStarts[shot.atWord] ?? 0,
  }));
}

/**
 * Convert `ambient.actions` to `{atMs, action}` tuples ready to schedule with
 * `setTimeout`. Out-of-range `atWord` silently clamps to the last word's start
 * so a mis-counted index still fires near the end rather than at 0.
 */
export function scheduleActions(
  actions: StoryAction[] | undefined,
  wordStarts: number[],
): Array<{ atMs: number; action: StoryAction }> {
  if (!actions || actions.length === 0 || wordStarts.length === 0) return [];
  const lastStart = wordStarts[wordStarts.length - 1];
  return actions.map((action) => ({
    atMs: wordStarts[action.atWord] ?? lastStart,
    action,
  }));
}

// Curated pools for spontaneous extras. Picked to be tasteful surprises, not
// scene-changing money moments — those stay on the schema-enforced action +
// one-shot that the LLM placed deliberately.
const SPONTANEOUS_ACTION_VARIANTS: readonly ActionLayer[] = [
  'flash',
  'reveal',
  'dissolve',
  'shake',
  'impact',
  'zoomBurst',
] as const;

const SPONTANEOUS_KINETIC_EFFECTS: readonly KineticTextEffect[] = [
  'ripple',
  'flash',
  'jolt',
  'surge',
  'shake',
  'sparkle',
  'glow',
  'flicker',
] as const;

// Bias toward `low` so the deliberate beat peak still lands hardest.
const SPONTANEOUS_INTENSITIES: readonly AmbientIntensity[] = [
  'low',
  'low',
  'low',
  'medium',
] as const;

function pick<T>(pool: readonly T[], rng: () => number): T {
  return pool[Math.floor(rng() * pool.length)];
}

/**
 * Filler-only safety net. The beat already carries 2–4 deliberately placed
 * one-shots and 2–4 deliberately placed ambient bursts (schema-enforced); the
 * deliberate set carries the experience. This function tops it up with at
 * most 1–2 small surprises, and only when the deliberate set is sparse.
 *
 * Reserves the first ~2 words (too early to register) and the last word
 * (reveal-complete handlers are about to fire). Skips word indices already
 * claimed by scheduled effects so extras never double up on a deliberate moment.
 *
 * `rng` is injected so tests can seed it; defaults to `Math.random`.
 */
export function generateSpontaneousExtras(
  beat: StoryBeat,
  wordCount: number,
  rng: () => number = Math.random,
): { actions: StoryAction[]; oneShots: StoryOneShot[] } {
  if (wordCount < 10) return { actions: [], oneShots: [] };

  const scheduledCount =
    (beat.ambient.actions?.length ?? 0) + (beat.kinetic.oneShots?.length ?? 0);
  // FLOOR: only top up if the beat shipped sparse. With the current schema
  // (2–4 each) Claude almost always lands ≥4 total, so extras stay rare.
  const FLOOR = 4;
  if (scheduledCount >= FLOOR) return { actions: [], oneShots: [] };

  const claimed = new Set<number>([
    ...(beat.ambient.actions ?? []).map((a) => a.atWord),
    ...(beat.kinetic.oneShots ?? []).map((o) => o.atWord),
  ]);

  const available: number[] = [];
  for (let i = 2; i < wordCount - 1; i++) {
    if (!claimed.has(i)) available.push(i);
  }
  if (available.length === 0) return { actions: [], oneShots: [] };

  // Top up to FLOOR, capped at 2 extras max — extras are seasoning, not main act.
  const target = Math.min(FLOOR - scheduledCount, 2);
  const count = Math.min(target, available.length);

  // Fisher–Yates on a copy, then take the first `count`.
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  const picked = available.slice(0, count).sort((a, b) => a - b);

  const actions: StoryAction[] = [];
  const oneShots: StoryOneShot[] = [];
  for (const atWord of picked) {
    if (rng() < 0.5) {
      actions.push({
        atWord,
        variant: pick(SPONTANEOUS_ACTION_VARIANTS, rng),
        intensity: pick(SPONTANEOUS_INTENSITIES, rng),
      });
    } else {
      oneShots.push({
        atWord,
        effect: pick(SPONTANEOUS_KINETIC_EFFECTS, rng),
      });
    }
  }
  return { actions, oneShots };
}
