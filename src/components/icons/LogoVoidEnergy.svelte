<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();

  // 7 curved shutter blades arranged radially around (128, 128).
  // Outer arc R=118, inner arc R=38 — longer reach into the core tightens the
  // spiral channels and reads as a sharper vortex than the 6-blade version.
  // Trailing edge curves toward center, leading edge curves outward —
  // gives each blade a comma-like swirl character.
  const BLADE =
    'M 239.57 89.58 A 118 118 0 0 1 239.57 166.42 Q 192 173 140.37 163.93 A 38 38 0 0 0 157.53 151.91 Q 208 113 239.57 89.58 Z';
  const COUNT = 7;
  const ANGLES = Array.from({ length: COUNT }, (_, i) => (360 / COUNT) * i);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 256 256"
  fill="currentColor"
  class="icon-void-energy icon {className ?? ''}"
  aria-label="Void Energy"
  {...rest}
>
  {#each ANGLES as angle}
    <path d={BLADE} transform="rotate({angle} 128 128)" />
  {/each}
</svg>
