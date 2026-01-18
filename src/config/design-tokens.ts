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
  sink: '-1', // Below canvas (background patterns)
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

const FONTS = {
  tech: "'Hanken Grotesk', sans-serif",
  clean: "'Inter', sans-serif",
  code: "'Courier Prime', monospace",
  horror: "'Merriweather', serif",
  nature: "'Lora', serif",
  hand: "'Caveat', cursive",
  book: "'PT Serif Caption', serif",
  arcane: "'Cinzel', serif",
  mystic: "'Exo 2', sans-serif",
  lab: "'Open Sans', sans-serif",
  fun: "'Comic Neue', sans-serif",
};

const SEMANTIC_DARK = {
  // Base Colors
  'color-premium': '#ff8c00', // Gold/Orange
  'color-system': '#a078ff', // Purple
  'color-success': '#00e055', // Green
  'color-error': '#ff3c40', // Red
  // Tint/Shade Variants (Generated via OKLCH in SCSS)
  'color-premium-light': 'oklch(from #ff8c00 calc(l * 1.2) c h)',
  'color-premium-dark': 'oklch(from #ff8c00 calc(l * 0.8) c h)',
  'color-premium-subtle': 'oklch(from #ff8c00 l c h / 0.15)',
  'color-system-light': 'oklch(from #a078ff calc(l * 1.2) c h)',
  'color-system-dark': 'oklch(from #a078ff calc(l * 0.8) c h)',
  'color-system-subtle': 'oklch(from #a078ff l c h / 0.15)',
  'color-success-light': 'oklch(from #00e055 calc(l * 1.2) c h)',
  'color-success-dark': 'oklch(from #00e055 calc(l * 0.8) c h)',
  'color-success-subtle': 'oklch(from #00e055 l c h / 0.15)',
  'color-error-light': 'oklch(from #ff3c40 calc(l * 1.2) c h)',
  'color-error-dark': 'oklch(from #ff3c40 calc(l * 0.8) c h)',
  'color-error-subtle': 'oklch(from #ff3c40 l c h / 0.15)',
};

const SEMANTIC_LIGHT = {
  // Base Colors
  'color-premium': '#b45309',
  'color-system': '#6d28d9',
  'color-success': '#15803d',
  'color-error': '#dc2626',
  // Tint/Shade Variants (Generated via OKLCH in SCSS)
  'color-premium-light': 'oklch(from #b45309 calc(l * 1.3) c h)',
  'color-premium-dark': 'oklch(from #b45309 calc(l * 0.7) c h)',
  'color-premium-subtle': 'oklch(from #b45309 l c h / 0.15)',
  'color-system-light': 'oklch(from #6d28d9 calc(l * 1.3) c h)',
  'color-system-dark': 'oklch(from #6d28d9 calc(l * 0.7) c h)',
  'color-system-subtle': 'oklch(from #6d28d9 l c h / 0.15)',
  'color-success-light': 'oklch(from #15803d calc(l * 1.3) c h)',
  'color-success-dark': 'oklch(from #15803d calc(l * 0.7) c h)',
  'color-success-subtle': 'oklch(from #15803d l c h / 0.15)',
  'color-error-light': 'oklch(from #dc2626 calc(l * 1.3) c h)',
  'color-error-dark': 'oklch(from #dc2626 calc(l * 0.7) c h)',
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
    heading: "'Hanken Grotesk', sans-serif", // Default for headings
    body: "'Inter', sans-serif", // Default for body
    mono: "'Courier Prime', monospace", // Default for code
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
        'font-atmos-heading': FONTS.tech,
        'font-atmos-body': FONTS.tech,
        'bg-canvas': '#010020',
        'bg-spotlight': '#0a0c2b',
        'bg-surface': 'rgba(22, 30, 95, 0.4)', // 40% Opacity for Glass
        'bg-sink': 'rgba(0, 2, 41, 0.6)',
        'energy-primary': '#33e2e6', // Cyan
        'energy-secondary': '#3875fa', // Blue
        'border-color': 'rgba(56, 117, 250, 0.2)',
        'text-main': '#ffffff',
        'text-dim': 'rgba(255, 255, 255, 0.85)',
        'text-mute': 'rgba(255, 255, 255, 0.6)',
      },
    },

    // 2. ONYX - Stealth / Cinema
    onyx: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Stealth / Cinema',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.clean,
        'font-atmos-body': FONTS.clean,
        'bg-canvas': '#000000',
        'bg-spotlight': '#1c1c1c',
        'bg-surface': 'rgba(30, 30, 30, 0.6)',
        'bg-sink': '#000000',
        'energy-primary': '#ffffff',
        'energy-secondary': '#a3a3a3',
        'border-color': 'rgba(255, 255, 255, 0.15)',
        'text-main': '#ffffff',
        'text-dim': '#a3a3a3',
        'text-mute': 'rgba(163, 163, 163, 0.75)', // Increased from 0.6 for WCAG AA compliance (~4.1:1 contrast)
      },
    },

    // 3. TERMINAL - Hacker / Retro
    terminal: {
      mode: 'dark',
      physics: 'retro', // Triggers Pixel fonts & Instant motion
      tagline: 'Hacker / Retro',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.code,
        'font-atmos-body': FONTS.code,
        'bg-canvas': '#050505',
        'bg-spotlight': '#141414',
        'bg-surface': 'rgba(0, 20, 0, 0.9)',
        'bg-sink': '#000000',
        'energy-primary': '#f5c518', // Amber
        'energy-secondary': '#f5c518',
        'border-color': 'rgba(245, 197, 24, 0.5)',
        'text-main': '#f5c518',
        'text-dim': 'rgba(245, 197, 24, 0.7)',
        'text-mute': 'rgba(245, 197, 24, 0.5)',
        'color-premium': '#33e2e6',
      },
    },

    // 4. CRIMSON - Horror / Intense
    crimson: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Horror / Intense',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.horror,
        'font-atmos-body': FONTS.horror,
        'bg-canvas': '#180808',
        'bg-spotlight': '#2b0f0f',
        'bg-surface': 'rgba(60, 0, 0, 0.6)',
        'bg-sink': 'rgba(20, 0, 0, 0.8)',
        'energy-primary': '#ff6b6b',
        'energy-secondary': '#8a0000',
        'border-color': 'rgba(255, 107, 107, 0.2)',
        'text-main': '#ffe5e5',
        'text-dim': 'rgba(255, 200, 200, 0.9)',
        'text-mute': 'rgba(255, 180, 180, 0.7)',
      },
    },

    // 5. OVERGROWTH - Nature / Organic
    overgrowth: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Nature / Organic',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.nature,
        'font-atmos-body': FONTS.nature,
        'bg-canvas': '#051a0a',
        'bg-spotlight': '#0e2e14',
        'bg-surface': 'rgba(0, 40, 10, 0.5)',
        'bg-sink': 'rgba(0, 20, 5, 0.8)',
        'energy-primary': '#39ff14',
        'energy-secondary': '#ffd700',
        'border-color': 'rgba(57, 255, 20, 0.2)',
        'text-main': '#f0fff4',
        'text-dim': 'rgba(200, 255, 200, 0.8)',
        'text-mute': 'rgba(200, 255, 200, 0.6)',
      },
    },

    // 6. VELVET - Romance / Soft
    velvet: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Romance / Soft',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.hand,
        'font-atmos-body': FONTS.book,
        'bg-canvas': '#1a0510',
        'bg-spotlight': '#2e0b1d',
        'bg-surface': 'rgba(50, 0, 20, 0.5)',
        'bg-sink': 'rgba(30, 0, 10, 0.8)',
        'energy-primary': '#ff80a0',
        'energy-secondary': '#c71585',
        'border-color': 'rgba(255, 128, 160, 0.2)',
        'text-main': '#fff0f5',
        'text-dim': 'rgba(255, 200, 220, 0.9)',
        'text-mute': 'rgba(255, 180, 200, 0.7)',
      },
    },

    // 7. SOLAR - Royal / Gold
    solar: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Royal / Gold',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.arcane,
        'font-atmos-body': FONTS.book,
        'bg-canvas': '#120a00',
        'bg-spotlight': '#2b1d00',
        'bg-surface': 'rgba(20, 10, 0, 0.6)',
        'bg-sink': 'rgba(0, 0, 0, 0.4)',
        'energy-primary': '#ffaa00',
        'energy-secondary': '#b8860b',
        'border-color': 'rgba(255, 170, 0, 0.25)',
        'text-main': '#fffbea',
        'text-dim': 'rgba(255, 248, 220, 0.85)',
        'text-mute': 'rgba(255, 248, 220, 0.6)',
      },
    },

    // 8. NEBULA - Synthwave / Cosmic
    nebula: {
      mode: 'dark',
      physics: 'glass',
      tagline: 'Synthwave / Cosmic',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.mystic,
        'font-atmos-body': FONTS.clean,
        'bg-canvas': '#0a0014',
        'bg-spotlight': '#240046',
        'bg-surface': 'rgba(20, 0, 40, 0.6)',
        'bg-sink': 'rgba(10, 0, 20, 0.8)',
        'energy-primary': '#d946ef',
        'energy-secondary': '#8b5cf6',
        'border-color': 'rgba(217, 70, 239, 0.2)',
        'text-main': '#fdf4ff',
        'text-dim': 'rgba(230, 210, 255, 0.9)',
        'text-mute': 'rgba(230, 210, 255, 0.6)',
      },
    },

    // 9. PAPER - Light / Print
    paper: {
      mode: 'light',
      physics: 'flat', // No blurs, sharp borders
      tagline: 'Light / Print',
      palette: {
        ...SEMANTIC_LIGHT,
        'font-atmos-heading': FONTS.book,
        'font-atmos-body': FONTS.book,
        'bg-canvas': '#faeed1',
        'bg-spotlight': '#fff8e1',
        'bg-surface': '#fdf6e3',
        'bg-sink': 'rgba(0, 0, 0, 0.03)',
        'energy-primary': '#2c3e50',
        'energy-secondary': '#8d6e63',
        'border-color': 'rgba(141, 110, 99, 0.7)',
        'text-main': '#2d2420',
        'text-dim': '#4e4239',
        'text-mute': '#796b61',
      },
    },

    // 10. LABORATORY - Science / Clinical
    laboratory: {
      mode: 'light',
      physics: 'flat',
      tagline: 'Science / Clinical',
      palette: {
        ...SEMANTIC_LIGHT,
        'font-atmos-heading': FONTS.lab,
        'font-atmos-body': FONTS.lab,
        'bg-canvas': '#f1f5f9',
        'bg-spotlight': '#ffffff',
        'bg-surface': '#ffffff',
        'bg-sink': 'rgba(0, 0, 0, 0.05)',
        'energy-primary': '#005bb5',
        'energy-secondary': '#64748b',
        'border-color': 'rgba(0, 91, 181, 0.35)',
        'text-main': '#0f172a',
        'text-dim': '#334155',
        'text-mute': '#94a3b8',
      },
    },

    // 11. PLAYGROUND - Playful / Vibrant
    playground: {
      mode: 'light',
      physics: 'flat',
      tagline: 'Playful / Vibrant',
      palette: {
        ...SEMANTIC_LIGHT,
        'font-atmos-heading': FONTS.fun,
        'font-atmos-body': FONTS.fun,
        'bg-canvas': '#e0f7fa',
        'bg-spotlight': '#ffffff',
        'bg-surface': '#ffffff',
        'bg-sink': 'rgba(0, 0, 0, 0.05)',
        'energy-primary': '#ff4081',
        'energy-secondary': '#00bcd4',
        'border-color': '#00bcd4',
        'text-main': '#006064',
        'text-dim': '#00838f',
        'text-mute': '#0097a7',
      },
    },

    // 12. FOCUS - Distraction Free
    focus: {
      mode: 'light',
      physics: 'flat',
      tagline: 'Distraction Free',
      palette: {
        ...SEMANTIC_LIGHT,
        'font-atmos-heading': FONTS.clean,
        'font-atmos-body': FONTS.clean,
        'bg-canvas': '#ffffff',
        'bg-spotlight': '#f5f5f5',
        'bg-surface': '#ffffff',
        'bg-sink': '#f0f0f0',
        'energy-primary': '#000000',
        'energy-secondary': '#000000',
        'border-color': '#000000',
        'text-main': '#000000',
        'text-dim': '#222222',
        'text-mute': '#444444',
      },
    },
  },
};
