<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
  // data-muted attribute
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-linejoin="round"
  stroke-linecap="round"
  class="icon-music icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id="music-top-mask">
      <rect x="-100" y="-100" width="200" height="200" fill="white" />
    </mask>
    <mask id="music-bottom-mask">
      <rect x="100" y="-100" width="200" height="200" fill="white" />
    </mask>
    <mask id="music-crossed-mask">
      <g fill="white" stroke="white">
        <polygon points="-40 -50 85 -85 85 -55 -40 -20" stroke-width="15" />
        <line x1="-35" y1="-40" x2="-35" y2="68" stroke-width="25" />
        <line x1="80" y1="-60" x2="80" y2="44" stroke-width="25" />
        <ellipse cx="-58" cy="70" rx="35" ry="22" />
        <ellipse cx="57" cy="46" rx="35" ry="22" />
      </g>
      <line
        x1="75"
        y1="-95"
        x2="-95"
        y2="75"
        stroke="black"
        stroke-width="15"
      />
    </mask>
  </defs>

  <g mask="url(#music-top-mask)">
    <polygon points="-40 -50 85 -85 85 -55 -40 -20" stroke-width="15" />
    <line x1="-35" y1="-40" x2="-35" y2="68" stroke-width="25" />
    <line x1="80" y1="-60" x2="80" y2="44" stroke-width="25" />
    <ellipse cx="-58" cy="70" rx="35" ry="22" />
    <ellipse cx="57" cy="46" rx="35" ry="22" />
  </g>

  <g mask="url(#music-bottom-mask)">
    <g mask="url(#music-crossed-mask)">
      <polygon points="-40 -50 85 -85 85 -55 -40 -20" stroke-width="15" />
      <line x1="-35" y1="-40" x2="-35" y2="68" stroke-width="25" />
      <line x1="80" y1="-60" x2="80" y2="44" stroke-width="25" />
      <ellipse cx="-58" cy="70" rx="35" ry="22" />
      <ellipse cx="57" cy="46" rx="35" ry="22" />
    </g>
    <line x1="90" y1="-90" x2="-90" y2="90" stroke-width="15" />
  </g>
</svg>

<style lang="scss">
  svg {
    transition: opacity var(--speed-base) var(--ease-spring-snappy);

    #music-top-mask rect,
    #music-bottom-mask rect {
      transition: transform var(--speed-base) var(--ease-flow);
    }
  }

  :global(.icon-music[data-muted='true']) {
    opacity: 0.5;

    #music-top-mask rect,
    #music-bottom-mask rect {
      transform: translateX(-200px);
    }
  }
</style>
