<script lang="ts">
  import type { EnvironmentLayerProps } from '../types';

  let {
    variant,
    enabled = true,
    reducedMotion = 'respect',
    opacity = 1,
    class: className = '',
  }: EnvironmentLayerProps = $props();
</script>

{#if enabled}
  <div
    class="ambient-layer ambient-environment ambient-{variant} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    style="--ambient-env-opacity: {opacity};"
  ></div>
{/if}
