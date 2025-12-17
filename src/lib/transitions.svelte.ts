/*
 * ROLE: Svelte transition adapters for the Triad Engine.
 * RESPONSIBILITY: Physics-based motion primitives (Glass vs. Retro vs. Flat).
 */

import { cubicOut, cubicIn, quartOut } from 'svelte/easing';

/* --- HELPER: Read the Physics Engine --- */
function getSystemConfig(node: Element) {
  const style = getComputedStyle(node);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. READ SEMANTIC TOKENS
  // We fix the parsing to allow "0s" to be valid (Retro mode)
  const speedVal = style.getPropertyValue('--speed-base').trim();
  const speedBase = speedVal ? parseFloat(speedVal) * 1000 : 300;

  const speedFastVal = style.getPropertyValue('--speed-fast').trim();
  const speedFast = speedFastVal ? parseFloat(speedFastVal) * 1000 : 200;

  // 2. READ PHYSICS STATE
  const blurVal = style.getPropertyValue('--physics-blur') || '0px';
  const blurInt = parseInt(blurVal) || 0;

  // 3. DETERMINE REALITY
  // CRITICAL FIX: We check the explicit Physics Mode, not just the blur value.
  // This separates 'Flat' (No blur, smooth) from 'Retro' (No blur, instant).
  const physicsMode = document.documentElement.getAttribute('data-physics');
  const isRetro = physicsMode === 'retro';

  return { speedBase, speedFast, blurInt, isRetro, reducedMotion };
}

/**
 * ==========================================================================
 * 1. MATERIALIZE (Entry)
 * Behavior:
 * - Glass: Blur fades out + Scale Up + Fade In.
 * - Flat (Light): Scale Up + Fade In (No blur).
 * - Retro: Instant appearance (No animation).
 * ==========================================================================
 */
export function materialize(
  node: HTMLElement,
  { delay = 0, duration = null, y = 15 } = {},
) {
  const { speedBase, blurInt, isRetro, reducedMotion } = getSystemConfig(node);

  // ACCESSIBILITY / RETRO HARD STOP
  if (reducedMotion || isRetro) {
    return {
      delay,
      duration: 0, // Instant
      css: (t: number) => `opacity: ${t >= 0.5 ? 1 : 0};`,
    };
  }

  // GLASS & FLAT PHYSICS
  return {
    delay,
    duration: duration ?? speedBase,
    easing: cubicOut,
    css: (t: number, u: number) => {
      // Logic: If blurInt is 0 (Flat mode), the filter string becomes "blur(0px)"
      // which has no visual cost, preserving the smooth scale/fade.
      const currentBlur = Math.max(0, blurInt * (u * 2 - 1));

      return `
        transform: translateY(${u * y}px) scale(${0.98 + 0.02 * t});
        opacity: ${t};
        filter: blur(${currentBlur}px);
      `;
    },
  };
}

/**
 * ==========================================================================
 * 2. SINGULARITY (Exit)
 * Behavior:
 * - Glass: Implodes (Shrink + Bright Flash + Blur).
 * - Flat: Fades out + Shrinks slightly.
 * - Retro: Instant disappearance.
 * ==========================================================================
 */
export function singularity(
  node: HTMLElement,
  { delay = 0, duration = null } = {},
) {
  const { speedFast, blurInt, isRetro, reducedMotion } = getSystemConfig(node);

  if (reducedMotion || isRetro) {
    return { duration: 0, css: () => 'opacity: 0;' };
  }

  return {
    delay,
    duration: duration ?? speedFast,
    easing: cubicIn,
    css: (t: number, u: number) => {
      // t: 1 -> 0 (Fading out)
      // u: 0 -> 1 (Time progressing)

      // GLASS: Implosion Effect
      if (blurInt > 0) {
        const scale = 0.9 + 0.1 * t;
        const brightness = 1 + u * 2; // Flash white
        const blur = blurInt * u;

        return `
          transform: scale(${scale});
          opacity: ${t};
          filter: blur(${blur}px) brightness(${brightness});
        `;
      }

      // FLAT: Clean Fade (No flash/blur)
      return `
        transform: scale(${0.95 + 0.05 * t});
        opacity: ${t};
      `;
    },
  };
}

/**
 * ==========================================================================
 * 3. GLITCH (Entry)
 * Behavior:
 * - Retro: Hard digital steps (Blocky).
 * - Modern: Smooth holographic scan jitter.
 * ==========================================================================
 */
export function glitch(node: HTMLElement, { delay = 0, duration = null } = {}) {
  const { speedFast, isRetro, reducedMotion } = getSystemConfig(node);

  if (reducedMotion) return { duration: 0, css: () => '' };

  return {
    delay,
    duration: duration ?? speedFast,
    css: (t: number) => {
      // RETRO: Use steps for digital artifact look
      if (isRetro) {
        const clipVal = t * 100;
        return `
           clip-path: polygon(0 0, 100% 0, 100% ${clipVal}%, 0 ${clipVal}%);
           opacity: ${Math.random() > 0.5 ? 1 : 0.5};
         `;
      }

      // MODERN: Smooth skew
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
 * 4. DEMATERIALIZE (Exit)
 * Behavior:
 * - Glass: Smooth vertical drift + Blur increase + Late opacity fade.
 * - Retro: "Data Dissolve" (Stepped opacity + Grayscale + Block shrink).
 * ==========================================================================
 */
export function dematerialize(
  node: HTMLElement,
  { delay = 0, duration = null, y = -20 } = {},
) {
  const { speedBase, blurInt, isRetro, reducedMotion } = getSystemConfig(node);

  if (reducedMotion) {
    return { duration: 0, css: () => 'opacity: 0;' };
  }

  // RETRO PHYSICS: The "Data Dissolve"
  if (isRetro) {
    return {
      delay,
      // Force a minimum duration (150ms) even if global speed is 0s, 
      // otherwise the effect is invisible.
      duration: duration ?? 300,
      css: (t: number) => {
        // Quantize opacity into 4 distinct "steps" (1, 0.75, 0.5, 0.25, 0)
        const steppedOpacity = Math.floor(t * 4) / 4;
        
        // Quantize scale into 2 steps (1, 0.9)
        const steppedScale = 0.9 + Math.floor(t * 2) * 0.05;

        return `
          opacity: ${steppedOpacity};
          transform: scale(${steppedScale});
          filter: grayscale(100%) contrast(200%);
        `;
      },
    };
  }

  // GLASS/FLAT PHYSICS: The "Ethereal Fade"
  return {
    delay,
    duration: duration ?? speedBase,
    easing: cubicIn,
    css: (t: number, u: number) => {
      // Blur increases linearly as item leaves (u: 0 -> 1)
      const currentBlur = blurInt * u;
      
      // Fix "Muddy" Text:
      // We keep opacity higher for longer using a power curve.
      // At 50% time, opacity is still 70% (0.5^0.5 approx).
      const distinctOpacity = Math.pow(t, 0.5);

      return `
        transform: translateY(${u * y}px) scale(${1 - u * 0.05});
        opacity: ${distinctOpacity};
        filter: blur(${currentBlur}px);
      `;
    },
  };
}
