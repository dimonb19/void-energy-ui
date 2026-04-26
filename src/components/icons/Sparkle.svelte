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
    d="M12 4 L13.5 10.5 L20 12 L13.5 13.5 L12 20 L10.5 13.5 L4 12 L10.5 10.5 Z"
  />
  <!-- Accent: cross (top-right) -->
  <g class="sparkle-accent sparkle-accent-tr">
    <path d="M19 3v4" />
    <path d="M21 5h-4" />
  </g>
  <!-- Accent: dot (bottom-left) -->
  <circle class="sparkle-accent sparkle-accent-bl" cx="5" cy="19" r="1.5" />
</svg>

<style lang="scss">
  .sparkle-main {
    transform-origin: 12px 12px; // void-ignore (SVG coordinate)
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

  .sparkle-accent.sparkle-accent-bl {
    transform-origin: 5px 19px; // void-ignore (SVG coordinate)
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
