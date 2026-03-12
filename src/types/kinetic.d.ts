type KineticMode = 'char' | 'word' | 'cycle' | 'decode';
type KineticWordChunk = 'word' | 'sentence' | 'sentence-pair';

interface KineticConfig {
  /** Single text string (for char, word, decode modes) */
  text?: string;
  /** Array of strings to rotate through (for cycle mode) */
  words?: string[];
  /** Animation mode — defaults to 'char' */
  mode?: KineticMode;
  /** Milliseconds per unit: per-char, per-word, or per-scramble tick. Default: 40 */
  speed?: number;
  /** Initial delay before animation starts (ms). Default: 0 */
  delay?: number;
  /** Show a blinking cursor during animation. Default: false */
  cursor?: boolean;
  /** Cursor character. Default: '▍' */
  cursorChar?: string;
  /** Remove cursor after animation completes. Default: true */
  cursorRemoveOnComplete?: boolean;

  // ── Word mode ──
  /** Chunk size for word mode reveal. Default: 'word' */
  chunk?: KineticWordChunk;
  /** Per-character speed (ms) for smooth chunk reveal in sentence modes. Default: 8 */
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
