<script lang="ts">
  import { voidEngine } from '../adapters/void-engine.svelte';

  // Reactive List derived from Engine state
  // We capitalize the ID for the label (e.g. "void" -> "Void")
  let atmospheres = $derived(
    voidEngine.availableThemes.map((id: string) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  );

  function selectTheme(id: string) {
    voidEngine.setAtmosphere(id);
  }
</script>

<div
  class="theme-menu surface-sunk p-xs rounded-md flex flex-col gap-xs"
  role="radiogroup"
  aria-label="Select Theme"
>
  {#each atmospheres as atm (atm.id)}
    <button
      class="theme-option w-full flex items-center gap-sm p-xs rounded-sm text-dim text-left"
      role="radio"
      aria-checked={voidEngine.atmosphere === atm.id}
      tabindex={voidEngine.atmosphere === atm.id ? 0 : -1}
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

      {#if voidEngine.atmosphere === atm.id}
        <span class="text-highlight">●</span>
      {/if}
    </button>
  {/each}
</div>

<style lang="scss">
  .theme-menu {
    max-height: 300px;
    overflow-y: auto;

    .theme-option {
      position: relative;
      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .theme-orb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--bg-sink);
        overflow: hidden;

        .orb-planet {
          width: 100%;
          height: 100%;
          // Reads the SPECIFIC atmosphere's color
          background: var(--bg-canvas);
          border: var(--physics-border-width) solid var(--border-highlight);
        }

        .orb-core {
          position: absolute;
          width: 12px;
          height: 12px;
          background: var(--energy-primary);
          z-index: 1;
        }
      }
    }
  }
</style>
