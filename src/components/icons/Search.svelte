<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="15"
  stroke-linecap="round"
  class="search-icon icon fill-none {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <circle cx="-20" cy="-20" r="70" />
  <line x1="34" y1="34" x2="85" y2="80" stroke-width="25" />
  <line class="zoom-in zoom-out" x1="-55" y1="-20" x2="15" y2="-20" />
  <line class="zoom-in" x1="-20" y1="-55" x2="-20" y2="15" />
</svg>

<style>
  .zoom-in {
    display: none;
  }

  .zoom-out {
    display: none;
  }

  :global(.search-icon[data-state='active']) {
    transform: rotate(90deg);
  }

  :global(.search-icon[data-zoom="in"]) .zoom-in {
    display: block;
  }

  :global(.search-icon[data-zoom="out"]) .zoom-out {
    display: block;
  }
</style>
