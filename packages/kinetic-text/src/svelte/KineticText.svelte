<script lang="ts">
  import type {
    KineticTextProps,
    TimelineConfig,
    CharPosition,
    KineticTextControls,
    StyleSpan,
  } from '../types';
  import { revealStyleForPhysics, SPEED_PRESETS } from '../types';
  import { PretextLayout } from '../core/layout/index';
  import { CharacterRenderer } from '../core/render/index';
  import { RevealTimeline } from '../core/timeline/index';
  import { hashSeed } from '../core/timeline/prng';
  import {
    applyContinuousEffect,
    clearContinuousEffect,
  } from '../core/effects/continuous';
  import { fireOneShotEffect } from '../core/effects/one-shot';

  let {
    text,
    styleSnapshot,
    revealMode = 'char',
    revealStyle: revealStyleProp,
    speedPreset,
    staggerPattern = 'sequential',
    stagger,
    revealDuration,
    activeEffect = null,
    cues = [],
    seed,
    reducedMotion = 'auto',
    speed,
    charSpeed,
    scramblePasses,
    oneShotEffect = null,
    oneShotTrigger = 0,
    ononeshotcomplete,
    loading = false,
    skeletonLines = 3,
    skeletonLastLineWidth = 0.7,
    preRevealed = false,
    revealMarks,
    paused = false,
    controls = $bindable(),
    onrevealcomplete,
    oneffectscomplete,
    onrevealword,
    styleSpans,
    as = 'span',
    class: className = '',
  }: KineticTextProps = $props();

  // Stable control-surface proxy. Identity never changes across re-layouts —
  // the live `timeline` instance is captured at call time via the outer
  // closure, so parent `$effect`s that depend on `controls` don't re-run when
  // the timeline is rebuilt (e.g. on resize or text change).
  const controlSurface: KineticTextControls = {
    pause: () => timeline?.pause(),
    resume: () => timeline?.resume(),
    seek: (ms: number) => timeline?.seek(ms),
    nudge: (ms: number) => timeline?.nudge(ms),
    skipToEnd: () => timeline?.skipToEnd(),
    setRate: (rate: number) => timeline?.setRate(rate),
    get progress() {
      return timeline?.progress ?? 0;
    },
    get elapsed() {
      return timeline?.elapsed ?? 0;
    },
    get isPaused() {
      return timeline?.isPaused ?? false;
    },
    get isComplete() {
      return timeline?.isComplete ?? false;
    },
    get rate() {
      return timeline?.rate ?? 1;
    },
  };
  controls = controlSurface;

  const cueCount = $derived(cues.length);

  // ── Defaults per mode ──────────────────────────────────────────
  const resolvedRevealStyle = $derived(
    revealStyleProp ?? revealStyleForPhysics(styleSnapshot.physics),
  );
  const resolvedStagger = $derived(
    stagger ?? (revealMode === 'char' ? 40 : 30),
  );
  const presetValues = $derived(
    speedPreset ? SPEED_PRESETS[speedPreset] : null,
  );
  const resolvedSpeed = $derived(
    speed ?? presetValues?.speed ?? (revealMode === 'word' ? 80 : 200),
  );
  const resolvedCharSpeed = $derived(charSpeed ?? presetValues?.charSpeed ?? 8);
  const resolvedRevealDuration = $derived(
    revealDuration ??
      (resolvedRevealStyle === 'scramble'
        ? 500
        : resolvedRevealStyle === 'drop'
          ? 450
          : resolvedRevealStyle === 'rise'
            ? 400
            : resolvedRevealStyle === 'pop'
              ? 250
              : 300),
  );
  const resolvedScramblePasses = $derived(scramblePasses ?? 4);
  const resolvedSeed = $derived(seed ?? hashSeed(text + revealMode));
  // ── Reduced motion resolution ─────────────────────────────────
  let prefersReducedMotion = $state(false);

  $effect(() => {
    if (reducedMotion !== 'auto') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  const isReducedMotion = $derived(
    reducedMotion === 'always' ||
      (reducedMotion === 'auto' && prefersReducedMotion),
  );

  // ── Layout + Renderer state ──────────────────────────────────
  let rootEl: HTMLElement | null = $state(null);
  let pretextLayout = new PretextLayout();
  let renderer: CharacterRenderer | null = $state(null);
  let timeline: RevealTimeline | null = null;
  let containerWidth = 0;
  let resizeObserver: ResizeObserver | null = null;
  let currentPositions: CharPosition[] = $state([]);
  let currentPrepared:
    | import('@chenglou/pretext').PreparedTextWithSegments
    | null = null;

  // ── Skeleton state ──────────────────────────────────────────
  let skeletonState: 'visible' | 'hiding' | 'hidden' = $state('hidden');
  let layoutLineCount = $state(0);
  let layoutLastLineRatio = $state(0.7);

  const effectiveSkeletonLines = $derived(
    layoutLineCount > 0 ? layoutLineCount : skeletonLines,
  );
  const effectiveLastLineWidth = $derived(
    layoutLineCount > 0 ? layoutLastLineRatio : skeletonLastLineWidth,
  );

  // Inline CSS variables from snapshot.vars + reveal duration
  const inlineVars = $derived(
    Object.entries(styleSnapshot.vars)
      .map(([k, v]) => `${k}: ${v}`)
      .concat([`--kt-reveal-duration: ${resolvedRevealDuration}ms`])
      .join('; '),
  );

  // ── Copy event handler ───────────────────────────────────────
  function handleCopy(e: ClipboardEvent) {
    e.preventDefault();
    e.clipboardData?.setData('text/plain', text);
  }

  // ── Continuous effect reactivity ──────────────────────────────
  $effect(() => {
    const r = renderer;
    const effect = activeEffect;
    const positions = currentPositions;
    const reduced = isReducedMotion;
    const seed = resolvedSeed;
    if (!r || positions.length === 0) return;

    if (effect && !reduced) {
      clearContinuousEffect(r);
      applyContinuousEffect(r, effect, seed);
    } else {
      clearContinuousEffect(r);
    }
  });

  // ── Reactive pause/resume ───────────────────────────────────
  // The `paused` prop is used by external-clock consumers (e.g. TTS
  // sync) to gate reveal on audio playback. `startPaused` in the
  // timeline config handles the initial state; this effect keeps the
  // prop live so consumers can flip it without rebuilding the timeline.
  $effect(() => {
    const t = timeline;
    const p = paused;
    if (!t) return;
    if (p && !t.isPaused && !t.isComplete) {
      t.pause();
    } else if (!p && t.isPaused) {
      t.resume();
    }
  });

  // ── Imperative one-shot firing ──────────────────────────────
  let prevOneShotTrigger = 0;

  $effect(() => {
    const trigger = oneShotTrigger;
    const effect = oneShotEffect;
    const r = renderer;
    const reduced = isReducedMotion;
    if (!r || !effect || trigger === 0 || trigger === prevOneShotTrigger)
      return;
    prevOneShotTrigger = trigger;

    fireOneShotEffect(
      r,
      {
        id: `imperative-${trigger}`,
        effect,
        trigger: 'at-time',
        atMs: 0,
        seed: resolvedSeed,
      },
      () => ononeshotcomplete?.(),
      reduced,
    );
  });

  // ── Inline style spans ──────────────────────────────────────
  // Applied on kt-word wrappers as data-kt-style + data-kt-style-pos. Called
  // after each render()/rerender() so resize and layout changes reapply the
  // spans on freshly built DOM. SCSS owns the visual treatment (italic, quote
  // marks, underline, etc.).
  function applyStyleSpans(
    r: CharacterRenderer,
    spans: StyleSpan[] | undefined,
  ) {
    const words = r.getAllWordElements();
    for (const word of words) {
      word.removeAttribute('data-kt-style');
      word.removeAttribute('data-kt-style-pos');
    }
    if (!spans || spans.length === 0) return;
    for (const span of spans) {
      const from = Math.max(0, span.fromWord);
      const to = Math.min(words.length - 1, span.toWord);
      if (to < from) continue;
      for (let i = from; i <= to; i++) {
        const word = words[i];
        if (!word) continue;
        const pos =
          from === to
            ? 'single'
            : i === from
              ? 'start'
              : i === to
                ? 'end'
                : 'middle';
        word.setAttribute('data-kt-style', span.kind);
        word.setAttribute('data-kt-style-pos', pos);
      }
    }
  }

  // React to prop changes after the initial render — e.g. a consumer swaps
  // styleSpans on the same beat. The render/rerender paths apply spans inline
  // for their own fresh DOM; this effect covers the mid-life prop-update case.
  $effect(() => {
    const r = renderer;
    const spans = styleSpans;
    if (!r) return;
    applyStyleSpans(r, spans);
  });

  // ── Layout pipeline ──────────────────────────────────────────

  /** Measure text layout and derive skeleton geometry. Does NOT build DOM. */
  async function measureLayout(el: HTMLElement) {
    const width = el.clientWidth;
    if (width === 0) return;
    containerWidth = width;

    const result = await pretextLayout.computeLayout(
      text,
      styleSnapshot.font,
      styleSnapshot.lineHeight,
      width,
    );
    currentPrepared = result.prepared;
    currentPositions = result.positions;

    // Derive skeleton geometry from layout
    const positions = result.positions;
    if (positions.length > 0) {
      const lineCount = positions[positions.length - 1].lineIndex + 1;
      layoutLineCount = lineCount;
      const lastLineChars = positions.filter(
        (p) => p.lineIndex === lineCount - 1,
      );
      const lastLineWidth = lastLineChars.reduce((sum, p) => sum + p.width, 0);
      layoutLastLineRatio =
        width > 0 ? Math.min(lastLineWidth / width, 1) : 0.7;
    }
  }

  /** Build renderer DOM and optionally start reveal. Call only when not loading. */
  function renderAndReveal(el: HTMLElement) {
    if (currentPositions.length === 0) return;

    // Abort previous timeline
    timeline?.abort();
    timeline = null;

    // Destroy previous renderer and build new DOM
    renderer?.destroy();
    renderer = new CharacterRenderer(
      el,
      currentPositions,
      {
        lineHeight: styleSnapshot.lineHeight,
        revealStyle: resolvedRevealStyle,
        physics: styleSnapshot.physics,
        mode: styleSnapshot.mode,
        preRevealed,
      },
      text,
    );
    renderer.render();
    applyStyleSpans(renderer, styleSpans);

    // Pre-revealed: skip timeline entirely, fire callbacks immediately
    if (preRevealed) {
      renderer.setAriaBusy(false);
      onrevealcomplete?.();
      oneffectscomplete?.();
      return;
    }

    startTimeline(currentPositions);
  }

  /** Full pipeline for non-loading path: measure + render + reveal. */
  async function runLayout(el: HTMLElement) {
    timeline?.abort();
    timeline = null;

    await measureLayout(el);
    if (!loading) {
      renderAndReveal(el);
    }
  }

  /** Create and start the reveal timeline. */
  function startTimeline(positions: CharPosition[]) {
    timeline?.abort();
    timeline = null;

    if (!renderer) return;

    const config: TimelineConfig = {
      revealMode,
      revealStyle: resolvedRevealStyle,
      staggerPattern,
      stagger: resolvedStagger,
      revealDuration: resolvedRevealDuration,
      speed: resolvedSpeed,
      charSpeed: resolvedCharSpeed,
      scramblePasses: resolvedScramblePasses,
      physics: styleSnapshot.physics,
      seed: resolvedSeed,
      reducedMotion: isReducedMotion,
      cues,
      revealMarks,
      startPaused: paused,
      onrevealcomplete,
      oneffectscomplete,
      onrevealword,
    };

    timeline = new RevealTimeline(renderer, positions, config);
    timeline.start();
  }

  // ── Loading → reveal transition ─────────────────────────────
  $effect(() => {
    if (loading) {
      skeletonState = 'visible';
    } else if (skeletonState === 'visible') {
      // loading just became false — build DOM and start reveal
      skeletonState = 'hiding';

      if (rootEl && currentPositions.length > 0 && !preRevealed) {
        renderAndReveal(rootEl);
      }

      // Remove skeleton layer after CSS transition completes
      const timer = setTimeout(() => {
        skeletonState = 'hidden';
      }, 300);
      return () => clearTimeout(timer);
    }
  });

  // ── Resize handler ───────────────────────────────────────────
  function handleResize(entries: ResizeObserverEntry[]) {
    const entry = entries[0];
    if (!entry || !rootEl || !currentPrepared) return;

    const newWidth = Math.round(entry.contentRect.width);
    if (newWidth === containerWidth || newWidth === 0) return;
    containerWidth = newWidth;

    const result = pretextLayout.relayout(
      text,
      styleSnapshot.font,
      styleSnapshot.lineHeight,
      newWidth,
      currentPrepared,
    );

    currentPositions = result.positions;

    // Update skeleton geometry on resize
    if (result.positions.length > 0) {
      const lineCount =
        result.positions[result.positions.length - 1].lineIndex + 1;
      layoutLineCount = lineCount;
      const lastLineChars = result.positions.filter(
        (p) => p.lineIndex === lineCount - 1,
      );
      const lastLineWidth = lastLineChars.reduce((sum, p) => sum + p.width, 0);
      layoutLastLineRatio =
        newWidth > 0 ? Math.min(lastLineWidth / newWidth, 1) : 0.7;
    }

    // Only re-render DOM if not in loading state
    if (!loading) {
      renderer?.rerender(result.positions);
      if (renderer) applyStyleSpans(renderer, styleSpans);
    }
  }

  // ── Mount / update / unmount ─────────────────────────────────
  $effect(() => {
    const el = rootEl;
    if (!el) return;

    // Run layout on mount and whenever text, style inputs, or reveal marks change
    // Access reactive deps explicitly to track them
    const _text = text;
    const _font = styleSnapshot.font;
    const _lh = styleSnapshot.lineHeight;
    const _density = styleSnapshot.density;
    const _scale = styleSnapshot.scale;
    const _marks = revealMarks;

    pretextLayout.invalidate();
    runLayout(el);

    // Set up ResizeObserver
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(el);

    return () => {
      resizeObserver?.disconnect();
      resizeObserver = null;
      timeline?.abort();
      timeline = null;
      renderer?.destroy();
      renderer = null;
      currentPrepared = null;
      currentPositions = [];
    };
  });
</script>

<svelte:element
  this={as}
  bind:this={rootEl}
  class="kinetic-text {className}"
  style={inlineVars}
  data-kinetic-text
  data-reveal-mode={revealMode}
  data-reveal-style={resolvedRevealStyle}
  data-stagger-pattern={staggerPattern}
  data-effect={activeEffect ?? undefined}
  data-physics={styleSnapshot.physics}
  data-mode={styleSnapshot.mode}
  data-reduced-motion={reducedMotion}
  data-cues={cueCount > 0 ? cueCount : undefined}
  data-seed={seed !== undefined ? String(seed) : undefined}
  oncopy={handleCopy}
>
  {#if skeletonState !== 'hidden'}
    <span class="kt-skeleton-layer" data-kt-skeleton={skeletonState}>
      {#each Array(effectiveSkeletonLines) as _, i}
        <span
          class="kt-skeleton-line"
          style:height="{styleSnapshot.lineHeight}px"
          style:width={i === effectiveSkeletonLines - 1
            ? `${effectiveLastLineWidth * 100}%`
            : '100%'}
        ></span>
      {/each}
    </span>
  {/if}
  <!-- Visual layer (kt-visual) and semantic layer (kt-semantic) are created by CharacterRenderer -->
</svelte:element>
