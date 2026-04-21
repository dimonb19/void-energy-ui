/**
 * @dgrslabs/void-energy-kinetic-text — Premium kinetic text for Void Energy hosts.
 *
 * ## Void Energy hosts
 *
 * Use `createVoidEnergyTextStyleSnapshot` to resolve runtime state from the DOM:
 *
 * ```svelte
 * <script lang="ts">
 *   import KineticText from '@dgrslabs/void-energy-kinetic-text/component';
 *   import { createVoidEnergyTextStyleSnapshot } from '@dgrslabs/void-energy-kinetic-text/adapters/void-energy-host';
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
export { default as KineticSkeleton } from './svelte/KineticSkeleton.svelte';
export { default as TtsKineticBlock } from './svelte/TtsKineticBlock.svelte';
export { createVoidEnergyTextStyleSnapshot } from './adapters/void-energy-host';

export { SPEED_PRESETS } from './types';

export type {
  CueTrigger,
  KineticSpeedPreset,
  KineticSkeletonProps,
  KineticTextControls,
  ModePreset,
  PhysicsPreset,
  ReducedMotionMode,
  RevealMark,
  RevealMode,
  RevealStyle,
  StaggerPattern,
  KineticCue,
  KineticStyleKind,
  KineticTextEffect,
  KineticTextProps,
  StyleSpan,
  TextRange,
  TextStyleSnapshot,
  TextStyleSnapshotOverrides,
} from './types';
