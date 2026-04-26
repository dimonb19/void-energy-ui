/**
 * Ramp helpers for persistent ambient layers — animate the continuous float
 * fed to `--ambient-level` (low=1, medium=2, high=3) via
 * `requestAnimationFrame` so transitions feel perceptually smooth.
 *
 * - `startDecay(initial, stepMs, ...)` ramps `initial → 0` over
 *   `stepMs * initialNum` ms (per-step pacing, so high decays over 3*stepMs).
 * - `startRise(target, totalMs, ...)` ramps `0 → target` over `totalMs` flat
 *   regardless of target (rise feel should be intensity-independent).
 *
 * Both share `onTick` / `onStep` / `onComplete` semantics:
 * - `onTick(value, level)` fires every frame with the current float (used to
 *   feed `--ambient-level`) and the semantic ladder level that float maps to.
 * - `onStep(level)` fires only when the semantic level changes (off ↔ low ↔
 *   medium ↔ high) — used by `onChange` consumers reacting to thresholds.
 * - `onComplete` fires once when the value reaches its endpoint (0 for decay,
 *   target for rise).
 *
 * When the duration arg is <= 0, the helper emits a single `onTick` at the
 * endpoint and returns a no-op `stop`.
 *
 * Scope-owned: the calling `$effect` block is responsible for calling `stop`
 * on teardown.
 */

import type { AmbientIntensity, AmbientLevel } from '../../types';

export interface DecayHandle {
  stop: () => void;
}

const NUM: Record<AmbientIntensity, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function toLevel(value: number): AmbientLevel {
  if (value <= 0.0001) return 'off';
  if (value <= 1) return 'low';
  if (value <= 2) return 'medium';
  return 'high';
}

export function startDecay(
  initial: AmbientIntensity,
  stepMs: number,
  onTick: (value: number, level: AmbientLevel) => void,
  onStep?: (level: AmbientLevel) => void,
  onComplete?: () => void,
): DecayHandle {
  const start = NUM[initial];

  if (stepMs <= 0) {
    onTick(start, initial);
    return { stop: () => {} };
  }

  const total = stepMs * start;
  const startTime = performance.now();
  let rafId: number | null = null;
  let lastLevel: AmbientLevel = initial;

  const frame = (now: number) => {
    const t = Math.min(1, (now - startTime) / total);
    const value = start * (1 - t);
    const level = toLevel(value);
    onTick(value, level);
    if (level !== lastLevel) {
      lastLevel = level;
      onStep?.(level);
    }
    if (t < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(frame);

  return {
    stop: () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
  };
}

/**
 * Smooth ramp from `from` (any current float in [0, 3]) down to 0 over
 * `totalMs` ms (flat time). Used for explicit scene clears — the duration
 * is intensity-independent because clearing should feel snappy and uniform
 * regardless of how loud the scene was.
 */
export function startFall(
  from: number,
  totalMs: number,
  onTick: (value: number, level: AmbientLevel) => void,
  onStep?: (level: AmbientLevel) => void,
  onComplete?: () => void,
): DecayHandle {
  if (totalMs <= 0 || from <= 0) {
    onTick(0, 'off');
    onComplete?.();
    return { stop: () => {} };
  }

  const startTime = performance.now();
  let rafId: number | null = null;
  let lastLevel: AmbientLevel = toLevel(from);

  const frame = (now: number) => {
    const t = Math.min(1, (now - startTime) / totalMs);
    const value = from * (1 - t);
    const level = toLevel(value);
    onTick(value, level);
    if (level !== lastLevel) {
      lastLevel = level;
      onStep?.(level);
    }
    if (t < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(frame);

  return {
    stop: () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
  };
}

/**
 * Smooth ramp from 0 up to `target` over `totalMs` ms. Mirrors `startDecay`'s
 * RAF loop but with flat (intensity-independent) pacing — rise time should
 * feel the same whether the target is low/medium/high.
 */
export function startRise(
  target: AmbientIntensity,
  totalMs: number,
  onTick: (value: number, level: AmbientLevel) => void,
  onStep?: (level: AmbientLevel) => void,
  onComplete?: () => void,
): DecayHandle {
  const end = NUM[target];

  if (totalMs <= 0) {
    onTick(end, target);
    onComplete?.();
    return { stop: () => {} };
  }

  const startTime = performance.now();
  let rafId: number | null = null;
  let lastLevel: AmbientLevel = 'off';

  const frame = (now: number) => {
    const t = Math.min(1, (now - startTime) / totalMs);
    const value = end * t;
    const level = toLevel(value);
    onTick(value, level);
    if (level !== lastLevel) {
      lastLevel = level;
      onStep?.(level);
    }
    if (t < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(frame);

  return {
    stop: () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
  };
}
