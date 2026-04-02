type KineticMode = 'char' | 'word' | 'cycle' | 'decode';

/**
 * Named speed presets.
 * - `'slow'`    — speed: 40ms, charSpeed: 8ms  (deliberate, visible typing)
 * - `'default'` — speed: 20ms, charSpeed: 4ms  (standard baseline)
 * - `'fast'`    — speed: 8ms,  charSpeed: 2ms  (near-instant)
 */
type KineticSpeedPreset = 'slow' | 'default' | 'fast';

interface KineticConfig {
  /** Single text string (for char, word, decode modes) */
  text?: string;
  /** Array of strings to rotate through (for cycle mode) */
  words?: string[];
  /** Animation mode — defaults to 'char' */
  mode?: KineticMode;
  /** Named speed preset. Overridden by explicit speed/charSpeed values. Default: 'default' */
  speedPreset?: KineticSpeedPreset;
  /** Milliseconds per unit: per-char, per-word, or per-scramble tick. Default: 40 */
  speed?: number;
  /** Initial delay before animation starts (ms). Default: 0 */
  delay?: number;
  // ── Word mode ──
  /** Per-character speed (ms) for word-by-word chunk reveal. Default: 8 */
  charSpeed?: number;

  // ── Cycle mode ──
  /** Pause duration on each word before transitioning (ms). Default: 1800 */
  pauseDuration?: number;
  /** Loop the cycle indefinitely. Default: true */
  loop?: boolean;
  /** Transition style between cycled words. Default: 'type' */
  cycleTransition?: 'type' | 'fade' | 'decode';
  /** Fade duration in ms (only for cycleTransition: 'fade'). Default: 200 */
  fadeDuration?: number;

  // ── Decode mode ──
  /** Characters used for scramble noise. */
  scrambleChars?: string;
  /** Number of scramble iterations before resolving each character. Default: 4 */
  scramblePasses?: number;
  onComplete?: () => void;
  onCycle?: (index: number, word: string) => void;
}

interface KineticHandle extends Promise<void> {
  abort: () => void;
}
