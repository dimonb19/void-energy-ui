/**
 * =====================================================================
 *  VOID ENERGY — ATMOSPHERE DEFINITIONS
 * =====================================================================
 *
 *  This is the ONLY file you need to edit to define your app's themes.
 *  Every entry in the ATMOSPHERES object becomes a selectable atmosphere.
 *  You can add, remove, rename, or replace ALL entries freely.
 *
 *  HOW TO ADD A NEW ATMOSPHERE
 *  ---------------------------
 *  1. Add an entry to ATMOSPHERES below with:
 *     - mode: 'dark' or 'light'
 *     - physics: 'glass', 'flat', or 'retro'
 *     - tagline: short description
 *     - palette: full color/font token map (see existing entries)
 *
 *  2. For fonts, reference FONTS.keyName.family from ./fonts.ts
 *     (add new fonts there first if needed)
 *
 *  3. Run: npm run build:tokens
 *
 *  HOW TO REPLACE ALL ATMOSPHERES
 *  ------------------------------
 *  You can delete every entry and start fresh. After replacing:
 *
 *  1. Update the default theme in TWO places (they must stay in sync):
 *
 *     src/config/constants.ts:
 *       DEFAULTS.ATMOSPHERE     → your new default theme key
 *       DEFAULTS.LIGHT_ATMOSPHERE → a light-mode theme key (or same as ATMOSPHERE)
 *       DEFAULTS.PHYSICS        → must match your default theme's physics value
 *       DEFAULTS.MODE           → must match your default theme's mode value
 *
 *     src/styles/base/_themes.scss:
 *       $default-physics line   → map.get(engine.$physics-presets, 'YOUR_PHYSICS')
 *       $default-theme line     → map.get(config.$themes, 'YOUR_THEME_KEY')
 *       color-scheme line       → 'dark' or 'light' to match your default
 *
 *  2. Run: npm run build:tokens
 *
 *  That's it. The engine, theme picker, transitions, and all UI components
 *  read from this file dynamically — no other references to update.
 *
 *  PHYSICS CONSTRAINTS
 *  -------------------
 *  - glass requires mode: 'dark' (glows need darkness)
 *  - retro requires mode: 'dark' (CRT phosphor effect)
 *  - flat works with both modes
 *
 *  Use an existing atmosphere as your starting template.
 *  The AI atmosphere generator can also create palettes for you.
 *
 * =====================================================================
 */

import { FONTS } from './fonts';

// ---------------------------------------------------------------------------
// Semantic color bases (spread into each theme's palette)
// ---------------------------------------------------------------------------

export const SEMANTIC_DARK = {
  // Base Colors
  'color-premium': '#ff8c00', // Gold/Orange
  'color-system': '#a078ff', // Purple
  'color-success': '#00e055', // Green
  'color-error': '#ff3c40', // Red
  // Tint/Shade Variants (Generated via OKLCH in SCSS)
  // Unified multipliers: 1.25x lighter, 0.75x darker (consistent across light/dark modes)
  'color-premium-light': 'oklch(from #ff8c00 calc(l * 1.25) c h)',
  'color-premium-dark': 'oklch(from #ff8c00 calc(l * 0.75) c h)',
  'color-premium-subtle': 'oklch(from #ff8c00 l c h / 0.15)',
  'color-system-light': 'oklch(from #a078ff calc(l * 1.25) c h)',
  'color-system-dark': 'oklch(from #a078ff calc(l * 0.75) c h)',
  'color-system-subtle': 'oklch(from #a078ff l c h / 0.15)',
  'color-success-light': 'oklch(from #00e055 calc(l * 1.25) c h)',
  'color-success-dark': 'oklch(from #00e055 calc(l * 0.75) c h)',
  'color-success-subtle': 'oklch(from #00e055 l c h / 0.15)',
  'color-error-light': 'oklch(from #ff3c40 calc(l * 1.25) c h)',
  'color-error-dark': 'oklch(from #ff3c40 calc(l * 0.75) c h)',
  'color-error-subtle': 'oklch(from #ff3c40 l c h / 0.15)',
};

export const SEMANTIC_LIGHT = {
  // Base Colors
  'color-premium': '#b45309',
  'color-system': '#6d28d9',
  'color-success': '#15803d',
  'color-error': '#dc2626',
  // Tint/Shade Variants (Generated via OKLCH in SCSS)
  // Unified multipliers: 1.25x lighter, 0.75x darker (consistent across light/dark modes)
  'color-premium-light': 'oklch(from #b45309 calc(l * 1.25) c h)',
  'color-premium-dark': 'oklch(from #b45309 calc(l * 0.75) c h)',
  'color-premium-subtle': 'oklch(from #b45309 l c h / 0.15)',
  'color-system-light': 'oklch(from #6d28d9 calc(l * 1.25) c h)',
  'color-system-dark': 'oklch(from #6d28d9 calc(l * 0.75) c h)',
  'color-system-subtle': 'oklch(from #6d28d9 l c h / 0.15)',
  'color-success-light': 'oklch(from #15803d calc(l * 1.25) c h)',
  'color-success-dark': 'oklch(from #15803d calc(l * 0.75) c h)',
  'color-success-subtle': 'oklch(from #15803d l c h / 0.15)',
  'color-error-light': 'oklch(from #dc2626 calc(l * 1.25) c h)',
  'color-error-dark': 'oklch(from #dc2626 calc(l * 0.75) c h)',
  'color-error-subtle': 'oklch(from #dc2626 l c h / 0.15)',
};

// ---------------------------------------------------------------------------
// Atmosphere type
// ---------------------------------------------------------------------------

export interface AtmosphereDefinition {
  mode: 'dark' | 'light';
  physics: 'glass' | 'flat' | 'retro';
  /**
   * Distribution tier — drives surface filtering:
   *   - 'core'    Free atmospheres shipped with void-energy. Visible in the in-product Themes modal.
   *   - 'catalog' Brand-themed atmospheres for the public /atmospheres gallery only. Hidden from the modal.
   *   - 'custom'  User-imported / runtime-registered atmospheres. Visible in the modal.
   * Absent = treated as 'core' at consumer use-sites.
   */
  tier?: 'core' | 'catalog' | 'custom';
  /**
   * Optional brand profile reference (BRANDS[brand] in src/config/brands/index.ts).
   * Layers radii / motion / type-treatment / per-role weights on top of physics.
   * Atmospheres without a brand reference fall through to physics defaults unchanged.
   */
  brand?: string;
  tagline: string;
  palette: VoidPalette & Record<string, string>;
}

// ---------------------------------------------------------------------------
// FREE atmospheres (ship with void-energy npm package)
//
// Coverage: all 3 physics (glass, flat, retro) + both modes (light, dark)
// ---------------------------------------------------------------------------

export const ATMOSPHERES: Record<string, AtmosphereDefinition> = {
  // 1. FROST — Arctic / Glass (glass dark) — DEFAULT
  frost: {
    mode: 'dark',
    physics: 'glass',
    tier: 'core',
    tagline: 'Arctic / Glass',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.sharp.family,
      'font-atmos-body': FONTS.clean.family,
      'bg-canvas': '#080c14',
      'bg-spotlight': '#141c2e',
      'bg-surface': 'rgba(20, 30, 50, 0.45)',
      'bg-sunk': 'rgba(0, 5, 15, 0.5)',
      'energy-primary': '#7ec8e3',
      'energy-secondary': '#4a6fa5',
      'border-color': 'rgba(126, 200, 227, 0.2)',
      'text-main': '#edf2f7',
      'text-dim': '#a0b0c0',
      'text-mute': '#607080',
    },
  },

  // 2. GRAPHITE — Editor / Neutral (dark flat)
  // Neutral-charcoal archetype (ChatGPT / VS Code Dark Modern / Vercel Geist family).
  // Canvas + spotlight match — no gradient. Surface floats up in luminance for elevation
  // (Apple/VS Code pattern). Energy is in the gray ramp by design — accent IS contrast,
  // not hue.
  graphite: {
    mode: 'dark',
    physics: 'flat',
    tier: 'core',
    tagline: 'Editor / Neutral',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.clean.family,
      'font-atmos-body': FONTS.clean.family,
      'bg-canvas': '#1f1f1f',
      'bg-spotlight': '#1f1f1f',
      'bg-surface': '#2a2a2c',
      'bg-sunk': '#161617',
      'energy-primary': '#ffffff',
      'energy-secondary': '#6e7178',
      'border-color': 'rgba(255, 255, 255, 0.10)',
      'text-main': '#ececee',
      'text-dim': '#b4b6bb',
      'text-mute': '#94989e',
    },
  },

  // 3. TERMINAL — Hacker / Retro (retro dark)
  terminal: {
    mode: 'dark',
    physics: 'retro',
    tier: 'core',
    tagline: 'Hacker / Retro',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.code.family,
      'font-atmos-body': FONTS.code.family,
      'bg-canvas': '#050505',
      'bg-spotlight': '#141414',
      'bg-surface': 'rgba(0, 20, 0, 0.9)',
      'bg-sunk': '#000000',
      'energy-primary': '#f5c518',
      'energy-secondary': '#c9a820',
      'border-color': 'rgba(245, 197, 24, 0.5)',
      'text-main': '#f5c518',
      'text-dim': '#ad8b12',
      'text-mute': '#7d650f',
      'color-premium': '#33e2e6',
    },
  },

  // 4. MERIDIAN — Fintech / Brand (light flat)
  meridian: {
    mode: 'light',
    physics: 'flat',
    tier: 'core',
    tagline: 'Fintech / Brand',

    palette: {
      ...SEMANTIC_LIGHT,
      'font-atmos-heading': FONTS.geometric.family,
      'font-atmos-body': FONTS.clean.family,
      'bg-canvas': '#f4f6f9',
      'bg-spotlight': '#ffffff',
      'bg-surface': '#ffffff',
      'bg-sunk': '#e8ecf1',
      'energy-primary': '#0d6e6e',
      'energy-secondary': '#4a3df7',
      'border-color': 'rgba(13, 110, 110, 0.25)',
      'text-main': '#0f1729',
      'text-dim': '#3d4a5c',
      'text-mute': '#7c8797',
    },
  },

  // 5. NIKE-TEST — Brand axis end-to-end reach proof (Phase 1.5).
  //
  // Palette is a clone of graphite's so the only runtime difference between
  // graphite and nike-test is the brand layer: switching between them in the
  // Themes modal isolates the brand axis as a clean A/B. Real Nike-themed
  // palettes (Nike orange, volt, etc.) land in Phase 3.1 catalog work.
  'nike-test': {
    mode: 'dark',
    physics: 'flat',
    tier: 'core',
    brand: 'nike',
    tagline: 'Brand axis test (Nike)',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.clean.family,
      'font-atmos-body': FONTS.clean.family,
      'bg-canvas': '#1f1f1f',
      'bg-spotlight': '#1f1f1f',
      'bg-surface': '#2a2a2c',
      'bg-sunk': '#161617',
      'energy-primary': '#ffffff',
      'energy-secondary': '#6e7178',
      'border-color': 'rgba(255, 255, 255, 0.10)',
      'text-main': '#ececee',
      'text-dim': '#b4b6bb',
      'text-mute': '#94989e',
    },
  },
};
