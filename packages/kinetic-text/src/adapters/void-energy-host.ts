import type {
  ModePreset,
  PhysicsPreset,
  TextStyleSnapshot,
  TextStyleSnapshotOverrides,
} from '../types';

/**
 * CSS variables the host adapter forwards into TextStyleSnapshot.vars.
 * These drive physics-tuned animations inside the kinetic text package.
 *
 * Speed tokens: control animation timing (reveal, stagger, transitions)
 * Ease tokens: physics-appropriate easing curves
 * Color tokens: used by effects (surge glow, burn, etc.)
 * Delay tokens: cascade/sequence timing for stagger patterns
 * Physics tokens: blur radius for glass motion blur effects
 */
const FORWARDED_VARS = [
  // Speed
  '--speed-fast',
  '--speed-base',
  '--speed-slow',
  // Easing
  '--ease-spring-gentle',
  '--ease-spring-snappy',
  '--ease-flow',
  // Colors
  '--energy-primary',
  '--text-main',
  '--text-dim',
  // Delays
  '--delay-cascade',
  '--delay-sequence',
  // Physics
  '--physics-blur',
] as const;

/**
 * Extract required CSS variable values from computed styles.
 * Returns a Record of variable name → resolved value (trimmed).
 * Empty/missing variables are omitted from the result.
 */
function resolveRequiredVars(
  computed: CSSStyleDeclaration,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const name of FORWARDED_VARS) {
    const value = computed.getPropertyValue(name).trim();
    if (value) {
      vars[name] = value;
    }
  }
  return vars;
}

/**
 * Resolve a {@link TextStyleSnapshot} from a live DOM element in a Void Energy host.
 *
 * Reads physics/mode from `<html>` data attributes (`data-physics`, `data-mode`),
 * computed font/lineHeight from the target element, and forwards relevant CSS
 * variables for the package's physics-tuned animations.
 *
 * This is a **pure function** — it reads current DOM state and returns a snapshot.
 * For reactive updates in Svelte, call this inside `$derived()` or `$effect()`:
 *
 * ```svelte
 * <script lang="ts">
 *   import { createVoidEnergyTextStyleSnapshot } from '@dgrslabs/void-energy-kinetic-text/adapters/void-energy-host';
 *
 *   let containerEl = $state<HTMLElement>();
 *
 *   // Re-derive snapshot when VoidEngine state changes
 *   const snapshot = $derived(
 *     containerEl ? createVoidEnergyTextStyleSnapshot(containerEl) : null
 *   );
 * </script>
 * ```
 *
 * **Non-VE hosts** can construct {@link TextStyleSnapshot} manually:
 *
 * ```typescript
 * const snapshot: TextStyleSnapshot = {
 *   font: '16px "Inter", sans-serif',
 *   lineHeight: 24,
 *   physics: 'flat',
 *   mode: 'dark',
 *   density: 1,
 *   scale: 1,
 *   vars: {},  // No VE tokens needed — effects use built-in fallbacks
 * };
 * ```
 *
 * @param element - The DOM element whose computed font/lineHeight to capture.
 *   Should be the element that will contain the KineticText, or a representative
 *   element with the same typographic styles.
 * @param overrides - Optional partial overrides. Merged on top of resolved values.
 *   `overrides.vars` is shallow-merged with auto-resolved vars (overrides win).
 * @returns A complete {@link TextStyleSnapshot} for passing to `<KineticText>`.
 */
export function createVoidEnergyTextStyleSnapshot(
  element: HTMLElement,
  overrides?: TextStyleSnapshotOverrides,
): TextStyleSnapshot {
  const root = document.documentElement;
  const computed = getComputedStyle(element);

  const physics = (root.dataset.physics ?? 'glass') as PhysicsPreset;
  const mode = (root.dataset.mode ?? 'dark') as ModePreset;

  const fontFamily = computed.fontFamily;
  const font = `${computed.fontSize} ${fontFamily}`;
  const lineHeight =
    parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5;

  // Warn if font falls back to system-ui — Canvas measurement may diverge
  // from CSS rendering, causing misaligned character positions.
  if (
    fontFamily.startsWith('system-ui') ||
    fontFamily.startsWith('-apple-system')
  ) {
    console.warn(
      '[KineticText] Resolved font starts with system-ui. ' +
        'Canvas text measurement may not match CSS rendering for system fonts. ' +
        'For reliable character positioning, use a named font (e.g., "Inter", "Fira Code").',
    );
  }

  const rootComputed = getComputedStyle(root);
  const vars = resolveRequiredVars(rootComputed);

  return {
    font: overrides?.font ?? font,
    lineHeight: overrides?.lineHeight ?? lineHeight,
    physics: overrides?.physics ?? physics,
    mode: overrides?.mode ?? mode,
    density: overrides?.density ?? 1,
    scale: overrides?.scale ?? 1,
    vars: overrides?.vars ? { ...vars, ...overrides.vars } : vars,
  };
}
