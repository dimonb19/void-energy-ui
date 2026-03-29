import type { CharPosition, StaggerPattern, PhysicsPreset } from '../../types';
import { createPRNG, seededShuffle } from './prng';

/**
 * Compute per-unit reveal delays (in ms) based on stagger pattern and positions.
 *
 * Returns an array parallel to `positions` where each entry is the delay in ms
 * before that unit should begin revealing.
 */
export function computeStaggerDelays(
  positions: CharPosition[],
  pattern: StaggerPattern,
  staggerMs: number,
  physics: PhysicsPreset,
  seed: number,
): number[] {
  const count = positions.length;
  if (count === 0) return [];

  let delays: number[];

  switch (pattern) {
    case 'sequential':
      delays = sequential(positions, staggerMs);
      break;
    case 'wave':
      delays = wave(positions, staggerMs);
      break;
    case 'cascade':
      delays = cascade(positions, staggerMs);
      break;
    case 'random':
      delays = random(positions, staggerMs, seed);
      break;
    default:
      delays = sequential(positions, staggerMs);
  }

  // Retro physics: add ±30% seeded jitter to each unit's delay
  if (physics === 'retro') {
    const rng = createPRNG(seed + 7919); // offset seed to avoid correlation with random pattern
    for (let i = 0; i < delays.length; i++) {
      const jitter = (rng() - 0.5) * 0.6; // -0.3 to +0.3
      delays[i] = Math.max(0, delays[i] * (1 + jitter));
    }
  }

  return delays;
}

/** Linear left-to-right, top-to-bottom. */
function sequential(positions: CharPosition[], stagger: number): number[] {
  return positions.map((p) => p.globalIndex * stagger);
}

/** Sine-wave delay based on x-position within each line. */
function wave(positions: CharPosition[], stagger: number): number[] {
  // Compute max x per line for normalization
  const lineWidths = new Map<number, number>();
  for (const p of positions) {
    const cur = lineWidths.get(p.lineIndex) ?? 0;
    if (p.x + p.width > cur) {
      lineWidths.set(p.lineIndex, p.x + p.width);
    }
  }

  return positions.map((p) => {
    const lineWidth = lineWidths.get(p.lineIndex) ?? 1;
    const xNorm = lineWidth > 0 ? p.x / lineWidth : 0;
    const waveFactor = Math.sin(xNorm * Math.PI) * stagger * 3;
    return p.globalIndex * stagger + waveFactor;
  });
}

/** Diagonal sweep: delay = (charX + lineY * factor) * stagger. */
function cascade(positions: CharPosition[], stagger: number): number[] {
  // Find max chars per line for the diagonal factor
  const lineCounts = new Map<number, number>();
  for (const p of positions) {
    const cur = lineCounts.get(p.lineIndex) ?? 0;
    if (p.charIndexInLine + 1 > cur) {
      lineCounts.set(p.lineIndex, p.charIndexInLine + 1);
    }
  }

  // Use average chars per line as the diagonal factor
  let totalChars = 0;
  let lineCount = 0;
  for (const count of lineCounts.values()) {
    totalChars += count;
    lineCount++;
  }
  const avgCharsPerLine = lineCount > 0 ? totalChars / lineCount : 1;

  return positions.map(
    (p) => (p.charIndexInLine + p.lineIndex * avgCharsPerLine * 0.3) * stagger,
  );
}

/** Seeded random order. */
function random(
  positions: CharPosition[],
  stagger: number,
  seed: number,
): number[] {
  const indices = positions.map((_, i) => i);
  const rng = createPRNG(seed);
  const shuffled = seededShuffle(indices, rng);

  // Build a rank map: shuffled[rank] = originalIndex → delays[originalIndex] = rank * stagger
  const delays = new Array<number>(positions.length);
  for (let rank = 0; rank < shuffled.length; rank++) {
    delays[shuffled[rank]] = rank * stagger;
  }
  return delays;
}
