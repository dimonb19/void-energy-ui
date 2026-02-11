<script lang="ts">
  let {
    state,
    onclick = () => {},
    disabled = false,
    text = '',
    cta = false,
    voidBtn = false,
    class: className = '',
  }: {
    state: 'inside' | 'outside';
    onclick: () => void | Promise<void>;
    disabled?: boolean;
    text: string;
    cta?: boolean;
    voidBtn?: boolean;
    class?: string;
  } = $props();
</script>

<button
  class="flex flex-row gap-xs {className}"
  class:cta
  class:btn-void={voidBtn}
  type="button"
  {onclick}
  {disabled}
>
  {#if state === 'outside'}
    <svg
      class="icon-door-outside icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-100 -100 200 200"
      fill="none"
      stroke-width="12"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <defs>
        <mask id="btn-door-out-mask">
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

      <path
        d="
          M 30 0
          L -80 0
          L -55 -25
          M -80 0
          L -55 25
        "
        fill="none"
      />
      <rect
        x="-25"
        y="-75"
        width="100"
        height="150"
        rx="15"
        mask="url(#btn-door-out-mask)"
      />
    </svg>
  {:else if state === 'inside'}
    <svg
      class="icon-door-inside icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-100 -100 200 200"
      fill="none"
      stroke="#dedede"
      stroke-width="12"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <defs>
        <mask id="btn-door-in-mask">
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

      <path
        d="
          M -80 0
          L 30 0
          L 5 -25
          M 30 0
          L 5 25
        "
        fill="none"
      />
      <rect
        x="-25"
        y="-75"
        width="100"
        height="150"
        rx="15"
        mask="url(#btn-door-in-mask)"
      />
    </svg>
  {/if}
  {text}
</button>

<style lang="scss">
  button {
    svg path {
      transition: transform var(--speed-base) var(--ease-spring-snappy);
    }

    &:hover,
    &:active,
    &:focus-visible {
      .icon-door-outside path {
        transform: translateX(-7.5%);
      }

      .icon-door-inside path {
        transform: translateX(10%);
      }
    }
  }
</style>
