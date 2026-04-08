<script lang="ts">
  import type { PsychologyLayerProps, AmbientLevel } from '../types';
  import { PSYCHOLOGY_PARAMS } from '../core/effects/params';
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
  }: PsychologyLayerProps = $props();

  const uid = $props.id();
  const grainFilterId = `ambient-psy-grain-${uid}`;

  let level = $state<AmbientLevel>('medium');

  $effect(() => {
    level = intensity;
    onLevelChange?.(intensity);
  });

  $effect(() => {
    const ms = decayMs ?? PSYCHOLOGY_PARAMS[variant].decayMs;
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
</script>

{#if enabled && level !== 'off'}
  <div
    class="ambient-layer ambient-psychology ambient-{variant} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    style="--ambient-level: {levelNum};"
  >
    <span class="ambient-psychology__vignette"></span>
    {#if variant === 'dizzy'}
      <span class="ambient-psychology__vignette ambient-psychology__vignette--b"
      ></span>
    {/if}
    {#if variant === 'flashback'}
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
    {#if variant === 'dreaming'}
      <span class="ambient-psychology__vignette ambient-psychology__vignette--b"
      ></span>
    {/if}
  </div>
{/if}
