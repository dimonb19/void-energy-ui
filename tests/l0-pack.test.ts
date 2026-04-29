/**
 * L0 npm pack — tarball validation.
 *
 * Runs `npm pack --dry-run --json` in the package workspace to get the exact
 * file list that would ship to npm, then asserts:
 *   - Every `package.json#exports` target resolves to a file in the tarball.
 *   - Every hand-authored dist/* file (runtime + head + all CSS) is present.
 *   - The tarball excludes source/test/node_modules (should be dist + README only).
 *
 * This is the Session 5 publish-readiness gate. Session 6 does the real
 * `npm publish --dry-run` separately.
 */

import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { describe, expect, it, beforeAll } from 'vitest';

const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'packages/void-energy-tailwind');

interface PackEntry {
  path: string;
  size: number;
  mode: number;
}

interface PackOutput {
  name: string;
  version: string;
  files: PackEntry[];
  size: number;
  unpackedSize: number;
}

let pack: PackOutput;
let fileSet: Set<string>;
let pkg: {
  name: string;
  exports: Record<string, unknown>;
  files: string[];
  sideEffects: string[];
};

beforeAll(() => {
  pkg = JSON.parse(
    fs.readFileSync(path.join(PKG, 'package.json'), 'utf8'),
  ) as typeof pkg;

  // `npm pack --dry-run --json` returns a single-element array describing the
  // would-be tarball. Run in the package workspace so it uses the package's
  // files/exports fields.
  const stdout = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: PKG,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(stdout) as PackOutput[];
  pack = parsed[0];
  // npm pack paths are relative to the package root and use POSIX separators.
  fileSet = new Set(pack.files.map((f) => f.path));
});

describe('L0 npm pack — metadata', () => {
  it('tarball name is @void-energy/tailwind', () => {
    expect(pack.name).toBe('@void-energy/tailwind');
  });

  it('files field limits the tarball to dist + bin + README (no src, no node_modules)', () => {
    expect(pkg.files.sort()).toEqual(
      ['README.md', 'CHANGELOG.md', 'LICENSE.md', 'bin', 'dist'].sort(),
    );
    // Defensive: no source files should leak into the tarball.
    for (const entry of pack.files) {
      expect(entry.path).not.toMatch(/^src\//);
      expect(entry.path).not.toMatch(/^test\//);
      expect(entry.path).not.toMatch(/node_modules/);
    }
  });

  it('sideEffects marks CSS as side-effectful (preserves imports in bundlers)', () => {
    expect(pkg.sideEffects).toEqual(['*.css']);
  });

  it('packed size is reasonable (< 100 KB tarball, < 500 KB unpacked)', () => {
    expect(pack.size).toBeLessThan(100 * 1024);
    expect(pack.unpackedSize).toBeLessThan(500 * 1024);
  });
});

describe('L0 npm pack — exports field targets are all in the tarball', () => {
  function collectTargets(value: unknown, acc: string[] = []): string[] {
    if (typeof value === 'string') {
      acc.push(value);
    } else if (value && typeof value === 'object') {
      for (const v of Object.values(value as Record<string, unknown>)) {
        collectTargets(v, acc);
      }
    }
    return acc;
  }

  it('every exports target (resolved glob or literal) exists in pack.files', () => {
    const targets = collectTargets(pkg.exports);
    expect(targets.length).toBeGreaterThan(0);

    for (const target of targets) {
      // Strip the leading "./" that npm uses in exports.
      const rel = target.replace(/^\.\//, '');

      if (rel.includes('*')) {
        // Glob target (e.g. ./atmospheres/*): assert at least one match in the
        // tarball that fits the glob prefix.
        const prefix = rel.split('*')[0];
        const suffix = rel.split('*').slice(1).join('*');
        const match = [...fileSet].some(
          (f) => f.startsWith(prefix) && f.endsWith(suffix),
        );
        expect(match, `no tarball entry matches exports glob "${target}"`).toBe(
          true,
        );
      } else {
        expect(fileSet, `missing exports target "${target}"`).toContain(rel);
      }
    }
  });
});

describe('L0 npm pack — required dist files are all present', () => {
  const required = [
    'dist/theme.css',
    'dist/theme-no-container.css',
    'dist/tokens.css',
    'dist/density.css',
    'dist/atmospheres.json',
    'dist/builtins.json',
    'dist/runtime.js',
    'dist/runtime.cjs',
    'dist/runtime.d.ts',
    'dist/head.js',
    'dist/head.cjs',
    'dist/head.d.ts',
    'dist/config.js',
    'dist/config.cjs',
    'dist/config.d.ts',
    'dist/generator.js',
    'dist/generator.cjs',
    'dist/generator.d.ts',
    'dist/loader.js',
    'dist/loader.cjs',
    'dist/loader.d.ts',
    'dist/vite.js',
    'dist/vite.cjs',
    'dist/vite.d.ts',
    'dist/cli.js',
    'dist/cli.cjs',
    'dist/cli.d.ts',
    'bin/void-energy.js',
    'dist/atmospheres/graphite.css',
    'dist/atmospheres/terminal.css',
    'dist/atmospheres/meridian.css',
    'dist/atmospheres/frost.css',
    'dist/physics/glass.css',
    'dist/physics/flat.css',
    'dist/physics/retro.css',
    'README.md',
    'package.json',
  ];

  it.each(required)('tarball contains %s', (file) => {
    expect(fileSet, `tarball missing ${file}`).toContain(file);
  });
});
