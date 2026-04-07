/**
 * Public types for @dgrslabs/void-energy-ambient-layers.
 */

export type ReducedMotionMode = 'auto' | 'respect' | 'ignore';

export type FlakeDensity = 'sparse' | 'medium' | 'heavy';

/** Common props shared by every ambient layer component. */
export interface AmbientLayerProps {
  /** Effect strength, 0..1. Default 0.5. Scales opacity and particle count. */
  intensity?: number;
  /** When false, the layer is not rendered at all. Default true. */
  enabled?: boolean;
  /**
   * Reduced-motion handling:
   * - 'respect' (default): freeze particles + halve opacity when user prefers reduced motion
   * - 'ignore': always animate, regardless of user preference
   * - 'auto': alias for 'respect'
   */
  reducedMotion?: ReducedMotionMode;
  /** Extra class names forwarded to the root layer element. */
  class?: string;
}

/** Props for `<SnowLayer>`. */
export interface SnowLayerProps extends AmbientLayerProps {
  /** Horizontal drift strength, 0..1. Default 0.3. */
  wind?: number;
  /** Particle count preset. Default 'medium'. */
  flakeCount?: FlakeDensity;
}

export type RainDensity = 'light' | 'medium' | 'heavy';

/** Props for `<RainLayer>`. */
export interface RainLayerProps extends AmbientLayerProps {
  /** Rain angle in degrees from vertical. Negative = leans left. Clamped to ±45. Default 15. */
  angle?: number;
  /** Drop count preset. Default 'medium'. */
  density?: RainDensity;
}

export type FogDrift = 'still' | 'slow' | 'fast';

/** Props for `<FogLayer>`. */
export interface FogLayerProps extends AmbientLayerProps {
  /**
   * Horizontal drift speed of the fog blobs.
   * - 'still': frozen, no movement (animation paused)
   * - 'slow' (default): gentle ~80–120s drift
   * - 'fast': brisk ~30–50s drift
   */
  drift?: FogDrift;
  /**
   * Peak opacity ceiling, 0..1. Default 0.5. Acts as a hard cap on fog density,
   * separate from `intensity` (which scales bloom and pulse breathing).
   */
  opacity?: number;
}

/** Props for `<BloodLayer>`. */
export interface BloodLayerProps extends AmbientLayerProps {
  /**
   * Whether the edge-vignette heartbeat pulse renders. Default true.
   * Set to false for "just drips" use cases.
   */
  pulse?: boolean;
  /**
   * Drip frequency in drips per minute. Default 12. Clamped to 0..60.
   * Set to 0 to disable drips entirely (leaving only the vignette pulse).
   */
  dripRate?: number;
}
