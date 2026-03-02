<script lang="ts">
  import type { Snippet } from 'svelte';

  interface SettingsRowProps {
    label: string;
    children: Snippet;
    class?: string;
  }

  let { label, children, class: className = '' }: SettingsRowProps = $props();
</script>

<div
  class="grid grid-cols-1 small-desktop:grid-cols-[12rem_1fr] gap-md w-full items-start {className}"
>
  <h4 class="text-center small-desktop:text-left small-desktop:my-auto">
    {label}
  </h4>

  <div class="flex flex-col gap-sm w-full">
    {@render children()}
  </div>
</div>
