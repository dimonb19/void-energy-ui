<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
  // data-fullscreen attribute
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="20"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="fullscreen-icon icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <g class="fullscreen-view">
    <g class="arrow">
      <line x1="0" y1="0" x2="-55" y2="-55" />
      <polygon points="-85 -32 -85 -85 -32 -85" stroke-width="12" />
    </g>
    <g transform="rotate(90)"
      ><g class="arrow">
        <line x1="0" y1="0" x2="-55" y2="-55" />
        <polygon points="-85 -32 -85 -85 -32 -85" stroke-width="12" />
      </g></g
    >
    <g transform="rotate(180)"
      ><g class="arrow">
        <line x1="0" y1="0" x2="-55" y2="-55" />
        <polygon points="-85 -32 -85 -85 -32 -85" stroke-width="12" />
      </g></g
    >
    <g transform="rotate(270)"
      ><g class="arrow">
        <line x1="0" y1="0" x2="-55" y2="-55" />
        <polygon points="-85 -32 -85 -85 -32 -85" stroke-width="12" />
      </g></g
    >
  </g>

  <g class="window-view">
    <g class="arrow">
      <line x1="-90" y1="-90" x2="-50" y2="-50" />
      <polygon
        points="-85 -32 -32 -32 -32 -85"
        stroke-width="12"
        transform="translate(10 10)"
      />
    </g>
    <g transform="rotate(90)"
      ><g class="arrow">
        <line x1="-90" y1="-90" x2="-50" y2="-50" />
        <polygon
          points="-85 -32 -32 -32 -32 -85"
          stroke-width="12"
          transform="translate(10 10)"
        />
      </g></g
    >
    <g transform="rotate(180)"
      ><g class="arrow">
        <line x1="-90" y1="-90" x2="-50" y2="-50" />
        <polygon
          points="-85 -32 -32 -32 -32 -85"
          stroke-width="12"
          transform="translate(10 10)"
        />
      </g></g
    >
    <g transform="rotate(270)"
      ><g class="arrow">
        <line x1="-90" y1="-90" x2="-50" y2="-50" />
        <polygon
          points="-85 -32 -32 -32 -32 -85"
          stroke-width="12"
          transform="translate(10 10)"
        />
      </g></g
    >
  </g>
</svg>

<style lang="scss">
  .fullscreen-view,
  .window-view {
    visibility: hidden;
    transition: visibility var(--speed-base) var(--ease-spring-flow);
  }

  .arrow {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.fullscreen-icon[data-fullscreen='true']) {
    .fullscreen-view {
      visibility: visible;
    }

    &[data-state='active'] {
      .fullscreen-view .arrow {
        transform: translate(-2.5%, -2.5%);
      }
    }
  }

  :global(.fullscreen-icon[data-fullscreen='false']) {
    .window-view {
      visibility: visible;
    }

    &[data-state='active'] {
      .window-view .arrow {
        transform: translate(2.5%, 2.5%);
      }
    }
  }
</style>
