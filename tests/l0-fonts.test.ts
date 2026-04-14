/**
 * L0 generator — font emission hardening (Session 9).
 *
 * Covers the contract `CONFIG.md` ("Font story") spells out:
 *   - string and array `src` both resolve correctly with inferred formats.
 *   - `font-display: swap` is the default when not specified.
 *   - Duplicate (family, weight, style) entries collapse with a warning.
 *   - `fontAssignments` emit after `@font-face` blocks, before atmosphere
 *     blocks (so the consumer's assignment wins the cascade over
 *     `tokens.css`'s `:root` defaults).
 *   - `unicodeRange` passes through verbatim.
 */

import { describe, expect, it, vi } from 'vitest';
import {
  generate,
  type GeneratorBuiltins,
} from '../packages/void-energy-tailwind/src/generator.ts';
import { defineConfig } from '../packages/void-energy-tailwind/src/config.ts';

const BUILTINS: GeneratorBuiltins = {
  semanticDark: {
    'color-premium': '#ff8c00',
    'color-system': '#a078ff',
  },
  semanticLight: {},
  atmospheres: {},
};

describe('L0 fonts — src emission', () => {
  it('infers woff2 format from a .woff2 URL', () => {
    const { css } = generate(
      defineConfig({ fonts: [{ family: 'Inter', src: '/fonts/Inter.woff2' }] }),
      BUILTINS,
    );
    expect(css).toContain("src: url('/fonts/Inter.woff2') format('woff2');");
  });

  it('infers truetype from .ttf and opentype from .otf', () => {
    const a = generate(
      defineConfig({ fonts: [{ family: 'A', src: '/fonts/a.ttf' }] }),
      BUILTINS,
    ).css;
    const b = generate(
      defineConfig({ fonts: [{ family: 'B', src: '/fonts/b.otf' }] }),
      BUILTINS,
    ).css;
    expect(a).toContain("format('truetype')");
    expect(b).toContain("format('opentype')");
  });

  it('omits format() when extension is unknown', () => {
    const { css } = generate(
      defineConfig({ fonts: [{ family: 'X', src: '/fonts/x.bin' }] }),
      BUILTINS,
    );
    expect(css).toContain("src: url('/fonts/x.bin');");
    expect(css).not.toContain("format('bin')");
  });

  it('array src with explicit formats emits a comma-separated list', () => {
    const { css } = generate(
      defineConfig({
        fonts: [
          {
            family: 'Inter',
            src: [
              { url: '/fonts/Inter.woff2', format: 'woff2' },
              { url: '/fonts/Inter.woff', format: 'woff' },
            ],
          },
        ],
      }),
      BUILTINS,
    );
    expect(css).toContain(
      "src: url('/fonts/Inter.woff2') format('woff2'), url('/fonts/Inter.woff') format('woff');",
    );
  });

  it('array src without explicit format falls back to extension inference', () => {
    const { css } = generate(
      defineConfig({
        fonts: [
          {
            family: 'Inter',
            src: [{ url: '/fonts/Inter.woff2' }, { url: '/fonts/Inter.ttf' }],
          },
        ],
      }),
      BUILTINS,
    );
    expect(css).toContain("format('woff2')");
    expect(css).toContain("format('truetype')");
  });
});

describe('L0 fonts — defaults', () => {
  it('emits font-display: swap by default', () => {
    const { css } = generate(
      defineConfig({ fonts: [{ family: 'Inter', src: '/fonts/Inter.woff2' }] }),
      BUILTINS,
    );
    expect(css).toContain('font-display: swap;');
  });

  it('preserves explicit font-display overrides', () => {
    const { css } = generate(
      defineConfig({
        fonts: [{ family: 'X', src: '/fonts/x.woff2', display: 'fallback' }],
      }),
      BUILTINS,
    );
    expect(css).toContain('font-display: fallback;');
  });

  it('passes unicodeRange through verbatim', () => {
    const { css } = generate(
      defineConfig({
        fonts: [
          {
            family: 'Inter',
            src: '/fonts/Inter.woff2',
            unicodeRange: 'U+0000-00FF',
          },
        ],
      }),
      BUILTINS,
    );
    expect(css).toContain('unicode-range: U+0000-00FF;');
  });
});

describe('L0 fonts — dedup', () => {
  it('collapses duplicate (family, weight, style) — last wins', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { css } = generate(
        defineConfig({
          fonts: [
            { family: 'Inter', src: '/fonts/Inter.v1.woff2', weight: 400 },
            { family: 'Inter', src: '/fonts/Inter.v2.woff2', weight: 400 },
          ],
        }),
        BUILTINS,
      );
      // Only one @font-face block for Inter/400.
      expect(css.match(/@font-face/g)!.length).toBe(1);
      // v2 wins.
      expect(css).toContain('/fonts/Inter.v2.woff2');
      expect(css).not.toContain('/fonts/Inter.v1.woff2');
      // Warning emitted.
      expect(warn).toHaveBeenCalled();
      expect(String(warn.mock.calls[0][0])).toMatch(
        /duplicate font entry.*Inter/,
      );
    } finally {
      warn.mockRestore();
    }
  });

  it('treats different weights as distinct entries (no dedup)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { css } = generate(
        defineConfig({
          fonts: [
            { family: 'Inter', src: '/fonts/Inter-400.woff2', weight: 400 },
            { family: 'Inter', src: '/fonts/Inter-700.woff2', weight: 700 },
          ],
        }),
        BUILTINS,
      );
      expect(css.match(/@font-face/g)!.length).toBe(2);
      expect(css).toContain('/fonts/Inter-400.woff2');
      expect(css).toContain('/fonts/Inter-700.woff2');
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('treats different styles as distinct entries (italic vs normal)', () => {
    const { css } = generate(
      defineConfig({
        fonts: [
          {
            family: 'Inter',
            src: '/fonts/Inter.woff2',
            weight: 400,
            style: 'normal',
          },
          {
            family: 'Inter',
            src: '/fonts/Inter-it.woff2',
            weight: 400,
            style: 'italic',
          },
        ],
      }),
      BUILTINS,
    );
    expect(css.match(/@font-face/g)!.length).toBe(2);
  });
});

describe('L0 fonts — cascade order', () => {
  it('emits @font-face before :root before atmosphere blocks', () => {
    const { css } = generate(
      defineConfig({
        fonts: [{ family: 'Orbitron', src: '/fonts/Orbitron.woff2' }],
        fontAssignments: { heading: 'Orbitron' },
        extendAtmospheres: {
          custom: {
            physics: 'glass',
            mode: 'dark',
            tokens: { '--energy-primary': '#fff' },
          },
        },
      }),
      BUILTINS,
    );
    const fontFaceIdx = css.indexOf('@font-face');
    const rootIdx = css.indexOf(':root');
    const blockIdx = css.indexOf("[data-atmosphere='custom']");
    expect(fontFaceIdx).toBeGreaterThanOrEqual(0);
    expect(rootIdx).toBeGreaterThan(fontFaceIdx);
    expect(blockIdx).toBeGreaterThan(rootIdx);
  });

  it('fontAssignments emit the system-font fallback chain after the custom family', () => {
    const { css } = generate(
      defineConfig({
        fontAssignments: {
          heading: 'Orbitron',
          body: 'Inter',
          mono: 'JetBrains Mono',
        },
      }),
      BUILTINS,
    );
    expect(css).toContain(
      "--font-heading: 'Orbitron', ui-sans-serif, system-ui, sans-serif;",
    );
    expect(css).toContain(
      "--font-body: 'Inter', ui-sans-serif, system-ui, sans-serif;",
    );
    expect(css).toContain(
      "--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;",
    );
  });

  it('omits the :root block entirely when fontAssignments is absent', () => {
    const { css } = generate(
      defineConfig({
        fonts: [{ family: 'Inter', src: '/fonts/Inter.woff2' }],
      }),
      BUILTINS,
    );
    expect(css).toContain('@font-face');
    expect(css).not.toContain(':root {');
  });
});
