<script lang="ts">
  import type { ActionLayerProps } from '../types';
  import { ACTION_PARAMS } from '../core/effects/params';

  let {
    variant,
    level = 'medium',
    enabled = true,
    reducedMotion = 'respect',
    onComplete,
    class: className = '',
  }: ActionLayerProps = $props();

  let active = $state(true);
  const uid = $props.id();
  const glitchFilterId = `ambient-glitch-${uid}`;

  // Maps 'light'|'medium'|'heavy' → 1..3 amplitude multiplier for SCSS via --ambient-level
  const levelNum = $derived(level === 'light' ? 1 : level === 'heavy' ? 3 : 2);

  const duration = $derived(ACTION_PARAMS[variant][level]);

  // RGB-split amplitude in px. Scales with level.
  const glitchAmp = $derived(levelNum * 3 + 1); // light 4, medium 7, heavy 10
  // Erratic jitter sequence for R (and mirrored for B). Final value = 0 so it settles.
  const glitchValuesR = $derived(
    `0;-${glitchAmp};${Math.round(glitchAmp * 0.6)};-${Math.round(glitchAmp * 0.9)};${Math.round(glitchAmp * 0.4)};-${Math.round(glitchAmp * 0.7)};${Math.round(glitchAmp * 0.2)};0`,
  );
  const glitchValuesB = $derived(
    `0;${glitchAmp};-${Math.round(glitchAmp * 0.6)};${Math.round(glitchAmp * 0.9)};-${Math.round(glitchAmp * 0.4)};${Math.round(glitchAmp * 0.7)};-${Math.round(glitchAmp * 0.2)};0`,
  );

  $effect(() => {
    active = true;
    const id = setTimeout(() => {
      active = false;
      onComplete?.();
    }, duration);
    return () => clearTimeout(id);
  });
</script>

{#if enabled && active}
  <div
    class="ambient-layer ambient-action ambient-{variant} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    style="--ambient-level: {levelNum}; --ambient-duration: {duration}ms; {variant ===
    'glitch'
      ? `-webkit-backdrop-filter: url(#${glitchFilterId}); backdrop-filter: url(#${glitchFilterId});`
      : ''}"
  >
    {#if variant === 'impact'}
      <span class="ambient-impact__ring"></span>
    {:else if variant === 'glitch'}
      <svg
        class="ambient-glitch__svg"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={glitchFilterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="R"
            />
            <feOffset in="R" dy="0" result="Ro">
              <animate
                attributeName="dx"
                values={glitchValuesR}
                dur="{duration}ms"
                repeatCount="1"
                fill="freeze"
              />
            </feOffset>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="G"
            />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="B"
            />
            <feOffset in="B" dy="0" result="Bo">
              <animate
                attributeName="dx"
                values={glitchValuesB}
                dur="{duration}ms"
                repeatCount="1"
                fill="freeze"
              />
            </feOffset>
            <feBlend in="Ro" in2="G" mode="screen" result="RG" />
            <feBlend in="RG" in2="Bo" mode="screen" />
          </filter>
        </defs>
      </svg>
    {/if}
  </div>
{/if}
