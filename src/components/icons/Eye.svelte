<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { id, class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
  const componentId = $props.id();
  const defsId = `eye-defs-${componentId}`;
  const topMaskId = `${defsId}-top-mask`;
  const bottomMaskId = `${defsId}-bottom-mask`;
  const crossedMaskId = `${defsId}-crossed-mask`;
  // data-muted attribute
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke="currentColor"
  fill="none"
  stroke-width="15"
  stroke-linejoin="round"
  stroke-linecap="round"
  {id}
  class="icon-eye icon {className ?? ''}"
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
      <g stroke="white">
        <circle r="20" />
        <path d="M -80 0 Q 0 -90 80 0 Q 0 90 -80 0 Z" />
      </g>
      <line x1="55" y1="-75" x2="-95" y2="75" stroke="black" />
    </mask>
  </defs>

  <g mask={`url(#${topMaskId})`}>
    <circle r="20" />
    <path d="M -80 0 Q 0 -90 80 0 Q 0 90 -80 0 Z" />
  </g>

  <g mask={`url(#${bottomMaskId})`}>
    <g mask={`url(#${crossedMaskId})`}>
      <circle r="20" />
      <path d="M -80 0 Q 0 -90 80 0 Q 0 90 -80 0 Z" />
    </g>
    <line x1="75" y1="-75" x2="-75" y2="75" />
  </g>
</svg>

<style lang="scss">
  svg {
    transition: opacity var(--speed-base) var(--ease-spring-snappy);

    .mask-rect {
      transition: transform var(--speed-base) var(--ease-flow);
    }
  }

  :global(.icon-eye[data-muted='true'] .mask-rect) {
    transform: translateX(-200px); // void-ignore
  }
</style>
