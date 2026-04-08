/**
 * Public types for @dgrslabs/void-energy-ambient-layers.
 *
 * SSOT for every layer id, category, and prop shape. Mirrors the flat-union
 * pattern used by `@dgrslabs/void-energy-kinetic-text` (`KineticTextEffect`).
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
  | 'heat';

/** Persistent mental/emotional edge-framed layers (above content, below UI). */
export type PsychologyLayer =
  | 'danger'
  | 'tension'
  | 'dizzy'
  | 'focus'
  | 'flashback'
  | 'dreaming';

/** One-shot transient action layers (top, auto-clear after animation). */
export type ActionLayer = 'impact' | 'speed' | 'glitch' | 'flash' | 'reveal';

/** Sticky baseline environment tint layers (deepest, rarely changes). */
export type EnvironmentLayer =
  | 'night'
  | 'neon'
  | 'dawn'
  | 'dusk'
  | 'sickly'
  | 'toxic'
  | 'underground'
  | 'candlelit';

export type AmbientLayerId =
  | AtmosphereLayer
  | PsychologyLayer
  | ActionLayer
  | EnvironmentLayer;

/** Persistent-layer intensity scale. Unified vocabulary across every category. */
export type AmbientIntensity = 'light' | 'medium' | 'heavy';

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

export interface AtmosphereLayerProps extends AmbientBaseProps {
  variant: AtmosphereLayer;
  /** Intensity level: 'light' | 'medium' | 'heavy'. Default 'medium'. */
  intensity?: AmbientIntensity;
  /**
   * Auto-decay duration in ms per step (heavy → medium → light → off).
   * When 0 or omitted, decay is disabled and intensity stays as set.
   * Default: per-variant value from `params.ts`.
   */
  decayMs?: number;
  /** Fired on every internal decay step (including the initial level). */
  onLevelChange?: (level: AmbientLevel) => void;
  /** Fired when decay reaches 'off' and the layer should unmount. */
  onComplete?: () => void;
}

export interface PsychologyLayerProps extends AmbientBaseProps {
  variant: PsychologyLayer;
  intensity?: AmbientIntensity;
  decayMs?: number;
  onLevelChange?: (level: AmbientLevel) => void;
  onComplete?: () => void;
}

export interface ActionLayerProps extends AmbientBaseProps {
  variant: ActionLayer;
  /** Animation amplitude/speed preset. Default 'medium'. */
  intensity?: AmbientIntensity;
  /** Fired when the one-shot animation finishes and the layer should unmount. */
  onComplete?: () => void;
}

export interface EnvironmentLayerProps extends AmbientBaseProps {
  variant: EnvironmentLayer;
  /** Overall layer opacity multiplier (0..1). Default 1. */
  opacity?: number;
}
