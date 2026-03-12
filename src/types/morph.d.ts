interface MorphOptions {
  /** Animate width changes (default: true) */
  width?: boolean;
  /** Animate height changes (default: true) */
  height?: boolean;
  /** Minimum size change in pixels to trigger animation (default: 2) */
  threshold?: number;
  /** Callback fired when morph animation starts */
  onStart?: () => void;
  /** Callback fired when morph animation completes */
  onComplete?: () => void;
}
