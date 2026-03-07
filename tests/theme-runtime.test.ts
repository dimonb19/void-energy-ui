import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { compile } from 'sass-embedded';

import { VoidEngine } from '@adapters/void-engine.svelte';
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
});
