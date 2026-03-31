export type PhysicsPreset = 'glass' | 'flat' | 'retro';
export type ModePreset = 'light' | 'dark';

export type RevealMode =
  | 'char'
  | 'word'
  | 'sentence'
  | 'sentence-pair'
  | 'decode';

/**
 * Reveal style controls the visual transition from hidden → visible per glyph.
 *
 * - `'blur'` — Glass physics default: fade in with blur dissipation.
 * - `'scale'` — Flat physics default: scale up from zero.
 * - `'instant'` — Retro physics default: no animation.
 * - `'scramble'` — Characters fly in from random positions/rotations and settle.
 * - `'rise'` — Characters ascend from below into position.
 * - `'drop'` — Characters fall from above into position with gravity feel.
 * - `'random'` — Characters pop in from random offsets very fast, chaotic entrance.
 *
 * When `revealStyle` is not specified on the component, it is auto-derived
 * from the active physics preset via `revealStyleForPhysics()`.
 */
export type RevealStyle =
  | 'instant'
  | 'scale'
  | 'blur'
  | 'scramble'
  | 'rise'
  | 'drop'
  | 'random';

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
export function revealStyleForPhysics(physics: PhysicsPreset): RevealStyle {
  if (physics === 'glass') return 'blur';
  if (physics === 'flat') return 'scale';
  return 'instant';
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
  staggerPattern?: StaggerPattern;
  stagger?: number;
  revealDuration?: number;
  activeEffect?: KineticTextEffect | null;
  cues?: KineticCue[];
  seed?: number;
  reducedMotion?: ReducedMotionMode;
  cursor?: boolean;
  cursorChar?: string;
  cursorRemoveOnComplete?: boolean;
  speed?: number;
  charSpeed?: number;
  scramblePasses?: number;
  paused?: boolean;
  /** Fire a one-shot effect imperatively on the current render. Increment to re-fire. */
  oneShotEffect?: KineticTextEffect | null;
  /** Counter — increment to trigger the one-shot. Value of 0 is ignored. */
  oneShotTrigger?: number;
  onrevealcomplete?: () => void;
  oneffectscomplete?: () => void;
  as?: string;
  class?: string;
}
