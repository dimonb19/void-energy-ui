/**
 * =====================================================================
 *  DGRS PRIVATE — CONEXUS ATMOSPHERE DEFINITIONS
 * =====================================================================
 *
 *  These atmospheres are DGRS-private and ship only with CoNexus.
 *  They are registered at runtime via voidEngine.registerTheme()
 *  during the CoNexus boot sequence.
 *
 *  In the public void-energy repo, this file does NOT exist.
 *  When extracting to separate repos, move each theme to its own
 *  module under conexus/src/atmospheres/.
 *
 * =====================================================================
 */

import { FONTS } from '@config/fonts';
import {
  SEMANTIC_DARK,
  SEMANTIC_LIGHT,
  type AtmosphereDefinition,
} from '@config/atmospheres';

// ---------------------------------------------------------------------------
// DGRS atmospheres (12 themes, registered at runtime in CoNexus)
// ---------------------------------------------------------------------------

export const ATMOSPHERES_CONEXUS: Record<string, AtmosphereDefinition> = {
  // 1. VOID — Original system default, DGRS signature
  void: {
    mode: 'dark',
    physics: 'glass',
    tagline: 'Default / Cyber',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.tech.family,
      'font-atmos-body': FONTS.tech.family,
      'bg-canvas': '#010020',
      'bg-spotlight': '#0a0c2b',
      'bg-surface': 'rgba(22, 30, 95, 0.4)',
      'bg-sunk': 'rgba(0, 2, 41, 0.6)',
      'energy-primary': '#33e2e6',
      'energy-secondary': '#3875fa',
      'border-color': 'rgba(56, 117, 250, 0.2)',
      'text-main': '#ffffff',
      'text-dim': '#d9d9de',
      'text-mute': '#9999a6',
    },
  },

  // 2. ONYX — Stealth / Cinema
  onyx: {
    mode: 'dark',
    physics: 'flat',
    tagline: 'Stealth / Cinema',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.clean.family,
      'font-atmos-body': FONTS.clean.family,
      'bg-canvas': '#000000',
      'bg-spotlight': '#1c1c1c',
      'bg-surface': '#1e1e1e',
      'bg-sunk': '#000000',
      'energy-primary': '#ffffff',
      'energy-secondary': '#a3a3a3',
      'border-color': 'rgba(255, 255, 255, 0.15)',
      'text-main': '#ffffff',
      'text-dim': '#a3a3a3',
      'text-mute': '#7a7a7a',
    },
  },

  // 3. TERMINAL — Hacker / Retro
  terminal: {
    mode: 'dark',
    physics: 'retro',
    tagline: 'Hacker / Retro',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.code.family,
      'font-atmos-body': FONTS.code.family,
      'bg-canvas': '#050505',
      'bg-spotlight': '#141414',
      'bg-surface': 'rgba(0, 20, 0, 0.9)',
      'bg-sunk': '#000000',
      'energy-primary': '#f5c518',
      'energy-secondary': '#c9a820',
      'border-color': 'rgba(245, 197, 24, 0.5)',
      'text-main': '#f5c518',
      'text-dim': '#ad8b12',
      'text-mute': '#7d650f',
      'color-premium': '#33e2e6',
    },
  },

  // 4. NEBULA — Synthwave / Cosmic
  nebula: {
    mode: 'dark',
    physics: 'glass',
    tagline: 'Synthwave / Cosmic',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.mystic.family,
      'font-atmos-body': FONTS.clean.family,
      'bg-canvas': '#0a0014',
      'bg-spotlight': '#240046',
      'bg-surface': 'rgba(20, 0, 40, 0.6)',
      'bg-sunk': 'rgba(10, 0, 20, 0.8)',
      'energy-primary': '#d946ef',
      'energy-secondary': '#8b5cf6',
      'border-color': 'rgba(217, 70, 239, 0.2)',
      'text-main': '#fdf4ff',
      'text-dim': '#d0bde8',
      'text-mute': '#8e7ea1',
      'color-system': '#38bdf8',
    },
  },

  // 5. SOLAR — Royal / Gold
  solar: {
    mode: 'dark',
    physics: 'glass',
    tagline: 'Royal / Gold',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.arcane.family,
      'font-atmos-body': FONTS.book.family,
      'bg-canvas': '#120a00',
      'bg-spotlight': '#2b1d00',
      'bg-surface': 'rgba(20, 10, 0, 0.6)',
      'bg-sunk': 'rgba(0, 0, 0, 0.4)',
      'energy-primary': '#ffaa00',
      'energy-secondary': '#b8860b',
      'border-color': 'rgba(255, 170, 0, 0.25)',
      'color-premium': '#0284c7',
      'text-main': '#fffbea',
      'text-dim': '#dbd4bb',
      'text-mute': '#a09984',
    },
  },

  // 6. OVERGROWTH — Nature / Organic
  overgrowth: {
    mode: 'dark',
    physics: 'glass',
    tagline: 'Nature / Organic',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.nature.family,
      'font-atmos-body': FONTS.nature.family,
      'bg-canvas': '#051a0a',
      'bg-spotlight': '#0e2e14',
      'bg-surface': 'rgba(0, 40, 10, 0.5)',
      'bg-sunk': 'rgba(0, 20, 5, 0.8)',
      'energy-primary': '#39ff14',
      'energy-secondary': '#c8a84b',
      'border-color': 'rgba(57, 255, 20, 0.2)',
      'text-main': '#f0fff4',
      'text-dim': '#a1d1a2',
      'text-mute': '#7aa37c',
    },
  },

  // 7. VELVET — Romance / Soft
  velvet: {
    mode: 'dark',
    physics: 'glass',
    tagline: 'Romance / Soft',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.hand.family,
      'font-atmos-body': FONTS.book.family,
      'bg-canvas': '#1a0510',
      'bg-spotlight': '#2e0b1d',
      'bg-surface': 'rgba(50, 0, 20, 0.5)',
      'bg-sunk': 'rgba(30, 0, 10, 0.8)',
      'energy-primary': '#ff80a0',
      'energy-secondary': '#e91e8c',
      'border-color': 'rgba(255, 128, 160, 0.2)',
      'text-main': '#fff0f5',
      'text-dim': '#e8b5c8',
      'text-mute': '#ba8091',
    },
  },

  // 8. CRIMSON — Horror / Intense
  crimson: {
    mode: 'dark',
    physics: 'glass',
    tagline: 'Horror / Intense',

    palette: {
      ...SEMANTIC_DARK,
      'font-atmos-heading': FONTS.horror.family,
      'font-atmos-body': FONTS.horror.family,
      'bg-canvas': '#180808',
      'bg-spotlight': '#2b0f0f',
      'bg-surface': 'rgba(60, 0, 0, 0.6)',
      'bg-sunk': 'rgba(20, 0, 0, 0.8)',
      'energy-primary': '#ff6b6b',
      'energy-secondary': '#c0392b',
      'border-color': 'rgba(255, 107, 107, 0.2)',
      'text-main': '#ffe5e5',
      'text-dim': '#e8b5b5',
      'text-mute': '#ba8080',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIGHT THEMES
  // ───���─────────────────────────────────────────────────────────────────────

  // 9. PAPER — Light / Print (boss's favorite, DGRS brand)
  paper: {
    mode: 'light',
    physics: 'flat',
    tagline: 'Light / Print',

    palette: {
      ...SEMANTIC_LIGHT,
      'font-atmos-heading': FONTS.book.family,
      'font-atmos-body': FONTS.book.family,
      'bg-canvas': '#faeed1',
      'bg-spotlight': '#fff8e1',
      'bg-surface': '#fdf6e3',
      'bg-sunk': 'rgba(0, 0, 0, 0.03)',
      'energy-primary': '#2c3e50',
      'energy-secondary': '#8d6e63',
      'border-color': 'rgba(141, 110, 99, 0.7)',
      'text-main': '#2d2420',
      'text-dim': '#4e4239',
      'text-mute': '#796b61',
    },
  },

  // 10. FOCUS — Distraction Free
  focus: {
    mode: 'light',
    physics: 'flat',
    tagline: 'Distraction Free',

    palette: {
      ...SEMANTIC_LIGHT,
      'font-atmos-heading': FONTS.clean.family,
      'font-atmos-body': FONTS.clean.family,
      'bg-canvas': '#ffffff',
      'bg-spotlight': '#f5f5f5',
      'bg-surface': '#ffffff',
      'bg-sunk': '#f0f0f0',
      'energy-primary': '#000000',
      'energy-secondary': '#000000',
      'border-color': 'rgba(0, 0, 0, 0.15)',
      'text-main': '#000000',
      'text-dim': '#222222',
      'text-mute': '#444444',
    },
  },

  // 11. LABORATORY — Science / Clinical (DGRS Labs brand colors)
  laboratory: {
    mode: 'light',
    physics: 'flat',
    tagline: 'Science / Clinical',

    palette: {
      ...SEMANTIC_LIGHT,
      'font-atmos-heading': FONTS.lab.family,
      'font-atmos-body': FONTS.lab.family,
      'bg-canvas': '#f1f5f9',
      'bg-spotlight': '#ffffff',
      'bg-surface': '#ffffff',
      'bg-sunk': 'rgba(0, 0, 0, 0.05)',
      'energy-primary': '#005bb5',
      'energy-secondary': '#3d7ab5',
      'border-color': 'rgba(0, 91, 181, 0.35)',
      'text-main': '#0f172a',
      'text-dim': '#334155',
      'text-mute': '#64748b',
    },
  },

  // 12. PLAYGROUND — Playful / Vibrant
  playground: {
    mode: 'light',
    physics: 'flat',
    tagline: 'Playful / Vibrant',

    palette: {
      ...SEMANTIC_LIGHT,
      'font-atmos-heading': FONTS.fun.family,
      'font-atmos-body': FONTS.fun.family,
      'bg-canvas': '#e0f7fa',
      'bg-spotlight': '#ffffff',
      'bg-surface': '#ffffff',
      'bg-sunk': 'rgba(0, 0, 0, 0.05)',
      'energy-primary': '#ff4081',
      'energy-secondary': '#0088a8',
      'border-color': 'rgba(0, 188, 212, 0.4)',
      'text-main': '#003040',
      'text-dim': '#1a4a55',
      'text-mute': '#4a7a85',
    },
  },
};
