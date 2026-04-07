<script lang="ts">
  import type { FogLayerProps, FogDrift } from '../types';

  let {
    intensity = 0.5,
    enabled = true,
    reducedMotion = 'respect',
    drift = 'slow',
    opacity = 0.5,
    class: className = '',
  }: FogLayerProps = $props();

  // Drift speed presets — duration ranges in seconds for the horizontal sweep.
  // 'still' uses 'slow' as a placeholder duration; the SCSS pauses animation when drift='still'.
  const DRIFT_RANGES: Record<FogDrift, [number, number]> = {
    still: [80, 120],
    slow: [80, 120],
    fast: [30, 50],
  };

  // Fixed blob count — fog is a small set of large overlapping volumes,
  // not a particle field. Five gives enough variation without overdraw.
  const BLOB_COUNT = 5;

  const safeIntensity = $derived(Math.max(0, Math.min(1, intensity)));
  const safeOpacity = $derived(Math.max(0, Math.min(1, opacity)));

  /**
   * Per-blob style snapshot. Re-derived whenever `drift` changes so speed
   * tweaks regenerate the field. Randomness is deterministic per render —
   * Svelte's `{#each}` keys keep nodes stable.
   */
  const blobs = $derived.by(() => {
    const [minDur, maxDur] = DRIFT_RANGES[drift];
    return Array.from({ length: BLOB_COUNT }, (_, i) => {
      const x = -20 + Math.random() * 60; // start off-left so drift covers screen
      const y = Math.random() * 100; // vh — vertical position anywhere on viewport
      const width = 60 + Math.random() * 60; // vw
      const height = 30 + Math.random() * 40; // vh
      const duration = minDur + Math.random() * (maxDur - minDur);
      const delay = -Math.random() * duration; // negative => mid-drift on mount
      const pulseDuration = 8 + Math.random() * 10; // breathing pulse
      const pulseDelay = -Math.random() * pulseDuration;
      const blobOpacity = 0.4 + Math.random() * 0.6;
      return {
        i,
        x,
        y,
        width,
        height,
        duration,
        delay,
        pulseDuration,
        pulseDelay,
        blobOpacity,
      };
    });
  });
</script>

{#if enabled}
  <div
    class="ambient-layer ambient-fog {className}"
    aria-hidden="true"
    data-reduced-motion={reducedMotion}
    data-drift={drift}
    style="--ambient-intensity: {safeIntensity}; --fog-opacity: {safeOpacity};"
  >
    {#each blobs as blob (blob.i)}
      <span
        class="ambient-fog__blob"
        style="
          --x: {blob.x}vw;
          --y: {blob.y}vh;
          --w: {blob.width}vw;
          --h: {blob.height}vh;
          --duration: {blob.duration}s;
          --delay: {blob.delay}s;
          --pulse-duration: {blob.pulseDuration}s;
          --pulse-delay: {blob.pulseDelay}s;
          --blob-opacity: {blob.blobOpacity};
        "
      ></span>
    {/each}
  </div>
{/if}
