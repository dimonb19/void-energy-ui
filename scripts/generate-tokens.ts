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
import { fileURLToPath } from 'node:url';
import {
  VOID_TOKENS,
  VOID_TYPOGRAPHY,
  FONTS,
  FONT_FAMILY_TO_KEY,
  DEFAULT_PRELOAD_WEIGHTS,
} from '../src/config/design-tokens';

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
};

type TypographyScale = (typeof VOID_TYPOGRAPHY.scales)[keyof typeof VOID_TYPOGRAPHY.scales];

function hasTabletOverride(
  config: TypographyScale,
): config is TypographyScale & { tabletOverride: string } {
  return 'tabletOverride' in config && typeof config.tabletOverride === 'string';
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

    // Sort weights for consistent output
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
    const files = preloadWeights.map((weight) => `/fonts/${fontDef.files[weight]}`);
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
// density, and theme.css land in later sessions (see plans/phase-1-*).

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
        { physics: string; mode: string; tagline?: string; canvas: string }
      > = {};
      Object.entries(VOID_TOKENS.themes).forEach(([key, config]) => {
        registry[key] = {
          physics: config.physics,
          mode: config.mode,
          tagline: config.tagline,
          canvas: config.palette['bg-canvas'],
        };
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
    }

    console.log('✅ Token Pipeline Complete.\n');
  } catch (error) {
    console.error('❌ Token Generation Failed:', error);
    process.exit(1);
  }
}

main();
