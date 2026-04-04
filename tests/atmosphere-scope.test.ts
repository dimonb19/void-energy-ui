import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/svelte';

import { DOM_ATTRS, STORAGE_KEYS } from '@config/constants';
import AtmosphereScopeFixture from './fixtures/atmosphere-scope-fixture.svelte';
import { voidEngine } from '@adapters/void-engine.svelte';

function quietConsole() {
  vi.spyOn(console, 'group').mockImplementation(() => {});
  vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
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
    narrativeEffects: true,
  };
}

function resetVoidEngine() {
  localStorage.clear();
  resetRoot();
  voidEngine.setAtmosphere('frost');
  voidEngine.setPreferences(defaultUserConfig());

  for (const id of Object.keys(voidEngine.registry)) {
    if (id.startsWith('__scope_')) {
      voidEngine.unregisterEphemeralTheme(id);
    }
  }
}

describe('AtmosphereScope', () => {
  beforeEach(() => {
    quietConsole();
    resetVoidEngine();
  });

  it('does not acquire or restore a temporary theme when adaptation is disabled before mount', () => {
    voidEngine.setPreferences({ adaptAtmosphere: false });

    const view = render(AtmosphereScopeFixture, {
      theme: 'frost',
      label: 'No-op scope',
    });

    expect(voidEngine.atmosphere).toBe('frost');
    expect(voidEngine.hasTemporaryTheme).toBe(false);
    expect(voidEngine.temporaryThemeInfo).toBeNull();

    view.unmount();

    expect(voidEngine.atmosphere).toBe('frost');
    expect(voidEngine.hasTemporaryTheme).toBe(false);
  });

  it('clears active temporary scope state when adaptation is disabled mid-mount', () => {
    const view = render(AtmosphereScopeFixture, {
      theme: 'frost',
      label: 'Story scope',
    });

    expect(voidEngine.atmosphere).toBe('frost');
    expect(voidEngine.hasTemporaryTheme).toBe(true);

    voidEngine.setPreferences({ adaptAtmosphere: false });

    expect(voidEngine.atmosphere).toBe('frost');
    expect(voidEngine.hasTemporaryTheme).toBe(false);

    view.unmount();

    expect(voidEngine.atmosphere).toBe('frost');
    expect(voidEngine.hasTemporaryTheme).toBe(false);
  });

  it('reuses one stable ephemeral scope theme ID across object-theme updates without persisting cache entries', async () => {
    const view = render(AtmosphereScopeFixture, {
      label: 'Initial overlay',
      theme: {
        mode: 'dark',
        physics: 'glass',
        palette: {
          'energy-primary': '#123456',
        },
      },
    });

    let scopeKeys = Object.keys(voidEngine.registry).filter((id) =>
      id.startsWith('__scope_'),
    );

    expect(scopeKeys).toHaveLength(1);
    expect(voidEngine.atmosphere).toBe(scopeKeys[0]);
    expect(localStorage.getItem(STORAGE_KEYS.THEME_CACHE)).toBeNull();
    expect(
      document.documentElement.style.getPropertyValue('--energy-primary'),
    ).toBe('#123456');

    await view.rerender({
      label: 'Updated overlay',
      theme: {
        mode: 'dark',
        physics: 'glass',
        palette: {
          'energy-primary': '#654321',
        },
      },
    });

    const nextScopeKeys = Object.keys(voidEngine.registry).filter((id) =>
      id.startsWith('__scope_'),
    );

    expect(nextScopeKeys).toEqual(scopeKeys);
    expect(voidEngine.temporaryThemeInfo).toEqual({
      id: scopeKeys[0],
      label: 'Updated overlay',
      returnTo: 'frost',
    });
    expect(
      document.documentElement.style.getPropertyValue('--energy-primary'),
    ).toBe('#654321');
    expect(localStorage.getItem(STORAGE_KEYS.THEME_CACHE)).toBeNull();

    view.unmount();

    scopeKeys = Object.keys(voidEngine.registry).filter((id) =>
      id.startsWith('__scope_'),
    );

    expect(scopeKeys).toHaveLength(0);
    expect(voidEngine.atmosphere).toBe('frost');
    expect(voidEngine.hasTemporaryTheme).toBe(false);
  });
});
