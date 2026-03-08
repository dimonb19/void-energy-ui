import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import SettingsFragment from '@components/modals/SettingsFragment.svelte';

describe('SettingsFragment', () => {
  it('reports false when saving with remember disabled', async () => {
    const onSave = vi.fn();
    const onRememberChange = vi.fn();

    render(SettingsFragment, {
      initialRemember: false,
      onSave,
      onRememberChange,
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onRememberChange).toHaveBeenCalledWith(false);
  });

  it('reports true when saving with remember enabled', async () => {
    const onSave = vi.fn();
    const onRememberChange = vi.fn();

    render(SettingsFragment, {
      initialRemember: true,
      onSave,
      onRememberChange,
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onRememberChange).toHaveBeenCalledWith(true);
  });
});
