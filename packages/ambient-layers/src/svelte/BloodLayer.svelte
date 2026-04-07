<script lang="ts">
  import type { BloodLayerProps } from '../types';

  let {
    intensity = 0.5,
    enabled = true,
    reducedMotion = 'respect',
    pulse = true,
    dripRate = 12,
    class: className = '',
  }: BloodLayerProps = $props();

  const safeIntensity = $derived(Math.max(0, Math.min(1, intensity)));
  const safeDripRate = $derived(Math.max(0, Math.min(60, dripRate)));

  // Average drip fall duration in seconds; paired with safeDripRate to derive
  // the on-screen count such that a given drips/minute roughly holds.
  const AVG_DRIP_DURATION = 8;

  const dripCount = $derived(
    Math.min(40, Math.round((safeDripRate * AVG_DRIP_DURATION) / 60)),
  );

  /**
   * Per-drip style snapshot. Blood drips are thicker and slower than rain, with
   * bigger length variation and a small accumulation bulb rendered via ::after
   * in the stylesheet. Randomness is deterministic per render — Svelte's
   * `{#each}` keys keep nodes stable.
   */
  const drips = $derived(
    Array.from({ length: dripCount }, (_, i) => {
      const x = Math.random() * 100;
      const length = 2 + Math.random() * 4; // rem — thicker, longer than rain
      const duration = 6 + Math.random() * 6; // seconds — slower fall
      const delay = -Math.random() * duration;
      const opacity = 0.5 + Math.random() * 0.5;
      return { i, x, length, duration, delay, opacity };
    }),
  );
</script>

{#if enabled}
  <div
    class="ambient-layer ambient-blood {className}"
    aria-hidden="true"
    data-reduced-motion={reducedMotion}
    style="--ambient-intensity: {safeIntensity};"
  >
    {#if pulse}
      <span class="ambient-blood__vignette"></span>
    {/if}
    {#each drips as drip (drip.i)}
      <span
        class="ambient-blood__drip"
        style="
          --x: {drip.x}%;
          --length: {drip.length}rem;
          --duration: {drip.duration}s;
          --delay: {drip.delay}s;
          --drip-opacity: {drip.opacity};
        "
      ></span>
    {/each}
  </div>
{/if}
