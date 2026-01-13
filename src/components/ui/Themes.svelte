<script lang="ts">
  import { voidEngine } from '../../adapters/void-engine.svelte';

  // Derived list of atmospheres from engine state.
  let atmospheres = $derived(
    voidEngine.availableThemes.map((id: string) => {
      const meta = voidEngine.registry[id];

      return {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        tagline: meta.tagline,
        physics: meta.physics,
        mode: meta.mode,
      };
    }),
  );

  // Capitalize theme name for display.
  function formatThemeName(id: string): string {
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  function selectTheme(id: string) {
    voidEngine.setAtmosphere(id);
  }

  function handleRestore() {
    voidEngine.restoreUserTheme();
  }
</script>

<!-- Temporary Theme Indicator -->
{#if voidEngine.hasTemporaryTheme}
  {@const info = voidEngine.temporaryThemeInfo}
  <div
    class="temp-theme-notice surface-glass flex items-center justify-between gap-sm p-sm"
  >
    <span class="text-dim text-caption">
      {info?.label} active
    </span>
    <button class="system-btn" onclick={handleRestore}>
      Return to {formatThemeName(info?.returnTo ?? '')}
    </button>
  </div>
{/if}

<div
  class="theme-menu surface-sunk rounded-md flex flex-col tablet:grid tablet:grid-cols-2 gap-xs p-xs"
  role="radiogroup"
  aria-label="Select Theme"
>
  {#each atmospheres as atm (atm.id)}
    <div
      class="theme-wrapper p-sm rounded-sm"
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
          class="orb-wrapper relative hidden tablet:flex items-center justify-center"
          aria-hidden="true"
        >
          <span class="orb relative rounded-full"></span>
        </div>

        <span class="w-full flex flex-row items-center justify-between gap-sm">
          <span>{atm.label}</span>
          {#if atm.tagline}
            <span class="text-caption">{atm.tagline}</span>
          {/if}
        </span>
      </button>
    </div>
  {/each}
</div>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

  .temp-theme-notice {
    @include glass-float;
    margin-bottom: var(--space-sm);
  }

  .theme-menu {
    max-height: 18rem;
    overflow-y: auto;

    @include respond-up(small-desktop) {
      min-width: 40rem;
    }

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
          border: var(--physics-border-width) solid var(--border-color);

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
