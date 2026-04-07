<script lang="ts">
  import type {
    AtmosphereLayer,
    AtmosphereLayerProps,
    AmbientIntensity,
  } from '../types';
  import { ATMOSPHERE_PARAMS } from '../core/effects/params';
  import { startDecay } from '../core/runtime/decay';

  let {
    variant,
    intensity = 2,
    decayMs,
    enabled = true,
    reducedMotion = 'respect',
    onComplete,
    class: className = '',
  }: AtmosphereLayerProps = $props();

  // Live decay level — starts at `intensity`, steps down to 0.
  let level = $state<0 | 1 | 2 | 3>(2);

  // Re-sync if the consumer changes `intensity` or `variant` prop.
  $effect(() => {
    level = intensity;
  });

  $effect(() => {
    const ms = decayMs ?? ATMOSPHERE_PARAMS[variant].decayMs;
    const handle = startDecay(
      intensity,
      ms,
      (next) => (level = next),
      onComplete,
    );
    return () => handle.stop();
  });

  const count = $derived(
    level > 0 ? ATMOSPHERE_PARAMS[variant].counts[level - 1] : 0,
  );

  // Particle-field variants (rain/snow/ash) share an x-y scatter model.
  // Volumetric variants (fog/underwater/heat) share a blob-drift model.
  const isParticleField = $derived(
    variant === 'rain' || variant === 'snow' || variant === 'ash',
  );

  const particles = $derived.by(() => {
    if (!isParticleField || level === 0) return [];
    return Array.from({ length: count }, (_, i) => {
      const x = Math.random() * 100;
      const size = 0.4 + Math.random() * 1.2;
      const length = 0.8 + Math.random() * 1.6;
      const opacity = 0.4 + Math.random() * 0.6;
      // Per-variant fall duration
      const duration =
        variant === 'rain'
          ? 0.5 + Math.random() * 0.9
          : variant === 'snow'
            ? 8 + Math.random() * 14
            : 10 + Math.random() * 16; // ash: slow drift
      const delay = -Math.random() * duration;
      const drift = (Math.random() * 2 - 1) * 12; // vw
      return { i, x, size, length, duration, delay, drift, opacity };
    });
  });

  const blobs = $derived.by(() => {
    if (isParticleField || level === 0) return [];
    return Array.from({ length: count }, (_, i) => {
      const x = -20 + Math.random() * 60;
      const y = Math.random() * 100;
      const width = 60 + Math.random() * 60;
      const height = 30 + Math.random() * 40;
      const duration =
        variant === 'heat' ? 20 + Math.random() * 20 : 80 + Math.random() * 40;
      const delay = -Math.random() * duration;
      const pulseDuration = 8 + Math.random() * 10;
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

{#if enabled && level > 0}
  <div
    class="ambient-layer ambient-atmosphere ambient-{variant} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    style="--ambient-level: {level};"
  >
    {#if isParticleField}
      {#each particles as p (p.i)}
        <span
          class="ambient-atmosphere__particle"
          style="
            --x: {p.x}%;
            --size: {p.size}rem;
            --length: {p.length}rem;
            --duration: {p.duration}s;
            --delay: {p.delay}s;
            --drift: {p.drift}vw;
            --p-opacity: {p.opacity};
          "
        ></span>
      {/each}
    {:else}
      {#each blobs as b (b.i)}
        <span
          class="ambient-atmosphere__blob"
          style="
            --x: {b.x}vw;
            --y: {b.y}vh;
            --w: {b.width}vw;
            --h: {b.height}vh;
            --duration: {b.duration}s;
            --delay: {b.delay}s;
            --pulse-duration: {b.pulseDuration}s;
            --pulse-delay: {b.pulseDelay}s;
            --b-opacity: {b.blobOpacity};
          "
        ></span>
      {/each}
    {/if}
  </div>
{/if}
