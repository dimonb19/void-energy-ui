<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="15"
  stroke-linejoin="round"
  stroke-linecap="round"
  class="copy-icon icon fill-none {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <path d="M 40 -67 L 40 -90 L -90 -90 L -90 60 L -52 60" fill="none" />
  <path class="copy-checkmark" d="M -10 10 L 10 40 L 50 -20" />
  <rect x="-45" y="-60" width="130" height="150" />
</svg>

<style>
  .copy-checkmark {
    opacity: 0;
    transition: opacity var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.copy-icon[data-state='active'] .copy-checkmark) {
    opacity: 1;
  }
</style>
