import type { CharPosition, RevealMark, StaggerPattern } from '../../types';

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

/**
 * Convert an externally-provided set of `RevealMark` entries into a dense
 * per-character delays array aligned to `positions`.
 *
 * Marks are keyed by global character index. For characters between two
 * marks, the delay is linearly interpolated. Characters before the first
 * mark reveal at the first mark's time; characters after the last mark
 * reveal at the last mark's time.
 *
 * Pure — no side effects, deterministic for identical input.
 */
export function marksToDelays(
  positions: CharPosition[],
  revealMarks: RevealMark[],
): number[] {
  const count = positions.length;
  if (count === 0) return [];

  // Sort marks by index (defensive — input order is not guaranteed) and
  // drop any entries that fall outside the position range.
  const sorted = revealMarks
    .filter((m) => m.index >= 0 && m.index < count)
    .slice()
    .sort((a, b) => a.index - b.index);

  if (sorted.length === 0) {
    return new Array(count).fill(0);
  }

  const delays = new Array<number>(count);

  // Fill before the first mark
  for (let i = 0; i < sorted[0].index; i++) {
    delays[i] = sorted[0].timeMs;
  }

  // Walk adjacent mark pairs and linearly interpolate between them
  for (let m = 0; m < sorted.length; m++) {
    const a = sorted[m];
    delays[a.index] = a.timeMs;

    const b = sorted[m + 1];
    if (!b) break;

    const span = b.index - a.index;
    const dt = b.timeMs - a.timeMs;
    for (let j = 1; j < span; j++) {
      delays[a.index + j] = a.timeMs + (dt * j) / span;
    }
  }

  // Fill after the last mark
  const last = sorted[sorted.length - 1];
  for (let i = last.index + 1; i < count; i++) {
    delays[i] = last.timeMs;
  }

  return delays;
}
