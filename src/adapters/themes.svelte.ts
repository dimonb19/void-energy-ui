/*
 * ROLE: Svelte adapter for the Triad Engine.
 * RESPONSIBILITY: Synchronizes VoidEngine state with Svelte 5 Runes efficiently.
 */

import { VoidEngine } from './void-engine';

// 1. Initialize the Engine (Singleton)
const engine = new VoidEngine();

// 2. Create the Reactive Signal ONCE
// This holds the "Source of Truth" for Svelte components.
let currentAtmosphere = $state(engine.atmosphere);

// 3. One-Way Binding: Engine -> Svelte
// When the vanilla engine emits a change, we update the Rune.
// We do not need $effect.root here because this subscription lives for the app's lifetime.
engine.subscribe((newValue) => {
  currentAtmosphere = newValue;
});

export const theme = {
  // GETTER: Returns the stable reactive value
  get atmosphere() {
    return currentAtmosphere;
  },

  // SETTER: Pushes changes back to the Engine (which then notifies listeners)
  set atmosphere(value: string) {
    // This triggers the engine's setAtmosphere logic (localStorage, DOM attributes)
    engine.setAtmosphere(value);
  },

  // EXPOSE RAW ENGINE: For advanced usage or direct access
  raw: engine,
};
