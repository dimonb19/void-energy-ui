<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { id, class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
  const componentId = $props.id();

  const maskId = `quit-defs-${componentId}-mask`;
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke="currentColor"
  fill="currentColor"
  {id}
  class="icon-quit icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id={maskId}>
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

  <circle r="100" mask={`url(#${maskId})`} />
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
