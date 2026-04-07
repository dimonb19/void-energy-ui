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

  // Maps 'light'|'medium'|'heavy' → 1..3 amplitude multiplier for SCSS via --ambient-level
  const levelNum = $derived(level === 'light' ? 1 : level === 'heavy' ? 3 : 2);

  const duration = $derived(ACTION_PARAMS[variant][level]);

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
    style="--ambient-level: {levelNum}; --ambient-duration: {duration}ms;"
  ></div>
{/if}
