import type { KineticTextEffect } from '../../types';
import type { CharacterRenderer } from '../render/index';
import { computeCharParams, applyCharParams, clearCharParams } from './params';

// Effects that have secondary harmonic animation on kt-word
const SECONDARY_EFFECTS = new Set<KineticTextEffect>([
  'breathe',
  'drift',
  'wave',
  'float',
  'pulse',
  'tremble',
  'haunt',
]);

// Secondary layer CSS var names
const SECONDARY_VARS = ['--kt-dx2', '--kt-dy2', '--kt-rotate2'] as const;

/**
 * Apply a continuous effect to all characters. Sets per-character CSS custom
 * properties and the data-kt-effect attribute on each kt-unit.
 * For effects with secondary layers, also sets harmonic animation on kt-word.
 */
export function applyContinuousEffect(
  renderer: CharacterRenderer,
  effect: KineticTextEffect,
  seed: number,
): void {
  const hasSecondary = SECONDARY_EFFECTS.has(effect);
  // Track which word elements we've already configured
  const configuredWords = new Set<HTMLSpanElement>();

  for (let i = 0; i < renderer.length; i++) {
    const el = renderer.getUnit(i);
    if (!el) continue;

    const params = computeCharParams(effect, i, renderer.length, seed);
    applyCharParams(el, params);
    renderer.setUnitEffect(i, effect);

    // Apply secondary harmonic params on kt-word wrapper
    if (hasSecondary) {
      const wordEl = renderer.getWordElement(i);
      if (wordEl && !configuredWords.has(wordEl)) {
        configuredWords.add(wordEl);
        // Use first char's secondary params for the whole word
        wordEl.style.setProperty('--kt-dx2', `${params.dx2}px`);
        wordEl.style.setProperty('--kt-dy2', `${params.dy2}px`);
        wordEl.style.setProperty('--kt-rotate2', `${params.rotate2}deg`);
        wordEl.style.setProperty(
          '--kt-duration-mult',
          `${params.durationMult}`,
        );
        wordEl.style.setProperty(
          '--kt-phase',
          el.style.getPropertyValue('--kt-phase'),
        );
        wordEl.style.setProperty(
          '--kt-delay-offset',
          `${params.delayOffset}ms`,
        );
        wordEl.setAttribute('data-kt-secondary', effect);
      }
    }
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

  // Clear secondary effect from all word wrappers
  for (const wordEl of renderer.getAllWordElements()) {
    wordEl.removeAttribute('data-kt-secondary');
    for (const v of SECONDARY_VARS) {
      wordEl.style.removeProperty(v);
    }
    wordEl.style.removeProperty('--kt-duration-mult');
    wordEl.style.removeProperty('--kt-phase');
    wordEl.style.removeProperty('--kt-delay-offset');
  }
}
