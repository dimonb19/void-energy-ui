import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/svelte';

import { DOM_ATTRS } from '@config/constants';
import { voidEngine } from '@adapters/void-engine.svelte';
import ThemeBuilder from '../src/components/ui/ThemeBuilder.svelte';

function quietConsole() {
  vi.spyOn(console, 'group').mockImplementation(() => {});
  vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}

function resetRoot() {
  document.documentElement.setAttribute(DOM_ATTRS.ATMOSPHERE, 'frost');
  document.documentElement.setAttribute(DOM_ATTRS.MODE, 'dark');
  document.documentElement.setAttribute(DOM_ATTRS.PHYSICS, 'flat');
}

function defaultUserConfig(): UserConfig {
  return {
    fontHeading: null,
    fontBody: null,
    scale: 1,
    density: 'standard',
    adaptAtmosphere: true,
    fixedNav: false,
  };
}

function resetVoidEngine() {
  localStorage.clear();
  resetRoot();
  voidEngine.setAtmosphere('frost');
  voidEngine.setPreferences(defaultUserConfig());

  for (const id of voidEngine.customAtmospheres) {
    voidEngine.unregisterTheme(id);
  }
}

describe('ThemeBuilder', () => {
  beforeEach(() => {
    quietConsole();
    resetVoidEngine();
  });

  it('themes saved via the keep flow land in customAtmospheres, not builtInAtmospheres', () => {
    // The ThemeBuilder keep() path calls voidEngine.registerTheme on the
    // chosen definition. Asserting against that contract guarantees R4's
    // provenance distinction: config-supplied built-in themes and
    // ThemeBuilder-created runtime themes coexist and stay distinguishable.
    const id = 'tb-provenance-test';
    voidEngine.registerTheme(id, {
      mode: 'dark',
      physics: 'flat',
      label: 'Provenance Test',
      tagline: 'Created by ThemeBuilder',
      palette: {
        'bg-canvas': '#111118',
        'bg-spotlight': '#1c1c26',
        'bg-surface': '#1e1e2a',
        'bg-sunk': '#0c0c12',
        'energy-primary': '#6ea1ff',
        'energy-secondary': '#8b8fa3',
        'border-color': '#6ea1ff',
        'text-main': '#e8e8ed',
        'text-dim': '#a0a0b0',
        'text-mute': '#64647a',
      },
    });

    expect(voidEngine.customAtmospheres).toContain(id);
    expect(voidEngine.builtInAtmospheres).not.toContain(id);
    expect(voidEngine.availableAtmospheres).toContain(id);

    // Built-in atmospheres remain on the other side of the partition.
    expect(voidEngine.builtInAtmospheres).toContain('frost');
    expect(voidEngine.builtInAtmospheres).toContain('slate');
    expect(voidEngine.customAtmospheres).not.toContain('frost');
    expect(voidEngine.customAtmospheres).not.toContain('slate');
  });

  it('built-in atmospheres cannot be unregistered (provenance is one-way)', () => {
    voidEngine.unregisterTheme('frost');
    expect(voidEngine.builtInAtmospheres).toContain('frost');
  });

  it('renders mode="both" with both AI form and palette editor', () => {
    const view = render(ThemeBuilder, { mode: 'both' });
    const root = view.container;

    // AI input present
    expect(root.querySelector('input[type="text"]')).not.toBeNull();
    // Palette editor wrapped in <details> (collapsed)
    expect(root.querySelector('details')).not.toBeNull();
    expect(root.querySelector('details > summary')?.textContent).toMatch(
      /Customize Colors/i,
    );

    view.unmount();
  });

  it('renders mode="manual" with palette editor inline (no <details>)', () => {
    const view = render(ThemeBuilder, { mode: 'manual' });
    const root = view.container;

    // No <details> wrapper in manual-only mode
    expect(root.querySelector('details')).toBeNull();
    // No AI form (Toggle for url/vibe + Generate button)
    expect(root.querySelector('button[type="submit"]')).toBeNull();
    // Palette editor headings present (seeded on mount)
    expect(root.textContent).toMatch(/Identity/);
    expect(root.textContent).toMatch(/Presets/);

    view.unmount();
  });

  it('renders mode="ai" with vibe input and no palette editor', () => {
    const view = render(ThemeBuilder, {
      mode: 'ai',
      initialVibe: 'cyberpunk neon city',
    });
    const root = view.container;

    // No palette editor (neither <details> nor inline headings)
    expect(root.querySelector('details')).toBeNull();
    expect(root.textContent).not.toMatch(/Identity/);
    expect(root.textContent).not.toMatch(/Customize Colors/);

    // Vibe input is seeded with initialVibe
    const vibeInput = root.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;
    expect(vibeInput).not.toBeNull();
    expect(vibeInput.value).toBe('cyberpunk neon city');

    view.unmount();
  });

  it('renders a Done affordance only when onCancel is provided', () => {
    const withoutCancel = render(ThemeBuilder, { mode: 'ai' });
    expect(
      Array.from(withoutCancel.container.querySelectorAll('button')).some(
        (b) => b.textContent?.trim() === 'Done',
      ),
    ).toBe(false);
    withoutCancel.unmount();

    const withCancel = render(ThemeBuilder, {
      mode: 'ai',
      onCancel: () => {},
    });
    expect(
      Array.from(withCancel.container.querySelectorAll('button')).some(
        (b) => b.textContent?.trim() === 'Done',
      ),
    ).toBe(true);
    withCancel.unmount();
  });
});
