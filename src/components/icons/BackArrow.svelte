<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-80 -80 160 160"
  class="icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <path
    d="M -14 -30 L -14 -64 L -76 -9 L -14 48 L -14 12 Q 36 14 60 52 Q 60 -26 -12 -30 Z"
    stroke-width="4"
    stroke-linejoin="round"
  />
</svg>
