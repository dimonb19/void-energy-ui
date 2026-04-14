/**
 * L0 npm publish — dry-run gate.
 *
 * Runs `npm publish --dry-run --json` in the package workspace. Exit code 0
 * means the tarball is publishable to the registry (auth aside). The JSON
 * output is the same shape as `npm pack --dry-run`, so this is a superset of
 * the l0-pack test — it adds the registry-side validation (package name,
 * version, required fields, etc.) that pack alone does not perform.
 *
 * This is the Session 6 publish-readiness gate. The actual `npm publish`
 * (without --dry-run) is deferred to the Phase 3 monorepo restructure.
 */

import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it, beforeAll } from 'vitest';

const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'packages/void-energy-tailwind');

interface PublishEntry {
  id: string;
  name: string;
  version: string;
  size: number;
  unpackedSize: number;
  files: { path: string }[];
}

let publish: PublishEntry;

beforeAll(() => {
  // `--dry-run` skips the actual upload. `--json` makes the output machine-
  // readable. Run in the package workspace. npm wraps the payload under the
  // package name: `{ "@void-energy/tailwind": { … } }` — unwrap here so the
  // tests read the inner entry.
  const stdout = execFileSync('npm', ['publish', '--dry-run', '--json'], {
    cwd: PKG,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const wrapped = JSON.parse(stdout) as Record<string, PublishEntry>;
  const entry = wrapped['@void-energy/tailwind'];
  if (!entry) {
    throw new Error(
      `Expected @void-energy/tailwind key in npm publish --json output, got: ${Object.keys(wrapped).join(', ')}`,
    );
  }
  publish = entry;
});

describe('L0 npm publish --dry-run', () => {
  it('exits cleanly and reports the scoped package id', () => {
    expect(publish.id).toMatch(/^@void-energy\/tailwind@/);
    expect(publish.name).toBe('@void-energy/tailwind');
  });

  it('reports a version matching semver', () => {
    expect(publish.version).toMatch(/^\d+\.\d+\.\d+(?:-[\w.]+)?$/);
  });

  it('tarball is reasonable (< 100 KB)', () => {
    expect(publish.size).toBeLessThan(100 * 1024);
    expect(publish.unpackedSize).toBeLessThan(500 * 1024);
  });

  it('at least one runtime + one head + one theme file is in the publish payload', () => {
    const paths = publish.files.map((f) => f.path);
    expect(paths).toContain('dist/runtime.js');
    expect(paths).toContain('dist/runtime.cjs');
    expect(paths).toContain('dist/head.js');
    expect(paths).toContain('dist/head.cjs');
    expect(paths).toContain('dist/theme.css');
  });
});
