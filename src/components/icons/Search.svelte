<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  class="icon {className ?? ''}"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-linecap="round"
  fill="none"
  {...rest}
>
  <circle fill="none" cx="-20" cy="-20" r="70" stroke-width="15" />
  <line x1="34" y1="34" x2="85" y2="80" stroke-width="25" />
</svg>

<style>
  :global(svg[data-state='active']) {
    transform: rotate(90deg);
  }
</style>
