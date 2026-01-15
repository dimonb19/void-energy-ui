<script lang="ts">
  import type { Snippet } from 'svelte';

  let { label, children } = $props<{
    label: string;
    children: Snippet;
  }>();
</script>

<div
  class="grid grid-cols-1 small-desktop:grid-cols-[12rem_1fr] gap-md w-full items-start"
>
  <h4 class="small-desktop:my-auto small-desktop:text-left">
    {label}
  </h4>

  <div class="flex flex-col gap-sm w-full">
    {@render children()}
  </div>
</div>
