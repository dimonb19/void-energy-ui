/**
 * Tiny auto-decay helper for persistent ambient layers.
 *
 * Steps a level from its initial value down through the intensity ladder
 * (heavy → medium → light → off) at a fixed interval. Each step fires
 * `onStep`; reaching 'off' fires `onComplete`. When `ms <= 0`, decay is
 * disabled and the level stays at its initial value.
 *
 * Scope-owned: the calling `$effect` block is responsible for clearing the
 * returned handle on teardown.
 */

import type { AmbientIntensity, AmbientLevel } from '../../types';

export interface DecayHandle {
  stop: () => void;
}

const LADDER: readonly AmbientLevel[] = ['heavy', 'medium', 'light', 'off'];

function nextStep(current: AmbientLevel): AmbientLevel {
  const i = LADDER.indexOf(current);
  return i < 0 || i === LADDER.length - 1 ? 'off' : LADDER[i + 1];
}

export function startDecay(
  initial: AmbientIntensity,
  ms: number,
  onStep: (level: AmbientLevel) => void,
  onComplete?: () => void,
): DecayHandle {
  if (ms <= 0) {
    return { stop: () => {} };
  }

  let level: AmbientLevel = initial;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const tick = () => {
    level = nextStep(level);
    onStep(level);
    if (level !== 'off') {
      timer = setTimeout(tick, ms);
    } else {
      onComplete?.();
    }
  };

  timer = setTimeout(tick, ms);

  return {
    stop: () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
