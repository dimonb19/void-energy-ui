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

/** Persistent-layer intensity scale. */
export type AmbientIntensity = 1 | 2 | 3;

/** Action-layer variant — scales animation amplitude/speed, not keyframes. */
export type ActionLevel = 'light' | 'medium' | 'heavy';

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
  /** Intensity level 1..3. Default 2. */
  intensity?: AmbientIntensity;
  /**
   * Auto-decay duration in ms per level (3 → 2 → 1 → 0).
   * When 0 or omitted, decay is disabled and intensity stays as set.
   * Default: per-variant value from `params.ts`.
   */
  decayMs?: number;
  /** Fired when decay reaches 0 and the layer should unmount. */
  onComplete?: () => void;
}

export interface PsychologyLayerProps extends AmbientBaseProps {
  variant: PsychologyLayer;
  intensity?: AmbientIntensity;
  decayMs?: number;
  onComplete?: () => void;
}

export interface ActionLayerProps extends AmbientBaseProps {
  variant: ActionLayer;
  /** Animation amplitude/speed preset. Default 'medium'. */
  level?: ActionLevel;
  /** Fired when the one-shot animation finishes and the layer should unmount. */
  onComplete?: () => void;
}

export interface EnvironmentLayerProps extends AmbientBaseProps {
  variant: EnvironmentLayer;
  /** Overall layer opacity multiplier (0..1). Default 1. */
  opacity?: number;
}
