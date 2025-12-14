/*
 * ROLE: Svelte adapter for the Triad Engine.
 * RESPONSIBILITY: Synchronizes VoidEngine state with Svelte 5 Runes efficiently.
 */

import { VoidEngine } from './void-engine';

// 1. Initialize the Engine (Singleton)
const engine =
  typeof window !== 'undefined' && window.Void ? window.Void : new VoidEngine();

// 2. Create Global Reactive State
// We use a single state object to hold both Atmosphere and User Config.
// This prevents memory leaks from creating multiple subscriptions.
const voidState = $state({
  atmosphere: engine.atmosphere,
  config: engine.userConfig,
});

// 3. One-Way Binding: Engine -> Svelte
// We subscribe ONCE. When the engine notifies us, we update the local Runes.
engine.subscribe((updatedEngine) => {
  voidState.atmosphere = updatedEngine.atmosphere;
  // We replace the whole object to trigger deep reactivity if needed,
  // or spread it if you prefer granular updates.
  voidState.config = { ...updatedEngine.userConfig };
});

export const theme = {
  // GETTER: Returns the reactive atmosphere
  get atmosphere() {
    return voidState.atmosphere;
  },

  // SETTER: Pushes changes back to the Engine
  set atmosphere(value: string) {
    engine.setAtmosphere(value);
  },

  // GETTER: Returns the reactive user config
  // Now safe to use because it references the stable 'voidState'
  get config() {
    return voidState.config;
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
