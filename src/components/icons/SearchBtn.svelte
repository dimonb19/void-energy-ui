<script lang="ts">
  let {
    onclick = () => {},
    svgFocus = false,
    className = '',
  }: {
    onclick?: () => void;
    svgFocus?: boolean;
    className?: string;
  } = $props();
</script>

<button
  class="btn-icon {className}"
  {onclick}
  class:focused={svgFocus}
  aria-label="Search"
  tabindex="-1"
>
  <svg
    class="icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-100 -100 200 200"
    stroke-linecap="round"
    fill="none"
  >
    <circle fill="none" cx="-20" cy="-20" r="70" stroke-width="15" />
    <line x1="34" y1="34" x2="85" y2="80" stroke-width="25" />
  </svg>
</button>

<style>
  button.focused svg {
    transform: rotate(90deg);
  }
</style>
