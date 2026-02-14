<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let {
    id = 'quit',
    class: className,
    ...rest
  }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke="currentColor"
  fill="currentColor"
  class="icon-quit icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id="{id}-mask">
      <circle r="100" fill="white" />
      <path
        class="mask-x"
        d="M 50 0 L -50 0 L 0 -50 M -50 0 L 0 50"
        fill="none"
        stroke="black"
        stroke-width="25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </mask>
  </defs>

  <circle r="100" mask="url(#{id}-mask)" />
</svg>

<style lang="scss">
  .mask-x {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.icon-quit[data-state='active']) {
    transform: scale(1.1);

    .mask-x {
      transform: scale(1.2);
    }
  }
</style>
