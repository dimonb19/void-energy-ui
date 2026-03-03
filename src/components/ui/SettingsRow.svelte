<script lang="ts">
  import type { Snippet } from 'svelte';
  import { SETTINGS_ROW_LABEL_COLUMN_WIDTH } from '@config/ui-geometry';

  interface SettingsRowProps {
    label: string;
    children: Snippet;
    class?: string;
  }

  let { label, children, class: className = '' }: SettingsRowProps = $props();

  const layoutVars = `--settings-row-label-column: ${SETTINGS_ROW_LABEL_COLUMN_WIDTH};`;
</script>

<div
  class="grid grid-cols-1 small-desktop:grid-cols-[var(--settings-row-label-column)_1fr] gap-md w-full items-start {className}"
  style={layoutVars}
>
  <h4 class="text-center small-desktop:text-left small-desktop:my-auto">
    {label}
  </h4>

  <div class="flex flex-col gap-sm w-full">
    {@render children()}
  </div>
</div>
