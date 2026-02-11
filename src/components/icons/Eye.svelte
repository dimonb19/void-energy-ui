<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
  // data-muted attribute
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="15"
  stroke-linejoin="round"
  stroke-linecap="round"
  class="icon-eye icon fill-none {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id="eye-top-mask">
      <rect x="-100" y="-100" width="200" height="200" fill="white" />
    </mask>
    <mask id="eye-bottom-mask">
      <rect x="100" y="-100" width="200" height="200" fill="white" />
    </mask>
    <mask id="eye-crossed-mask">
      <g stroke="white">
        <circle r="20" />
        <path d="M -80 0 Q 0 -90 80 0 Q 0 90 -80 0 Z" />
      </g>
      <line x1="55" y1="-75" x2="-95" y2="75" stroke="black" />
    </mask>
  </defs>

  <g mask="url(#eye-top-mask)">
    <circle r="20" />
    <path d="M -80 0 Q 0 -90 80 0 Q 0 90 -80 0 Z" />
  </g>

  <g mask="url(#eye-bottom-mask)">
    <g mask="url(#eye-crossed-mask)">
      <circle r="20" />
      <path d="M -80 0 Q 0 -90 80 0 Q 0 90 -80 0 Z" />
    </g>
    <line x1="75" y1="-75" x2="-75" y2="75" />
  </g>
</svg>

<style lang="scss">
  svg {
    transition: opacity var(--speed-base) var(--ease-spring-snappy);

    #eye-top-mask rect,
    #eye-bottom-mask rect {
      transition: transform var(--speed-base) var(--ease-flow);
    }
  }

  :global(.icon-eye[data-muted='true']) {
    opacity: 0.5;

    #eye-top-mask rect,
    #eye-bottom-mask rect {
      transform: translateX(-200px);
    }
  }
</style>
