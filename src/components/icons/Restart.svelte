<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
  // aria-disabled attribute
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke-width="20"
  stroke-linejoin="round"
  stroke-linecap="round"
  class="restart-icon icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <g>
    <path d="M -70 -40 A 80 80 0 1 1 -50 50" fill="none" />
    <polygon points="-70 -40 -70 -80 -30 -50" />
  </g>
  <line x1="0" y1="-5" x2="0" y2="-50" />
  <line x1="2.5" y1="-2.5" x2="20" y2="10" />
</svg>

<style lang="scss">
  g {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  line {
    transition: transform var(--speed-base) var(--ease-flow);
  }

  :global(.restart-icon[data-state='active']) {
    &:not([aria-disabled='true']) {
      g {
        transform: rotate(-15deg);
      }

      line {
        &:first-of-type {
          transform: rotate(-360deg);
        }

        &:last-of-type {
          transform: rotate(-30deg);
        }
      }
    }
  }
</style>
