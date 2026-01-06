/**
 * ==========================================================================
 * 🌌 VOID ENERGY UI — DESIGN SYSTEM CONFIGURATION (SSOT)
 * ==========================================================================
 *
 * ⚠️ SINGLE SOURCE OF TRUTH
 * This file acts as the database for the entire UI.
 * It controls:
 * 1. THE SOUL (Themes/Colors)
 * 2. THE LAWS (Physics/Motion)
 * 3. THE LOGIC (Density/Scaling)
 *
 * --------------------------------------------------------------------------
 * 👨‍💻 DEVELOPER WORKFLOW: HOW TO ADD A NEW THEME
 * --------------------------------------------------------------------------
 *
 * 1. DEFINE:
 * Scroll to `VOID_TOKENS.themes`. Copy the 'void' block, rename the key,
 * and adjust the palette values.
 *
 * 2. HYDRATE:
 * You MUST run the build script to compile these tokens into SCSS/JSON.
 * 👉 TERMINAL COMMAND: npm run build:tokens
 *
 * 3. USE:
 * Your new theme is now available in the UI via `data-atmosphere="your-theme-name"`.
 *
 * --------------------------------------------------------------------------
 * 🎨 THE PALETTE CONTRACT (What do these keys mean?)
 * --------------------------------------------------------------------------
 * To ensure the 3D Physics Engine renders correctly, you must provide:
 *
 * [LAYER 1: CANVAS - Z-INDEX 0 & -1]
 * - bg-canvas        : The absolute floor (Page Background). Usually the darkest tone.
 * - bg-sink          : Recessed areas (Inputs, Wells). Appears "carved" into the surface.
 * - bg-spotlight     : Ambient light source from the top. Used for gradients/highlights.
 *
 * [LAYER 2: SURFACE - Z-INDEX 1+]
 * - bg-surface       : Floating elements (Cards, Modals, Headers).
 * For 'glass' physics, use RGBA with opacity (e.g., rgba(0,0,0,0.5)).
 *
 * [LAYER 3: ENERGY - INTERACTION]
 * - energy-primary   : The Brand Color. Used for Buttons, Links, Focus states, & Glows.
 * - energy-secondary : Supporting accent. Used for Borders, Scrollbars, & Subtle indicators.
 *
 * [LAYER 4: LIGHTING - THE 3D ILLUSION]
 * - border-highlight : Top/Left border color. Simulates light hitting the edge.
 * - border-shadow    : Bottom/Right border color. Simulates cast shadow.
 *
 * [LAYER 5: SIGNAL - DATA HIERARCHY]
 * - text-main        : High Emphasis (Headings, Active Data).
 * - text-dim         : Medium Emphasis (Body copy, Labels).
 * - text-mute        : Low Emphasis (Placeholders, Disabled states).
 *
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 🧩 SHARED ASSETS (Fonts & Colors)
// --------------------------------------------------------------------------

import DNA from './void-dna.json';

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
  'color-premium': '#ff8c00', // Gold/Orange
  'color-system': '#a078ff', // Purple
  'color-success': '#00e055', // Green
  'color-error': '#ff3c40', // Red
};

const SEMANTIC_LIGHT = {
  'color-premium': '#b45309',
  'color-system': '#6d28d9',
  'color-success': '#15803d',
  'color-error': '#dc2626',
};

// --------------------------------------------------------------------------
// 🚀 THE CONFIGURATION (Edit below)
// --------------------------------------------------------------------------

export const VOID_TOKENS = {
  // 1. DENSITY MAPS (Space & Scale)
  // Controls the global whitespace density of the application.
  density: {
    scale: DNA.spacing,
    factors: {
      high: 0.75, // Compact
      standard: 1, // Default
      low: 1.25, // Relaxed
    },
  },

  container: {
    ...DNA.container,
  },

  // 2. LAYERS
  layers: {
    ...DNA.zindex,
  },

  // 3. RESPONSIVE
  // We explicitly define px values here to ensure SCSS and JS match perfectly.
  responsive: {
    ...DNA.responsive,
  },

  // 2. PHYSICS ENGINE (Time & Matter)
  // Defines how elements move and feel.
  physics: {
    glass: {
      blur: 12,
      borderWidth: 1,
      speedBase: 300,
      speedFast: 200,
      easeStabilize: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeSnap: 'cubic-bezier(0.22, 1, 0.36, 1)',
      easeFlow: 'linear',
      lift: '-3px',
      scale: 1.02,
    },
    flat: {
      blur: 0,
      borderWidth: 1,
      speedBase: 200,
      speedFast: 133,
      easeStabilize: 'ease-out',
      easeSnap: 'ease-out',
      easeFlow: 'ease-in-out',
      lift: '-2px',
      scale: 1.01,
    },
    retro: {
      blur: 0,
      borderWidth: 2,
      speedBase: 0,
      speedFast: 0,
      easeStabilize: 'steps(2)',
      easeSnap: 'steps(2)',
      easeFlow: 'steps(4)',
      lift: '-2px',
      scale: 1,
    },
  },

  // 3. THEME REGISTRY (Color & Mood)
  // ⚠️ ARCHITECTURAL CONSTRAINT:
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
        'border-highlight': 'rgba(56, 117, 250, 0.3)',
        'border-shadow': 'rgba(56, 117, 250, 0.1)',
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
        'border-highlight': '#f5c518', // Hard borders (no alpha)
        'border-shadow': '#f5c518',
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
        'border-highlight': 'rgba(255, 107, 107, 0.3)',
        'border-shadow': 'rgba(255, 107, 107, 0.1)',
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
        'border-highlight': 'rgba(57, 255, 20, 0.3)',
        'border-shadow': 'rgba(57, 255, 20, 0.1)',
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
        'border-highlight': 'rgba(255, 128, 160, 0.3)',
        'border-shadow': 'rgba(255, 128, 160, 0.1)',
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
        'border-highlight': 'rgba(255, 170, 0, 0.4)',
        'border-shadow': 'rgba(184, 134, 11, 0.1)',
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
        'border-highlight': 'rgba(217, 70, 239, 0.3)',
        'border-shadow': 'rgba(139, 92, 246, 0.1)',
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
        'border-highlight': '#8d6e63',
        'border-shadow': 'rgba(141, 110, 99, 0.5)',
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
        'border-highlight': 'rgba(0, 91, 181, 0.5)',
        'border-shadow': 'rgba(100, 116, 139, 0.2)',
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
        'border-highlight': '#00bcd4',
        'border-shadow': '#00bcd4',
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
        'border-highlight': '#000000',
        'border-shadow': '#000000',
        'text-main': '#000000',
        'text-dim': '#222222',
        'text-mute': '#444444',
      },
    },
  },
};
