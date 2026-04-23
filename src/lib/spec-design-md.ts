/*
 * DESIGN.md spec-compliant exporter for the Frost atmosphere.
 *
 * Produces a Google `@google/design.md`-spec-flavored document describing
 * Void Energy's visual identity via the Frost palette (dark, glass). Lossy
 * by design: it maps VE tokens to Google's vocabulary, flattens alpha
 * against committed compositing backgrounds, and emits a YAML frontmatter
 * + prose document.
 *
 * This is a SEPARATE exporter from src/lib/atmosphere-md.ts:
 *   - atmosphere-md.ts — VE-internal, lossless, per-atmosphere round-trip
 *   - spec-design-md.ts — external, lossy, single-snapshot (Frost only)
 *
 * The prose body is a template literal at the top of the module. Keeping
 * prose here (instead of a separate .md.template file) simplifies the
 * regenerability invariant: one file to diff, one exporter to run.
 *
 * Hex values in the frontmatter table are either verbatim from
 * src/config/atmospheres.ts (Frost palette) or computed by flattenAlpha
 * against a locked compositing background. See tests/spec-design-md.test.ts
 * for the flattenAlpha fixture that pins the math.
 */

import { VOID_TOKENS } from '@config/design-tokens';

// ---------------------------------------------------------------------------
// Alpha flattening
// ---------------------------------------------------------------------------

const RGBA_PATTERN =
  /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/i;
const HEX_PATTERN = /^#([0-9a-f]{6})$/i;

function parseRgba(input: string): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  const match = input.trim().match(RGBA_PATTERN);
  if (!match) {
    throw new Error(
      `flattenAlpha: expected rgba(R, G, B, A) with an alpha channel, got "${input}".`,
    );
  }
  const [, r, g, b, a] = match;
  return {
    r: Number(r),
    g: Number(g),
    b: Number(b),
    a: Number(a),
  };
}

function parseHex(input: string): { r: number; g: number; b: number } {
  const match = input.trim().match(HEX_PATTERN);
  if (!match) {
    throw new Error(
      `flattenAlpha: expected a 6-character #RRGGBB hex, got "${input}".`,
    );
  }
  const h = match[1];
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function toHexByte(n: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(n)));
  return clamped.toString(16).padStart(2, '0').toUpperCase();
}

/**
 * Composite an rgba source over a solid hex background in sRGB space and
 * return the resulting #RRGGBB (uppercase).
 *
 * out = src * alpha + bg * (1 - alpha), per channel, rounded, clamped to [0, 255].
 *
 * sRGB-linear blending would differ by 1-2 points per channel in midtones.
 * For a design-system solid fallback this is standard and acceptable.
 */
export function flattenAlpha(rgba: string, bgHex: string): string {
  const src = parseRgba(rgba);
  const bg = parseHex(bgHex);
  const a = src.a;
  const r = src.r * a + bg.r * (1 - a);
  const g = src.g * a + bg.g * (1 - a);
  const b = src.b * a + bg.b * (1 - a);
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

// ---------------------------------------------------------------------------
// Canonical token mapping (Frost → Google spec vocabulary)
// ---------------------------------------------------------------------------

interface FrostSourceValues {
  energyPrimary: string;
  energySecondary: string;
  textMute: string;
  bgSpotlight: string;
  bgCanvas: string;
  textMain: string;
  textDim: string;
  borderColorAlpha: string;
  bgSurfaceAlpha: string;
  colorError: string;
  fontHeading: string;
  fontBody: string;
}

function readFrostSource(): FrostSourceValues {
  const frost = VOID_TOKENS.themes.frost;
  if (!frost) {
    throw new Error(
      'spec-design-md: Frost atmosphere not found in VOID_TOKENS.themes.frost',
    );
  }
  const p = frost.palette;
  return {
    energyPrimary: p['energy-primary'],
    energySecondary: p['energy-secondary'],
    textMute: p['text-mute'],
    bgSpotlight: p['bg-spotlight'],
    bgCanvas: p['bg-canvas'],
    textMain: p['text-main'],
    textDim: p['text-dim'],
    borderColorAlpha: p['border-color'],
    bgSurfaceAlpha: p['bg-surface'],
    colorError: p['color-error'],
    fontHeading: p['font-atmos-heading'],
    fontBody: p['font-atmos-body'],
  };
}

interface SpecColors {
  primary: string;
  secondary: string;
  neutral: string;
  surface: string;
  'surface-container': string;
  'on-surface': string;
  'on-surface-variant': string;
  outline: string;
  error: string;
}

function computeSpecColors(src: FrostSourceValues): SpecColors {
  return {
    primary: src.energyPrimary,
    secondary: src.energySecondary,
    neutral: src.textMute,
    // Solid approximation — bg-spotlight is Frost's canonical ambient layer
    // beneath floating glass surfaces. Emitting a flattened mix of
    // bg-surface (rgba 0.45) would invent a color that never appears.
    surface: src.bgSpotlight,
    'surface-container': src.bgCanvas,
    'on-surface': src.textMain,
    'on-surface-variant': src.textDim,
    // Border sits on top of glass surface; glass surface approximates to
    // bg-spotlight. Flatten border-color against bg-spotlight.
    outline: flattenAlpha(src.borderColorAlpha, src.bgSpotlight),
    error: src.colorError,
  };
}

// ---------------------------------------------------------------------------
// Frontmatter emission
// ---------------------------------------------------------------------------

function emitColors(c: SpecColors): string {
  const lines = [
    'colors:',
    `  primary: "${c.primary}"`,
    `  secondary: "${c.secondary}"`,
    `  neutral: "${c.neutral}"`,
    `  surface: "${c.surface}"`,
    `  surface-container: "${c['surface-container']}"`,
    `  on-surface: "${c['on-surface']}"`,
    `  on-surface-variant: "${c['on-surface-variant']}"`,
    `  outline: "${c.outline}"`,
    `  error: "${c.error}"`,
  ];
  return lines.join('\n');
}

function emitTypography(heading: string, body: string): string {
  const h = heading;
  const b = body;
  return [
    'typography:',
    '  display-lg:',
    `    fontFamily: "${h}"`,
    '    fontSize: 56px',
    '    fontWeight: 700',
    '    lineHeight: 1.1',
    '    letterSpacing: "-0.02em"',
    '  headline-lg:',
    `    fontFamily: "${h}"`,
    '    fontSize: 40px',
    '    fontWeight: 600',
    '    lineHeight: 1.15',
    '    letterSpacing: "-0.015em"',
    '  headline-md:',
    `    fontFamily: "${h}"`,
    '    fontSize: 32px',
    '    fontWeight: 600',
    '    lineHeight: 1.2',
    '    letterSpacing: "-0.01em"',
    '  headline-sm:',
    `    fontFamily: "${h}"`,
    '    fontSize: 24px',
    '    fontWeight: 600',
    '    lineHeight: 1.3',
    '  body-lg:',
    `    fontFamily: "${b}"`,
    '    fontSize: 18px',
    '    fontWeight: 400',
    '    lineHeight: 1.5',
    '  body-md:',
    `    fontFamily: "${b}"`,
    '    fontSize: 16px',
    '    fontWeight: 400',
    '    lineHeight: 1.5',
    '  body-sm:',
    `    fontFamily: "${b}"`,
    '    fontSize: 14px',
    '    fontWeight: 400',
    '    lineHeight: 1.5',
    '  label-md:',
    `    fontFamily: "${b}"`,
    '    fontSize: 14px',
    '    fontWeight: 500',
    '    lineHeight: 1.4',
    '    letterSpacing: "0.02em"',
    '  label-sm:',
    `    fontFamily: "${b}"`,
    '    fontSize: 12px',
    '    fontWeight: 500',
    '    lineHeight: 1.4',
    '    letterSpacing: "0.02em"',
  ].join('\n');
}

const SPACING_YAML = [
  'spacing:',
  '  xs: 8px',
  '  sm: 16px',
  '  md: 24px',
  '  lg: 32px',
  '  xl: 48px',
  '  "2xl": 64px',
  '  "3xl": 96px',
  '  "4xl": 128px',
  '  "5xl": 160px',
].join('\n');

const ROUNDED_YAML = [
  'rounded:',
  '  sm: 4px',
  '  md: 8px',
  '  lg: 16px',
  '  xl: 24px',
  '  full: 9999px',
].join('\n');

const COMPONENTS_YAML = [
  'components:',
  '  button-primary:',
  '    backgroundColor: "{colors.primary}"',
  '    textColor: "{colors.surface-container}"',
  '    rounded: "{rounded.full}"',
  '    padding: 16px',
  '    typography: "{typography.label-md}"',
  '  button-primary-hover:',
  '    backgroundColor: "{colors.primary}"',
  '    textColor: "{colors.surface-container}"',
  '  button-secondary:',
  '    backgroundColor: "{colors.secondary}"',
  '    textColor: "{colors.on-surface}"',
  '    rounded: "{rounded.full}"',
  '    padding: 16px',
  '    typography: "{typography.label-md}"',
  '  button-tertiary:',
  '    backgroundColor: "{colors.surface-container}"',
  '    textColor: "{colors.on-surface-variant}"',
  '    rounded: "{rounded.full}"',
  '    padding: 16px',
  '    typography: "{typography.label-md}"',
  '  text-disabled:',
  '    textColor: "{colors.neutral}"',
  '    typography: "{typography.body-sm}"',
  '  button-error:',
  '    backgroundColor: "{colors.error}"',
  '    textColor: "{colors.surface-container}"',
  '    rounded: "{rounded.full}"',
  '    padding: 16px',
  '    typography: "{typography.label-md}"',
  '  input:',
  '    backgroundColor: "{colors.surface}"',
  '    textColor: "{colors.on-surface}"',
  '    rounded: "{rounded.md}"',
  '    padding: 12px',
  '    typography: "{typography.body-md}"',
  '  card:',
  '    backgroundColor: "{colors.surface}"',
  '    textColor: "{colors.on-surface}"',
  '    rounded: "{rounded.md}"',
  '    padding: 32px',
  '  divider:',
  '    backgroundColor: "{colors.outline}"',
  '    height: 1px',
].join('\n');

const DESCRIPTION =
  'Void Energy — Frost atmosphere. A dark, glass-morphism design system ' +
  'built on translucent surfaces over an indigo ambient backdrop. Space ' +
  'Grotesk for headings, Inter for body. Generous whitespace, sentence-case ' +
  'controls, semantic color tokens. This snapshot describes one of several ' +
  'atmospheres; the live system is physics-reactive (glass / flat / retro) ' +
  'and mode-aware (light / dark). See https://void.dgrslabs.ink for the full runtime.';

export function serializeFrostSpecFrontmatter(): string {
  const src = readFrostSource();
  const colors = computeSpecColors(src);
  const body: string[] = [
    '---',
    'name: Void Energy',
    'version: alpha',
    `description: ${DESCRIPTION}`,
    '',
    emitColors(colors),
    '',
    emitTypography(src.fontHeading, src.fontBody),
    '',
    SPACING_YAML,
    '',
    ROUNDED_YAML,
    '',
    COMPONENTS_YAML,
    '---',
  ];
  return body.join('\n');
}

// ---------------------------------------------------------------------------
// Prose body
// ---------------------------------------------------------------------------

const PROSE_TEMPLATE = `# Void Energy

Void Energy is a dark, glass-morphism design system built around physics-reactive surfaces. This document describes the **Frost** atmosphere — the arctic, indigo-and-ice variant that ships as one of four defaults. Frost is a dark-only, glass-physics theme; the live Void Energy runtime supports additional atmospheres and physics presets (flat, retro) that are not captured in this single snapshot.

## Overview

The Frost aesthetic is **arctic glass**: floating translucent surfaces sit over a deep indigo ambient layer, lit by a soft ice-blue accent. The mood is calm, precise, and spacious — think a weather app at dawn rather than a hacker terminal. Headings are set in Space Grotesk to give the system a subtly futurist posture; body copy is Inter, chosen for its neutrality at small sizes.

Two principles govern everything below:

1. **Generous whitespace over dense packing.** Surfaces breathe. When a gap feels tight, go one size up rather than down. Void Energy's spacing scale is intentionally wide (8 → 160px) so that choosing too small is always an option, not a forced compromise.
2. **Sentence-case controls over uppercase shouting.** Buttons, inputs, and labels use natural sentence case with medium weight. The uppercase-plus-wide-tracking treatment is reserved for the rare CTA that genuinely needs a shout — never applied by default to metrics, chrome, or dashboard cards.

## Colors

The Frost palette is built on three layers:

- **Ice blue primary (#7ec8e3)** — the single interactive accent. Used for buttons, links, focused inputs, and selection states. Do not repurpose it for decoration.
- **Deep steel secondary (#4a6fa5)** — a muted companion for secondary actions, charts, and data-series 2. Always distinguishable from the primary; never a competing focal point.
- **Indigo surface stack** — three background layers that convey depth:
  - \`surface-container\` (\`#080c14\`) — the page canvas, nearly black with a violet cast.
  - \`surface\` (\`#141c2e\`) — the solid approximation of Frost's floating glass surface. In the live runtime, glass surfaces are \`rgba(20, 30, 50, 0.45)\` with \`backdrop-filter: blur(20px)\`; \`#141c2e\` is the fallback when backdrop-filter is unavailable or the agent is compositing against a static canvas.
  - \`outline\` (\`#293E52\`) — the solid fallback for Frost's glass border (\`rgba(126, 200, 227, 0.2)\` in the live runtime). Low-contrast by design: borders should whisper structure, not shout.

Text forms a descending-contrast hierarchy:

- \`on-surface\` (\`#edf2f7\`) — primary text. WCAG AA against all surface layers.
- \`on-surface-variant\` (\`#a0b0c0\`) — secondary text, captions, metadata.
- \`neutral\` (\`#607080\`) — the most faded weight, used for disabled states and tertiary hints.

Semantic signal colors:

- \`error\` (\`#ff3c40\`) — destructive actions, validation failures. Reserved for genuinely negative states; do not use for warnings or info.

### Glass surface details (live runtime)

In the actual Void Energy runtime, Frost surfaces render as:

- **Background:** \`rgba(20, 30, 50, 0.45) + backdrop-filter: blur(20px)\`
- **Border:** \`1px solid rgba(126, 200, 227, 0.2)\`
- **Fallback (when backdrop-filter unavailable):** solid \`#141c2e\` surface, solid \`#293E52\` border

Agents building Frost-inspired UI without a real runtime should prefer the solid fallback. The glass effect requires a real backdrop to refract — on a static mock, translucency reads as muddy rather than crisp.

## Typography

Frost pairs two families:

- **Space Grotesk** — headings, display copy, anything load-bearing. Subtly geometric without being cold. Use weights 600–700 for headings.
- **Inter** — body, labels, UI chrome. A workhorse chosen for neutrality and readability at 14–18px.

The scale (from the frontmatter) covers nine levels: display-lg through label-sm. Default to \`body-md\` (16px Inter regular) for most prose. Default to \`headline-md\` (32px Space Grotesk semibold) for section titles. Reserve \`display-lg\` (56px) for hero moments — one per page, not per section.

**Do not** set uppercase-plus-letter-spacing as a default label style. Labels ship as sentence case with a modest \`0.02em\` letter-spacing for optical refinement; they are not meant to read as shouts. Uppercase is an intentional, infrequent choice.

## Layout & Spacing

Frost uses an **8px base grid** with a wide scale:

- **Component level** (tight): xs (8), sm (16), md (24), lg (32)
- **Layout level** (accelerated): xl (48), 2xl (64), 3xl (96), 4xl (128), 5xl (160)

Apply them along two axes:

1. **Surface padding floor.** Floating surfaces use \`lg\` (32px) minimum padding and \`lg\` inner gaps. Sunk/inset surfaces drop to \`md\` (24px). Never use \`sm\` or \`xs\` on a floating card — it reads as claustrophobic under glass.
2. **Layout gaps.** Page sections use \`2xl\` (64px) between them. Content blocks inside a section use \`xl\` (48px). Grouped controls inside a block use \`md\` (24px). Tight couplings (label → input, icon + text) use \`xs\` (8px) and nothing between.

The scale density-scales at runtime: Compact (×0.75), Standard (×1), Comfortable (×1.25). Agents emitting static HTML should assume Standard.

## Elevation & Depth

Frost does not use traditional shadows. Depth is conveyed through three layers of tonal contrast plus backdrop blur:

- **Canvas (floor):** \`surface-container\` — the page background.
- **Raised:** \`surface\` with a 1px translucent outline. In the live runtime this is a glass layer with \`backdrop-filter: blur(20px)\`; on static snapshots use the solid fallback.
- **Lifted (hover):** surfaces gain a -3px Y translation and 1.02× scale. Agents generating static UI should omit the lift state unless the design calls for a hover mock.

Shadows are not a Frost primitive. If an agent adds a drop shadow to an ostensibly Frost surface, that UI is no longer Frost — it has drifted toward a flat-material aesthetic.

## Shapes

Frost uses an 8px default corner radius (\`rounded.md\`) on surfaces and inputs, and pill radius (\`rounded.full\`) on buttons. The radius scale is continuous: sm (4), md (8), lg (16), xl (24), full (9999).

**Do not mix sharp and rounded corners in the same view.** Frost is consistently soft. Sharp corners belong to the retro atmosphere, which force-zeros every radius.

## Components

The frontmatter \`components\` block covers the canonical atoms. A few notes on applying them:

### Buttons

- \`button-primary\` — pill-shaped, ice-blue background, deep-indigo text. Used for the single most important action per view. Sentence case. Medium weight. 36px desktop height (not in frontmatter — it's a runtime dimension). Never uppercase by default.
- \`button-secondary\` — pill-shaped, steel-blue background, light text. Used for secondary actions alongside a primary.
- \`button-tertiary\` — pill-shaped, surface-container background, light text. The quietest button; for cancel, dismiss, and tertiary navigation.

A \`button-primary-hover\` variant is defined; in a static mock, ignore it unless explicitly rendering a hover state.

### Inputs

- \`input\` — 8px radius, surface background, body-md typography. 12px padding. Height matches control height (36px desktop in the live runtime).

Inputs are built on native \`<input>\` and \`<select>\` elements with SCSS providing the visual treatment. Agents rebuilding Void Energy UI should wrap natives rather than synthesize custom combobox/dropdown machinery.

### Cards

- \`card\` — 8px radius, surface background, generous 32px padding (\`lg\`). Use as the default container for content groups.

## Do's and Don'ts

**Do:**

- Use \`primary\` for exactly one action per view — the single most important one.
- Default to sentence case on buttons and labels. Uppercase is a choice, not a default.
- Maintain WCAG AA contrast (4.5:1 for body text). The Frost palette passes AA by construction; mixing custom colors risks breaking it.
- Apply \`lg\` (32px) padding minimum to cards. Generosity over density.
- Wrap native \`<button>\`, \`<input>\`, \`<select>\` elements rather than rebuilding interaction from \`<div>\`.

**Don't:**

- Don't add drop shadows to Frost surfaces. Frost conveys depth through tonal layers and backdrop blur, not shadows.
- Don't style a dashboard metric card with uppercase-plus-letter-spacing. That was a draft-era mistake; Frost's default is sentence case at medium weight.
- Don't mix sharp and rounded corners in the same view. Frost is consistently soft-cornered.
- Don't use \`error\` for warnings. Error is reserved for destructive and failure states; warnings get their own softer signal in the full Void Energy palette.
- Don't use \`neutral\` for body text. It is for disabled states and tertiary hints only.
- Don't repurpose \`primary\` for decoration. It is a load-bearing interaction signal.

## Responsive Behavior

Void Energy is mobile-first. Breakpoints:

- **mobile** 0px (default)
- **tablet** 768px
- **desktop** 1024px

Spacing, control heights, and typography all density-scale at runtime. Static snapshots should assume Standard density and Desktop breakpoint unless otherwise indicated.

Touch targets have a floor: \`--size-touch-min\` is 44px on coarse pointers (mobile/tablet) and 36px on fine pointers (desktop). Do not emit interactive controls smaller than this floor.

## Agent Prompt Guide

When asked to build UI "in the Frost aesthetic," default to these choices:

- **Backgrounds:** \`surface-container\` (\`#080c14\`) for the page canvas; \`surface\` (\`#141c2e\`) for floating cards. If the runtime supports \`backdrop-filter\`, apply \`rgba(20, 30, 50, 0.45) + blur(20px)\` for genuine glass; otherwise use the solid fallback.
- **Text:** \`on-surface\` for primary, \`on-surface-variant\` for secondary.
- **Accents:** \`primary\` for the single most important action. \`secondary\` for companion actions. Never both competing for the same focal weight.
- **Radii:** 8px on surfaces and inputs; pill on buttons.
- **Padding:** 32px on cards, 16px on buttons, 12px on inputs.
- **Typography:** Space Grotesk 32px/600 for section titles; Inter 16px/400 for body; Inter 14px/500 sentence-case for labels.
- **Motion:** when building for a runtime that supports it, cubic-bezier(0.175, 0.885, 0.32, 1.275) for spring transitions at 300ms. For static renders, omit motion entirely.

### Canonical example prompts

1. **Login form.** A single surface card, 480px wide, 32px padding, centered on \`surface-container\`. Space Grotesk 32/600 title ("Sign in"). Two Inter inputs (email, password) with sentence-case labels. Pill \`button-primary\` below the inputs with sentence-case text ("Sign in"). A \`button-tertiary\` below that ("Create account").
2. **Dashboard metric card.** A \`surface\` card, 32px padding, 8px radius. Top: sentence-case label ("Monthly revenue") in \`on-surface-variant\` at 14px. Middle: large number ("$48,203") in Space Grotesk 40/600. Bottom: small trend indicator ("+12.4% vs last month") in \`on-surface-variant\` at 14px. **No uppercase. No letter-spacing on the label beyond the default 0.02em.**
3. **Settings panel.** Section heading in Space Grotesk 24/600. Grouped toggles on a \`surface\` card with 32px padding. 24px (\`md\`) gap between toggle rows; 8px (\`xs\`) between the toggle switch and its label.

## License

Void Energy ships under the Business Source License (BSL 1.1). Source is visible; production use requires a license from DGRS Labs until the four-year auto-convert clause elapses. This DESIGN.md file itself is distributed under the same license as the repository it lives in.

## The Full System

This file describes the Frost atmosphere as a single snapshot. The live Void Energy runtime is larger:

- **Four built-in atmospheres:** Slate (professional flat), Terminal (retro CRT), Meridian (fintech light), Frost (arctic glass — this snapshot).
- **Three physics presets:** glass (Frost's default), flat (Slate, Meridian), retro (Terminal). Physics controls blur, border width, motion, and radius behavior — not color.
- **Two color modes:** light and dark. Glass and retro require dark; flat works with both.
- **Density scaling:** Compact / Standard / Comfortable, applied multiplicatively to the spacing scale.
- **Component library:** ~80 Svelte 5 components (Runes) with a native-first pattern — wrappers around \`<button>\`, \`<input>\`, \`<select>\`, \`<dialog>\`, etc.
- **Token machinery:** Tailwind CSS v4 bridge, OKLCH semantic-color derivation, generated theme stylesheets.

For the full, installable system see the Void Energy repository. For agent-to-agent communication outside the live runtime, this DESIGN.md is the authoritative snapshot of the Frost aesthetic.
`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function serializeFrostSpecDocument(): string {
  const frontmatter = serializeFrostSpecFrontmatter();
  // Trailing newline preserves POSIX convention and matches the linter's
  // typical expectation that files end with `\n`.
  return `${frontmatter}\n\n${PROSE_TEMPLATE}`;
}
