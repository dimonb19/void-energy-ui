import type { KineticCue, TextRange } from '../../types';
import type { CharacterRenderer } from '../render/index';
import { getEffectDefinition } from './index';
import { computeCharParams, applyCharParams, clearCharParams } from './params';

/**
 * Fire a one-shot effect for a cue. Sets per-character CSS custom properties
 * and data attributes on each kt-oneshot element, listens for animationend,
 * cleans up, and calls onComplete when all characters finish.
 *
 * One-shot effects run on the kt-oneshot layer (between kt-unit and kt-glyph)
 * so they compose naturally with continuous effects on kt-unit and reveal
 * animations on kt-glyph via CSS transform nesting.
 */
export function fireOneShotEffect(
  renderer: CharacterRenderer,
  cue: KineticCue,
  onComplete: () => void,
  reducedMotion: boolean = false,
): void {
  const def = getEffectDefinition(cue.effect);
  if (!def) {
    onComplete();
    return;
  }

  if (reducedMotion) {
    onComplete();
    return;
  }

  // Determine target range
  const start = cue.range ? Math.max(0, cue.range.start) : 0;
  const end = cue.range
    ? Math.min(renderer.length, cue.range.end)
    : renderer.length;

  if (start >= end) {
    onComplete();
    return;
  }

  const duration = cue.durationMs ?? def.defaultDuration;

  // Find the max delay offset so fallback timer accounts for stagger
  let maxDelay = 0;
  let pending = 0;

  for (let i = start; i < end; i++) {
    const el = renderer.getOneShotEl(i);
    if (!el) continue;

    // Skip characters that haven't been revealed yet — one-shot effects
    // should only animate visible characters, never break the reveal flow
    const glyphState = renderer.getGlyphState(i);
    if (glyphState === 'hidden') continue;

    const params = computeCharParams(
      cue.effect,
      i,
      renderer.length,
      cue.seed ?? 0,
    );
    applyCharParams(el, params);
    el.setAttribute('data-kt-oneshot', cue.effect);

    // Per-character duration: base × durationMult for organic timing variation
    const charDuration = Math.round(duration * params.durationMult);
    el.style.setProperty('--kt-effect-duration', `${charDuration}ms`);

    if (params.delayOffset > maxDelay) maxDelay = params.delayOffset;
    pending++;
  }

  if (pending === 0) {
    onComplete();
    return;
  }

  // Fallback timer covers max delay + longest possible char duration + margin
  const fallbackDelay = maxDelay + Math.round(duration * 1.15) * 2;
  let completed = false;

  const finish = () => {
    if (completed) return;
    completed = true;
    clearTimeout(fallbackTimer);

    // Clean up all target elements
    for (let i = start; i < end; i++) {
      const el = renderer.getOneShotEl(i);
      if (!el) continue;
      el.removeAttribute('data-kt-oneshot');
      el.style.removeProperty('--kt-effect-duration');
      clearCharParams(el);
    }

    onComplete();
  };

  // Track individual animationend events — clean up each character
  // immediately when its own animation ends rather than waiting for
  // all characters. This distributes the compositing-layer teardown
  // across time (matching the staggered start), preventing a visible
  // collective "jump to clean" when all layers drop at once.
  let finishedCount = 0;

  for (let i = start; i < end; i++) {
    const el = renderer.getOneShotEl(i);
    if (!el) continue;

    const onEnd = (e: AnimationEvent) => {
      if (e.target !== el) return;
      el.removeEventListener('animationend', onEnd);

      // Clean up this character immediately
      el.removeAttribute('data-kt-oneshot');
      el.style.removeProperty('--kt-effect-duration');
      clearCharParams(el);

      finishedCount++;
      if (finishedCount >= pending) {
        finish();
      }
    };

    el.addEventListener('animationend', onEnd);
  }

  // Fallback timer in case animationend doesn't fire for all elements
  const fallbackTimer = window.setTimeout(finish, fallbackDelay);
}
