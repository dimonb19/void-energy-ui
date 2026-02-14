<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke="currentColor"
  fill="currentColor"
  stroke-width="15"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon-play icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <polygon points="-26 -36 -26 36 36 0" />
  <circle r="90" fill="none" />
</svg>

<style lang="scss">
  polygon {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  circle {
    transition:
      r var(--speed-base) var(--ease-spring-snappy),
      opacity var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.icon-play[data-state='active']) {
    polygon {
      transform: scale(1.5);
    }

    circle {
      r: 45;
      opacity: 0;
    }
  }
</style>
