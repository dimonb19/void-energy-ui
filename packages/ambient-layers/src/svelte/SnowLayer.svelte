<script lang="ts">
  import type { SnowLayerProps } from '../types';

  let {
    intensity = 0.5,
    enabled = true,
    reducedMotion = 'respect',
    wind = 0.3,
    flakeCount = 'medium',
    class: className = '',
  }: SnowLayerProps = $props();

  // Particle count per density preset. Tuned for ~60fps on a mid-tier laptop.
  const COUNTS: Record<NonNullable<SnowLayerProps['flakeCount']>, number> = {
    sparse: 30,
    medium: 70,
    heavy: 140,
  };

  const count = $derived(COUNTS[flakeCount]);
  const safeIntensity = $derived(Math.max(0, Math.min(1, intensity)));
  const safeWind = $derived(Math.max(0, Math.min(1, wind)));

  /**
   * Per-flake style snapshot. Re-derived whenever `count` or `safeWind` changes
   * so density / wind tweaks regenerate the field instead of leaving stale particles.
   * The randomness is deterministic per render — Svelte's `{#each}` keys keep nodes stable.
   */
  const flakes = $derived(
    Array.from({ length: count }, (_, i) => {
      const x = Math.random() * 100;
      const size = 0.4 + Math.random() * 1.2; // rem
      const duration = 8 + Math.random() * 14; // seconds
      const delay = -Math.random() * duration; // negative => mid-fall on mount
      const drift = (Math.random() * 2 - 1) * safeWind * 12; // vw horizontal drift
      const opacity = 0.4 + Math.random() * 0.6;
      return { i, x, size, duration, delay, drift, opacity };
    }),
  );
</script>

{#if enabled}
  <div
    class="ambient-layer ambient-snow {className}"
    aria-hidden="true"
    data-reduced-motion={reducedMotion}
    style="--ambient-intensity: {safeIntensity};"
  >
    {#each flakes as flake (flake.i)}
      <span
        class="ambient-snow__flake"
        style="
          --x: {flake.x}%;
          --size: {flake.size}rem;
          --duration: {flake.duration}s;
          --delay: {flake.delay}s;
          --drift: {flake.drift}vw;
          --flake-opacity: {flake.opacity};
        "
      ></span>
    {/each}
  </div>
{/if}
