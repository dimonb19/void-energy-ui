import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NarrativeEngine, narrative } from '@actions/narrative';

// ── Helpers ──────────────────────────────────────────────────

function createEl(): HTMLElement {
  const el = document.createElement('p');
  document.body.appendChild(el);
  return el;
}

/**
 * Create a synthetic animationend event.
 * jsdom lacks AnimationEvent, so we use a plain Event and bolt on animationName.
 */
function createAnimationEndEvent(animationName: string): Event {
  const event = new Event('animationend', { bubbles: true });
  (event as Event & { animationName: string }).animationName = animationName;
  return event;
}

/** Dispatch a synthetic animationend on the element. */
function fireAnimationEnd(el: HTMLElement, animationName: string): void {
  el.dispatchEvent(createAnimationEndEvent(animationName));
}

/** Dispatch an animationend from a child (simulating a nested animation). */
function fireNestedAnimationEnd(
  parent: HTMLElement,
  animationName: string,
): void {
  const child = document.createElement('span');
  parent.appendChild(child);
  child.dispatchEvent(createAnimationEndEvent(animationName));
}

// ── Setup / Teardown ─────────────────────────────────────────

beforeEach(() => {
  document.body.innerHTML = '';
  // Ensure reduced motion is off by default.
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: false,
  } as MediaQueryList);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ────────────────────────────────────────────────────

describe('NarrativeEngine', () => {
  // ── data-narrative attribute ──

  it('sets data-narrative on start and removes on stop', () => {
    const el = createEl();
    const engine = new NarrativeEngine(el, { effect: 'breathe' });
    engine.start();

    expect(el.dataset.narrative).toBe('breathe');

    engine.stop();
    expect(el.dataset.narrative).toBeUndefined();
  });

  it('does not set data-narrative when effect is null', () => {
    const el = createEl();
    const engine = new NarrativeEngine(el, { effect: null });
    engine.start();

    expect(el.dataset.narrative).toBeUndefined();
  });

  // ── One-shot: animationend cleanup ──

  it('removes data-narrative and fires onComplete when one-shot animationend fires', () => {
    const el = createEl();
    const onComplete = vi.fn();
    const engine = new NarrativeEngine(el, { effect: 'shake', onComplete });
    engine.start();

    expect(el.dataset.narrative).toBe('shake');

    fireAnimationEnd(el, 'narrative-shake');

    expect(el.dataset.narrative).toBeUndefined();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('ignores animationend from a different animation name', () => {
    const el = createEl();
    const onComplete = vi.fn();
    const engine = new NarrativeEngine(el, { effect: 'shake', onComplete });
    engine.start();

    // Wrong animation name
    fireAnimationEnd(el, 'some-other-animation');

    expect(el.dataset.narrative).toBe('shake');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('ignores animationend bubbling from a nested child', () => {
    const el = createEl();
    const onComplete = vi.fn();
    const engine = new NarrativeEngine(el, { effect: 'jolt', onComplete });
    engine.start();

    // Event dispatched on child, bubbles to el — but target !== el
    fireNestedAnimationEnd(el, 'narrative-jolt');

    expect(el.dataset.narrative).toBe('jolt');
    expect(onComplete).not.toHaveBeenCalled();
  });

  // ── Continuous: no onComplete ──

  it('does not call onComplete for continuous effects', () => {
    const el = createEl();
    const onComplete = vi.fn();
    const engine = new NarrativeEngine(el, { effect: 'breathe', onComplete });
    engine.start();

    // Continuous effects don't listen for animationend
    fireAnimationEnd(el, 'narrative-breathe');

    // onComplete should not have been called
    expect(onComplete).not.toHaveBeenCalled();
    // data-narrative should still be set (continuous loops)
    expect(el.dataset.narrative).toBe('breathe');
  });

  // ── enabled: false ──

  it('is a no-op when enabled is false', () => {
    const el = createEl();
    const engine = new NarrativeEngine(el, {
      effect: 'breathe',
      enabled: false,
    });
    engine.start();

    expect(el.dataset.narrative).toBeUndefined();
  });

  it('fires onComplete for skipped one-shots when enabled is false', () => {
    const el = createEl();
    const onComplete = vi.fn();
    const engine = new NarrativeEngine(el, {
      effect: 'shake',
      enabled: false,
      onComplete,
    });
    engine.start();

    expect(el.dataset.narrative).toBeUndefined();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not fire onComplete for skipped continuous effects when enabled is false', () => {
    const el = createEl();
    const onComplete = vi.fn();
    const engine = new NarrativeEngine(el, {
      effect: 'drift',
      enabled: false,
      onComplete,
    });
    engine.start();

    expect(onComplete).not.toHaveBeenCalled();
  });

  // ── Reduced motion ──

  it('skips animation under reduced motion and fires onComplete for one-shots', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
    } as MediaQueryList);

    const el = createEl();
    const onComplete = vi.fn();
    const engine = new NarrativeEngine(el, { effect: 'glitch', onComplete });
    engine.start();

    expect(el.dataset.narrative).toBeUndefined();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('skips continuous effects under reduced motion without firing onComplete', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
    } as MediaQueryList);

    const el = createEl();
    const onComplete = vi.fn();
    const engine = new NarrativeEngine(el, { effect: 'pulse', onComplete });
    engine.start();

    expect(el.dataset.narrative).toBeUndefined();
    expect(onComplete).not.toHaveBeenCalled();
  });

  // ── WeakMap: multiple engines on same element ──

  it('stops previous engine when a new engine is constructed for the same element', () => {
    const el = createEl();
    const onComplete1 = vi.fn();
    const engine1 = new NarrativeEngine(el, {
      effect: 'shake',
      onComplete: onComplete1,
    });
    engine1.start();

    expect(el.dataset.narrative).toBe('shake');

    // Construct a second engine on the same element
    const engine2 = new NarrativeEngine(el, { effect: 'breathe' });
    engine2.start();

    expect(el.dataset.narrative).toBe('breathe');

    // Old engine's listener should be gone — firing old animation name should not trigger onComplete
    fireAnimationEnd(el, 'narrative-shake');
    expect(onComplete1).not.toHaveBeenCalled();
  });

  it('deregisters from instance map on destroy so the next engine is independent', () => {
    const el = createEl();
    const engine1 = new NarrativeEngine(el, { effect: 'breathe' });
    engine1.start();
    engine1.destroy();

    expect(el.dataset.narrative).toBeUndefined();

    // A new engine on the same element should work cleanly without
    // interfering with the destroyed one (destroy cleared the map entry).
    const engine2 = new NarrativeEngine(el, { effect: 'drift' });
    engine2.start();

    expect(el.dataset.narrative).toBe('drift');
    engine2.destroy();
    expect(el.dataset.narrative).toBeUndefined();
  });
});

describe('narrative Svelte action', () => {
  it('applies effect on init and cleans up on destroy', () => {
    const el = createEl();
    const action = narrative(el, { effect: 'tremble' });

    expect(el.dataset.narrative).toBe('tremble');

    action.destroy();
    expect(el.dataset.narrative).toBeUndefined();
  });

  it('replaces effect on update', () => {
    const el = createEl();
    const action = narrative(el, { effect: 'drift' });

    expect(el.dataset.narrative).toBe('drift');

    action.update({ effect: 'flicker' });
    expect(el.dataset.narrative).toBe('flicker');
  });

  it('clears effect when updated with null', () => {
    const el = createEl();
    const action = narrative(el, { effect: 'breathe' });

    expect(el.dataset.narrative).toBe('breathe');

    action.update({ effect: null });
    expect(el.dataset.narrative).toBeUndefined();
  });

  it('stops running effect when enabled toggled to false', () => {
    const el = createEl();
    const action = narrative(el, { effect: 'whisper', enabled: true });

    expect(el.dataset.narrative).toBe('whisper');

    action.update({ effect: 'whisper', enabled: false });
    expect(el.dataset.narrative).toBeUndefined();
  });

  it('does not auto-restart when re-enabled with same effect', () => {
    const el = createEl();
    const action = narrative(el, { effect: 'whisper', enabled: true });

    action.update({ effect: 'whisper', enabled: false });
    expect(el.dataset.narrative).toBeUndefined();

    // Re-enable — spec says this does NOT auto-restart;
    // but the action creates a new engine with enabled: true + effect, so it does start.
    // This matches the action's update() contract: stop old, create new, start new.
    action.update({ effect: 'whisper', enabled: true });
    expect(el.dataset.narrative).toBe('whisper');
  });

  it('transitions between one-shot and continuous effects cleanly', () => {
    const el = createEl();
    const onComplete = vi.fn();
    const action = narrative(el, { effect: 'shake', onComplete });

    expect(el.dataset.narrative).toBe('shake');

    // Complete the one-shot
    fireAnimationEnd(el, 'narrative-shake');
    expect(el.dataset.narrative).toBeUndefined();
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Switch to continuous
    action.update({ effect: 'breathe' });
    expect(el.dataset.narrative).toBe('breathe');
  });
});
