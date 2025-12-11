import { VoidEngine } from './void-engine';

// 1. Create the single shared instance
// We rely on the exported class, not window.Void, for better type safety in modules
const engine = new VoidEngine();

// 2. Create the Svelte Store
export const theme = {
  // Read-only reactive getter using Svelte 5 Runes
  get atmosphere() {
    let state = $state(engine.atmosphere);

    // Link Svelte reactivity to the Vanilla Engine
    $effect.root(() => {
      return engine.subscribe((val) => {
        state = val;
      });
    });

    return state;
  },

  // Setter forwards to engine
  set atmosphere(value: string) {
    engine.setAtmosphere(value);
  },

  // Expose raw engine for advanced usage (getConfig, etc)
  raw: engine,
};
