/**
 * ==========================================================================
 * 🌌 VOID ENERGY THEME CONFIGURATION (SSOT)
 * ==========================================================================
 * * MANUAL: HOW TO ADD A NEW THEME
 * --------------------------------------------------------------------------
 * This file is the SINGLE SOURCE OF TRUTH. It defines both the "Soul" (Colors)
 * and the "Brain" (Physics/Logic) for the entire application.
 *
 * 👉 TO ADD A NEW THEME:
 * * STEP 1: DEFINE THEME (In this file)
 * 1. Scroll down to `VOID_TOKENS.themes`.
 * 2. Copy an existing block (e.g., 'void').
 * 3. Rename the key (e.g., 'my-new-theme').
 * 4. Adjust the properties:
 * - type: 'dark' | 'light'
 * - physics: 'glass' | 'flat' | 'retro'
 * - palette: { ...colors }
 * * STEP 2: HYDRATE THE ENGINE
 * 1. Run the token builder in your terminal:
 * $ npm run build:tokens
 * * (This command automatically generates src/styles/config/_generated-themes.scss
 * AND src/config/void-registry.json, keeping them perfectly in sync).
 *
 * --------------------------------------------------------------------------
 * HOW IT WORKS (Under the Hood)
 * --------------------------------------------------------------------------
 * 1. DESIGN-TOKENS.TS (You are here): You define the raw data.
 * 2. GENERATE-TOKENS.TS (The Script): Reads this file and splits it into:
 * - Styles: SCSS variables for CSS painting.
 * - Logic: JSON registry for the Runtime Engine to validate themes.
 *
 * ⚠️ CRITICAL: If you change this file, you MUST run `npm run build:tokens`
 * for the changes to take effect in the UI.
 * ==========================================================================
 */

// 1. SHARED DEFINITIONS (Fonts & Semantics)
const FONTS = {
  tech: "'Hanken Grotesk', sans-serif", // Void
  clean: "'Inter', sans-serif", // Onyx / Focus
  code: "'Courier Prime', monospace", // Terminal
  horror: "'Merriweather', serif", // Crimson
  nature: "'Lora', serif", // Overgrowth
  hand: "'Caveat', cursive", // Velvet
  book: "'PT Serif Caption', serif", // Paper
  arcane: "'Cinzel', serif", // Solar
  mystic: "'Exo 2', sans-serif", // Nebula
  lab: "'Open Sans', sans-serif", // Laboratory
  fun: "'Comic Neue', sans-serif", // Playground
};

const SEMANTIC_DARK = {
  'color-premium': '#ff8c00', // Orb Orange
  'color-system': '#a078ff', // Deep Purple
  'color-success': '#00e055', // Signal Green
  'color-error': '#ff3c40', // Alert Red
};

const SEMANTIC_LIGHT = {
  'color-premium': '#b45309', // Ochre Ink
  'color-system': '#6d28d9', // Royal Purple Ink
  'color-success': '#15803d', // Emerald Stamp
  'color-error': '#dc2626', // Red Pen Correction
};

// 2. THEMES CONFIGURATION
export const VOID_TOKENS = {
  // Global Density Maps (Scales) - Matches your SCSS spacing-scale
  density: {
    standard: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem',
    },
    high: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    }, //
    low: {
      xs: '0.75rem',
      sm: '1.25rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '4rem',
      '2xl': '5rem',
    }, //
  },

  // The Atmospheres
  themes: {
    // 1. VOID (Default)
    void: {
      type: 'dark',
      physics: 'glass',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.tech,
        'font-atmos-body': FONTS.tech,
        'bg-canvas': '#010020',
        'bg-spotlight': '#0a0c2b',
        'bg-surface': 'rgba(22, 30, 95, 0.4)',
        'bg-sink': 'rgba(0, 2, 41, 0.6)',
        'energy-primary': '#33e2e6',
        'energy-secondary': '#3875fa',
        'border-highlight': 'rgba(56, 117, 250, 0.3)', //
        'border-shadow': 'rgba(56, 117, 250, 0.1)',
        'text-main': '#ffffff',
        'text-dim': 'rgba(255, 255, 255, 0.85)',
        'text-mute': 'rgba(255, 255, 255, 0.6)',
      },
    },

    // 2. ONYX
    onyx: {
      type: 'dark',
      physics: 'glass',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.clean,
        'font-atmos-body': FONTS.clean,
        'bg-canvas': '#0a0a0a',
        'bg-spotlight': '#1c1c1c',
        'bg-surface': 'rgba(30, 30, 30, 0.6)',
        'bg-sink': '#000000',
        'energy-primary': '#ffffff',
        'energy-secondary': '#a3a3a3',
        'border-highlight': 'rgba(255, 255, 255, 0.2)',
        'border-shadow': 'rgba(255, 255, 255, 0.05)',
        'text-main': '#ffffff',
        'text-dim': '#a3a3a3',
        'text-mute': 'rgba(163, 163, 163, 0.6)',
      },
    },

    // 3. TERMINAL
    terminal: {
      type: 'dark',
      physics: 'retro',
      palette: {
        ...SEMANTIC_DARK,
        'font-atmos-heading': FONTS.code,
        'font-atmos-body': FONTS.code,
        'bg-canvas': '#050505',
        'bg-spotlight': '#141414',
        'bg-surface': 'rgba(0, 20, 0, 0.9)',
        'bg-sink': '#000000',
        'energy-primary': '#f5c518',
        'energy-secondary': '#f5c518',
        'border-highlight': '#f5c518',
        'border-shadow': '#f5c518',
        'text-main': '#f5c518',
        'text-dim': 'rgba(245, 197, 24, 0.7)',
        'text-mute': 'rgba(245, 197, 24, 0.5)',
        'color-premium': '#33e2e6',
      },
    },

    // 4. CRIMSON
    crimson: {
      type: 'dark',
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
        'border-highlight': 'rgba(255, 107, 107, 0.3)',
        'border-shadow': 'rgba(255, 107, 107, 0.1)',
        'text-main': '#ffe5e5',
        'text-dim': 'rgba(255, 200, 200, 0.9)',
        'text-mute': 'rgba(255, 180, 180, 0.7)',
      },
    },

    // 5. OVERGROWTH
    overgrowth: {
      type: 'dark',
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
        'border-highlight': 'rgba(57, 255, 20, 0.3)',
        'border-shadow': 'rgba(57, 255, 20, 0.1)',
        'text-main': '#f0fff4',
        'text-dim': 'rgba(200, 255, 200, 0.8)',
        'text-mute': 'rgba(200, 255, 200, 0.6)',
      },
    },

    // 6. VELVET
    velvet: {
      type: 'dark',
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
        'border-highlight': 'rgba(255, 128, 160, 0.3)',
        'border-shadow': 'rgba(255, 128, 160, 0.1)',
        'text-main': '#fff0f5',
        'text-dim': 'rgba(255, 200, 220, 0.9)',
        'text-mute': 'rgba(255, 180, 200, 0.7)',
      },
    },

    // 7. SOLAR
    solar: {
      type: 'dark',
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
        'border-highlight': 'rgba(255, 170, 0, 0.4)',
        'border-shadow': 'rgba(184, 134, 11, 0.1)',
        'text-main': '#fffbea',
        'text-dim': 'rgba(255, 248, 220, 0.85)',
        'text-mute': 'rgba(255, 248, 220, 0.6)',
      },
    },

    // 8. NEBULA
    nebula: {
      type: 'dark',
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
        'border-highlight': 'rgba(217, 70, 239, 0.3)',
        'border-shadow': 'rgba(139, 92, 246, 0.1)',
        'text-main': '#fdf4ff',
        'text-dim': 'rgba(230, 210, 255, 0.9)',
        'text-mute': 'rgba(230, 210, 255, 0.6)',
      },
    },

    // 9. PAPER
    paper: {
      type: 'light',
      physics: 'flat',
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
        'border-highlight': '#8d6e63',
        'border-shadow': 'rgba(141, 110, 99, 0.5)',
        'text-main': '#2d2420',
        'text-dim': '#4e4239',
        'text-mute': '#796b61',
      },
    },

    // 10. LABORATORY
    laboratory: {
      type: 'light',
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
        'border-highlight': 'rgba(0, 91, 181, 0.5)',
        'border-shadow': 'rgba(100, 116, 139, 0.2)',
        'text-main': '#0f172a',
        'text-dim': '#334155',
        'text-mute': '#94a3b8',
      },
    },

    // 11. PLAYGROUND
    playground: {
      type: 'light',
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
        'border-highlight': '#00bcd4',
        'border-shadow': '#00bcd4',
        'text-main': '#006064',
        'text-dim': '#00838f',
        'text-mute': '#0097a7',
      },
    },

    // 12. FOCUS
    focus: {
      type: 'light',
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
        'border-highlight': '#000000',
        'border-shadow': '#000000',
        'text-main': '#000000',
        'text-dim': '#222222',
        'text-mute': '#444444',
      },
    },
  },
};
