export type PhysicsPreset = 'glass' | 'flat' | 'retro';
export type ModePreset = 'light' | 'dark';

export type RevealMode =
  | 'char'
  | 'word'
  | 'sentence'
  | 'sentence-pair'
  | 'cycle'
  | 'decode';

export type RevealStyle =
  | 'instant'
  | 'fade'
  | 'rise'
  | 'drop'
  | 'scale'
  | 'blur';

export type StaggerPattern = 'sequential' | 'wave' | 'cascade' | 'random';

export type KineticTextEffect =
  | 'shake'
  | 'quake'
  | 'jolt'
  | 'glitch'
  | 'surge'
  | 'warp'
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
  | 'sway';

export type EffectScope = 'block' | 'line' | 'word' | 'glyph' | 'range';
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
  scope: EffectScope;
  trigger: CueTrigger;
  /** Milliseconds from reveal start. Required when `trigger: 'at-time'`. */
  atMs?: number;
  /** Target character range. Required when `scope: 'range'`. */
  range?: TextRange;
  seed?: number;
  /** Override the effect's default duration (ms). */
  durationMs?: number;
}

export interface CycleConfig {
  words: string[];
  pauseDuration?: number;
  loop?: boolean;
  cycleTransition?: 'type' | 'fade' | 'decode';
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
  cursor: boolean;
  cursorChar: string;
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
  cursor: boolean;
  cursorRemoveOnComplete: boolean;
  seed: number;
  reducedMotion: boolean;
  cues: KineticCue[];
  onrevealcomplete?: () => void;
  oneffectscomplete?: () => void;
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
 * atmosphere-derived  → revealMode, revealStyle, staggerPattern
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
  staggerPattern?: StaggerPattern;
  stagger?: number;
  revealDuration?: number;
  activeEffect?: KineticTextEffect | null;
  effectScope?: EffectScope;
  cues?: KineticCue[];
  seed?: number;
  reducedMotion?: ReducedMotionMode;
  cursor?: boolean;
  cursorChar?: string;
  cursorRemoveOnComplete?: boolean;
  speed?: number;
  charSpeed?: number;
  scramblePasses?: number;
  cycle?: CycleConfig;
  onrevealcomplete?: () => void;
  oneffectscomplete?: () => void;
  as?: string;
  class?: string;
}
