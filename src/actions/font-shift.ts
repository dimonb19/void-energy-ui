/**
 * Font Shift — Scroll-driven `wght` modulation via view-timeline.
 *
 * Animates `font-variation-settings: 'wght' …` as the element crosses the
 * viewport, using `animation-timeline: view()`. Per-instance keyframes are
 * injected into a per-instance `<style>` element so destroy is symmetric and
 * survives HMR cleanly.
 *
 * The custom property `--void-font-shift-wght` is registered via
 * `CSS.registerProperty` with `syntax: '<number>'`. Without registration,
 * every browser treats custom properties as opaque token streams and flips
 * them discretely at 50% — registration is what makes the value interpolate
 * smoothly each frame. The action then reads it in
 * `font-variation-settings: 'wght' var(--void-font-shift-wght)` so the wght
 * axis tracks the interpolated number.
 *
 * Atmosphere physics is resolved per-instance via the nearest `[data-physics]`
 * ancestor (so AtmosphereScope-pinned subtrees behave correctly), falling
 * back to `<html data-physics>` and finally `glass`. All three physics
 * presets default to a 100 → 900 sweep — only the timing function differs:
 *   glass → linear
 *   flat  → linear
 *   retro → steps(4, end) (quantized)
 *
 * Range auto-clamping. The atmosphere defaults are intentionally generous
 * (100 → 900). The action queries the resolved font's actual `wght` axis via
 * `document.fonts` and clamps the defaults to that axis, so a font like
 * Space Grotesk (300–700) animates over its full visible range without dead
 * zones at the extremes. Explicit `from`/`to` values bypass clamping — if you
 * pass them, you opt into the literal numbers and accept any clamping the
 * font itself does.
 *
 * Live document-level atmosphere + reduced-motion swaps re-run the same
 * apply() path via a shared MutationObserver on `<html data-physics>` and a
 * matchMedia listener. Nested AtmosphereScope swaps are not tracked — those
 * scopes pin their physics for their lifetime and don't need re-application.
 *
 * State surfacing via `data-font-shift`:
 *   active   — animating
 *   reduced  — prefers-reduced-motion: reduce, no animation, cascade weight
 *   static   — resolved font has no wght axis, no animation, cascade weight
 *
 * Browsers without view-timeline support (Firefox stable) render at the
 * cascade weight via @supports.
 *
 * Currently animates `wght` only via `view()` timeline. `wdth`/`opsz` axes
 * and `scroll()`-timeline modes are deliberate non-goals for v1.
 *
 * Browser support:
 *   - Chrome 115+, Edge 115+: animates.
 *   - Safari 26+ (macOS Tahoe / iOS 26, October 2025): animates.
 *   - Firefox stable: cascade-weight fallback via @supports.
 *   - Firefox with `layout.css.scroll-driven-animations.enabled` flag: animates
 *     (the `animation-duration: 1ms` declaration is a workaround for a Firefox
 *     quirk — scroll-driven animations refuse to run when duration is 0s).
 *
 * @example  <h1 use:fontShift={{ from: 100, to: 900 }}>...</h1>
 * @example  <h2 use:fontShift>Atmosphere defaults, auto-clamped to font axis</h2>
 * @example  <p use:fontShift={{ enabled: false }}>...</p>
 */

export interface FontShiftOptions {
  from?: number;
  to?: number;
  range?: string;
  enabled?: boolean;
}

type Physics = 'glass' | 'flat' | 'retro';

interface AtmospherePreset {
  from: number;
  to: number;
  timing: string;
}

const ATMOSPHERE_RANGES: Record<Physics, AtmospherePreset> = {
  glass: { from: 100, to: 900, timing: 'linear' },
  flat: { from: 100, to: 900, timing: 'linear' },
  retro: { from: 100, to: 900, timing: 'steps(4, end)' },
};

const PROPERTY_NAME = '--void-font-shift-wght';
const STYLE_KEY = 'fontShift';

let propertyRegistered = false;
let instanceCounter = 0;

interface InstanceState {
  styleEl: HTMLStyleElement | null;
  id: string | null;
  options: FontShiftOptions;
}

const liveInstances = new Map<HTMLElement, InstanceState>();

// Per-node generation counter. Each clearInstance() bumps it; in-flight async
// work captures its generation and bails on mismatch — so a destroy or rapid
// re-apply can't be overtaken by a stale font-detection promise.
const applyGenerations = new WeakMap<HTMLElement, number>();

let physicsObserver: MutationObserver | null = null;
let reducedMotionMql: MediaQueryList | null = null;

interface FontAxis {
  isVariable: boolean;
  min: number;
  max: number;
}

// Resolved per font-family. document.fonts is stable for the page lifetime
// once fonts are loaded, so a permanent cache is fine.
const fontAxisCache = new Map<string, FontAxis>();

function normalizeFamily(value: string): string {
  return value
    .split(',')[0]
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

/**
 * Resolve the wght axis for the element's first cascade font-family. Returns
 * `{ isVariable: false, min: 400, max: 400 }` when no matching FontFace is
 * registered with a range weight. Awaits document.fonts.ready on first call
 * per family; subsequent calls hit the cache synchronously.
 */
async function getFontAxis(node: HTMLElement): Promise<FontAxis> {
  const family = normalizeFamily(getComputedStyle(node).fontFamily);
  const cached = fontAxisCache.get(family);
  if (cached) return cached;

  await document.fonts.ready;

  for (const face of document.fonts) {
    if (
      normalizeFamily(face.family) === family &&
      typeof face.weight === 'string' &&
      face.weight.includes(' ')
    ) {
      const [min, max] = face.weight.split(/\s+/).map(Number);
      if (Number.isFinite(min) && Number.isFinite(max)) {
        const result: FontAxis = { isVariable: true, min, max };
        fontAxisCache.set(family, result);
        return result;
      }
    }
  }

  const result: FontAxis = { isVariable: false, min: 400, max: 400 };
  fontAxisCache.set(family, result);
  return result;
}

function getPhysics(node: HTMLElement): Physics {
  const scope = node.closest<HTMLElement>('[data-physics]');
  const value =
    scope?.dataset.physics ?? document.documentElement.dataset.physics;
  return value === 'flat' || value === 'retro' ? value : 'glass';
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function registerPropertyOnce(): void {
  if (propertyRegistered) return;
  propertyRegistered = true;
  if (typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function')
    return;
  try {
    CSS.registerProperty({
      name: PROPERTY_NAME,
      syntax: '<number>',
      inherits: false,
      initialValue: '400',
    });
  } catch {
    // Already registered (e.g. across HMR reloads) — harmless.
  }
}

function reapplyAll(): void {
  liveInstances.forEach((state, node) => {
    apply(node, state.options);
  });
}

function ensureObservers(): void {
  if (typeof window === 'undefined') return;

  if (!physicsObserver) {
    // Document-level only. Nested AtmosphereScope swaps don't trigger a
    // re-apply — those scopes pin physics for their lifetime, so the value
    // captured at apply() time stays correct.
    physicsObserver = new MutationObserver(reapplyAll);
    physicsObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-physics'],
    });
  }

  if (!reducedMotionMql) {
    reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionMql.addEventListener('change', reapplyAll);
  }
}

function bumpGeneration(node: HTMLElement): number {
  const next = (applyGenerations.get(node) ?? 0) + 1;
  applyGenerations.set(node, next);
  return next;
}

function clearInstance(node: HTMLElement, removeFromRegistry = true): void {
  // Bump generation so any in-flight async apply for this node bails.
  bumpGeneration(node);

  const state = liveInstances.get(node);
  if (state?.styleEl) {
    state.styleEl.remove();
  } else {
    // HMR / state-loss path — find by attribute and clean up.
    const id = node.dataset.fontShiftId;
    if (id) {
      document.querySelector(`style[data-${STYLE_KEY}="${id}"]`)?.remove();
    }
  }
  if (removeFromRegistry) liveInstances.delete(node);
  node.style.removeProperty('font-variation-settings');
  delete node.dataset.fontShift;
  delete node.dataset.fontShiftId;
}

function apply(node: HTMLElement, options: FontShiftOptions): void {
  if (typeof window === 'undefined') return;

  // Tear down previous render but keep the registry entry — we'll overwrite it.
  clearInstance(node, false);
  const generation = applyGenerations.get(node) ?? 0;

  const enabled = options.enabled ?? true;
  if (!enabled) {
    liveInstances.set(node, { styleEl: null, id: null, options });
    return;
  }

  ensureObservers();

  if (prefersReducedMotion()) {
    // Render at the natural cascade weight — no inline override, no animation.
    node.dataset.fontShift = 'reduced';
    liveInstances.set(node, { styleEl: null, id: null, options });
    return;
  }

  // Hand off to async path for font-axis detection + clamping.
  void applyAnimated(node, options, generation);
}

async function applyAnimated(
  node: HTMLElement,
  options: FontShiftOptions,
  generation: number,
): Promise<void> {
  const axis = await getFontAxis(node);

  // Stale check — a clearInstance / re-apply / destroy ran while we awaited.
  if (applyGenerations.get(node) !== generation) return;

  if (!axis.isVariable) {
    if (import.meta.env.DEV) {
      const family = normalizeFamily(getComputedStyle(node).fontFamily);
      console.warn(
        `[fontShift] Resolved font "${family}" has no wght axis — action will not animate this element. Apply use:fontShift to elements with a variable font.`,
        node,
      );
    }
    node.dataset.fontShift = 'static';
    liveInstances.set(node, { styleEl: null, id: null, options });
    return;
  }

  const physics = getPhysics(node);
  const preset = ATMOSPHERE_RANGES[physics];

  // Explicit user values opt out of clamping; defaults clamp to font axis so
  // narrow-axis fonts use their full range without dead zones.
  const from = options.from ?? Math.max(preset.from, axis.min);
  const to = options.to ?? Math.min(preset.to, axis.max);

  registerPropertyOnce();

  const id = `vfs-${++instanceCounter}`;
  const animationName = `${id}-anim`;
  const animationRange = options.range ?? 'cover';

  const styleEl = document.createElement('style');
  styleEl.dataset[STYLE_KEY] = id;
  styleEl.textContent = `
@keyframes ${animationName} {
  from { ${PROPERTY_NAME}: ${from}; }
  to   { ${PROPERTY_NAME}: ${to}; }
}
@supports (animation-timeline: view()) {
  [data-font-shift-id="${id}"] {
    font-variation-settings: 'wght' var(${PROPERTY_NAME}, ${from});
    animation: ${animationName} ${preset.timing} both;
    animation-timeline: view();
    animation-range: ${animationRange};
    animation-duration: 1ms;
  }
}
`.trim();

  document.head.appendChild(styleEl);
  node.dataset.fontShiftId = id;
  node.dataset.fontShift = 'active';

  liveInstances.set(node, { styleEl, id, options });
}

export function fontShift(node: HTMLElement, options: FontShiftOptions = {}) {
  apply(node, options);
  return {
    update(next: FontShiftOptions) {
      apply(node, next);
    },
    destroy() {
      clearInstance(node);
    },
  };
}
