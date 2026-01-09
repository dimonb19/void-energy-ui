/**
 * 🌌 VOID ENERGY UI - Design system configuration (SSOT).
 * This file is the single source of truth for tokens and themes.
 *
 * References:
 * - /THEME-GUIDE.md (palette contract, physics constraints, examples, testing)
 * - /CHEAT-SHEET.md
 * - /README.md
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
 * Spacing Scale
 * Base unit: 0.25rem (4px)
 * Scale: xs(8px) -> sm(16px) -> md(24px) -> lg(32px) -> xl(48px) -> 2xl(64px) -> 3xl(96px) -> 4xl(128px) -> 5xl(160px)
 */
export const VOID_SPACING = {
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
  '2xl': '4rem', // 64px
  '3xl': '6rem', // 96px
  '4xl': '8rem', // 128px
  '5xl': '10rem', // 160px
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
    },
    // Mobile: 12px -> Desktop: 16px
    small: {
      fontSize: 'clamp(0.75rem, 0.7rem + 0.3vw, 1rem)',
      lineHeight: 1.5,
    },
    // Mobile: 14px (0.875rem) -> Desktop: 18px (1.125rem)
    body: {
      fontSize: 'clamp(0.875rem, 0.8rem + 0.5vw, 1.125rem)',
      lineHeight: 1.5,
    },
    // Mobile: 16px -> Desktop: 20px
    h5: {
      fontSize: 'clamp(1rem, 0.95rem + 0.5vw, 1.25rem)',
      lineHeight: 1.4,
    },
    // Mobile: 18px -> Desktop: 24px
    h4: {
      fontSize: 'clamp(1.125rem, 1rem + 1vw, 1.5rem)',
      lineHeight: 1.3,
    },
    // Mobile: 20px -> Desktop: 32px
    h3: {
      fontSize: 'clamp(1.25rem, 1.1rem + 1.5vw, 2rem)',
      lineHeight: 1.2,
    },
    // Mobile: 24px -> Desktop: 40px
    h2: {
      fontSize: 'clamp(1.5rem, 1.25rem + 2vw, 2.5rem)',
      lineHeight: 1.15,
    },
    // Mobile: 32px -> Desktop: 56px (High Contrast Hero)
    h1: {
      fontSize: 'clamp(2rem, 1.5rem + 3vw, 3.5rem)',
      lineHeight: 1.1,
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

export const VOID_STRUCTURAL = {
  // Border Radius Scale (Used by Physics Engine)
  radius: {
    ...VOID_RADIUS,
  },

  // Modal Widths (Component-specific sizing)
  modal: {
    sm: '32rem',
    md: '40rem',
    lg: '64rem',
    xl: '75rem',
  },

  // Tooltip Constraints
  tooltip: {
    maxWidth: '250px',
  },

  // Dialog Gutters (Responsive padding)
  dialog: {
    gutter: 'var(--space-xl)', // Standard gutter (48px at standard density)
    gutterLg: 'var(--space-2xl)', // Large gutter (64px at standard density)
  },

  // Control Dimensions (Interactive elements)
  control: {
    // Base touch target minimum (WCAG AA compliance)
    touchMin: '2.75rem', // 44px
    // Dynamic control height with density scaling
    height: 'max(2.25rem, calc(2.75rem * var(--density, 1)))',
    // Control padding
    paddingX: 'var(--space-sm)',
    paddingY: 'calc(var(--space-xs) * 0.75)',
  },

  // Surface Padding (Cards, Dialogs, Containers)
  surface: {
    padding: 'var(--space-lg)',
  },

  // Scrollbar Sizing
  scrollbar: {
    width: '6px',
  },
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
    'modal-width-sm': '32rem',
    'modal-width-md': '40rem',
    'modal-width-lg': '64rem',
    'modal-width-xl': '75rem',
    'tooltip-max-width': '250px',
    'dialog-gutter': 'var(--space-xl)',
    'dialog-gutter-lg': 'var(--space-2xl)',
  },

  // 5. PHYSICS ENGINE (Time & Matter)
  // Defines how elements move and feel.
  physics: {
    glass: {
      radiusBase: VOID_RADIUS.md,
      radiusFull: VOID_RADIUS.full,
      blur: 12,
      borderWidth: 1,
      // Animation Durations (Complete Scale)
      speedInstant: 100, // Micro-feedback (button press)
      speedFast: 200, // Quick transitions
      speedBase: 300, // Standard motion
      speedSlow: 500, // Dramatic reveals
      // Animation Delays (Cascading Effects)
      delayCascade: 50, // Stagger delay for list items
      delaySequence: 100, // Sequential animation delay
      // Easing Functions
      easeStabilize: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeSnap: 'cubic-bezier(0.22, 1, 0.36, 1)',
      easeFlow: 'linear',
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
      speedBase: 200,
      speedSlow: 350,
      // Animation Delays (Cascading Effects)
      delayCascade: 40,
      delaySequence: 80,
      // Easing Functions
      easeStabilize: 'ease-out',
      easeSnap: 'ease-out',
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
      // Easing Functions (Step-based)
      easeStabilize: 'steps(2)',
      easeSnap: 'steps(2)',
      easeFlow: 'steps(4)',
      // Interaction Feedback
      lift: '-2px',
      scale: 1,
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

    // 2. [THEME] - Stealth / Cinema
    onyx: {
      mode: 'dark',
      physics: 'glass',
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
        'text-mute': 'rgba(163, 163, 163, 0.6)',
      },
    },

    // 3. [THEME] - Retro / Hacker
    terminal: {
      mode: 'dark',
      physics: 'retro', // Triggers Pixel fonts & Instant motion
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
        'border-color': '#f5c518',
        'text-main': '#f5c518',
        'text-dim': 'rgba(245, 197, 24, 0.7)',
        'text-mute': 'rgba(245, 197, 24, 0.5)',
        'color-premium': '#33e2e6',
      },
    },

    // 4. [THEME] - Horror / Aggressive
    crimson: {
      mode: 'dark',
      physics: 'glass',
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

    // 5. [THEME] - Nature / Organic
    overgrowth: {
      mode: 'dark',
      physics: 'glass',
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

    // 6. [THEME] - Romance / Soft
    velvet: {
      mode: 'dark',
      physics: 'glass',
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

    // 7. [THEME] - Royal / Gold
    solar: {
      mode: 'dark',
      physics: 'glass',
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

    // 8. [THEME] - Synthwave / Mystery
    nebula: {
      mode: 'dark',
      physics: 'glass',
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

    // 9. [THEME] - Light / Print
    paper: {
      mode: 'light',
      physics: 'flat', // No blurs, sharp borders
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

    // 10. [THEME] - Clinical / Science
    laboratory: {
      mode: 'light',
      physics: 'flat',
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

    // 11. [THEME] - Fun / Kids
    playground: {
      mode: 'light',
      physics: 'flat',
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

    // 12. [THEME] - Distraction Free
    focus: {
      mode: 'light',
      physics: 'flat',
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
