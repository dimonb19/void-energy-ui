<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  class="spin-loader icon fill-none {className ?? ''}"
  viewBox="0 0 24 24"
  aria-hidden="true"
  {...rest}
>
  <circle class="track" cx="12" cy="12" r="10" />
  <circle class="car" cx="12" cy="12" r="10" />
</svg>
