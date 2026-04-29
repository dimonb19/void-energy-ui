/**
 * VOID ENERGY UI - Design system configuration (SSOT).
 * This file is the orchestrator: spacing, physics, typography, and structural tokens.
 * Fonts and atmospheres live in their own modules and are re-exported here.
 *
 * References:
 * - @see /THEME-GUIDE.md (palette contract, physics constraints, examples, testing)
 * - @see /CHEAT-SHEET.md
 * - @see /README.md
 *
 * Workflow:
 * 1. Edit this file (or fonts.ts / atmospheres.ts)
 * 2. Run `npm run build:tokens`
 * 3. Apply `data-atmosphere="theme-name"` in HTML
 */

import { FONTS } from './fonts';
import { ATMOSPHERES } from './atmospheres';

// ── Re-exports (backward compatibility) ─────────────────────────────────
// All existing imports from '@config/design-tokens' continue to work.

export {
  FONTS,
  DEFAULT_PRELOAD_WEIGHTS,
  FONT_FAMILY_TO_KEY,
  getThemePreloadFonts,
  getFontDisplayName,
  type FontDefinition,
} from './fonts';

export {
  ATMOSPHERES,
  SEMANTIC_DARK,
  SEMANTIC_LIGHT,
  type AtmosphereDefinition,
} from './atmospheres';

// --------------------------------------------------------------------------
// FOUNDATION TOKENS (Spacing, Breakpoints, Layers, Radius)
// --------------------------------------------------------------------------

/**
 * VOID SPACING SCALE (4px Base Unit System)
 *
 * COMPONENT LEVEL (Tight Progression):
 * - xs  (8px):  Minimum comfortable gap for icons, chips, tight padding
 * - sm  (16px): Standard button padding, small gaps (1rem = industry standard)
 * - md  (24px): Optimal card padding (Material Design, most popular value - 1.5rem)
 * - lg  (32px): Section padding, large gaps (2rem - typographic baseline)
 *
 * LAYOUT LEVEL (Accelerated Progression):
 * - xl  (48px):  Golden Ratio step from lg (32 x 1.5)
 * - 2xl (64px):  Double lg (32 x 2)
 * - 3xl (96px):  Triple lg (32 x 3)
 * - 4xl (128px): Quadruple lg (32 x 4)
 * - 5xl (160px): Quintuple lg (32 x 5)
 *
 * DENSITY SCALING:
 * All values multiply by --density factor (0.75x compact, 1x standard, 1.25x relaxed).
 */
export const VOID_SPACING = {
  xs: '0.5rem', // 8px  (2 x 4px) - Tight padding, icon gaps
  sm: '1rem', // 16px (4 x 4px) - Button padding, small gaps
  md: '1.5rem', // 24px (6 x 4px) - Card padding, standard gaps (most common)
  lg: '2rem', // 32px (8 x 4px) - Section padding, large gaps
  xl: '3rem', // 48px (12 x 4px) - Page margins, hero spacing
  '2xl': '4rem', // 64px (16 x 4px) - Section dividers
  '3xl': '6rem', // 96px (24 x 4px) - Layout spacing
  '4xl': '8rem', // 128px (32 x 4px) - Hero sections
  '5xl': '10rem', // 160px (40 x 4px) - Mega spacing
} as const;

/**
 * Responsive Breakpoints
 * Mobile-first approach with 6 breakpoints
 */
export const VOID_RESPONSIVE = {
  mobile: '0px',
  tablet: '768px',
  'small-desktop': '1024px',
  'large-desktop': '1440px',
  'full-hd': '1920px',
  'quad-hd': '2560px',
} as const;

/**
 * Container Max-Widths
 * Responsive container constraints per breakpoint
 */
export const VOID_CONTAINER = {
  mobile: '100%',
  tablet: '720px',
  'small-desktop': '960px',
  'large-desktop': '1320px',
  'full-hd': '1600px',
  'quad-hd': '1920px',
} as const;

/**
 * Z-Index Layers
 * Semantic z-index scale for stacking context management
 */
export const VOID_LAYERS = {
  sunk: '-1', // Below canvas (background patterns)
  floor: '0', // Canvas level
  base: '1', // Default element layer
  decorate: '2', // Decorative elements
  float: '10', // Floating UI elements
  sticky: '20', // Sticky headers/navigation
  header: '40', // Main header
  dropdown: '50', // Dropdown menus
  overlay: '90', // Modals, dialogs, overlays
} as const;

/**
 * Border Radius Scale
 * Used by Physics Engine for surface curvature
 */
export const VOID_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  full: '9999px', // Pill shape
} as const;

/**
 * AMBIENT LAYER TOKENS
 *
 * Global constants consumed by @void-energy/ambient-layers.
 * These are intentional raw colors (sepia tint, glitch RGB-split, night/warm/neon
 * environment washes) that previously lived inline as `// void-ignore` values in
 * the package's SCSS. Exposing them as CSS variables lets consumers retheme
 * ambient effects without forking the package, while package SCSS keeps the raw
 * value as a `var(..., fallback)` so it stays standalone-usable.
 */
export const VOID_AMBIENT = {
  // Flashback — sepia wash
  'ambient-sepia-shadow': '#3a2a1a',
  'ambient-sepia-wash': 'rgba(120, 80, 40, 0.15)',
  // Glitch — RGB-split chroma
  'ambient-glitch-r': 'rgba(255, 0, 100, 0.3)',
  'ambient-glitch-b': 'rgba(0, 200, 255, 0.3)',
  // Night environment — cool deep-blue wash
  'ambient-night-top': 'rgba(20, 30, 60, 0.45)',
  'ambient-night-bottom': 'rgba(10, 15, 35, 0.55)',
  // Neon environment — cyberpunk magenta/cyan
  'ambient-neon-a': 'rgba(255, 0, 200, 0.2)',
  'ambient-neon-b': 'rgba(0, 200, 255, 0.2)',
  // Dawn environment — sunrise sky gradient + horizon bloom
  'ambient-dawn-bloom': 'rgba(255, 225, 180, 0.55)',
  'ambient-dawn-peach': 'rgba(255, 170, 130, 0.4)',
  'ambient-dawn-sky': 'rgba(60, 80, 130, 0.4)',
  'ambient-dawn-mid': 'rgba(200, 140, 160, 0.28)',
  'ambient-dawn-horizon': 'rgba(255, 190, 150, 0.4)',
} as const;

/**
 * AURA TOKENS
 *
 * Geometry + timing for the ambient colored glow primitive (use:aura). Single
 * values — not physics-adaptive. Aura is active on dark glass and dark flat
 * only; light mode and retro disable the effect at the SCSS layer.
 */
export const VOID_AURA = {
  'aura-spread-near': '24px',
  'aura-spread-far': '80px',
  'aura-opacity-near': 0.45,
  'aura-opacity-far': 0.25,
  'aura-transition-duration': '1.5s',
} as const;

// --------------------------------------------------------------------------
// TYPOGRAPHY TOKENS (Font Scales, Weights, Line Heights)
// --------------------------------------------------------------------------

export const VOID_TYPOGRAPHY = {
  scales: {
    caption: {
      fontSize: 'clamp(0.6875rem, 0.66rem + 0.15vw, 0.75rem)',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
    },
    small: {
      fontSize: 'clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem)',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body: {
      fontSize: 'clamp(0.875rem, 0.8rem + 0.2vw, 1rem)',
      lineHeight: 1.5,
      letterSpacing: '0.005em',
    },
    h6: {
      fontSize: 'clamp(0.875rem, 0.8rem + 0.2vw, 1rem)',
      lineHeight: 1.45,
      letterSpacing: '0.005em',
    },
    h5: {
      fontSize: 'clamp(1rem, 0.95rem + 0.5vw, 1.25rem)',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: 'clamp(1.125rem, 1rem + 1vw, 1.5rem)',
      lineHeight: 1.3,
      letterSpacing: '0em',
      tabletOverride: 'clamp(1.125rem, 2.41vw, 1.5rem)',
    },
    h3: {
      fontSize: 'clamp(1.25rem, 1.1rem + 1.5vw, 2rem)',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      tabletOverride: 'clamp(1.25rem, 3.01vw, 2rem)',
    },
    h2: {
      fontSize: 'clamp(1.5rem, 1.25rem + 2vw, 2.5rem)',
      lineHeight: 1.15,
      letterSpacing: '-0.015em',
      tabletOverride: 'clamp(1.5rem, 3.76vw, 2.5rem)',
    },
    h1: {
      fontSize: 'clamp(2rem, 1.5rem + 3vw, 3.5rem)',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      tabletOverride: 'clamp(2rem, 5vw, 3.5rem)',
    },
  },

  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  families: {
    heading: FONTS.tech.family,
    body: FONTS.clean.family,
    mono: FONTS.code.family,
  },
} as const;

// --------------------------------------------------------------------------
// STRUCTURAL CONSTANTS (Layout & Component Dimensions)
// --------------------------------------------------------------------------

const STRUCTURAL_MODAL = {
  xs: '24rem',
  sm: '32rem',
  md: '40rem',
  lg: '64rem',
  xl: '75rem',
} as const;

// --------------------------------------------------------------------------
// VOID_TOKENS — Master orchestrator
// --------------------------------------------------------------------------

export const VOID_TOKENS = {
  density: {
    scale: VOID_SPACING,
    factors: {
      high: 0.75,
      standard: 1,
      low: 1.25,
    },
  },

  container: {
    ...VOID_CONTAINER,
  },

  layers: {
    ...VOID_LAYERS,
  },

  responsive: {
    ...VOID_RESPONSIVE,
  },

  structural: {
    'modal-width-xs': STRUCTURAL_MODAL.xs,
    'modal-width-sm': STRUCTURAL_MODAL.sm,
    'modal-width-md': STRUCTURAL_MODAL.md,
    'modal-width-lg': STRUCTURAL_MODAL.lg,
    'modal-width-xl': STRUCTURAL_MODAL.xl,
    'tooltip-max-width': '250px',
    'dialog-gutter': 'var(--space-xl)',
    'dialog-gutter-lg': 'var(--space-2xl)',
  },

  physics: {
    glass: {
      radiusBase: VOID_RADIUS.md,
      radiusFull: VOID_RADIUS.full,
      blur: 20,
      borderWidth: 1,
      speedInstant: 100,
      speedFast: 200,
      speedBase: 300,
      speedSlow: 500,
      delayCascade: 50,
      delaySequence: 100,
      easeSpringGentle: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      easeSpringSnappy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      easeSpringBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      easeFlow: 'linear',
      lift: '-3px',
      scale: 1.02,
    },
    flat: {
      radiusBase: VOID_RADIUS.md,
      radiusFull: VOID_RADIUS.full,
      blur: 0,
      borderWidth: 1,
      speedInstant: 80,
      speedFast: 133,
      speedBase: 280,
      speedSlow: 350,
      delayCascade: 40,
      delaySequence: 80,
      easeSpringGentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easeSpringSnappy: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      easeSpringBounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
      easeFlow: 'ease-in-out',
      lift: '0px',
      scale: 1,
    },
    retro: {
      radiusBase: '0px',
      radiusFull: '0px',
      blur: 0,
      borderWidth: 2,
      speedInstant: 0,
      speedFast: 0,
      speedBase: 0,
      speedSlow: 0,
      delayCascade: 0,
      delaySequence: 0,
      easeSpringGentle: 'steps(2)',
      easeSpringSnappy: 'steps(2)',
      easeSpringBounce: 'steps(4)',
      easeFlow: 'steps(4)',
      lift: '-2px',
      scale: 1,
      shadowOffset: '3px',
    },
  },

  ambient: {
    ...VOID_AMBIENT,
  },

  aura: {
    ...VOID_AURA,
  },

  // Theme registry: atmospheres defined in src/config/atmospheres.ts
  themes: {
    ...ATMOSPHERES,
  },
};
