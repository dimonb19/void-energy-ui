/*
 * DESIGN.md <-> VE atmosphere converter.
 *
 * Pure functions, no Svelte, no DOM. Serializes a VoidThemeDefinition to a
 * DESIGN.md document (YAML frontmatter + markdown sections) and parses a
 * DESIGN.md document back to a PartialThemeDefinition payload suitable for
 * voidEngine.registerTheme().
 *
 * Frontmatter is flat key: value only. No nesting, no arrays, no multi-line
 * strings. That covers the atmosphere metadata (id, mode, physics, tagline,
 * label) without pulling in a YAML dependency. Bodies use two canonical
 * sections: "## Colors" (pipe table) and "## Typography" (bulleted list).
 *
 * Round-trip guarantee: serialize(def) -> parse(...) returns a
 * PartialThemeDefinition whose fields equal def's (modulo the optional
 * fields that weren't set).
 */

import { parseExternalThemePayload } from '@lib/boundary';
import { err, ok } from '@lib/result';

// Palette keys in canonical emit order. Parsing accepts any order and
// whitespace; this order is only for deterministic serialization.
const PALETTE_KEYS: ReadonlyArray<keyof VoidPalette> = [
  'bg-canvas',
  'bg-spotlight',
  'bg-surface',
  'bg-sunk',
  'energy-primary',
  'energy-secondary',
  'border-color',
  'text-main',
  'text-dim',
  'text-mute',
  'color-premium',
  'color-premium-light',
  'color-premium-dark',
  'color-premium-subtle',
  'color-system',
  'color-system-light',
  'color-system-dark',
  'color-system-subtle',
  'color-success',
  'color-success-light',
  'color-success-dark',
  'color-success-subtle',
  'color-error',
  'color-error-light',
  'color-error-dark',
  'color-error-subtle',
  'font-atmos-heading',
  'font-atmos-body',
];

const COLOR_PALETTE_KEYS = PALETTE_KEYS.filter(
  (key) => !key.startsWith('font-atmos-'),
);

// Frontmatter fields VE actually round-trips. Anything else is ignored on
// import (forward-compat) and not emitted on export.
const FRONTMATTER_STRING_FIELDS = [
  'id',
  'name',
  'label',
  'tagline',
  'mode',
  'physics',
] as const;

export interface SerializeOptions {
  /** Override the emitted id. Defaults to `definition.id`. */
  id?: string;
  /** Override the emitted display name. Defaults to `definition.label ?? id`. */
  name?: string;
}

/**
 * Emit a DESIGN.md document describing a single VE atmosphere.
 */
export function serializeAtmosphereToDesignMd(
  definition: VoidThemeDefinition,
  options: SerializeOptions = {},
): string {
  const id = options.id ?? definition.id ?? 'atmosphere';
  const name = options.name ?? definition.label ?? id;
  const palette = definition.palette;

  const frontmatter: string[] = ['---', `id: ${id}`, `name: ${name}`];
  if (definition.label) frontmatter.push(`label: ${definition.label}`);
  if (definition.tagline) frontmatter.push(`tagline: ${definition.tagline}`);
  frontmatter.push(`mode: ${definition.mode}`);
  frontmatter.push(`physics: ${definition.physics}`);
  frontmatter.push('---');

  const colorRows = COLOR_PALETTE_KEYS.map(
    (key) => `| ${key} | ${palette[key]} |`,
  );

  const sections = [
    `# ${name}`,
    '',
    '## Colors',
    '',
    '| Token | Value |',
    '| --- | --- |',
    ...colorRows,
    '',
    '## Typography',
    '',
    `- Heading font: \`${palette['font-atmos-heading']}\``,
    `- Body font: \`${palette['font-atmos-body']}\``,
    '',
  ];

  return `${frontmatter.join('\n')}\n\n${sections.join('\n')}`;
}

interface ParsedDocument {
  frontmatter: Record<string, string>;
  body: string;
}

function splitFrontmatter(content: string): ParsedDocument | null {
  // A valid document starts with `---` followed by a newline, then key/value
  // lines, then a closing `---` on its own line. Accept LF or CRLF.
  const normalized = content.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return null;

  const rest = normalized.slice(4);
  const endMarker = rest.indexOf('\n---');
  if (endMarker === -1) return null;

  const fmBlock = rest.slice(0, endMarker);
  const body = rest.slice(endMarker + 4).replace(/^\n/, '');

  const frontmatter: Record<string, string> = {};
  for (const rawLine of fmBlock.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    // Strip matched surrounding quotes if present.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) frontmatter[key] = value;
  }

  return { frontmatter, body };
}

function extractSection(body: string, heading: string): string | null {
  const lines = body.split('\n');
  const headingPattern = new RegExp(`^##\\s+${heading}\\s*$`, 'i');
  const nextHeadingPattern = /^#{1,2}\s+/;
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingPattern.test(lines[i])) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    if (nextHeadingPattern.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

function parseColorTable(section: string): Record<string, string> {
  const palette: Record<string, string> = {};
  for (const rawLine of section.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('|')) continue;
    // Skip header separator rows like `| --- | --- |`
    if (/^\|\s*-{3,}/.test(line)) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 2) continue;
    const [token, value] = cells;
    if (!token || !value) continue;
    if (token.toLowerCase() === 'token') continue; // header
    palette[token] = value;
  }
  return palette;
}

function parseTypographyList(section: string): {
  heading?: string;
  body?: string;
} {
  const out: { heading?: string; body?: string } = {};
  for (const rawLine of section.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('- ')) continue;
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const label = line.slice(2, colon).trim().toLowerCase();
    let value = line.slice(colon + 1).trim();
    if (value.startsWith('`') && value.endsWith('`')) {
      value = value.slice(1, -1);
    }
    if (label.startsWith('heading')) out.heading = value;
    else if (label.startsWith('body')) out.body = value;
  }
  return out;
}

/**
 * Parse a DESIGN.md document into a PartialThemeDefinition payload.
 *
 * Missing palette keys are allowed (Safety Merge fills them in downstream
 * via voidEngine.registerTheme). Missing id / mode / physics yields an
 * invalid_shape error because they can't be safely defaulted.
 */
export function parseDesignMd(
  content: string,
  source = 'DESIGN.md',
): VoidResult<
  { id: string; definition: PartialThemeDefinition },
  BoundaryError
> {
  const doc = splitFrontmatter(content);
  if (!doc) {
    return err({
      code: 'invalid_shape',
      source,
      message: 'Missing or malformed YAML frontmatter.',
      issues: ['Document must start with a `---` delimited frontmatter block.'],
    });
  }

  const { frontmatter, body } = doc;

  for (const key of Object.keys(frontmatter)) {
    if (
      !(FRONTMATTER_STRING_FIELDS as readonly string[]).includes(key) &&
      key !== 'version'
    ) {
      // Unknown frontmatter keys are tolerated for forward-compat; they
      // pass through silently rather than failing the parse.
      delete frontmatter[key];
    }
  }

  const palette: Record<string, string> = {};

  const colorsSection = extractSection(body, 'Colors');
  if (colorsSection) {
    Object.assign(palette, parseColorTable(colorsSection));
  }

  const typographySection = extractSection(body, 'Typography');
  if (typographySection) {
    const fonts = parseTypographyList(typographySection);
    if (fonts.heading) palette['font-atmos-heading'] = fonts.heading;
    if (fonts.body) palette['font-atmos-body'] = fonts.body;
  }

  // Build a payload that matches ExternalThemePayloadSchema so we reuse the
  // existing zod validation surface instead of duplicating rules here.
  const payload: Record<string, unknown> = {};
  payload.id = frontmatter.id ?? '';
  if (frontmatter.label) payload.label = frontmatter.label;
  else if (frontmatter.name) payload.label = frontmatter.name;
  if (frontmatter.tagline) payload.tagline = frontmatter.tagline;
  if (frontmatter.mode) payload.mode = frontmatter.mode;
  if (frontmatter.physics) payload.physics = frontmatter.physics;
  payload.palette = palette;

  return parseExternalThemePayload(payload, source);
}
