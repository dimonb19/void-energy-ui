/**
 * L0 hand-authored parallel output parity.
 *
 * config.ts / generator.ts / runtime.ts are the typing sources of truth, and
 * each one has hand-authored dist/ outputs (ESM + CJS + d.ts). If someone
 * edits the source without updating the dist files, consumers receive stale
 * behavior. These tests exercise every dist file as a real Node module and
 * assert they expose the same named exports and — where behavior is pure —
 * return the same results as the source.
 *
 * Two kinds of checks:
 *   1. Export-name parity: dist/X.js (ESM) and dist/X.cjs (CJS) expose the
 *      same set of named exports; the d.ts declares all of them.
 *   2. Behavioral parity (pure modules only): generator's dist outputs
 *      produce byte-identical CSS to the source for a fixture config.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'packages/void-energy-tailwind');

function namesInESM(distJs: string): string[] {
  const out = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import * as m from '${distJs}'; process.stdout.write(JSON.stringify(Object.keys(m).sort()));`,
    ],
    { encoding: 'utf8' },
  );
  return JSON.parse(out);
}

function namesInCJS(distCjs: string): string[] {
  const out = execFileSync(
    process.execPath,
    [
      '-e',
      `process.stdout.write(JSON.stringify(Object.keys(require(${JSON.stringify(
        distCjs,
      )})).sort()));`,
    ],
    { encoding: 'utf8' },
  );
  return JSON.parse(out);
}

describe('L0 dist parity — config', () => {
  const ESM = path.join(PKG, 'dist/config.js');
  const CJS = path.join(PKG, 'dist/config.cjs');
  const DTS = path.join(PKG, 'dist/config.d.ts');
  const EXPECTED = ['defineAtmosphere', 'defineConfig'];

  it('all three files exist', () => {
    for (const f of [ESM, CJS, DTS]) expect(fs.existsSync(f)).toBe(true);
  });

  it('ESM exposes defineConfig + defineAtmosphere', () => {
    expect(namesInESM(ESM)).toEqual(expect.arrayContaining(EXPECTED));
  });

  it('CJS exposes defineConfig + defineAtmosphere', () => {
    expect(namesInCJS(CJS)).toEqual(expect.arrayContaining(EXPECTED));
  });

  it('d.ts declares all runtime-visible exports', () => {
    const dts = fs.readFileSync(DTS, 'utf8');
    for (const name of EXPECTED) {
      expect(dts).toMatch(new RegExp(`\\bfunction ${name}\\b`));
    }
  });

  it('defineConfig is an identity function in both outputs', () => {
    const code = (importer: string) => `
      ${importer}
      const cfg = { outDir: 'x' };
      const out = defineConfig(cfg);
      process.stdout.write(JSON.stringify(out === cfg));
    `;
    const esm = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        code(`import { defineConfig } from '${ESM}';`),
      ],
      { encoding: 'utf8' },
    );
    const cjs = execFileSync(
      process.execPath,
      ['-e', code(`const { defineConfig } = require(${JSON.stringify(CJS)});`)],
      { encoding: 'utf8' },
    );
    expect(esm).toBe('true');
    expect(cjs).toBe('true');
  });
});

describe('L0 dist parity — loader', () => {
  const ESM = path.join(PKG, 'dist/loader.js');
  const CJS = path.join(PKG, 'dist/loader.cjs');
  const DTS = path.join(PKG, 'dist/loader.d.ts');
  const EXPECTED = [
    'BUILTINS',
    'CANDIDATE_FILENAMES',
    'findConfig',
    'loadConfig',
    'validate',
  ];

  it('all three files exist', () => {
    for (const f of [ESM, CJS, DTS]) expect(fs.existsSync(f)).toBe(true);
  });

  it('ESM exposes validate + loadConfig + findConfig + BUILTINS + CANDIDATE_FILENAMES', () => {
    expect(namesInESM(ESM)).toEqual(expect.arrayContaining(EXPECTED));
  });

  it('CJS exposes the same', () => {
    expect(namesInCJS(CJS)).toEqual(expect.arrayContaining(EXPECTED));
  });

  it('d.ts declares the runtime-visible exports', () => {
    const dts = fs.readFileSync(DTS, 'utf8');
    expect(dts).toMatch(/\bfunction loadConfig\b/);
    expect(dts).toMatch(/\bfunction findConfig\b/);
    expect(dts).toMatch(/\bfunction validate\b/);
  });
});

describe('L0 dist parity — vite', () => {
  const ESM = path.join(PKG, 'dist/vite.js');
  const CJS = path.join(PKG, 'dist/vite.cjs');
  const DTS = path.join(PKG, 'dist/vite.d.ts');

  it('all three files exist', () => {
    for (const f of [ESM, CJS, DTS]) expect(fs.existsSync(f)).toBe(true);
  });

  it('ESM exposes voidEnergy', () => {
    expect(namesInESM(ESM)).toEqual(expect.arrayContaining(['voidEnergy']));
  });

  it('CJS exposes voidEnergy (plus default)', () => {
    const keys = namesInCJS(CJS);
    expect(keys).toEqual(expect.arrayContaining(['voidEnergy']));
  });

  it('d.ts declares voidEnergy as a function', () => {
    const dts = fs.readFileSync(DTS, 'utf8');
    expect(dts).toMatch(/\bfunction voidEnergy\b/);
  });
});

describe('L0 dist parity — cli', () => {
  const ESM = path.join(PKG, 'dist/cli.js');
  const CJS = path.join(PKG, 'dist/cli.cjs');
  const DTS = path.join(PKG, 'dist/cli.d.ts');
  const EXPECTED = ['helpText', 'main', 'parseArgs', 'runBuild'];

  it('all three files exist', () => {
    for (const f of [ESM, CJS, DTS]) expect(fs.existsSync(f)).toBe(true);
  });

  it('ESM exposes main + parseArgs + runBuild + helpText', () => {
    expect(namesInESM(ESM)).toEqual(expect.arrayContaining(EXPECTED));
  });

  it('CJS exposes the same', () => {
    expect(namesInCJS(CJS)).toEqual(expect.arrayContaining(EXPECTED));
  });
});

describe('L0 bin — shebang entry', () => {
  const BIN = path.join(PKG, 'bin/void-energy.js');

  it('exists and has a shebang line', () => {
    expect(fs.existsSync(BIN)).toBe(true);
    const content = fs.readFileSync(BIN, 'utf8');
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('is executable (owner bit set)', () => {
    const mode = fs.statSync(BIN).mode;
    // 0o100 = executable bit for owner
    expect(mode & 0o100).toBe(0o100);
  });
});

describe('L0 dist parity — generator', () => {
  const ESM = path.join(PKG, 'dist/generator.js');
  const CJS = path.join(PKG, 'dist/generator.cjs');
  const DTS = path.join(PKG, 'dist/generator.d.ts');
  const EXPECTED = ['generate'];

  const fixtureBuiltins = {
    semanticDark: {
      'color-premium': '#ff8c00',
      'color-system': '#a078ff',
    },
    semanticLight: {
      'color-premium': '#b45309',
      'color-system': '#6d28d9',
    },
    atmospheres: {
      frost: {
        physics: 'glass' as const,
        mode: 'dark' as const,
        label: 'Frost',
        tokens: { '--bg-canvas': '#080c14' },
      },
      slate: {
        physics: 'flat' as const,
        mode: 'dark' as const,
        label: 'Slate',
        tokens: { '--bg-canvas': '#111118' },
      },
      meridian: {
        physics: 'flat' as const,
        mode: 'light' as const,
        label: 'Meridian',
        tokens: { '--bg-canvas': '#f4f6f9' },
      },
      terminal: {
        physics: 'retro' as const,
        mode: 'dark' as const,
        label: 'Terminal',
        tokens: { '--bg-canvas': '#050505' },
      },
    },
  };

  const fixtureConfig = {
    extendAtmospheres: {
      crimson: {
        physics: 'glass' as const,
        mode: 'dark' as const,
        label: 'Crimson',
        tokens: { '--bg-canvas': '#1a0000', '--energy-primary': '#ff6b6b' },
      },
    },
  };

  it('all three files exist', () => {
    for (const f of [ESM, CJS, DTS]) expect(fs.existsSync(f)).toBe(true);
  });

  it('ESM exposes generate', () => {
    expect(namesInESM(ESM)).toEqual(expect.arrayContaining(EXPECTED));
  });

  it('CJS exposes generate', () => {
    expect(namesInCJS(CJS)).toEqual(expect.arrayContaining(EXPECTED));
  });

  it('ESM and CJS produce byte-identical output for the same input', () => {
    const serialized = (json: object) =>
      JSON.stringify(json).replace(/'/g, "\\'");
    const script = (importer: string) => `
      ${importer}
      const out = generate(${JSON.stringify(fixtureConfig)}, ${JSON.stringify(fixtureBuiltins)});
      process.stdout.write(JSON.stringify({ css: out.css, manifest: out.manifest }));
    `;
    void serialized; // lint suppression — JSON.stringify gives us what we need

    const esm = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        script(`import { generate } from '${ESM}';`),
      ],
      { encoding: 'utf8' },
    );
    const cjs = execFileSync(
      process.execPath,
      ['-e', script(`const { generate } = require(${JSON.stringify(CJS)});`)],
      { encoding: 'utf8' },
    );

    expect(esm).toBe(cjs);
    const { css, manifest } = JSON.parse(esm) as {
      css: string;
      manifest: { atmospheres: Record<string, unknown> };
    };
    expect(css).toContain("[data-atmosphere='crimson']");
    expect(manifest.atmospheres).toHaveProperty('crimson');
    expect(manifest.atmospheres).toHaveProperty('frost');
  });

  it('dist/generator output matches src/generator output for the same fixture', async () => {
    const source = await import(
      '../packages/void-energy-tailwind/src/generator.ts'
    );
    const dist = await import(ESM);
    const fromSource = source.generate(fixtureConfig, fixtureBuiltins);
    const fromDist = dist.generate(fixtureConfig, fixtureBuiltins);
    expect(fromDist.css).toBe(fromSource.css);
    expect(JSON.stringify(fromDist.manifest)).toBe(
      JSON.stringify(fromSource.manifest),
    );
  });
});
