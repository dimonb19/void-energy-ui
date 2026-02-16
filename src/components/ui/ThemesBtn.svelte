<script lang="ts">
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { modal } from '@lib/modal-manager.svelte';
  import { Sun, Moon } from '@lucide/svelte';

  let {
    class: className = '',
    icon = false,
    size = 'lg',
  }: {
    class?: string;
    icon?: boolean;
    size?: string;
  } = $props();
</script>

<button
  class={className}
  class:btn-icon={icon}
  aria-label={icon ? `Theme: ${voidEngine.atmosphere}` : undefined}
  onclick={() => modal.themes()}
>
  {#if voidEngine.currentTheme.mode === 'dark'}
    <Moon class="icon" data-size={size} />
  {:else}
    <Sun class="icon" data-size={size} />
  {/if}
  {#if !icon}
    Theme:
    {voidEngine.atmosphere.charAt(0).toUpperCase() +
      voidEngine.atmosphere.slice(1)}
  {/if}
</button>
