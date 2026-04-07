<script lang="ts">
  import type { RainLayerProps, RainDensity } from '../types';

  let {
    intensity = 0.5,
    enabled = true,
    reducedMotion = 'respect',
    angle = 15,
    density = 'medium',
    class: className = '',
  }: RainLayerProps = $props();

  // Drop count per density preset. Tuned for ~60fps on a mid-tier laptop.
  const COUNTS: Record<RainDensity, number> = {
    light: 60,
    medium: 140,
    heavy: 260,
  };

  const count = $derived(COUNTS[density]);
  const safeIntensity = $derived(Math.max(0, Math.min(1, intensity)));
  const safeAngle = $derived(Math.max(-45, Math.min(45, angle)));

  /**
   * Per-drop style snapshot. Re-derived whenever `count` changes so density
   * tweaks regenerate the field instead of leaving stale particles. Randomness
   * is deterministic per render — Svelte's `{#each}` keys keep nodes stable.
   */
  const drops = $derived(
    Array.from({ length: count }, (_, i) => {
      // Spread x past the viewport so angled rain still covers the edges.
      const x = -10 + Math.random() * 120;
      const length = 0.8 + Math.random() * 1.6; // rem
      const duration = 0.5 + Math.random() * 0.9; // seconds — rain falls fast
      const delay = -Math.random() * duration;
      const opacity = 0.3 + Math.random() * 0.5;
      return { i, x, length, duration, delay, opacity };
    }),
  );
</script>

{#if enabled}
  <div
    class="ambient-layer ambient-rain {className}"
    aria-hidden="true"
    data-reduced-motion={reducedMotion}
    style="--ambient-intensity: {safeIntensity}; --rain-angle: {safeAngle}deg;"
  >
    {#each drops as drop (drop.i)}
      <span
        class="ambient-rain__drop"
        style="
          --x: {drop.x}%;
          --length: {drop.length}rem;
          --duration: {drop.duration}s;
          --delay: {drop.delay}s;
          --drop-opacity: {drop.opacity};
        "
      ></span>
    {/each}
  </div>
{/if}
