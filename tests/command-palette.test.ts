import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import CommandPaletteFragment from '@components/modals/CommandPaletteFragment.svelte';

describe('Command palette', () => {
  it('keeps listbox options out of the tab order when using aria-activedescendant', () => {
    render(CommandPaletteFragment);

    const input = screen.getByRole('combobox', { name: 'Command palette' });
    const options = Array.from(document.querySelectorAll('[role="option"]'));

    expect(input.getAttribute('aria-activedescendant')).toContain(
      'palette-item-',
    );
    expect(options.length).toBeGreaterThan(0);

    for (const option of options) {
      expect(option.getAttribute('tabindex')).toBe('-1');
    }
  });
});
