/*
 * ROLE: Svelte adapter for the Triad Engine.
 * RESPONSIBILITY: Synchronizes VoidEngine state with Svelte 5 Runes efficiently.
 */

import { VoidEngine } from './void-engine';

// --- STRICT SINGLETON PATTERN ---
// 1. If we are in the browser, check if a global instance exists.
if (typeof window !== 'undefined') {
  if (!window.Void) {
    window.Void = new VoidEngine();
  }
}

// 2. Use the global instance if available, otherwise create a temporary one (SSR)
const engine = typeof window !== 'undefined' ? window.Void : new VoidEngine();

// We split the state so specific listeners only trigger on relevant changes.
let atmosphere = $state(engine.atmosphere);
let config = $state(engine.userConfig);

engine.subscribe((updatedEngine) => {
  atmosphere = updatedEngine.atmosphere;
  // We spread the object to ensure Svelte detects the value change
  config = { ...updatedEngine.userConfig };
});

// 3. Create Global Reactive State
const voidState = $state({
  atmosphere: engine.atmosphere,
  config: engine.userConfig,
});

// 4. One-Way Binding: Engine -> Svelte
// Note: engine.subscribe() now calls engine.render(), ensuring
// the DOM is repainted if Svelte Hydration wiped the styles.
engine.subscribe((updatedEngine) => {
  voidState.atmosphere = updatedEngine.atmosphere;
  voidState.config = { ...updatedEngine.userConfig };
});

export const theme = {
  // GETTER: Returns the reactive atmosphere
  get atmosphere() {
    return atmosphere;
  },

  // SETTER: Pushes changes back to the Engine
  set atmosphere(value: string) {
    engine.setAtmosphere(value);
  },

  // GETTER: Returns the reactive user config
  // Note: We keep the object structure for API compatibility with components
  get config() {
    return config;
  },

  // Actions
  setFonts(heading: string | null, body: string | null) {
    engine.setPreferences({ fontHeading: heading, fontBody: body });
  },

  setScale(scale: number) {
    engine.setPreferences({ scale });
  },

  setDensity(density: 'high' | 'standard' | 'low') {
    engine.setPreferences({ density });
  },

  // Expose raw engine for advanced use cases
  raw: engine,
};
