<script lang="ts">
  import type { Snippet } from 'svelte';
  import Checkmark from '../icons/Checkmark.svelte';
  import XMark from '../icons/XMark.svelte';
  import SpinLoader from '../icons/SpinLoader.svelte';
  import { morph } from '@actions/morph';

  // ─────────────────────────────────────────────────────────────────────────────
  // Props
  // ─────────────────────────────────────────────────────────────────────────────

  let {
    children,
    onrefresh,
    onerror,
    threshold = 48,
    disabled = false,
  }: {
    children: Snippet;
    onrefresh: () => Promise<void>;
    onerror?: (error: unknown) => void;
    /** Pull distance to trigger refresh (px). Syncs with CSS --pull-threshold. */
    threshold?: number;
    disabled?: boolean;
  } = $props();

  // ─────────────────────────────────────────────────────────────────────────────
  // Constants (derived from design tokens where applicable)
  // ─────────────────────────────────────────────────────────────────────────────

  // Physics constants (unitless ratios — not design tokens)
  const RESISTANCE = 2.0; // Rubber-band resistance factor
  const WHEEL_FACTOR = 0.3; // Mouse wheel sensitivity multiplier
  const ACTIVATION_THRESHOLD = 6; // px drag before committing to pull gesture

  // Timing constants (mirror CSS --speed-* tokens)
  // These must stay in sync with _pull-refresh.scss
  const DONE_DELAY_MS = 800; // Show checkmark/error
  const WHEEL_TIMEOUT_MS = 150; // Wheel inactivity before release
  const COOLDOWN_MS = 500; // --speed-slow — debounce between refreshes

  // Distance constants (derived from threshold prop)
  const MAX_PULL_FACTOR = 2.5; // Max pull = threshold * factor
  const HOLD_FACTOR = 1.0; // Hold distance = threshold during refresh

  // SVG circle constants (r=10 in 24x24 viewBox, matches toast loader)
  const CIRCLE_RADIUS = 10;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ≈62.83

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived Constants (computed from props)
  // ─────────────────────────────────────────────────────────────────────────────

  const maxPull = $derived(threshold * MAX_PULL_FACTOR);
  const holdDistance = $derived(threshold * HOLD_FACTOR);

  // ─────────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────────

  type PullState =
    | 'idle'
    | 'pulling'
    | 'threshold'
    | 'refreshing'
    | 'done'
    | 'error';

  let pullDistance = $state(0);
  let pullState = $state<PullState>('idle');

  // Non-reactive tracking values
  let lastRefreshTime = 0;
  let startY = 0;
  let isPulling = false;
  let pointerId: number | null = null;

  // Pending gesture (before activation threshold crossed)
  let pendingPointerId: number | null = null;
  let pendingStartY = 0;

  // Wheel state
  let wheelAccumulator = 0;
  let wheelTimeout: ReturnType<typeof setTimeout> | undefined;

  // Abort controller for safe async cleanup
  let abortController: AbortController | null = null;

  // DOM references
  let containerEl: HTMLDivElement | undefined = $state();
  let scrollTarget: HTMLElement | Window | null = null;

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived State
  // ─────────────────────────────────────────────────────────────────────────────

  const progress = $derived(Math.min(1, pullDistance / threshold));

  const strokeDashoffset = $derived((1 - progress) * CIRCLE_CIRCUMFERENCE);

  const message = $derived.by(() => {
    switch (pullState) {
      case 'pulling':
        return 'Pull to refresh';
      case 'threshold':
        return 'Release to refresh';
      case 'refreshing':
        return 'Refreshing...';
      case 'done':
        return 'Updated';
      case 'error':
        return 'Failed';
      default:
        return '';
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /**
   * Walks up the DOM tree to find the nearest scrollable ancestor.
   * Returns window if no scrollable container is found.
   */
  function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
    if (!node || typeof window === 'undefined') return window;

    const style = getComputedStyle(node);
    const overflowY = style.overflowY;

    if (overflowY === 'scroll' || overflowY === 'auto') {
      // Only count as scrollable if content actually overflows
      if (node.scrollHeight > node.clientHeight) {
        return node;
      }
    }

    return getScrollParent(node.parentElement);
  }

  /**
   * Gets current scroll position from detected scroll target.
   */
  const getScrollTop = (): number => {
    if (!scrollTarget || scrollTarget === window) {
      return typeof window !== 'undefined' ? window.scrollY : 0;
    }
    return (scrollTarget as HTMLElement).scrollTop;
  };

  const canStartPull = (): boolean => {
    if (typeof window === 'undefined') return false;
    if (disabled) return false;
    // Block during all non-idle terminal states
    if (
      pullState === 'refreshing' ||
      pullState === 'done' ||
      pullState === 'error'
    )
      return false;
    if (Date.now() - lastRefreshTime < COOLDOWN_MS) return false;
    if (getScrollTop() > 0) return false;
    return true;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Core Actions
  // ─────────────────────────────────────────────────────────────────────────────

  function releasePull() {
    isPulling = false;
    pointerId = null;
    pullDistance = 0;
    pullState = 'idle';
    wheelAccumulator = 0;
  }

  async function triggerRefresh() {
    isPulling = false;
    pointerId = null;
    wheelAccumulator = 0;
    pullState = 'refreshing';
    pullDistance = holdDistance;

    // Create abort controller for this refresh cycle
    abortController = new AbortController();
    const signal = abortController.signal;

    try {
      await onrefresh();

      // Bail if component was destroyed during refresh
      if (signal.aborted) return;

      pullState = 'done';
      await sleep(DONE_DELAY_MS);

      // Check again after delay
      if (signal.aborted) return;
    } catch (err) {
      if (signal.aborted) return;

      console.error('Pull to refresh failed:', err);
      onerror?.(err);

      // Show error state briefly before returning to idle
      pullState = 'error';
      await sleep(DONE_DELAY_MS);
      if (signal.aborted) return;
    } finally {
      if (!signal.aborted) {
        pullDistance = 0;
        pullState = 'idle';
        lastRefreshTime = Date.now();
      }
      abortController = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Pointer Events (Touch + Mouse)
  // ─────────────────────────────────────────────────────────────────────────────

  function handlePointerDown(e: PointerEvent) {
    if (!canStartPull() || !e.isPrimary) return;

    // Record intent only — don't activate until user drags down past threshold.
    // This allows taps/clicks to propagate normally to child elements.
    pendingPointerId = e.pointerId;
    pendingStartY = e.clientY;
  }

  function handlePointerMove(e: PointerEvent) {
    // Handle pending activation (before threshold crossed)
    if (pendingPointerId === e.pointerId && !isPulling) {
      const deltaY = e.clientY - pendingStartY;

      // Moving up? Cancel pending gesture
      if (deltaY < 0) {
        pendingPointerId = null;
        return;
      }

      // Scrolled away from top? Cancel pending
      if (getScrollTop() > 0) {
        pendingPointerId = null;
        return;
      }

      // Activation threshold crossed — commit to pull gesture
      if (deltaY >= ACTIVATION_THRESHOLD) {
        isPulling = true;
        startY = pendingStartY;
        pointerId = pendingPointerId;
        pullState = 'pulling';
        pendingPointerId = null;

        // Capture pointer for tracking outside element bounds
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

        // Apply initial pull distance (minus activation threshold for smoother feel)
        pullDistance = Math.min(
          maxPull,
          (deltaY - ACTIVATION_THRESHOLD) / RESISTANCE,
        );
      }
      return;
    }

    // Active pull gesture
    if (!isPulling || e.pointerId !== pointerId) return;

    const deltaY = e.clientY - startY;

    // Pulling up (negative delta) - cancel the pull
    if (deltaY < 0) {
      releasePull();
      return;
    }

    // Scrolled away from top during pull - cancel
    if (getScrollTop() > 0) {
      releasePull();
      return;
    }

    // Apply resistance for rubber-band feel
    pullDistance = Math.min(maxPull, deltaY / RESISTANCE);

    // Update state based on threshold, with haptic feedback at crossing
    const newState: PullState =
      pullDistance >= threshold ? 'threshold' : 'pulling';
    if (newState === 'threshold' && pullState === 'pulling') {
      // Haptic pulse for touch only (mouse/trackpad don't have haptics, and
      // Chrome blocks vibrate without user activation from tap/click)
      if (e.pointerType === 'touch' && typeof navigator !== 'undefined') {
        navigator.vibrate?.(10);
      }
    }
    pullState = newState;
  }

  function handlePointerUp(e: PointerEvent) {
    // Clear pending gesture (tap/click will propagate normally)
    if (e.pointerId === pendingPointerId) {
      pendingPointerId = null;
    }

    if (!isPulling || e.pointerId !== pointerId) return;

    if (pullDistance >= threshold) {
      triggerRefresh();
    } else {
      releasePull();
    }
  }

  function handlePointerCancel(e: PointerEvent) {
    if (e.pointerId === pendingPointerId) {
      pendingPointerId = null;
    }
    if (e.pointerId === pointerId) {
      releasePull();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Mouse Wheel (Desktop)
  // ─────────────────────────────────────────────────────────────────────────────

  function handleWheel(e: WheelEvent) {
    // Only trigger on scroll up (negative deltaY) at top of page
    if (!canStartPull() || e.deltaY >= 0) return;

    // Bail if scrolled away from top mid-gesture
    if (getScrollTop() > 0) {
      releasePull();
      return;
    }

    e.preventDefault();

    // Accumulate wheel delta
    wheelAccumulator += Math.abs(e.deltaY) * WHEEL_FACTOR;
    pullDistance = Math.min(maxPull, wheelAccumulator / RESISTANCE);
    pullState = pullDistance >= threshold ? 'threshold' : 'pulling';

    // Instant trigger when threshold crossed (wheel is discrete, not continuous)
    if (pullDistance >= threshold) {
      clearTimeout(wheelTimeout);
      triggerRefresh();
      return;
    }

    // Timeout releases sub-threshold pulls when user stops scrolling
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      releasePull();
    }, WHEEL_TIMEOUT_MS);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────────

  // Detect scrollable ancestor on mount
  $effect(() => {
    if (containerEl && typeof window !== 'undefined') {
      scrollTarget = getScrollParent(containerEl);
    }
  });

  // Attach wheel listener with { passive: false } to allow preventDefault
  $effect(() => {
    const el = containerEl;
    if (!el) return;

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Cleanup
  // ─────────────────────────────────────────────────────────────────────────────

  $effect(() => {
    return () => {
      clearTimeout(wheelTimeout);
      abortController?.abort();
    };
  });
</script>

<div
  class="pull-refresh"
  data-state={pullState}
  aria-busy={pullState === 'refreshing'}
  style:--pull-distance="{pullDistance}px"
  style:--pull-progress={progress}
  style:--pull-threshold="{threshold}px"
  bind:this={containerEl}
>
  <!-- Indicator: Floats above content, revealed on pull -->
  <div class="pull-indicator" use:morph={{ height: false, width: true }}>
    {#if pullState === 'done'}
      <Checkmark class="pull-checkmark" />
    {:else if pullState === 'error'}
      <XMark class="pull-error" />
    {:else}
      {#if pullState === 'refreshing'}
        <SpinLoader data-size="lg" />
      {:else}
        <!-- Progress ring -->
        <svg class="icon progress-ring" data-size="lg" viewBox="0 0 24 24">
          <circle
            class="track"
            cx="12"
            cy="12"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke-width="2"
          />
          <circle
            class="value"
            cx="12"
            cy="12"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke-width="2"
            stroke-dasharray={CIRCLE_CIRCUMFERENCE}
            stroke-dashoffset={strokeDashoffset}
          />
        </svg>
      {/if}

      <!-- Arrow icon (inside ring area) -->
      {#if pullState !== 'refreshing'}
        <svg
          class="icon pull-arrow"
          data-size="sm"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      {/if}
    {/if}

    <p class="pull-message" role="status" aria-live="polite">{message}</p>
  </div>

  <!-- Content: Translates down to reveal indicator -->
  <div
    class="pull-content"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerCancel}
  >
    {@render children()}
  </div>
</div>
