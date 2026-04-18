export type PhysicsPreset = 'glass' | 'flat' | 'retro';
export type ModePreset = 'light' | 'dark';

export type RevealMode = 'char' | 'word' | 'decode';

/**
 * Named speed presets.
 * - `'slow'`    — speed: 80ms, charSpeed: 16ms (very deliberate, slow typing)
 * - `'default'` — speed: 40ms, charSpeed: 8ms  (standard baseline, visible typing)
 * - `'fast'`    — speed: 20ms, charSpeed: 4ms  (quick but still legible)
 */
export type KineticSpeedPreset = 'slow' | 'default' | 'fast';

export const SPEED_PRESETS: Record<
  KineticSpeedPreset,
  { speed: number; charSpeed: number }
> = {
  slow: { speed: 80, charSpeed: 16 },
  default: { speed: 40, charSpeed: 8 },
  fast: { speed: 20, charSpeed: 4 },
};

/**
 * Reveal style controls the visual transition from hidden → visible per glyph.
 *
 * - `'pop'` — Universal default: characters pop in from random offsets, fast and light.
 * - `'blur'` — Fade in with blur dissipation.
 * - `'scale'` — Scale up from zero.
 * - `'scramble'` — Characters fly in from random positions/rotations and settle.
 * - `'rise'` — Characters ascend from below into position.
 * - `'drop'` — Characters fall from above into position with gravity feel.
 * - `'instant'` — No animation.
 *
 * All reveal styles work on all physics presets. When `revealStyle` is not
 * specified on the component, it defaults to `'pop'` via `revealStyleForPhysics()`.
 */
export type RevealStyle =
  | 'instant'
  | 'scale'
  | 'blur'
  | 'scramble'
  | 'rise'
  | 'drop'
  | 'pop';

export type StaggerPattern = 'sequential';

export type KineticTextEffect =
  | 'shake'
  | 'quake'
  | 'jolt'
  | 'glitch'
  | 'surge'
  | 'warp'
  | 'explode'
  | 'collapse'
  | 'scatter'
  | 'spin'
  | 'bounce'
  | 'flash'
  | 'shatter'
  | 'vortex'
  | 'ripple'
  | 'slam'
  | 'drift'
  | 'flicker'
  | 'breathe'
  | 'tremble'
  | 'pulse'
  | 'whisper'
  | 'fade'
  | 'freeze'
  | 'burn'
  | 'static'
  | 'distort'
  | 'sway'
  | 'glow'
  | 'wave'
  | 'float'
  | 'wobble'
  | 'sparkle'
  | 'drip'
  | 'stretch'
  | 'vibrate'
  | 'haunt';

/** Derive the reveal style from the active physics preset. */
export function revealStyleForPhysics(_physics: PhysicsPreset): RevealStyle {
  return 'pop';
}

export type ReducedMotionMode = 'auto' | 'always' | 'never';
export type CueTrigger = 'at-time' | 'on-complete';

export interface TextRange {
  start: number;
  end: number;
}

export interface TextStyleSnapshot {
  font: string;
  lineHeight: number;
  physics: PhysicsPreset;
  mode: ModePreset;
  density: number;
  scale: number;
  vars: Record<string, string>;
}

export interface TextStyleSnapshotOverrides {
  font?: string;
  lineHeight?: number;
  physics?: PhysicsPreset;
  mode?: ModePreset;
  density?: number;
  scale?: number;
  vars?: Record<string, string>;
}

/**
 * A cue that triggers a one-shot effect during (or after) reveal playback.
 *
 * **TTS-driven usage** (Conexus wrapper):
 * TTS providers expose word-level timestamps (Web Speech API `onboundary`,
 * or server-side TTS alignment). The app wrapper converts those timestamps
 * to `KineticCue[]` with `trigger: 'at-time'` and `atMs` relative to reveal
 * start. The kinetic timeline dispatches cues as playback progresses.
 *
 * **Completion-triggered cues** use `trigger: 'on-complete'` (no `atMs`).
 * These fire after all units are revealed — useful for punctuation effects
 * like a final shake on an exclamation mark.
 *
 * **Fallback (no TTS):**
 * When no TTS track exists, reveal progresses at standard speed.
 * One-shot effects fire on completion; continuous effects start immediately.
 *
 * **Cue dispatch rules:**
 * - Time-triggered cues are sorted by `atMs` ascending, then on-complete cues
 * - On each RAF tick: pending time cues with `atMs <= elapsed` fire in order
 * - Each cue fires at most once (tracked by `id`)
 * - `trigger: 'at-time'` with `atMs: 0` fires at reveal start
 * - Cues with out-of-range `range` are silently skipped (dev warning in non-prod)
 *
 * @example
 * ```typescript
 * const cues: KineticCue[] = [
 *   { id: 'word-3-shake', effect: 'shake', scope: 'range',
 *     trigger: 'at-time', atMs: 1200, range: { start: 15, end: 20 } },
 *   { id: 'end-surge', effect: 'surge', scope: 'block',
 *     trigger: 'on-complete' },
 * ];
 * ```
 */
export interface KineticCue {
  id: string;
  effect: KineticTextEffect;
  trigger: CueTrigger;
  /** Milliseconds from reveal start. Required when `trigger: 'at-time'`. */
  atMs?: number;
  /** Target character range. Required when `scope: 'range'`. */
  range?: TextRange;
  seed?: number;
  /** Override the effect's default duration (ms). */
  durationMs?: number;
}

// ── Internal types (not exported from package index) ──────────────

export type UnitState = 'hidden' | 'revealing' | 'visible';

export interface GraphemeInfo {
  char: string;
  segmentIndex: number;
  graphemeIndex: number;
  width: number;
}

export interface CharPosition {
  char: string;
  x: number;
  lineIndex: number;
  charIndexInLine: number;
  globalIndex: number;
  width: number;
  isSpace: boolean;
}

export interface RenderOptions {
  lineHeight: number;
  revealStyle: RevealStyle;
  physics: PhysicsPreset;
  mode: ModePreset;
  preRevealed?: boolean;
}

export interface TimelineConfig {
  revealMode: RevealMode;
  revealStyle: RevealStyle;
  staggerPattern: StaggerPattern;
  stagger: number;
  revealDuration: number;
  speed: number;
  charSpeed: number;
  scramblePasses: number;
  physics: PhysicsPreset;
  seed: number;
  reducedMotion: boolean;
  cues: KineticCue[];
  /** External per-character reveal marks. When present, overrides computed stagger. */
  revealMarks?: RevealMark[];
  /** Start the timeline in paused state at elapsed=0. Useful when an external clock (e.g. TTS audio) will drive playback. */
  startPaused?: boolean;
  onrevealcomplete?: () => void;
  oneffectscomplete?: () => void;
  onrevealword?: (wordIndex: number, word: string) => void;
}

/**
 * External timing mark for a single character. Used to drive reveal from a
 * precise source — e.g. TTS word/char timestamps mapped to char indices.
 *
 * When `KineticText` receives `revealMarks`, the timeline uses these instead of
 * the computed stagger. Characters between explicit marks are micro-staggered
 * by linear interpolation between the surrounding marks.
 */
export interface RevealMark {
  /** Global character index (0-based, across the full text). */
  index: number;
  /** Time in ms from reveal start when this character should reveal. */
  timeMs: number;
}

/**
 * Imperative control surface for an active reveal timeline.
 *
 * Obtained via `bind:controls` on `<KineticText>`. The consumer can pause,
 * resume, seek, or skip the timeline — most commonly used to keep reveal
 * in sync with an external clock such as a TTS `<audio>` element.
 *
 * Getters are live — they reflect the current timeline state at call time.
 * The object identity is stable across re-layouts so consumer `$effect`s
 * don't re-run when internal positions recompute.
 */
export interface KineticTextControls {
  pause(): void;
  resume(): void;
  seek(ms: number): void;
  /**
   * Non-destructive clock pin. Sets the timeline's elapsed clock to `ms`
   * and reveals any newly-due glyphs / fires any newly-due cues, without
   * wiping the already-revealed state. Use for drift correction during
   * synced playback. For user scrubs (where the wipe is desired), use `seek`.
   */
  nudge(ms: number): void;
  skipToEnd(): void;
  /**
   * Set the timeline playback rate. 1 = real time. The rate scales how fast
   * `elapsed` advances per wall-clock ms — useful for syncing to an audio
   * element with a non-1× `playbackRate`. Cue and reveal timings stay in
   * timeline-time, so existing `atMs`/`startMs` values do not need to be
   * rewritten when the rate changes. Clamped to [0.1, 4].
   */
  setRate(rate: number): void;
  readonly progress: number;
  readonly elapsed: number;
  readonly isPaused: boolean;
  readonly isComplete: boolean;
  readonly rate: number;
}

// ── Public types ──────────────────────────────────────────────────

/**
 * Props for the `<KineticText>` component.
 *
 * **Conexus wrapper mapping** (app-level, NOT in this package):
 *
 * ```
 * step.text           → text
 * step.seed (or hash) → seed
 * atmosphere-derived  → revealMode, staggerPattern (revealStyle auto-derived from physics)
 * VoidEngine state    → styleSnapshot (via createVoidEnergyTextStyleSnapshot)
 * step.narrativeEffect → activeEffect (continuous) or → cues (one-shot)
 * TTS word boundaries → cues with atMs timestamps
 * ```
 *
 * The Conexus wrapper (`ConexusKineticText.svelte`) maps story-step data to
 * these props. The kinetic text package never imports Conexus-specific code.
 *
 * **Non-VE consumer path:**
 * Construct {@link TextStyleSnapshot} manually (no adapter needed), pass
 * `physics`/`mode` as literal strings, and forward any needed CSS variables
 * in `vars`. Effects use built-in fallbacks when tokens are absent.
 */
export interface KineticTextProps {
  text: string;
  styleSnapshot: TextStyleSnapshot;
  revealMode?: RevealMode;
  revealStyle?: RevealStyle;
  /** Named speed preset. Overridden by explicit speed/charSpeed values. */
  speedPreset?: KineticSpeedPreset;
  staggerPattern?: StaggerPattern;
  stagger?: number;
  revealDuration?: number;
  activeEffect?: KineticTextEffect | null;
  cues?: KineticCue[];
  seed?: number;
  reducedMotion?: ReducedMotionMode;
  speed?: number;
  charSpeed?: number;
  scramblePasses?: number;
  /** Fire a one-shot effect imperatively on the current render. Increment to re-fire. */
  oneShotEffect?: KineticTextEffect | null;
  /** Counter — increment to trigger the one-shot. Value of 0 is ignored. */
  oneShotTrigger?: number;
  /** Called when an imperative one-shot effect finishes (all characters done). */
  ononeshotcomplete?: () => void;
  /** Show skeleton loading state. When true, layout-accurate skeleton lines are displayed and reveal is deferred. When set to false, skeleton fades out and reveal begins. */
  loading?: boolean;
  /** Hint: number of skeleton lines to show before layout completes. Overridden by actual layout once computed. Default 3. */
  skeletonLines?: number;
  /** Hint: width ratio (0–1) of the last skeleton line before layout completes. Default 0.7. */
  skeletonLastLineWidth?: number;
  /** Start with all text visible — skip reveal entirely. Useful for showcasing effects without the reveal animation. */
  preRevealed?: boolean;
  /**
   * External per-character reveal marks. When present, overrides computed
   * stagger — the timeline reveals each character at the specified time.
   * Typical source: TTS word/character timestamps mapped to char indices.
   */
  revealMarks?: RevealMark[];
  /**
   * When true, the reveal timeline starts paused at elapsed=0 and waits for
   * a consumer to call `controls.resume()` (or flip this prop back to false).
   * Use this when an external clock owns playback — e.g. TTS audio where
   * the reveal should wait for `audio.play()` before advancing. Reactive:
   * flipping true→false resumes, false→true pauses.
   */
  paused?: boolean;
  /**
   * Imperative control surface for the active timeline. Bind with
   * `bind:controls={…}` to pause, resume, seek, or skip the reveal from
   * outside the component — e.g. to keep it in sync with audio playback.
   */
  controls?: KineticTextControls;
  onrevealcomplete?: () => void;
  oneffectscomplete?: () => void;
  /**
   * Fires the first time a character belonging to a new word reveals.
   * Emits the word index (0-based, counting only non-space groups) and
   * the word string. Useful for transcript highlighting.
   */
  onrevealword?: (wordIndex: number, word: string) => void;
  as?: string;
  class?: string;
}

/**
 * Props for the standalone `<KineticSkeleton>` component.
 *
 * A lightweight skeleton placeholder that renders layout-accurate shimmer
 * line-blocks without the full animation engine. Useful as a loading state
 * or premium-tier fallback.
 */
export interface KineticSkeletonProps {
  /** Number of skeleton lines to display. Default 3. */
  lines?: number;
  /** Width ratio (0–1) of the last line. Default 0.7. */
  lastLineWidth?: number;
  /** Line height in px. Used for skeleton block height. Default 24. */
  lineHeight?: number;
  /** Style snapshot for CSS var injection and physics/mode detection. */
  styleSnapshot: TextStyleSnapshot;
  class?: string;
}
