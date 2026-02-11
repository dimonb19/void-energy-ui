<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="15"
  stroke-linecap="round"
  class="voice-icon icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id="voice-svg-top-mask">
      <rect
        x="-100"
        y="-100"
        width="200"
        height="200"
        fill="white"
      />
    </mask>
    <mask id="voice-svg-bottom-mask">
      <rect
        x="100"
        y="-100"
        width="200"
        height="200"
        fill="white"
      />
    </mask>
    <mask id="voice-svg-crossed-out-mask">
      <g fill="white" stroke="white">
        <rect
          x="-35"
          y="-90"
          width="70"
          height="125"
          rx="100"
          ry="40"
          stroke="none"
        />
        <path d=" M -55 -10 C -60 74 60 74 55 -10" fill="none" />
        <path d="M 0 55 L 0 85 M 25 85 L -25 85" fill="none" />
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

  <g mask="url(#voice-svg-top-mask)">
    <rect
      x="-35"
      y="-90"
      width="70"
      height="125"
      rx="100"
      ry="40"
      stroke="none"
    />
    <path
      d="M -55 -10 C -60 74 60 74 55 -10"
      fill="none"
    />
    <path d="M 0 55 L 0 85 M 25 85 L -25 85" fill="none" />
  </g>

  <g mask="url(#voice-svg-bottom-mask)">
    <g mask="url(#voice-svg-crossed-out-mask)">
      <rect
        x="-35"
        y="-90"
        width="70"
        height="125"
        rx="100"
        ry="40"
        stroke="none"
      />
      <path d="M -55 -10 C -60 74 60 74 55 -10" fill="none" />
      <path d="M 0 55 L 0 85 M 25 85 L -25 85" fill="none" />
    </g>
    <line x1="85" y1="-85" x2="-85" y2="85" stroke-width="15" />
  </g>
</svg>

<style lang="scss">
  svg {
    transition: opacity var(--speed-base) var(--ease-spring-snappy);

    #voice-svg-top-mask rect,
    #voice-svg-bottom-mask rect {
      transition: transform var(--speed-base) var(--ease-flow);
    }
  }

  :global(.voice-icon[data-muted="true"]) {
    opacity: 0.5;

    #voice-svg-top-mask rect,
    #voice-svg-bottom-mask rect {
      transform: translateX(-200px);
    }
  }
</style>
