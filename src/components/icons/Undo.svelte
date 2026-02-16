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
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon-undo icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <path d="M 70 -50 A 85 85 0 1 0 85 0" fill="none" />
  <polygon points="70 -50 60 -90 30 -55" />
</svg>

<style>
  svg {
    transition-timing-function: var(--ease-flow);
  }

  :global(.icon-undo[data-state='active']) {
    transform: rotate(360deg);
  }

  :global([data-physics='flat'] .icon-undo) {
    transition-duration: var(--speed-slow);
  }
</style>
