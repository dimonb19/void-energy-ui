/**
 * @dgrslabs/void-energy-kinetic-text — Premium kinetic text for Void Energy hosts.
 *
 * ## Void Energy hosts
 *
 * Use `createVoidEnergyTextStyleSnapshot` to resolve runtime state from the DOM:
 *
 * ```svelte
 * <script lang="ts">
 *   import { KineticText, createVoidEnergyTextStyleSnapshot } from '@dgrslabs/void-energy-kinetic-text';
 *   let el = $state<HTMLElement>();
 *   const snapshot = $derived(el ? createVoidEnergyTextStyleSnapshot(el) : null);
 * </script>
 * <div bind:this={el}>
 *   {#if snapshot}<KineticText text="Hello world" styleSnapshot={snapshot} />{/if}
 * </div>
 * ```
 *
 * ## Non-VE hosts
 *
 * Construct `TextStyleSnapshot` manually — no adapter needed:
 *
 * ```typescript
 * import { KineticText } from '@dgrslabs/void-energy-kinetic-text';
 * const snapshot = {
 *   font: '16px "Inter", sans-serif',
 *   lineHeight: 24,
 *   physics: 'flat' as const,
 *   mode: 'dark' as const,
 *   density: 1,
 *   scale: 1,
 *   vars: {},
 * };
 * ```
 *
 * @module
 */
export { default as KineticText } from './svelte/KineticText.svelte';
export { createVoidEnergyTextStyleSnapshot } from './adapters/void-energy-host';

export type {
  CueTrigger,
  CycleConfig,
  EffectScope,
  ModePreset,
  PhysicsPreset,
  ReducedMotionMode,
  RevealMode,
  RevealStyle,
  StaggerPattern,
  KineticCue,
  KineticTextEffect,
  KineticTextProps,
  TextRange,
  TextStyleSnapshot,
  TextStyleSnapshotOverrides,
} from './types';
