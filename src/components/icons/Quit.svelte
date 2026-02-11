<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  class="icon-quit icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id="quit-mask">
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

  <circle r="100" mask="url(#quit-mask)" />
</svg>

<style lang="scss">
  #quit-mask path {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.icon-quit[data-state='active']) {
    transform: scale(1.1);

    #quit-mask path {
      transform: scale(1.2);
    }
  }
</style>
