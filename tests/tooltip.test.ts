import { afterEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/svelte';

vi.mock('@floating-ui/dom', () => ({
  autoUpdate: (
    _reference: Element,
    _floating: HTMLElement,
    update: () => void,
  ) => {
    update();
    return () => {};
  },
  computePosition: () =>
    Promise.resolve({
      x: 0,
      y: 0,
      placement: 'top',
    }),
  offset: () => ({}),
  flip: () => ({}),
  shift: () => ({}),
}));

import { VoidTooltip } from '@lib/void-tooltip';

describe('tooltip accessibility wiring', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('preserves existing aria-describedby tokens across show and hide', async () => {
    const button = document.createElement('button');
    button.setAttribute('aria-describedby', 'hint error');
    document.body.appendChild(button);

    const tooltip = new VoidTooltip(button, { content: 'Helpful details' });

    button.dispatchEvent(new FocusEvent('focus'));

    const describedBy = button.getAttribute('aria-describedby');
    expect(describedBy).toContain('hint');
    expect(describedBy).toContain('error');
    expect(describedBy?.split(/\s+/)).toHaveLength(3);
    expect(document.body.querySelector('.void-tooltip')).toBeTruthy();

    button.dispatchEvent(new FocusEvent('blur'));

    await waitFor(() => {
      expect(button.getAttribute('aria-describedby')).toBe('hint error');
      expect(document.body.querySelector('.void-tooltip')).toBeNull();
    });

    tooltip.destroy();
  });

  it('falls back to timer-based cleanup when transitionend never fires', async () => {
    vi.useFakeTimers();
    const button = document.createElement('button');
    button.setAttribute('aria-describedby', 'hint');
    document.body.appendChild(button);

    const tooltip = new VoidTooltip(button, { content: 'Helpful details' });
    const instrumentedTooltip = tooltip as unknown as {
      getTransitionDurationMs: (element: HTMLElement) => number;
    };
    instrumentedTooltip.getTransitionDurationMs = () => 200;

    button.dispatchEvent(new FocusEvent('focus'));
    expect(document.body.querySelector('.void-tooltip')).toBeTruthy();

    button.dispatchEvent(new FocusEvent('blur'));
    expect(document.body.querySelector('.void-tooltip')).toBeTruthy();
    expect(button.getAttribute('aria-describedby')).not.toBe('hint');

    await vi.advanceTimersByTimeAsync(249);
    expect(document.body.querySelector('.void-tooltip')).toBeTruthy();

    await vi.advanceTimersByTimeAsync(1);

    expect(button.getAttribute('aria-describedby')).toBe('hint');
    expect(document.body.querySelector('.void-tooltip')).toBeNull();

    tooltip.destroy();
  });
});
