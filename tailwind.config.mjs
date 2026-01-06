/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';
import DNA from './src/config/void-dna.json' with { type: 'json' };

// 🛠️ HELPER: Auto-map JSON keys to CSS Variables
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
    screens: DNA.responsive,

    // 3. STRICT SPACING (The Density Engine)
    // Developers must use semantic tokens: p-md, gap-lg.
    spacing: {
      0: '0',
      px: '1px',
      auto: 'auto',
      ...mapToVars(DNA.spacing, 'space'),
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
      // Layer 3: Lighting
      highlight: 'var(--border-highlight)',
      shadow: 'var(--border-shadow)',
      // Layer 4: Signals
      main: 'var(--text-main)',
      dim: 'var(--text-dim)',
      mute: 'var(--text-mute)',
      // Layer 5: Semantics
      premium: 'var(--color-premium)',
      system: 'var(--color-system)',
      success: 'var(--color-success)',
      error: 'var(--color-error)',
    },

    // 5. STRICT GEOMETRY (The Physics)
    borderRadius: {
      none: '0',
      DEFAULT: 'var(--radius-md)',
      ...mapToVars(DNA.radius, 'radius'),
    },
    borderWidth: {
      DEFAULT: 'var(--physics-border-width)',
      0: '0',
      2: '2px',
    },

    // 6. STRICT LAYERS (Z-Index)
    // Matches src/config/design-tokens.ts
    zIndex: DNA.zindex,

    // 7. MOTION
    transitionDuration: {
      0: '0ms',
      fast: 'var(--speed-fast)',
      base: 'var(--speed-base)',
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
    // Prevent random font sizes (optional, but recommended for strictness)
    fontSize: {
      caption: 'var(--text-caption, 0.75rem)',
      small: 'var(--text-small, 0.875rem)',
      base: '1rem',
      h5: 'var(--text-h5, 1.25rem)',
      h4: 'var(--text-h4, 1.5rem)',
      h3: 'var(--text-h3, 1.75rem)',
      h2: 'var(--text-h2, 2rem)',
      h1: 'var(--text-h1, 2.5rem)',
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
