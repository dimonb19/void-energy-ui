/**
 * Tiny auto-decay helper for persistent ambient layers.
 *
 * Steps a level from its initial value (1..3) down to 0 at a fixed interval.
 * Each step fires `onStep`; reaching 0 fires `onComplete`. When `ms <= 0`,
 * decay is disabled and the level stays at its initial value.
 *
 * Scope-owned: the calling `$effect` block is responsible for clearing the
 * returned handle on teardown.
 */

export interface DecayHandle {
  stop: () => void;
}

export function startDecay(
  initial: 1 | 2 | 3,
  ms: number,
  onStep: (level: 0 | 1 | 2 | 3) => void,
  onComplete?: () => void,
): DecayHandle {
  if (ms <= 0) {
    return { stop: () => {} };
  }

  let level: 0 | 1 | 2 | 3 = initial;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const tick = () => {
    level = (level - 1) as 0 | 1 | 2 | 3;
    onStep(level);
    if (level > 0) {
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
