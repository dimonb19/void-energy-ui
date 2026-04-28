<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<!--
  Icon represents the ACTION the click will perform, not the current state.
  - data-paused="false" (playing) → pause bars (click to pause)
  - data-paused="true" or absent (paused / static trigger) → play triangle (click to play)
-->
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke="currentColor"
  fill="currentColor"
  stroke-width="15"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon-play-pause icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <!-- Play triangle — visible when paused or no state set (click to play) -->
  <polygon class="play-shape" points="-26 -36 -26 36 36 0" />
  <!-- Pause bars — visible when playing (click to pause) -->
  <line class="pause-shape" x1="-20" y1="-30" x2="-20" y2="30" />
  <line class="pause-shape" x1="20" y1="-30" x2="20" y2="30" />
  <!-- Shared circle ring -->
  <circle r="90" fill="none" />
</svg>

<style lang="scss">
  .play-shape,
  .pause-shape {
    transition:
      opacity var(--speed-base) var(--ease-spring-snappy),
      transform var(--speed-base) var(--ease-spring-snappy);
  }

  /* Default (no attribute or data-paused='true'): play visible, pause hidden */
  .play-shape {
    opacity: 1;
  }

  .pause-shape {
    opacity: 0;
    transform: scaleY(0.6);
  }

  /* Playing: pause visible, play hidden */
  :global(.icon-play-pause[data-paused='false']) {
    .play-shape {
      opacity: 0;
      transform: scale(0.6);
    }

    .pause-shape {
      opacity: 1;
      transform: scaleY(1);
    }
  }

  /* Hover animation — scale up the currently visible shape */
  circle {
    transition:
      r var(--speed-base) var(--ease-spring-snappy),
      opacity var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.icon-play-pause[data-state='active']) {
    .play-shape {
      transform: scale(1.5);
    }

    .pause-shape {
      transform: scaleY(1.5);
    }

    circle {
      r: 45;
      opacity: 0;
    }
  }

  /* Hover while playing — play shape stays hidden, pause bars scale up */
  :global(.icon-play-pause[data-paused='false'][data-state='active']) {
    .play-shape {
      opacity: 0;
      transform: scale(0.6);
    }

    .pause-shape {
      opacity: 1;
      transform: scaleY(1.5);
    }
  }
</style>
