<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-75 -75 150 150"
  class="icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <circle cy="-25" r="30" />
  <path d="M -55 55 Q -60 20 -25 15 L 25 15 Q 60 20 55 55 Z" />
</svg>
