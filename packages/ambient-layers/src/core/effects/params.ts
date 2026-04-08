/**
 * Per-layer default parameters. Mirrors the kinetic-text `effects/params.ts`
 * pattern: one registry mapping layer id → tuning knobs used by the component
 * at render time. Keeps layer-specific magic numbers out of the component code.
 */

import type {
  ActionLayer,
  ActionLevel,
  AmbientIntensity,
  AtmosphereLayer,
  PsychologyLayer,
} from '../../types';

type IntensityCounts = Record<AmbientIntensity, number>;

/** Atmosphere auto-decay duration per step in ms, and default particle counts per intensity. */
export const ATMOSPHERE_PARAMS: Record<
  AtmosphereLayer,
  { decayMs: number; counts: IntensityCounts }
> = {
  rain: { decayMs: 8000, counts: { light: 60, medium: 140, heavy: 260 } },
  snow: { decayMs: 10000, counts: { light: 30, medium: 70, heavy: 140 } },
  ash: { decayMs: 12000, counts: { light: 20, medium: 50, heavy: 100 } },
  fog: { decayMs: 12000, counts: { light: 3, medium: 5, heavy: 7 } },
  underwater: { decayMs: 12000, counts: { light: 4, medium: 6, heavy: 8 } },
  heat: { decayMs: 10000, counts: { light: 3, medium: 5, heavy: 7 } },
};

/** Psychology auto-decay duration per level in ms. */
export const PSYCHOLOGY_PARAMS: Record<PsychologyLayer, { decayMs: number }> = {
  danger: { decayMs: 6000 },
  tension: { decayMs: 8000 },
  dizzy: { decayMs: 6000 },
  focus: { decayMs: 8000 },
  flashback: { decayMs: 10000 },
  dreaming: { decayMs: 12000 },
};

/** Action one-shot duration per level in ms. Component unmounts after this. */
export const ACTION_PARAMS: Record<ActionLayer, Record<ActionLevel, number>> = {
  impact: { light: 500, medium: 800, heavy: 1200 },
  speed: { light: 900, medium: 1400, heavy: 1800 },
  glitch: { light: 350, medium: 600, heavy: 1000 },
  flash: { light: 200, medium: 350, heavy: 600 },
  reveal: { light: 400, medium: 700, heavy: 1100 },
};
