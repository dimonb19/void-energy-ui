<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="6"
  stroke-linejoin="round"
  class="icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <path
    d="M -25 60 L -25 -15 L -95 -85 L -95 -95 L 95 -95 L 95 -85 L 25 -15 L 25 95 L 20 95 Z"
  />
</svg>
