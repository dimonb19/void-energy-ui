/**
 * L0 output snapshot tests.
 *
 * Guards every file emitted by `npm run build:tokens -- --target=l0` against
 * accidental drift. Strips the "Generated at:" timestamp line before comparing
 * so a rebuild alone never invalidates a snapshot.
 *
 * If a diff is intentional, regenerate the goldens:
 *   npm run build:tokens -- --target=l0
 *   for each changed file:
 *     copy dist/<file> → test/<file>.golden
 *     remove the "Generated at:" line
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'packages/void-energy-tailwind');

function stripTimestamp(input: string): string {
  return input
    .split('\n')
    .filter((line) => !/Generated at:/.test(line))
    .join('\n');
}

function compare(generatedRel: string, goldenRel: string): void {
  const generatedPath = path.join(PKG, generatedRel);
  const goldenPath = path.join(PKG, goldenRel);
  if (!fs.existsSync(generatedPath)) {
    throw new Error(
      `Generated L0 file not found: ${generatedRel}. Run: npm run build:tokens -- --target=l0`,
    );
  }
  const generated = stripTimestamp(fs.readFileSync(generatedPath, 'utf8'));
  const golden = stripTimestamp(fs.readFileSync(goldenPath, 'utf8'));
  expect(generated).toBe(golden);
}

describe('L0 — foundation tokens.css', () => {
  it('matches golden', () => compare('dist/tokens.css', 'test/tokens.css.golden'));
});

describe('L0 — physics presets', () => {
  for (const name of ['glass', 'flat', 'retro']) {
    it(`physics/${name}.css matches golden`, () =>
      compare(`dist/physics/${name}.css`, `test/physics/${name}.css.golden`));
  }
});

describe('L0 — atmosphere palettes', () => {
  for (const name of ['slate', 'terminal', 'meridian', 'frost']) {
    it(`atmospheres/${name}.css matches golden`, () =>
      compare(
        `dist/atmospheres/${name}.css`,
        `test/atmospheres/${name}.css.golden`,
      ));
  }
});

describe('L0 — density + manifest', () => {
  it('density.css matches golden', () =>
    compare('dist/density.css', 'test/density.css.golden'));
  it('atmospheres.json matches golden', () =>
    compare('dist/atmospheres.json', 'test/atmospheres.json.golden'));
});
