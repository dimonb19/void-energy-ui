<script lang="ts">
  import type { PsychologyLayerProps } from '../types';
  import { PSYCHOLOGY_PARAMS } from '../core/effects/params';
  import { startDecay } from '../core/runtime/decay';

  let {
    variant,
    intensity = 2,
    decayMs,
    enabled = true,
    reducedMotion = 'respect',
    onComplete,
    class: className = '',
  }: PsychologyLayerProps = $props();

  let level = $state<0 | 1 | 2 | 3>(2);

  $effect(() => {
    level = intensity;
  });

  $effect(() => {
    const ms = decayMs ?? PSYCHOLOGY_PARAMS[variant].decayMs;
    const handle = startDecay(
      intensity,
      ms,
      (next) => (level = next),
      onComplete,
    );
    return () => handle.stop();
  });
</script>

{#if enabled && level > 0}
  <div
    class="ambient-layer ambient-psychology ambient-{variant} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    style="--ambient-level: {level};"
  >
    <span class="ambient-psychology__vignette"></span>
  </div>
{/if}
