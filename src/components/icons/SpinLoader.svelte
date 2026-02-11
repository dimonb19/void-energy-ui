<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  class="icon-spin-loader icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <circle class="track" cx="12" cy="12" r="10" />
  <circle class="car" cx="12" cy="12" r="10" />
</svg>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

  .icon-spin-loader {
    animation: rotate 1s linear infinite;

    .track {
      fill: none;
      stroke: var(--text-mute);
      stroke-width: calc(var(--physics-border-width) * 2);
      opacity: 0.2;
    }

    .car {
      fill: none;
      stroke: var(--text-main);
      stroke-width: calc(var(--physics-border-width) * 2);
      stroke-dasharray: 10 20;
      stroke-linecap: round;
    }
  }

  // Retro override.
  :global([data-physics='retro'] .icon-spin-loader) {
    animation-timing-function: steps(8);
  }
</style>
