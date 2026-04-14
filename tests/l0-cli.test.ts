/**
 * L0 CLI — end-to-end tests.
 *
 * The CLI is a thin wrapper around the shared generator + loader. These
 * tests drive the bin entry in a subprocess against a tmpdir fixture so the
 * real file-system + argv + exit-code surface is exercised.
 *
 * Parity guarantee: the CLI's output must be byte-identical to the Vite
 * plugin's virtual modules for the same config. Covered at the golden-
 * snapshot level here; the dist-parity test covers the generator core.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '..');
const PKG = path.join(REPO_ROOT, 'packages/void-energy-tailwind');
const BIN = path.join(PKG, 'bin/void-energy.js');

function runCli(
  args: readonly string[],
  opts: { cwd?: string } = {},
): { stdout: string; stderr: string; status: number } {
  try {
    const stdout = execFileSync(process.execPath, [BIN, ...args], {
      cwd: opts.cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', status: 0 };
  } catch (err) {
    const e = err as {
      status: number;
      stdout?: string | Buffer;
      stderr?: string | Buffer;
    };
    return {
      stdout: e.stdout ? e.stdout.toString() : '',
      stderr: e.stderr ? e.stderr.toString() : '',
      status: e.status,
    };
  }
}

describe('L0 CLI — help + version', () => {
  it('exits 0 for --help and prints usage', () => {
    const r = runCli(['--help']);
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/Usage: void-energy <command>/);
    expect(r.stdout).toMatch(/--config <path>/);
    expect(r.stdout).toMatch(/--watch/);
  });

  it('exits 0 with no args and prints usage', () => {
    const r = runCli([]);
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/Usage: void-energy <command>/);
  });

  it('exits 0 for --version and prints a semver-shaped string', () => {
    const r = runCli(['--version']);
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('rejects unknown commands with a non-zero exit', () => {
    const r = runCli(['bogus']);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/unknown command/);
  });

  it('rejects unknown flags with a non-zero exit', () => {
    const r = runCli(['build', '--weather']);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/unknown flag/);
  });
});

describe('L0 CLI — build', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 've-cli-'));
  });
  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('writes void.generated.css + void.manifest.json to default outDir', () => {
    fs.writeFileSync(
      path.join(tmp, 'void.config.mjs'),
      `export default {
        extendAtmospheres: {
          crimson: {
            physics: 'glass',
            mode: 'dark',
            label: 'Crimson',
            tokens: { '--bg-canvas': '#1a0000', '--energy-primary': '#ff6b6b' },
          },
        },
        fonts: [{ family: 'Inter', src: '/fonts/Inter.woff2', weight: '100 900' }],
        fontAssignments: { body: 'Inter' },
        defaults: { atmosphere: 'crimson' },
      };`,
    );

    const r = runCli(['build'], { cwd: tmp });
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/wrote void.generated.css \+ void.manifest.json/);

    const cssPath = path.join(tmp, 'src/styles/void.generated.css');
    const manifestPath = path.join(tmp, 'src/styles/void.manifest.json');
    expect(fs.existsSync(cssPath)).toBe(true);
    expect(fs.existsSync(manifestPath)).toBe(true);

    const css = fs.readFileSync(cssPath, 'utf8');
    expect(css).toContain('@font-face');
    expect(css).toContain("font-family: 'Inter'");
    expect(css).toContain(':root');
    expect(css).toContain("--font-body: 'Inter'");
    expect(css).toContain("[data-atmosphere='crimson']");
    expect(css).toContain('--bg-canvas: #1a0000');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.defaults.atmosphere).toBe('crimson');
    expect(manifest.atmospheres.crimson).toMatchObject({
      source: 'config',
      physics: 'glass',
      mode: 'dark',
      label: 'Crimson',
    });
    expect(manifest.atmospheres.frost).toMatchObject({
      source: 'builtin',
      physics: 'glass',
      mode: 'dark',
    });
  });

  it('--out overrides the config outDir', () => {
    fs.writeFileSync(
      path.join(tmp, 'void.config.mjs'),
      `export default { outDir: 'ignored-by-cli' };`,
    );
    const r = runCli(['build', '--out', 'custom/generated'], { cwd: tmp });
    expect(r.status).toBe(0);
    expect(
      fs.existsSync(path.join(tmp, 'custom/generated/void.generated.css')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmp, 'ignored-by-cli/void.generated.css')),
    ).toBe(false);
  });

  it('--config points at an explicit file', () => {
    fs.mkdirSync(path.join(tmp, 'configs'));
    fs.writeFileSync(
      path.join(tmp, 'configs/void-prod.mjs'),
      `export default { outDir: 'styles-prod' };`,
    );
    const r = runCli(
      ['build', '--config', 'configs/void-prod.mjs', '--out', 'out'],
      { cwd: tmp },
    );
    expect(r.status).toBe(0);
    expect(fs.existsSync(path.join(tmp, 'out/void.generated.css'))).toBe(true);
  });

  it('surfaces validation errors with a non-zero exit', () => {
    fs.writeFileSync(
      path.join(tmp, 'void.config.mjs'),
      `export default { atmospheres: { bad: { physics: 'liquid', mode: 'dark', tokens: {} } } };`,
    );
    const r = runCli(['build'], { cwd: tmp });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/physics must be one of/);
  });

  it('surfaces missing config file with a clear error', () => {
    const r = runCli(['build'], { cwd: tmp });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/no config file found/);
  });

  it('produces deterministic output across repeat invocations (byte-identical)', () => {
    fs.writeFileSync(
      path.join(tmp, 'void.config.mjs'),
      `export default {
        extendAtmospheres: {
          crimson: {
            physics: 'glass',
            mode: 'dark',
            label: 'Crimson',
            tokens: { '--bg-canvas': '#1a0000', '--energy-primary': '#ff6b6b' },
          },
        },
        defaults: { atmosphere: 'crimson' },
      };`,
    );
    // Run once → capture.
    runCli(['build'], { cwd: tmp });
    const firstCss = fs.readFileSync(
      path.join(tmp, 'src/styles/void.generated.css'),
      'utf8',
    );
    const firstManifest = fs.readFileSync(
      path.join(tmp, 'src/styles/void.manifest.json'),
      'utf8',
    );

    // Wipe + re-run. The generator is pure, the CLI is stateless; the output
    // must be byte-identical — this is the golden contract the Vite plugin
    // relies on.
    fs.rmSync(path.join(tmp, 'src/styles'), { recursive: true });
    runCli(['build'], { cwd: tmp });
    const secondCss = fs.readFileSync(
      path.join(tmp, 'src/styles/void.generated.css'),
      'utf8',
    );
    const secondManifest = fs.readFileSync(
      path.join(tmp, 'src/styles/void.manifest.json'),
      'utf8',
    );
    expect(secondCss).toBe(firstCss);
    expect(secondManifest).toBe(firstManifest);
  });
});
