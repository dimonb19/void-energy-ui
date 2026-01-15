<script lang="ts">
  import { voidEngine } from '../../adapters/void-engine.svelte';
  import { modal } from '../../lib/modal-manager.svelte';
</script>

<section class="surface-sunk p-md flex flex-col gap-sm">
  <h5 class="text-primary pb-xs flex gap-xs justify-center items-center">
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
    Atmosphere
  </h5>
  <div class="grid grid-cols-4 items-center gap-sm">
    <span class="text-right">Theme:</span>
    <strong class="surface-glass text-center uppercase py-xs px-sm col-span-3">
      {voidEngine.atmosphere}
      <span class="text-mute text-caption pl-xs"
        >({voidEngine.currentTheme.tagline})</span
      >
    </strong>
  </div>
  <div class="grid grid-cols-4 items-center gap-sm">
    <span class="text-right">Mode:</span>
    <strong class="surface-glass text-center uppercase py-xs px-sm col-span-3">
      {voidEngine.currentTheme.mode}
    </strong>
  </div>
  <div class="grid grid-cols-4 items-center gap-sm">
    <span class="text-right">Physics:</span>
    <strong class="surface-glass text-center uppercase py-xs px-sm col-span-3">
      {voidEngine.currentTheme.physics}
    </strong>
  </div>
  <button class="btn-system mt-sm" onclick={() => modal.themes()}>
    Customize your workspace
  </button>
</section>
