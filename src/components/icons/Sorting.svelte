<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-linejoin="round"
  class="sorting-icon icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <path
    d="M -80 -95 L -80 34 L -96 34 L -72 72 L -48 34 L -64 34 L -64 -95 Z"
    stroke-width="6"
  />
  <rect x="-30" y="-98" width="130" height="20" rx="4" />
  <rect x="-30" y="-48" width="105" height="20" rx="4" />
  <rect x="-30" y="2" width="80" height="20" rx="4" />
  <rect x="-30" y="52" width="55" height="20" rx="4" />
</svg>

<style>
  path {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.sorting-icon[data-state='active']) {
    transform: scale(1.1);

    path {
      transform: scale(0.9) translateY(10%);
    }
  }
</style>
