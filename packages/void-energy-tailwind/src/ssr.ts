/**
 * @void-energy/tailwind/ssr — server-side cookie bridge.
 *
 * Three pure framework-agnostic primitives so an SSR framework (Astro,
 * SvelteKit, Next, anything with a Cookie request header) can render a page
 * with the user's persisted atmosphere baked into the initial HTML, instead
 * of every user seeing the default until hydration.
 *
 *   readAtmosphereCookie(cookieHeader) -> AtmosphereCookieState
 *   serializeAtmosphereCookie(state, opts?) -> string[]   (one per set key)
 *   renderRootAttributes(state) -> string                  (data-* string)
 *
 * Format invariants — load-bearing:
 *   - Cookie key names are exactly STORAGE_KEYS.atmosphere/physics/mode/density.
 *   - Cookie values match the FOUC script's value vocabulary
 *     (atmosphere=NAME_PATTERN, physics=glass|flat|retro,
 *     mode=light|dark, density=compact|default|comfortable).
 *   - Unknown / malformed values are silently dropped — same defensive
 *     posture as runtime.hydrateCustomAtmospheres. The server never emits a
 *     half-valid <html data-*> attribute.
 *
 * Custom-atmosphere registry (STORAGE_KEYS.customAtmospheres) is intentionally
 * out of scope. Runtime atmospheres remain client-only per W5 non-goals; the
 * server reads the *name* from the cookie and the client hydrates into it.
 *
 * Zero side effects on import. Safe to evaluate in Node, edge runtimes, or
 * web workers.
 */

import { STORAGE_KEYS, type Physics, type Density } from './runtime';

const VALID_PHYSICS: readonly Physics[] = ['glass', 'flat', 'retro'];
const VALID_MODES = ['light', 'dark'] as const;
const VALID_DENSITIES: readonly Density[] = [
  'compact',
  'default',
  'comfortable',
];
const NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

const DEFAULT_MAX_AGE = 31536000; // one year, matches localStorage permanence

export interface AtmosphereCookieState {
  atmosphere?: string;
  physics?: Physics;
  mode?: 'light' | 'dark';
  density?: Density;
}

export interface SerializeOptions {
  /** Append `; Secure`. Default false. */
  secure?: boolean;
  /** `Max-Age` in seconds. Default 31536000 (one year). */
  maxAge?: number;
  /** SameSite policy. Default 'Lax' — works for top-level navigations. */
  sameSite?: 'Lax' | 'Strict' | 'None';
}

function isPhysics(v: string): v is Physics {
  return (VALID_PHYSICS as readonly string[]).includes(v);
}
function isMode(v: string): v is 'light' | 'dark' {
  return (VALID_MODES as readonly string[]).includes(v);
}
function isDensity(v: string): v is Density {
  return (VALID_DENSITIES as readonly string[]).includes(v);
}

/**
 * Parse a Cookie request header into the four-axis VE state. Unknown cookies
 * are ignored; malformed values for the four VE keys are dropped.
 *
 * Accepts the raw `Cookie:` header value (e.g. from `request.headers.get('cookie')`),
 * not a parsed object — keeps the function framework-agnostic.
 */
export function readAtmosphereCookie(
  cookieHeader: string | null | undefined,
): AtmosphereCookieState {
  const result: AtmosphereCookieState = {};
  if (!cookieHeader) return result;
  const pairs = cookieHeader.split(/;\s*/);
  for (const pair of pairs) {
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (!name || !value) continue;
    if (name === STORAGE_KEYS.atmosphere) {
      if (NAME_PATTERN.test(value)) result.atmosphere = value;
    } else if (name === STORAGE_KEYS.physics) {
      if (isPhysics(value)) result.physics = value;
    } else if (name === STORAGE_KEYS.mode) {
      if (isMode(value)) result.mode = value;
    } else if (name === STORAGE_KEYS.density) {
      if (isDensity(value)) result.density = value;
    }
  }
  return result;
}

/**
 * Build a list of `name=value; Path=/; Max-Age=...; SameSite=Lax[; Secure]`
 * strings, one per state key that's set. Empty or invalid keys produce no
 * output. The strings are usable as either:
 *   - `Set-Cookie` response header values (one per header line), or
 *   - `document.cookie = ...` assignments on the client.
 */
export function serializeAtmosphereCookie(
  state: AtmosphereCookieState,
  opts: SerializeOptions = {},
): string[] {
  const maxAge = opts.maxAge ?? DEFAULT_MAX_AGE;
  const sameSite = opts.sameSite ?? 'Lax';
  const secureFlag = opts.secure ? '; Secure' : '';
  const suffix = `; Path=/; Max-Age=${maxAge}; SameSite=${sameSite}${secureFlag}`;
  const out: string[] = [];
  if (state.atmosphere && NAME_PATTERN.test(state.atmosphere)) {
    out.push(`${STORAGE_KEYS.atmosphere}=${state.atmosphere}${suffix}`);
  }
  if (state.physics && isPhysics(state.physics)) {
    out.push(`${STORAGE_KEYS.physics}=${state.physics}${suffix}`);
  }
  if (state.mode && isMode(state.mode)) {
    out.push(`${STORAGE_KEYS.mode}=${state.mode}${suffix}`);
  }
  if (state.density && isDensity(state.density)) {
    out.push(`${STORAGE_KEYS.density}=${state.density}${suffix}`);
  }
  return out;
}

/**
 * Build a `data-atmosphere="..." data-physics="..." data-mode="..." data-density="..."`
 * attribute string for direct injection into the server-rendered `<html>` tag.
 * Returns the empty string when no state is set. No leading or trailing space.
 *
 * Output is HTML-safe by construction — values are validated against the
 * fixed vocabulary and atmosphere names against NAME_PATTERN, so no escaping
 * is needed.
 */
export function renderRootAttributes(state: AtmosphereCookieState): string {
  const parts: string[] = [];
  if (state.atmosphere && NAME_PATTERN.test(state.atmosphere)) {
    parts.push(`data-atmosphere="${state.atmosphere}"`);
  }
  if (state.physics && isPhysics(state.physics)) {
    parts.push(`data-physics="${state.physics}"`);
  }
  if (state.mode && isMode(state.mode)) {
    parts.push(`data-mode="${state.mode}"`);
  }
  if (state.density && isDensity(state.density)) {
    parts.push(`data-density="${state.density}"`);
  }
  return parts.join(' ');
}
