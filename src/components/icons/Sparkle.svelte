<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  stroke="currentColor"
  fill="none"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon-sparkle icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <!-- Main 4-point star -->
  <path
    class="sparkle-main"
    d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z"
  />
  <!-- Accent sparkle (top-right) -->
  <path
    class="sparkle-accent"
    d="M19 2 L19.75 4.25 L22 5 L19.75 5.75 L19 8 L18.25 5.75 L16 5 L18.25 4.25 Z"
  />
</svg>

<style lang="scss">
  .sparkle-main {
    transform-origin: 12px 10px; // void-ignore (SVG coordinate)
    transition:
      transform var(--speed-base) var(--ease-spring-snappy),
      opacity var(--speed-base) var(--ease-spring-snappy);
  }

  .sparkle-accent {
    transform-origin: 19px 5px; // void-ignore (SVG coordinate)
    opacity: 0.4;
    transition:
      transform var(--speed-base) var(--ease-spring-snappy),
      opacity var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.icon-sparkle[data-state='active'] .sparkle-main) {
    transform: rotate(18deg) scale(1.08);
  }

  :global(.icon-sparkle[data-state='active'] .sparkle-accent) {
    opacity: 1;
    transform: scale(1.2);
  }

  // Retro: instant transitions, no rotation
  :global([data-physics='retro'] .icon-sparkle .sparkle-main),
  :global([data-physics='retro'] .icon-sparkle .sparkle-accent) {
    transition: none;
  }

  :global(
    [data-physics='retro'] .icon-sparkle[data-state='active'] .sparkle-main
  ) {
    transform: scale(1.08);
  }
</style>
