/*
 * ROLE: Svelte adapter for the Triad Engine.
 * RESPONSIBILITY: Synchronizes VoidEngine state with Svelte 5 Runes efficiently.
 */

import { VoidEngine, type RuntimeThemeDefinition } from './void-engine';

// Extend the Window interface globally
declare global {
  interface Window {
    Void: VoidEngine;
  }
}

// 1. Singleton Initialization
if (typeof window !== 'undefined') {
  if (!window.Void) {
    window.Void = new VoidEngine();
  }
}
const engine = typeof window !== 'undefined' ? window.Void : new VoidEngine();

// 2. Reactive State (Runes)
let atmosphere = $state(engine.atmosphere);
let config = $state(engine.userConfig);
// New: Reactive list of themes
let availableThemes = $state(engine.getAvailableThemes());

engine.subscribe((updatedEngine: VoidEngine) => {
  atmosphere = updatedEngine.atmosphere;
  config = { ...updatedEngine.userConfig };
  // Update list whenever engine notifies (e.g. after injection)
  availableThemes = updatedEngine.getAvailableThemes();
});

export const theme = {
  // Getters
  get atmosphere() {
    return atmosphere;
  },
  get config() {
    return config;
  },
  get availableThemes() {
    return availableThemes;
  }, // UI consumes this

  // Setters
  set atmosphere(value: string) {
    engine.setAtmosphere(value);
  },

  setFonts(heading: string | null, body: string | null) {
    engine.setPreferences({ fontHeading: heading, fontBody: body });
  },

  setScale(scale: number) {
    engine.setPreferences({ scale });
  },

  setDensity(density: 'high' | 'standard' | 'low') {
    engine.setPreferences({ density });
  },

  // New: Expose Injection to UI
  inject(name: string, definition: RuntimeThemeDefinition) {
    engine.injectTheme(name, definition);
  },

  raw: engine,
};
