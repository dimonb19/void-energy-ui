<script lang="ts">
  import type { EnvironmentLayerProps, AmbientLevel } from '../types';

  let {
    variant,
    intensity = 'medium',
    enabled = true,
    reducedMotion = 'respect',
    onChange,
    class: className = '',
  }: EnvironmentLayerProps = $props();

  // Numeric mirror for SCSS calc() consumers via --ambient-level (1..3),
  // and a 0..1 tint multiplier for opacity-based blocks.
  const levelNum = $derived(
    intensity === 'light' ? 1 : intensity === 'heavy' ? 3 : 2,
  );
  const tint = $derived(levelNum / 3);

  $effect(() => {
    onChange?.(intensity as AmbientLevel);
  });
</script>

{#if enabled}
  <div
    class="ambient-layer ambient-environment ambient-{variant} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    style="--ambient-level: {levelNum}; --ambient-env-level: {tint};"
  ></div>
{/if}
