/**
 * L0 runtime — SSR safety + DOM behavior + ESM/CJS parity.
 *
 * The runtime lives in three hand-authored files:
 *   src/runtime.ts       — typed source of truth
 *   dist/runtime.js      — ESM output
 *   dist/runtime.cjs     — CJS output
 *
 * These tests verify all three stay in sync and behave per the Session 4 spec.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'packages/void-energy-tailwind');
const RUNTIME_JS = path.join(PKG, 'dist/runtime.js');
const RUNTIME_CJS = path.join(PKG, 'dist/runtime.cjs');
const RUNTIME_DTS = path.join(PKG, 'dist/runtime.d.ts');
const ATMOSPHERES_JSON = path.join(PKG, 'dist/atmospheres.json');

const EXPECTED_EXPORTS = [
  'STORAGE_KEYS',
  'setAtmosphere',
  'setPhysics',
  'setMode',
  'setDensity',
  'init',
  'getAtmospheres',
];

const EXPECTED_STORAGE_KEYS = {
  atmosphere: 've-atmosphere',
  physics: 've-physics',
  mode: 've-mode',
  density: 've-density',
};

// Spawning Node with no jsdom gives us an authentic SSR environment where
// `document` and `localStorage` are undefined. Calling any runtime setter
// must be a silent no-op in that environment.
function runInNode(code: string): { stdout: string; stderr: string } {
  const stdout = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', code],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  return { stdout, stderr: '' };
}

function runInNodeCJS(code: string): string {
  return execFileSync(process.execPath, ['-e', code], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

describe('L0 runtime — file layout', () => {
  it('dist/runtime.js exists', () => {
    expect(fs.existsSync(RUNTIME_JS)).toBe(true);
  });
  it('dist/runtime.cjs exists', () => {
    expect(fs.existsSync(RUNTIME_CJS)).toBe(true);
  });
  it('dist/runtime.d.ts exists', () => {
    expect(fs.existsSync(RUNTIME_DTS)).toBe(true);
  });
});

describe('L0 runtime — ESM/CJS parity', () => {
  it('ESM exposes all expected named exports', () => {
    const stdout = runInNode(`
      import * as m from '${RUNTIME_JS}';
      const names = Object.keys(m).sort();
      process.stdout.write(JSON.stringify(names));
    `);
    const names = JSON.parse(stdout.stdout);
    for (const exp of EXPECTED_EXPORTS) {
      expect(names).toContain(exp);
    }
  });

  it('CJS exposes all expected named exports via require()', () => {
    const stdout = runInNodeCJS(
      `const m = require(${JSON.stringify(RUNTIME_CJS)}); ` +
        `process.stdout.write(JSON.stringify(Object.keys(m).sort()));`,
    );
    const names = JSON.parse(stdout);
    for (const exp of EXPECTED_EXPORTS) {
      expect(names).toContain(exp);
    }
  });

  it('both modules ship the same STORAGE_KEYS values', () => {
    const esm = runInNode(
      `import { STORAGE_KEYS } from '${RUNTIME_JS}'; process.stdout.write(JSON.stringify(STORAGE_KEYS));`,
    ).stdout;
    const cjs = runInNodeCJS(
      `process.stdout.write(JSON.stringify(require(${JSON.stringify(RUNTIME_CJS)}).STORAGE_KEYS));`,
    );
    expect(JSON.parse(esm)).toEqual(EXPECTED_STORAGE_KEYS);
    expect(JSON.parse(cjs)).toEqual(EXPECTED_STORAGE_KEYS);
  });
});

describe('L0 runtime — SSR safety (no document / no localStorage)', () => {
  it('CJS: every exported function is callable in Node and does not throw', () => {
    // This is the contract from the plan (Session 4, line 805):
    //   node -e "const m = require('./runtime.cjs'); Object.values(m)
    //     .filter(f => typeof f === 'function').forEach(f => f())"
    // — must exit cleanly. We also try the setters with valid args.
    const code = [
      `const m = require(${JSON.stringify(RUNTIME_CJS)});`,
      `Object.values(m).filter(f => typeof f === 'function').forEach(f => f());`,
      `m.setAtmosphere('frost');`,
      `m.setPhysics('glass');`,
      `m.setMode('dark');`,
      `m.setMode('auto');`,
      `m.setDensity('comfortable');`,
      `m.init({ atmosphere: 'slate' });`,
      `process.stdout.write('ok');`,
    ].join(' ');
    expect(runInNodeCJS(code)).toBe('ok');
  });

  it('ESM: every exported function is callable in Node and does not throw', () => {
    const code = `
      import * as m from '${RUNTIME_JS}';
      Object.values(m).filter(f => typeof f === 'function').forEach(f => f());
      m.setAtmosphere('frost');
      m.setPhysics('glass');
      m.setMode('dark');
      m.setMode('auto');
      m.setDensity('comfortable');
      m.init({ atmosphere: 'slate' });
      process.stdout.write('ok');
    `;
    expect(runInNode(code).stdout).toBe('ok');
  });

  it('import has zero side effects (no attribute set on a virtual root)', () => {
    // Prove the module does not reach for DOM on import. We can't check
    // documentElement attributes in Node (no document), so instead we
    // import, read STORAGE_KEYS, and confirm nothing else happened.
    const code = `
      import * as m from '${RUNTIME_JS}';
      // If the module had touched document at top level, the import would
      // have thrown in Node — we got here, so that's proven. Also confirm
      // STORAGE_KEYS is the frozen-shape object we expect.
      process.stdout.write(JSON.stringify({
        keys: Object.keys(m.STORAGE_KEYS).sort(),
        atmosphere: m.STORAGE_KEYS.atmosphere,
      }));
    `;
    const result = JSON.parse(runInNode(code).stdout);
    expect(result.keys).toEqual(['atmosphere', 'density', 'mode', 'physics']);
    expect(result.atmosphere).toBe('ve-atmosphere');
  });
});

describe('L0 runtime — atmosphere manifest drift guard', () => {
  it('getAtmospheres() matches dist/atmospheres.json shape', async () => {
    const manifest = JSON.parse(
      fs.readFileSync(ATMOSPHERES_JSON, 'utf8'),
    ) as Record<string, { physics: string; mode: string; tagline?: string }>;
    const runtime = await import(RUNTIME_JS);
    const runtimeMeta = runtime.getAtmospheres() as Record<
      string,
      { physics: string; mode: string }
    >;

    // Same atmosphere keys
    expect(Object.keys(runtimeMeta).sort()).toEqual(
      Object.keys(manifest).sort(),
    );

    // Same physics + mode per atmosphere (runtime intentionally omits tagline)
    for (const [name, meta] of Object.entries(manifest)) {
      expect(runtimeMeta[name]).toBeDefined();
      expect(runtimeMeta[name].physics).toBe(meta.physics);
      expect(runtimeMeta[name].mode).toBe(meta.mode);
    }
  });

  it('getAtmospheres() returns a copy — caller mutation does not leak', async () => {
    const runtime = await import(RUNTIME_JS);
    const first = runtime.getAtmospheres();
    delete first.frost;
    const second = runtime.getAtmospheres();
    expect(second.frost).toBeDefined();
  });
});

describe('L0 runtime — DOM behavior (jsdom)', () => {
  // Import once in jsdom; each test cleans up root attributes + localStorage.
  // Using dynamic import inside each test would re-evaluate the module via
  // Vite and reset state, which is unnecessary — the runtime has no module
  // state, only DOM/localStorage effects.
  let runtime: typeof import('../packages/void-energy-tailwind/dist/runtime.js');

  beforeEach(async () => {
    runtime = await import('../packages/void-energy-tailwind/dist/runtime.js');
  });

  afterEach(() => {
    const root = document.documentElement;
    root.removeAttribute('data-atmosphere');
    root.removeAttribute('data-physics');
    root.removeAttribute('data-mode');
    root.removeAttribute('data-density');
    localStorage.clear();
  });

  it('setDensity writes data-density on <html> and persists', () => {
    runtime.setDensity('comfortable');
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'comfortable',
    );
    expect(localStorage.getItem('ve-density')).toBe('comfortable');
  });

  it('setPhysics("glass") also forces data-mode="dark" (CONSTRAINTS)', () => {
    runtime.setPhysics('glass');
    expect(document.documentElement.getAttribute('data-physics')).toBe('glass');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
    expect(localStorage.getItem('ve-physics')).toBe('glass');
    expect(localStorage.getItem('ve-mode')).toBe('dark');
  });

  it('setPhysics("retro") also forces data-mode="dark"', () => {
    runtime.setPhysics('retro');
    expect(document.documentElement.getAttribute('data-physics')).toBe('retro');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });

  it('setPhysics("flat") does not touch data-mode', () => {
    document.documentElement.setAttribute('data-mode', 'light');
    runtime.setPhysics('flat');
    expect(document.documentElement.getAttribute('data-physics')).toBe('flat');
    expect(document.documentElement.getAttribute('data-mode')).toBe('light');
  });

  it('setAtmosphere("meridian") writes all three attributes per manifest', () => {
    runtime.setAtmosphere('meridian');
    expect(document.documentElement.getAttribute('data-atmosphere')).toBe(
      'meridian',
    );
    expect(document.documentElement.getAttribute('data-physics')).toBe('flat');
    expect(document.documentElement.getAttribute('data-mode')).toBe('light');
  });

  it('setAtmosphere("frost") cascades glass physics + dark mode', () => {
    runtime.setAtmosphere('frost');
    expect(document.documentElement.getAttribute('data-atmosphere')).toBe(
      'frost',
    );
    expect(document.documentElement.getAttribute('data-physics')).toBe('glass');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });

  it('setMode("auto") persists "auto" but resolves to light/dark on DOM', () => {
    // setup.ts mocks matchMedia to return matches:false → resolves to 'light'
    runtime.setMode('auto');
    expect(document.documentElement.getAttribute('data-mode')).toBe('light');
    expect(localStorage.getItem('ve-mode')).toBe('auto');
  });

  it('init() restores persisted state from localStorage', () => {
    localStorage.setItem('ve-atmosphere', 'slate');
    localStorage.setItem('ve-density', 'compact');
    runtime.init();
    expect(document.documentElement.getAttribute('data-atmosphere')).toBe(
      'slate',
    );
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'compact',
    );
    // slate → flat + dark
    expect(document.documentElement.getAttribute('data-physics')).toBe('flat');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });

  it('init() falls back to user-provided defaults when storage is empty', () => {
    runtime.init({ atmosphere: 'terminal', density: 'comfortable' });
    expect(document.documentElement.getAttribute('data-atmosphere')).toBe(
      'terminal',
    );
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'comfortable',
    );
    expect(document.documentElement.getAttribute('data-physics')).toBe('retro');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });

  it('init() falls back to frost/glass/dark/default when nothing is provided', () => {
    runtime.init();
    expect(document.documentElement.getAttribute('data-atmosphere')).toBe(
      'frost',
    );
    expect(document.documentElement.getAttribute('data-physics')).toBe('glass');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'default',
    );
  });

  it('setters survive a throwing localStorage (incognito Safari simulation)', () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    try {
      expect(() => runtime.setAtmosphere('slate')).not.toThrow();
      expect(document.documentElement.getAttribute('data-atmosphere')).toBe(
        'slate',
      );
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});
