/**
 * Per-effect parameter registry — the SSOT for ambient layer tuning.
 *
 * Every ambient effect has exactly one entry here, declaring its category,
 * default intensity, and default duration. The runtime (`decay.ts`) and the
 * four category Svelte components read from this file; nothing else owns
 * effect-level magic numbers.
 *
 * Mirrors the kinetic-text `effects/params.ts` pattern: one registry per
 * effect, no per-component constants. To add a new effect:
 *   1. Add its id to the appropriate union in `../../types.ts`.
 *   2. Add an entry below in the matching `*_PARAMS` map.
 *   3. Add a SCSS block in `styles/ambient-layers.scss`.
 *   4. Add the variant branch in the relevant category Svelte component.
 *   5. Add a tile in the showcase.
 *
 * Field meanings (unified across categories per Phase 1 reconciliation):
 * - `durationMs` — for persistent layers, time per decay step
 *   (heavy → medium → light → off). For action layers, total one-shot
 *   animation duration. Environment layers ignore duration (sticky).
 * - `defaultIntensity` — the intensity used when the consumer omits the
 *   `intensity` prop. Always `'medium'` today; reserved for future tuning.
 * - `counts` (atmosphere only) — particle counts per intensity for
 *   particle-field variants (rain/snow/ash). SVG-filter variants ignore.
 */

import type {
  ActionLayer,
  AmbientIntensity,
  AtmosphereLayer,
  PsychologyLayer,
} from '../../types';

type IntensityCounts = Record<AmbientIntensity, number>;

interface PersistentEffectParams {
  defaultIntensity: AmbientIntensity;
  durationMs: number;
}

interface AtmosphereEffectParams extends PersistentEffectParams {
  counts: IntensityCounts;
}

interface ActionEffectParams {
  defaultIntensity: AmbientIntensity;
  /** Per-intensity one-shot duration in ms. Component unmounts after the chosen value. */
  durationMs: Record<AmbientIntensity, number>;
}

/** Atmosphere effect registry — particle counts and decay duration per variant. */
export const ATMOSPHERE_PARAMS: Record<
  AtmosphereLayer,
  AtmosphereEffectParams
> = {
  rain: {
    defaultIntensity: 'medium',
    durationMs: 8000,
    counts: { light: 60, medium: 140, heavy: 260 },
  },
  snow: {
    defaultIntensity: 'medium',
    durationMs: 10000,
    counts: { light: 30, medium: 70, heavy: 140 },
  },
  ash: {
    defaultIntensity: 'medium',
    durationMs: 12000,
    counts: { light: 20, medium: 50, heavy: 100 },
  },
  fog: {
    defaultIntensity: 'medium',
    durationMs: 12000,
    counts: { light: 3, medium: 5, heavy: 7 },
  },
  underwater: {
    defaultIntensity: 'medium',
    durationMs: 12000,
    counts: { light: 4, medium: 6, heavy: 8 },
  },
  heat: {
    defaultIntensity: 'medium',
    durationMs: 10000,
    counts: { light: 3, medium: 5, heavy: 7 },
  },
  // storm composes the rain particle system internally + lightning + wind drift.
  // Counts intentionally heavier than rain.
  storm: {
    defaultIntensity: 'medium',
    durationMs: 12000,
    counts: { light: 100, medium: 200, heavy: 360 },
  },
  // wind is a horizontal-streak field (dust/leaves) with no precipitation.
  wind: {
    defaultIntensity: 'medium',
    durationMs: 10000,
    counts: { light: 30, medium: 60, heavy: 100 },
  },
};

/** Psychology effect registry — decay duration per variant. */
export const PSYCHOLOGY_PARAMS: Record<
  PsychologyLayer,
  PersistentEffectParams
> = {
  danger: { defaultIntensity: 'medium', durationMs: 6000 },
  tension: { defaultIntensity: 'medium', durationMs: 8000 },
  dizzy: { defaultIntensity: 'medium', durationMs: 6000 },
  focus: { defaultIntensity: 'medium', durationMs: 8000 },
  filmGrain: { defaultIntensity: 'medium', durationMs: 10000 },
  haze: { defaultIntensity: 'medium', durationMs: 12000 },
  calm: { defaultIntensity: 'medium', durationMs: 10000 },
  serenity: { defaultIntensity: 'medium', durationMs: 12000 },
  success: { defaultIntensity: 'medium', durationMs: 8000 },
  fail: { defaultIntensity: 'medium', durationMs: 8000 },
  awe: { defaultIntensity: 'medium', durationMs: 12000 },
  melancholy: { defaultIntensity: 'medium', durationMs: 10000 },
};

/** Action effect registry — one-shot duration per intensity, per variant. */
export const ACTION_PARAMS: Record<ActionLayer, ActionEffectParams> = {
  impact: {
    defaultIntensity: 'medium',
    durationMs: { light: 2500, medium: 3500, heavy: 5000 },
  },
  speed: {
    defaultIntensity: 'medium',
    durationMs: { light: 3500, medium: 5000, heavy: 7000 },
  },
  glitch: {
    defaultIntensity: 'medium',
    durationMs: { light: 2500, medium: 3500, heavy: 5000 },
  },
  flash: {
    defaultIntensity: 'medium',
    durationMs: { light: 2000, medium: 3000, heavy: 4500 },
  },
  reveal: {
    defaultIntensity: 'medium',
    durationMs: { light: 2500, medium: 3500, heavy: 5000 },
  },
  dissolve: {
    defaultIntensity: 'medium',
    durationMs: { light: 3000, medium: 4500, heavy: 6000 },
  },
  shake: {
    defaultIntensity: 'medium',
    durationMs: { light: 2500, medium: 3500, heavy: 5000 },
  },
  zoomBurst: {
    defaultIntensity: 'medium',
    durationMs: { light: 2500, medium: 3500, heavy: 5000 },
  },
};
