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
  'MANIFEST_SCHEMA_VERSION',
  'setAtmosphere',
  'setPhysics',
  'setMode',
  'setDensity',
  'init',
  'getAtmospheres',
  'getAtmosphereBySource',
  'registerAtmosphere',
  'unregisterAtmosphere',
  'getCustomAtmospheres',
  'getState',
  'subscribe',
];

const EXPECTED_STORAGE_KEYS = {
  atmosphere: 've-atmosphere',
  physics: 've-physics',
  mode: 've-mode',
  density: 've-density',
  customAtmospheres: 've-custom-atmospheres',
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
      `m.registerAtmosphere('noop', { physics: 'flat', mode: 'dark', tokens: {} });`,
      `m.unregisterAtmosphere('noop');`,
      `m.getCustomAtmospheres();`,
      `m.getState();`,
      `const off = m.subscribe(() => {}); off();`,
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
      m.registerAtmosphere('noop', { physics: 'flat', mode: 'dark', tokens: {} });
      m.unregisterAtmosphere('noop');
      m.getCustomAtmospheres();
      m.getState();
      const off = m.subscribe(() => {}); off();
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
    expect(result.keys).toEqual([
      'atmosphere',
      'customAtmospheres',
      'density',
      'mode',
      'physics',
    ]);
    expect(result.atmosphere).toBe('ve-atmosphere');
  });
});

describe('L0 runtime — atmosphere manifest drift guard', () => {
  it('getAtmospheres() matches dist/atmospheres.json shape', async () => {
    const manifest = JSON.parse(
      fs.readFileSync(ATMOSPHERES_JSON, 'utf8'),
    ) as Record<string, { physics: string; mode: string; tagline?: string }>;
    const runtime = await import(RUNTIME_JS);
    const entries = runtime.getAtmospheres() as Array<{
      name: string;
      physics: string;
      mode: string;
      source: string;
    }>;

    // Same atmosphere names
    const runtimeNames = entries.map((e) => e.name).sort();
    expect(runtimeNames).toEqual(Object.keys(manifest).sort());

    // Same physics + mode per atmosphere (runtime intentionally omits tagline)
    for (const entry of entries) {
      const m = manifest[entry.name];
      expect(m).toBeDefined();
      expect(entry.physics).toBe(m.physics);
      expect(entry.mode).toBe(m.mode);
      expect(entry.source).toBe('builtin');
    }
  });

  it('getAtmospheres() returns a fresh array — caller mutation does not leak', async () => {
    const runtime = await import(RUNTIME_JS);
    const first = runtime.getAtmospheres();
    first.pop();
    first.length = 0;
    const second = runtime.getAtmospheres();
    expect(second.length).toBe(4);
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

  it('setMode("light") under physics="glass" forces data-mode="dark" (CONSTRAINTS)', () => {
    // Without this guard setMode could land an invalid combo (glass/light)
    // that AdaptiveImage's "4 valid combinations" resolver assumes never
    // happens. Mirrors the symmetric guard in setPhysics.
    runtime.setPhysics('glass');
    runtime.setMode('light');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });

  it('setMode("auto") under physics="retro" forces data-mode="dark" (CONSTRAINTS)', () => {
    runtime.setPhysics('retro');
    runtime.setMode('auto'); // would resolve to 'light' via mocked matchMedia
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
    // localStorage retains the user's 'auto' preference for the next page load
    expect(localStorage.getItem('ve-mode')).toBe('auto');
  });

  it('setMode("light") under physics="flat" stays light (no CONSTRAINTS entry)', () => {
    runtime.setPhysics('flat');
    runtime.setMode('light');
    expect(document.documentElement.getAttribute('data-mode')).toBe('light');
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

describe('L0 runtime — custom atmospheres + reactivity (jsdom)', () => {
  let runtime: typeof import('../packages/void-energy-tailwind/dist/runtime.js');

  beforeEach(async () => {
    runtime = await import('../packages/void-energy-tailwind/dist/runtime.js');
  });

  afterEach(() => {
    for (const name of runtime.getCustomAtmospheres()) {
      runtime.unregisterAtmosphere(name);
    }
    const root = document.documentElement;
    root.removeAttribute('data-atmosphere');
    root.removeAttribute('data-physics');
    root.removeAttribute('data-mode');
    root.removeAttribute('data-density');
    document.getElementById('ve-custom-atmospheres')?.remove();
    localStorage.clear();
  });

  it('registerAtmosphere injects a <style> tag scoped to [data-atmosphere]', () => {
    runtime.registerAtmosphere('acme', {
      physics: 'flat',
      mode: 'dark',
      tokens: { '--bg-canvas': '#0a0e1a', '--energy-primary': '#ff5a8a' },
    });
    const el = document.getElementById('ve-custom-atmospheres');
    expect(el).not.toBeNull();
    expect(el!.textContent).toContain("[data-atmosphere='acme']");
    expect(el!.textContent).toContain('--bg-canvas: #0a0e1a');
    expect(el!.textContent).toContain('--energy-primary: #ff5a8a');
  });

  it('registerAtmosphere persists definition to localStorage', () => {
    runtime.registerAtmosphere('acme', {
      physics: 'flat',
      mode: 'dark',
      tokens: { '--bg-canvas': '#0a0e1a' },
    });
    const raw = localStorage.getItem('ve-custom-atmospheres');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.acme.physics).toBe('flat');
    expect(parsed.acme.tokens['--bg-canvas']).toBe('#0a0e1a');
  });

  it('unregisterAtmosphere removes from style tag and storage', () => {
    runtime.registerAtmosphere('acme', {
      physics: 'flat',
      mode: 'dark',
      tokens: { '--bg-canvas': '#0a0e1a' },
    });
    runtime.unregisterAtmosphere('acme');
    expect(document.getElementById('ve-custom-atmospheres')).toBeNull();
    expect(localStorage.getItem('ve-custom-atmospheres')).toBeNull();
  });

  it('getAtmospheres merges built-ins with customs', () => {
    runtime.registerAtmosphere('acme', {
      physics: 'retro',
      mode: 'dark',
      tokens: {},
    });
    const all = runtime.getAtmospheres();
    const byName = Object.fromEntries(all.map((e) => [e.name, e]));
    expect(byName.frost).toBeDefined();
    expect(byName.frost.source).toBe('builtin');
    expect(byName.acme).toMatchObject({
      physics: 'retro',
      mode: 'dark',
      source: 'runtime',
    });
  });

  it('getCustomAtmospheres returns only custom names', () => {
    expect(runtime.getCustomAtmospheres()).toEqual([]);
    runtime.registerAtmosphere('acme', {
      physics: 'flat',
      mode: 'dark',
      tokens: {},
    });
    runtime.registerAtmosphere('widgets', {
      physics: 'flat',
      mode: 'light',
      tokens: {},
    });
    expect(runtime.getCustomAtmospheres().sort()).toEqual(['acme', 'widgets']);
  });

  it('setAtmosphere on a custom name cascades its physics and mode', () => {
    runtime.registerAtmosphere('acme', {
      physics: 'retro',
      mode: 'dark',
      tokens: {},
    });
    runtime.setAtmosphere('acme');
    expect(document.documentElement.getAttribute('data-atmosphere')).toBe(
      'acme',
    );
    expect(document.documentElement.getAttribute('data-physics')).toBe('retro');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });

  it('invalid atmosphere names are silently rejected', () => {
    runtime.registerAtmosphere("bad'; body{display:none}", {
      physics: 'flat',
      mode: 'dark',
      tokens: { '--bg-canvas': 'red' },
    });
    expect(document.getElementById('ve-custom-atmospheres')).toBeNull();
    expect(runtime.getCustomAtmospheres()).toEqual([]);
  });

  it('subscribe fires on setAtmosphere / setPhysics / setMode / setDensity', () => {
    const calls: string[] = [];
    const off = runtime.subscribe((state) =>
      calls.push(state.atmosphere ?? ''),
    );
    runtime.setAtmosphere('slate');
    runtime.setDensity('compact');
    off();
    runtime.setDensity('comfortable');
    expect(calls).toEqual(['slate', 'slate']);
  });

  it('subscribe fires exactly once per setAtmosphere (batched)', () => {
    let count = 0;
    const off = runtime.subscribe(() => count++);
    runtime.setAtmosphere('meridian');
    off();
    // setAtmosphere internally calls setPhysics + setMode; the batch must
    // coalesce those into a single notification.
    expect(count).toBe(1);
  });

  it('subscribe fires exactly once per init (batched)', () => {
    let count = 0;
    const off = runtime.subscribe(() => count++);
    runtime.init({ atmosphere: 'slate' });
    off();
    expect(count).toBe(1);
  });

  it('subscribe returns an unsubscribe that is idempotent', () => {
    let count = 0;
    const off = runtime.subscribe(() => count++);
    off();
    off();
    runtime.setAtmosphere('slate');
    expect(count).toBe(0);
  });

  it('getState reflects the current <html> attributes', () => {
    runtime.setAtmosphere('terminal');
    expect(runtime.getState()).toEqual({
      atmosphere: 'terminal',
      physics: 'retro',
      mode: 'dark',
      density: null,
    });
  });

  it('init() re-registers persisted custom atmospheres from localStorage', () => {
    localStorage.setItem(
      've-custom-atmospheres',
      JSON.stringify({
        acme: {
          physics: 'flat',
          mode: 'dark',
          tokens: { '--bg-canvas': '#0a0e1a' },
        },
      }),
    );
    runtime.init();
    expect(runtime.getCustomAtmospheres()).toEqual(['acme']);
    const el = document.getElementById('ve-custom-atmospheres');
    expect(el!.textContent).toContain("[data-atmosphere='acme']");
  });

  it('a listener that throws does not break other listeners', () => {
    const calls: string[] = [];
    const offBad = runtime.subscribe(() => {
      throw new Error('boom');
    });
    const offGood = runtime.subscribe((state) =>
      calls.push(state.atmosphere ?? ''),
    );
    runtime.setAtmosphere('slate');
    offBad();
    offGood();
    expect(calls).toEqual(['slate']);
  });

  it('init() re-hydrate clears stale custom atmospheres (Finding 4)', () => {
    // Seed storage, init to load, then remove storage and re-init.
    // The registry must reflect the current storage state, not keep the
    // prior session's entries around.
    localStorage.setItem(
      've-custom-atmospheres',
      JSON.stringify({
        acme: {
          physics: 'flat',
          mode: 'dark',
          tokens: { '--bg-canvas': '#0a0e1a' },
        },
      }),
    );
    runtime.init();
    expect(runtime.getCustomAtmospheres()).toEqual(['acme']);

    localStorage.removeItem('ve-custom-atmospheres');
    runtime.init();
    expect(runtime.getCustomAtmospheres()).toEqual([]);
  });
});

describe('L0 runtime — manifest integration (jsdom)', () => {
  let runtime: typeof import('../packages/void-energy-tailwind/dist/runtime.js');

  beforeEach(async () => {
    runtime = await import('../packages/void-energy-tailwind/dist/runtime.js');
  });

  afterEach(() => {
    for (const name of runtime.getCustomAtmospheres()) {
      runtime.unregisterAtmosphere(name);
    }
    const root = document.documentElement;
    root.removeAttribute('data-atmosphere');
    root.removeAttribute('data-physics');
    root.removeAttribute('data-mode');
    root.removeAttribute('data-density');
    document.getElementById('ve-custom-atmospheres')?.remove();
    localStorage.clear();
  });

  it('init({ manifest }) loads config atmospheres tagged source=config', () => {
    runtime.init({
      manifest: {
        schemaVersion: 1,
        atmospheres: {
          midnight: {
            source: 'config',
            physics: 'glass',
            mode: 'dark',
            label: 'Midnight',
          },
        },
      },
    });
    const all = runtime.getAtmospheres();
    const byName = Object.fromEntries(all.map((e) => [e.name, e]));
    expect(byName.midnight).toMatchObject({
      source: 'config',
      physics: 'glass',
      mode: 'dark',
      label: 'Midnight',
    });
    // Built-ins from ATMOSPHERES_META are NOT merged when a manifest is
    // loaded — the manifest is the authoritative directory.
    expect(byName.frost).toBeUndefined();
  });

  it('manifest.defaults feeds the default-resolution chain', () => {
    runtime.init({
      manifest: {
        schemaVersion: 1,
        defaults: { atmosphere: 'midnight', density: 'comfortable' },
        atmospheres: {
          midnight: {
            source: 'config',
            physics: 'glass',
            mode: 'dark',
          },
        },
      },
    });
    expect(document.documentElement.getAttribute('data-atmosphere')).toBe(
      'midnight',
    );
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'comfortable',
    );
    // Glass cascades dark mode.
    expect(document.documentElement.getAttribute('data-physics')).toBe('glass');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });

  it('localStorage wins over manifest.defaults wins over init defaults', () => {
    localStorage.setItem('ve-atmosphere', 'slate');
    runtime.init({
      atmosphere: 'frost',
      manifest: {
        schemaVersion: 1,
        defaults: { atmosphere: 'meridian' },
        atmospheres: {
          slate: { source: 'builtin', physics: 'flat', mode: 'dark' },
          meridian: { source: 'builtin', physics: 'flat', mode: 'light' },
        },
      },
    });
    expect(document.documentElement.getAttribute('data-atmosphere')).toBe(
      'slate',
    );
  });

  it('schema-version mismatch logs an error and falls back to built-ins', () => {
    const errors: string[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(' '));
    };
    try {
      runtime.init({
        manifest: {
          schemaVersion: 999,
          atmospheres: {
            midnight: { source: 'config', physics: 'glass', mode: 'dark' },
          },
        },
      });
    } finally {
      console.error = original;
    }
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/manifest schema version mismatch/);
    // Rejected manifest → built-ins remain visible.
    const byName = Object.fromEntries(
      runtime.getAtmospheres().map((e) => [e.name, e]),
    );
    expect(byName.frost).toBeDefined();
    expect(byName.midnight).toBeUndefined();
  });

  it('config atmosphere wins over built-in when names collide', () => {
    runtime.init({
      manifest: {
        schemaVersion: 1,
        atmospheres: {
          frost: {
            source: 'config',
            physics: 'flat',
            mode: 'dark',
            label: 'Frost (Custom)',
          },
        },
      },
    });
    const all = runtime.getAtmospheres();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({
      name: 'frost',
      source: 'config',
      physics: 'flat',
      label: 'Frost (Custom)',
    });
  });

  it('runtime-registered atmospheres win over manifest entries on collision', () => {
    runtime.init({
      manifest: {
        schemaVersion: 1,
        atmospheres: {
          midnight: { source: 'config', physics: 'glass', mode: 'dark' },
        },
      },
    });
    runtime.registerAtmosphere('midnight', {
      physics: 'retro',
      mode: 'dark',
      tokens: {},
    });
    const byName = Object.fromEntries(
      runtime.getAtmospheres().map((e) => [e.name, e]),
    );
    expect(byName.midnight.source).toBe('runtime');
    expect(byName.midnight.physics).toBe('retro');
  });

  it('getAtmosphereBySource filters correctly for theme-picker UIs', () => {
    runtime.init({
      manifest: {
        schemaVersion: 1,
        atmospheres: {
          frost: {
            source: 'builtin',
            physics: 'glass',
            mode: 'dark',
            label: 'Frost',
          },
          midnight: {
            source: 'config',
            physics: 'glass',
            mode: 'dark',
          },
        },
      },
    });
    runtime.registerAtmosphere('user-theme', {
      physics: 'flat',
      mode: 'dark',
      tokens: {},
    });

    expect(runtime.getAtmosphereBySource('builtin').map((a) => a.name)).toEqual(
      ['frost'],
    );
    expect(runtime.getAtmosphereBySource('config').map((a) => a.name)).toEqual([
      'midnight',
    ]);
    expect(runtime.getAtmosphereBySource('runtime').map((a) => a.name)).toEqual(
      ['user-theme'],
    );
  });

  it('setAtmosphere on a config atmosphere cascades physics + mode', () => {
    runtime.init({
      manifest: {
        schemaVersion: 1,
        atmospheres: {
          midnight: { source: 'config', physics: 'retro', mode: 'dark' },
        },
      },
    });
    runtime.setAtmosphere('midnight');
    expect(document.documentElement.getAttribute('data-physics')).toBe('retro');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });
});

describe('L0 runtime — SSR state isolation (Finding 2)', () => {
  // registerAtmosphere / unregisterAtmosphere / subscribe must not mutate
  // module-global state when document is unavailable. Otherwise SSR servers
  // would leak per-request themes and listeners across requests.
  it('Node: registerAtmosphere does not leak into module state', () => {
    const code = `
      import * as m from '${RUNTIME_JS}';
      m.registerAtmosphere('srv', { physics: 'flat', mode: 'dark', tokens: {} });
      const custom = m.getCustomAtmospheres();
      const all = m.getAtmospheres();
      process.stdout.write(JSON.stringify({
        custom,
        allNames: all.map(a => a.name),
      }));
    `;
    const out = JSON.parse(runInNode(code).stdout);
    expect(out.custom).toEqual([]);
    // getAtmospheres still reports built-ins (manifest not loaded) but no
    // srv entry leaked in from registerAtmosphere.
    expect(out.allNames).not.toContain('srv');
  });

  it('Node: subscribe returns a no-op unsubscribe without side effects', () => {
    const code = `
      import * as m from '${RUNTIME_JS}';
      const off = m.subscribe(() => {});
      off();
      off();
      process.stdout.write('ok');
    `;
    expect(runInNode(code).stdout).toBe('ok');
  });
});
