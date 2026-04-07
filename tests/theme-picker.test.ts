import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';

import ThemesFragment from '@components/modals/ThemesFragment.svelte';
import { voidEngine } from '@adapters/void-engine.svelte';

function resetThemeState() {
  voidEngine.atmosphere = 'frost';
  voidEngine.userConfig = {
    fontHeading: null,
    fontBody: null,
    scale: 1,
    density: 'standard',
    adaptAtmosphere: true,
    fixedNav: false,
  };

  document.documentElement.setAttribute('data-atmosphere', 'frost');
  document.documentElement.setAttribute('data-mode', 'dark');
  document.documentElement.setAttribute('data-physics', 'glass');
}

describe('ThemesFragment', () => {
  it('supports roving keyboard selection inside the theme picker', async () => {
    resetThemeState();

    render(ThemesFragment);

    const group = screen.getByRole('radiogroup', { name: 'Select Theme' });
    let radios = within(group).getAllByRole('radio');
    const selectedIndex = radios.findIndex(
      (radio) => radio.getAttribute('aria-checked') === 'true',
    );

    expect(selectedIndex).toBeGreaterThanOrEqual(0);

    radios[selectedIndex].focus();
    await fireEvent.keyDown(radios[selectedIndex], { key: 'ArrowRight' });

    radios = within(group).getAllByRole('radio');
    const nextIndex = (selectedIndex + 1) % radios.length;

    expect(radios[nextIndex].getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(radios[nextIndex]);

    await fireEvent.keyDown(radios[nextIndex], { key: 'End' });

    radios = within(group).getAllByRole('radio');
    const lastRadio = radios[radios.length - 1];

    expect(lastRadio.getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(lastRadio);
  });

  it('makes the first visible theme focusable when the current theme is filtered out', async () => {
    resetThemeState();

    render(ThemesFragment);

    await fireEvent.click(screen.getByLabelText('Light'));

    const group = screen.getByRole('radiogroup', { name: 'Select Theme' });
    const radios = within(group).getAllByRole('radio');

    // The outgoing dark-mode options stay mounted during the dissolve transition,
    // so assert against the incoming first visible light theme instead of the
    // whole transient radiogroup.
    expect(radios[0].textContent).toContain('Meridian');
    expect(radios[0].getAttribute('tabindex')).toBe('0');
    expect(radios[0].getAttribute('aria-checked')).toBe('false');
  });
});
