/*
 * ==========================================================================
 * 🌌 VOID PHYSICS: MOTION PRIMITIVES SYSTEM
 * ==========================================================================
 * ROLE: Bridges Svelte's transition engine with the Triad Physics.
 * * PHYSICS RULES:
 * 1. GLASS: Viscous. Uses Blur, Scale, and Cubic Easing.
 * 2. FLAT:  Aerodynamic. Uses Translate, Opacity, and Quart/Quint Easing.
 * 3. RETRO: Robotic. Uses Steps, Glitch, and Instant Snaps.
 *
 * --------------------------------------------------------------------------
 * THE LIFECYCLE OF AN ENTITY
 * --------------------------------------------------------------------------
 * In Svelte, an element has three distinct motion states. We map these to
 * our Physics vocabulary:
 *
 * 1. CREATION (in: directive) -> "Materialize"
 * - Trigger: Element is added to the DOM.
 * - Physics: Starts transparent/blurred/offset and stabilizes into reality.
 * - Usage: <div in:materialize={{ y: -20 }}>
 *
 * 2. DESTRUCTION (out: directive) -> "Singularity" / "Dematerialize" / "Implode"
 * - Trigger: Element is removed from the DOM.
 * - Physics: The element stays in the DOM while it dissolves/explodes.
 * - Usage: <div out:singularity>
 *
 * 3. SHIFTING (animate: directive) -> "Live"
 * - Trigger: The list order changes (e.g., an item is deleted).
 * - Physics: Neighbors slide smoothly to fill the gap.
 * - Critical Requirement: The {#each} block MUST be keyed by data, not index.
 * - Usage: <div animate:live>
 *
 * --------------------------------------------------------------------------
 * ⚠️ DEVELOPER WARNING: THE LIST COORDINATION PROTOCOL
 * --------------------------------------------------------------------------
 * When removing an item from a list, two things happen simultaneously:
 * A. The Victim runs 'out:singularity' (It fades out in place).
 * B. The Neighbors run 'animate:live' (They slide over the Victim).
 *
 * IF YOU FORGET THE KEY:
 * Svelte will reuse the DOM nodes. The "Victim" will be the *last* element
 * in the list visually, causing the data to "jump" before the animation plays.
 *
 * CORRECT: {#each items as item (item.id)} ... {/each}
 * WRONG:   {#each items as item, i (i)} ... {/each}
 * ==========================================================================
 */

import { flip } from 'svelte/animate';
import { cubicOut, cubicIn } from 'svelte/easing';
import { voidEngine as theme } from '../adapters/void-engine.svelte';
import THEME_REGISTRY from '../config/void-registry.json';
import PHYSICS_DATA from '../config/void-physics.json';

// Type definition for Registry to ensure strict lookup
type Registry = Record<string, { physics: string; mode: string }>;
const REGISTRY = THEME_REGISTRY as Registry;

// Type definition for the Physics JSON structure
type PhysicsConfig = Record<
  string,
  { speedBase: number; speedFast: number; blur: number }
>;

// Cast imported JSON to our type
const PHYSICS_PRIMITIVES = PHYSICS_DATA as PhysicsConfig;

/* --- HELPER: Read the Physics Engine (Zero-Reflow) --- */
function getSystemConfig() {
  // 1. READ ENVIRONMENT
  const reducedMotion =
    typeof matchMedia !== 'undefined'
      ? matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // 2. BROWSER DETECTION (Simple heuristic for expensive filters)
  // Firefox handles dynamic backdrop-filter blur poorly compared to Chromium/Webkit.
  const isFirefox =
    typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);

  // 3. READ GLOBAL STATE (The Triad)
  // We use the theme adapter to get the current atmosphere explicitly.
  const currentAtmosphere = theme.atmosphere || 'void';
  const themeConfig = REGISTRY[currentAtmosphere] || REGISTRY['void'];

  // 4. DERIVE PHYSICS
  // Default to 'glass' if configuration is missing
  const physicsMode = themeConfig.physics || 'glass';

  // NEW: Lookup from generated JSON
  const specs = PHYSICS_PRIMITIVES[physicsMode] || PHYSICS_PRIMITIVES['glass'];

  const isRetro = physicsMode === 'retro';
  const isFlat = physicsMode === 'flat';

  // SAFETY CAP: If Reduced Motion OR Firefox, kill the blur animation.
  // We keep the opacity/transform, but skip the expensive filter recalculation.
  const blurInt = reducedMotion || isFirefox ? 0 : specs.blur;

  return {
    speedBase: specs.speedBase,
    speedFast: specs.speedFast,
    blurInt,
    isRetro,
    isFlat,
    reducedMotion,
  };
}

/**
 * ==========================================================================
 * 0. VOID LIST (Sorting)
 * Usage: <div animate:live>
 * ==========================================================================
 */
export function live(
  node: HTMLElement,
  { from, to }: { from: DOMRect; to: DOMRect },
  params: any = {},
) {
  const { isRetro } = getSystemConfig();

  // RETRO: Robotic Quantization
  const steppedEasing = (t: number) => Math.floor(t * 4) / 4;

  return flip(
    node,
    { from, to },
    {
      duration: params.duration ?? 300,
      easing: isRetro ? steppedEasing : cubicOut,
      ...params,
    },
  );
}

/**
 * ==========================================================================
 * 1. MATERIALIZE (Entry)
 * Usage: <div in:materialize}>
 * ==========================================================================
 */
export function materialize(
  node: HTMLElement,
  { delay = 0, duration = null, y = 15 } = {},
) {
  const { speedBase, blurInt, isRetro, isFlat, reducedMotion } =
    getSystemConfig();

  // A. RETRO / REDUCED (Instant)
  if (reducedMotion || isRetro) {
    return {
      delay,
      duration: isRetro ? 0 : 300,
      css: (t: number) => `opacity: ${t};`,
    };
  }

  // B. SMOOTH PHYSICS (Glass & Flat)
  return {
    delay,
    duration: duration ?? speedBase,
    easing: cubicOut,
    css: (t: number, u: number) => {
      // Logic: Glass gets blur. Flat gets 0px blur.
      // We calculate blur dynamically based on the u (inverse time)
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
 * ==========================================================================
 * 2. SINGULARITY (Exit)
 * Usage: <div out:singularity>
 * ==========================================================================
 */
export function singularity(
  node: HTMLElement,
  { delay = 0, duration = null } = {},
) {
  const { speedFast, blurInt, isRetro, isFlat, reducedMotion } =
    getSystemConfig();

  if (reducedMotion || isRetro) {
    return { duration: 0, css: () => 'opacity: 0;' };
  }

  // B. FLAT PHYSICS (Clean Wipe)
  if (isFlat) {
    return {
      delay,
      duration: duration ?? speedFast,
      easing: cubicIn,
      css: (t: number) => `
        transform: scale(${0.98 + 0.02 * t});
        opacity: ${t};
      `,
    };
  }

  // C. GLASS PHYSICS (Implosion)
  return {
    delay,
    duration: duration ?? speedFast,
    easing: cubicIn,
    css: (t: number, u: number) => {
      const scale = 0.9 + 0.1 * t;
      const brightness = 1 + u * 2; // Flash effect
      const blur = blurInt * u;
      return `
        transform: scale(${scale});
        opacity: ${t};
        filter: blur(${blur}px) brightness(${brightness});
      `;
    },
  };
}

/**
 * ==========================================================================
 * 3. GLITCH (Effect)
 * ==========================================================================
 */
export function glitch(node: HTMLElement, { delay = 0, duration = null } = {}) {
  const { speedFast, isRetro, reducedMotion } = getSystemConfig();

  if (reducedMotion) return { duration: 0, css: () => '' };

  return {
    delay,
    duration: duration ?? speedFast,
    css: (t: number) => {
      if (isRetro) {
        const clipVal = t * 100;
        return `
           clip-path: polygon(0 0, 100% 0, 100% ${clipVal}%, 0 ${clipVal}%);
           opacity: ${Math.random() > 0.5 ? 1 : 0.5};
         `;
      }
      const activeSkew = 1 - t > 0.2 ? (t * 20) % 5 : 0;
      const clipHeight = t * 100;
      return `
        clip-path: polygon(0 0, 100% 0, 100% ${clipHeight}%, 0 ${clipHeight}%);
        transform: skewX(${activeSkew}deg);
        opacity: ${t};
      `;
    },
  };
}

/**
 * ==========================================================================
 * 4. DEMATERIALIZE (Toasts / Floating Exits)
 * ==========================================================================
 */
export function dematerialize(
  node: HTMLElement,
  { delay = 0, duration = null, y = -20 } = {},
) {
  const { speedBase, blurInt, isRetro, isFlat, reducedMotion } =
    getSystemConfig();

  if (reducedMotion) return { duration: 0, css: () => 'opacity: 0;' };

  // A. RETRO: Data Dissolve
  if (isRetro) {
    return {
      delay,
      duration: duration ?? 300,
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

  // B. SMOOTH (Glass & Flat)
  return {
    delay,
    duration: duration ?? speedBase,
    easing: cubicIn,
    css: (t: number, u: number) => {
      const currentBlur = isFlat ? 0 : blurInt * u;
      const opacity = t; // Linear opacity

      return `
        transition: none;
        transform: translateY(${u * y}px) scale(${1 - u * 0.05});
        opacity: ${opacity};
        filter: blur(${currentBlur}px);
      `;
    },
  };
}

/**
 * ==========================================================================
 * 5. IMPLODE (Layout Collapse)
 * NOTE: This relies on Computed Styles for geometry, but runs ONCE at start.
 * ==========================================================================
 */
export function implode(
  node: HTMLElement,
  { delay = 0, duration = null } = {},
) {
  // We use the non-DOM config for timing/physics.
  const style = getComputedStyle(node);
  const width = parseFloat(style.width);
  const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
  const padding =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

  const { speedFast, isRetro, reducedMotion } = getSystemConfig();

  if (reducedMotion) return { duration: 0, css: () => 'opacity: 0; width: 0;' };

  return {
    delay,
    duration: duration ?? speedFast,
    easing: cubicOut,
    css: (t: number, u: number) => {
      const filter = isRetro ? `grayscale(${u * 100}%)` : `blur(${u * 5}px)`;
      return `
        overflow: hidden;
        opacity: ${t};
        width: ${t * width}px;
        padding-left: ${t * padding * 0.5}px;
        padding-right: ${t * padding * 0.5}px;
        margin-left: ${t * margin * 0.5}px;
        margin-right: ${t * margin * 0.5}px;
        filter: ${filter};
        white-space: nowrap; 
      `;
    },
  };
}
