/**
 * 🌌 VOID ENERGY UI - Design system configuration (SSOT).
 * This file is the single source of truth for tokens and themes.
 *
 * References:
 * - @see /THEME-GUIDE.md (palette contract, physics constraints, examples, testing)
 * - @see /CHEAT-SHEET.md
 * - @see /README.md
 *
 * Workflow:
 * 1. Edit this file
 * 2. Run `npm run build:tokens`
 * 3. Apply `data-atmosphere="theme-name"` in HTML
 */

// --------------------------------------------------------------------------
// 🏗️ FOUNDATION TOKENS (Spacing, Breakpoints, Layers, Radius)
// --------------------------------------------------------------------------

/**
 * 📏 VOID SPACING SCALE (4px Base Unit System)
 *
 * MATHEMATICAL FOUNDATION:
 * - Base unit: 4px (0.25rem) - Aligns with pixel grids, WCAG touch targets (44px)
 * - Dual-speed progression for component-level (xs-lg) and layout-level (xl-5xl) control
 *
 * COMPONENT LEVEL (Tight Progression):
 * - xs  (8px):  Minimum comfortable gap for icons, chips, tight padding
 * - sm  (16px): Standard button padding, small gaps (1rem = industry standard)
 * - md  (24px): Optimal card padding (Material Design, most popular value - 1.5rem)
 * - lg  (32px): Section padding, large gaps (2rem - typographic baseline)
 *
 * LAYOUT LEVEL (Accelerated Progression):
 * - xl  (48px):  Golden Ratio step from lg (32 × 1.5) - Classic "large step" in typography
 * - 2xl (64px):  Double lg (32 × 2) - Natural visual "block" unit, section dividers
 * - 3xl (96px):  Triple lg (32 × 3) - Layout spacing, matches typographic systems
 * - 4xl (128px): Quadruple lg (32 × 4) - Hero sections, dramatic spacing
 * - 5xl (160px): Quintuple lg (32 × 5) - Mega spacing for large hero areas
 *
 * DENSITY SCALING:
 * All values multiply by --density factor (0.75x compact, 1x standard, 1.25x relaxed)
 * to respect user preferences. Implementation: calc(N * var(--unit) * var(--density, 1))
 *
 * INDUSTRY ALIGNMENT:
 * This scale is identical to Tailwind CSS spacing (2/4/6/8/12/16/24/32/40),
 * ensuring familiarity for developers and easy integration with Tailwind utilities.
 *
 * ACCESSIBILITY:
 * - 4px base ensures pixel-perfect rendering on all displays
 * - All touch targets built from this scale meet WCAG minimum (44px)
 * - Dynamic density scaling supports motor disabilities
 *
 * @see /CHEAT-SHEET.md (Section: "Spacing Philosophy & Mathematical Reasoning")
 * @see /src/styles/base/_reset.scss:9-79 (Density Engine implementation)
 */
export const VOID_SPACING = {
  xs: '0.5rem', // 8px  (2 × 4px) - Tight padding, icon gaps
  sm: '1rem', // 16px (4 × 4px) - Button padding, small gaps
  md: '1.5rem', // 24px (6 × 4px) - Card padding, standard gaps (most common)
  lg: '2rem', // 32px (8 × 4px) - Section padding, large gaps
  xl: '3rem', // 48px (12 × 4px) - Page margins, hero spacing
  '2xl': '4rem', // 64px (16 × 4px) - Section dividers
  '3xl': '6rem', // 96px (24 × 4px) - Layout spacing
  '4xl': '8rem', // 128px (32 × 4px) - Hero sections
  '5xl': '10rem', // 160px (40 × 4px) - Mega spacing
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

// --------------------------------------------------------------------------
// SHARED ASSETS (Fonts & Colors)
// --------------------------------------------------------------------------

/**
 * Default font weights to preload via <link rel="preload">.
 *
 * 400 (regular) + 700 (bold) covers ~90% of initial viewport text.
 * Non-critical weights (300, 500, 600) load on-demand via @font-face with font-display: swap.
 */
export const DEFAULT_PRELOAD_WEIGHTS = [400, 700] as const;

/**
 * Font Definition System (Single Source of Truth)
 *
 * Each font entry contains:
 * - family: CSS font-family string with fallbacks
 * - files: Weight → filename mapping (generates @font-face rules)
 * - preloadWeights: (optional) Override DEFAULT_PRELOAD_WEIGHTS if needed
 *
 * This definition is used to generate:
 * 1. _fonts.scss (@font-face declarations)
 * 2. font-registry.ts (preload mappings)
 */
export interface FontDefinition {
  family: string;
  files: Record<number, string>;
  /** Override DEFAULT_PRELOAD_WEIGHTS if this font needs different preload behavior */
  preloadWeights?: number[];
}

export const FONTS: Record<string, FontDefinition> = {
  tech: {
    family: "'Hanken Grotesk', sans-serif",
    files: {
      300: 'HankenGrotesk-Light.woff2',
      400: 'HankenGrotesk-Regular.woff2',
      500: 'HankenGrotesk-Medium.woff2',
      600: 'HankenGrotesk-SemiBold.woff2',
      700: 'HankenGrotesk-Bold.woff2',
    },
  },
  clean: {
    family: "'Inter', sans-serif",
    files: {
      400: 'Inter-Regular.woff2',
      500: 'Inter-Medium.woff2',
      600: 'Inter-SemiBold.woff2',
      700: 'Inter-Bold.woff2',
    },
  },
  code: {
    family: "'Courier Prime', monospace",
    files: {
      400: 'CourierPrime-Regular.woff2',
      700: 'CourierPrime-Bold.woff2',
    },
  },
  horror: {
    family: "'Merriweather', serif",
    files: {
      400: 'Merriweather24pt-Regular.woff2',
      700: 'Merriweather24pt-Bold.woff2',
    },
  },
  nature: {
    family: "'Lora', serif",
    files: {
      400: 'Lora-Regular.woff2',
      700: 'Lora-Bold.woff2',
    },
  },
  hand: {
    family: "'Caveat', cursive",
    files: {
      400: 'Caveat-Regular.woff2',
      700: 'Caveat-Bold.woff2',
    },
  },
  book: {
    family: "'PT Serif Caption', serif",
    files: {
      400: 'PTSerifCaption-Regular.woff2',
      700: 'PTSerif-Bold.woff2',
    },
  },
  arcane: {
    family: "'Cinzel', serif",
    files: {
      400: 'Cinzel-Regular.woff2',
      700: 'Cinzel-Bold.woff2',
    },
  },
  mystic: {
    family: "'Exo 2', sans-serif",
    files: {
      400: 'Exo2-Regular.woff2',
      700: 'Exo2-Bold.woff2',
    },
  },
  lab: {
    family: "'Open Sans', sans-serif",
    files: {
      400: 'OpenSans-Regular.woff2',
      500: 'OpenSans-Medium.woff2',
      600: 'OpenSans-SemiBold.woff2',
      700: 'OpenSans-Bold.woff2',
    },
  },
  fun: {
    family: "'Comic Neue', sans-serif",
    files: {
      400: 'ComicNeue-Regular.woff2',
      700: 'ComicNeue-Bold.woff2',
    },
  },
};

const SEMANTIC_DARK = {
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

const SEMANTIC_LIGHT = {
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

// --------------------------------------------------------------------------
// TYPOGRAPHY TOKENS (Font Scales, Weights, Line Heights)
// --------------------------------------------------------------------------

export const VOID_TYPOGRAPHY = {
  // Font Scales (Responsive clamp values for fluid typography)
  scales: {
    // Mobile: 11px -> Desktop: 14px
    caption: {
      fontSize: 'clamp(0.6875rem, 0.65rem + 0.25vw, 0.875rem)',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
    },
    // Mobile: 12px -> Desktop: 16px
    small: {
      fontSize: 'clamp(0.75rem, 0.7rem + 0.3vw, 1rem)',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    // Mobile: 14px (0.875rem) -> Desktop: 18px (1.125rem)
    body: {
      fontSize: 'clamp(0.875rem, 0.8rem + 0.5vw, 1.125rem)',
      lineHeight: 1.5,
      letterSpacing: '0.005em',
    },
    // Mobile: 16px -> Desktop: 20px
    h5: {
      fontSize: 'clamp(1rem, 0.95rem + 0.5vw, 1.25rem)',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    // Mobile: 18px -> Desktop: 24px
    h4: {
      fontSize: 'clamp(1.125rem, 1rem + 1vw, 1.5rem)',
      lineHeight: 1.3,
      letterSpacing: '0em',
      // Tablet Override: restores visual hierarchy (ratio 1.25 with H3)
      tabletOverride: 'clamp(1.125rem, 2.41vw, 1.5rem)',
    },
    // Mobile: 20px -> Desktop: 32px
    h3: {
      fontSize: 'clamp(1.25rem, 1.1rem + 1.5vw, 2rem)',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      // Tablet Override: restores visual hierarchy (ratio 1.25 with H2)
      tabletOverride: 'clamp(1.25rem, 3.01vw, 2rem)',
    },
    // Mobile: 24px -> Desktop: 40px
    h2: {
      fontSize: 'clamp(1.5rem, 1.25rem + 2vw, 2.5rem)',
      lineHeight: 1.15,
      letterSpacing: '-0.015em',
      // Tablet Override: restores visual hierarchy (ratio 1.33 with H1)
      tabletOverride: 'clamp(1.5rem, 3.76vw, 2.5rem)',
    },
    // Mobile: 32px -> Desktop: 56px (High Contrast Hero)
    h1: {
      fontSize: 'clamp(2rem, 1.5rem + 3vw, 3.5rem)',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      // Tablet Override: clamp(2rem, 5vw, 3.5rem)
      tabletOverride: 'clamp(2rem, 5vw, 3.5rem)',
    },
  },

  // Font Weights (Graduated hierarchy)
  weights: {
    regular: 400, // Body, Input data
    medium: 500, // Card Title (h5)
    semibold: 600, // Subsection (h3, h4)
    bold: 700, // Structural (h1, h2)
    extrabold: 800, // CTA buttons, high emphasis
  },

  // Font Families (Atmosphere-specific, defined in themes)
  // These are defaults, actual fonts come from theme.palette['font-atmos-heading']
  families: {
    heading: FONTS.tech.family, // Default for headings
    body: FONTS.clean.family, // Default for body
    mono: FONTS.code.family, // Default for code
  },
} as const;

// --------------------------------------------------------------------------
// STRUCTURAL CONSTANTS (Layout & Component Dimensions)
// --------------------------------------------------------------------------

// Structural constants for component dimensions
// Note: Modal widths are flattened for SCSS generation in VOID_TOKENS.structural
const STRUCTURAL_MODAL = {
  xs: '24rem',
  sm: '32rem',
  md: '40rem',
  lg: '64rem',
  xl: '75rem',
} as const;

// --------------------------------------------------------------------------
// CONFIGURATION (Edit below)
// --------------------------------------------------------------------------

export const VOID_TOKENS = {
  // 1. DENSITY MAPS (Space & Scale)
  // Controls the global whitespace density of the application.
  density: {
    scale: VOID_SPACING,
    factors: {
      high: 0.75, // Compact
      standard: 1, // Default
      low: 1.25, // Relaxed
    },
  },

  container: {
    ...VOID_CONTAINER,
  },

  // 2. LAYERS
  layers: {
    ...VOID_LAYERS,
  },

  // 3. RESPONSIVE
  // We explicitly define px values here to ensure SCSS and JS match perfectly.
  responsive: {
    ...VOID_RESPONSIVE,
  },

  // 4. STRUCTURAL CONSTANTS
  // Layout constraints and component-specific dimensions
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

  // 5. PHYSICS ENGINE (Time & Matter)
  // Defines how elements move and feel.
  //
  // EASING PHILOSOPHY:
  // We use cubic-bezier curves that approximate spring-like motion.
  // These provide organic, natural-feeling animations without the complexity
  // of true physics simulation.
  //
  physics: {
    glass: {
      radiusBase: VOID_RADIUS.md,
      radiusFull: VOID_RADIUS.full,
      blur: 20,
      borderWidth: 1,
      // Animation Durations (Complete Scale)
      speedInstant: 100, // Micro-feedback (button press)
      speedFast: 200, // Quick transitions
      speedBase: 300, // Standard motion
      speedSlow: 500, // Dramatic reveals
      // Animation Delays (Cascading Effects)
      delayCascade: 50, // Stagger delay for list items
      delaySequence: 100, // Sequential animation delay
      // Spring Easing Functions (Organic Motion)
      // These cubic-beziers approximate spring physics behavior
      easeSpringGentle: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Soft overshoot, like a gentle bounce
      easeSpringSnappy: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Quick settle with subtle overshoot
      easeSpringBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Visible bounce-back effect
      easeFlow: 'linear', // Continuous motion (scrolling, progress)
      // Interaction Feedback
      lift: '-3px',
      scale: 1.02,
    },
    flat: {
      radiusBase: VOID_RADIUS.sm,
      radiusFull: VOID_RADIUS.full,
      blur: 0,
      borderWidth: 1,
      // Animation Durations (Complete Scale)
      speedInstant: 80,
      speedFast: 133,
      speedBase: 280,
      speedSlow: 350,
      // Animation Delays (Cascading Effects)
      delayCascade: 40,
      delaySequence: 80,
      // Spring Easing Functions (Subtle, Professional)
      // Flat physics uses gentler springs - less playful, more refined
      easeSpringGentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth deceleration
      easeSpringSnappy: 'cubic-bezier(0.22, 0.61, 0.36, 1)', // Quick but not bouncy
      easeSpringBounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)', // Minimal overshoot
      easeFlow: 'ease-in-out',
      // Interaction Feedback
      lift: '-2px',
      scale: 1.01,
    },
    retro: {
      radiusBase: '0px',
      radiusFull: '0px',
      blur: 0,
      borderWidth: 2,
      // Animation Durations (Instant for Retro)
      speedInstant: 0,
      speedFast: 0,
      speedBase: 0,
      speedSlow: 0,
      // Animation Delays (No delays in Retro)
      delayCascade: 0,
      delaySequence: 0,
      // Step-based Easing (CRT/Terminal aesthetic)
      // No springs - retro is deliberately mechanical
      easeSpringGentle: 'steps(2)',
      easeSpringSnappy: 'steps(2)',
      easeSpringBounce: 'steps(4)',
      easeFlow: 'steps(4)',
      // Interaction Feedback
      lift: '-2px',
      scale: 1,
      // Retro-specific shadow offset (hard pixel shadow)
      shadowOffset: '3px',
    },
  },

  // 3. THEME REGISTRY (Color & Mood)
  // ARCHITECTURAL CONSTRAINT:
  // - Physics: 'glass'  MUST use mode: 'dark' (Glows require darkness)
  // - Physics: 'retro'  MUST use mode: 'dark' (CRT phosphor effect)
  // - Physics: 'flat'   Works best with mode: 'light', but allows 'dark'.
  themes: {
    // 1. [DEFAULT THEME] - The Void
    void: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Default / Cyber',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.tech.family,
        'font-atmos-body': FONTS.tech.family,
        'bg-canvas': '#010020', // Deep blue-black
        'bg-spotlight': '#0a0c2b', // Blue-navy
        'bg-surface': 'rgba(22, 30, 95, 0.4)', // Blue glass
        'bg-sunk': 'rgba(0, 2, 41, 0.6)', // Deep blue
        'energy-primary': '#33e2e6', // Cyan
        'energy-secondary': '#3875fa', // Blue
        'border-color': 'rgba(56, 117, 250, 0.2)', // 20% blue
        'text-main': '#ffffff', // White
        'text-dim': '#d9d9de', // Soft white
        'text-mute': '#9999a6', // Muted gray-blue
      },
    },

    // 2. ONYX - Stealth / Cinema
    onyx: {
      mode: 'dark',
      physics: 'flat',
      tagline: 'Stealth / Cinema',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.clean.family,
        'font-atmos-body': FONTS.clean.family,
        'bg-canvas': '#000000', // Pure black
        'bg-spotlight': '#1c1c1c', // Dark gray
        'bg-surface': '#1e1e1e', // Charcoal
        'bg-sunk': '#000000', // Pure black
        'energy-primary': '#ffffff', // White
        'energy-secondary': '#a3a3a3', // Gray
        'border-color': 'rgba(255, 255, 255, 0.15)', // 15% white
        'text-main': '#ffffff', // White
        'text-dim': '#a3a3a3', // Gray
        'text-mute': '#7a7a7a', // Dark gray
      },
    },

    // 3. TERMINAL - Hacker / Retro
    terminal: {
      mode: 'dark',
      physics: 'retro', // Triggers Pixel fonts & Instant motion
      tagline: 'Hacker / Retro',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.code.family,
        'font-atmos-body': FONTS.code.family,
        'bg-canvas': '#050505', // Near-black
        'bg-spotlight': '#141414', // Very dark gray
        'bg-surface': 'rgba(0, 20, 0, 0.9)', // Green-tinted glass
        'bg-sunk': '#000000', // Pure black
        'energy-primary': '#f5c518', // Amber
        'energy-secondary': '#c9a820', // Dim amber
        'border-color': 'rgba(245, 197, 24, 0.5)', // 50% amber
        'text-main': '#f5c518', // Amber
        'text-dim': '#ad8b12', // Dark amber
        'text-mute': '#7d650f', // Deep amber
        'color-premium': '#33e2e6', // Cyan
      },
    },

    // 4. NEBULA - Synthwave / Cosmic
    nebula: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Synthwave / Cosmic',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.mystic.family,
        'font-atmos-body': FONTS.clean.family,
        'bg-canvas': '#0a0014', // Deep purple
        'bg-spotlight': '#240046', // Bright purple
        'bg-surface': 'rgba(20, 0, 40, 0.6)', // Purple glass
        'bg-sunk': 'rgba(10, 0, 20, 0.8)', // Deep purple
        'energy-primary': '#d946ef', // Magenta
        'energy-secondary': '#8b5cf6', // Purple
        'border-color': 'rgba(217, 70, 239, 0.2)', // 20% magenta
        'text-main': '#fdf4ff', // Purple-white
        'text-dim': '#d0bde8', // Lavender
        'text-mute': '#8e7ea1', // Muted violet
      },
    },

    // 5. SOLAR - Royal / Gold
    solar: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Royal / Gold',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.arcane.family,
        'font-atmos-body': FONTS.book.family,
        'bg-canvas': '#120a00', // Deep brown-black
        'bg-spotlight': '#2b1d00', // Dark brown
        'bg-surface': 'rgba(20, 10, 0, 0.6)', // Brown glass
        'bg-sunk': 'rgba(0, 0, 0, 0.4)', // Dark shadow
        'energy-primary': '#ffaa00', // Gold
        'energy-secondary': '#b8860b', // Dark gold
        'border-color': 'rgba(255, 170, 0, 0.25)', // 25% gold
        'color-premium': '#0284c7', // Sapphire
        'text-main': '#fffbea', // Warm cream
        'text-dim': '#dbd4bb', // Warm beige
        'text-mute': '#a09984', // Muted tan
      },
    },

    // 6. OVERGROWTH - Nature / Organic
    overgrowth: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Nature / Organic',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.nature.family,
        'font-atmos-body': FONTS.nature.family,
        'bg-canvas': '#051a0a', // Deep forest
        'bg-spotlight': '#0e2e14', // Dark green
        'bg-surface': 'rgba(0, 40, 10, 0.5)', // Green glass
        'bg-sunk': 'rgba(0, 20, 5, 0.8)', // Deep green
        'energy-primary': '#39ff14', // Neon green
        'energy-secondary': '#c8a84b', // Wheat gold
        'border-color': 'rgba(57, 255, 20, 0.2)', // 20% neon green
        'text-main': '#f0fff4', // Cool white
        'text-dim': '#a1d1a2', // Sage
        'text-mute': '#7aa37c', // Muted sage
      },
    },

    // 7. VELVET - Romance / Soft
    velvet: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Romance / Soft',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.hand.family,
        'font-atmos-body': FONTS.book.family,
        'bg-canvas': '#1a0510', // Deep burgundy
        'bg-spotlight': '#2e0b1d', // Dark rose
        'bg-surface': 'rgba(50, 0, 20, 0.5)', // Rose glass
        'bg-sunk': 'rgba(30, 0, 10, 0.8)', // Deep rose
        'energy-primary': '#ff80a0', // Soft pink
        'energy-secondary': '#e91e8c', // Vivid magenta
        'border-color': 'rgba(255, 128, 160, 0.2)', // 20% pink
        'text-main': '#fff0f5', // Rose white
        'text-dim': '#e8b5c8', // Blush
        'text-mute': '#ba8091', // Muted rose
      },
    },

    // 8. CRIMSON - Horror / Intense
    crimson: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Horror / Intense',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.horror.family,
        'font-atmos-body': FONTS.horror.family,
        'bg-canvas': '#180808', // Deep blood
        'bg-spotlight': '#2b0f0f', // Dark red
        'bg-surface': 'rgba(60, 0, 0, 0.6)', // Red glass
        'bg-sunk': 'rgba(20, 0, 0, 0.8)', // Deep red
        'energy-primary': '#ff6b6b', // Coral red
        'energy-secondary': '#c0392b', // Oxblood
        'border-color': 'rgba(255, 107, 107, 0.2)', // 20% coral
        'text-main': '#ffe5e5', // Rose white
        'text-dim': '#e8b5b5', // Blush red
        'text-mute': '#ba8080', // Muted red
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // LIGHT THEMES (neutral → vibrant)
    // ─────────────────────────────────────────────────────────────────────────

    // 9. PAPER - Light / Print
    paper: {
      mode: 'light',
      physics: 'flat', // No blurs, sharp borders
      tagline: 'Light / Print',
      palette: {
        ...SEMANTIC_LIGHT,
        'font-atmos-heading': FONTS.book.family,
        'font-atmos-body': FONTS.book.family,
        'bg-canvas': '#faeed1', // Aged parchment
        'bg-spotlight': '#fff8e1', // Warm white
        'bg-surface': '#fdf6e3', // Cream
        'bg-sunk': 'rgba(0, 0, 0, 0.03)', // Subtle shadow
        'energy-primary': '#2c3e50', // Slate
        'energy-secondary': '#8d6e63', // Warm brown
        'border-color': 'rgba(141, 110, 99, 0.7)', // 70% brown
        'text-main': '#2d2420', // Dark brown
        'text-dim': '#4e4239', // Mid brown
        'text-mute': '#796b61', // Muted brown
      },
    },

    // 10. FOCUS - Distraction Free
    focus: {
      mode: 'light',
      physics: 'flat',
      tagline: 'Distraction Free',
      palette: {
        ...SEMANTIC_LIGHT,
        'font-atmos-heading': FONTS.clean.family,
        'font-atmos-body': FONTS.clean.family,
        'bg-canvas': '#ffffff', // White
        'bg-spotlight': '#f5f5f5', // Off-white
        'bg-surface': '#ffffff', // White
        'bg-sunk': '#f0f0f0', // Light gray
        'energy-primary': '#000000', // Black
        'energy-secondary': '#000000', // Black
        'border-color': 'rgba(0, 0, 0, 0.15)', // 15% black
        'text-main': '#000000', // Black
        'text-dim': '#222222', // Near black
        'text-mute': '#444444', // Dark gray
      },
    },

    // 11. LABORATORY - Science / Clinical
    laboratory: {
      mode: 'light',
      physics: 'flat',
      tagline: 'Science / Clinical',
      palette: {
        ...SEMANTIC_LIGHT,
        'font-atmos-heading': FONTS.lab.family,
        'font-atmos-body': FONTS.lab.family,
        'bg-canvas': '#f1f5f9', // Cool gray
        'bg-spotlight': '#ffffff', // White
        'bg-surface': '#ffffff', // White
        'bg-sunk': 'rgba(0, 0, 0, 0.05)', // Subtle shadow
        'energy-primary': '#005bb5', // Deep blue
        'energy-secondary': '#3d7ab5', // Medium blue
        'border-color': 'rgba(0, 91, 181, 0.35)', // 35% blue
        'text-main': '#0f172a', // Navy
        'text-dim': '#334155', // Slate gray
        'text-mute': '#64748b', // Slate
      },
    },

    // 12. PLAYGROUND - Playful / Vibrant
    playground: {
      mode: 'light',
      physics: 'flat',
      tagline: 'Playful / Vibrant',
      palette: {
        ...SEMANTIC_LIGHT,
        'font-atmos-heading': FONTS.fun.family,
        'font-atmos-body': FONTS.fun.family,
        'bg-canvas': '#e0f7fa', // Aqua tint
        'bg-spotlight': '#ffffff', // White
        'bg-surface': '#ffffff', // White
        'bg-sunk': 'rgba(0, 0, 0, 0.05)', // Subtle shadow
        'energy-primary': '#ff4081', // Hot pink
        'energy-secondary': '#0088a8', // Deep cyan
        'border-color': 'rgba(0, 188, 212, 0.4)', // 40% cyan
        'text-main': '#003040', // Deep teal
        'text-dim': '#1a4a55', // Dark teal
        'text-mute': '#4a7a85', // Muted teal
      },
    },
  },
};

// --------------------------------------------------------------------------
// FONT UTILITIES (For Build-Time Generation)
// --------------------------------------------------------------------------

/**
 * Reverse lookup: font-family string → font key
 * Used by generate-tokens.ts to find which font files to preload for a theme.
 */
export const FONT_FAMILY_TO_KEY: Record<string, keyof typeof FONTS> =
  Object.fromEntries(
    Object.entries(FONTS).map(([key, def]) => [
      def.family,
      key as keyof typeof FONTS,
    ]),
  ) as Record<string, keyof typeof FONTS>;

/**
 * Get preload files for a theme based on its font families.
 * Returns an array of font file paths to preload.
 */
export function getThemePreloadFonts(
  themeId: keyof typeof VOID_TOKENS.themes,
): string[] {
  const theme = VOID_TOKENS.themes[themeId];
  if (!theme) return [];

  const headingFamily = theme.palette['font-atmos-heading'];
  const bodyFamily = theme.palette['font-atmos-body'];

  const files: string[] = [];
  const seenFamilies = new Set<string>();

  for (const family of [headingFamily, bodyFamily]) {
    if (seenFamilies.has(family)) continue;
    seenFamilies.add(family);

    const fontKey = FONT_FAMILY_TO_KEY[family];
    if (!fontKey) continue;

    const fontDef = FONTS[fontKey];
    const preloadWeights = fontDef.preloadWeights ?? DEFAULT_PRELOAD_WEIGHTS;
    for (const weight of preloadWeights) {
      const file = fontDef.files[weight];
      if (file) {
        files.push(`/fonts/${file}`);
      }
    }
  }

  return files;
}

/**
 * Get user-selectable font name from font key.
 * Extracts the display name from the font-family string.
 */
export function getFontDisplayName(fontKey: keyof typeof FONTS): string {
  const family = FONTS[fontKey].family;
  // Extract name from "'Font Name', fallback" format
  const match = family.match(/^'([^']+)'/);
  return match ? match[1] : fontKey;
}
