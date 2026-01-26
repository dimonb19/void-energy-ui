import type { VoidEngine } from '@adapters/void-engine.svelte';

declare global {
  interface Window {
    /**
     * Void engine exposed for debugging and external integration.
     */
    Void: VoidEngine;
  }
}
