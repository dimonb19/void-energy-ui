type NarrativeEffect =
  | 'shake'
  | 'quake'
  | 'jolt'
  | 'glitch' // one-shot
  | 'drift'
  | 'flicker'
  | 'breathe'
  | 'tremble' // continuous
  | 'pulse'
  | 'whisper'; // continuous

interface NarrativeConfig {
  /** The effect to apply, or null to clear */
  effect: NarrativeEffect | null;
  /** Master enable flag — when false, the engine is a complete no-op.
   *  Consumer derives this from voidEngine.userConfig.narrativeEffects. */
  enabled?: boolean;
  /** Callback when a one-shot effect finishes (not called for continuous).
   *  Skipped effects (reduced motion, enabled: false) still fire onComplete
   *  synchronously — the callback signals "this effect slot is done" regardless
   *  of whether anything visual happened. */
  onComplete?: () => void;
}
