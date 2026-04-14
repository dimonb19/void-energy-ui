import { defineAtmosphere, defineConfig } from '@void-energy/tailwind/config';

export default defineConfig({
  // MODE B — keep the four built-ins, add midnight as a config-source theme.
  extendAtmospheres: {
    midnight: defineAtmosphere({
      physics: 'glass',
      mode: 'dark',
      label: 'Midnight',
      tokens: {
        '--bg-canvas': '#05060b',
        '--bg-surface': 'rgba(15, 18, 36, 0.55)',
        '--energy-primary': '#7c5cff',
        '--text-main': '#f5f3ff',
      },
    }),
  },

  fonts: [
    {
      family: 'Orbitron',
      src: 'https://fonts.gstatic.com/s/orbitron/v34/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWg1.woff2',
      weight: '400 900',
      display: 'swap',
    },
  ],
  fontAssignments: { heading: 'Orbitron' },

  defaults: {
    atmosphere: 'midnight',
    physics: 'glass',
    mode: 'dark',
    density: 'default',
  },
});
