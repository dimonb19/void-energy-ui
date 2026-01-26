<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { toast } from '@stores/toast.svelte';
  import { dematerialize, materialize } from '@lib/transitions.svelte';
  import { morph } from '@actions/morph';
  import {
    FONTS,
    FONT_FAMILY_TO_KEY,
    VOID_TOKENS,
  } from '@config/design-tokens';

  import Switcher from '../ui/Switcher.svelte';
  import Selector from '../ui/Selector.svelte';
  import SettingsRow from '../ui/SettingsRow.svelte';
  import Sun from '../icons/Sun.svelte';
  import Moon from '../icons/Moon.svelte';
  import Toggle from '../ui/Toggle.svelte';

  // Helper to capitalize strings (e.g., "void" → "Void")
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Helper to extract font display name from CSS font-family string
  const extractFontName = (family: string) =>
    family.match(/^'([^']+)'/)?.[1] || family;

  const modeOptions: SwitcherOption[] = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
  ];

  // Default tab to current theme's mode
  let activeMode = $state<'dark' | 'light'>(voidEngine.currentTheme.mode);

  // Filter themes by mode - only show built-in themes (not story themes)
  let filteredAtmospheres = $derived(
    voidEngine.builtInAtmospheres
      .filter((id: string) => voidEngine.registry[id]?.mode === activeMode)
      .map((id: string) => {
        const meta = voidEngine.registry[id];
        return {
          id,
          label: capitalize(id),
          tagline: meta.tagline,
          physics: meta.physics,
          mode: meta.mode,
        };
      }),
  );

  // Get current atmosphere's theme definition (single lookup, used by both font keys)
  let currentThemeDef = $derived(
    VOID_TOKENS.themes[
      voidEngine.atmosphere as keyof typeof VOID_TOKENS.themes
    ],
  );

  // Get current atmosphere's font keys for dynamic "System Default" labels
  let currentHeadingKey = $derived.by(() => {
    if (!currentThemeDef) return 'Unknown';
    const family = currentThemeDef.palette['font-atmos-heading'];
    const key = FONT_FAMILY_TO_KEY[family];
    return key ? capitalize(key) : 'Unknown';
  });

  let currentBodyKey = $derived.by(() => {
    if (!currentThemeDef) return 'Unknown';
    const family = currentThemeDef.palette['font-atmos-body'];
    const key = FONT_FAMILY_TO_KEY[family];
    return key ? capitalize(key) : 'Unknown';
  });

  // Static font options (without System Default)
  const staticFontOptions = Object.entries(FONTS).map(([key, def]) => {
    const fontName = extractFontName(def.family);
    const styleName = capitalize(key);
    return {
      label: `${styleName} (${fontName})`,
      value: def.family,
    };
  });

  // Dynamic heading font options with atmosphere-aware "System Default"
  let headingFontOptions = $derived([
    { label: `System Default (${currentHeadingKey})`, value: null },
    ...staticFontOptions,
  ]);

  // Dynamic body font options with atmosphere-aware "System Default"
  let bodyFontOptions = $derived([
    { label: `System Default (${currentBodyKey})`, value: null },
    ...staticFontOptions,
  ]);

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

  // Toggle adaptive atmosphere (persisted via voidEngine.userConfig)
  function toggleAdaptAtmosphere(value?: boolean) {
    const newValue = value ?? !voidEngine.userConfig.adaptAtmosphere;
    voidEngine.setPreferences({ adaptAtmosphere: newValue });

    if (newValue) {
      toast.show("Interface will now adapt to the story's mood.", 'success');
    } else {
      toast.show(
        'Theme locked to your preference. No further changes will occur.',
      );
    }
  }

  function selectTheme(id: string) {
    voidEngine.setAtmosphere(id);
    toast.show(`${id.toUpperCase()} theme selected`, 'success');
  }

  function handleRestore() {
    voidEngine.restoreUserTheme();
    toast.show('Returned to your preferred theme', 'success');
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

<div
  class="modal-content"
  onclick={(e) => e.stopPropagation()}
  role="presentation"
  use:morph={{ height: true, width: false }}
>
  <h2 class="text-h3 text-center">
    Atmosphere: {voidEngine.atmosphere.toUpperCase()}
  </h2>

  <div
    class="surface-sunk flex flex-col items-center justify-center gap-sm p-sm"
  >
    <p class="text-center">
      Tune how your interface looks, moves, and breathes.
    </p>

    <Switcher
      options={modeOptions}
      value={activeMode}
      onchange={(value) => (activeMode = value as 'dark' | 'light')}
    />
  </div>

  <!-- Temporary Theme Indicator -->
  {#if voidEngine.hasTemporaryTheme}
    {@const info = voidEngine.temporaryThemeInfo}
    <div
      class="surface-sunk flex flex-col items-center gap-sm p-sm"
      out:dematerialize
    >
      <h5>Story Override Active</h5>
      <p>
        <strong>{info?.label}</strong>
        is using
        <strong>{info?.id}</strong>
        atmosphere.
      </p>
      <span class="flex flex-row flex-wrap justify-center gap-sm">
        <button class="btn-system" onclick={handleRestore}>
          Return to {capitalize(info?.returnTo ?? '')}
        </button>
        <button
          class="btn-alert"
          onclick={(event) => toggleAdaptAtmosphere(false)}
        >
          Don't adapt to stories
        </button>
      </span>
    </div>
  {/if}

  <div
    class="theme-menu surface-sunk rounded-md flex flex-col tablet:grid tablet:grid-cols-2 gap-xs p-xs"
    role="radiogroup"
    aria-label="Select Theme"
  >
    {#each filteredAtmospheres as atm, i (atm.id)}
      <div
        class="theme-wrapper p-sm rounded-sm"
        data-atmosphere={atm.id}
        data-physics={atm.physics}
        data-mode={atm.mode}
        in:materialize={{ delay: i * 25 }}
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

          <span
            class="w-full flex flex-row items-center justify-between gap-sm"
          >
            <span>{atm.label}</span>
            {#if atm.tagline}
              <span class="text-caption">{atm.tagline}</span>
            {/if}
          </span>
        </button>
      </div>
    {/each}
  </div>

  <div class="flex flex-col items-center gap-xs">
    <Toggle
      bind:checked={voidEngine.userConfig.adaptAtmosphere}
      label="Adapt to story mood"
      onchange={toggleAdaptAtmosphere}
    />
    <p class="text-caption text-mute">
      (Stories can temporarily override your theme)
    </p>
  </div>

  {#if showAdvancedSettings}
    <div class="flex flex-col justify-center gap-md">
      <div in:materialize={{ delay: 0 }} out:dematerialize>
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

      <div in:materialize={{ delay: 50 }} out:dematerialize>
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

      <div in:materialize={{ delay: 100 }} out:dematerialize>
        <hr />
        <SettingsRow label="Typography">
          <div
            class="flex flex-col small-desktop:flex-row justify-center gap-sm"
          >
            <Selector
              label="Heading Font"
              options={headingFontOptions}
              value={voidEngine.userConfig.fontHeading}
              onchange={(v) => {
                voidEngine.setPreferences({ fontHeading: v || null });
                if (!v)
                  toast.show(
                    'Custom font cleared. Reverted to Atmosphere recommendation.',
                    'success',
                  );
                else
                  toast.show(
                    `Headings updated to ${extractFontName(v)}`,
                    'info',
                  );
              }}
            />
            <Selector
              label="Body Font"
              options={bodyFontOptions}
              value={voidEngine.userConfig.fontBody}
              onchange={(v) => {
                voidEngine.setPreferences({ fontBody: v || null });
                if (!v)
                  toast.show(
                    'Custom font cleared. Reverted to Atmosphere recommendation.',
                    'success',
                  );
                else
                  toast.show(
                    `Reading font updated to ${extractFontName(v)}`,
                    'info',
                  );
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
</div>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

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
