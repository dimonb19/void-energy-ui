<script lang="ts">
  import { voidEngine } from '../../adapters/void-engine.svelte';

  // Reactive List derived from Engine state
  let atmospheres = $derived(
    voidEngine.availableThemes.map((id: string) => {
      const meta = voidEngine.registry[id];

      return {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        physics: meta.physics,
        mode: meta.mode,
      };
    }),
  );

  function selectTheme(id: string) {
    voidEngine.setAtmosphere(id);
  }
</script>

<div
  class="theme-menu surface-sunk rounded-md flex flex-col"
  role="radiogroup"
  aria-label="Select Theme"
>
  {#each atmospheres as atm (atm.id)}
    <div
      class="theme-wrapper p-sm"
      data-atmosphere={atm.id}
      data-physics={atm.physics}
      data-mode={atm.mode}
    >
      <button
        class="theme-option w-full flex items-center gap-sm p-xs rounded-sm text-dim text-left"
        role="radio"
        aria-checked={voidEngine.atmosphere === atm.id}
        tabindex={voidEngine.atmosphere === atm.id ? 0 : -1}
        onclick={() => selectTheme(atm.id)}
      >
        <div
          class="orb-wrapper relative flex items-center justify-center"
          aria-hidden="true"
        >
          <span class="orb relative rounded-full"></span>
        </div>

        <span class="flex-1">{atm.label}</span>

        {#if voidEngine.atmosphere === atm.id}
          <span class="text-primary">●</span>
        {/if}
      </button>
    </div>
  {/each}
</div>

<style lang="scss">
  .theme-menu {
    max-height: 22rem;
    overflow-y: auto;

    .theme-wrapper {
      background-color: var(--bg-canvas);

      .theme-option {
        position: relative;

        .orb-wrapper {
          width: var(--space-md);
          height: var(--space-md);
          border-radius: var(--radius-full);
          background: var(--bg-canvas);
          overflow: hidden;
          border: var(--physics-border-width) solid var(--border-highlight);

          .orb {
            position: absolute;
            width: calc(var(--space-md) / 2);
            height: calc(var(--space-md) / 2);
            border-radius: var(--radius-full);
            background: var(--energy-primary);
            z-index: 1;
          }
        }
      }
    }
  }
</style>
