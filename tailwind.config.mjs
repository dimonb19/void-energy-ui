/** @type {import('tailwindcss').Config} */
import voidTheme from './src/config/void-tailwind-theme.json';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  // 1. Disable Preflight: Your `_reset.scss` handles the Void Canvas setup.
  corePlugins: {
    preflight: false,
  },

  theme: {
    // 2. SCREENS: Strictly defined breakpoints (Keep manual or automate if desired)
    screens: {
      tablet: '768px',
      'small-desktop': '1024px',
      'large-desktop': '1440px',
      'full-hd': '1920px',
      'quad-hd': '2560px',
    },

    // 3. INJECT GENERATED THEME
    // This spreads the JSON object directly into Tailwind's theme config.
    extend: {
      spacing: voidTheme.spacing,
      colors: voidTheme.colors,
      borderRadius: voidTheme.borderRadius,
      transitionDuration: voidTheme.transitionDuration,
    },

    // 4. MANUAL OVERRIDES (Static)
    // These rely on variables that don't change often, or complex font stacks
    fontFamily: {
      heading: ['var(--font-heading)', 'sans-serif'],
      body: ['var(--font-body)', 'sans-serif'],
      mono: ['var(--font-code)', 'monospace'],
    },
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
    transitionTimingFunction: {
      flow: 'var(--ease-flow)',
      snap: 'var(--ease-snap)',
      stabilize: 'var(--ease-stabilize)',
      linear: 'linear',
    },
  },

  plugins: [],
};
