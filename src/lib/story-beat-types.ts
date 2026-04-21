import type {
  ActionLayer,
  AtmosphereLayer,
  EnvironmentLayer,
  PsychologyLayer,
} from '@dgrslabs/void-energy-ambient-layers/types';
import type {
  RevealStyle,
  KineticTextEffect,
  KineticSpeedPreset,
  KineticStyleKind,
} from '@dgrslabs/void-energy-kinetic-text/types';

// The literal tuples below are hand-synced with the package type unions. The
// `satisfies readonly X[]` guard catches deletions from the source union
// (package removes a layer → compiler fails here) but cannot catch additions
// (package adds a layer → this list silently lacks it, and the LLM can never
// emit it). When a package grows its union, update the corresponding list
// here and re-run tests. The prompt builder derives its enum strings from
// these same arrays, so keeping them in sync is the whole contract.

export type AmbientIntensity = 'low' | 'medium' | 'high';

export const AMBIENT_INTENSITIES = [
  'low',
  'medium',
  'high',
] as const satisfies readonly AmbientIntensity[];

export const ATMOSPHERE_LAYERS = [
  'rain',
  'snow',
  'ash',
  'fog',
  'underwater',
  'heat',
  'storm',
  'wind',
  'spores',
  'fireflies',
] as const satisfies readonly AtmosphereLayer[];

export const PSYCHOLOGY_LAYERS = [
  'danger',
  'tension',
  'dizzy',
  'focus',
  'filmGrain',
  'haze',
  'calm',
  'serenity',
  'success',
  'fail',
  'awe',
  'melancholy',
] as const satisfies readonly PsychologyLayer[];

export const ENVIRONMENT_LAYERS = [
  'night',
  'neon',
  'dawn',
  'dusk',
  'sickly',
  'toxic',
  'underground',
  'candlelit',
  'overcast',
] as const satisfies readonly EnvironmentLayer[];

export const REVEAL_STYLES = [
  'instant',
  'scale',
  'blur',
  'scramble',
  'rise',
  'drop',
  'pop',
] as const satisfies readonly RevealStyle[];

export const KINETIC_EFFECTS = [
  'shake',
  'quake',
  'jolt',
  'glitch',
  'surge',
  'warp',
  'explode',
  'collapse',
  'scatter',
  'spin',
  'bounce',
  'flash',
  'shatter',
  'vortex',
  'ripple',
  'slam',
  'drift',
  'flicker',
  'breathe',
  'tremble',
  'pulse',
  'whisper',
  'fade',
  'freeze',
  'burn',
  'static',
  'distort',
  'sway',
  'glow',
  'wave',
  'float',
  'wobble',
  'sparkle',
  'drip',
  'stretch',
  'vibrate',
  'haunt',
] as const satisfies readonly KineticTextEffect[];

export const SPEED_PRESETS = [
  'slow',
  'default',
  'fast',
] as const satisfies readonly KineticSpeedPreset[];

export const ACTION_LAYERS = [
  'impact',
  'speed',
  'glitch',
  'flash',
  'reveal',
  'dissolve',
  'shake',
  'zoomBurst',
] as const satisfies readonly ActionLayer[];

/**
 * Inline visual styles applied to word ranges inside `text`. Applied on the
 * `kt-word` wrapper as a `data-kt-style` attribute; composes with kinetic
 * effects (a styled word can still carry a one-shot). Curly quote marks for
 * `speech` are rendered by CSS `::before` / `::after`, not typed into `text`.
 */
export const STYLE_KINDS = [
  'speech',
  'aside',
  'emphasis',
  'underline',
  'code',
] as const satisfies readonly KineticStyleKind[];

export type StoryStyleKind = (typeof STYLE_KINDS)[number];

/**
 * Ambient layers that warp the backdrop via full-viewport SVG filters or
 * large animated blurs. On integrated GPUs (e.g. M1 Air) each one alone eats
 * most of a frame's raster budget, and stacking them with a `kinetic.continuous`
 * effect forces re-composition of the whole filter pipeline on every text
 * frame. The schema rejects HEAVY + continuous combinations so the LLM can't
 * produce a beat that janks low-end hardware.
 */
export const HEAVY_ATMOSPHERE_LAYERS = [
  'heat',
  'underwater',
  'fog',
] as const satisfies readonly AtmosphereLayer[];

export const HEAVY_PSYCHOLOGY_LAYERS = [
  'dizzy',
  'haze',
] as const satisfies readonly PsychologyLayer[];

export interface StoryOneShot {
  /** 0-indexed word in `text` where the effect should fire. */
  atWord: number;
  effect: KineticTextEffect;
}

/**
 * A span of words inside `text` that carries a visual style treatment. Word
 * indices use the same 0-indexed whitespace-word system as `atWord` on
 * `StoryOneShot` / `StoryAction`. `fromWord` and `toWord` are inclusive, and
 * a single-word span has `fromWord === toWord`.
 */
export interface StoryStyleSpan {
  fromWord: number;
  toWord: number;
  kind: StoryStyleKind;
}

export interface StoryAction {
  /** 0-indexed word in `text` where the ambient action should burst. */
  atWord: number;
  variant: ActionLayer;
  intensity: AmbientIntensity;
}

export interface StoryAmbient {
  /** Baseline environment tint for the beat. At most one. */
  environment?: Array<{
    layer: EnvironmentLayer;
    intensity: AmbientIntensity;
  }>;
  /**
   * Atmosphere XOR psychology — a beat picks one or the other, never both.
   * Stacking both reads as noise; one signal is the vibe.
   */
  atmosphere?: Array<{
    layer: AtmosphereLayer;
    intensity: AmbientIntensity;
  }>;
  psychology?: Array<{
    layer: PsychologyLayer;
    intensity: AmbientIntensity;
  }>;
  /**
   * One-shot ambient bursts timed to spoken words. Fired at `wordStart[atWord]` —
   * from TTS timestamps when narration is on, from stagger-based estimates otherwise.
   * At most one per beat — a single money-moment burst.
   */
  actions?: StoryAction[];
}

export interface StoryKinetic {
  revealStyle: RevealStyle;
  continuous?: KineticTextEffect;
  speed?: KineticSpeedPreset;
  /**
   * One-shot kinetic effects timed to spoken words. Like `actions` above, fired
   * from TTS timestamps when available, from stagger-based estimates otherwise.
   */
  oneShots?: StoryOneShot[];
}

/** One turn of the Vibe Machine — the unit the LLM emits per generation. */
export interface StoryBeat {
  id: string;
  title: string;
  /** 2–6 word vibe description. Mood-focused. Displayed under the title. */
  tagline?: string;
  text: string;
  ambient: StoryAmbient;
  kinetic: StoryKinetic;
  /**
   * Inline styled word ranges (dialogue, asides, emphasis, underline).
   * Composable with effects — a styled word can still be a oneShot target.
   * Omitted on most beats; styles are spice, not staple.
   */
  styles?: StoryStyleSpan[];
}
