import type { KineticTextEffect, EffectScope, TextRange } from '../../types';
import type { CharacterRenderer } from '../render/index';
import { resolveScope } from './index';

/**
 * Apply a continuous effect to the specified scope.
 * Sets `data-kt-effect` on the target element(s). CSS keyframes handle animation.
 */
export function applyContinuousEffect(
  renderer: CharacterRenderer,
  effect: KineticTextEffect,
  scope: EffectScope,
  positions: { lineIndex: number; isSpace: boolean }[],
  range?: TextRange,
): void {
  const resolved = resolveScope(effect, scope);

  switch (resolved) {
    case 'block':
      applyBlock(renderer, effect);
      break;
    case 'line':
      applyLine(renderer, effect, positions);
      break;
    case 'word':
      applyWord(renderer, effect, positions);
      break;
    case 'glyph':
      applyGlyph(renderer, effect, positions);
      break;
    case 'range':
      applyRange(renderer, effect, range);
      break;
  }
}

/**
 * Clear all continuous effect attributes from the rendered DOM.
 */
export function clearContinuousEffect(
  renderer: CharacterRenderer,
  positions: { lineIndex: number }[],
): void {
  // Clear block scope
  const visual = renderer.getVisual();
  if (visual) {
    visual.removeAttribute('data-kt-effect');
  }

  // Clear line scope
  const lineCount =
    positions.length > 0 ? positions[positions.length - 1].lineIndex + 1 : 0;
  for (let i = 0; i < lineCount; i++) {
    const line = renderer.getLineElement(i);
    if (line) {
      line.removeAttribute('data-kt-effect');
    }
  }

  // Clear word scope
  for (const word of renderer.getAllWordElements()) {
    word.removeAttribute('data-kt-effect');
  }

  // Clear glyph/range scope
  for (let i = 0; i < renderer.length; i++) {
    renderer.setUnitEffect(i, null);
  }
}

// ── Scope implementations ────────────────────────────────────────

function applyBlock(
  renderer: CharacterRenderer,
  effect: KineticTextEffect,
): void {
  const visual = renderer.getVisual();
  if (visual) {
    visual.setAttribute('data-kt-effect', effect);
  }
}

function applyLine(
  renderer: CharacterRenderer,
  effect: KineticTextEffect,
  positions: { lineIndex: number }[],
): void {
  const lineCount =
    positions.length > 0 ? positions[positions.length - 1].lineIndex + 1 : 0;
  for (let i = 0; i < lineCount; i++) {
    const line = renderer.getLineElement(i);
    if (line) {
      line.setAttribute('data-kt-effect', effect);
    }
  }
}

function applyWord(
  renderer: CharacterRenderer,
  effect: KineticTextEffect,
  _positions: { isSpace: boolean }[],
): void {
  for (const word of renderer.getAllWordElements()) {
    word.setAttribute('data-kt-effect', effect);
  }
}

function applyGlyph(
  renderer: CharacterRenderer,
  effect: KineticTextEffect,
  positions: { isSpace: boolean }[],
): void {
  for (let i = 0; i < positions.length; i++) {
    // Skip spaces for transform-based effects to avoid visual gaps
    renderer.setUnitEffect(i, effect);
  }
}

function applyRange(
  renderer: CharacterRenderer,
  effect: KineticTextEffect,
  range?: TextRange,
): void {
  if (!range) return;
  const start = Math.max(0, range.start);
  const end = Math.min(renderer.length, range.end);
  for (let i = start; i < end; i++) {
    renderer.setUnitEffect(i, effect);
  }
}
