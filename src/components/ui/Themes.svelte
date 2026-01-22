<script lang="ts">
  import { voidEngine } from '../../adapters/void-engine.svelte';
  import { modal } from '../../lib/modal-manager.svelte';
  import Sun from '../icons/Sun.svelte';
  import Moon from '../icons/Moon.svelte';

  let {
    icon = false,
    className = '',
  }: {
    icon?: boolean;
    className?: string;
  } = $props();
</script>

<button class={className} class:btn-icon={icon} onclick={() => modal.themes()}>
  {#if voidEngine.currentTheme.mode === 'dark'}
    <Moon />
  {:else}
    <Sun />
  {/if}
  {#if !icon}
    Theme:
    {voidEngine.atmosphere.charAt(0).toUpperCase() +
      voidEngine.atmosphere.slice(1)}
  {/if}
</button>
