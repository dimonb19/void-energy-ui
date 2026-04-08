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

  // Unique id for SVG filter defs (fog/underwater/heat).
  const uid = $props.id();

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
  // SVG-filter variants (fog/underwater/heat) render inline <svg> turbulence.
  const isParticleField = $derived(
    variant === 'rain' || variant === 'snow' || variant === 'ash',
  );
  const isSvgFilter = $derived(
    variant === 'fog' || variant === 'underwater' || variant === 'heat',
  );

  const particles = $derived.by(() => {
    if (!isParticleField || level === 0) return [];
    return Array.from({ length: count }, (_, i) => {
      const x = Math.random() * 100;
      // Three depth bands (near=0, mid=1, far=2) via modulo.
      const band = (i % 3) as 0 | 1 | 2;
      // Size by band: near biggest, far smallest.
      const sizeBase = band === 0 ? 0.7 : band === 1 ? 0.5 : 0.35;
      const size = sizeBase + Math.random() * 0.4;
      const length = 0.8 + Math.random() * 1.6;
      const opacity =
        (band === 0 ? 0.7 : band === 1 ? 0.5 : 0.35) + Math.random() * 0.3;
      // Per-variant fall duration — near falls faster than far.
      const bandSpeed = band === 0 ? 0.7 : band === 1 ? 1 : 1.4;
      const duration =
        variant === 'rain'
          ? 0.5 + Math.random() * 0.9
          : variant === 'snow'
            ? (8 + Math.random() * 14) * bandSpeed
            : (10 + Math.random() * 16) * bandSpeed;
      const delay = -Math.random() * duration;
      const drift = (Math.random() * 2 - 1) * 12; // vw
      // ~10% of ash particles are embers.
      const ember = variant === 'ash' && Math.random() < 0.1;
      return {
        i,
        x,
        size,
        length,
        duration,
        delay,
        drift,
        opacity,
        band,
        ember,
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
          data-band={p.band}
          data-ember={p.ember ? 'true' : undefined}
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
    {:else if isSvgFilter && variant === 'fog'}
      <!-- Volumetric fog: vertical gradient base + two turbulence-masked banks. -->
      <span class="ambient-atmosphere__wash ambient-atmosphere__wash--a"></span>
      <svg
        class="ambient-atmosphere__svg ambient-atmosphere__svg--fog-near"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id="fog-near-{uid}"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.004 0.008"
              numOctaves="2"
              seed="3"
            >
              <animate
                attributeName="baseFrequency"
                dur="32s"
                values="0.004 0.008;0.006 0.010;0.004 0.008"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -0.15"
            />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="var(--text-main)"
          filter="url(#fog-near-{uid})"
        />
      </svg>
      <svg
        class="ambient-atmosphere__svg ambient-atmosphere__svg--fog-far"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id="fog-far-{uid}"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.010 0.014"
              numOctaves="3"
              seed="7"
            >
              <animate
                attributeName="baseFrequency"
                dur="60s"
                values="0.010 0.014;0.013 0.017;0.010 0.014"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.2"
            />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="var(--text-dim)"
          filter="url(#fog-far-{uid})"
        />
      </svg>
    {:else if isSvgFilter && variant === 'underwater'}
      <span class="ambient-atmosphere__wash ambient-atmosphere__wash--info"
      ></span>
      <span class="ambient-atmosphere__caustic"></span>
      <span class="ambient-atmosphere__caustic ambient-atmosphere__caustic--b"
      ></span>
      <svg
        class="ambient-atmosphere__svg ambient-atmosphere__svg--underwater"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="uw-{uid}" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02 0.04"
              numOctaves="2"
              seed="2"
            >
              <animate
                attributeName="baseFrequency"
                dur="14s"
                values="0.02 0.04;0.03 0.05;0.02 0.04"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="10" />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="var(--text-main)"
          filter="url(#uw-{uid})"
        />
      </svg>
    {:else if isSvgFilter && variant === 'heat'}
      <span class="ambient-atmosphere__wash ambient-atmosphere__wash--warm"
      ></span>
      <div class="ambient-atmosphere__heat-refract"></div>
      <div
        class="ambient-atmosphere__heat-refract ambient-atmosphere__heat-refract--b"
      ></div>
    {/if}
  </div>
{/if}
