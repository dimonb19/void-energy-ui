import type { CharPosition, StaggerPattern } from '../../types';

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
): number[] {
  const count = positions.length;
  if (count === 0) return [];

  // Sequential: linear left-to-right, top-to-bottom
  return positions.map((p) => p.globalIndex * staggerMs);
}
