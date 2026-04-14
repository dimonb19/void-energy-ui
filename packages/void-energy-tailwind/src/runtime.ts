/**
 * @void-energy/tailwind — vanilla JS runtime
 *
 * SSR-safe framework-agnostic API for switching atmosphere / physics / mode /
 * density at runtime. Writes DOM attributes on <html> (data-atmosphere,
 * data-physics, data-mode, data-density) and mirrors to localStorage so the
 * FOUC script can restore the same state on the next page load.
 *
 * Import rules:
 *   - Zero side effects on import (no top-level document/localStorage access).
 *   - Every setter silently no-ops in non-browser environments.
 *   - localStorage access is always try/caught (incognito Safari, SSR, workers).
 *   - init() must be called explicitly by the consumer — never auto-invoked.
 *
 * This .ts file is the typing source of truth. Hand-authored parallel outputs
 * live alongside it in dist/ (runtime.js for ESM, runtime.cjs for CJS,
 * runtime.d.ts for types). The runtime test verifies they stay in sync.
 */

export const STORAGE_KEYS = {
  atmosphere: 've-atmosphere',
  physics: 've-physics',
  mode: 've-mode',
  density: 've-density',
} as const;

export type Physics = 'glass' | 'flat' | 'retro';
export type Mode = 'light' | 'dark' | 'auto';
export type Density = 'compact' | 'default' | 'comfortable';

export interface AtmosphereMeta {
  physics: Physics;
  mode: 'light' | 'dark';
}

/**
 * Mirrors dist/atmospheres.json. A test asserts these stay in sync, so drift
 * between the manifest and the runtime is caught at CI time.
 */
const ATMOSPHERES_META: Record<string, AtmosphereMeta> = {
  slate: { physics: 'flat', mode: 'dark' },
  terminal: { physics: 'retro', mode: 'dark' },
  meridian: { physics: 'flat', mode: 'light' },
  frost: { physics: 'glass', mode: 'dark' },
};

const CONSTRAINTS: Partial<Record<Physics, 'dark' | 'light'>> = {
  glass: 'dark',
  retro: 'dark',
};

const isBrowser = typeof document !== 'undefined';

function getRoot(): HTMLElement | null {
  return isBrowser ? document.documentElement : null;
}

function persist(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* incognito Safari, quota exceeded, SSR, web worker — no-op */
  }
}

function restore(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setAtmosphere(name: string): void {
  const root = getRoot();
  if (!root) return;
  root.setAttribute('data-atmosphere', name);
  persist(STORAGE_KEYS.atmosphere, name);
  const meta = ATMOSPHERES_META[name];
  if (meta?.physics) setPhysics(meta.physics);
  if (meta?.mode) setMode(meta.mode);
}

export function setPhysics(preset: Physics): void {
  const root = getRoot();
  if (!root) return;
  root.setAttribute('data-physics', preset);
  persist(STORAGE_KEYS.physics, preset);
  const required = CONSTRAINTS[preset];
  if (required) setMode(required);
}

export function setMode(mode: Mode): void {
  const root = getRoot();
  if (!root) return;
  let resolved: 'light' | 'dark';
  if (mode === 'auto') {
    const mm =
      typeof matchMedia !== 'undefined'
        ? matchMedia('(prefers-color-scheme: dark)')
        : null;
    resolved = mm?.matches ? 'dark' : 'light';
  } else {
    resolved = mode;
  }
  root.setAttribute('data-mode', resolved);
  persist(STORAGE_KEYS.mode, mode);
}

export function setDensity(level: Density): void {
  const root = getRoot();
  if (!root) return;
  root.setAttribute('data-density', level);
  persist(STORAGE_KEYS.density, level);
}

export interface InitDefaults {
  atmosphere?: string;
  physics?: Physics;
  mode?: Mode;
  density?: Density;
}

export function init(defaults: InitDefaults = {}): void {
  if (!isBrowser) return;
  setAtmosphere(
    restore(STORAGE_KEYS.atmosphere) ?? defaults.atmosphere ?? 'frost',
  );
  setPhysics(
    (restore(STORAGE_KEYS.physics) as Physics | null) ??
      defaults.physics ??
      'glass',
  );
  setMode(
    (restore(STORAGE_KEYS.mode) as Mode | null) ?? defaults.mode ?? 'dark',
  );
  setDensity(
    (restore(STORAGE_KEYS.density) as Density | null) ??
      defaults.density ??
      'default',
  );
}

export function getAtmospheres(): Record<string, AtmosphereMeta> {
  return { ...ATMOSPHERES_META };
}
