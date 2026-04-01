import type {
  CharPosition,
  StaggerPattern,
  PhysicsPreset,
  RevealStyle,
} from '../../types';
import { createPRNG, seededShuffle } from './prng';

/**
 * Compute per-unit reveal delays (in ms) based on stagger pattern and positions.
 *
 * Returns an array parallel to `positions` where each entry is the delay in ms
 * before that unit should begin revealing.
 */
export function computeStaggerDelays(
  positions: CharPosition[],
  _pattern: StaggerPattern,
  staggerMs: number,
  physics: PhysicsPreset,
  seed: number,
  revealStyle?: RevealStyle,
): number[] {
  const count = positions.length;
  if (count === 0) return [];

  let delays: number[];

  if (revealStyle === 'random') {
    // Shuffled reveal order: each position gets a random time slot
    const rng = createPRNG(seed + 31337);
    const indices = Array.from({ length: count }, (_, i) => i);
    const shuffled = seededShuffle(indices, rng);
    delays = new Array(count);
    for (let i = 0; i < count; i++) {
      delays[i] = shuffled[i] * staggerMs;
    }
  } else {
    // Sequential: linear left-to-right, top-to-bottom
    delays = positions.map((p) => p.globalIndex * staggerMs);
  }

  // Retro physics: add ±30% seeded jitter to each unit's delay
  if (physics === 'retro') {
    const rng = createPRNG(seed + 7919);
    for (let i = 0; i < delays.length; i++) {
      const jitter = (rng() - 0.5) * 0.6; // -0.3 to +0.3
      delays[i] = Math.max(0, delays[i] * (1 + jitter));
    }
  }

  return delays;
}
