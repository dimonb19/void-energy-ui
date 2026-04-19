import type { KineticTextEffect } from '@dgrslabs/void-energy-kinetic-text/types';
import type { ActionLayer } from '@dgrslabs/void-energy-ambient-layers/types';
import type {
  AmbientIntensity,
  StoryAction,
  StoryBeat,
  StoryOneShot,
} from '@lib/story-beat-types';

// Generic timeline helpers live in the kinetic-text package — re-export
// so consumers can keep a single `@lib/story-beat-cues` import surface.
export {
  wordSpansOf,
  wordStartTimes,
  SPEED_TO_WORD_MS,
} from '@dgrslabs/void-energy-kinetic-text/tts';

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

  const target = Math.min(FLOOR - scheduledCount, 2);
  const count = Math.min(target, available.length);

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
