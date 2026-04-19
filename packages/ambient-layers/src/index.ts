/**
 * @dgrslabs/void-energy-ambient-layers — Premium full-viewport ambient overlay
 * layers for Void Energy hosts.
 *
 * Four category components, each driven by a `variant` prop that selects the
 * concrete layer within its category. Mirrors the structural pattern of
 * `@dgrslabs/void-energy-kinetic-text` (one component, flat variant union).
 *
 * ```svelte
 * <script lang="ts">
 *   import {
 *     AtmosphereLayer,
 *     PsychologyLayer,
 *     ActionLayer,
 *     EnvironmentLayer,
 *   } from '@dgrslabs/void-energy-ambient-layers';
 *   import '@dgrslabs/void-energy-ambient-layers/styles';
 * </script>
 *
 * <EnvironmentLayer variant="night" />
 * <AtmosphereLayer variant="rain" intensity="high" />
 * <PsychologyLayer variant="danger" intensity="medium" />
 * {#if showImpact}
 *   <ActionLayer variant="impact" intensity="high" onComplete={() => showImpact = false} />
 * {/if}
 * ```
 *
 * @module
 */
export { default as AtmosphereLayer } from './svelte/AtmosphereLayer.svelte';
export { default as PsychologyLayer } from './svelte/PsychologyLayer.svelte';
export { default as ActionLayer } from './svelte/ActionLayer.svelte';
export { default as EnvironmentLayer } from './svelte/EnvironmentLayer.svelte';
export { default as AmbientHost } from './svelte/AmbientHost.svelte';

export { ambient, Ambient } from './svelte/ambient.svelte';
export type {
  PersistentCategory,
  AtmosphereEntry,
  PsychologyEntry,
  EnvironmentEntry,
  ActionEntry,
} from './svelte/ambient.svelte';

export type {
  AmbientCategory,
  AmbientLayerId,
  AmbientIntensity,
  AmbientLevel,
  AtmosphereLayer as AtmosphereLayerId,
  AtmosphereLayerProps,
  PsychologyLayer as PsychologyLayerId,
  PsychologyLayerProps,
  ActionLayer as ActionLayerId,
  ActionLayerProps,
  ActionLevel,
  EnvironmentLayer as EnvironmentLayerId,
  EnvironmentLayerProps,
  ReducedMotionMode,
} from './types';
