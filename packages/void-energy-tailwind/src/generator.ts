/**
 * @void-energy/tailwind — Config → CSS + manifest generator.
 *
 * Pure transformation. Given a validated VoidConfig and the L0 built-in
 * atmosphere data, produces the exact string contents of
 * `<outDir>/void.generated.css` and `<outDir>/void.manifest.json`. No I/O.
 * No filesystem, no process, no DOM. Safe to call from any environment —
 * including tests, the Vite plugin, and the CLI (next PR).
 *
 * The split with loader.ts is load-bearing: the loader owns file reads and
 * shape validation; the generator owns transformation and topological
 * ordering. Tests drive the generator directly with fixture inputs, without
 * touching the filesystem.
 *
 * Merge semantics mirror `voidEngine.registerTheme` in L1: partial tokens
 * override a base map (SEMANTIC_DARK for dark mode, SEMANTIC_LIGHT for
 * light, or a resolved `extends` target), consumer keys win, unknown keys
 * pass through. Extends chains resolve topologically; cycles throw a clear
 * error naming the chain.
 */

import type {
  AtmosphereDef,
  FontAssignments,
  FontSource,
  FontSourceEntry,
  InitDefaults,
  Physics,
  VoidConfig,
} from './config.ts';

export interface ResolvedAtmosphere {
  physics: Physics;
  mode: 'light' | 'dark';
  label?: string;
  tokens: Record<string, string>;
}

export interface GeneratorBuiltins {
  /**
   * Fully-resolved built-in atmospheres. Each entry's `tokens` object should
   * already carry `--`-prefixed keys. The generator defensively normalises
   * anyway, so bare keys are accepted.
   */
  atmospheres: Record<string, ResolvedAtmosphere>;
  /** Base color map for atmospheres with `mode: 'dark'` and no `extends`. */
  semanticDark: Record<string, string>;
  /** Base color map for atmospheres with `mode: 'light'` and no `extends`. */
  semanticLight: Record<string, string>;
}

export interface ManifestEntry {
  source: 'builtin' | 'config';
  physics: Physics;
  mode: 'light' | 'dark';
  label?: string;
}

export interface GeneratedManifest {
  schemaVersion: 1;
  defaults: InitDefaults;
  atmospheres: Record<string, ManifestEntry>;
}

export interface GenerateResult {
  css: string;
  manifest: GeneratedManifest;
}

const SCHEMA_VERSION = 1 as const;

const SANS_FALLBACK = 'ui-sans-serif, system-ui, sans-serif';
const MONO_FALLBACK = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/**
 * Transform a consumer config plus L0 built-ins into a ready-to-write CSS
 * string and manifest object. Does no I/O; the caller writes the results.
 */
export function generate(
  config: VoidConfig,
  builtins: GeneratorBuiltins,
): GenerateResult {
  const directory = buildDirectory(config, builtins);
  const order = topoSort(directory, builtins);
  const resolved = resolveAll(order, directory, builtins);
  const css = emitCss(config, directory, resolved);
  const manifest = buildManifest(config, directory, resolved);
  return { css, manifest };
}

// ---------------------------------------------------------------------------
// Directory — the final set of atmospheres, tagged by source
// ---------------------------------------------------------------------------

type DirectoryEntry =
  | { name: string; source: 'builtin' }
  | { name: string; source: 'config'; def: AtmosphereDef };

function buildDirectory(
  config: VoidConfig,
  builtins: GeneratorBuiltins,
): Map<string, DirectoryEntry> {
  const dir = new Map<string, DirectoryEntry>();

  if (config.atmospheres) {
    // MODE A — full replacement. Built-ins are dropped entirely.
    for (const [name, def] of Object.entries(config.atmospheres)) {
      dir.set(name, { name, source: 'config', def });
    }
    return dir;
  }

  const omit = new Set(config.omitBuiltins ?? []);
  for (const name of Object.keys(builtins.atmospheres)) {
    if (!omit.has(name as never)) {
      dir.set(name, { name, source: 'builtin' });
    }
  }

  if (config.extendAtmospheres) {
    for (const [name, def] of Object.entries(config.extendAtmospheres)) {
      dir.set(name, { name, source: 'config', def });
    }
  }

  return dir;
}

// ---------------------------------------------------------------------------
// Topological sort over extends edges — rejects cycles
// ---------------------------------------------------------------------------

function topoSort(
  directory: Map<string, DirectoryEntry>,
  builtins: GeneratorBuiltins,
): string[] {
  // Only config entries can have extends edges. Builtins are always terminal.
  // We still return the full directory order so the caller can iterate once.
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const name of directory.keys()) color.set(name, WHITE);

  const out: string[] = [];

  // Deterministic traversal: sort root names alphabetically.
  const roots = [...directory.keys()].sort();

  const visit = (name: string, chain: string[]): void => {
    const c = color.get(name);
    if (c === BLACK) return;
    if (c === GRAY) {
      const cycleStart = chain.indexOf(name);
      const cycle = [...chain.slice(cycleStart), name].join(' → ');
      throw new Error(`void.config: extends cycle detected: ${cycle}`);
    }
    color.set(name, GRAY);

    const entry = directory.get(name);
    if (entry && entry.source === 'config' && entry.def.extends) {
      const target = entry.def.extends;
      const inDirectory = directory.has(target);
      const isBuiltin = target in builtins.atmospheres;
      if (!inDirectory && !isBuiltin) {
        throw new Error(
          `void.config: atmospheres.${name}.extends references unknown atmosphere "${target}"`,
        );
      }
      // If the extends target is a builtin that was dropped by MODE A or
      // omitBuiltins, resolve it against the raw builtin data anyway — the
      // consumer's intent is clear, and the dropped builtin's tokens are
      // still semantically available as a base.
      if (inDirectory) {
        visit(target, [...chain, name]);
      }
    }

    color.set(name, BLACK);
    out.push(name);
  };

  for (const name of roots) visit(name, []);
  return out;
}

// ---------------------------------------------------------------------------
// Resolve each atmosphere's final token set
// ---------------------------------------------------------------------------

function resolveAll(
  order: string[],
  directory: Map<string, DirectoryEntry>,
  builtins: GeneratorBuiltins,
): Map<string, ResolvedAtmosphere> {
  const resolved = new Map<string, ResolvedAtmosphere>();

  for (const name of order) {
    const entry = directory.get(name)!;

    if (entry.source === 'builtin') {
      const b = builtins.atmospheres[name];
      if (!b) {
        throw new Error(
          `void.config: internal: missing builtin data for "${name}"`,
        );
      }
      resolved.set(name, {
        physics: b.physics,
        mode: b.mode,
        label: b.label,
        tokens: normalizeKeys(b.tokens),
      });
      continue;
    }

    const def = entry.def;
    const base = resolveBase(def, resolved, builtins);
    const tokens = { ...base, ...normalizeKeys(def.tokens) };
    resolved.set(name, {
      physics: def.physics,
      mode: def.mode,
      label: def.label,
      tokens,
    });
  }

  return resolved;
}

function resolveBase(
  def: AtmosphereDef,
  resolved: Map<string, ResolvedAtmosphere>,
  builtins: GeneratorBuiltins,
): Record<string, string> {
  if (def.extends) {
    const fromResolved = resolved.get(def.extends);
    if (fromResolved) return fromResolved.tokens;
    // Builtin that was dropped from the directory (MODE A or omitBuiltins).
    // Use its raw data as a base so the consumer's intent survives.
    const raw = builtins.atmospheres[def.extends];
    if (raw) return normalizeKeys(raw.tokens);
    throw new Error(
      `void.config: extends target "${def.extends}" is not a registered atmosphere`,
    );
  }
  const seed =
    def.mode === 'dark' ? builtins.semanticDark : builtins.semanticLight;
  return normalizeKeys(seed);
}

function normalizeKeys(tokens: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tokens)) {
    const key = k.startsWith('--') ? k : `--${k}`;
    out[key] = v;
  }
  return out;
}

// ---------------------------------------------------------------------------
// CSS emission — deterministic output for golden snapshots
// ---------------------------------------------------------------------------

function emitCss(
  config: VoidConfig,
  directory: Map<string, DirectoryEntry>,
  resolved: Map<string, ResolvedAtmosphere>,
): string {
  const parts: string[] = [];
  parts.push(
    '/* void.generated.css — generated by @void-energy/tailwind. Do not edit. */',
  );

  const fontFaces = emitFontFaces(config.fonts ?? []);
  if (fontFaces) parts.push(fontFaces);

  const fontAssigns = emitFontAssignments(config.fontAssignments);
  if (fontAssigns) parts.push(fontAssigns);

  // Only config-source atmospheres emit CSS blocks. Built-ins ship as part of
  // the L0 package's own atmosphere/*.css files and are already in-scope via
  // @void-energy/tailwind/theme.css.
  const configNames = [...directory.values()]
    .filter((e) => e.source === 'config')
    .map((e) => e.name)
    .sort();

  for (const name of configNames) {
    const a = resolved.get(name);
    if (!a) continue;
    parts.push(emitAtmosphereBlock(name, a.tokens));
  }

  return parts.join('\n\n') + '\n';
}

function emitFontFaces(fonts: FontSource[]): string {
  if (fonts.length === 0) return '';
  const deduped = dedupeFonts(fonts);
  const blocks: string[] = [];
  for (const font of deduped) {
    const lines: string[] = [];
    lines.push('@font-face {');
    lines.push(`  font-family: ${quoteFamily(font.family)};`);
    lines.push(`  src: ${emitFontSrc(font.src)};`);
    if (font.weight !== undefined) {
      lines.push(`  font-weight: ${String(font.weight)};`);
    }
    if (font.style !== undefined) {
      lines.push(`  font-style: ${font.style};`);
    }
    lines.push(`  font-display: ${font.display ?? 'swap'};`);
    if (font.unicodeRange !== undefined) {
      lines.push(`  unicode-range: ${font.unicodeRange};`);
    }
    lines.push('}');
    blocks.push(lines.join('\n'));
  }
  return blocks.join('\n\n');
}

/**
 * Collapse duplicate `fonts[]` entries by (family, weight, style). Last wins.
 * A browser can't pick between two `@font-face` blocks that declare the same
 * triple — the cascade just layers them and whichever loads last displaces
 * the other. Silent wins behind the user's back are confusing, so we log a
 * one-line warning naming each dropped family.
 */
function dedupeFonts(fonts: FontSource[]): FontSource[] {
  const byKey = new Map<string, FontSource>();
  const duplicates = new Set<string>();
  for (const font of fonts) {
    const key = `${font.family}|${font.weight ?? ''}|${font.style ?? ''}`;
    if (byKey.has(key)) duplicates.add(key);
    byKey.set(key, font);
  }
  if (duplicates.size > 0) {
    for (const key of duplicates) {
      const [family, weight, style] = key.split('|');
      // eslint-disable-next-line no-console
      console.warn(
        `[@void-energy/tailwind] duplicate font entry — family="${family}" weight="${weight || 'default'}" style="${style || 'normal'}". Last entry wins.`,
      );
    }
  }
  return Array.from(byKey.values());
}

function emitFontSrc(src: string | FontSourceEntry[]): string {
  if (typeof src === 'string') {
    const format = inferFormat(src);
    return format ? `url('${src}') format('${format}')` : `url('${src}')`;
  }
  const pieces = src.map((entry) => {
    const format = entry.format ?? inferFormat(entry.url);
    return format
      ? `url('${entry.url}') format('${format}')`
      : `url('${entry.url}')`;
  });
  return pieces.join(', ');
}

function inferFormat(url: string): string | null {
  const match = /\.([a-zA-Z0-9]+)(?:$|\?|#)/.exec(url);
  if (!match) return null;
  const ext = match[1].toLowerCase();
  switch (ext) {
    case 'woff2':
      return 'woff2';
    case 'woff':
      return 'woff';
    case 'ttf':
      return 'truetype';
    case 'otf':
      return 'opentype';
    case 'eot':
      return 'embedded-opentype';
    default:
      return null;
  }
}

function quoteFamily(family: string): string {
  // Always quote. Consumers pass display names ("Space Grotesk"); single-word
  // names still parse fine quoted and we avoid a per-call tokenization check.
  return `'${family}'`;
}

function emitFontAssignments(assignments: FontAssignments | undefined): string {
  if (!assignments) return '';
  const lines: string[] = [];
  if (assignments.heading) {
    lines.push(
      `  --font-heading: ${quoteFamily(assignments.heading)}, ${SANS_FALLBACK};`,
    );
  }
  if (assignments.body) {
    lines.push(
      `  --font-body: ${quoteFamily(assignments.body)}, ${SANS_FALLBACK};`,
    );
  }
  if (assignments.mono) {
    lines.push(
      `  --font-mono: ${quoteFamily(assignments.mono)}, ${MONO_FALLBACK};`,
    );
  }
  if (lines.length === 0) return '';
  return `:root {\n${lines.join('\n')}\n}`;
}

function emitAtmosphereBlock(
  name: string,
  tokens: Record<string, string>,
): string {
  const lines: string[] = [];
  lines.push(`[data-atmosphere='${name}'] {`);
  const keys = Object.keys(tokens).sort();
  for (const key of keys) {
    lines.push(`  ${key}: ${tokens[key]};`);
  }
  lines.push('}');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

function buildManifest(
  config: VoidConfig,
  directory: Map<string, DirectoryEntry>,
  resolved: Map<string, ResolvedAtmosphere>,
): GeneratedManifest {
  const atmospheres: Record<string, ManifestEntry> = {};
  const names = [...directory.keys()].sort();
  for (const name of names) {
    const entry = directory.get(name)!;
    const r = resolved.get(name);
    if (!r) continue;
    const m: ManifestEntry = {
      source: entry.source,
      physics: r.physics,
      mode: r.mode,
    };
    if (r.label !== undefined) m.label = r.label;
    atmospheres[name] = m;
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    defaults: { ...(config.defaults ?? {}) },
    atmospheres,
  };
}
