import type { KineticTextEffect } from '../../types';

// ── Effect definition ────────────────────────────────────────────

export interface EffectDefinition {
  name: KineticTextEffect;
  category: 'one-shot' | 'continuous';
  cssAnimationName: string;
  defaultDuration: number; // ms
}

// ── Effect registry ──────────────────────────────────────────────

export const EFFECT_REGISTRY = new Map<KineticTextEffect, EffectDefinition>();

function register(def: EffectDefinition): void {
  EFFECT_REGISTRY.set(def.name, def);
}

// ── One-shot effects (16) ────────────────────────────────────────

register({
  name: 'shake',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-shake',
  defaultDuration: 1400,
});

register({
  name: 'quake',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-quake',
  defaultDuration: 2000,
});

register({
  name: 'jolt',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-jolt',
  defaultDuration: 900,
});

register({
  name: 'glitch',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-glitch',
  defaultDuration: 1400,
});

register({
  name: 'surge',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-surge',
  defaultDuration: 1100,
});

register({
  name: 'warp',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-warp',
  defaultDuration: 1400,
});

register({
  name: 'explode',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-explode',
  defaultDuration: 2000,
});

register({
  name: 'collapse',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-collapse',
  defaultDuration: 1600,
});

register({
  name: 'scatter',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-scatter',
  defaultDuration: 2200,
});

register({
  name: 'spin',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-spin',
  defaultDuration: 1100,
});

register({
  name: 'bounce',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-bounce',
  defaultDuration: 1600,
});

register({
  name: 'flash',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-flash',
  defaultDuration: 900,
});

register({
  name: 'shatter',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-shatter',
  defaultDuration: 1600,
});

register({
  name: 'vortex',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-vortex',
  defaultDuration: 2000,
});

register({
  name: 'ripple',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-ripple',
  defaultDuration: 1300,
});

register({
  name: 'slam',
  category: 'one-shot',
  cssAnimationName: 'kt-effect-slam',
  defaultDuration: 1100,
});

// ── Continuous effects (21) ──────────────────────────────────────

register({
  name: 'drift',
  category: 'continuous',
  cssAnimationName: 'kt-effect-drift',
  defaultDuration: 4500,
});

register({
  name: 'flicker',
  category: 'continuous',
  cssAnimationName: 'kt-effect-flicker',
  defaultDuration: 3000,
});

register({
  name: 'breathe',
  category: 'continuous',
  cssAnimationName: 'kt-effect-breathe',
  defaultDuration: 5000,
});

register({
  name: 'tremble',
  category: 'continuous',
  cssAnimationName: 'kt-effect-tremble',
  defaultDuration: 180,
});

register({
  name: 'pulse',
  category: 'continuous',
  cssAnimationName: 'kt-effect-pulse',
  defaultDuration: 1500,
});

register({
  name: 'whisper',
  category: 'continuous',
  cssAnimationName: 'kt-effect-whisper',
  defaultDuration: 4000,
});

register({
  name: 'fade',
  category: 'continuous',
  cssAnimationName: 'kt-effect-fade',
  defaultDuration: 6000,
});

register({
  name: 'freeze',
  category: 'continuous',
  cssAnimationName: 'kt-effect-freeze',
  defaultDuration: 7000,
});

register({
  name: 'burn',
  category: 'continuous',
  cssAnimationName: 'kt-effect-burn',
  defaultDuration: 2200,
});

register({
  name: 'static',
  category: 'continuous',
  cssAnimationName: 'kt-effect-static',
  defaultDuration: 180,
});

register({
  name: 'distort',
  category: 'continuous',
  cssAnimationName: 'kt-effect-distort',
  defaultDuration: 4500,
});

register({
  name: 'sway',
  category: 'continuous',
  cssAnimationName: 'kt-effect-sway',
  defaultDuration: 3500,
});

register({
  name: 'glow',
  category: 'continuous',
  cssAnimationName: 'kt-effect-glow',
  defaultDuration: 4000,
});

register({
  name: 'wave',
  category: 'continuous',
  cssAnimationName: 'kt-effect-wave',
  defaultDuration: 3500,
});

register({
  name: 'float',
  category: 'continuous',
  cssAnimationName: 'kt-effect-float',
  defaultDuration: 6000,
});

register({
  name: 'wobble',
  category: 'continuous',
  cssAnimationName: 'kt-effect-wobble',
  defaultDuration: 2000,
});

register({
  name: 'sparkle',
  category: 'continuous',
  cssAnimationName: 'kt-effect-sparkle',
  defaultDuration: 2500,
});

register({
  name: 'drip',
  category: 'continuous',
  cssAnimationName: 'kt-effect-drip',
  defaultDuration: 4000,
});

register({
  name: 'stretch',
  category: 'continuous',
  cssAnimationName: 'kt-effect-stretch',
  defaultDuration: 2800,
});

register({
  name: 'vibrate',
  category: 'continuous',
  cssAnimationName: 'kt-effect-vibrate',
  defaultDuration: 600,
});

register({
  name: 'haunt',
  category: 'continuous',
  cssAnimationName: 'kt-effect-haunt',
  defaultDuration: 7000,
});

// ── Lookup helpers ───────────────────────────────────────────────

export function getEffectDefinition(
  name: KineticTextEffect,
): EffectDefinition | undefined {
  return EFFECT_REGISTRY.get(name);
}
