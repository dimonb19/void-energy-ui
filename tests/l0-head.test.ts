/**
 * L0 head (FOUC) — export parity + script behavior.
 *
 * The head entry ships as:
 *   src/head.ts         — typed source of truth
 *   dist/head.js        — ESM output
 *   dist/head.cjs       — CJS output
 *   dist/head.d.ts      — shared types
 *
 * These tests verify the FOUC_SCRIPT string is well-formed, that STORAGE_KEYS
 * never drifts from runtime, and that evaluating the script inside jsdom
 * produces the expected attribute writes.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'packages/void-energy-tailwind');
const HEAD_JS = path.join(PKG, 'dist/head.js');
const HEAD_CJS = path.join(PKG, 'dist/head.cjs');
const HEAD_DTS = path.join(PKG, 'dist/head.d.ts');
const RUNTIME_JS = path.join(PKG, 'dist/runtime.js');
const RUNTIME_CJS = path.join(PKG, 'dist/runtime.cjs');

const EXPECTED_EXPORTS = ['STORAGE_KEYS', 'FOUC_SCRIPT'];

function runInNode(code: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function runInNodeCJS(code: string): string {
  return execFileSync(process.execPath, ['-e', code], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

describe('L0 head — file layout', () => {
  it('dist/head.js, head.cjs, head.d.ts all exist', () => {
    expect(fs.existsSync(HEAD_JS)).toBe(true);
    expect(fs.existsSync(HEAD_CJS)).toBe(true);
    expect(fs.existsSync(HEAD_DTS)).toBe(true);
  });
});

describe('L0 head — ESM/CJS parity', () => {
  it('ESM exports STORAGE_KEYS and FOUC_SCRIPT', () => {
    const stdout = runInNode(`
      import * as m from '${HEAD_JS}';
      process.stdout.write(JSON.stringify(Object.keys(m).sort()));
    `);
    const names = JSON.parse(stdout);
    for (const exp of EXPECTED_EXPORTS) expect(names).toContain(exp);
  });

  it('CJS exports STORAGE_KEYS and FOUC_SCRIPT', () => {
    const stdout = runInNodeCJS(
      `process.stdout.write(JSON.stringify(Object.keys(require(${JSON.stringify(HEAD_CJS)})).sort()));`,
    );
    const names = JSON.parse(stdout);
    for (const exp of EXPECTED_EXPORTS) expect(names).toContain(exp);
  });

  it('ESM and CJS ship identical FOUC_SCRIPT strings', () => {
    const esm = runInNode(
      `import { FOUC_SCRIPT } from '${HEAD_JS}'; process.stdout.write(FOUC_SCRIPT);`,
    );
    const cjs = runInNodeCJS(
      `process.stdout.write(require(${JSON.stringify(HEAD_CJS)}).FOUC_SCRIPT);`,
    );
    expect(esm).toBe(cjs);
    expect(esm.length).toBeGreaterThan(0);
  });
});

describe('L0 head — STORAGE_KEYS drift guard vs runtime', () => {
  it('head and runtime ship the exact same STORAGE_KEYS', () => {
    const headKeys = runInNodeCJS(
      `process.stdout.write(JSON.stringify(require(${JSON.stringify(HEAD_CJS)}).STORAGE_KEYS));`,
    );
    const runtimeKeys = runInNodeCJS(
      `process.stdout.write(JSON.stringify(require(${JSON.stringify(RUNTIME_CJS)}).STORAGE_KEYS));`,
    );
    expect(JSON.parse(headKeys)).toEqual(JSON.parse(runtimeKeys));
  });

  it('FOUC_SCRIPT references every STORAGE_KEYS value', async () => {
    const { FOUC_SCRIPT, STORAGE_KEYS } = await import(HEAD_JS);
    for (const value of Object.values(STORAGE_KEYS)) {
      expect(FOUC_SCRIPT).toContain(value as string);
    }
  });

  void RUNTIME_JS; // referenced for clarity / future drift guards
});

describe('L0 head — FOUC_SCRIPT shape', () => {
  it('is a self-invoking IIFE wrapped in try/catch', async () => {
    const { FOUC_SCRIPT } = await import(HEAD_JS);
    expect(FOUC_SCRIPT).toMatch(/^\(function\s*\(\s*\)\s*\{/);
    expect(FOUC_SCRIPT).toMatch(/\}\s*\)\s*\(\s*\)\s*;?\s*$/);
    expect(FOUC_SCRIPT).toMatch(/try\s*\{/);
    expect(FOUC_SCRIPT).toMatch(/catch\s*\(\s*e\s*\)\s*\{\s*\}/);
  });

  it('sets all four data-* attributes on documentElement', async () => {
    const { FOUC_SCRIPT } = await import(HEAD_JS);
    expect(FOUC_SCRIPT).toMatch(/data-atmosphere/);
    expect(FOUC_SCRIPT).toMatch(/data-physics/);
    expect(FOUC_SCRIPT).toMatch(/data-mode/);
    expect(FOUC_SCRIPT).toMatch(/data-density/);
  });

  it('falls back to frost / glass / dark / default when nothing is stored', async () => {
    const { FOUC_SCRIPT } = await import(HEAD_JS);
    expect(FOUC_SCRIPT).toContain("|| 'frost'");
    expect(FOUC_SCRIPT).toContain("|| 'glass'");
    expect(FOUC_SCRIPT).toContain("|| 'dark'");
    expect(FOUC_SCRIPT).toContain("|| 'default'");
  });
});

describe('L0 head — script execution (jsdom)', () => {
  afterEach(() => {
    const root = document.documentElement;
    root.removeAttribute('data-atmosphere');
    root.removeAttribute('data-physics');
    root.removeAttribute('data-mode');
    root.removeAttribute('data-density');
    localStorage.clear();
  });

  async function runScript(): Promise<void> {
    const { FOUC_SCRIPT } = await import(HEAD_JS);
    // Direct eval — the script is our own, authored here; this is a controlled
    // jsdom smoke, not consumer-side code.
    // eslint-disable-next-line no-eval
    (0, eval)(FOUC_SCRIPT);
  }

  it('pins all four data-* attributes to defaults with empty storage', async () => {
    await runScript();
    const r = document.documentElement;
    expect(r.getAttribute('data-atmosphere')).toBe('frost');
    expect(r.getAttribute('data-physics')).toBe('glass');
    expect(r.getAttribute('data-mode')).toBe('dark');
    expect(r.getAttribute('data-density')).toBe('default');
  });

  it('restores persisted atmosphere / physics / mode / density from storage', async () => {
    localStorage.setItem('ve-atmosphere', 'terminal');
    localStorage.setItem('ve-physics', 'retro');
    localStorage.setItem('ve-mode', 'dark');
    localStorage.setItem('ve-density', 'compact');
    await runScript();
    const r = document.documentElement;
    expect(r.getAttribute('data-atmosphere')).toBe('terminal');
    expect(r.getAttribute('data-physics')).toBe('retro');
    expect(r.getAttribute('data-mode')).toBe('dark');
    expect(r.getAttribute('data-density')).toBe('compact');
  });

  it('does not throw when localStorage.getItem throws', async () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('denied');
    };
    try {
      await expect(runScript()).resolves.not.toThrow();
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
