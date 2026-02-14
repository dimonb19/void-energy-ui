<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-100 -100 200 200"
  stroke="currentColor"
  fill="none"
  stroke-width="7.5"
  stroke-linejoin="round"
  stroke-linecap="round"
  class="icon-contract icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <g class="icon-contract-paper">
    <path
      d="M -10 75 L -85 75 L -85 -85 L 45 -85 L 45 -15"
      fill="none"
      stroke-width="12"
    />
    <circle r="35" cx="-20" cy="-30" fill="none" />
    <path d="M -40 -30 L -25 -15 L 0 -40" fill="none" />
    <path d="M -65 25 L -15 25 M -65 45 L -25 45" />
  </g>
  <g class="icon-contract-hammer">
    <g transform="rotate(45) translate(40 -30)">
      <ellipse rx="35" ry="10" cx="15" cy="60" fill="none" />
      <path
        d="
          M -20 60
          L -20 35
          Q 15 20 50 35
          L 50 60
          M 0 27
          Q 10 10 0 -10
          C -15 -50 45 -50 30 -10
          Q 20 10 30 27
        "
        fill="none"
      />
    </g>
  </g>
</svg>

<style lang="scss">
  .icon-contract-paper {
    transition: opacity var(--speed-base) var(--ease-spring-snappy);
  }

  .icon-contract-hammer {
    transition: transform var(--speed-base) var(--ease-spring-snappy);
  }

  :global(.icon-contract[data-state='active']) {
    .icon-contract-paper {
      opacity: 0.75;
    }

    .icon-contract-hammer {
      transform: scale(1.1) translate(-5%, -2.5%);
    }
  }
</style>
