<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { id, class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
  const componentId = $props.id();
  const defsId = `music-defs-${componentId}`;
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
  stroke-linejoin="round"
  stroke-linecap="round"
  {id}
  class="icon-music icon {className ?? ''}"
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

  <g mask={`url(#${topMaskId})`}>
    <polygon points="-40 -50 85 -85 85 -55 -40 -20" stroke-width="15" />
    <line x1="-35" y1="-40" x2="-35" y2="68" stroke-width="25" />
    <line x1="80" y1="-60" x2="80" y2="44" stroke-width="25" />
    <ellipse cx="-58" cy="70" rx="35" ry="22" />
    <ellipse cx="57" cy="46" rx="35" ry="22" />
  </g>

  <g mask={`url(#${bottomMaskId})`}>
    <g mask={`url(#${crossedMaskId})`}>
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

    .mask-rect {
      transition: transform var(--speed-base) var(--ease-flow);
    }
  }

  :global(.icon-music[data-muted='true'] .mask-rect) {
    transform: translateX(-200px); // void-ignore
  }
</style>
