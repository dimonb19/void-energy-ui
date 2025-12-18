<script lang="ts">
  import { theme } from '../adapters/themes.svelte';
  import THEME_REGISTRY from '../config/void-registry.json';

  // Generate the list dynamically from the JSON keys
  const atmospheres = Object.keys(THEME_REGISTRY).map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1), // "onyx" -> "Onyx"
  }));

  function selectTheme(id: string) {
    theme.atmosphere = id;
  }
</script>

<div
  class="theme-menu surface-sunk p-xs rounded-md flex flex-col gap-xs"
  role="listbox"
>
  {#each atmospheres as atm (atm.id)}
    <button
      class="theme-option w-full flex items-center gap-sm p-xs rounded-sm text-dim text-left"
      role="option"
      aria-selected={theme.atmosphere === atm.id}
      data-atmosphere={atm.id}
      onclick={() => selectTheme(atm.id)}
    >
      <div
        class="theme-orb relative flex items-center justify-center"
        aria-hidden="true"
      >
        <div class="orb-planet absolute inset-0 rounded-full"></div>
        <div class="orb-core relative rounded-full"></div>
      </div>

      <span class="flex-1">{atm.label}</span>

      {#if theme.atmosphere === atm.id}
        <span class="text-highlight">●</span>
      {/if}
    </button>
  {/each}
</div>

<style lang="scss">
  // 1. CONTAINER LAYOUT overrides
  .theme-menu {
    max-height: 300px;
    overflow-y: auto;

    .theme-option {
      position: relative;

      .theme-orb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        // Isolate the orb's "space" from the list item background
        background: var(--bg-sink);
        overflow: hidden;

        .orb-planet {
          width: 100%;
          height: 100%;
          // Scoped: Reads the atmosphere's canvas color
          background: var(--bg-canvas);
          border: var(--physics-border-width) solid var(--border-highlight);
        }

        .orb-core {
          position: absolute;
          width: 12px;
          height: 12px;
          // Scoped: Reads the atmosphere's primary energy
          background: var(--energy-primary);
          box-shadow: 0 0 6px var(--energy-primary);
          z-index: 1;
        }
      }
    }
  }
</style>
