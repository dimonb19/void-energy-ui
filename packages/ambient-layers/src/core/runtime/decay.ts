/**
 * Continuous auto-decay helper for persistent ambient layers.
 *
 * Drives a float value from `initialNum` (light=1, medium=2, heavy=3) down to
 * 0 over `stepMs * initialNum` ms via `requestAnimationFrame`, so the fade is
 * perceptually smooth — no visual jumps between intensity ladder rungs.
 *
 * - `onTick(value, level)` fires every frame with the current float (used to
 *   feed `--ambient-level` in the DOM) and the semantic ladder level that
 *   float currently maps to.
 * - `onStep(level)` fires only when the semantic level changes (heavy →
 *   medium → light → off). Mirrors the legacy step-based callback so
 *   consumers can still react to threshold crossings (e.g. `onChange`).
 * - `onComplete` fires once when the value reaches 0.
 *
 * When `stepMs <= 0`, decay is disabled and only a single `onTick` at the
 * initial value is emitted so the caller can sync its initial state.
 *
 * Scope-owned: the calling `$effect` block is responsible for calling `stop`
 * on teardown.
 */

import type { AmbientIntensity, AmbientLevel } from '../../types';

export interface DecayHandle {
  stop: () => void;
}

const NUM: Record<AmbientIntensity, number> = {
  light: 1,
  medium: 2,
  heavy: 3,
};

function toLevel(value: number): AmbientLevel {
  if (value <= 0.0001) return 'off';
  if (value <= 1) return 'light';
  if (value <= 2) return 'medium';
  return 'heavy';
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
