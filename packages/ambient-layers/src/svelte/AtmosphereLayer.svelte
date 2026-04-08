<script lang="ts">
  import type { AtmosphereLayerProps, AmbientLevel } from '../types';
  import { ATMOSPHERE_PARAMS } from '../core/effects/params';
  import { startDecay } from '../core/runtime/decay';

  let {
    variant,
    intensity = 'medium',
    decayMs,
    enabled = true,
    reducedMotion = 'respect',
    onLevelChange,
    onComplete,
    class: className = '',
  }: AtmosphereLayerProps = $props();

  // Unique id for SVG filter defs (fog/underwater/heat).
  const uid = $props.id();

  // Live decay level — starts at `intensity`, steps down to 'off'.
  let level = $state<AmbientLevel>('medium');

  // Re-sync if the consumer changes `intensity` or `variant` prop.
  $effect(() => {
    level = intensity;
    onLevelChange?.(intensity);
  });

  $effect(() => {
    const ms = decayMs ?? ATMOSPHERE_PARAMS[variant].decayMs;
    const handle = startDecay(
      intensity,
      ms,
      (next) => {
        level = next;
        onLevelChange?.(next);
      },
      onComplete,
    );
    return () => handle.stop();
  });

  // Numeric mirror for SCSS calc() consumers via --ambient-level.
  const levelNum = $derived(
    level === 'off' ? 0 : level === 'light' ? 1 : level === 'medium' ? 2 : 3,
  );

  const count = $derived(
    level === 'off' ? 0 : ATMOSPHERE_PARAMS[variant].counts[level],
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
    if (!isParticleField || level === 'off') return [];
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

{#if enabled && level !== 'off'}
  <div
    class="ambient-layer ambient-atmosphere ambient-{variant} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    style="--ambient-level: {levelNum};"
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
      <svg
        class="ambient-atmosphere__svg ambient-atmosphere__svg--heat-defs"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="heat-melt-{uid}"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.022"
              numOctaves="2"
              seed="7"
            >
              <animate
                attributeName="baseFrequency"
                dur="18s"
                values="0.008 0.022;0.010 0.030;0.008 0.022"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="22">
              <animate
                attributeName="scale"
                dur="9s"
                values="18;34;18"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>
      <div
        class="ambient-atmosphere__heat-melt"
        style="--heat-filter: url(#heat-melt-{uid})"
      ></div>
      <div class="ambient-atmosphere__heat-sag"></div>
    {/if}
  </div>
{/if}
