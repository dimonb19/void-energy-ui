<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="12"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon-door-in icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id="door-in-mask">
      <rect
        x="-25"
        y="-75"
        width="100"
        height="150"
        rx="15"
        fill="none"
        stroke="white"
      />
      <line
        x1="-25"
        y1="-35"
        x2="-25"
        y2="35"
        stroke="black"
        stroke-width="14"
        stroke-linecap="square"
      />
    </mask>
  </defs>

  <path d="M -80 0 L 30 0 L 5 -25 M 30 0 L 5 25" fill="none" />
  <rect
    x="-25"
    y="-75"
    width="100"
    height="150"
    rx="15"
    mask="url(#door-in-mask)"
  />
</svg>

<style>
  path {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.icon-door-in[data-state='active'] path) {
    transform: translateX(10%);
  }
</style>
