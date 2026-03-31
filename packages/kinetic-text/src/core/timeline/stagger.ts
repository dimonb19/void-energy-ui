import type { CharPosition, StaggerPattern, PhysicsPreset } from '../../types';
import { createPRNG } from './prng';

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
): number[] {
  const count = positions.length;
  if (count === 0) return [];

  // Sequential: linear left-to-right, top-to-bottom
  let delays = positions.map((p) => p.globalIndex * staggerMs);

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
