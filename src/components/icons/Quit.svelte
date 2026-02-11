<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  class="quit-icon icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id="quit-svg-mask">
      <circle r="100" fill="white" />
      <path
        d="M 50 0 L -50 0 L 0 -50 M -50 0 L 0 50"
        fill="none"
        stroke="black"
        stroke-width="25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </mask>
  </defs>

  <circle r="100" mask="url(#quit-svg-mask)" />
</svg>

<style lang="scss">
  #quit-svg-mask path {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.quit-icon[data-state='active']) {
    transform: scale(1.1);

    #quit-svg-mask path {
      transform: scale(1.2);
    }
  }
</style>
