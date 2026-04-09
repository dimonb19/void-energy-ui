<script lang="ts">
  import type { PsychologyLayerProps, AmbientLevel } from '../types';
  import { PSYCHOLOGY_PARAMS } from '../core/effects/params';
  import { startDecay } from '../core/runtime/decay';

  let {
    variant,
    intensity = 'medium',
    durationMs,
    enabled = true,
    reducedMotion = 'respect',
    onChange,
    onEnd,
    class: className = '',
  }: PsychologyLayerProps = $props();

  const uid = $props.id();
  const grainFilterId = `ambient-psy-grain-${uid}`;
  const dizzyFilterId = `ambient-psy-dizzy-${uid}`;

  let level = $state<AmbientLevel>('medium');

  $effect(() => {
    level = intensity;
    onChange?.(intensity);
  });

  $effect(() => {
    const ms = durationMs ?? PSYCHOLOGY_PARAMS[variant].durationMs;
    const handle = startDecay(
      intensity,
      ms,
      (next) => {
        level = next;
        onChange?.(next);
      },
      onEnd,
    );
    return () => handle.stop();
  });

  // Numeric mirror for SCSS calc() consumers via --ambient-level.
  const levelNum = $derived(
    level === 'off' ? 0 : level === 'light' ? 1 : level === 'medium' ? 2 : 3,
  );

  // camelCase variants → kebab-case SCSS class suffix (filmGrain → film-grain).
  const variantClass = $derived(
    variant.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
  );
</script>

{#if enabled && level !== 'off'}
  <div
    class="ambient-layer ambient-psychology ambient-{variantClass} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    style={variant === 'dizzy'
      ? `--ambient-level: ${levelNum}; backdrop-filter: url(#${dizzyFilterId}); -webkit-backdrop-filter: url(#${dizzyFilterId});`
      : `--ambient-level: ${levelNum};`}
  >
    <span class="ambient-psychology__vignette"></span>
    {#if variant === 'dizzy'}
      <svg
        class="ambient-psychology__svg ambient-psychology__svg--defs"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id={dizzyFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0022 0.0028"
            numOctaves="1"
            seed="4"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.0022 0.0028;0.0030 0.0020;0.0020 0.0030;0.0022 0.0028"
              dur="16s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="10">
            <animate
              attributeName="scale"
              values="6;14;6"
              dur="10s"
              repeatCount="indefinite"
            />
          </feDisplacementMap>
        </filter>
      </svg>
    {/if}
    {#if variant === 'filmGrain'}
      <svg
        class="ambient-psychology__svg"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id={grainFilterId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.4"
            numOctaves="2"
            seed="1"
          >
            <animate
              attributeName="baseFrequency"
              values="1.4;1.55;1.4"
              dur="6s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.6  0 0 0 0.5 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#{grainFilterId})" />
      </svg>
    {/if}
    {#if variant === 'haze' || variant === 'awe'}
      <span class="ambient-psychology__vignette ambient-psychology__vignette--b"
      ></span>
    {/if}
  </div>
{/if}
