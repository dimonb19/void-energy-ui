<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  class="icon-switch icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <mask id="switch-mask">
      <circle r="100" fill="white" />
      <g fill="black" stroke="black">
        <polygon
          points="-50 0 -5 -45 -5 45"
          stroke-width="10"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <rect x="-5" y="-18" width="56" height="36" rx="5" />
      </g>
    </mask>
  </defs>

  <circle r="100" mask="url(#switch-mask)" />
</svg>

<style>
  svg g {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.icon-switch[data-state='active']) {
    transform: scale(1.1);

    g {
      transform: scale(1.2);
    }
  }
</style>
