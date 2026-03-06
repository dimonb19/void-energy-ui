import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import { layerStack } from '@lib/layer-stack.svelte';
import { shortcutRegistry } from '@lib/shortcut-registry.svelte';

describe('Dropdown', () => {
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
