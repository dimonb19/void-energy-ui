<script lang="ts">
  let { open = false }: { open?: boolean } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  class="icon"
  class:open
  data-size="2xl"
  aria-hidden="true"
  stroke-width="2"
>
  <line class="top" x1="4" y1="7" x2="20" y2="7" />
  <line class="middle" x1="4" y1="12" x2="20" y2="12" />
  <line class="bottom" x1="4" y1="17" x2="20" y2="17" />
</svg>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

  line {
    transform-origin: 12px 12px; // void-ignore
    transition:
      transform var(--speed-base) var(--ease-spring-snappy),
      opacity var(--speed-base) var(--ease-spring-snappy);
  }

  svg.open {
    .top {
      transform: translate(-4px, 3px) rotate(45deg); // void-ignore
    }

    .middle {
      opacity: 0;
    }

    .bottom {
      transform: translate(-4px, -4px) rotate(-45deg); // void-ignore
    }
  }
</style>
