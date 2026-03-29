export type PhysicsPreset = 'glass' | 'flat' | 'retro';
export type ModePreset = 'light' | 'dark';

export type RevealMode =
  | 'char'
  | 'word'
  | 'sentence'
  | 'sentence-pair'
  | 'cycle'
  | 'decode';

export type StoryTextEffect =
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

export interface VoidEnergyTextStyleSnapshotInput {
  font: string;
  lineHeight: number;
  physics: PhysicsPreset;
  mode: ModePreset;
  density?: number;
  scale?: number;
  vars?: Record<string, string>;
}

export interface StoryCue {
  id: string;
  atMs: number;
  effect: StoryTextEffect;
  scope: EffectScope;
  range?: TextRange;
  seed?: number;
  durationMs?: number;
}

export interface StoryTextProps {
  text: string;
  styleSnapshot: TextStyleSnapshot;
  revealMode?: RevealMode;
  activeEffect?: StoryTextEffect | null;
  cues?: StoryCue[];
  seed?: number;
  reducedMotion?: ReducedMotionMode;
  as?: string;
  class?: string;
}
