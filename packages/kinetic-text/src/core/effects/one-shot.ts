import type {
  KineticTextEffect,
  EffectScope,
  KineticCue,
  TextRange,
} from '../../types';
import type { CharacterRenderer } from '../render/index';
import { getEffectDefinition, resolveScope } from './index';

/**
 * Fire a one-shot effect for a cue. Sets data attributes, listens for
 * animationend, cleans up, and calls onComplete when finished.
 *
 * For glyph-scope one-shots, uses event delegation on the container
 * to avoid hundreds of individual listeners.
 */
export function fireOneShotEffect(
  renderer: CharacterRenderer,
  cue: KineticCue,
  positions: { lineIndex: number }[],
  onComplete: () => void,
): void {
  const def = getEffectDefinition(cue.effect);
  if (!def) {
    onComplete();
    return;
  }

  const resolved = resolveScope(cue.effect, cue.scope);
  const elements = collectTargetElements(
    renderer,
    resolved,
    positions,
    cue.range,
  );

  if (elements.length === 0) {
    onComplete();
    return;
  }

  const duration = cue.durationMs ?? def.defaultDuration;
  const fallbackDelay = duration * 2;

  // Track how many elements need to finish their animation
  let pending = elements.length;

  const finish = () => {
    pending--;
    if (pending <= 0) {
      onComplete();
    }
  };

  for (const el of elements) {
    el.setAttribute('data-kt-effect', cue.effect);
    el.setAttribute('data-kt-effect-type', 'one-shot');

    // If a custom duration was specified, override it inline
    if (cue.durationMs !== undefined) {
      el.style.setProperty('--kt-effect-duration', `${cue.durationMs}ms`);
    }

    const cleanup = () => {
      el.removeAttribute('data-kt-effect');
      el.removeAttribute('data-kt-effect-type');
      el.style.removeProperty('--kt-effect-duration');
      el.removeEventListener('animationend', onEnd);
      clearTimeout(timerId);
      finish();
    };

    const onEnd = (e: AnimationEvent) => {
      // Guard: only respond to our effect animation, not nested animations
      if (e.animationName === def.cssAnimationName || e.target === el) {
        cleanup();
      }
    };

    el.addEventListener('animationend', onEnd);

    // Fallback timer in case animationend doesn't fire
    const timerId = window.setTimeout(cleanup, fallbackDelay);
  }
}

// ── Target element collection ────────────────────────────────────

function collectTargetElements(
  renderer: CharacterRenderer,
  scope: EffectScope,
  positions: { lineIndex: number }[],
  range?: TextRange,
): HTMLElement[] {
  switch (scope) {
    case 'block': {
      const visual = renderer.getVisual();
      return visual ? [visual] : [];
    }
    case 'line': {
      const lineCount =
        positions.length > 0
          ? positions[positions.length - 1].lineIndex + 1
          : 0;
      const lines: HTMLElement[] = [];
      for (let i = 0; i < lineCount; i++) {
        const line = renderer.getLineElement(i);
        if (line) lines.push(line);
      }
      return lines;
    }
    case 'word':
    case 'glyph': {
      const units: HTMLElement[] = [];
      for (let i = 0; i < renderer.length; i++) {
        const unit = renderer.getUnit(i);
        if (unit) units.push(unit);
      }
      return units;
    }
    case 'range': {
      if (!range) return [];
      const start = Math.max(0, range.start);
      const end = Math.min(renderer.length, range.end);
      const units: HTMLElement[] = [];
      for (let i = start; i < end; i++) {
        const unit = renderer.getUnit(i);
        if (unit) units.push(unit);
      }
      return units;
    }
    default:
      return [];
  }
}
