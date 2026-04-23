/**
 * Public types for @void-energy/ambient-layers.
 *
 * SSOT for every layer id, category, and prop shape. Mirrors the flat-union
 * pattern used by `@void-energy/kinetic-text` (`KineticTextEffect`).
 */

export type ReducedMotionMode = 'respect' | 'ignore';

// ─────────────────────────────────────────────────────────────────────────────
// Category taxonomy
// ─────────────────────────────────────────────────────────────────────────────

export type AmbientCategory =
  | 'atmosphere'
  | 'psychology'
  | 'action'
  | 'environment';

/** Persistent weather/environmental sensory layers (behind content). */
export type AtmosphereLayer =
  | 'rain'
  | 'snow'
  | 'ash'
  | 'fog'
  | 'underwater'
  | 'heat'
  | 'storm'
  | 'wind'
  | 'spores'
  | 'fireflies';

/** Persistent mental/emotional edge-framed layers (above content, below UI). */
export type PsychologyLayer =
  | 'danger'
  | 'tension'
  | 'dizzy'
  | 'focus'
  | 'filmGrain'
  | 'haze'
  | 'calm'
  | 'serenity'
  | 'success'
  | 'fail'
  | 'awe'
  | 'melancholy';

/** One-shot transient action layers (top, auto-clear after animation). */
export type ActionLayer =
  | 'impact'
  | 'speed'
  | 'glitch'
  | 'flash'
  | 'reveal'
  | 'dissolve'
  | 'shake'
  | 'zoomBurst';

/** Sticky baseline environment tint layers (deepest, rarely changes). */
export type EnvironmentLayer =
  | 'night'
  | 'neon'
  | 'dawn'
  | 'dusk'
  | 'sickly'
  | 'toxic'
  | 'underground'
  | 'candlelit'
  | 'overcast';

export type AmbientLayerId =
  | AtmosphereLayer
  | PsychologyLayer
  | ActionLayer
  | EnvironmentLayer;

/** Persistent-layer intensity scale. Unified vocabulary across every category. */
export type AmbientIntensity = 'low' | 'medium' | 'high';

/** Decay step including the resting state. */
export type AmbientLevel = 'off' | AmbientIntensity;

/** Action-layer variant — scales animation amplitude/speed, not keyframes. */
export type ActionLevel = AmbientIntensity;

// ─────────────────────────────────────────────────────────────────────────────
// Base props
// ─────────────────────────────────────────────────────────────────────────────

interface AmbientBaseProps {
  /** When false, the layer is not rendered. Default true. */
  enabled?: boolean;
  /**
   * Reduced-motion handling:
   * - 'respect' (default): freeze animation + halve opacity when the user prefers reduced motion
   * - 'ignore': always animate regardless
   */
  reducedMotion?: ReducedMotionMode;
  /** Extra class names forwarded to the root layer element. */
  class?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Category props
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unified lifecycle callbacks shared by every category.
 *
 * - `onChange` fires on every intensity transition, including the initial
 *   value and the final 'off' step. Persistent layers fire it on each decay
 *   tick. Action layers fire it synthetically (start → off). Environment
 *   fires it on prop change.
 * - `onEnd` fires exactly once when the layer reaches 'off' (persistent) or
 *   when the one-shot animation completes (action). Environment never fires
 *   `onEnd` — it is sticky.
 */
export interface AmbientLifecycle {
  onChange?: (intensity: AmbientLevel) => void;
  onEnd?: () => void;
}

export interface AtmosphereLayerProps
  extends AmbientBaseProps,
    AmbientLifecycle {
  variant: AtmosphereLayer;
  /** Intensity level: 'low' | 'medium' | 'high'. Default 'medium'. */
  intensity?: AmbientIntensity;
  /**
   * Auto-decay duration in ms per step (heavy → medium → light → off).
   * When 0, decay is disabled and intensity stays as set.
   * Default: per-variant value from `params.ts`.
   */
  durationMs?: number;
}

export interface PsychologyLayerProps
  extends AmbientBaseProps,
    AmbientLifecycle {
  variant: PsychologyLayer;
  intensity?: AmbientIntensity;
  durationMs?: number;
}

export interface ActionLayerProps extends AmbientBaseProps, AmbientLifecycle {
  variant: ActionLayer;
  /** Animation amplitude/speed preset. Default 'medium'. */
  intensity?: AmbientIntensity;
  /**
   * Total one-shot animation duration in ms.
   * Default: per-variant value from `params.ts`.
   */
  durationMs?: number;
}

export interface EnvironmentLayerProps
  extends AmbientBaseProps,
    AmbientLifecycle {
  variant: EnvironmentLayer;
  /** Tint strength: 'low' | 'medium' | 'high'. Default 'medium'. */
  intensity?: AmbientIntensity;
}
