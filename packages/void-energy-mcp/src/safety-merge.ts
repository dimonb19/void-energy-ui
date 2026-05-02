/*
 * Server-side port of VoidEngine.normalizeThemeDefinition.
 *
 * SOURCE OF TRUTH: src/adapters/void-engine.svelte.ts → normalizeThemeDefinition()
 *
 * Drift contract — when the engine's Safety Merge changes, this port must
 * change with it. Drift is caught by tests in tests/mcp-safety-merge-equivalence.test.ts,
 * which round-trips Frost through both surfaces and asserts structural
 * equality on the normalized output.
 *
 * Differences from the engine version:
 *   - Pure function. No class, no $state, no DOM, no localStorage.
 *   - Returns errors as a value instead of console.warn (didactic for AI).
 *   - Reads its base palette from the bundled snapshot, not a runtime
 *     registry. Frost is the dark base; Meridian is the light base.
 *
 * Constraints (must match engine):
 *   1. glass + light → physics auto-corrected to flat (engine line 543-549)
 *   2. retro + light → mode auto-corrected to dark   (engine line 552-558)
 *   3. Partial palette overlay merge order:
 *        FALLBACK_<mode> ← base atmosphere palette ← input.palette
 */

import type {
  AtmospheresSnapshot,
  PartialThemeDefinition,
  VoidMode,
  VoidPalette,
  VoidPhysics,
  VoidThemeDefinition,
} from './types.js';

// FALLBACK_DARK / FALLBACK_LIGHT mirror the engine's mode-aware palette
// fallbacks (void-engine.svelte.ts lines 27-101). Used when no built-in base
// is available — should never trigger in practice because the snapshot ships
// frost (dark) and meridian (light), but kept for parity with the engine.
const FALLBACK_DARK: VoidPalette = {
  'bg-canvas': '#000000',
  'bg-surface': '#111111',
  'bg-sunk': '#000000',
  'bg-spotlight': '#222222',
  'energy-primary': '#ffffff',
  'energy-secondary': '#888888',
  'border-color': '#333333',
  'text-main': '#ffffff',
  'text-dim': '#aaaaaa',
  'text-mute': '#666666',
  'color-premium': '#ff8c00',
  'color-system': '#a078ff',
  'color-success': '#00e055',
  'color-error': '#ff3c40',
  'color-premium-light': 'oklch(from #ff8c00 calc(l * 1.25) c h)',
  'color-premium-dark': 'oklch(from #ff8c00 calc(l * 0.75) c h)',
  'color-premium-subtle': 'oklch(from #ff8c00 l c h / 0.15)',
  'color-system-light': 'oklch(from #a078ff calc(l * 1.25) c h)',
  'color-system-dark': 'oklch(from #a078ff calc(l * 0.75) c h)',
  'color-system-subtle': 'oklch(from #a078ff l c h / 0.15)',
  'color-success-light': 'oklch(from #00e055 calc(l * 1.25) c h)',
  'color-success-dark': 'oklch(from #00e055 calc(l * 0.75) c h)',
  'color-success-subtle': 'oklch(from #00e055 l c h / 0.15)',
  'color-error-light': 'oklch(from #ff3c40 calc(l * 1.25) c h)',
  'color-error-dark': 'oklch(from #ff3c40 calc(l * 0.75) c h)',
  'color-error-subtle': 'oklch(from #ff3c40 l c h / 0.15)',
  'font-atmos-heading': 'sans-serif',
  'font-atmos-body': 'sans-serif',
};

const FALLBACK_LIGHT: VoidPalette = {
  'bg-canvas': '#ffffff',
  'bg-surface': '#f5f5f5',
  'bg-sunk': '#e0e0e0',
  'bg-spotlight': '#fafafa',
  'energy-primary': '#000000',
  'energy-secondary': '#444444',
  'border-color': '#cccccc',
  'text-main': '#000000',
  'text-dim': '#333333',
  'text-mute': '#666666',
  'color-premium': '#b45309',
  'color-system': '#6d28d9',
  'color-success': '#15803d',
  'color-error': '#dc2626',
  'color-premium-light': 'oklch(from #b45309 calc(l * 1.25) c h)',
  'color-premium-dark': 'oklch(from #b45309 calc(l * 0.75) c h)',
  'color-premium-subtle': 'oklch(from #b45309 l c h / 0.15)',
  'color-system-light': 'oklch(from #6d28d9 calc(l * 1.25) c h)',
  'color-system-dark': 'oklch(from #6d28d9 calc(l * 0.75) c h)',
  'color-system-subtle': 'oklch(from #6d28d9 l c h / 0.15)',
  'color-success-light': 'oklch(from #15803d calc(l * 1.25) c h)',
  'color-success-dark': 'oklch(from #15803d calc(l * 0.75) c h)',
  'color-success-subtle': 'oklch(from #15803d l c h / 0.15)',
  'color-error-light': 'oklch(from #dc2626 calc(l * 1.25) c h)',
  'color-error-dark': 'oklch(from #dc2626 calc(l * 0.75) c h)',
  'color-error-subtle': 'oklch(from #dc2626 l c h / 0.15)',
  'font-atmos-heading': 'sans-serif',
  'font-atmos-body': 'sans-serif',
};

const PHYSICS_VALUES: readonly VoidPhysics[] = ['glass', 'flat', 'retro'];
const MODE_VALUES: readonly VoidMode[] = ['dark', 'light'];

const DEFAULT_DARK_BASE = 'frost';
const DEFAULT_LIGHT_BASE = 'meridian';
const DEFAULT_PHYSICS: VoidPhysics = 'glass';

export interface NormalizeOptions {
  /** Required: the bundled snapshot used to resolve the base palette. */
  snapshot: AtmospheresSnapshot;
  /** Atmosphere id used for diagnostic messages. Defaults to "candidate". */
  id?: string;
}

export interface NormalizeResult {
  ok: boolean;
  errors: string[];
  normalized: VoidThemeDefinition | null;
}

/**
 * Pre-validates structure before merge. Returns hard errors that prevent
 * normalization (unparseable input, wrong types). Soft constraints
 * (glass+light, retro+light) are auto-corrected and recorded in errors only
 * when they fire — same shape as the engine's behavior, surfaced as text.
 */
function preValidate(input: unknown): {
  ok: boolean;
  errors: string[];
  value: PartialThemeDefinition | null;
} {
  const errors: string[] = [];

  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    errors.push(
      'Input must be a JSON object with an atmosphere definition. Got: ' +
        (input === null
          ? 'null'
          : Array.isArray(input)
            ? 'array'
            : typeof input),
    );
    return { ok: false, errors, value: null };
  }

  const candidate = input as Record<string, unknown>;

  if (
    candidate.physics !== undefined &&
    !PHYSICS_VALUES.includes(candidate.physics as VoidPhysics)
  ) {
    errors.push(
      `Field "physics" must be one of: ${PHYSICS_VALUES.join(', ')}. Got: ${JSON.stringify(candidate.physics)}.`,
    );
  }

  if (
    candidate.mode !== undefined &&
    !MODE_VALUES.includes(candidate.mode as VoidMode)
  ) {
    errors.push(
      `Field "mode" must be one of: ${MODE_VALUES.join(', ')}. Got: ${JSON.stringify(candidate.mode)}.`,
    );
  }

  if (candidate.palette !== undefined) {
    if (
      candidate.palette === null ||
      typeof candidate.palette !== 'object' ||
      Array.isArray(candidate.palette)
    ) {
      errors.push(
        'Field "palette" must be an object mapping token name → CSS value (e.g. { "bg-canvas": "#080c14" }).',
      );
    } else {
      for (const [key, value] of Object.entries(
        candidate.palette as Record<string, unknown>,
      )) {
        if (typeof value !== 'string' || value.length === 0) {
          errors.push(
            `Palette token "${key}" must be a non-empty string CSS value. Got: ${JSON.stringify(value)}.`,
          );
        }
      }
    }
  }

  if (candidate.fonts !== undefined) {
    if (!Array.isArray(candidate.fonts)) {
      errors.push('Field "fonts" must be an array of { name, url } objects.');
    } else {
      candidate.fonts.forEach((font, index) => {
        if (
          font === null ||
          typeof font !== 'object' ||
          typeof (font as { name?: unknown }).name !== 'string' ||
          typeof (font as { url?: unknown }).url !== 'string'
        ) {
          errors.push(
            `fonts[${index}] must be an object with string "name" and "url" fields.`,
          );
        }
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors, value: null };
  }
  return { ok: true, errors: [], value: candidate as PartialThemeDefinition };
}

/**
 * Pure port of VoidEngine.normalizeThemeDefinition (Safety Merge).
 *
 * Returns:
 *   - ok=true:  candidate validated and merged. errors[] may still contain
 *               soft warnings (e.g. glass+light auto-corrected to flat).
 *   - ok=false: candidate failed pre-validation. normalized=null.
 */
export function normalizeAtmosphere(
  input: unknown,
  options: NormalizeOptions,
): NormalizeResult {
  const id = options.id ?? 'candidate';
  const pre = preValidate(input);
  if (!pre.ok || !pre.value) {
    return { ok: false, errors: pre.errors, normalized: null };
  }

  const definition = pre.value;
  const errors: string[] = [];

  let physics = definition.physics;
  let mode = definition.mode;

  // Engine constraint 1: glass + light is invalid; auto-correct physics to flat.
  if (physics === 'glass' && mode === 'light') {
    errors.push(
      `Atmosphere "${id}" attempted glass physics in light mode. Glass requires dark mode (glows need darkness). Auto-corrected physics to flat.`,
    );
    physics = 'flat';
  }

  // Engine constraint 2: retro + light is invalid; force mode to dark.
  if (physics === 'retro' && mode === 'light') {
    errors.push(
      `Atmosphere "${id}" attempted retro physics in light mode. Retro requires dark mode (CRT phosphor effect). Auto-corrected mode to dark.`,
    );
    mode = 'dark';
  }

  const targetMode: VoidMode = mode ?? 'dark';
  const fallbackPalette =
    targetMode === 'light' ? FALLBACK_LIGHT : FALLBACK_DARK;

  const baseId =
    targetMode === 'light' ? DEFAULT_LIGHT_BASE : DEFAULT_DARK_BASE;
  const baseEntry =
    options.snapshot[baseId] ?? options.snapshot[DEFAULT_DARK_BASE];
  const basePalette: VoidPalette = baseEntry?.palette ?? fallbackPalette;

  const normalized: VoidThemeDefinition = {
    id,
    label: definition.label,
    mode: targetMode,
    physics:
      physics ??
      (baseEntry
        ? baseEntry.physics
        : targetMode === 'light'
          ? 'flat'
          : DEFAULT_PHYSICS),
    palette: {
      ...fallbackPalette,
      ...basePalette,
      ...(definition.palette ?? {}),
    } as VoidPalette,
    fonts: definition.fonts ?? [],
    tagline: definition.tagline,
  };

  return { ok: true, errors, normalized };
}
