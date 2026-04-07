/**
 * @dgrslabs/void-energy-ambient-layers - Premium full-viewport ambient overlay layers
 * for Void Energy hosts.
 *
 * Each layer is a `pointer-events: none` Svelte component that mounts a full-viewport
 * fixed overlay above the page content and below the UI chrome. Layers adapt to the
 * active physics preset (glass / flat / retro) and color mode (light / dark) via the
 * `<html data-physics data-mode>` runtime contract.
 *
 * ```svelte
 * <script lang="ts">
 *   import { SnowLayer } from '@dgrslabs/void-energy-ambient-layers';
 *   import '@dgrslabs/void-energy-ambient-layers/styles';
 * </script>
 *
 * <SnowLayer intensity={0.7} flakeCount="medium" wind={0.4} />
 * ```
 *
 * @module
 */
export { default as SnowLayer } from './svelte/SnowLayer.svelte';
export { default as RainLayer } from './svelte/RainLayer.svelte';
export { default as FogLayer } from './svelte/FogLayer.svelte';
export { default as BloodLayer } from './svelte/BloodLayer.svelte';

export type {
  AmbientLayerProps,
  SnowLayerProps,
  RainLayerProps,
  FogLayerProps,
  BloodLayerProps,
  FlakeDensity,
  RainDensity,
  FogDrift,
  ReducedMotionMode,
} from './types';
