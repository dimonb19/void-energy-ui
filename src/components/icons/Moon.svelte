<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  class="icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <path
    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
  />
</svg>
