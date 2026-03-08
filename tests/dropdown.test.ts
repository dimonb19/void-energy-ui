import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { layerStack } from '@lib/layer-stack.svelte';
import { shortcutRegistry } from '@lib/shortcut-registry.svelte';
import DropdownFixture from './fixtures/dropdown-fixture.svelte';

function withTransitionDuration(
  style: CSSStyleDeclaration,
  transitionDuration: string,
): CSSStyleDeclaration {
  return new Proxy(style, {
    get(target, prop, receiver) {
      if (prop === 'transitionDuration') {
        return transitionDuration;
      }

      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }) as CSSStyleDeclaration;
}

describe('Dropdown', () => {
  it('keeps the panel inert and aria-hidden when popover APIs throw with zero-duration cleanup', async () => {
    const getComputedStyle = window.getComputedStyle.bind(window);

    vi.spyOn(HTMLElement.prototype, 'showPopover').mockImplementation(() => {
      throw new Error('Popover unsupported');
    });
    vi.spyOn(HTMLElement.prototype, 'hidePopover').mockImplementation(() => {
      throw new Error('Popover unsupported');
    });
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element: Element) =>
        withTransitionDuration(getComputedStyle(element), '0s'),
    );

    const { container } = render(DropdownFixture);
    const trigger = screen.getByRole('button', { name: 'Fixture dropdown' });
    const panel = container.querySelector<HTMLElement>('.dropdown-panel');

    expect(panel).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.getAttribute('aria-hidden')).toBe('true');
    expect(panel?.hasAttribute('inert')).toBe(true);

    await fireEvent.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel?.hasAttribute('aria-hidden')).toBe(false);
    expect(panel?.hasAttribute('inert')).toBe(false);

    await fireEvent.click(trigger);

    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(panel?.getAttribute('aria-hidden')).toBe('true');
      expect(panel?.hasAttribute('inert')).toBe(true);
    });
  });

  it('completes the transition-end cleanup path when popover APIs throw', async () => {
    const getComputedStyle = window.getComputedStyle.bind(window);

    vi.spyOn(HTMLElement.prototype, 'showPopover').mockImplementation(() => {
      throw new Error('Popover unsupported');
    });
    vi.spyOn(HTMLElement.prototype, 'hidePopover').mockImplementation(() => {
      throw new Error('Popover unsupported');
    });
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element: Element) =>
        withTransitionDuration(getComputedStyle(element), '0.2s'),
    );

    const { container } = render(DropdownFixture);
    const trigger = screen.getByRole('button', { name: 'Fixture dropdown' });
    const panel = container.querySelector<HTMLElement>('.dropdown-panel');

    expect(panel).toBeTruthy();

    await fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    await fireEvent.click(trigger);
    await fireEvent.transitionEnd(panel!);

    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(panel?.getAttribute('aria-hidden')).toBe('true');
      expect(panel?.hasAttribute('inert')).toBe(true);
    });
  });

  it('dismisses the topmost layer, returns focus, and blocks shortcuts while open', async () => {
    const shortcutAction = vi.fn();
    const trigger = document.createElement('button');
    const lowerLayerDismiss = vi.fn();
    const topLayerDismiss = vi.fn(() => trigger.focus());

    document.body.appendChild(trigger);

    shortcutRegistry.register({
      key: 'k',
      label: 'Open command palette',
      group: 'General',
      action: shortcutAction,
    });
    layerStack.push(lowerLayerDismiss);
    layerStack.push(topLayerDismiss);

    await fireEvent.keyDown(document, { key: 'k' });
    expect(shortcutAction).not.toHaveBeenCalled();

    await fireEvent.keyDown(document, { key: 'Escape' });
    expect(topLayerDismiss).toHaveBeenCalledTimes(1);
    expect(lowerLayerDismiss).not.toHaveBeenCalled();

    expect(document.activeElement).toBe(trigger);

    await fireEvent.keyDown(document, { key: 'Escape' });
    expect(lowerLayerDismiss).toHaveBeenCalledTimes(1);

    await fireEvent.keyDown(document, { key: 'k' });
    expect(shortcutAction).toHaveBeenCalledTimes(1);
  });
});
