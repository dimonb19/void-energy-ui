<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="20"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="picker-icon icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <polygon points="-40 -90 -40 90 50 0" />
</svg>

<style>
  polygon {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.picker-icon[data-state="active"] polygon) {
    transform: scaleX(1.5);
  }
</style>
