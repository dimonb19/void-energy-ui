import type { VoidEngine } from '../adapters/void-engine.svelte';

declare global {
  interface Window {
    /**
     * 🌌 The Void Engine
     * Exposed globally for runtime debugging and external API integration.
     */
    Void: VoidEngine;
  }
}
