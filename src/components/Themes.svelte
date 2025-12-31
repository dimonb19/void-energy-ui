<script lang="ts">
  import { theme } from '../adapters/themes.svelte';

  // 1. Reactive List derived from Engine state
  // We capitalize the ID for the label (e.g. "void" -> "Void")
  let atmospheres = $derived(
    theme.availableThemes.map((id: string) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  );

  function selectTheme(id: string) {
    theme.atmosphere = id;
  }

  // 2. Runtime Injection Test (The "Backend Simulator")
  function createCustomTheme() {
    const randomId = `custom-${Math.floor(Math.random() * 1000)}`;

    // This object mimics what your Backend would send
    theme.inject(randomId, {
      mode: 'dark',
      physics: 'glass', // Try 'retro' or 'flat' here too
      palette: {
        // Essential colors required by _reset.scss
        'bg-canvas': '#2a0a2a', // Deep Purple
        'bg-spotlight': '#3d0f3d',
        'bg-surface': 'rgba(60, 20, 60, 0.6)',
        'bg-sink': 'rgba(40, 10, 40, 0.8)',

        'energy-primary': '#ff00ff', // Magenta
        'energy-secondary': '#00ffff', // Cyan

        'border-highlight': 'rgba(255, 0, 255, 0.4)',
        'border-shadow': 'rgba(255, 0, 255, 0.1)',

        'text-main': '#ffffff',
        'text-dim': 'rgba(255, 255, 255, 0.8)',
        'text-mute': 'rgba(255, 255, 255, 0.5)',

        // Semantic colors
        'color-premium': '#ffd700',
        'color-system': '#ff00ff',
        'color-success': '#00ff00',
        'color-error': '#ff0000',

        // Fonts (Mapping to CSS vars)
        'font-atmos-heading': "'Courier Prime', monospace",
        'font-atmos-body': "'Inter', sans-serif",
      },
    });

    // Auto-select the new theme
    theme.atmosphere = randomId;
  }
</script>

<div
  class="theme-menu surface-sunk p-xs rounded-md flex flex-col gap-xs"
  role="listbox"
>
  {#each atmospheres as atm (atm.id)}
    <button
      class="theme-option w-full flex items-center gap-sm p-xs rounded-sm text-dim text-left"
      role="radio"
      aria-checked={theme.atmosphere === atm.id}
      tabindex={theme.atmosphere === atm.id ? 0 : -1}
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

  <button onclick={createCustomTheme}> + Inject Runtime Theme </button>
</div>

<style lang="scss">
  // ... (Styles remain identical to previous file) ...
  .theme-menu {
    max-height: 300px;
    overflow-y: auto;

    .theme-option {
      position: relative;
      transition: background-color 0.2s;

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
