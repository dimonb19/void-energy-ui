import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/svelte';

import { shortcutRegistry } from '@lib/shortcut-registry.svelte';

describe('shortcut registry modifiers', () => {
  it('supports plain and modified variants of the same key independently', async () => {
    const plainAction = vi.fn();
    const metaAction = vi.fn();
    const altAction = vi.fn();

    shortcutRegistry.register({
      key: 'k',
      label: 'Plain K',
      group: 'General',
      action: plainAction,
    });
    shortcutRegistry.register({
      key: 'k',
      modifier: 'meta',
      label: 'Meta K',
      group: 'General',
      action: metaAction,
    });
    shortcutRegistry.register({
      key: 'k',
      modifier: 'alt',
      label: 'Alt K',
      group: 'General',
      action: altAction,
    });

    await fireEvent.keyDown(document, { key: 'k' });
    await fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    await fireEvent.keyDown(document, { key: 'k', altKey: true });

    expect(plainAction).toHaveBeenCalledTimes(1);
    expect(metaAction).toHaveBeenCalledTimes(1);
    expect(altAction).toHaveBeenCalledTimes(1);

    shortcutRegistry.unregister('k', 'meta');

    await fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    await fireEvent.keyDown(document, { key: 'k' });
    await fireEvent.keyDown(document, { key: 'k', altKey: true });

    expect(metaAction).toHaveBeenCalledTimes(1);
    expect(plainAction).toHaveBeenCalledTimes(2);
    expect(altAction).toHaveBeenCalledTimes(2);

    shortcutRegistry.unregister('k');
    shortcutRegistry.unregister('k', 'alt');

    await fireEvent.keyDown(document, { key: 'k' });
    await fireEvent.keyDown(document, { key: 'k', altKey: true });

    expect(plainAction).toHaveBeenCalledTimes(2);
    expect(altAction).toHaveBeenCalledTimes(2);
  });
});
