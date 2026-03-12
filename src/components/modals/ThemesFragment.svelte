<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { toast } from '@stores/toast.svelte';
  import { dissolve, materialize } from '@lib/transitions.svelte';
  import { morph } from '@actions/morph';
  import {
    FONTS,
    FONT_FAMILY_TO_KEY,
    VOID_TOKENS,
  } from '@config/design-tokens';

  import Switcher from '../ui/Switcher.svelte';
  import SliderField from '../ui/SliderField.svelte';
  import Selector from '../ui/Selector.svelte';
  import SettingsRow from '../ui/SettingsRow.svelte';
  import { Sun, Moon, X } from '@lucide/svelte';
  import Toggle from '../ui/Toggle.svelte';

  // Helper to capitalize strings (e.g., "void" → "Void")
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Helper to extract font display name from CSS font-family string
  const extractFontName = (family: string) =>
    family.match(/^'([^']+)'/)?.[1] || family;

  const modeOptions = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
  ];

  // Default tab to current theme's mode
  let activeMode = $state<'dark' | 'light'>(voidEngine.currentTheme.mode);

  // Unified theme list: built-in first, then custom — all filtered by active mode
  let allAtmospheres = $derived([
    ...voidEngine.builtInAtmospheres
      .filter((id: string) => voidEngine.registry[id]?.mode === activeMode)
      .map((id: string) => {
        const meta = voidEngine.registry[id];
        return {
          id,
          label: meta.label ?? capitalize(id),
          tagline: meta.tagline,
          physics: meta.physics,
          mode: meta.mode,
          custom: false,
          style: undefined as string | undefined,
        };
      }),
    ...voidEngine.customAtmospheres
      .filter((id: string) => voidEngine.registry[id]?.mode === activeMode)
      .map((id: string) => {
        const meta = voidEngine.registry[id];
        const style = Object.entries(meta.palette)
          .map(([key, value]) => `--${key}: ${value}`)
          .join('; ');
        return {
          id,
          label: meta.label ?? capitalize(id),
          tagline: meta.tagline,
          physics: meta.physics,
          mode: meta.mode,
          custom: true,
          style,
        };
      }),
  ]);

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

  const densityPresets = [
    { label: 'Compact', value: 0 },
    { label: 'Standard', value: 1 },
    { label: 'Relaxed', value: 2 },
  ];
  const densityMap = ['high', 'standard', 'low'] as const;

  // Derived selection based on engine scale.
  let activeScaleStep = $derived(
    scaleLevels.reduce((prev, curr) =>
      Math.abs(curr.value - voidEngine.userConfig.scale) <
      Math.abs(prev.value - voidEngine.userConfig.scale)
        ? curr
        : prev,
    ),
  );

  let activeDensityIndex = $derived(
    densityMap.indexOf(voidEngine.userConfig.density),
  );

  let themeRefs = $state<(HTMLButtonElement | null)[]>([]);
  let selectedThemeIndex = $derived(
    allAtmospheres.findIndex((atm) => atm.id === voidEngine.atmosphere),
  );
  let focusableThemeIndex = $derived(
    selectedThemeIndex >= 0 ? selectedThemeIndex : 0,
  );

  // Toggle adaptive atmosphere (persisted via voidEngine.userConfig)
  function toggleAdaptAtmosphere(value?: boolean) {
    const newValue = value ?? !voidEngine.userConfig.adaptAtmosphere;
    voidEngine.setPreferences({ adaptAtmosphere: newValue });

    if (newValue) {
      toast.show('Theme overrides are now allowed.', 'success');
    } else {
      toast.show(
        'Theme locked to your preference. No further changes will occur.',
      );
    }
  }

  function getAtmosphereLabel(id: string): string {
    return voidEngine.registry[id]?.label ?? capitalize(id);
  }

  function selectTheme(id: string) {
    const label = getAtmosphereLabel(id);
    voidEngine.setAtmosphere(id);
    toast.show(`${label} atmosphere selected`, 'success');
  }

  function removeCustomTheme(id: string) {
    const label = getAtmosphereLabel(id);
    voidEngine.unregisterTheme(id);
    toast.show(`${label} atmosphere removed`, 'success');
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

  function toggleFixedNav(value?: boolean) {
    const newValue = value ?? !voidEngine.userConfig.fixedNav;
    voidEngine.setPreferences({ fixedNav: newValue });

    if (newValue) {
      toast.show('Navigation bar will stay visible while scrolling', 'success');
    } else {
      toast.show('Navigation bar will hide on scroll');
    }
  }

  function handleThemeKeydown(event: KeyboardEvent, index: number) {
    if (allAtmospheres.length === 0) return;

    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (index - 1 + allAtmospheres.length) % allAtmospheres.length;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (index + 1) % allAtmospheres.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = allAtmospheres.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();

    const nextTheme = allAtmospheres[nextIndex];
    if (!nextTheme) return;

    selectTheme(nextTheme.id);
    themeRefs[nextIndex]?.focus();
  }
</script>

<div
  class="modal-content"
  onclick={(e) => e.stopPropagation()}
  role="presentation"
  use:morph={{ width: false }}
>
  <h2 id="modal-title" class="text-h3 text-center">
    Atmosphere: {getAtmosphereLabel(voidEngine.atmosphere)}
  </h2>

  <div
    class="surface-sunk flex flex-col items-center justify-center gap-md p-md"
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
      class="surface-sunk flex flex-col items-center gap-md p-md"
      out:dissolve
    >
      <h5>Theme Override Active</h5>
      <p>
        <strong>{info?.label}</strong>
        applied
        <strong>{getAtmosphereLabel(info?.id ?? '')}</strong>
        atmosphere.
      </p>
      <span class="flex flex-row flex-wrap justify-center gap-sm">
        <button class="btn-system" onclick={handleRestore}>
          Return to {getAtmosphereLabel(info?.returnTo ?? '')}
        </button>
        <button
          class="btn-error"
          onclick={(event) => toggleAdaptAtmosphere(false)}
        >
          Disable overrides
        </button>
      </span>
    </div>
  {/if}

  <div
    class="theme-menu surface-sunk flex flex-col tablet:grid tablet:grid-cols-2 gap-sm p-sm"
    role="radiogroup"
    aria-label="Select Theme"
  >
    {#each allAtmospheres as atm, i (atm.id)}
      <div
        class="theme-wrapper p-sm"
        data-atmosphere={atm.id}
        data-physics={atm.physics}
        data-mode={atm.mode}
        style={atm.style}
        in:materialize={{ delay: i * 25 }}
        out:dissolve
      >
        <div class="flex items-center gap-xs">
          <button
            bind:this={themeRefs[i]}
            class="theme-option w-full flex items-center gap-sm p-xs text-dim text-left"
            role="radio"
            aria-checked={voidEngine.atmosphere === atm.id}
            tabindex={i === focusableThemeIndex ? 0 : -1}
            onclick={() => selectTheme(atm.id)}
            onkeydown={(event) => handleThemeKeydown(event, i)}
          >
            <div
              class="orb-wrapper relative hidden tablet:flex items-center justify-center"
              aria-hidden="true"
            >
              <span class="orb relative"></span>
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

          {#if atm.custom}
            <button
              class="btn-icon text-dim"
              aria-label="Remove {atm.label} atmosphere"
              onclick={() => removeCustomTheme(atm.id)}
            >
              <X class="icon" data-size="sm" />
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- Display Settings -->
  <hr />
  <div class="flex flex-col justify-center gap-md">
    <SettingsRow label="Text Scale">
      <span class="surface-sunk p-md">
        <SliderField
          presets={scaleLevels}
          value={activeScaleStep.value}
          onchange={(value) => setScale(value)}
        />
      </span>
    </SettingsRow>

    <SettingsRow label="Spacing Density">
      <span class="surface-sunk p-md">
        <SliderField
          presets={densityPresets}
          value={activeDensityIndex}
          onchange={(value) =>
            setDensity(densityMap[value] as 'high' | 'standard' | 'low')}
        />
      </span>
    </SettingsRow>
  </div>

  <hr />
  <SettingsRow label="Typography">
    <div class="flex flex-col small-desktop:flex-row justify-center gap-sm">
      <Selector
        label="Heading Font"
        options={headingFontOptions}
        value={voidEngine.userConfig.fontHeading}
        onchange={(v) => {
          const nextFont = typeof v === 'string' && v.length > 0 ? v : null;

          voidEngine.setPreferences({ fontHeading: nextFont });
          if (!nextFont)
            toast.show(
              'Custom font cleared. Reverted to Atmosphere recommendation.',
              'success',
            );
          else
            toast.show(
              `Headings updated to ${extractFontName(nextFont)}`,
              'info',
            );
        }}
      />
      <Selector
        label="Body Font"
        options={bodyFontOptions}
        value={voidEngine.userConfig.fontBody}
        onchange={(v) => {
          const nextFont = typeof v === 'string' && v.length > 0 ? v : null;

          voidEngine.setPreferences({ fontBody: nextFont });
          if (!nextFont)
            toast.show(
              'Custom font cleared. Reverted to Atmosphere recommendation.',
              'success',
            );
          else
            toast.show(
              `Reading font updated to ${extractFontName(nextFont)}`,
              'info',
            );
        }}
      />
    </div>
    <p class="text-center text-caption text-mute">
      Note: Changing fonts may affect the intended atmosphere of the selected
      theme.
    </p>
  </SettingsRow>

  <!-- Preferences -->
  <hr />
  <SettingsRow label="Preferences">
    <div
      class="surface-sunk p-md flex flex-col items-center justify-center gap-md large-desktop:flex-row"
    >
      <span class="flex flex-col items-center gap-xs">
        <Toggle
          bind:checked={voidEngine.userConfig.fixedNav}
          label="Fixed navigation"
          onchange={toggleFixedNav}
        />
        <p class="text-caption text-mute">
          (Navigation bar won't hide on scroll)
        </p>
      </span>
      <span class="flex flex-col items-center gap-xs">
        <Toggle
          bind:checked={voidEngine.userConfig.adaptAtmosphere}
          label="Allow theme overrides"
          onchange={toggleAdaptAtmosphere}
        />
        <p class="text-caption text-mute">
          (Temporary themes can override your preference)
        </p>
      </span>
    </div>
  </SettingsRow>

  <div class="flex justify-center gap-md">
    <button class="btn-ghost btn-error" onclick={() => modal.close()}>
      Close
    </button>
  </div>
</div>

<style lang="scss">
  @use '../../styles/abstracts' as *;

  .theme-menu {
    .theme-wrapper {
      background-color: var(--bg-canvas);
      transition: opacity var(--speed-fast) var(--ease-spring-snappy);
      border-radius: var(--radius-base);

      .theme-option {
        position: relative;
        border-radius: var(--radius-base);

        &[aria-checked='true'] {
          color: var(--text-main);
        }

        &:focus-visible {
          box-shadow: var(--focus-ring);
          color: var(--text-main);
          outline: none;
        }

        .orb-wrapper {
          width: var(--space-md);
          height: var(--space-md);
          border-radius: var(--radius-full);
          background: var(--bg-canvas);
          overflow: hidden;
          border: var(--physics-border-width) solid var(--border-color);
          flex-shrink: 0;

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
