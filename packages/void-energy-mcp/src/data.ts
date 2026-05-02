/*
 * Loads the bundled atmosphere snapshot + Frost design.md from dist/data/.
 * The snapshot is generated at build time by scripts/build-data.ts (see
 * package CLAUDE.md for the build-time vs runtime split). At runtime the
 * server only reads JSON / markdown — never reaches into ../../src.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AtmospheresSnapshot } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dist/index.js → ../data/  (sibling of the compiled entry point).
const DATA_ROOT = path.join(__dirname, 'data');

let cachedSnapshot: AtmospheresSnapshot | null = null;
let cachedFrostMd: string | null = null;

export function loadAtmospheres(): AtmospheresSnapshot {
  if (cachedSnapshot) return cachedSnapshot;
  const file = path.join(DATA_ROOT, 'atmospheres.json');
  const raw = fs.readFileSync(file, 'utf8');
  cachedSnapshot = JSON.parse(raw) as AtmospheresSnapshot;
  return cachedSnapshot;
}

export function loadFrostDesignMd(): string {
  if (cachedFrostMd !== null) return cachedFrostMd;
  const file = path.join(DATA_ROOT, 'design-md', 'frost.md');
  cachedFrostMd = fs.readFileSync(file, 'utf8');
  return cachedFrostMd;
}

/** ID of the only atmosphere with a spec-compliant DESIGN.md snapshot. */
export const SPEC_DESIGN_MD_ID = 'frost';
