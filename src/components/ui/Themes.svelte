<script lang="ts">
  import { voidEngine } from '../../adapters/void-engine.svelte';
  import { modal } from '../../lib/modal-manager.svelte';

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
    <svg class="icon moon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="currentColor"
      />
    </svg>
  {:else}
    <svg class="icon sun" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="1" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="23" />
        <line x1="1" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
      </g>
    </svg>
  {/if}
  {#if !icon}
    {voidEngine.currentTheme.tagline ?? voidEngine.atmosphere}
  {/if}
</button>
