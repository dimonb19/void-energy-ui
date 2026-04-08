/**
 * Per-layer default parameters. Mirrors the kinetic-text `effects/params.ts`
 * pattern: one registry mapping layer id → tuning knobs used by the component
 * at render time. Keeps layer-specific magic numbers out of the component code.
 */

import type {
  ActionLayer,
  ActionLevel,
  AtmosphereLayer,
  PsychologyLayer,
} from '../../types';

/** Atmosphere auto-decay duration per level in ms, and default particle counts per intensity. */
export const ATMOSPHERE_PARAMS: Record<
  AtmosphereLayer,
  { decayMs: number; counts: [number, number, number] }
> = {
  rain: { decayMs: 8000, counts: [60, 140, 260] },
  snow: { decayMs: 10000, counts: [30, 70, 140] },
  ash: { decayMs: 12000, counts: [20, 50, 100] },
  fog: { decayMs: 12000, counts: [3, 5, 7] },
  underwater: { decayMs: 12000, counts: [4, 6, 8] },
  heat: { decayMs: 10000, counts: [3, 5, 7] },
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
