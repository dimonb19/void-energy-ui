/**
 * L0 config loader — validator surface tests.
 *
 * The loader has two jobs: locate `void.config.{ts,js,mjs}` and validate its
 * exported object. The validator is hand-rolled (no zod dependency — D-L0.6
 * footprint discipline), so each shape error needs its own coverage to prove
 * the error messages are concrete and path-anchored.
 *
 * We drive `validate()` directly with POJOs to keep these tests filesystem-
 * free and fast. Filesystem integration is exercised via `loadConfig()` with
 * `.mjs` fixtures — .ts config loading goes through `tsx` (covered by a
 * subprocess test below to avoid esbuild vs jsdom conflicts).
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  validate,
  findConfig,
} from '../packages/void-energy-tailwind/src/loader.ts';

const REPO_ROOT = path.resolve(__dirname, '..');
const TSX_BIN = path.join(REPO_ROOT, 'node_modules/.bin/tsx');
const RUNNER = path.join(REPO_ROOT, 'tests/fixtures/l0-loader-runner.mts');

type RunnerResult =
  | { ok: { config: unknown; configPath: string; outDirAbsolute: string } }
  | { error: string };

function runLoaderInNode(projectRoot: string): RunnerResult {
  const stdout = execFileSync(TSX_BIN, [RUNNER, projectRoot], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(stdout) as RunnerResult;
}

describe('L0 loader — validate() root shape', () => {
  it('rejects non-object root', () => {
    expect(() => validate(null)).toThrow(
      /expected default export to be an object/,
    );
    expect(() => validate('oops')).toThrow(
      /expected default export to be an object/,
    );
    expect(() => validate(42)).toThrow(
      /expected default export to be an object/,
    );
    expect(() => validate([])).toThrow(
      /expected default export to be an object/,
    );
  });

  it('accepts an empty object', () => {
    expect(validate({})).toEqual({});
  });

  it('passes valid config through intact', () => {
    const cfg = validate({
      atmospheres: {
        midnight: {
          physics: 'glass',
          mode: 'dark',
          label: 'Midnight',
          tokens: { '--bg-canvas': '#000' },
        },
      },
      fonts: [{ family: 'Inter', src: '/fonts/Inter.woff2' }],
      fontAssignments: { heading: 'Inter' },
      defaults: { atmosphere: 'midnight', physics: 'glass' },
      outDir: 'src/styles',
    });
    expect(cfg.atmospheres?.midnight.physics).toBe('glass');
    expect(cfg.fonts?.[0].family).toBe('Inter');
    expect(cfg.outDir).toBe('src/styles');
  });
});

describe('L0 loader — atmosphere validation', () => {
  it('rejects invalid physics value', () => {
    expect(() =>
      validate({
        atmospheres: {
          bad: { physics: 'liquid', mode: 'dark', tokens: {} },
        },
      }),
    ).toThrow(/atmospheres\.bad\.physics must be one of .* \(got "liquid"\)/);
  });

  it('rejects missing physics', () => {
    expect(() =>
      validate({
        atmospheres: { bad: { mode: 'dark', tokens: {} } },
      }),
    ).toThrow(/atmospheres\.bad\.physics must be one of/);
  });

  it('rejects invalid mode value', () => {
    expect(() =>
      validate({
        atmospheres: {
          bad: { physics: 'glass', mode: 'neon', tokens: {} },
        },
      }),
    ).toThrow(/atmospheres\.bad\.mode must be "light" or "dark"/);
  });

  it('rejects tokens object with non-string values', () => {
    expect(() =>
      validate({
        atmospheres: {
          bad: {
            physics: 'glass',
            mode: 'dark',
            tokens: { '--bg-canvas': 42 },
          },
        },
      }),
    ).toThrow(/atmospheres\.bad\.tokens\["--bg-canvas"\] must be a string/);
  });

  it('rejects missing tokens object', () => {
    expect(() =>
      validate({
        atmospheres: { bad: { physics: 'glass', mode: 'dark' } },
      }),
    ).toThrow(/atmospheres\.bad\.tokens must be an object/);
  });

  it('rejects invalid atmosphere name', () => {
    expect(() =>
      validate({
        atmospheres: {
          'bad name!': { physics: 'glass', mode: 'dark', tokens: {} },
        },
      }),
    ).toThrow(/atmosphere names must match/);
  });

  it('rejects non-string extends', () => {
    expect(() =>
      validate({
        atmospheres: {
          x: { physics: 'glass', mode: 'dark', tokens: {}, extends: 123 },
        },
      }),
    ).toThrow(/atmospheres\.x\.extends must be a non-empty string/);
  });
});

describe('L0 loader — omitBuiltins validation', () => {
  it('rejects non-array', () => {
    expect(() => validate({ omitBuiltins: 'terminal' })).toThrow(
      /omitBuiltins must be an array/,
    );
  });

  it('rejects unknown builtin name', () => {
    expect(() => validate({ omitBuiltins: ['nebula'] })).toThrow(
      /omitBuiltins\[0\] must be one of .* \(got "nebula"\)/,
    );
  });

  it('accepts all four built-in names', () => {
    const cfg = validate({
      omitBuiltins: ['frost', 'slate', 'terminal', 'meridian'],
    });
    expect(cfg.omitBuiltins).toEqual([
      'frost',
      'slate',
      'terminal',
      'meridian',
    ]);
  });
});

describe('L0 loader — fonts validation', () => {
  it('rejects non-array', () => {
    expect(() => validate({ fonts: 'Orbitron' })).toThrow(
      /fonts must be an array/,
    );
  });

  it('rejects missing family', () => {
    expect(() => validate({ fonts: [{ src: '/fonts/Inter.woff2' }] })).toThrow(
      /fonts\[0\]\.family must be a non-empty string/,
    );
  });

  it('rejects invalid src type', () => {
    expect(() => validate({ fonts: [{ family: 'Inter', src: 42 }] })).toThrow(
      /fonts\[0\]\.src must be a string URL or an array of \{ url, format\? \} entries/,
    );
  });

  it('rejects src array with bad entry', () => {
    expect(() =>
      validate({
        fonts: [{ family: 'Inter', src: [{ format: 'woff2' }] }],
      }),
    ).toThrow(/fonts\[0\]\.src\[0\]\.url must be a non-empty string/);
  });

  it('rejects unknown font format', () => {
    expect(() =>
      validate({
        fonts: [
          {
            family: 'Inter',
            src: [{ url: '/fonts/Inter.bin', format: 'magic' }],
          },
        ],
      }),
    ).toThrow(/fonts\[0\]\.src\[0\]\.format must be one of/);
  });

  it('rejects unknown font-display value', () => {
    expect(() =>
      validate({
        fonts: [
          { family: 'Inter', src: '/fonts/Inter.woff2', display: 'flash' },
        ],
      }),
    ).toThrow(/fonts\[0\]\.display must be one of/);
  });

  it('accepts both string and array src shapes', () => {
    const cfg = validate({
      fonts: [
        { family: 'Inter', src: '/fonts/Inter.woff2' },
        {
          family: 'Orbitron',
          src: [{ url: '/fonts/Orbitron.woff2', format: 'woff2' }],
        },
      ],
    });
    expect(cfg.fonts?.[0].src).toBe('/fonts/Inter.woff2');
    expect(Array.isArray(cfg.fonts?.[1].src)).toBe(true);
  });
});

describe('L0 loader — fontAssignments validation', () => {
  it('rejects non-object', () => {
    expect(() => validate({ fontAssignments: 'Inter' })).toThrow(
      /fontAssignments must be an object/,
    );
  });

  it('rejects non-string heading', () => {
    expect(() => validate({ fontAssignments: { heading: 123 } })).toThrow(
      /fontAssignments\.heading must be a non-empty string/,
    );
  });
});

describe('L0 loader — defaults validation', () => {
  it('rejects non-object', () => {
    expect(() => validate({ defaults: 'frost' })).toThrow(
      /defaults must be an object/,
    );
  });

  it('rejects invalid physics value', () => {
    expect(() => validate({ defaults: { physics: 'liquid' } })).toThrow(
      /defaults\.physics must be one of/,
    );
  });

  it('accepts mode: auto', () => {
    const cfg = validate({ defaults: { mode: 'auto' } });
    expect(cfg.defaults?.mode).toBe('auto');
  });

  it('rejects invalid density', () => {
    expect(() => validate({ defaults: { density: 'packed' } })).toThrow(
      /defaults\.density must be one of/,
    );
  });
});

describe('L0 loader — outDir validation', () => {
  it('rejects non-string', () => {
    expect(() => validate({ outDir: 123 })).toThrow(
      /outDir must be a non-empty string/,
    );
  });

  it('rejects empty string', () => {
    expect(() => validate({ outDir: '' })).toThrow(
      /outDir must be a non-empty string/,
    );
  });
});

// ---------------------------------------------------------------------------
// End-to-end: round-trip through the filesystem and `tsx`'s import path.
// ---------------------------------------------------------------------------

describe('L0 loader — loadConfig() end-to-end', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 've-loader-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('findConfig returns null when no file exists', () => {
    expect(findConfig(tmp)).toBe(null);
  });

  it('findConfig locates void.config.ts', () => {
    const p = path.join(tmp, 'void.config.ts');
    fs.writeFileSync(p, 'export default {};');
    expect(findConfig(tmp)).toBe(p);
  });

  it('errors when no config file exists', () => {
    const r = runLoaderInNode(tmp);
    expect(r).toHaveProperty('error');
    expect((r as { error: string }).error).toMatch(/no config file found/);
  });

  it('loads a minimal .mjs config and resolves outDir to an absolute path', () => {
    const p = path.join(tmp, 'void.config.mjs');
    fs.writeFileSync(
      p,
      `export default { outDir: 'custom/styles', defaults: { atmosphere: 'frost' } };`,
    );
    const r = runLoaderInNode(tmp);
    expect(r).toHaveProperty('ok');
    const { ok } = r as Extract<RunnerResult, { ok: unknown }>;
    expect(ok.configPath).toBe(p);
    expect((ok.config as { outDir: string }).outDir).toBe('custom/styles');
    expect(path.isAbsolute(ok.outDirAbsolute)).toBe(true);
    expect(ok.outDirAbsolute).toBe(path.resolve(tmp, 'custom/styles'));
  });

  it('defaults outDir to src/styles when not provided', () => {
    fs.writeFileSync(path.join(tmp, 'void.config.mjs'), `export default {};`);
    const r = runLoaderInNode(tmp);
    expect(r).toHaveProperty('ok');
    const { ok } = r as Extract<RunnerResult, { ok: unknown }>;
    expect(ok.outDirAbsolute).toBe(path.resolve(tmp, 'src/styles'));
  });

  it('surfaces validator errors with path context', () => {
    fs.writeFileSync(
      path.join(tmp, 'void.config.mjs'),
      `export default { atmospheres: { bad: { physics: 'liquid', mode: 'dark', tokens: {} } } };`,
    );
    const r = runLoaderInNode(tmp);
    expect(r).toHaveProperty('error');
    expect((r as { error: string }).error).toMatch(
      /atmospheres\.bad\.physics must be one of/,
    );
  });

  it('loads a .ts config via tsx with a type annotation', () => {
    fs.writeFileSync(
      path.join(tmp, 'void.config.ts'),
      `
type Cfg = { outDir: string; defaults?: { atmosphere?: string } };
const cfg: Cfg = { outDir: 'generated', defaults: { atmosphere: 'frost' } };
export default cfg;
      `.trim(),
    );
    const r = runLoaderInNode(tmp);
    expect(r).toHaveProperty('ok');
    const { ok } = r as Extract<RunnerResult, { ok: unknown }>;
    expect((ok.config as { outDir: string }).outDir).toBe('generated');
    expect(ok.outDirAbsolute).toBe(path.resolve(tmp, 'generated'));
  });
});
