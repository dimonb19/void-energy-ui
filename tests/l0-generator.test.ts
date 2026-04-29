/**
 * L0 generator — pure-function tests.
 *
 * The generator is the core of the consumer config layer (D-L0.6). It must
 * stay byte-stable across runs (golden snapshots rely on this), enforce
 * topological extends resolution with cycle rejection, and honor the three
 * modes of built-in handling (full replacement / extend / omit).
 *
 * Tests drive the generator directly with fixture inputs — no filesystem,
 * no process, no DOM.
 */

import { describe, expect, it } from 'vitest';
import {
  generate,
  type GeneratorBuiltins,
  type ResolvedAtmosphere,
} from '../packages/void-energy-tailwind/src/generator.ts';
import {
  defineAtmosphere,
  defineConfig,
} from '../packages/void-energy-tailwind/src/config.ts';

// ---------------------------------------------------------------------------
// Fixture: minimal built-ins + semantic bases. Values are test-only stand-ins;
// real L0 data ships in dist/atmospheres/*. The generator is blind to specific
// values and cares only about the merge mechanics.
// ---------------------------------------------------------------------------

const SEMANTIC_DARK = {
  'color-premium': '#ff8c00',
  'color-system': '#a078ff',
  'color-success': '#00e055',
  'color-error': '#ff3c40',
};

const SEMANTIC_LIGHT = {
  'color-premium': '#b45309',
  'color-system': '#6d28d9',
  'color-success': '#15803d',
  'color-error': '#dc2626',
};

function builtin(
  physics: ResolvedAtmosphere['physics'],
  mode: 'light' | 'dark',
  label: string,
  extra: Record<string, string>,
): ResolvedAtmosphere {
  const base = mode === 'dark' ? SEMANTIC_DARK : SEMANTIC_LIGHT;
  const tokens: Record<string, string> = {};
  for (const [k, v] of Object.entries(base)) tokens[`--${k}`] = v;
  for (const [k, v] of Object.entries(extra)) tokens[k] = v;
  return { physics, mode, label, tokens };
}

const BUILTINS: GeneratorBuiltins = {
  semanticDark: SEMANTIC_DARK,
  semanticLight: SEMANTIC_LIGHT,
  atmospheres: {
    frost: builtin('glass', 'dark', 'Frost', {
      '--bg-canvas': '#080c14',
      '--bg-surface': 'rgba(20, 30, 50, 0.45)',
      '--energy-primary': '#7ec8e3',
    }),
    graphite: builtin('flat', 'dark', 'Graphite', {
      '--bg-canvas': '#1f1f1f',
      '--bg-surface': '#2a2a2c',
      '--energy-primary': '#ececee',
    }),
    meridian: builtin('flat', 'light', 'Meridian', {
      '--bg-canvas': '#f4f6f9',
      '--bg-surface': '#ffffff',
      '--energy-primary': '#0d6e6e',
    }),
    terminal: builtin('retro', 'dark', 'Terminal', {
      '--bg-canvas': '#050505',
      '--bg-surface': 'rgba(0, 20, 0, 0.9)',
      '--energy-primary': '#f5c518',
    }),
  },
};

// ---------------------------------------------------------------------------

describe('L0 generator — empty config', () => {
  it('returns built-ins only in manifest and emits no atmosphere CSS blocks', () => {
    const { css, manifest } = generate(defineConfig({}), BUILTINS);

    expect(manifest.schemaVersion).toBe(1);
    expect(Object.keys(manifest.atmospheres).sort()).toEqual([
      'frost',
      'graphite',
      'meridian',
      'terminal',
    ]);
    for (const entry of Object.values(manifest.atmospheres)) {
      expect(entry.source).toBe('builtin');
    }

    // Built-ins ship as part of the L0 package's own CSS — the generator
    // must not duplicate them into void.generated.css.
    expect(css).not.toContain("[data-atmosphere='frost']");
    expect(css).not.toContain("[data-atmosphere='graphite']");
  });
});

describe('L0 generator — MODE A (full replacement)', () => {
  it('omits built-ins from the manifest when atmospheres is provided', () => {
    const { manifest } = generate(
      defineConfig({
        atmospheres: {
          midnight: defineAtmosphere({
            physics: 'glass',
            mode: 'dark',
            label: 'Midnight',
            tokens: {
              '--bg-canvas': '#05060b',
              '--energy-primary': '#7c5cff',
            },
          }),
        },
      }),
      BUILTINS,
    );

    expect(Object.keys(manifest.atmospheres)).toEqual(['midnight']);
    expect(manifest.atmospheres.midnight.source).toBe('config');
    expect(manifest.atmospheres.midnight.label).toBe('Midnight');
  });

  it('emits a CSS block merging consumer tokens over SEMANTIC_DARK', () => {
    const { css } = generate(
      defineConfig({
        atmospheres: {
          midnight: defineAtmosphere({
            physics: 'glass',
            mode: 'dark',
            tokens: {
              '--bg-canvas': '#05060b',
              '--energy-primary': '#7c5cff',
            },
          }),
        },
      }),
      BUILTINS,
    );

    expect(css).toContain("[data-atmosphere='midnight']");
    expect(css).toContain('--bg-canvas: #05060b;');
    expect(css).toContain('--energy-primary: #7c5cff;');
    // SEMANTIC_DARK keys flow through the base merge with --color-premium etc.
    expect(css).toContain('--color-premium: #ff8c00;');
    expect(css).toContain('--color-system: #a078ff;');
  });

  it('MODE A with zero atmospheres produces empty manifest and minimal CSS', () => {
    const { css, manifest } = generate(
      defineConfig({ atmospheres: {} }),
      BUILTINS,
    );
    expect(manifest.atmospheres).toEqual({});
    expect(css).not.toContain('[data-atmosphere=');
  });

  it('ignores extendAtmospheres and omitBuiltins when atmospheres is present', () => {
    const { manifest } = generate(
      defineConfig({
        atmospheres: {
          midnight: defineAtmosphere({
            physics: 'glass',
            mode: 'dark',
            tokens: {},
          }),
        },
        extendAtmospheres: {
          crimson: defineAtmosphere({
            physics: 'glass',
            mode: 'dark',
            tokens: {},
          }),
        },
        omitBuiltins: ['terminal'],
      }),
      BUILTINS,
    );

    expect(Object.keys(manifest.atmospheres)).toEqual(['midnight']);
  });
});

describe('L0 generator — MODE B (extendAtmospheres)', () => {
  it('keeps all built-ins and appends extensions', () => {
    const { manifest } = generate(
      defineConfig({
        extendAtmospheres: {
          crimson: defineAtmosphere({
            physics: 'glass',
            mode: 'dark',
            label: 'Crimson',
            tokens: { '--energy-primary': '#ff6b6b' },
          }),
        },
      }),
      BUILTINS,
    );

    expect(Object.keys(manifest.atmospheres).sort()).toEqual([
      'crimson',
      'frost',
      'graphite',
      'meridian',
      'terminal',
    ]);
    expect(manifest.atmospheres.frost.source).toBe('builtin');
    expect(manifest.atmospheres.crimson.source).toBe('config');
  });

  it('only emits CSS blocks for config-source atmospheres', () => {
    const { css } = generate(
      defineConfig({
        extendAtmospheres: {
          crimson: defineAtmosphere({
            physics: 'glass',
            mode: 'dark',
            tokens: { '--energy-primary': '#ff6b6b' },
          }),
        },
      }),
      BUILTINS,
    );
    expect(css).toContain("[data-atmosphere='crimson']");
    expect(css).not.toContain("[data-atmosphere='frost']");
    expect(css).not.toContain("[data-atmosphere='graphite']");
  });
});

describe('L0 generator — MODE C (omitBuiltins)', () => {
  it('drops only listed built-ins from the manifest', () => {
    const { manifest } = generate(
      defineConfig({ omitBuiltins: ['terminal'] }),
      BUILTINS,
    );
    expect(Object.keys(manifest.atmospheres).sort()).toEqual([
      'frost',
      'graphite',
      'meridian',
    ]);
  });

  it('combines with extendAtmospheres', () => {
    const { manifest } = generate(
      defineConfig({
        omitBuiltins: ['terminal', 'meridian'],
        extendAtmospheres: {
          dawn: defineAtmosphere({
            physics: 'flat',
            mode: 'light',
            tokens: {},
          }),
        },
      }),
      BUILTINS,
    );
    expect(Object.keys(manifest.atmospheres).sort()).toEqual([
      'dawn',
      'frost',
      'graphite',
    ]);
  });
});

describe('L0 generator — extends resolution', () => {
  it('extends a built-in and inherits its tokens', () => {
    const { css } = generate(
      defineConfig({
        extendAtmospheres: {
          dawn: defineAtmosphere({
            physics: 'flat',
            mode: 'light',
            extends: 'meridian',
            tokens: { '--energy-primary': '#ff6b4a' },
          }),
        },
      }),
      BUILTINS,
    );
    // Inherits meridian's bg-canvas
    expect(css).toContain('--bg-canvas: #f4f6f9;');
    // Overrides energy-primary
    expect(css).toContain('--energy-primary: #ff6b4a;');
    // Inherits SEMANTIC_LIGHT's color-system (via meridian's base)
    expect(css).toContain('--color-system: #6d28d9;');
  });

  it('resolves a two-level extends chain in topological order', () => {
    const { css } = generate(
      defineConfig({
        extendAtmospheres: {
          intermediate: defineAtmosphere({
            physics: 'flat',
            mode: 'light',
            extends: 'meridian',
            tokens: { '--energy-primary': '#aaaaaa', '--layer-a': '1' },
          }),
          leaf: defineAtmosphere({
            physics: 'flat',
            mode: 'light',
            extends: 'intermediate',
            tokens: { '--layer-b': '2' },
          }),
        },
      }),
      BUILTINS,
    );
    // leaf must see tokens from meridian, intermediate, AND its own additions.
    expect(css).toMatch(
      /\[data-atmosphere='leaf'\][\s\S]*--bg-canvas: #f4f6f9;/,
    );
    expect(css).toMatch(/\[data-atmosphere='leaf'\][\s\S]*--layer-a: 1;/);
    expect(css).toMatch(/\[data-atmosphere='leaf'\][\s\S]*--layer-b: 2;/);
    expect(css).toMatch(
      /\[data-atmosphere='leaf'\][\s\S]*--energy-primary: #aaaaaa;/,
    );
  });

  it('throws a clear error on a simple cycle', () => {
    expect(() =>
      generate(
        defineConfig({
          extendAtmospheres: {
            a: defineAtmosphere({
              physics: 'glass',
              mode: 'dark',
              extends: 'b',
              tokens: {},
            }),
            b: defineAtmosphere({
              physics: 'glass',
              mode: 'dark',
              extends: 'a',
              tokens: {},
            }),
          },
        }),
        BUILTINS,
      ),
    ).toThrow(/extends cycle detected/);
  });

  it('error message names the cycle chain', () => {
    let message = '';
    try {
      generate(
        defineConfig({
          extendAtmospheres: {
            a: defineAtmosphere({
              physics: 'glass',
              mode: 'dark',
              extends: 'b',
              tokens: {},
            }),
            b: defineAtmosphere({
              physics: 'glass',
              mode: 'dark',
              extends: 'a',
              tokens: {},
            }),
          },
        }),
        BUILTINS,
      );
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toContain('a');
    expect(message).toContain('b');
    expect(message).toContain('→');
  });

  it('throws on extends target that does not exist', () => {
    expect(() =>
      generate(
        defineConfig({
          extendAtmospheres: {
            orphan: defineAtmosphere({
              physics: 'glass',
              mode: 'dark',
              extends: 'nonexistent',
              tokens: {},
            }),
          },
        }),
        BUILTINS,
      ),
    ).toThrow(/unknown atmosphere "nonexistent"/);
  });
});

describe('L0 generator — fonts', () => {
  it('emits @font-face before :root font assignments before atmosphere blocks', () => {
    const { css } = generate(
      defineConfig({
        fonts: [
          {
            family: 'Orbitron',
            src: '/fonts/Orbitron.woff2',
            weight: '400 900',
          },
        ],
        fontAssignments: { heading: 'Orbitron' },
        extendAtmospheres: {
          custom: defineAtmosphere({
            physics: 'glass',
            mode: 'dark',
            tokens: { '--energy-primary': '#fff' },
          }),
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

  it('infers format from file extension when not supplied', () => {
    const { css } = generate(
      defineConfig({
        fonts: [{ family: 'Inter', src: '/fonts/Inter.woff2' }],
      }),
      BUILTINS,
    );
    expect(css).toContain("src: url('/fonts/Inter.woff2') format('woff2');");
  });

  it('supports array src with explicit format', () => {
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

  it('defaults font-display to swap', () => {
    const { css } = generate(
      defineConfig({
        fonts: [{ family: 'Inter', src: '/fonts/Inter.woff2' }],
      }),
      BUILTINS,
    );
    expect(css).toContain('font-display: swap;');
  });

  it('emits font assignments with a sensible fallback stack', () => {
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
});

describe('L0 generator — manifest defaults', () => {
  it('copies config.defaults verbatim into the manifest', () => {
    const { manifest } = generate(
      defineConfig({
        defaults: {
          atmosphere: 'frost',
          physics: 'glass',
          mode: 'dark',
          density: 'comfortable',
        },
      }),
      BUILTINS,
    );
    expect(manifest.defaults).toEqual({
      atmosphere: 'frost',
      physics: 'glass',
      mode: 'dark',
      density: 'comfortable',
    });
  });

  it('omits keys the consumer did not provide', () => {
    const { manifest } = generate(defineConfig({}), BUILTINS);
    expect(manifest.defaults).toEqual({});
  });
});

describe('L0 generator — determinism', () => {
  it('produces byte-identical CSS across repeated runs', () => {
    const cfg = defineConfig({
      atmospheres: {
        zebra: defineAtmosphere({
          physics: 'flat',
          mode: 'dark',
          tokens: { '--z-a': '1', '--z-b': '2' },
        }),
        alpha: defineAtmosphere({
          physics: 'flat',
          mode: 'dark',
          tokens: { '--a-a': '1', '--a-b': '2' },
        }),
      },
    });
    const a = generate(cfg, BUILTINS);
    const b = generate(cfg, BUILTINS);
    expect(a.css).toBe(b.css);
    expect(JSON.stringify(a.manifest)).toBe(JSON.stringify(b.manifest));
  });

  it('sorts atmosphere blocks alphabetically regardless of insertion order', () => {
    const { css } = generate(
      defineConfig({
        atmospheres: {
          zebra: defineAtmosphere({
            physics: 'flat',
            mode: 'dark',
            tokens: {},
          }),
          alpha: defineAtmosphere({
            physics: 'flat',
            mode: 'dark',
            tokens: {},
          }),
        },
      }),
      BUILTINS,
    );
    const alphaIdx = css.indexOf("[data-atmosphere='alpha']");
    const zebraIdx = css.indexOf("[data-atmosphere='zebra']");
    expect(alphaIdx).toBeGreaterThan(0);
    expect(zebraIdx).toBeGreaterThan(alphaIdx);
  });

  it('golden snapshot — minimal config + one extension + one font', () => {
    const { css, manifest } = generate(
      defineConfig({
        extendAtmospheres: {
          crimson: defineAtmosphere({
            physics: 'glass',
            mode: 'dark',
            label: 'Crimson',
            tokens: {
              '--bg-canvas': '#1a0000',
              '--energy-primary': '#ff6b6b',
            },
          }),
        },
        fonts: [
          { family: 'Inter', src: '/fonts/Inter.woff2', weight: '100 900' },
        ],
        fontAssignments: { body: 'Inter' },
        defaults: {
          atmosphere: 'crimson',
          physics: 'glass',
          mode: 'dark',
          density: 'default',
        },
      }),
      BUILTINS,
    );

    expect(css).toMatchInlineSnapshot(`
      "/* void.generated.css — generated by @void-energy/tailwind. Do not edit. */

      @font-face {
        font-family: 'Inter';
        src: url('/fonts/Inter.woff2') format('woff2');
        font-weight: 100 900;
        font-display: swap;
      }

      :root {
        --font-body: 'Inter', ui-sans-serif, system-ui, sans-serif;
      }

      [data-atmosphere='crimson'] {
        --bg-canvas: #1a0000;
        --color-error: #ff3c40;
        --color-premium: #ff8c00;
        --color-success: #00e055;
        --color-system: #a078ff;
        --energy-primary: #ff6b6b;
      }
      "
    `);

    expect(manifest).toEqual({
      schemaVersion: 1,
      defaults: {
        atmosphere: 'crimson',
        physics: 'glass',
        mode: 'dark',
        density: 'default',
      },
      atmospheres: {
        crimson: {
          source: 'config',
          physics: 'glass',
          mode: 'dark',
          label: 'Crimson',
        },
        frost: {
          source: 'builtin',
          physics: 'glass',
          mode: 'dark',
          label: 'Frost',
        },
        meridian: {
          source: 'builtin',
          physics: 'flat',
          mode: 'light',
          label: 'Meridian',
        },
        graphite: {
          source: 'builtin',
          physics: 'flat',
          mode: 'dark',
          label: 'Graphite',
        },
        terminal: {
          source: 'builtin',
          physics: 'retro',
          mode: 'dark',
          label: 'Terminal',
        },
      },
    });
  });
});
