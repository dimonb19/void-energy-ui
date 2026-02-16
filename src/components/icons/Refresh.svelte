<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke="currentColor"
  fill="currentColor"
  stroke-width="20"
  stroke-linejoin="round"
  stroke-linecap="round"
  class="icon-refresh icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <g id="refresh-arrow">
    <path d="M -75 -30 A 80 80 0 0 1 75 -30" fill="none" />
    <polygon points="75 -30 75 -70 40 -40" />
  </g>
  <use href="#refresh-arrow" transform="rotate(180)" />
</svg>

<style lang="scss">
  svg {
    transition-timing-function: var(--ease-flow);
  }

  :global(.icon-refresh[data-state='active']) {
    transform: rotate(180deg);
  }

  :global([data-physics='flat'] .icon-refresh) {
    transition-duration: var(--speed-slow);
  }
</style>
