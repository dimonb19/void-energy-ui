<script lang="ts">
  import type {
    KineticTextProps,
    TimelineConfig,
    CharPosition,
  } from '../types';
  import { PretextLayout } from '../core/layout/index';
  import { CharacterRenderer } from '../core/render/index';
  import { RevealTimeline } from '../core/timeline/index';
  import { hashSeed } from '../core/timeline/prng';
  import {
    applyContinuousEffect,
    clearContinuousEffect,
  } from '../core/effects/continuous';

  let {
    text,
    styleSnapshot,
    revealMode = 'char',
    revealStyle = 'instant',
    staggerPattern = 'sequential',
    stagger,
    revealDuration,
    activeEffect = null,
    effectScope = 'block',
    cues = [],
    seed,
    reducedMotion = 'auto',
    cursor = false,
    cursorChar = '▍',
    cursorRemoveOnComplete = true,
    speed,
    charSpeed,
    scramblePasses,
    cycle,
    onrevealcomplete,
    oneffectscomplete,
    as = 'span',
    class: className = '',
  }: KineticTextProps = $props();

  const cueCount = $derived(cues.length);

  // ── Defaults per mode ──────────────────────────────────────────
  const resolvedStagger = $derived(
    stagger ?? (revealMode === 'char' ? 40 : 30),
  );
  const resolvedSpeed = $derived(speed ?? (revealMode === 'word' ? 80 : 200));
  const resolvedCharSpeed = $derived(charSpeed ?? 8);
  const resolvedRevealDuration = $derived(revealDuration ?? 300);
  const resolvedScramblePasses = $derived(scramblePasses ?? 4);
  const resolvedSeed = $derived(seed ?? hashSeed(text + revealMode));
  const resolvedCursor = $derived(cursor ?? revealMode === 'char');

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
  let containerWidth = $state(0);
  let resizeObserver: ResizeObserver | null = null;
  let currentPositions: CharPosition[] = $state([]);
  let currentPrepared:
    | import('@chenglou/pretext').PreparedTextWithSegments
    | null = null;

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
    const scope = effectScope;
    const positions = currentPositions;
    if (!r || positions.length === 0) return;

    if (effect) {
      clearContinuousEffect(r, positions);
      applyContinuousEffect(r, effect, scope, positions);
    } else {
      clearContinuousEffect(r, positions);
    }
  });

  // ── Layout pipeline ──────────────────────────────────────────
  async function runLayout(el: HTMLElement) {
    const width = el.clientWidth;
    if (width === 0) return;
    containerWidth = width;

    // Abort previous timeline
    timeline?.abort();
    timeline = null;

    const result = await pretextLayout.computeLayout(
      text,
      styleSnapshot.font,
      styleSnapshot.lineHeight,
      width,
    );
    currentPrepared = result.prepared;
    currentPositions = result.positions;

    // Destroy previous renderer and build new DOM
    renderer?.destroy();
    renderer = new CharacterRenderer(
      el,
      result.positions,
      {
        lineHeight: styleSnapshot.lineHeight,
        revealStyle,
        physics: styleSnapshot.physics,
        mode: styleSnapshot.mode,
        cursor: resolvedCursor,
        cursorChar,
      },
      text,
    );
    renderer.render();

    // Cycle mode uses a lightweight path — skip Pretext-based timeline
    if (revealMode === 'cycle') {
      // Phase 3 does not implement cycle — it reuses the timeline clock
      // but needs a separate rendering path. Cycle support is functional
      // but limited to the timeline skeleton.
      return;
    }

    // Create and start timeline
    const config: TimelineConfig = {
      revealMode,
      revealStyle,
      staggerPattern,
      stagger: resolvedStagger,
      revealDuration: resolvedRevealDuration,
      speed: resolvedSpeed,
      charSpeed: resolvedCharSpeed,
      scramblePasses: resolvedScramblePasses,
      physics: styleSnapshot.physics,
      cursor: resolvedCursor,
      cursorRemoveOnComplete,
      seed: resolvedSeed,
      reducedMotion: isReducedMotion,
      cues,
      onrevealcomplete,
      oneffectscomplete,
    };

    timeline = new RevealTimeline(renderer, result.positions, config);
    timeline.start();
  }

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

    renderer?.rerender(result.positions);
  }

  // ── Mount / update / unmount ─────────────────────────────────
  $effect(() => {
    const el = rootEl;
    if (!el) return;

    // Run layout on mount and whenever text or style inputs change
    // Access reactive deps explicitly to track them
    const _text = text;
    const _font = styleSnapshot.font;
    const _lh = styleSnapshot.lineHeight;
    const _density = styleSnapshot.density;
    const _scale = styleSnapshot.scale;

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
  data-reveal-style={revealStyle}
  data-stagger-pattern={staggerPattern}
  data-effect={activeEffect ?? undefined}
  data-effect-scope={effectScope}
  data-physics={styleSnapshot.physics}
  data-mode={styleSnapshot.mode}
  data-reduced-motion={reducedMotion}
  data-cues={cueCount > 0 ? cueCount : undefined}
  data-seed={seed !== undefined ? String(seed) : undefined}
  data-cursor={resolvedCursor ? '' : undefined}
  oncopy={handleCopy}
>
  <!-- Layout, render, and reveal are driven imperatively by $effect above -->
  <!-- Visual layer (kt-visual) and semantic layer (kt-semantic) are created by CharacterRenderer -->
  <!-- RevealTimeline drives the RAF-based reveal scheduling -->
</svelte:element>
