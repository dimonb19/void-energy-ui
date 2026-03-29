import type { KineticTextEffect, EffectScope } from '../../types';

// ── Effect definition ────────────────────────────────────────────

export interface EffectDefinition {
  name: KineticTextEffect;
  category: 'one-shot' | 'continuous';
  defaultScope: EffectScope;
  supportedScopes: EffectScope[];
  cssAnimationName: string;
  defaultDuration: number; // ms
}

// ── Effect registry ──────────────────────────────────────────────

export const EFFECT_REGISTRY = new Map<KineticTextEffect, EffectDefinition>();

function register(def: EffectDefinition): void {
  EFFECT_REGISTRY.set(def.name, def);
}

// ── One-shot effects (6) ─────────────────────────────────────────

register({
  name: 'shake',
  category: 'one-shot',
  defaultScope: 'block',
  supportedScopes: ['block', 'line'],
  cssAnimationName: 'kt-effect-shake',
  defaultDuration: 500,
});

register({
  name: 'quake',
  category: 'one-shot',
  defaultScope: 'block',
  supportedScopes: ['block'],
  cssAnimationName: 'kt-effect-quake',
  defaultDuration: 800,
});

register({
  name: 'jolt',
  category: 'one-shot',
  defaultScope: 'block',
  supportedScopes: ['block'],
  cssAnimationName: 'kt-effect-jolt',
  defaultDuration: 300,
});

register({
  name: 'glitch',
  category: 'one-shot',
  defaultScope: 'block',
  supportedScopes: ['block', 'line', 'glyph'],
  cssAnimationName: 'kt-effect-glitch',
  defaultDuration: 600,
});

register({
  name: 'surge',
  category: 'one-shot',
  defaultScope: 'block',
  supportedScopes: ['block'],
  cssAnimationName: 'kt-effect-surge',
  defaultDuration: 500,
});

register({
  name: 'warp',
  category: 'one-shot',
  defaultScope: 'block',
  supportedScopes: ['block', 'line'],
  cssAnimationName: 'kt-effect-warp',
  defaultDuration: 600,
});

// ── Continuous effects (12) ──────────────────────────────────────

register({
  name: 'drift',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line', 'glyph', 'word', 'range'],
  cssAnimationName: 'kt-effect-drift',
  defaultDuration: 3000,
});

register({
  name: 'flicker',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line', 'glyph', 'word', 'range'],
  cssAnimationName: 'kt-effect-flicker',
  defaultDuration: 2000,
});

register({
  name: 'breathe',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line'],
  cssAnimationName: 'kt-effect-breathe',
  defaultDuration: 4000,
});

register({
  name: 'tremble',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line', 'glyph', 'word', 'range'],
  cssAnimationName: 'kt-effect-tremble',
  defaultDuration: 100,
});

register({
  name: 'pulse',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line'],
  cssAnimationName: 'kt-effect-pulse',
  defaultDuration: 1000,
});

register({
  name: 'whisper',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line', 'glyph', 'word', 'range'],
  cssAnimationName: 'kt-effect-whisper',
  defaultDuration: 3000,
});

register({
  name: 'fade',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line', 'glyph', 'word', 'range'],
  cssAnimationName: 'kt-effect-fade',
  defaultDuration: 5000,
});

register({
  name: 'freeze',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line'],
  cssAnimationName: 'kt-effect-freeze',
  defaultDuration: 5000,
});

register({
  name: 'burn',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line', 'glyph', 'word', 'range'],
  cssAnimationName: 'kt-effect-burn',
  defaultDuration: 1500,
});

register({
  name: 'static',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line', 'glyph', 'word', 'range'],
  cssAnimationName: 'kt-effect-static',
  defaultDuration: 200,
});

register({
  name: 'distort',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line'],
  cssAnimationName: 'kt-effect-distort',
  defaultDuration: 3500,
});

register({
  name: 'sway',
  category: 'continuous',
  defaultScope: 'block',
  supportedScopes: ['block', 'line'],
  cssAnimationName: 'kt-effect-sway',
  defaultDuration: 2500,
});

// ── Lookup helpers ───────────────────────────────────────────────

export function getEffectDefinition(
  name: KineticTextEffect,
): EffectDefinition | undefined {
  return EFFECT_REGISTRY.get(name);
}

/**
 * Resolve effective scope: if the requested scope is not supported,
 * fall back to the effect's default scope.
 */
export function resolveScope(
  name: KineticTextEffect,
  requestedScope: EffectScope,
): EffectScope {
  const def = EFFECT_REGISTRY.get(name);
  if (!def) return requestedScope;
  if (def.supportedScopes.includes(requestedScope)) return requestedScope;
  return def.defaultScope;
}
