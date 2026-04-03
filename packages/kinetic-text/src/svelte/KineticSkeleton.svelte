<script lang="ts">
  import type { KineticSkeletonProps } from '../types';

  let {
    lines = 3,
    lastLineWidth = 0.7,
    lineHeight = 24,
    styleSnapshot,
    class: className = '',
  }: KineticSkeletonProps = $props();

  const inlineVars = $derived(
    Object.entries(styleSnapshot.vars)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; '),
  );
</script>

<span
  class="kinetic-text {className}"
  style={inlineVars}
  data-physics={styleSnapshot.physics}
  data-mode={styleSnapshot.mode}
  role="presentation"
  aria-hidden="true"
>
  <span class="kt-skeleton-layer" data-kt-skeleton="visible">
    {#each Array(lines) as _, i}
      <span
        class="kt-skeleton-line"
        style:height="{lineHeight}px"
        style:width={i === lines - 1 ? `${lastLineWidth * 100}%` : '100%'}
      ></span>
    {/each}
  </span>
</span>
