/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  // 1. Disable Preflight: Your `_reset.scss` handles the Void Canvas setup.
  corePlugins: {
    preflight: false,
  },

  theme: {
    // 2. SCREENS: Strictly defined breakpoints.
    screens: {
      tablet: '768px',
      'small-desktop': '1024px',
      'large-desktop': '1440px',
      'full-hd': '1920px',
      'quad-hd': '2560px',
    },

    // 3. SPACING: The Density Bridge.
    // By defining this at the root, we DELETE standard classes (p-1, m-4).
    // Usage: p-md, gap-xl, m-xs.
    // These map to variables that react to the Density Engine.
    spacing: {
      0: '0',
      xs: 'var(--space-xs)',
      sm: 'var(--space-sm)',
      md: 'var(--space-md)',
      lg: 'var(--space-lg)',
      xl: 'var(--space-xl)',
      '2xl': 'var(--space-2xl)',
      px: '1px', // Useful utility, keeps it semantic
    },

    // 4. COLORS: Semantic Only.
    // We removed `extend` so `text-blue-500` is now impossible.
    // Collaborators must use `text-primary` or `bg-surface`.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',

      // Canvas Layers [cite: 196]
      canvas: 'var(--bg-canvas)',
      surface: 'var(--bg-surface)',
      sink: 'var(--bg-sink)',
      spotlight: 'var(--bg-spotlight)',

      // Energy & Borders
      primary: 'var(--energy-primary)',
      secondary: 'var(--energy-secondary)',
      highlight: 'var(--border-highlight)',
      shadow: 'var(--border-shadow)',

      // Typography
      main: 'var(--text-main)',
      dim: 'var(--text-dim)',
      mute: 'var(--text-mute)',

      // Semantic Indicators
      premium: 'var(--color-premium)',
      system: 'var(--color-system)',
      success: 'var(--color-success)',
      error: 'var(--color-error)',
    },

    // 5. RADIUS: Physics-based.
    // No `rounded-md` (6px) or `rounded-lg` (0.5rem).
    // Explicitly `rounded-sm`, `rounded-lg` mapping to vars.
    borderRadius: {
      none: '0',
      sm: 'var(--radius-sm)',
      DEFAULT: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      full: 'var(--radius-full)',
    },

    // 6. TYPOGRAPHY: Atmosphere-aware.
    // Overwrites default sans/serif/mono stacks.
    fontFamily: {
      heading: ['var(--font-heading)', 'sans-serif'],
      body: ['var(--font-body)', 'sans-serif'],
      // For Terminal Theme
      mono: ['var(--font-code)', 'monospace'],
    },

    // 7. Z-INDEX: The Layer Cake.
    // Prevents arbitrary `z-10` usage.
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

    // 8. MOTION: Void Physics.
    transitionDuration: {
      fast: 'var(--speed-fast)',
      base: 'var(--speed-base)',
      0: '0ms',
    },
    transitionTimingFunction: {
      flow: 'var(--ease-flow)',
      snap: 'var(--ease-snap)',
      stabilize: 'var(--ease-stabilize)',
      linear: 'linear',
    },
  },

  // 9. Plugins
  plugins: [],
};
