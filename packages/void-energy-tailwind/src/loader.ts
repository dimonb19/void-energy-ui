/**
 * @void-energy/tailwind — Config file loader.
 *
 * Discovers and loads `void.config.{ts,js,mjs}` from a project root. Validates
 * the exported config with a hand-rolled checker — no zod / ajv / yup / joi.
 * L0's runtime footprint discipline extends to the build-time toolchain: the
 * loader's only non-stdlib dep is `tsx`, required as a devDependency of this
 * package so the generator can parse TypeScript configs without a separate
 * build step.
 *
 * Validation failures throw plain `Error`s whose messages are path-anchored
 * and actionable: `void.config: atmospheres.midnight.physics must be "glass"
 * | "flat" | "retro" (got "liquid")`. Cycle detection is deferred to the
 * generator — cycles are visible only after the full topology is known.
 *
 * Node-only. Imports from this file are safe to skip in browser bundles; the
 * upcoming Vite plugin calls it exclusively from its Node-side code path.
 */

import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

import type {
  AtmosphereDef,
  BuiltinName,
  FontAssignments,
  FontSource,
  FontSourceEntry,
  InitDefaults,
  Physics,
  VoidConfig,
} from './config.ts';

const CANDIDATE_FILENAMES = [
  'void.config.ts',
  'void.config.mts',
  'void.config.js',
  'void.config.mjs',
  'void.config.cjs',
] as const;

const BUILTINS: readonly BuiltinName[] = [
  'frost',
  'graphite',
  'terminal',
  'meridian',
] as const;

const VALID_PHYSICS: readonly Physics[] = ['glass', 'flat', 'retro'] as const;
const VALID_MODE = ['light', 'dark'] as const;
const VALID_MODE_INIT = ['light', 'dark', 'auto'] as const;
const VALID_DENSITY = ['compact', 'default', 'comfortable'] as const;
const VALID_FONT_DISPLAY = [
  'auto',
  'block',
  'swap',
  'fallback',
  'optional',
] as const;
const VALID_FONT_STYLE = ['normal', 'italic'] as const;
const VALID_FONT_FORMAT = ['woff2', 'woff', 'truetype', 'opentype'] as const;

export interface LoadedConfig {
  /** Validated, defaults-applied config object. Safe to hand to `generate()`. */
  config: VoidConfig;
  /** Absolute path to the resolved config file. */
  configPath: string;
  /** Absolute path to the output directory (`outDir` resolved against root). */
  outDirAbsolute: string;
}

export interface LoadConfigOptions {
  /** Explicit path to a config file. Skips auto-discovery when provided. */
  configPath?: string;
}

/**
 * Resolve the path to the consumer's config file within `projectRoot`.
 * Returns null when no candidate exists — the caller decides whether that
 * means "fall through to L0 built-ins" or "error".
 */
export function findConfig(projectRoot: string): string | null {
  for (const name of CANDIDATE_FILENAMES) {
    const candidate = path.resolve(projectRoot, name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Load, parse, and validate a `void.config.{ts,js,mjs}` file. Uses `tsx`'s
 * programmatic API so TS, ESM, and CJS all work without a separate compile
 * step. Returns the validated config plus resolved paths.
 */
export async function loadConfig(
  projectRoot: string,
  options: LoadConfigOptions = {},
): Promise<LoadedConfig> {
  const configPath = options.configPath
    ? path.resolve(projectRoot, options.configPath)
    : findConfig(projectRoot);

  if (!configPath) {
    throw new Error(
      `void.config: no config file found in ${projectRoot}. Expected one of: ${CANDIDATE_FILENAMES.join(', ')}`,
    );
  }
  if (!fs.existsSync(configPath)) {
    throw new Error(`void.config: config file not found at ${configPath}`);
  }

  const mod = await importConfig(configPath);
  const raw = unwrapDefault(mod);
  const config = validate(raw);

  const outDirAbsolute = path.resolve(
    projectRoot,
    config.outDir ?? 'src/styles',
  );

  return { config, configPath, outDirAbsolute };
}

/**
 * Resolve the consumer's default export. `tsx`'s TS→CJS path double-wraps
 * `export default X` as `{ default: { default: X, __esModule: true } }`;
 * native `.mjs` / `.js` imports hand back `{ default: X }`. Peel as many
 * `__esModule`-tagged interop layers as necessary.
 */
function unwrapDefault(mod: unknown): unknown {
  let current: unknown = (mod as { default?: unknown }).default ?? mod;
  while (
    current &&
    typeof current === 'object' &&
    (current as Record<PropertyKey, unknown>).__esModule === true &&
    'default' in current
  ) {
    current = (current as { default: unknown }).default;
  }
  return current;
}

async function importConfig(configPath: string): Promise<unknown> {
  // @vite-ignore disables Vite's static resolution attempt on this dynamic
  // import — without it, running under Vitest / any Vite-based bundler turns
  // the absolute file:// URL into a bundle-time lookup that fails.
  //
  // Cache busting: we append `?t=<now>` to the URL so Node's module cache
  // never returns a stale import. The Vite plugin's HMR path calls the
  // loader multiple times across a single process lifetime; without the
  // bust, the rebuilt config keeps returning the original file's exports.
  const bust = Date.now();
  const isTs = /\.(ts|mts|cts)$/.test(configPath);
  if (isTs) {
    const tsxApi: {
      tsImport: (p: string, parent: string) => Promise<unknown>;
    } = await import(/* @vite-ignore */ 'tsx/esm/api');
    return tsxApi.tsImport(`${configPath}?t=${bust}`, import.meta.url);
  }
  // pathToFileURL handles Windows drive letters correctly; plain string
  // concatenation would produce `file://C:\...` which Node rejects.
  const url = `${pathToFileURL(configPath).href}?t=${bust}`;
  return import(/* @vite-ignore */ url);
}

// ---------------------------------------------------------------------------
// Validator — hand-rolled, path-anchored errors
// ---------------------------------------------------------------------------

/** Exported for direct testing without going through the filesystem. */
export function validate(raw: unknown): VoidConfig {
  if (!isPlainObject(raw)) {
    throw new Error(
      'void.config: expected default export to be an object literal',
    );
  }

  const out: VoidConfig = {};

  if ('atmospheres' in raw && raw.atmospheres !== undefined) {
    out.atmospheres = validateAtmosphereMap(raw.atmospheres, 'atmospheres');
  }

  if ('extendAtmospheres' in raw && raw.extendAtmospheres !== undefined) {
    out.extendAtmospheres = validateAtmosphereMap(
      raw.extendAtmospheres,
      'extendAtmospheres',
    );
  }

  if ('omitBuiltins' in raw && raw.omitBuiltins !== undefined) {
    out.omitBuiltins = validateOmitBuiltins(raw.omitBuiltins);
  }

  if ('fonts' in raw && raw.fonts !== undefined) {
    out.fonts = validateFonts(raw.fonts);
  }

  if ('fontAssignments' in raw && raw.fontAssignments !== undefined) {
    out.fontAssignments = validateFontAssignments(raw.fontAssignments);
  }

  if ('defaults' in raw && raw.defaults !== undefined) {
    out.defaults = validateDefaults(raw.defaults);
  }

  if ('outDir' in raw && raw.outDir !== undefined) {
    if (typeof raw.outDir !== 'string' || raw.outDir.length === 0) {
      throw new Error('void.config: outDir must be a non-empty string');
    }
    out.outDir = raw.outDir;
  }

  return out;
}

function validateAtmosphereMap(
  value: unknown,
  pathLabel: string,
): Record<string, AtmosphereDef> {
  if (!isPlainObject(value)) {
    throw new Error(`void.config: ${pathLabel} must be an object`);
  }
  const out: Record<string, AtmosphereDef> = {};
  for (const [name, def] of Object.entries(value)) {
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error(
        `void.config: ${pathLabel}.${name} — atmosphere names must match /^[a-zA-Z0-9_-]+$/`,
      );
    }
    out[name] = validateAtmosphereDef(def, `${pathLabel}.${name}`);
  }
  return out;
}

function validateAtmosphereDef(
  value: unknown,
  pathLabel: string,
): AtmosphereDef {
  if (!isPlainObject(value)) {
    throw new Error(`void.config: ${pathLabel} must be an object`);
  }

  const physics = value.physics;
  if (!isPhysics(physics)) {
    throw new Error(
      `void.config: ${pathLabel}.physics must be one of ${listQuoted(VALID_PHYSICS)} (got ${formatValue(physics)})`,
    );
  }

  const mode = value.mode;
  if (mode !== 'light' && mode !== 'dark') {
    throw new Error(
      `void.config: ${pathLabel}.mode must be "light" or "dark" (got ${formatValue(mode)})`,
    );
  }

  const tokens = value.tokens;
  if (!isPlainObject(tokens)) {
    throw new Error(
      `void.config: ${pathLabel}.tokens must be an object of string values`,
    );
  }
  const tokenMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(tokens)) {
    if (typeof v !== 'string') {
      throw new Error(
        `void.config: ${pathLabel}.tokens["${k}"] must be a string (got ${typeofLabel(v)})`,
      );
    }
    tokenMap[k] = v;
  }

  const out: AtmosphereDef = { physics, mode, tokens: tokenMap };

  if ('label' in value && value.label !== undefined) {
    if (typeof value.label !== 'string') {
      throw new Error(`void.config: ${pathLabel}.label must be a string`);
    }
    out.label = value.label;
  }

  if ('extends' in value && value.extends !== undefined) {
    if (typeof value.extends !== 'string' || value.extends.length === 0) {
      throw new Error(
        `void.config: ${pathLabel}.extends must be a non-empty string referencing another atmosphere`,
      );
    }
    out.extends = value.extends;
  }

  return out;
}

function validateOmitBuiltins(value: unknown): BuiltinName[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `void.config: omitBuiltins must be an array of built-in names (${listQuoted(BUILTINS)})`,
    );
  }
  const out: BuiltinName[] = [];
  for (let i = 0; i < value.length; i++) {
    const entry = value[i];
    if (typeof entry !== 'string' || !isBuiltinName(entry)) {
      throw new Error(
        `void.config: omitBuiltins[${i}] must be one of ${listQuoted(BUILTINS)} (got ${formatValue(entry)})`,
      );
    }
    out.push(entry);
  }
  return out;
}

function validateFonts(value: unknown): FontSource[] {
  if (!Array.isArray(value)) {
    throw new Error('void.config: fonts must be an array');
  }
  return value.map((entry, i) => validateFontSource(entry, `fonts[${i}]`));
}

function validateFontSource(value: unknown, pathLabel: string): FontSource {
  if (!isPlainObject(value)) {
    throw new Error(`void.config: ${pathLabel} must be an object`);
  }

  if (typeof value.family !== 'string' || value.family.length === 0) {
    throw new Error(
      `void.config: ${pathLabel}.family must be a non-empty string`,
    );
  }

  const src = validateFontSrc(value.src, `${pathLabel}.src`);

  const out: FontSource = { family: value.family, src };

  if ('weight' in value && value.weight !== undefined) {
    if (typeof value.weight !== 'string' && typeof value.weight !== 'number') {
      throw new Error(
        `void.config: ${pathLabel}.weight must be a string or number`,
      );
    }
    out.weight = value.weight;
  }

  if ('style' in value && value.style !== undefined) {
    if (!isMember(value.style, VALID_FONT_STYLE)) {
      throw new Error(
        `void.config: ${pathLabel}.style must be one of ${listQuoted(VALID_FONT_STYLE)}`,
      );
    }
    out.style = value.style;
  }

  if ('display' in value && value.display !== undefined) {
    if (!isMember(value.display, VALID_FONT_DISPLAY)) {
      throw new Error(
        `void.config: ${pathLabel}.display must be one of ${listQuoted(VALID_FONT_DISPLAY)}`,
      );
    }
    out.display = value.display;
  }

  if ('unicodeRange' in value && value.unicodeRange !== undefined) {
    if (typeof value.unicodeRange !== 'string') {
      throw new Error(
        `void.config: ${pathLabel}.unicodeRange must be a string`,
      );
    }
    out.unicodeRange = value.unicodeRange;
  }

  return out;
}

function validateFontSrc(
  value: unknown,
  pathLabel: string,
): string | FontSourceEntry[] {
  if (typeof value === 'string') {
    if (value.length === 0) {
      throw new Error(`void.config: ${pathLabel} must be a non-empty string`);
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      throw new Error(
        `void.config: ${pathLabel} must be a non-empty array when given as an array`,
      );
    }
    return value.map((entry, i) =>
      validateFontSrcEntry(entry, `${pathLabel}[${i}]`),
    );
  }
  throw new Error(
    `void.config: ${pathLabel} must be a string URL or an array of { url, format? } entries`,
  );
}

function validateFontSrcEntry(
  value: unknown,
  pathLabel: string,
): FontSourceEntry {
  if (!isPlainObject(value)) {
    throw new Error(
      `void.config: ${pathLabel} must be an object with { url, format? }`,
    );
  }
  if (typeof value.url !== 'string' || value.url.length === 0) {
    throw new Error(`void.config: ${pathLabel}.url must be a non-empty string`);
  }
  const out: FontSourceEntry = { url: value.url };
  if ('format' in value && value.format !== undefined) {
    if (!isMember(value.format, VALID_FONT_FORMAT)) {
      throw new Error(
        `void.config: ${pathLabel}.format must be one of ${listQuoted(VALID_FONT_FORMAT)}`,
      );
    }
    out.format = value.format;
  }
  return out;
}

function validateFontAssignments(value: unknown): FontAssignments {
  if (!isPlainObject(value)) {
    throw new Error('void.config: fontAssignments must be an object');
  }
  const out: FontAssignments = {};
  for (const key of ['heading', 'body', 'mono'] as const) {
    if (key in value && value[key] !== undefined) {
      if (
        typeof value[key] !== 'string' ||
        (value[key] as string).length === 0
      ) {
        throw new Error(
          `void.config: fontAssignments.${key} must be a non-empty string`,
        );
      }
      out[key] = value[key] as string;
    }
  }
  return out;
}

function validateDefaults(value: unknown): InitDefaults {
  if (!isPlainObject(value)) {
    throw new Error('void.config: defaults must be an object');
  }
  const out: InitDefaults = {};

  if ('atmosphere' in value && value.atmosphere !== undefined) {
    if (typeof value.atmosphere !== 'string' || value.atmosphere.length === 0) {
      throw new Error(
        'void.config: defaults.atmosphere must be a non-empty string',
      );
    }
    out.atmosphere = value.atmosphere;
  }

  if ('physics' in value && value.physics !== undefined) {
    if (!isPhysics(value.physics)) {
      throw new Error(
        `void.config: defaults.physics must be one of ${listQuoted(VALID_PHYSICS)}`,
      );
    }
    out.physics = value.physics;
  }

  if ('mode' in value && value.mode !== undefined) {
    if (!isMember(value.mode, VALID_MODE_INIT)) {
      throw new Error(
        `void.config: defaults.mode must be one of ${listQuoted(VALID_MODE_INIT)}`,
      );
    }
    out.mode = value.mode;
  }

  if ('density' in value && value.density !== undefined) {
    if (!isMember(value.density, VALID_DENSITY)) {
      throw new Error(
        `void.config: defaults.density must be one of ${listQuoted(VALID_DENSITY)}`,
      );
    }
    out.density = value.density;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.getPrototypeOf(new Map())
  );
}

function isPhysics(value: unknown): value is Physics {
  return value === 'glass' || value === 'flat' || value === 'retro';
}

function isBuiltinName(value: string): value is BuiltinName {
  return (BUILTINS as readonly string[]).includes(value);
}

function isMember<T extends readonly string[]>(
  value: unknown,
  list: T,
): value is T[number] {
  return (
    typeof value === 'string' && (list as readonly string[]).includes(value)
  );
}

function listQuoted(items: readonly string[]): string {
  return items.map((x) => `"${x}"`).join(' | ');
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object')
    return Array.isArray(value) ? 'array' : 'object';
  return String(value);
}

function typeofLabel(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

// Re-export constants used by tests and other modules.
export { BUILTINS, CANDIDATE_FILENAMES };
