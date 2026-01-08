/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';
import {
  VOID_SPACING,
  VOID_RESPONSIVE,
  VOID_RADIUS,
  VOID_LAYERS,
} from './src/config/design-tokens.ts';

// 🛠️ HELPER: Auto-map token keys to CSS Variables
// Turns "md" -> "var(--space-md)" automatically
function mapToVars(obj, prefix) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = `var(--${prefix}-${key})`;
    return acc;
  }, {});
}

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  // 1. DISABLE CORE PREFLIGHT
  // We rely on 'src/styles/base/_reset.scss' for the Void Canvas setup.
  corePlugins: {
    preflight: false,
    container: false, // We use a custom .container class in SCSS
  },

  // ⚠️ ARCHITECTURE WARNING:
  // This configuration is STRICTLY mapped to `src/config/design-tokens.ts`.
  // Do not add custom colors or spacing here.
  // If you need a new value, add it to the Design Tokens and rebuild.
  theme: {
    // 2. SCREENS (Breakpoints)
    screens: VOID_RESPONSIVE,

    // 3. STRICT SPACING (The Density Engine)
    // Developers must use semantic tokens: p-md, gap-lg.
    spacing: {
      0: '0',
      px: '1px',
      auto: 'auto',
      ...mapToVars(VOID_SPACING, 'space'),
    },

    // 4. STRICT PALETTE (The Atmosphere)
    // Wipes all default colors. Forces usage of Semantic Variables.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      // Layer 1: Canvas
      canvas: 'var(--bg-canvas)',
      surface: 'var(--bg-surface)',
      sink: 'var(--bg-sink)',
      spotlight: 'var(--bg-spotlight)',
      // Layer 2: Energy
      primary: 'var(--energy-primary)',
      secondary: 'var(--energy-secondary)',
      // Layer 3: Structure
      border: 'var(--border-color)',
      // Layer 4: Signals
      main: 'var(--text-main)',
      dim: 'var(--text-dim)',
      mute: 'var(--text-mute)',
      // Layer 5: Semantics (Base)
      premium: 'var(--color-premium)',
      system: 'var(--color-system)',
      success: 'var(--color-success)',
      error: 'var(--color-error)',
      // Layer 5: Semantics (Variants)
      'premium-light': 'var(--color-premium-light)',
      'premium-dark': 'var(--color-premium-dark)',
      'premium-subtle': 'var(--color-premium-subtle)',
      'system-light': 'var(--color-system-light)',
      'system-dark': 'var(--color-system-dark)',
      'system-subtle': 'var(--color-system-subtle)',
      'success-light': 'var(--color-success-light)',
      'success-dark': 'var(--color-success-dark)',
      'success-subtle': 'var(--color-success-subtle)',
      'error-light': 'var(--color-error-light)',
      'error-dark': 'var(--color-error-dark)',
      'error-subtle': 'var(--color-error-subtle)',
    },

    // 5. STRICT GEOMETRY (The Physics)
    borderRadius: {
      none: '0',
      DEFAULT: 'var(--radius-md)',
      ...mapToVars(VOID_RADIUS, 'radius'),
    },
    borderWidth: {
      DEFAULT: 'var(--physics-border-width)',
      0: '0',
      2: '2px',
    },

    // 6. STRICT LAYERS (Z-Index)
    // Matches src/config/design-tokens.ts
    zIndex: VOID_LAYERS,

    // 7. MOTION
    transitionDuration: {
      0: '0ms',
      instant: 'var(--speed-instant)',
      fast: 'var(--speed-fast)',
      base: 'var(--speed-base)',
      slow: 'var(--speed-slow)',
    },
    transitionDelay: {
      0: '0ms',
      cascade: 'var(--delay-cascade)',
      sequence: 'var(--delay-sequence)',
    },
    transitionTimingFunction: {
      flow: 'var(--ease-flow)',
      snap: 'var(--ease-snap)',
      stabilize: 'var(--ease-stabilize)',
      linear: 'linear',
    },

    // 8. TYPOGRAPHY
    // Allows 'font-heading' and 'font-body' usage
    fontFamily: {
      heading: ['var(--font-heading)', 'sans-serif'],
      body: ['var(--font-body)', 'sans-serif'],
      mono: ['var(--font-code)', 'monospace'],
    },
    // Semantic font sizes using CSS variables (enables runtime scaling)
    fontSize: {
      caption: 'var(--font-size-caption)',
      small: 'var(--font-size-small)',
      base: 'var(--font-size-body)',
      h5: 'var(--font-size-h5)',
      h4: 'var(--font-size-h4)',
      h3: 'var(--font-size-h3)',
      h2: 'var(--font-size-h2)',
      h1: 'var(--font-size-h1)',
    },
    // Semantic line heights
    lineHeight: {
      none: '1',
      tight: 'var(--line-height-heading)',
      normal: 'var(--line-height-body)',
      relaxed: '1.75',
      loose: '2',
    },
    // Semantic font weights
    fontWeight: {
      regular: 'var(--font-weight-regular)',
      medium: 'var(--font-weight-medium)',
      semibold: 'var(--font-weight-semibold)',
      bold: 'var(--font-weight-bold)',
    },
  },

  plugins: [
    // 9. THE PHYSICS BRIDGE
    // Exposes dynamic CSS variables as native Tailwind Utilities.
    plugin(function ({ addUtilities }) {
      addUtilities({
        // Dynamic Blur (Matches current Atmosphere/Physics)
        '.backdrop-blur-physics': {
          'backdrop-filter': 'blur(var(--physics-blur))',
        },
      });
    }),
  ],
};
