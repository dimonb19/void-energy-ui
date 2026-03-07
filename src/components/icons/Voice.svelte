<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { id, class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
  const componentId = $props.id();
  const defsId = `voice-defs-${componentId}`;
  const topMaskId = `${defsId}-top-mask`;
  const bottomMaskId = `${defsId}-bottom-mask`;
  const crossedMaskId = `${defsId}-crossed-mask`;
  // data-muted attribute
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke="currentColor"
  fill="currentColor"
  stroke-width="15"
  stroke-linecap="round"
  {id}
  class="icon-voice icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id={topMaskId}>
      <rect
        class="mask-rect"
        x="-100"
        y="-100"
        width="200"
        height="200"
        fill="white"
      />
    </mask>
    <mask id={bottomMaskId}>
      <rect
        class="mask-rect"
        x="100"
        y="-100"
        width="200"
        height="200"
        fill="white"
      />
    </mask>
    <mask id={crossedMaskId}>
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

  <g mask={`url(#${topMaskId})`}>
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

  <g mask={`url(#${bottomMaskId})`}>
    <g mask={`url(#${crossedMaskId})`}>
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

    .mask-rect {
      transition: transform var(--speed-base) var(--ease-flow);
    }
  }

  :global(.icon-voice[data-muted='true'] .mask-rect) {
    transform: translateX(-200px); // void-ignore
  }
</style>
