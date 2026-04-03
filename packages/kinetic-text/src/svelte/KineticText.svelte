<script lang="ts">
  import type {
    KineticTextProps,
    TimelineConfig,
    CharPosition,
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
    preRevealed = false,
    onrevealcomplete,
    oneffectscomplete,
    as = 'span',
    class: className = '',
  }: KineticTextProps = $props();

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
              : resolvedRevealStyle === 'random'
                ? 200
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
        revealStyle: resolvedRevealStyle,
        physics: styleSnapshot.physics,
        mode: styleSnapshot.mode,
        preRevealed,
      },
      text,
    );
    renderer.render();

    // Pre-revealed: skip timeline entirely, fire callbacks immediately
    if (preRevealed) {
      renderer.setAriaBusy(false);
      onrevealcomplete?.();
      oneffectscomplete?.();
      return;
    }

    // Create and start timeline
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
    currentPositions = result.positions;
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
  <!-- Layout, render, and reveal are driven imperatively by $effect above -->
  <!-- Visual layer (kt-visual) and semantic layer (kt-semantic) are created by CharacterRenderer -->
  <!-- RevealTimeline drives the RAF-based reveal scheduling -->
</svelte:element>
