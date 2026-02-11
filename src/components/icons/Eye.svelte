<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="15"
  stroke-linejoin="round"
  stroke-linecap="round"
  class="eye-icon icon fill-none {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id="eye-svg-top-mask">
      <rect
        x="-100"
        y="-100"
        width="200"
        height="200"
        fill="white"
      />
    </mask>
    <mask id="eye-svg-bottom-mask">
      <rect
        x="100"
        y="-100"
        width="200"
        height="200"
        fill="white"
      />
    </mask>
    <mask id="eye-svg-crossed-out-mask">
      <g stroke="white">
        <circle r="20" />
        <path
          d="M -80 0 Q 0 -90 80 0 Q 0 90 -80 0 Z"
        />
      </g>
      <line x1="55" y1="-75" x2="-95" y2="75" stroke="black" />
    </mask>
  </defs>

  <g mask="url(#eye-svg-top-mask)">
    <circle r="20" />
    <path
      d="M -80 0 Q 0 -90 80 0 Q 0 90 -80 0 Z"
    />
  </g>

  <g mask="url(#eye-svg-bottom-mask)">
    <g mask="url(#eye-svg-crossed-out-mask)">
      <circle r="20" />
      <path
        d="M -80 0 Q 0 -90 80 0 Q 0 90 -80 0 Z"
      />
    </g>
    <line x1="75" y1="-75" x2="-75" y2="75" />
  </g>
</svg>

<style>
  svg {
    transition: opacity var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.eye-icon) {
    #eye-svg-top-mask rect,
    #eye-svg-bottom-mask rect {
      transition: transform var(--speed-base) var(--ease-flow);
    }
  }

  :global(.eye-icon[data-muted="true"]) {
    opacity: 0.5;

    #eye-svg-top-mask rect,
    #eye-svg-bottom-mask rect {
      transform: translateX(-200px);
    }
  }
</style>
