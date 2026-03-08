/*
 * VOID PHYSICS: Motion primitives
 * Role: Map Svelte transitions/animations to Triad physics (glass/flat/retro).
 *
 * Lifecycle mapping:
 * - in: materialize
 * - out: implode (or dematerialize for floating exits)
 * - animate: live
 *
 * List coordination requires stable keys; otherwise Svelte reuses nodes and
 * the exit/shift choreography desynchronizes.
 */

import { flip, type FlipParams } from 'svelte/animate';
import { cubicOut, cubicIn } from 'svelte/easing';
import { voidEngine as theme } from '@adapters/void-engine.svelte';
import THEME_REGISTRY from '@config/void-registry.json';
import PHYSICS_DATA from '@config/void-physics.json';

type Registry = Record<string, { physics: string; mode: string }>;
const REGISTRY = THEME_REGISTRY as Registry;

type PhysicsConfig = Record<
  string,
  {
    speedBase: number;
    speedFast: number;
    blur: number;
  }
>;

const PHYSICS_PRIMITIVES = PHYSICS_DATA as PhysicsConfig;

// --------------------------------------------------------------------------
// SYSTEM CONFIG CACHE
// Memoized to avoid repeated matchMedia/navigator checks per animation.
// Only recalculates when atmosphere changes.
// --------------------------------------------------------------------------

type SystemConfig = {
  speedBase: number;
  speedFast: number;
  blurInt: number;
  isRetro: boolean;
  isFlat: boolean;
  reducedMotion: boolean;
};

let cachedConfig: SystemConfig | null = null;
let cachedPhysics: PhysicsPreset | null = null;

// Browser capability checks (run once)
const reducedMotion =
  typeof matchMedia !== 'undefined'
    ? matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

// Firefox blur optimization: blur() filter adds ~12-18ms per frame vs ~3-5ms on Chrome/Safari
// See: https://bugzilla.mozilla.org/show_bug.cgi?id=1820534
const isFirefox =
  typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);

type PhysicsPreset = 'glass' | 'flat' | 'retro';

function isPhysicsPreset(value: unknown): value is PhysicsPreset {
  return value === 'glass' || value === 'flat' || value === 'retro';
}

function resolvePhysicsMode(): PhysicsPreset {
  const domPhysics =
    typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-physics')
      : null;

  if (isPhysicsPreset(domPhysics)) {
    return domPhysics;
  }

  const themePhysics = theme.currentTheme?.physics;
  if (isPhysicsPreset(themePhysics)) {
    return themePhysics;
  }

  const currentAtmosphere = theme.atmosphere || 'void';
  const themeConfig = REGISTRY[currentAtmosphere] || REGISTRY['void'];
  return isPhysicsPreset(themeConfig?.physics) ? themeConfig.physics : 'glass';
}

function getSystemConfig(): SystemConfig {
  const physicsMode = resolvePhysicsMode();

  // Return cached config if physics hasn't changed
  if (cachedConfig && cachedPhysics === physicsMode) {
    return cachedConfig;
  }

  const specs = PHYSICS_PRIMITIVES[physicsMode] || PHYSICS_PRIMITIVES['glass'];

  const isRetro = physicsMode === 'retro';
  const isFlat = physicsMode === 'flat';

  // Disable blur for reduced motion or Firefox
  const blurInt = reducedMotion || isFirefox ? 0 : specs.blur;

  cachedConfig = {
    speedBase: specs.speedBase,
    speedFast: specs.speedFast,
    blurInt,
    isRetro,
    isFlat,
    reducedMotion,
  };
  cachedPhysics = physicsMode;

  return cachedConfig;
}

// Stepped easing for retro physics (quantized motion)
const steppedEasing = (t: number) => Math.floor(t * 4) / 4;

/**
 * List reflow animation for keyed {#each} blocks.
 * Usage: <div animate:live>
 *
 * Related:
 * - See Toast.svelte for production usage in list rendering
 * - Physics timing controlled by void-physics.json (speedBase)
 * - Retro mode uses stepped easing
 */
export function live(
  node: HTMLElement,
  { from, to }: { from: DOMRect; to: DOMRect },
  params: FlipParams = {},
) {
  const { isRetro, speedBase } = getSystemConfig();

  return flip(
    node,
    { from, to },
    {
      duration: params.duration ?? speedBase,
      easing: isRetro ? steppedEasing : cubicOut,
      ...params,
    },
  );
}

/**
 * Entry transition for elements appearing in the viewport.
 * Usage: <div in:materialize>
 *
 * Physics behavior:
 * - Glass: Blur fade-in with Y-axis translation
 * - Flat: Sharp fade-in with scale (no blur)
 * - Retro: Instant opacity change (0ms duration)
 *
 * Related:
 * - Pairs with implode() for exit
 * - SCSS equivalent: _animations.scss entry-transition mixin
 * - Used in Modal.svelte, Toast.svelte, and card animations
 */
export function materialize(
  node: HTMLElement,
  { delay = 0, duration = null, y = 15 } = {},
) {
  const { speedBase, blurInt, isRetro, isFlat, reducedMotion } =
    getSystemConfig();

  // Retro or reduced-motion: opacity-only.
  if (reducedMotion || isRetro) {
    return {
      delay,
      duration: isRetro ? 0 : speedBase,
      css: (t: number) => `opacity: ${t};`,
    };
  }

  return {
    delay,
    duration: duration ?? speedBase,
    easing: cubicOut,
    css: (t: number, u: number) => {
      // Glass uses blur; flat stays sharp.
      const activeBlur = isFlat ? 0 : Math.max(0, blurInt * (u * 2 - 1));

      return `
        transform: translateY(${u * y}px) scale(${0.96 + 0.04 * t});
        opacity: ${t};
        filter: blur(${activeBlur}px);
      `;
    },
  };
}

/**
 * Exit transition for floating UI (toasts, tooltips).
 * Uses upward motion instead of horizontal collapse.
 * Usage: <div out:dematerialize>
 *
 * Physics behavior:
 * - Glass: Blur + upward float fade-out
 * - Flat: Sharp upward float fade-out (no blur)
 * - Retro: Stepped dissolve with grayscale filter
 *
 * Related:
 * - Used in Toast.svelte and void-tooltip.ts
 * - For standard elements, use implode() instead
 */
export function dematerialize(
  node: HTMLElement,
  { delay = 0, duration = null, y = -20 } = {},
) {
  const { speedBase, blurInt, isRetro, isFlat, reducedMotion } =
    getSystemConfig();

  if (reducedMotion) return { duration: 0, css: () => 'opacity: 0;' };

  // Retro: stepped dissolve.
  if (isRetro) {
    return {
      delay,
      duration: duration ?? speedBase,
      css: (t: number) => {
        const steppedOpacity = Math.floor(t * 4) / 4;
        const steppedScale = 0.9 + Math.floor(t * 2) * 0.05;
        return `
          opacity: ${steppedOpacity};
          transform: scale(${steppedScale});
          filter: grayscale(100%) contrast(200%);
        `;
      },
    };
  }

  return {
    delay,
    duration: duration ?? speedBase,
    easing: cubicIn,
    css: (t: number, u: number) => {
      const currentBlur = isFlat ? 0 : blurInt * u;
      const opacity = t;

      return `
        transform: translateY(${u * y}px) scale(${1 - u * 0.05});
        opacity: ${opacity};
        filter: blur(${currentBlur}px);
      `;
    },
  };
}

/**
 * Layout-aware entry transition for elements in document flow.
 * Animates visual properties AND layout space (height, padding, margin).
 * Usage: <div in:emerge>
 *
 * Physics behavior:
 * - Glass: Blur fade-in with Y-axis translation + height growth
 * - Flat: Sharp fade-in with scale + height growth (no blur)
 * - Retro: Instant (0ms duration)
 *
 * Note: Reads computed styles once at start (height, padding, margin).
 * This causes a single layout reflow at animation start.
 *
 * Related:
 * - Pairs with dissolve() for exit
 * - For positioned/overlaid elements (no layout flow), use materialize() instead
 * - Vertical counterpart to implode()
 */
export function emerge(
  node: HTMLElement,
  { delay = 0, duration = null, y = 15 } = {},
) {
  const { speedBase, blurInt, isRetro, isFlat, reducedMotion } =
    getSystemConfig();

  const style = getComputedStyle(node);
  const height = parseFloat(style.height);
  const paddingTop = parseFloat(style.paddingTop);
  const paddingBottom = parseFloat(style.paddingBottom);
  const marginTop = parseFloat(style.marginTop);
  const marginBottom = parseFloat(style.marginBottom);

  if (reducedMotion || isRetro) {
    return {
      delay,
      duration: isRetro ? 0 : speedBase,
      css: (t: number) => `opacity: ${t};`,
    };
  }

  return {
    delay,
    duration: duration ?? speedBase,
    easing: cubicOut,
    css: (t: number, u: number) => {
      const activeBlur = isFlat ? 0 : Math.max(0, blurInt * (u * 2 - 1));

      return `
        height: ${t * height}px;
        padding-top: ${t * paddingTop}px;
        padding-bottom: ${t * paddingBottom}px;
        margin-top: ${t * marginTop}px;
        margin-bottom: ${t * marginBottom}px;
        overflow: clip;
        transform: translateY(${u * y}px) scale(${0.96 + 0.04 * t});
        opacity: ${t};
        filter: blur(${activeBlur}px);
      `;
    },
  };
}

/**
 * Layout-aware exit transition for elements in document flow.
 * Animates visual properties AND layout space (height, padding, margin).
 * Usage: <div out:dissolve>
 *
 * Physics behavior:
 * - Glass: Blur + upward float fade-out + height collapse
 * - Flat: Sharp upward float fade-out + height collapse (no blur)
 * - Retro: Stepped dissolve with grayscale + height collapse
 *
 * Note: Reads computed styles once at start (height, padding, margin).
 * This causes a single layout reflow at animation start.
 *
 * Related:
 * - Pairs with emerge() for entry
 * - For positioned/overlaid elements (no layout flow), use dematerialize() instead
 * - Vertical counterpart to implode()
 */
export function dissolve(
  node: HTMLElement,
  { delay = 0, duration = null, y = -20 } = {},
) {
  const { speedBase, blurInt, isRetro, isFlat, reducedMotion } =
    getSystemConfig();

  const style = getComputedStyle(node);
  const height = parseFloat(style.height);
  const paddingTop = parseFloat(style.paddingTop);
  const paddingBottom = parseFloat(style.paddingBottom);
  const marginTop = parseFloat(style.marginTop);
  const marginBottom = parseFloat(style.marginBottom);

  if (reducedMotion) {
    return { duration: 0, css: () => 'opacity: 0; height: 0; overflow: clip;' };
  }

  if (isRetro) {
    return {
      delay,
      duration: duration ?? speedBase,
      css: (t: number) => {
        const steppedOpacity = Math.floor(t * 4) / 4;
        const steppedScale = 0.9 + Math.floor(t * 2) * 0.05;
        return `
          height: ${t * height}px;
          padding-top: ${t * paddingTop}px;
          padding-bottom: ${t * paddingBottom}px;
          margin-top: ${t * marginTop}px;
          margin-bottom: ${t * marginBottom}px;
          overflow: clip;
          opacity: ${steppedOpacity};
          transform: scale(${steppedScale});
          filter: grayscale(100%) contrast(200%);
        `;
      },
    };
  }

  return {
    delay,
    duration: duration ?? speedBase,
    easing: cubicIn,
    css: (t: number, u: number) => {
      const currentBlur = isFlat ? 0 : blurInt * u;

      return `
        height: ${t * height}px;
        padding-top: ${t * paddingTop}px;
        padding-bottom: ${t * paddingBottom}px;
        margin-top: ${t * marginTop}px;
        margin-bottom: ${t * marginBottom}px;
        overflow: clip;
        transform: translateY(${u * y}px) scale(${1 - u * 0.05});
        opacity: ${t};
        filter: blur(${currentBlur}px);
      `;
    },
  };
}

/**
 * Horizontal collapse with dissolution.
 * Usage: <div out:implode>
 *
 * Best paired with animate:live for smooth sibling reflow.
 *
 * Takes the element out of document flow (position: absolute) and uses
 * compositor-only properties (transform, opacity, filter) — zero layout
 * recalculation. If Svelte's fix() already positioned the element, we
 * preserve its compensating translate. Otherwise we replicate fix()'s
 * work ourselves, canceling CSS transitions that would block it.
 *
 * Physics behavior:
 * - Retro: Grayscale dissolve
 * - Glass/Flat: Blur dissolve
 */
export function implode(
  node: HTMLElement,
  { delay = 0, duration = null } = {},
) {
  const { speedFast, isRetro, reducedMotion } = getSystemConfig();

  if (reducedMotion) return { duration: 0, css: () => 'opacity: 0;' };

  // Svelte's fix() bails when the element has running animations (CSS transitions,
  // @starting-style, etc.). Without fix(), the element stays in document flow and
  // the layout-based width collapse causes per-frame flex reflow jank.
  //
  // Solution: do fix()'s job ourselves. Cancel CSS transitions so they don't
  // interfere, capture position, take the element out of flow, then animate
  // with compositor-only properties (transform, opacity, filter) — zero layout.

  const isFixed = node.style.position === 'absolute';

  if (!isFixed) {
    // Capture position before taking out of flow
    const rect = node.getBoundingClientRect();
    const parentRect = node.offsetParent?.getBoundingClientRect() ?? rect;

    // Cancel CSS transitions that block fix()
    for (const anim of node.getAnimations()) {
      if (anim instanceof CSSTransition) anim.cancel();
    }

    // Take out of document flow (replicating Svelte's fix())
    node.style.position = 'absolute';
    node.style.width = `${rect.width}px`;
    node.style.height = `${rect.height}px`;
    node.style.left = `${rect.left - parentRect.left}px`;
    node.style.top = `${rect.top - parentRect.top}px`;
  }

  const baseTransform = node.style.transform || '';

  return {
    delay,
    duration: duration ?? speedFast,
    easing: cubicOut,
    css: (t: number, u: number) => {
      const filter = isRetro ? `grayscale(${u * 100}%)` : `blur(${u * 5}px)`; // void-ignore: blur intensity multiplier (physics constant)
      const scale = `scaleX(${t})`;
      const transform = baseTransform ? `${baseTransform} ${scale}` : scale;

      return `
        opacity: ${t};
        transform: ${transform};
        filter: ${filter};
        pointer-events: none;
      `;
    },
  };
}
