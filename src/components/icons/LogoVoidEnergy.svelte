<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();

  // 6 curved shutter blades arranged radially around (128, 128).
  // Outer arc R=110 (40° span), inner arc R=48 (40° span, twisted +28°).
  // Outer blades cover 240° / 360°, leaving 120° of canvas visible between them
  // — the spiral channels that read as a vortex rather than a solid disc.
  // Trailing edge curves toward center, leading edge curves outward —
  // gives each blade a comma-like swirl character.
  const BLADE =
    'M 231.37 90.38 A 110 110 0 0 1 231.37 165.62 Q 190.46 161.80 160.12 163.67 A 48 48 0 0 0 175.53 134.68 Q 209.33 111.32 231.37 90.38 Z';
  const ANGLES = [0, 60, 120, 180, 240, 300];
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
