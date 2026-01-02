/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  // Disable Preflight: `_reset.scss` handles the Void Canvas setup.
  corePlugins: {
    preflight: false,
  },

  theme: {
    // 1. Hardcode the Screens (Breakpoints)
    // These match your Design Tokens [cite: 377]
    screens: {
      mobile: '0px',
      tablet: '768px',
      'small-desktop': '1024px',
      'large-desktop': '1440px',
      'full-hd': '1920px',
      'quad-hd': '2560px',
    },

    extend: {
      // 2. Hardcode the Spacing Scale (Density Engine) [cite: 409]
      spacing: {
        0: '0',
        px: '1px',
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
      },

      // 3. Hardcode the Color Palette (The Atmosphere) [cite: 410]
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        inherit: 'inherit',
        // Canvas Layers
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        sink: 'var(--bg-sink)',
        spotlight: 'var(--bg-spotlight)',
        // Energy & Borders
        primary: 'var(--energy-primary)',
        secondary: 'var(--energy-secondary)',
        highlight: 'var(--border-highlight)',
        shadow: 'var(--border-shadow)',
        // Text Signals
        main: 'var(--text-main)',
        dim: 'var(--text-dim)',
        mute: 'var(--text-mute)',
        // Semantic System
        premium: 'var(--color-premium)',
        system: 'var(--color-system)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
      },

      // 4. Hardcode Radius (Physics) [cite: 410]
      borderRadius: {
        none: '0',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },

      // 5. Hardcode Z-Index (Layers) [cite: 411]
      zIndex: {
        sink: '-1',
        floor: '0',
        base: '1',
        decorate: '2',
        float: '10',
        sticky: '20',
        header: '40',
        dropdown: '50',
        overlay: '90',
        modal: '100',
        toast: '200',
      },

      // 6. Hardcode Transitions (Time) [cite: 411]
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
    },

    // 7. Fonts (Static)
    fontFamily: {
      heading: ['var(--font-heading)', 'sans-serif'],
      body: ['var(--font-body)', 'sans-serif'],
      mono: ['var(--font-code)', 'monospace'],
    },
  },

  plugins: [],
};
