/**
 * L0 Vite plugin — virtual modules, manifest accessor, HMR.
 *
 * The plugin's lifecycle hooks are pure (resolveId, load) but configResolved
 * shells out to the tsx-backed loader, which doesn't survive Vitest's jsdom
 * env. We follow the loader-test discipline: drive the plugin from a `tsx`
 * subprocess (tests/fixtures/l0-vite-runner.mts) and assert on the JSON it
 * emits.
 *
 * The pure hooks (resolveId, the empty-config fallback) are still exercised
 * directly here.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { voidEnergy } from '../packages/void-energy-tailwind/src/vite.ts';

const REPO_ROOT = path.resolve(__dirname, '..');
const TSX_BIN = path.join(REPO_ROOT, 'node_modules/.bin/tsx');
const RUNNER = path.join(REPO_ROOT, 'tests/fixtures/l0-vite-runner.mts');

interface BootResult {
  ok?: {
    css: string;
    manifest: {
      schemaVersion: number;
      defaults: unknown;
      atmospheres: Record<string, unknown>;
    };
  };
  error?: string;
}
interface WatchResult {
  ok?: { before: string; after: string; wsEvents: { type: string }[] };
  error?: string;
}

function runBoot(projectRoot: string): BootResult {
  const stdout = execFileSync(TSX_BIN, [RUNNER, projectRoot, 'boot'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(stdout);
}

function runWatchOnce(
  projectRoot: string,
  mutatedContent: string,
): WatchResult {
  const stdout = execFileSync(
    TSX_BIN,
    [RUNNER, projectRoot, 'watch-once', mutatedContent],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  return JSON.parse(stdout);
}

describe('L0 Vite plugin — pure hooks (in-process)', () => {
  it('returns a plugin with the expected lifecycle surface', () => {
    const plugin = voidEnergy();
    expect(plugin.name).toBe('@void-energy/tailwind');
    expect(typeof plugin.resolveId).toBe('function');
    expect(typeof plugin.load).toBe('function');
    expect(typeof plugin.configureServer).toBe('function');
    expect(typeof plugin.configResolved).toBe('function');
    expect('manifest' in plugin).toBe(true);
  });

  it('resolveId redirects the two virtual ids to \\0-prefixed forms', () => {
    const plugin = voidEnergy();
    expect(plugin.resolveId('virtual:void-energy/generated.css')).toBe(
      '\0virtual:void-energy/generated.css',
    );
    expect(plugin.resolveId('virtual:void-energy/manifest.json')).toBe(
      '\0virtual:void-energy/manifest.json',
    );
    expect(plugin.resolveId('something-else')).toBe(null);
  });

  it('load returns null for unknown ids', () => {
    const plugin = voidEnergy();
    expect(plugin.load('not-virtual')).toBe(null);
  });
});

describe('L0 Vite plugin — config discovery + load (subprocess)', () => {
  let tmp: string;
  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 've-vite-'));
  });
  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('emits an empty manifest when no void.config is found', () => {
    const r = runBoot(tmp);
    expect(r.ok).toBeDefined();
    expect(r.ok!.css).toMatch(/no void\.config/);
    expect(r.ok!.manifest.schemaVersion).toBe(1);
    expect(r.ok!.manifest.atmospheres).toEqual({});
  });

  it('emits CSS + manifest content when void.config.mjs exists', () => {
    fs.writeFileSync(
      path.join(tmp, 'void.config.mjs'),
      `export default {
        extendAtmospheres: {
          midnight: {
            physics: 'glass',
            mode: 'dark',
            label: 'Midnight',
            tokens: { '--bg-canvas': '#05060b', '--energy-primary': '#7c5cff' },
          },
        },
        fonts: [{ family: 'Orbitron', src: '/fonts/Orbitron.woff2', weight: '400 900' }],
        fontAssignments: { heading: 'Orbitron' },
        defaults: { atmosphere: 'midnight' },
      };`,
    );
    const r = runBoot(tmp);
    expect(r.ok).toBeDefined();
    const { css, manifest } = r.ok!;

    expect(css).toContain('@font-face');
    expect(css).toContain("font-family: 'Orbitron'");
    expect(css).toContain(':root');
    expect(css).toContain("--font-heading: 'Orbitron'");
    expect(css).toContain("[data-atmosphere='midnight']");
    expect(css).toContain('--bg-canvas: #05060b');

    expect(manifest.schemaVersion).toBe(1);
    expect((manifest.defaults as { atmosphere?: string }).atmosphere).toBe(
      'midnight',
    );
    expect(manifest.atmospheres.midnight).toMatchObject({
      source: 'config',
      physics: 'glass',
      mode: 'dark',
      label: 'Midnight',
    });
    expect(manifest.atmospheres.frost).toMatchObject({ source: 'builtin' });
  });

  it('surfaces validation errors at configResolved time', () => {
    fs.writeFileSync(
      path.join(tmp, 'void.config.mjs'),
      `export default { atmospheres: { bad: { physics: 'liquid', mode: 'dark', tokens: {} } } };`,
    );
    const r = runBoot(tmp);
    expect(r.error).toBeDefined();
    expect(r.error).toMatch(/physics must be one of/);
  });
});

describe('L0 Vite plugin — HMR (subprocess)', () => {
  let tmp: string;
  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 've-vite-'));
  });
  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('rebuilds and emits a full-reload event when the config changes', () => {
    fs.writeFileSync(
      path.join(tmp, 'void.config.mjs'),
      `export default { extendAtmospheres: { v1: { physics: 'flat', mode: 'dark', tokens: { '--energy-primary': '#111111' } } } };`,
    );
    const mutated = `export default { extendAtmospheres: { v1: { physics: 'flat', mode: 'dark', tokens: { '--energy-primary': '#222222' } } } };`;
    const r = runWatchOnce(tmp, mutated);
    expect(r.ok).toBeDefined();
    expect(r.ok!.before).toContain('--energy-primary: #111111');
    expect(r.ok!.after).toContain('--energy-primary: #222222');
    expect(r.ok!.wsEvents.length).toBeGreaterThan(0);
    expect(r.ok!.wsEvents[0]).toEqual({ type: 'full-reload' });
  });
});
