<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="15"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon-edit icon fill-none {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <path d="M -10 -60 L -75 -60 L -75 75 L 60 75 L 60 10" />
  <path
    class="pencil"
    d="M -30 30 L -25 0 L 45 -70 M -30 30 L 0 25 L 70 -45 C  90 -60 60 -90 45 -70"
  />
</svg>

<style>
  .pencil {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.icon-edit[data-state='active'] .pencil) {
    transform: translate(-10px, 10px);
  }
</style>
