/**
 * 🤖 Void token generator.
 * Usage:
 *   npm run build:tokens                    # --target=all (default)
 *   npm run build:tokens -- --target=l1     # L1 SCSS pipeline only
 *   npm run build:tokens -- --target=l0     # L0 CSS preset only
 *   npm run build:tokens -- --target=all    # both
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass-embedded';
import {
  VOID_TOKENS,
  VOID_TYPOGRAPHY,
  FONTS,
  FONT_FAMILY_TO_KEY,
  DEFAULT_PRELOAD_WEIGHTS,
} from '../src/config/design-tokens';
import { BRANDS, type BrandProfile } from '../src/config/brands';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Target = 'l0' | 'l1' | 'all';

function parseTarget(argv: string[]): Target {
  const flag = argv.find((a) => a.startsWith('--target='));
  const value = flag ? flag.slice('--target='.length) : 'all';
  if (value !== 'l0' && value !== 'l1' && value !== 'all') {
    throw new Error(
      `Invalid --target="${value}". Must be one of: l0, l1, all.`,
    );
  }
  return value;
}

const PATHS = {
  // L1 outputs
  scss: path.resolve(__dirname, '../src/styles/config/_generated-themes.scss'),
  fontsScss: path.resolve(__dirname, '../src/styles/config/_fonts.scss'),
  fontRegistry: path.resolve(__dirname, '../src/config/font-registry.ts'),
  registryJson: path.resolve(__dirname, '../src/config/void-registry.json'),
  physicsJson: path.resolve(__dirname, '../src/config/void-physics.json'),
  // L0 outputs
  l0Dir: path.resolve(__dirname, '../packages/void-energy-tailwind/dist'),
  l0Tokens: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/dist/tokens.css',
  ),
  l0Atmospheres: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/dist/atmospheres',
  ),
  l0Physics: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/dist/physics',
  ),
  l0Density: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/dist/density.css',
  ),
  l0AtmospheresJson: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/dist/atmospheres.json',
  ),
  l0ThemeSrc: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/src/theme.css',
  ),
  l0ThemeOut: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/dist/theme.css',
  ),
  l0ThemeNoContainerOut: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/dist/theme-no-container.css',
  ),
  // Optional L0 components bundle (compiled from the L1 SCSS SSOT)
  l0Components: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/dist/components.css',
  ),
  // L0 participation contract (compiled from a single SCSS file — shipped
  // separately from components.css so ecosystem-bridge consumers who skip
  // the components bundle still get the data-ve-* attribute API).
  l0Participation: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/dist/participation.css',
  ),
  // Ecosystem bridges: static CSS aliases from VE tokens → 3rd-party contracts
  l0BridgesSrc: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/src/bridges',
  ),
  l0BridgesOut: path.resolve(
    __dirname,
    '../packages/void-energy-tailwind/dist/bridges',
  ),
  // SCSS compile inputs
  stylesRoot: path.resolve(__dirname, '../src/styles'),
};

// -----------------------------------------------------------------------------
// L0 components bundle — configuration
// -----------------------------------------------------------------------------
// The L1 SCSS component layer is the SSOT. A subset of those files compile
// cleanly into framework-agnostic CSS — they style native HTML (button, input,
// dialog, ...) or data-attribute-driven states that any framework can drive
// without Svelte-specific runtime code.
//
// Files excluded from the L0 bundle need JS co-authorship to be meaningful:
//   icons           → L1 interactive SVG components with scoped <style>
//   kinetic         → kinetic typography cursor, needs the `kinetic` action
//   drag            → ghost/target states need the `draggable` / `dropTarget` actions
//   command-palette → Cmd+K keyboard nav + dispatch
//   combobox        → filter/keyboard nav JS
//   pull-refresh    → pull gesture JS
//   page-sidebar    → scroll-tracking IntersectionObserver
//   charts          → data-driven (bar/line/donut values come from JS)
//
// Everything else in `src/styles/components/` is included. Editing any listed
// file here and re-running the generator refreshes dist/components.css with
// zero hand-maintenance — the L1 SCSS stays the single source of truth.
// -----------------------------------------------------------------------------
const L0_COMPONENT_INCLUDE: readonly string[] = [
  'anchors',
  'buttons',
  'inputs',
  'fields',
  'toggle',
  'dialogs',
  'toasts',
  'tooltips',
  'dropdown',
  'containers',
  'navigation',
  'chips',
  'badges',
  'effects',
  'tabs',
  'pagination',
  'stat-card',
];

type TypographyScale = (typeof VOID_TYPOGRAPHY.scales)[keyof typeof VOID_TYPOGRAPHY.scales];

function hasTabletOverride(
  config: TypographyScale,
): config is TypographyScale & { tabletOverride: string } {
  return 'tabletOverride' in config && typeof config.tabletOverride === 'string';
}

// ---------------------------------------------------------------------------
// Brand profile → CSS variable map (per-axis, kebab-cased)
// ---------------------------------------------------------------------------
// Brand profiles (src/config/brands/index.ts) carry overrides as camelCase
// fields grouped by axis (radii / motion / typography). The SCSS mixin that
// emits `[data-brand='<id>']` blocks expects pre-kebab-cased CSS variable
// names so it can interpolate without per-axis branching. Some camelCase
// fields don't map directly to their CSS-var name (e.g. `transformButton` →
// `text-transform-button`), so the mapping is explicit per field.
// ---------------------------------------------------------------------------

const BRAND_MOTION_KEYS: Record<string, string> = {
  speedFast: 'speed-fast',
  speedBase: 'speed-base',
  speedSlow: 'speed-slow',
  easeSpringGentle: 'ease-spring-gentle',
  easeSpringSnappy: 'ease-spring-snappy',
  easeSpringBounce: 'ease-spring-bounce',
  easeFlow: 'ease-flow',
};

const BRAND_TYPOGRAPHY_KEYS: Record<string, string> = {
  trackingDisplay: 'tracking-display',
  trackingHeading: 'tracking-heading',
  trackingBody: 'tracking-body',
  trackingButton: 'tracking-button',
  transformButton: 'text-transform-button',
  transformHeading: 'text-transform-heading',
  weightButton: 'weight-button',
  weightHeading: 'weight-heading',
  weightDisplay: 'weight-display',
};

interface BrandSubmaps {
  radii: Record<string, string>;
  motion: Record<string, string>;
  typography: Record<string, string | number>;
}

function compileBrand(profile: BrandProfile): BrandSubmaps {
  const radii: Record<string, string> = {};
  const motion: Record<string, string> = {};
  const typography: Record<string, string | number> = {};

  if (profile.radii) {
    for (const [k, v] of Object.entries(profile.radii)) {
      if (v !== undefined) radii[k] = v;
    }
  }

  if (profile.motion) {
    for (const [k, v] of Object.entries(profile.motion)) {
      if (v === undefined) continue;
      const cssKey = BRAND_MOTION_KEYS[k];
      if (!cssKey) continue;
      // Speeds arrive as ms numbers (matching VOID_TOKENS.physics shape) →
      // emit as seconds. Easings are CSS strings; pass through.
      motion[cssKey] = typeof v === 'number' ? `${v / 1000}s` : v;
    }
  }

  if (profile.typography) {
    for (const [k, v] of Object.entries(profile.typography)) {
      if (v === undefined) continue;
      const cssKey = BRAND_TYPOGRAPHY_KEYS[k];
      if (!cssKey) continue;
      typography[cssKey] = v;
    }
  }

  return { radii, motion, typography };
}

// Convert raw token numbers to CSS units.
function toCssValue(key: string, value: string | number): string {
  if (typeof value === 'string') return value;
  if (value === 0) {
    if (key.includes('speed') || key.includes('delay')) return '0s';
    if (key.includes('blur') || key.includes('Width') || key.includes('radius')) return '0px';
    return '0';
  }
  if (key.includes('speed')) return `${value / 1000}s`;
  if (key.includes('delay')) return `${value}ms`;
  if (key.includes('blur') || key.includes('Width') || key.includes('radius')) return `${value}px`;
  return `${value}`;
}

function generateSCSS(tokens: typeof VOID_TOKENS) {
  const timestamp = new Date().toISOString();
  let scss = `// 🤖 AUTO-GENERATED FILE\n// GENERATED AT: ${timestamp}\n\n`;

  // Typography: Font scale map.
  scss += `$font-scale: (\n`;
  Object.entries(VOID_TYPOGRAPHY.scales).forEach(([level, config]) => {
    scss += `  '${level}': ${config.fontSize},\n`;
  });
  scss += `);\n\n`;

  // Typography: Tablet overrides map (for H1-H4).
  scss += `$tablet-overrides: (\n`;
  Object.entries(VOID_TYPOGRAPHY.scales).forEach(([level, config]) => {
    if (hasTabletOverride(config)) {
      scss += `  '${level}': ${config.tabletOverride},\n`;
    }
  });
  scss += `);\n\n`;

  // Typography: Line heights map.
  scss += `$line-heights: (\n`;
  Object.entries(VOID_TYPOGRAPHY.scales).forEach(([level, config]) => {
    scss += `  '${level}': ${config.lineHeight},\n`;
  });
  scss += `);\n\n`;

  // Typography: Letter spacings map.
  scss += `$letter-spacings: (\n`;
  Object.entries(VOID_TYPOGRAPHY.scales).forEach(([level, config]) => {
    scss += `  '${level}': ${config.letterSpacing},\n`;
  });
  scss += `);\n\n`;

  // Typography: Font weights map (mapped to levels).
  scss += `$font-weights: (\n`;
  scss += `  'h1': ${VOID_TYPOGRAPHY.weights.bold},\n`;
  scss += `  'h2': ${VOID_TYPOGRAPHY.weights.bold},\n`;
  scss += `  'h3': ${VOID_TYPOGRAPHY.weights.semibold},\n`;
  scss += `  'h4': ${VOID_TYPOGRAPHY.weights.semibold},\n`;
  scss += `  'h5': ${VOID_TYPOGRAPHY.weights.medium},\n`;
  scss += `  'h6': ${VOID_TYPOGRAPHY.weights.medium},\n`;
  scss += `  'body': ${VOID_TYPOGRAPHY.weights.regular},\n`;
  scss += `  'small': ${VOID_TYPOGRAPHY.weights.regular},\n`;
  scss += `  'caption': ${VOID_TYPOGRAPHY.weights.regular},\n`;
  scss += `  'input': ${VOID_TYPOGRAPHY.weights.regular},\n`;
  scss += `  'cta': ${VOID_TYPOGRAPHY.weights.bold},\n`;
  scss += `);\n\n`;

  // Z-layers map.
  scss += `$z-layers: (\n`;
  Object.entries(tokens.layers).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // Breakpoints map.
  scss += `$breakpoints: (\n`;
  Object.entries(tokens.responsive).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;
  
  // Physics maps.
  scss += `$generated-physics: (\n`;
  Object.entries(tokens.physics).forEach(([mode, rawConfig]) => {
    const config = rawConfig as Record<string, string | number>;
    scss += `  '${mode}': (\n`;
    Object.entries(config).forEach(([prop, val]) => {
      const kebabProp = prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
      const cssValue = toCssValue(prop, val);
      let finalKey = kebabProp;
      if (prop === 'blur') finalKey = 'physics-blur';
      if (prop === 'borderWidth') finalKey = 'physics-border-width';
      scss += `    '${finalKey}': ${cssValue},\n`;
    });
    scss += `  ),\n`;
  });
  scss += `);\n\n`;

  // Container widths map.
  scss += `$container-widths: (\n`;
  Object.entries(tokens.container).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // Structural constants map.
  scss += `$structural-constants: (\n`;
  Object.entries(tokens.structural).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // Ambient layer tokens map (consumed by base/_themes.scss → :root vars).
  scss += `$ambient-tokens: (\n`;
  Object.entries(tokens.ambient).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // Aura tokens map (consumed by base/_themes.scss → :root vars).
  scss += `$aura-tokens: (\n`;
  Object.entries(tokens.aura).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // Typography role tokens map (consumed by base/_themes.scss → :root vars).
  // Brand-overlay axis defaults — sparse profiles override per `[data-brand]`.
  scss += `$typography-roles: (\n`;
  Object.entries(tokens.typographyRoles).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // Themes map.
  scss += `$themes: (\n`;
  Object.entries(tokens.themes).forEach(([themeName, config]) => {
    scss += `  '${themeName}': (\n`;
    scss += `    'mode': '${config.mode}',\n`;
    scss += `    'physics': '${config.physics}',\n`;
    scss += `    'palette': (\n`;
    // Inject fonts.
    scss += `      'font-heading': "var(--user-font-heading, var(--font-atmos-heading))",\n`;
    scss += `      'font-body': "var(--user-font-body, var(--font-atmos-body))",\n`;
    // Inject palette.
    Object.entries(config.palette).forEach(([key, value]) => {
      scss += `      '${key}': "${value}",\n`;
    });
    scss += `    ),\n`;
    scss += `  ),\n`;
  });
  scss += `);\n\n`;

  // Brands map (consumed by base/_themes.scss → [data-brand='<id>'] blocks).
  // Brand profiles override radii / motion / type-treatment / per-role weights;
  // sit between physics and atmosphere in the cascade. Empty when BRANDS is {}.
  scss += `$brands: (\n`;
  Object.entries(BRANDS).forEach(([brandId, profile]) => {
    const compiled = compileBrand(profile);
    scss += `  '${brandId}': (\n`;
    if (Object.keys(compiled.radii).length > 0) {
      scss += `    'radii': (\n`;
      Object.entries(compiled.radii).forEach(([key, value]) => {
        scss += `      '${key}': "${value}",\n`;
      });
      scss += `    ),\n`;
    }
    if (Object.keys(compiled.motion).length > 0) {
      scss += `    'motion': (\n`;
      Object.entries(compiled.motion).forEach(([key, value]) => {
        scss += `      '${key}': "${value}",\n`;
      });
      scss += `    ),\n`;
    }
    if (Object.keys(compiled.typography).length > 0) {
      scss += `    'typography': (\n`;
      Object.entries(compiled.typography).forEach(([key, value]) => {
        // Numbers (per-role weights) emit unquoted; strings get quoted to
        // survive Sass parsing of arbitrary CSS values.
        const formatted = typeof value === 'number' ? value : `"${value}"`;
        scss += `      '${key}': ${formatted},\n`;
      });
      scss += `    ),\n`;
    }
    scss += `  ),\n`;
  });
  scss += `);\n`;

  return scss;
}

/**
 * Generate @font-face declarations from FONTS definition.
 */
function generateFontsScss(): string {
  const timestamp = new Date().toISOString();
  let scss = `/* 🤖 AUTO-GENERATED FILE - DO NOT EDIT */\n`;
  scss += `/* Generated from design-tokens.ts at: ${timestamp} */\n`;
  scss += `/* Font-face registry for atmosphere fonts. */\n\n`;

  for (const [fontKey, fontDef] of Object.entries(FONTS)) {
    // Extract display name from family string
    const displayName = fontDef.family.match(/^'([^']+)'/)?.[1] || fontKey;
    scss += `/* FAMILY: ${displayName} */\n`;

    if (fontDef.variable) {
      // Variable font: emit one block with the full fvar weight range so
      // CSS can reach any weight via font-variation-settings or font-weight
      // interpolation. All weight keys point at the same WOFF2 file.
      const filename = Object.values(fontDef.files)[0];
      const { min, max } = fontDef.variable;

      scss += `@font-face {\n`;
      scss += `  font-family: '${displayName}';\n`;
      scss += `  src: url('/fonts/${filename}') format('woff2');\n`;
      scss += `  font-weight: ${min} ${max};\n`;
      scss += `  font-style: normal;\n`;
      scss += `  font-display: swap;\n`;
      scss += `}\n`;
    } else {
      // Static font: one @font-face per discrete weight, distinct files.
      const weights = Object.keys(fontDef.files)
        .map(Number)
        .sort((a, b) => a - b);

      for (const weight of weights) {
        const filename = fontDef.files[weight];

        scss += `@font-face {\n`;
        scss += `  font-family: '${displayName}';\n`;
        scss += `  src: url('/fonts/${filename}') format('woff2');\n`;
        scss += `  font-weight: ${weight};\n`;
        scss += `  font-style: normal;\n`;
        scss += `  font-display: swap;\n`;
        scss += `}\n`;
      }
    }
    scss += `\n`;
  }

  return scss;
}

/**
 * Generate font-registry.ts from theme definitions.
 */
function generateFontRegistry(): string {
  const timestamp = new Date().toISOString();

  // Build FONT_REGISTRY: theme → preload files
  const fontRegistry: Record<string, string[]> = {};
  for (const [themeId, theme] of Object.entries(VOID_TOKENS.themes)) {
    const headingFamily = theme.palette['font-atmos-heading'];
    const bodyFamily = theme.palette['font-atmos-body'];

    const files: string[] = [];
    const seenFamilies = new Set<string>();

    for (const family of [headingFamily, bodyFamily]) {
      if (seenFamilies.has(family)) continue;
      seenFamilies.add(family);

      const fontKey = FONT_FAMILY_TO_KEY[family];
      if (!fontKey) {
        throw new Error(
          `❌ Build Error: No font definition found for family "${family}" in theme "${themeId}". ` +
          `Add this font to the FONTS object in design-tokens.ts.`
        );
      }

      const fontDef = FONTS[fontKey];
      const preloadWeights = fontDef.preloadWeights ?? [...DEFAULT_PRELOAD_WEIGHTS];
      for (const weight of preloadWeights) {
        const file = fontDef.files[weight];
        if (file) {
          files.push(`/fonts/${file}`);
        }
      }
    }
    fontRegistry[themeId] = files;
  }

  // Build USER_FONT_MAP: display name → preload files
  const userFontMap: Record<string, string[]> = {};
  for (const [fontKey, fontDef] of Object.entries(FONTS)) {
    const displayName = fontDef.family.match(/^'([^']+)'/)?.[1] || fontKey;
    const preloadWeights = fontDef.preloadWeights ?? [...DEFAULT_PRELOAD_WEIGHTS];
    const seen = new Set<string>();
    const files: string[] = [];
    for (const weight of preloadWeights) {
      const file = fontDef.files[weight];
      // Variable fonts collapse all preload weights to one file; static fonts
      // may not have entries for every default weight (e.g. only 400+700).
      if (!file || seen.has(file)) continue;
      seen.add(file);
      files.push(`/fonts/${file}`);
    }
    userFontMap[displayName] = files;
  }

  let ts = `/**\n`;
  ts += ` * 🤖 AUTO-GENERATED FILE - DO NOT EDIT\n`;
  ts += ` * Generated from design-tokens.ts at: ${timestamp}\n`;
  ts += ` *\n`;
  ts += ` * Font Registry for Dynamic Preloading\n`;
  ts += ` * Used by ThemeScript.astro to preload only the active theme's fonts.\n`;
  ts += ` */\n\n`;

  ts += `export const FONT_REGISTRY: Record<string, string[]> = ${JSON.stringify(fontRegistry, null, 2)};\n\n`;

  ts += `/**\n`;
  ts += ` * Maps user-selectable font families to their WOFF2 files.\n`;
  ts += ` * Used by ThemeScript.astro to preload user font overrides.\n`;
  ts += ` */\n`;
  ts += `export const USER_FONT_MAP: Record<string, string[]> = ${JSON.stringify(userFontMap, null, 2)};\n`;

  return ts;
}

// ==========================================================================
// L0 — @void-energy/tailwind emission
// ==========================================================================
//
// L0 ships pure CSS. This generator emits the foundation tokens into
// `packages/void-energy-tailwind/dist/tokens.css`. Atmospheres, physics,
// density, and theme.css land in later sessions.

function rawFontStack(family: string): string {
  // Atmosphere palette `font-atmos-*` entries are CSS font-family strings
  // (e.g. `"'Inter', sans-serif"`). For L0 we emit a neutral default stack
  // in tokens.css so consumers see a real font before any atmosphere loads.
  // Atmosphere CSS (Session 2) overrides these via `--font-atmos-*`.
  return family;
}

function generateL0Tokens(): string {
  const timestamp = new Date().toISOString();
  const s = VOID_TOKENS.structural;
  const spacing = {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    '4xl': 32,
    '5xl': 40,
  };

  let css = `/*\n`;
  css += ` * 🤖 AUTO-GENERATED — DO NOT EDIT\n`;
  css += ` * @void-energy/tailwind — foundation tokens (L0)\n`;
  css += ` * Source of truth: src/config/design-tokens.ts\n`;
  css += ` * Generated at: ${timestamp}\n`;
  css += ` *\n`;
  css += ` * These are the density-scaled and atmosphere-independent tokens.\n`;
  css += ` * Atmospheres (atmospheres/*.css) and physics (physics/*.css) override\n`;
  css += ` * a narrower surface on top.\n`;
  css += ` */\n\n`;

  css += `:root {\n`;

  // ── Density + base unit ────────────────────────────────────────────────
  css += `  /* Base unit (4px) + density default. density.css overrides via [data-density]. */\n`;
  css += `  --unit: 0.25rem;\n`;
  css += `  --density: 1;\n\n`;

  // ── Spacing scale (density-scaled) ─────────────────────────────────────
  css += `  /* Spacing scale — multiplies by --density (0.75 compact, 1 default, 1.25 comfortable). */\n`;
  for (const [key, multiplier] of Object.entries(spacing)) {
    css += `  --space-${key}: calc(${multiplier} * var(--unit) * var(--density, 1));\n`;
  }
  css += `\n`;

  // ── Layout / control geometry ──────────────────────────────────────────
  css += `  /* Layout + control geometry. */\n`;
  css += `  --nav-height: calc(16 * var(--unit) * var(--density, 1));\n`;
  css += `  --size-touch-min: 2.75rem;\n`;
  css += `  --control-height: max(2.25rem, calc(2.75rem * var(--density, 1)));\n`;
  css += `  --control-padding-x: var(--space-sm);\n`;
  css += `  --control-padding-y: calc(var(--space-xs) * 0.75);\n`;
  css += `  --breadcrumbs-height: calc(var(--space-md) + var(--space-xs) * 2);\n`;
  css += `  --scrollbar-width: 6px;\n\n`;

  // ── Radius scale ──────────────────────────────────────────────────────
  css += `  /* Radius scale. physics/retro.css zeroes these for CRT aesthetic. */\n`;
  css += `  --radius-sm: 4px;\n`;
  css += `  --radius-md: 8px;\n`;
  css += `  --radius-lg: 16px;\n`;
  css += `  --radius-xl: 24px;\n`;
  css += `  --radius-full: 9999px;\n\n`;

  // ── Z-index scale ──────────────────────────────────────────────────────
  css += `  /* Z-index semantic scale. */\n`;
  for (const [key, value] of Object.entries(VOID_TOKENS.layers)) {
    css += `  --z-${key}: ${value};\n`;
  }
  css += `\n`;

  // ── Typography: font sizes ─────────────────────────────────────────────
  css += `  /* Font sizes — fluid clamps from design-tokens.ts. */\n`;
  for (const [key, config] of Object.entries(VOID_TYPOGRAPHY.scales)) {
    const name = key === 'body' ? 'body' : key === 'small' ? 'small' : key === 'caption' ? 'caption' : key;
    css += `  --font-size-${name}: ${config.fontSize};\n`;
  }
  css += `\n`;

  // ── Typography: line heights ───────────────────────────────────────────
  css += `  /* Line heights. */\n`;
  for (const [key, config] of Object.entries(VOID_TYPOGRAPHY.scales)) {
    css += `  --line-height-${key}: ${config.lineHeight};\n`;
  }
  css += `\n`;

  // ── Typography: letter spacing ─────────────────────────────────────────
  css += `  /* Letter spacing. */\n`;
  for (const [key, config] of Object.entries(VOID_TYPOGRAPHY.scales)) {
    css += `  --letter-spacing-${key}: ${config.letterSpacing};\n`;
  }
  css += `\n`;

  // ── Typography: font weights ───────────────────────────────────────────
  css += `  /* Font weights. */\n`;
  for (const [key, value] of Object.entries(VOID_TYPOGRAPHY.weights)) {
    css += `  --font-weight-${key}: ${value};\n`;
  }
  css += `\n`;

  // ── Typography: role tokens (brand-overlay axis) ────────────────────────
  css += `  /* Typography role tokens — addressed by brand identity (display,\n`;
  css += `   * heading, body, button) rather than typographic scale. Defaults\n`;
  css += `   * forward to the global vocabulary; brand profiles override per\n`;
  css += `   * [data-brand] to express identity. */\n`;
  for (const [key, value] of Object.entries(VOID_TOKENS.typographyRoles)) {
    css += `  --${key}: ${value};\n`;
  }
  css += `\n`;

  // ── Font families ──────────────────────────────────────────────────────
  css += `  /*\n`;
  css += `   * Font families — default stacks only. Consumers override via --font-heading/body/mono\n`;
  css += `   * or via atmosphere CSS (--font-atmos-heading / --font-atmos-body). Session 2 wires\n`;
  css += `   * atmosphere fonts on top so the active atmosphere can change them.\n`;
  css += `   */\n`;
  css += `  --font-heading: ${rawFontStack(VOID_TYPOGRAPHY.families.heading)};\n`;
  css += `  --font-body: ${rawFontStack(VOID_TYPOGRAPHY.families.body)};\n`;
  css += `  --font-mono: ${rawFontStack(VOID_TYPOGRAPHY.families.mono)};\n\n`;

  // ── Structural constants (modals, tooltips, dialogs) ───────────────────
  css += `  /* Structural constants (modal widths, tooltip, dialog gutters). */\n`;
  css += `  --modal-width-xs: ${s['modal-width-xs']};\n`;
  css += `  --modal-width-sm: ${s['modal-width-sm']};\n`;
  css += `  --modal-width-md: ${s['modal-width-md']};\n`;
  css += `  --modal-width-lg: ${s['modal-width-lg']};\n`;
  css += `  --modal-width-xl: ${s['modal-width-xl']};\n`;
  css += `  --tooltip-max-width: ${s['tooltip-max-width']};\n`;
  css += `  --dialog-gutter: var(--space-xl);\n`;
  css += `  --dialog-gutter-lg: var(--space-2xl);\n\n`;

  // ── Safe-area insets ───────────────────────────────────────────────────
  css += `  /* Safe-area insets (iOS/Android edge-to-edge). */\n`;
  css += `  --safe-top: env(safe-area-inset-top, 0px);\n`;
  css += `  --safe-bottom: env(safe-area-inset-bottom, 0px);\n`;
  css += `  --safe-left: env(safe-area-inset-left, 0px);\n`;
  css += `  --safe-right: env(safe-area-inset-right, 0px);\n`;

  css += `}\n`;

  return css;
}

// ── L0 helpers: emit color-mix() strings that match SCSS alpha() output ───

/**
 * Mirrors the `alpha(var(--x), N%)` SCSS function for CSS-variable inputs.
 * Compiles to the same color-mix() string SCSS emits, so L0's physics shadows
 * are byte-equivalent to L1's compiled output once the atmosphere resolves.
 */
function cssAlpha(cssVar: string, pct: number): string {
  return `color-mix(in oklch, ${cssVar} ${pct}%, transparent ${100 - pct}%)`;
}

/**
 * Mirrors the `blend(var(--a), var(--b), N%)` SCSS function for CSS-variable
 * inputs. Used for glass surface-bg gradient.
 */
function cssBlend(base: string, other: string, otherPct: number): string {
  return `color-mix(in oklch, ${base}, ${other} ${otherPct}%)`;
}

function generateL0Physics(): Record<string, string> {
  const timestamp = new Date().toISOString();
  const p = VOID_TOKENS.physics;
  const files: Record<string, string> = {};

  const header = (name: string) =>
    `/*\n` +
    ` * 🤖 AUTO-GENERATED — DO NOT EDIT\n` +
    ` * @void-energy/tailwind — physics: ${name}\n` +
    ` * Source of truth: src/config/design-tokens.ts (VOID_TOKENS.physics.${name})\n` +
    ` * Generated at: ${timestamp}\n` +
    ` *\n` +
    ` * Geometry (offsets, blur, spread, motion timings) lives here.\n` +
    ` * Color pulls from atmosphere tokens (--bg-canvas, --energy-primary).\n` +
    ` */\n\n`;

  // Shared: emit motion + surface tokens for a physics preset.
  type PhysicsPreset = {
    radiusBase: string;
    radiusFull: string;
    blur: number;
    borderWidth: number;
    speedInstant: number;
    speedFast: number;
    speedBase: number;
    speedSlow: number;
    delayCascade: number;
    delaySequence: number;
    easeSpringGentle: string;
    easeSpringSnappy: string;
    easeSpringBounce: string;
    easeFlow: string;
    lift: string;
    scale: number;
    shadowOffset?: string;
  };

  const motionBlock = (preset: PhysicsPreset): string => {
    let out = '';
    out += `  --speed-instant: ${preset.speedInstant / 1000}s;\n`;
    out += `  --speed-fast: ${preset.speedFast / 1000}s;\n`;
    out += `  --speed-base: ${preset.speedBase / 1000}s;\n`;
    out += `  --speed-slow: ${preset.speedSlow / 1000}s;\n`;
    out += `  --delay-cascade: ${preset.delayCascade}ms;\n`;
    out += `  --delay-sequence: ${preset.delaySequence}ms;\n`;
    out += `  --ease-spring-gentle: ${preset.easeSpringGentle};\n`;
    out += `  --ease-spring-snappy: ${preset.easeSpringSnappy};\n`;
    out += `  --ease-spring-bounce: ${preset.easeSpringBounce};\n`;
    out += `  --ease-flow: ${preset.easeFlow};\n`;
    out += `  --physics-blur: ${preset.blur}px;\n`;
    out += `  --physics-border-width: ${preset.borderWidth}px;\n`;
    out += `  --lift: ${preset.lift};\n`;
    out += `  --scale: ${preset.scale};\n`;
    return out;
  };

  // ── glass ──────────────────────────────────────────────────────────────
  {
    const preset = p.glass;
    let css = header('glass');
    css += `[data-physics='glass'] {\n`;
    css += motionBlock(preset);
    css += `  --radius-base: ${preset.radiusBase};\n`;
    css += `  --radius-full: ${preset.radiusFull};\n`;
    css += `  --surface-bg: linear-gradient(\n`;
    css += `    to bottom,\n`;
    css += `    ${cssBlend('var(--bg-surface)', 'var(--energy-secondary)', 10)} 0%,\n`;
    css += `    var(--bg-surface) 100%\n`;
    css += `  );\n`;
    css += `  --shadow-sunk: inset 0 2px 4px ${cssAlpha('var(--bg-canvas)', 60)};\n`;
    css += `  --shadow-float:\n`;
    css += `    0 1px 3px ${cssAlpha('var(--bg-canvas)', 25)},\n`;
    css += `    0 6px 20px -4px ${cssAlpha('var(--bg-canvas)', 35)};\n`;
    css += `  --shadow-lift:\n`;
    css += `    0 8px 28px -4px ${cssAlpha('var(--bg-canvas)', 35)},\n`;
    css += `    0 0 12px ${cssAlpha('var(--energy-primary)', 35)};\n`;
    css += `}\n`;
    files.glass = css;
  }

  // ── flat ───────────────────────────────────────────────────────────────
  {
    const preset = p.flat;
    let css = header('flat');
    css += `[data-physics='flat'] {\n`;
    css += motionBlock(preset);
    css += `  --radius-base: ${preset.radiusBase};\n`;
    css += `  --radius-full: ${preset.radiusFull};\n`;
    css += `  --surface-bg: var(--bg-surface);\n`;
    // Light-mode defaults (hardcoded neutral rgba).
    css += `  --shadow-sunk: inset 0 1px 2px rgba(0, 0, 0, 0.05);\n`;
    css += `  --shadow-float: 0 1px 3px rgba(0, 0, 0, 0.05);\n`;
    css += `  --shadow-lift: 0 4px 12px rgba(0, 0, 0, 0.1);\n`;
    css += `}\n\n`;
    // Dark-mode override — elevated opacities for visibility on dark surfaces.
    css += `/*\n`;
    css += ` * Flat + dark: light-mode alphas (5-10%) are invisible on dark canvases.\n`;
    css += ` * These overrides add depth without changing the flat aesthetic.\n`;
    css += ` */\n`;
    css += `[data-physics='flat'][data-mode='dark'] {\n`;
    css += `  --shadow-sunk: inset 0 1px 3px rgba(0, 0, 0, 0.4);\n`;
    css += `  --shadow-float:\n`;
    css += `    0 1px 4px rgba(0, 0, 0, 0.3),\n`;
    css += `    0 4px 12px -2px rgba(0, 0, 0, 0.25);\n`;
    css += `  --shadow-lift:\n`;
    css += `    0 4px 16px rgba(0, 0, 0, 0.4),\n`;
    css += `    0 8px 24px -4px rgba(0, 0, 0, 0.3);\n`;
    css += `}\n`;
    files.flat = css;
  }

  // ── retro ──────────────────────────────────────────────────────────────
  {
    const preset = p.retro;
    let css = header('retro');
    css += `[data-physics='retro'] {\n`;
    css += motionBlock(preset);
    css += `  --radius-base: ${preset.radiusBase};\n`;
    css += `  --radius-full: ${preset.radiusFull};\n`;
    css += `  --shadow-offset: ${'shadowOffset' in preset ? preset.shadowOffset : '3px'};\n`;
    css += `  --surface-bg: var(--bg-surface);\n`;
    css += `  --shadow-sunk: none;\n`;
    css += `  --shadow-float: none;\n`;
    css += `  --shadow-lift: var(--shadow-offset) var(--shadow-offset) 0\n`;
    css += `    ${cssAlpha('var(--energy-secondary)', 50)};\n`;
    // Retro zeros the radius scale (force square edges globally).
    css += `\n`;
    css += `  --radius-sm: 0;\n`;
    css += `  --radius-md: 0;\n`;
    css += `  --radius-lg: 0;\n`;
    css += `  --radius-xl: 0;\n`;
    css += `}\n`;
    files.retro = css;
  }

  return files;
}

function generateL0Atmospheres(): Record<string, string> {
  const timestamp = new Date().toISOString();
  const files: Record<string, string> = {};

  for (const [name, def] of Object.entries(VOID_TOKENS.themes)) {
    let css = `/*\n`;
    css += ` * 🤖 AUTO-GENERATED — DO NOT EDIT\n`;
    css += ` * @void-energy/tailwind — atmosphere: ${name}\n`;
    css += ` * ${def.tagline} — ${def.mode} / ${def.physics}\n`;
    css += ` * Source of truth: src/config/atmospheres.ts\n`;
    css += ` * Generated at: ${timestamp}\n`;
    css += ` */\n\n`;

    css += `[data-atmosphere='${name}'] {\n`;
    css += `  color-scheme: ${def.mode};\n\n`;

    // Emit palette entries. Translate `font-atmos-*` keys into the
    // public `--font-heading` / `--font-body` tokens so L0 consumers
    // don't need any intermediate wiring.
    for (const [key, value] of Object.entries(def.palette)) {
      if (key === 'font-atmos-heading') {
        css += `  --font-heading: ${value};\n`;
      } else if (key === 'font-atmos-body') {
        css += `  --font-body: ${value};\n`;
      } else {
        css += `  --${key}: ${value};\n`;
      }
    }

    css += `}\n`;
    files[name] = css;
  }

  return files;
}

function generateL0Density(): string {
  const timestamp = new Date().toISOString();
  const f = VOID_TOKENS.density.factors;
  let css = `/*\n`;
  css += ` * 🤖 AUTO-GENERATED — DO NOT EDIT\n`;
  css += ` * @void-energy/tailwind — density scaling\n`;
  css += ` * Source of truth: src/config/design-tokens.ts (VOID_TOKENS.density.factors)\n`;
  css += ` * Generated at: ${timestamp}\n`;
  css += ` *\n`;
  css += ` * Overrides --density, which multiplies into every spacing and control\n`;
  css += ` * geometry token in tokens.css. Default lives on :root (--density: 1).\n`;
  css += ` */\n\n`;
  // high = compact (0.75), standard = default (1), low = comfortable (1.25)
  css += `[data-density='compact'] { --density: ${f.high}; }\n`;
  css += `[data-density='default'] { --density: ${f.standard}; }\n`;
  css += `[data-density='comfortable'] { --density: ${f.low}; }\n`;
  return css;
}

/**
 * Copy src/theme.css → dist/theme.css verbatim, plus generate
 * theme-no-container.css by stripping the @layer void-overrides block that
 * contains `.container` (the second one, marked with the "Container override"
 * comment header).
 */
function buildL0Theme(): { theme: string; themeNoContainer: string } {
  const src = fs.readFileSync(PATHS.l0ThemeSrc, 'utf8');
  // Strip the "Container override" void-overrides block. Boundary markers
  // are stable comments + the @layer declaration. Regex matches from the
  // opening "── Container override ──" banner comment through the closing
  // brace of its @layer wrapper (the .container-fluid rule is the last
  // child, followed by two braces — the inner rule's and the layer's).
  const containerBlock =
    /\n\/\*\n \* ── Container override ──[\s\S]*?\.container-fluid[\s\S]*?\}\n\}/;
  if (!containerBlock.test(src)) {
    throw new Error(
      'theme.css source missing expected "── Container override ──" block. ' +
        'Update the regex in buildL0Theme() if the structure changed.',
    );
  }
  const themeNoContainer = src.replace(
    containerBlock,
    '\n/* Container override block omitted in theme-no-container.css. */\n',
  );
  return { theme: src, themeNoContainer };
}

// -----------------------------------------------------------------------------
// L0 components bundle — compile step
// -----------------------------------------------------------------------------
// Synthesizes a virtual entry SCSS that @forwards every safe component file,
// then runs `sass-embedded` in compressed mode. The entry is evaluated AS IF
// it lived at `src/styles/_l0-components-entry.scss`, so the relative @use
// paths inside each component file (`@use '../abstracts' as *;`) resolve
// correctly against the real directory layout.
//
// Why not compile `_index.scss` directly? Because _index.scss pulls in
// `../../../packages/dgrs/src/styles/tiles` (premium package) and several
// JS-dependent components. A hand-picked include list keeps the L0 bundle
// lean, framework-agnostic, and free of premium package leakage.
//
// Output shape: one minified CSS file at dist/components.css. No source map
// is emitted — debugging is done against the L1 SCSS sources, not the L0
// compile artifact.
// -----------------------------------------------------------------------------
function generateL0Components(): string {
  const imports = L0_COMPONENT_INCLUDE.map(
    (name) => `@forward 'components/${name}';`,
  ).join('\n');
  const entrySource = `// Virtual L0 entry — regenerated by scripts/generate-tokens.ts\n${imports}\n`;

  // `url` tells Sass where to pretend this source lives. Without it, Sass
  // resolves @use / @forward relative to the process CWD, which breaks.
  const virtualEntryUrl = pathToFileURL(
    path.join(PATHS.stylesRoot, '_l0-components-entry.scss'),
  );

  const result = sass.compileString(entrySource, {
    url: virtualEntryUrl,
    style: 'compressed',
    loadPaths: [PATHS.stylesRoot],
  });

  const header =
    '/*! Void Energy L0 components bundle — compiled from src/styles/components/**. ' +
    "Edit the SCSS sources, not this file. Regenerate with `npm run build:tokens`. */\n";
  return header + result.css + '\n';
}

// -----------------------------------------------------------------------------
// L0 participation contract — compile step
// -----------------------------------------------------------------------------
// Compiles src/styles/components/_participation.scss into a standalone CSS
// file. Shipped as a separate export from components.css because consumers
// using ecosystem bridges (shadcn/Radix/Mantine) skip the components bundle
// entirely — and the data-ve-* attribute API is the L0-ceiling-breaker that
// lets those consumers wrap foreign components in VE physics. It deserves
// visibility on its own.
// -----------------------------------------------------------------------------
function generateL0Participation(): string {
  const entrySource =
    "// Virtual L0 participation entry — regenerated by scripts/generate-tokens.ts\n@forward 'components/participation';\n";

  const virtualEntryUrl = pathToFileURL(
    path.join(PATHS.stylesRoot, '_l0-participation-entry.scss'),
  );

  const result = sass.compileString(entrySource, {
    url: virtualEntryUrl,
    style: 'compressed',
    loadPaths: [PATHS.stylesRoot],
  });

  const header =
    '/*! Void Energy L0 participation contract — compiled from src/styles/components/_participation.scss. ' +
    "Edit the SCSS source, not this file. Regenerate with `npm run build:tokens`. */\n";
  return header + result.css + '\n';
}

// -----------------------------------------------------------------------------
// L0 ecosystem bridges — copy step
// -----------------------------------------------------------------------------
// Bridge files are authored by hand in `src/bridges/*.css` and shipped as-is.
// They contain no compile-time logic — just CSS variable aliases that forward
// 3rd-party design system contracts (shadcn, Radix Themes, Mantine) onto
// Void Energy tokens. Keeping them static preserves readability, lets
// consumers inspect the mapping, and avoids a codegen layer that nobody
// needs to maintain.
//
// This function exists to keep dist/ in lockstep with src/bridges/ during
// the same build pass that emits tokens/atmospheres/physics — so a single
// `npm run build:tokens` produces a complete, shippable dist directory.
// -----------------------------------------------------------------------------
function copyL0Bridges(): string[] {
  if (!fs.existsSync(PATHS.l0BridgesSrc)) return [];
  if (!fs.existsSync(PATHS.l0BridgesOut)) {
    fs.mkdirSync(PATHS.l0BridgesOut, { recursive: true });
  }
  const files = fs
    .readdirSync(PATHS.l0BridgesSrc)
    .filter((name) => name.endsWith('.css'));
  for (const name of files) {
    fs.copyFileSync(
      path.join(PATHS.l0BridgesSrc, name),
      path.join(PATHS.l0BridgesOut, name),
    );
  }
  return files;
}

function generateL0AtmospheresJson(): string {
  const manifest: Record<string, { physics: string; mode: string; tagline: string }> = {};
  for (const [name, def] of Object.entries(VOID_TOKENS.themes)) {
    manifest[name] = {
      physics: def.physics,
      mode: def.mode,
      tagline: def.tagline,
    };
  }
  return JSON.stringify(manifest, null, 2) + '\n';
}

async function main() {
  try {
    const target = parseTarget(process.argv.slice(2));
    console.log(`\n🔮 Void Engine: Materializing Tokens (target=${target})...`);

    if (target === 'l1' || target === 'all') {
      // Ensure directories exist.
      const scssDir = path.dirname(PATHS.scss);
      const fontsScssDir = path.dirname(PATHS.fontsScss);
      if (!fs.existsSync(scssDir)) fs.mkdirSync(scssDir, { recursive: true });
      if (!fs.existsSync(fontsScssDir)) fs.mkdirSync(fontsScssDir, { recursive: true });

      // Generate theme SCSS.
      const scssContent = generateSCSS(VOID_TOKENS);
      fs.writeFileSync(PATHS.scss, scssContent);
      console.log(`   └─ 🎨 [L1] Themes: src/styles/config/_generated-themes.scss`);

      // Generate @font-face SCSS.
      const fontsScssContent = generateFontsScss();
      fs.writeFileSync(PATHS.fontsScss, fontsScssContent);
      console.log(`   └─ 🔤 [L1] Fonts: src/styles/config/_fonts.scss`);

      // Generate font-registry.ts.
      const fontRegistryContent = generateFontRegistry();
      fs.writeFileSync(PATHS.fontRegistry, fontRegistryContent);
      console.log(`   └─ 📦 [L1] Font Registry: src/config/font-registry.ts`);

      // Generate theme registry JSON.
      const registry: Record<
        string,
        {
          physics: string;
          mode: string;
          tagline?: string;
          canvas: string;
          brand?: string;
        }
      > = {};
      Object.entries(VOID_TOKENS.themes).forEach(([key, config]) => {
        const entry: {
          physics: string;
          mode: string;
          tagline?: string;
          canvas: string;
          brand?: string;
        } = {
          physics: config.physics,
          mode: config.mode,
          tagline: config.tagline,
          canvas: config.palette['bg-canvas'],
        };
        // Brand reference flows into the bootloader via the registry — single
        // source of truth, no parallel atmosphere → brand map to maintain.
        // Omit the field entirely when absent so JSON stays minimal.
        if (config.brand) entry.brand = config.brand;
        registry[key] = entry;
      });
      fs.writeFileSync(PATHS.registryJson, JSON.stringify(registry, null, 2));
      console.log(`   └─ ⚙️  [L1] Registry: src/config/void-registry.json`);

      // Generate physics JSON.
      fs.writeFileSync(PATHS.physicsJson, JSON.stringify(VOID_TOKENS.physics, null, 2));
      console.log(`   └─ ⚡ [L1] Physics: src/config/void-physics.json`);
    }

    if (target === 'l0' || target === 'all') {
      if (!fs.existsSync(PATHS.l0Dir)) fs.mkdirSync(PATHS.l0Dir, { recursive: true });
      if (!fs.existsSync(PATHS.l0Atmospheres))
        fs.mkdirSync(PATHS.l0Atmospheres, { recursive: true });
      if (!fs.existsSync(PATHS.l0Physics))
        fs.mkdirSync(PATHS.l0Physics, { recursive: true });

      fs.writeFileSync(PATHS.l0Tokens, generateL0Tokens());
      console.log(`   └─ ✨ [L0] Tokens: packages/void-energy-tailwind/dist/tokens.css`);

      const physicsFiles = generateL0Physics();
      for (const [name, content] of Object.entries(physicsFiles)) {
        fs.writeFileSync(path.join(PATHS.l0Physics, `${name}.css`), content);
      }
      console.log(
        `   └─ ⚡ [L0] Physics: packages/void-energy-tailwind/dist/physics/{${Object.keys(physicsFiles).join(',')}}.css`,
      );

      const atmosphereFiles = generateL0Atmospheres();
      for (const [name, content] of Object.entries(atmosphereFiles)) {
        fs.writeFileSync(path.join(PATHS.l0Atmospheres, `${name}.css`), content);
      }
      console.log(
        `   └─ 🌌 [L0] Atmospheres: packages/void-energy-tailwind/dist/atmospheres/{${Object.keys(atmosphereFiles).join(',')}}.css`,
      );

      fs.writeFileSync(PATHS.l0Density, generateL0Density());
      console.log(`   └─ 📏 [L0] Density: packages/void-energy-tailwind/dist/density.css`);

      fs.writeFileSync(PATHS.l0AtmospheresJson, generateL0AtmospheresJson());
      console.log(
        `   └─ 📒 [L0] Manifest: packages/void-energy-tailwind/dist/atmospheres.json`,
      );

      const { theme, themeNoContainer } = buildL0Theme();
      fs.writeFileSync(PATHS.l0ThemeOut, theme);
      fs.writeFileSync(PATHS.l0ThemeNoContainerOut, themeNoContainer);
      console.log(
        `   └─ 🎛️  [L0] Theme: packages/void-energy-tailwind/dist/theme.css (+ theme-no-container.css)`,
      );

      // Optional components bundle — compiled from the L1 SCSS SSOT.
      fs.writeFileSync(PATHS.l0Components, generateL0Components());
      console.log(
        `   └─ 🧩 [L0] Components: packages/void-energy-tailwind/dist/components.css (${L0_COMPONENT_INCLUDE.length} files)`,
      );

      // Participation contract — shipped as a separate export so ecosystem-
      // bridge consumers who skip components.css still get the data-ve-* API.
      fs.writeFileSync(PATHS.l0Participation, generateL0Participation());
      console.log(
        `   └─ 🪟 [L0] Participation: packages/void-energy-tailwind/dist/participation.css`,
      );

      // Ecosystem bridges — static CSS aliases for shadcn / Radix / Mantine.
      const bridgeFiles = copyL0Bridges();
      if (bridgeFiles.length > 0) {
        console.log(
          `   └─ 🌉 [L0] Bridges: packages/void-energy-tailwind/dist/bridges/{${bridgeFiles.map((f) => f.replace(/\.css$/, '')).join(',')}}.css`,
        );
      }
    }

    console.log('✅ Token Pipeline Complete.\n');
  } catch (error) {
    console.error('❌ Token Generation Failed:', error);
    process.exit(1);
  }
}

main();
