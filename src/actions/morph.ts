/**
 * Morph Action - Content-driven resize animations
 *
 * Automatically animates container dimensions when content changes size.
 * Uses ResizeObserver + Web Animations API with proper FLIP technique.
 *
 * FLIP Implementation:
 * 1. Observer fires → element is at NEW size in DOM
 * 2. FIRST: Immediately lock element at OLD dimensions via inline style
 * 3. LAST: Capture new target dimensions
 * 4. INVERT: Already done by step 2 (element visually at old size)
 * 5. PLAY: Animate from old → new, clear inline styles on finish
 *
 * PHYSICS INTEGRATION:
 * - Reads --speed-base and --ease-spring-gentle from CSS
 * - Respects retro physics (instant transitions)
 * - Follows reduced motion preferences
 *
 * DIALOG INTEGRATION:
 * - Auto-detects when inside a <dialog> element
 * - Waits for dialog CSS transition to complete before capturing dimensions
 * - Resets state on dialog open/close to prevent stale animations
 *
 * CONSTRAINTS:
 * - Elements using morph should NOT have CSS `transition: width` or `transition: height`
 *   as this will cause double-animation conflicts
 * - For modal content, apply morph to inner containers, not the dialog element itself
 * - Threshold default (2px) can be increased for elements with micro-fluctuations
 *
 * @example
 * <div use:morph>
 *   {#if expanded}
 *     <LargeContent />
 *   {:else}
 *     <SmallContent />
 *   {/if}
 * </div>
 *
 * @example Width only (for text containers)
 * <p use:morph={{ height: false }}>{dynamicMessage}</p>
 */

export interface MorphOptions {
  /** Animate width changes (default: true) */
  width?: boolean;
  /** Animate height changes (default: true) */
  height?: boolean;
  /** Minimum size change in pixels to trigger animation (default: 2) */
  threshold?: number;
  /** Callback fired when morph animation starts */
  onStart?: () => void;
  /** Callback fired when morph animation completes */
  onComplete?: () => void;
}

interface PhysicsConfig {
  duration: number;
  easing: string;
  disabled: boolean;
}

function getPhysicsConfig(el: HTMLElement): PhysicsConfig {
  const styles = getComputedStyle(el);

  // Parse --speed-base (e.g., "0.3s" → 300ms)
  const speedRaw = styles.getPropertyValue('--speed-base').trim();
  let duration = 300;
  if (speedRaw) {
    if (speedRaw.endsWith('ms')) {
      duration = parseFloat(speedRaw);
    } else if (speedRaw.endsWith('s')) {
      duration = parseFloat(speedRaw) * 1000;
    }
  }

  // Get easing (fallback to smooth spring)
  const easing =
    styles.getPropertyValue('--ease-spring-gentle').trim() ||
    'cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  // Disable for retro physics (0s) or reduced motion
  const isRetro = duration === 0;
  const reducedMotion =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    duration,
    easing,
    disabled: isRetro || reducedMotion,
  };
}

export function morph(node: HTMLElement, options: MorphOptions = {}) {
  const {
    width: animateWidth = true,
    height: animateHeight = true,
    threshold = 2,
    onStart,
    onComplete,
  } = options;

  // ═══════════════════════════════════════════════════════════════════════════
  // DIALOG LIFECYCLE DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  const dialogAncestor = node.closest('dialog') as HTMLDialogElement | null;

  let currentAnimation: Animation | null = null;
  let isAnimating = false;
  let lastRect: DOMRect | null = null;
  let pendingRect: DOMRect | null = null;
  let isStable = !dialogAncestor; // Stable immediately if not in dialog

  // Reset state when dialog becomes stable (transition complete)
  function resetToStable() {
    if (currentAnimation) {
      currentAnimation.cancel();
      currentAnimation = null;
    }
    isAnimating = false;
    pendingRect = null;
    lastRect = node.getBoundingClientRect();
    isStable = true;
  }

  // Dialog lifecycle listeners
  let dialogTransitionHandler: ((e: TransitionEvent) => void) | null = null;
  let dialogMutationObserver: MutationObserver | null = null;

  if (dialogAncestor) {
    // Listen for CSS transition completion (entry/exit animation done)
    dialogTransitionHandler = (e: TransitionEvent) => {
      // Only care about transitions on the dialog itself, not children
      if (e.target !== dialogAncestor) return;

      // If dialog is now open, we're stable and ready to animate
      if (dialogAncestor.open) {
        resetToStable();
      }
    };
    dialogAncestor.addEventListener('transitionend', dialogTransitionHandler);

    // Watch for open attribute changes (detect open/close state)
    dialogMutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'open') {
          // Dialog state changed - mark unstable until transition completes
          isStable = false;
        }
      }
    });
    dialogMutationObserver.observe(dialogAncestor, { attributes: true });

    // If dialog already open on mount, wait for layout to settle then stabilize
    if (dialogAncestor.open) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resetToStable();
        });
      });
    }
  } else {
    // Not in dialog - initialize normally (immediate stability)
    lastRect = node.getBoundingClientRect();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESIZE OBSERVER
  // ═══════════════════════════════════════════════════════════════════════════

  const observer = new ResizeObserver(() => {
    // Skip if element not yet stable (dialog mid-transition)
    if (!isStable || !lastRect) {
      return;
    }

    const newRect = node.getBoundingClientRect();

    // Capture pending change instead of discarding
    if (isAnimating) {
      pendingRect = newRect;
      return;
    }

    // Calculate deltas
    const deltaW = newRect.width - lastRect.width;
    const deltaH = newRect.height - lastRect.height;

    // Check if change exceeds threshold
    const shouldAnimateW = animateWidth && Math.abs(deltaW) > threshold;
    const shouldAnimateH = animateHeight && Math.abs(deltaH) > threshold;

    if (!shouldAnimateW && !shouldAnimateH) {
      lastRect = newRect;
      return;
    }

    // Get FRESH physics config (respects theme changes)
    const physics = getPhysicsConfig(node);

    // Skip animation for retro/reduced motion
    if (physics.disabled) {
      lastRect = newRect;
      return;
    }

    // Cancel any in-progress animation
    if (currentAnimation) {
      currentAnimation.cancel();
      currentAnimation = null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FLIP IMPLEMENTATION
    // ═══════════════════════════════════════════════════════════════════════════

    isAnimating = true;
    onStart?.();

    // Store original inline styles to restore later
    const originalWidth = node.style.width;
    const originalHeight = node.style.height;
    const originalOverflow = node.style.overflow;
    const originalMinWidth = node.style.minWidth;
    const originalMinHeight = node.style.minHeight;

    // STEP 1: LOCK at OLD dimensions (visually snaps element back to old size)
    if (shouldAnimateW) {
      node.style.width = `${lastRect.width}px`;
      node.style.minWidth = `${lastRect.width}px`;
    }
    if (shouldAnimateH) {
      node.style.height = `${lastRect.height}px`;
      node.style.minHeight = `${lastRect.height}px`;
    }
    node.style.overflow = 'clip';

    // STEP 2: Build keyframes from OLD → NEW
    const fromStyles: Record<string, string> = {};
    const toStyles: Record<string, string> = {};

    if (shouldAnimateW) {
      fromStyles.width = `${lastRect.width}px`;
      fromStyles.minWidth = `${lastRect.width}px`;
      toStyles.width = `${newRect.width}px`;
      toStyles.minWidth = `${newRect.width}px`;
    }
    if (shouldAnimateH) {
      fromStyles.height = `${lastRect.height}px`;
      fromStyles.minHeight = `${lastRect.height}px`;
      toStyles.height = `${newRect.height}px`;
      toStyles.minHeight = `${newRect.height}px`;
    }

    // STEP 3: ANIMATE
    currentAnimation = node.animate([fromStyles, toStyles], {
      duration: physics.duration,
      easing: physics.easing,
      fill: 'none',
    });

    // STEP 4: CLEANUP on finish
    const cleanup = () => {
      // CRITICAL: Cancel animation FIRST to remove effect from cascade
      currentAnimation?.cancel();

      // Now safe to restore original inline styles
      node.style.width = originalWidth;
      node.style.height = originalHeight;
      node.style.overflow = originalOverflow;
      node.style.minWidth = originalMinWidth;
      node.style.minHeight = originalMinHeight;

      currentAnimation = null;
      isAnimating = false;

      // Capture true natural size AFTER styles restored
      lastRect = node.getBoundingClientRect();

      // Clear pending - ResizeObserver will re-fire if size differs
      pendingRect = null;

      onComplete?.();
    };

    currentAnimation.onfinish = cleanup;
    currentAnimation.oncancel = () => {
      // On cancel, cleanup but don't call onComplete
      node.style.width = originalWidth;
      node.style.height = originalHeight;
      node.style.overflow = originalOverflow;
      node.style.minWidth = originalMinWidth;
      node.style.minHeight = originalMinHeight;
      currentAnimation = null;
      isAnimating = false;
      lastRect = node.getBoundingClientRect();
      pendingRect = null;
    };
  });

  observer.observe(node);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    destroy() {
      observer.disconnect();
      if (currentAnimation) {
        currentAnimation.cancel();
      }
      if (dialogAncestor && dialogTransitionHandler) {
        dialogAncestor.removeEventListener(
          'transitionend',
          dialogTransitionHandler,
        );
      }
      dialogMutationObserver?.disconnect();
    },
  };
}
