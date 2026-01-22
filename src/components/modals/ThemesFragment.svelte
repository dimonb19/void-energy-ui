<script lang="ts">
  import { modal } from '../../lib/modal-manager.svelte';
  import { voidEngine } from '../../adapters/void-engine.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { dematerialize, materialize } from '../../lib/transitions.svelte';

  import Switcher from '../ui/Switcher.svelte';
  import Selector from '../ui/Selector.svelte';
  import SettingsRow from '../ui/SettingsRow.svelte';
  import Sun from '../icons/Sun.svelte';
  import Moon from '../icons/Moon.svelte';

  const modeOptions: SwitcherOption[] = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
  ];

  // Default tab to current theme's mode
  let activeMode = $state<'dark' | 'light'>(voidEngine.currentTheme.mode);

  // Filter themes by mode - registry order is the source of truth
  let filteredAtmospheres = $derived(
    voidEngine.availableAtmospheres
      .filter((id: string) => voidEngine.registry[id]?.mode === activeMode)
      .map((id: string) => {
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

  // UI options for selectors and toggles.
  const fontOptions = [
    { label: 'System Default (Atmosphere)', value: null },
    { label: 'Hanken Grotesk (Tech)', value: "'Hanken Grotesk', sans-serif" },
    { label: 'Inter (Clean)', value: "'Inter', sans-serif" },
    { label: 'Courier Prime (Code)', value: "'Courier Prime', monospace" },
    { label: 'Lora (Serif)', value: "'Lora', serif" },
    { label: 'Open Sans (Standard)', value: "'Open Sans', sans-serif" },
    { label: 'Comic Neue (Casual)', value: "'Comic Neue', sans-serif" },
  ];

  const scaleLevels = [
    { label: 'XS', value: 0.85, name: 'Minimal' },
    { label: 'S', value: 0.925, name: 'Compact' },
    { label: 'M', value: 1.0, name: 'Standard' },
    { label: 'L', value: 1.125, name: 'Large' },
    { label: 'XL', value: 1.25, name: 'Extra' },
  ];

  const densityOptions = [
    { value: 'high', label: 'Compact', icon: '|||' },
    { value: 'standard', label: 'Standard', icon: '||' },
    { value: 'low', label: 'Relaxed', icon: '|' },
  ];

  // Derived selection based on engine scale.
  let activeScaleStep = $derived(
    scaleLevels.reduce((prev, curr) =>
      Math.abs(curr.value - voidEngine.userConfig.scale) <
      Math.abs(prev.value - voidEngine.userConfig.scale)
        ? curr
        : prev,
    ),
  );

  // Advanced settings toggle.
  let showAdvancedSettings = $state<boolean>(false);

  // Adaptive Atmosphere toggle.
  let adaptAtmosphere = $state<boolean>(true);
  const handleAdaptAtmosphereChange = () => {
    if (adaptAtmosphere) {
      toast.show("Interface will now adapt to the story's mood.", 'success');
    } else {
      toast.show(
        'Theme locked to your preference. No further changes will occur.',
      );
    }
  };

  // Capitalize theme name for display.
  function formatThemeName(id: string): string {
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  function selectTheme(id: string) {
    voidEngine.setAtmosphere(id);
    toast.show(`${id.toUpperCase()} theme selected`, 'success');
  }

  function handleRestore() {
    voidEngine.restoreUserTheme();
  }

  // Engine update helpers.
  function setScale(value: number) {
    voidEngine.setPreferences({ scale: value });
    toast.show(`${value * 100}% scale applied`);
  }

  function setDensity(d: 'high' | 'standard' | 'low') {
    voidEngine.setPreferences({ density: d });
    toast.show(`${d.toUpperCase()} density applied`);
  }
</script>

<h2 class="text-h3 text-center">
  Atmosphere: {voidEngine.atmosphere.toUpperCase()}
</h2>

<span
  class="surface-sunk flex flex-col items-center justify-center gap-sm p-sm"
>
  <p class="text-center">Tune how your interface looks, moves, and breathes.</p>

  <Switcher
    options={modeOptions}
    value={activeMode}
    onchange={(value) => (activeMode = value as 'dark' | 'light')}
  />
</span>

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
  {#each filteredAtmospheres as atm (atm.id)}
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

<div class="flex flex-row flex-wrap justify-center gap-md">
  <label
    for="platform-override-theme"
    class="flex items-center gap-xs text-small text-mute"
  >
    <input
      id="platform-override-theme"
      type="checkbox"
      bind:checked={adaptAtmosphere}
      onchange={handleAdaptAtmosphereChange}
    />
    Allow the interface to adapt its Atmosphere to match the current story's mood.
  </label>
</div>

{#if showAdvancedSettings}
  <div class="flex flex-col justify-center gap-md">
    <div in:materialize={{ delay: 0 }} out:dematerialize={{ delay: 100 }}>
      <hr />
      <SettingsRow label="Text Scale">
        <div class="surface-sunk p-sm">
          <Switcher
            options={scaleLevels}
            value={activeScaleStep.value}
            onchange={(value) => setScale(Number(value))}
          />
        </div>
      </SettingsRow>
    </div>

    <div in:materialize={{ delay: 50 }} out:dematerialize={{ delay: 50 }}>
      <hr />
      <SettingsRow label="Spacing Density">
        <div class="surface-sunk p-sm">
          <Switcher
            options={densityOptions}
            value={voidEngine.userConfig.density}
            onchange={(value) =>
              setDensity(value as 'high' | 'standard' | 'low')}
          />
        </div>
      </SettingsRow>
    </div>

    <div in:materialize={{ delay: 100 }} out:dematerialize={{ delay: 0 }}>
      <hr />
      <SettingsRow label="Typography">
        <div class="flex flex-col small-desktop:flex-row justify-center gap-sm">
          <Selector
            label="Heading Font"
            options={fontOptions}
            value={voidEngine.userConfig.fontHeading}
            onchange={(v) => {
              voidEngine.setPreferences({ fontHeading: v || null });
              if (!v)
                toast.show(
                  'Custom font cleared. Reverted to Atmosphere recommendation.',
                  'success',
                );
              else toast.show(`Headings updated to ${v}`, 'info');
            }}
          />
          <Selector
            label="Body Font"
            options={fontOptions}
            value={voidEngine.userConfig.fontBody}
            onchange={(v) => {
              voidEngine.setPreferences({ fontBody: v || null });
              if (!v)
                toast.show(
                  'Custom font cleared. Reverted to Atmosphere recommendation.',
                  'success',
                );
              else toast.show(`Reading font updated to ${v}`, 'info');
            }}
          />
        </div>
        <p class="text-center text-caption text-mute">
          Note: Changing fonts may affect the intended atmosphere of the
          selected theme.
        </p>
      </SettingsRow>
      <hr />
    </div>
  </div>
{/if}

<div class="flex justify-center gap-md">
  <button class="btn-alert" onclick={() => modal.close()}> Close </button>
  <button
    aria-pressed={showAdvancedSettings}
    onclick={() => (showAdvancedSettings = !showAdvancedSettings)}
  >
    Advanced Settings
  </button>
</div>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

  .temp-theme-notice {
    @include glass-float;
    margin-bottom: var(--space-sm);
  }

  .theme-menu {
    .theme-wrapper {
      background-color: var(--bg-canvas);
      transition: opacity var(--speed-fast) var(--ease-spring-snappy);

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
