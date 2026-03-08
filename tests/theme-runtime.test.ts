import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { compile } from 'sass-embedded';

import { VoidEngine } from '@adapters/void-engine.svelte';
import { DOM_ATTRS, STORAGE_KEYS } from '@config/constants';
import { VOID_TOKENS } from '@config/design-tokens';

describe('theme runtime correctness', () => {
  it('inherits missing palette tokens from the mode-compatible base theme', () => {
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const engine = new VoidEngine();

    engine.registerTheme('partial-dark', {
      palette: { 'energy-primary': '#123456' },
    });

    expect(engine.registry['partial-dark'].mode).toBe('dark');
    expect(engine.registry['partial-dark'].physics).toBe(
      VOID_TOKENS.themes.void.physics,
    );
    expect(engine.registry['partial-dark'].palette['bg-canvas']).toBe(
      VOID_TOKENS.themes.void.palette['bg-canvas'],
    );
    expect(engine.registry['partial-dark'].palette['font-atmos-heading']).toBe(
      VOID_TOKENS.themes.void.palette['font-atmos-heading'],
    );
    expect(engine.registry['partial-dark'].palette['energy-primary']).toBe(
      '#123456',
    );

    engine.registerTheme('partial-light', {
      mode: 'light',
      palette: { 'energy-primary': '#654321' },
    });

    expect(engine.registry['partial-light'].mode).toBe('light');
    expect(engine.registry['partial-light'].physics).toBe(
      VOID_TOKENS.themes.paper.physics,
    );
    expect(engine.registry['partial-light'].palette['bg-canvas']).toBe(
      VOID_TOKENS.themes.paper.palette['bg-canvas'],
    );
    expect(engine.registry['partial-light'].palette['font-atmos-heading']).toBe(
      VOID_TOKENS.themes.paper.palette['font-atmos-heading'],
    );
    expect(engine.registry['partial-light'].palette['energy-primary']).toBe(
      '#654321',
    );
  });

  it('keeps the existing light-mode guardrails for glass and retro themes', () => {
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const engine = new VoidEngine();

    engine.registerTheme('glass-light', {
      mode: 'light',
      physics: 'glass',
    });
    expect(engine.registry['glass-light'].mode).toBe('light');
    expect(engine.registry['glass-light'].physics).toBe('flat');

    engine.registerTheme('retro-light', {
      mode: 'light',
      physics: 'retro',
    });
    expect(engine.registry['retro-light'].mode).toBe('dark');
    expect(engine.registry['retro-light'].physics).toBe('retro');
  });

  it('emits light color-scheme for light atmospheres in compiled css', () => {
    const result = compile(path.resolve('src/styles/global.scss'), {
      loadPaths: [path.resolve('src/styles')],
    });

    expect(result.css).toMatch(
      /\[data-atmosphere=(?:['"])?paper(?:['"])?\][^{]*\{[^}]*color-scheme:\s*light/s,
    );
  });

  it('silently restores cached runtime themes before resolving the boot-painted atmosphere', () => {
    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const groupEndSpy = vi
      .spyOn(console, 'groupEnd')
      .mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    localStorage.setItem(
      STORAGE_KEYS.THEME_CACHE,
      JSON.stringify({
        remembered: {
          mode: 'light',
          physics: 'glass',
          palette: {
            'energy-primary': '#123456',
          },
          tagline: 'Recovered from cache',
        },
      }),
    );

    document.documentElement.setAttribute(DOM_ATTRS.ATMOSPHERE, 'remembered');
    document.documentElement.setAttribute(DOM_ATTRS.MODE, 'light');
    document.documentElement.setAttribute(DOM_ATTRS.PHYSICS, 'flat');

    const engine = new VoidEngine();

    expect(engine.atmosphere).toBe('remembered');
    expect(engine.registry.remembered).toBeTruthy();
    expect(engine.registry.remembered.physics).toBe('flat');
    expect(engine.registry.remembered.palette['bg-canvas']).toBe(
      VOID_TOKENS.themes.paper.palette['bg-canvas'],
    );
    expect(engine.registry.remembered.palette['energy-primary']).toBe(
      '#123456',
    );
    expect(groupSpy).not.toHaveBeenCalled();
    expect(groupEndSpy).not.toHaveBeenCalled();
  });

  it('updates theme-color metadata for built-in and runtime themes at runtime', () => {
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    document.head.innerHTML = '<meta name="theme-color" content="#111111">';
    const meta = document.querySelector(
      'meta[name="theme-color"]',
    ) as HTMLMetaElement;

    const engine = new VoidEngine();

    engine.setAtmosphere('paper');
    expect(meta.getAttribute('content')).toBe(
      VOID_TOKENS.themes.paper.palette['bg-canvas'],
    );

    engine.registerTheme('meta-runtime', {
      mode: 'dark',
      palette: {
        'bg-canvas': '#123123',
      },
    });
    engine.setAtmosphere('meta-runtime');

    expect(meta.getAttribute('content')).toBe('#123123');
  });
});
