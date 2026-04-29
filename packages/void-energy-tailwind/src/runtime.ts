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
 *   - Every exported function silently no-ops in non-browser environments.
 *     Module-global state (CUSTOM_ATMOSPHERES, LISTENERS, MANIFEST_*) is
 *     never mutated outside a browser — otherwise SSR servers would leak
 *     per-request state across requests.
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
  customAtmospheres: 've-custom-atmospheres',
} as const;

export type Physics = 'glass' | 'flat' | 'retro';
export type Mode = 'light' | 'dark' | 'auto';
export type Density = 'compact' | 'default' | 'comfortable';

export type AtmosphereSource = 'builtin' | 'config' | 'runtime';

/** Schema version negotiated between generator.ts and runtime.ts. */
export const MANIFEST_SCHEMA_VERSION = 1 as const;

export interface AtmosphereMeta {
  physics: Physics;
  mode: 'light' | 'dark';
}

/**
 * Consumer-supplied atmosphere definition. Tokens is a raw CSS custom-property
 * map keyed by the full var name (e.g. { '--bg-canvas': '#0a0e1a' }). v1 does
 * not Safety-Merge against `extends` — the consumer passes a complete token
 * set. The `extends` field is accepted for forward compatibility.
 */
export interface AtmosphereDef {
  physics: Physics;
  mode: 'light' | 'dark';
  tokens: Record<string, string>;
  extends?: string;
}

/** Entry returned by getAtmospheres(). */
export interface AtmosphereEntry {
  name: string;
  physics: Physics;
  mode: 'light' | 'dark';
  source: AtmosphereSource;
  label?: string;
}

/** Manifest entry as emitted by the generator. */
export interface ManifestEntry {
  source: 'builtin' | 'config';
  physics: Physics;
  mode: 'light' | 'dark';
  label?: string;
}

/** Contract between generator.ts and init({ manifest }). */
export interface Manifest {
  schemaVersion: number;
  defaults?: InitDefaults;
  atmospheres: Record<string, ManifestEntry>;
}

export interface VoidState {
  atmosphere: string | null;
  physics: Physics | null;
  mode: 'light' | 'dark' | null;
  density: Density | null;
}

export type VoidStateListener = (state: VoidState) => void;

/**
 * Hard-coded built-in directory. Used as the fallback when `init()` is called
 * without a manifest. A test asserts this stays in sync with dist/atmospheres.json.
 */
const BUILTIN_DIRECTORY: Record<
  string,
  { physics: Physics; mode: 'light' | 'dark'; label: string }
> = {
  graphite: { physics: 'flat', mode: 'dark', label: 'Graphite' },
  terminal: { physics: 'retro', mode: 'dark', label: 'Terminal' },
  meridian: { physics: 'flat', mode: 'light', label: 'Meridian' },
  frost: { physics: 'glass', mode: 'dark', label: 'Frost' },
};

const ATMOSPHERES_META: Record<string, AtmosphereMeta> = Object.fromEntries(
  Object.entries(BUILTIN_DIRECTORY).map(([k, v]) => [
    k,
    { physics: v.physics, mode: v.mode },
  ]),
);

const CONSTRAINTS: Partial<Record<Physics, 'dark' | 'light'>> = {
  glass: 'dark',
  retro: 'dark',
};

const CUSTOM_STYLE_ID = 've-custom-atmospheres';
const NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

const CUSTOM_ATMOSPHERES = new Map<string, AtmosphereDef>();
const LISTENERS = new Set<VoidStateListener>();
let batchDepth = 0;

/**
 * Config-source atmospheres loaded from a manifest via init({ manifest }).
 * When MANIFEST_LOADED is true, the runtime's directory becomes:
 *     MANIFEST_ATMOSPHERES  (builtin + config, as the manifest dictates)
 *   + CUSTOM_ATMOSPHERES    (runtime-registered)
 * Without a manifest, the directory is BUILTIN_DIRECTORY + CUSTOM_ATMOSPHERES.
 */
const MANIFEST_ATMOSPHERES = new Map<string, ManifestEntry>();
let MANIFEST_LOADED = false;

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

/**
 * Mirror a state-key write to a cookie so SSR frameworks can read the user's
 * persisted atmosphere on the next server render. Cookie format invariant:
 * matches `serializeAtmosphereCookie` in ./ssr — `name=value; Path=/;
 * Max-Age=31536000; SameSite=Lax[; Secure]`. The Secure flag is auto-set
 * under HTTPS; on http://localhost it is omitted so dev cookies are
 * accepted. A round-trip test in tests/l0-ssr.test.ts asserts this format
 * stays in lockstep with the SSR module's parser.
 */
function persistCookie(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    const secure =
      typeof location !== 'undefined' && location.protocol === 'https:';
    document.cookie =
      `${key}=${value}; Path=/; Max-Age=31536000; SameSite=Lax` +
      (secure ? '; Secure' : '');
  } catch {
    /* sandboxed iframes, missing document.cookie setter — no-op */
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

function readState(): VoidState {
  const root = getRoot();
  if (!root) {
    return { atmosphere: null, physics: null, mode: null, density: null };
  }
  return {
    atmosphere: root.getAttribute('data-atmosphere'),
    physics: root.getAttribute('data-physics') as Physics | null,
    mode: root.getAttribute('data-mode') as 'light' | 'dark' | null,
    density: root.getAttribute('data-density') as Density | null,
  };
}

function notify(): void {
  if (batchDepth > 0 || !isBrowser || LISTENERS.size === 0) return;
  const state = readState();
  for (const listener of LISTENERS) {
    try {
      listener(state);
    } catch {
      /* consumer bug — don't let one listener break the others */
    }
  }
}

function lookupMeta(name: string): AtmosphereMeta | undefined {
  const custom = CUSTOM_ATMOSPHERES.get(name);
  if (custom) return { physics: custom.physics, mode: custom.mode };
  if (MANIFEST_LOADED) {
    const entry = MANIFEST_ATMOSPHERES.get(name);
    if (entry) return { physics: entry.physics, mode: entry.mode };
    return undefined;
  }
  return ATMOSPHERES_META[name];
}

function renderCustomStyle(): void {
  if (!isBrowser) return;
  const existing = document.getElementById(CUSTOM_STYLE_ID);
  if (CUSTOM_ATMOSPHERES.size === 0) {
    existing?.remove();
    return;
  }
  let css = '';
  for (const [name, def] of CUSTOM_ATMOSPHERES) {
    css += `[data-atmosphere='${name}'] {\n`;
    for (const [prop, value] of Object.entries(def.tokens)) {
      css += `  ${prop}: ${value};\n`;
    }
    css += '}\n';
  }
  let el = existing as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = CUSTOM_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function persistCustomAtmospheres(): void {
  if (!isBrowser) return;
  try {
    if (CUSTOM_ATMOSPHERES.size === 0) {
      localStorage.removeItem(STORAGE_KEYS.customAtmospheres);
      return;
    }
    const obj: Record<string, AtmosphereDef> = {};
    for (const [name, def] of CUSTOM_ATMOSPHERES) obj[name] = def;
    localStorage.setItem(STORAGE_KEYS.customAtmospheres, JSON.stringify(obj));
  } catch {
    /* quota / disabled — the <style> tag still holds the current session */
  }
}

function hydrateCustomAtmospheres(): void {
  if (!isBrowser) return;
  // Clear first so a second init() after the user cleared storage observes
  // an empty registry instead of holding onto the previous session's themes.
  CUSTOM_ATMOSPHERES.clear();
  const raw = restore(STORAGE_KEYS.customAtmospheres);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Record<string, AtmosphereDef>;
    for (const [name, def] of Object.entries(parsed)) {
      if (
        NAME_PATTERN.test(name) &&
        def &&
        typeof def === 'object' &&
        def.tokens &&
        def.physics &&
        def.mode
      ) {
        CUSTOM_ATMOSPHERES.set(name, def);
      }
    }
  } catch {
    /* invalid JSON — discard silently */
  }
}

function ingestManifest(manifest: Manifest): void {
  if (manifest.schemaVersion !== MANIFEST_SCHEMA_VERSION) {
    // One clear error. Any prior manifest state is discarded so the app
    // continues with built-ins only — a half-accepted manifest is worse
    // than a rejected one.
    // eslint-disable-next-line no-console
    console.error(
      `[@void-energy/tailwind] manifest schema version mismatch: got ${manifest.schemaVersion}, expected ${MANIFEST_SCHEMA_VERSION}. Config atmospheres will not be loaded.`,
    );
    MANIFEST_LOADED = false;
    MANIFEST_ATMOSPHERES.clear();
    return;
  }
  MANIFEST_LOADED = true;
  MANIFEST_ATMOSPHERES.clear();
  for (const [name, entry] of Object.entries(manifest.atmospheres ?? {})) {
    if (!entry || !NAME_PATTERN.test(name)) continue;
    MANIFEST_ATMOSPHERES.set(name, entry);
  }
}

export function setAtmosphere(name: string): void {
  const root = getRoot();
  if (!root) return;
  batchDepth++;
  try {
    root.setAttribute('data-atmosphere', name);
    persist(STORAGE_KEYS.atmosphere, name);
    persistCookie(STORAGE_KEYS.atmosphere, name);
    const meta = lookupMeta(name);
    if (meta?.physics) setPhysics(meta.physics);
    if (meta?.mode) setMode(meta.mode);
  } finally {
    batchDepth--;
  }
  notify();
}

export function setPhysics(preset: Physics): void {
  const root = getRoot();
  if (!root) return;
  batchDepth++;
  try {
    root.setAttribute('data-physics', preset);
    persist(STORAGE_KEYS.physics, preset);
    persistCookie(STORAGE_KEYS.physics, preset);
    const required = CONSTRAINTS[preset];
    if (required) setMode(required);
  } finally {
    batchDepth--;
  }
  notify();
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
  // Physics constraint enforcement. Glass and retro require dark; if the
  // active physics has a CONSTRAINTS entry the resolved mode is overridden
  // to match. Without this guard, setMode could land an invalid combo
  // (glass/light, retro/light) that AdaptiveImage's "4 valid combinations"
  // resolution table assumes never happens.
  const activePhysics = root.getAttribute('data-physics') as Physics | null;
  if (activePhysics) {
    const required = CONSTRAINTS[activePhysics];
    if (required) resolved = required;
  }
  root.setAttribute('data-mode', resolved);
  persist(STORAGE_KEYS.mode, mode);
  // Cookie carries the *resolved* light/dark value — 'auto' means nothing
  // to a server that can't run matchMedia. localStorage retains 'auto' for
  // the existing FOUC contract; only the SSR cookie diverges in this case.
  persistCookie(STORAGE_KEYS.mode, resolved);
  notify();
}

export function setDensity(level: Density): void {
  const root = getRoot();
  if (!root) return;
  root.setAttribute('data-density', level);
  persist(STORAGE_KEYS.density, level);
  persistCookie(STORAGE_KEYS.density, level);
  notify();
}

export interface InitDefaults {
  atmosphere?: string;
  physics?: Physics;
  mode?: Mode;
  density?: Density;
}

export interface InitOptions extends InitDefaults {
  /**
   * Manifest emitted by `@void-energy/tailwind/generator`. When provided, its
   * `atmospheres` entries become the runtime's visible directory and its
   * `defaults` feed the default-resolution chain.
   *
   * Default resolution:
   *   localStorage > manifest.defaults > InitOptions > L0 hard-coded fallback
   */
  manifest?: Manifest;
}

export function init(options: InitOptions = {}): void {
  if (!isBrowser) return;
  if (options.manifest) {
    ingestManifest(options.manifest);
  }
  hydrateCustomAtmospheres();
  renderCustomStyle();

  const md = options.manifest?.defaults ?? {};
  batchDepth++;
  try {
    setAtmosphere(
      restore(STORAGE_KEYS.atmosphere) ??
        md.atmosphere ??
        options.atmosphere ??
        'frost',
    );
    setPhysics(
      (restore(STORAGE_KEYS.physics) as Physics | null) ??
        md.physics ??
        options.physics ??
        'glass',
    );
    setMode(
      (restore(STORAGE_KEYS.mode) as Mode | null) ??
        md.mode ??
        options.mode ??
        'dark',
    );
    setDensity(
      (restore(STORAGE_KEYS.density) as Density | null) ??
        md.density ??
        options.density ??
        'default',
    );
  } finally {
    batchDepth--;
  }
  notify();
}

/**
 * Complete directory of atmospheres visible to the app: built-ins (or
 * manifest-declared atmospheres when a manifest was loaded), plus any
 * runtime-registered custom atmospheres. Runtime entries win over manifest
 * entries, which win over built-ins, when names collide.
 */
export function getAtmospheres(): AtmosphereEntry[] {
  const result: AtmosphereEntry[] = [];
  const seen = new Set<string>();

  for (const [name, def] of CUSTOM_ATMOSPHERES) {
    result.push({
      name,
      physics: def.physics,
      mode: def.mode,
      source: 'runtime',
    });
    seen.add(name);
  }

  if (MANIFEST_LOADED) {
    for (const [name, entry] of MANIFEST_ATMOSPHERES) {
      if (seen.has(name)) continue;
      const item: AtmosphereEntry = {
        name,
        physics: entry.physics,
        mode: entry.mode,
        source: entry.source,
      };
      if (entry.label !== undefined) item.label = entry.label;
      result.push(item);
      seen.add(name);
    }
  } else {
    for (const [name, meta] of Object.entries(BUILTIN_DIRECTORY)) {
      if (seen.has(name)) continue;
      result.push({
        name,
        physics: meta.physics,
        mode: meta.mode,
        source: 'builtin',
        label: meta.label,
      });
      seen.add(name);
    }
  }

  return result;
}

/**
 * Convenience filter for theme-picker UIs — e.g. render the X-button only
 * when `source === 'runtime'`.
 */
export function getAtmosphereBySource(
  source: AtmosphereSource,
): AtmosphereEntry[] {
  return getAtmospheres().filter((a) => a.source === source);
}

/**
 * Register a custom atmosphere. Injects a <style id="ve-custom-atmospheres">
 * tag into <head> with the token block scoped to [data-atmosphere='name'] and
 * persists the definition to localStorage so the FOUC script can re-inject it
 * on the next page load. Invalid names (anything other than a-z / 0-9 / _ / -)
 * are silently rejected to prevent selector injection.
 *
 * SSR-safe: no-ops when document is unavailable so SSR servers do not
 * accumulate per-request state in the module-global CUSTOM_ATMOSPHERES map.
 */
export function registerAtmosphere(name: string, def: AtmosphereDef): void {
  if (!isBrowser) return;
  if (!NAME_PATTERN.test(name)) return;
  CUSTOM_ATMOSPHERES.set(name, def);
  renderCustomStyle();
  persistCustomAtmospheres();
  if (readState().atmosphere === name) notify();
}

export function unregisterAtmosphere(name: string): void {
  if (!isBrowser) return;
  if (!CUSTOM_ATMOSPHERES.delete(name)) return;
  renderCustomStyle();
  persistCustomAtmospheres();
}

export function getCustomAtmospheres(): string[] {
  return Array.from(CUSTOM_ATMOSPHERES.keys());
}

/**
 * Snapshot of the four data-* attributes on <html>. Returned values are null
 * in SSR or before any setter / init() has run.
 */
export function getState(): VoidState {
  return readState();
}

/**
 * Subscribe to atmosphere / physics / mode / density changes. The listener is
 * fired once per logical transaction — setAtmosphere and init() coalesce their
 * internal setter calls into a single notification. Returns an unsubscribe fn.
 *
 * SSR-safe: no-ops when document is unavailable so SSR servers do not
 * accumulate per-request listeners in the module-global LISTENERS set.
 */
export function subscribe(listener: VoidStateListener): () => void {
  if (!isBrowser) return () => {};
  LISTENERS.add(listener);
  return () => {
    LISTENERS.delete(listener);
  };
}
