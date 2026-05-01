<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 512"
  fill="currentColor"
  class="icon-void-energy icon {className ?? ''}"
  aria-label="Void Energy"
  {...rest}
>
  <path
    d="M42 197c10-48 39-91 82-122 61 5 119 16 174 34l32 39-207 18c-40 3-68 14-81 31Zm156-158c44-16 87-15 126 4l44 171-39-29-78-111c-16-22-32-32-53-35Zm181 30c41 28 70 66 85 112l-94 160-48 7 80-169c13-30 5-75-23-110Zm91 224c-9 48-35 90-73 119l-175-10-34-37 209-1c37 0 63-25 73-71ZM314 473c-44 16-86 14-124-5l-46-170 39 28 79 113c15 22 31 31 52 34ZM133 443c-40-27-69-65-84-110l95-162 46-7-80 169c-13 31-5 75 23 110Z"
  />
</svg>
