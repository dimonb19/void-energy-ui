/**
 * Seeded PRNG — mulberry32.
 *
 * All random behavior in the kinetic text package routes through this PRNG
 * so that reveal ordering and effect behavior are deterministic for the
 * same seed + inputs.
 */

/**
 * Create a deterministic PRNG from a 32-bit seed.
 * Returns a function that yields floats in [0, 1).
 */
export function createPRNG(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string into a 32-bit integer seed.
 * Used as default seed when none is provided: hash(text + revealMode).
 */
export function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(31, h) + input.charCodeAt(i);
    h = h | 0;
  }
  return h;
}

/**
 * Seeded Fisher-Yates shuffle. Returns a new array.
 */
export function seededShuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}
