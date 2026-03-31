import type { KineticTextEffect } from '../../types';
import type { CharacterRenderer } from '../render/index';
import { computeCharParams, applyCharParams, clearCharParams } from './params';

/**
 * Apply a continuous effect to all characters. Sets per-character CSS custom
 * properties and the data-kt-effect attribute on each kt-unit.
 */
export function applyContinuousEffect(
  renderer: CharacterRenderer,
  effect: KineticTextEffect,
  seed: number,
): void {
  for (let i = 0; i < renderer.length; i++) {
    const el = renderer.getUnit(i);
    if (!el) continue;

    const params = computeCharParams(effect, i, renderer.length, seed);
    applyCharParams(el, params);
    renderer.setUnitEffect(i, effect);
  }
}

/**
 * Clear all continuous effect attributes and per-character CSS custom
 * properties from the rendered DOM. One-shot effects live on the separate
 * kt-oneshot layer, so no guard is needed — the layers are independent.
 */
export function clearContinuousEffect(renderer: CharacterRenderer): void {
  for (let i = 0; i < renderer.length; i++) {
    const el = renderer.getUnit(i);
    if (!el) continue;
    clearCharParams(el);
    renderer.setUnitEffect(i, null);
  }
}
