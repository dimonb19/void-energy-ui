<!--
  MANUAL ATMOSPHERE FRAGMENT
  Modal for creating a custom atmosphere by manually picking all colors,
  physics preset, mode, and fonts.

  Opened via: modal.open('manual-atmosphere', { onPreviewActivated? }, 'lg')

  Uses the same preview lifecycle as AtmosphereGenerator:
  Generate → registerEphemeralTheme → pushTemporaryTheme → preview
  Keep    → unregisterEphemeral → registerTheme → setAtmosphere
  Revert  → releaseTemporaryTheme → unregisterEphemeralTheme
-->
<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { toast } from '@stores/toast.svelte';
  import { emerge, dissolve } from '@lib/transitions.svelte';
  import { morph } from '@actions/morph';
  import { buildManualAtmosphere } from '@lib/atmosphere-generator';
  import { FONTS, SEMANTIC_DARK, SEMANTIC_LIGHT } from '@config/design-tokens';

  import FormField from '../ui/FormField.svelte';
  import ColorField from '../ui/ColorField.svelte';
  import SliderField from '../ui/SliderField.svelte';
  import Switcher from '../ui/Switcher.svelte';
  import Selector from '../ui/Selector.svelte';
  import SettingsRow from '../ui/SettingsRow.svelte';
  import ActionBtn from '../ui/ActionBtn.svelte';
  import Sparkle from '../icons/Sparkle.svelte';
  import Refresh from '../icons/Refresh.svelte';
  import Undo from '../icons/Undo.svelte';

  // ── Props ────────────────────────────────────────────────────────────

  let { onPreviewActivated }: { onPreviewActivated?: () => void } = $props();

  // ── Form State ───────────────────────────────────────────────────────

  let label = $state('');
  let tagline = $state('');
  let selectedPhysics = $state<PhysicsPreference>('flat');
  let selectedMode = $state<ModePreference>('dark');

  // Core palette — default to Slate atmosphere as starting point
  let palette = $state<Record<string, string>>({
    'bg-canvas': '#111118',
    'bg-spotlight': '#1c1c26',
    'bg-surface': '#1e1e2a',
    'bg-sunk': '#0c0c12',
    'energy-primary': '#6ea1ff',
    'energy-secondary': '#8b8fa3',
    'border-color': '#6ea1ff',
    'text-main': '#e8e8ed',
    'text-dim': '#a0a0b0',
    'text-mute': '#64647a',
  });

  let fontHeadingKey = $state('clean');
  let fontBodyKey = $state('clean');

  // Opacity (0–100%) for tokens that need transparency per physics preset.
  // border-color: all physics. bg-surface + bg-sunk: glass and retro only.
  let opacity = $state<Record<string, number>>({
    'bg-surface': 60,
    'bg-sunk': 40,
    'border-color': 25,
  });

  /** Which palette keys show an opacity slider for the current physics. */
  const opacityKeys = $derived<Set<string>>(
    selectedPhysics === 'flat'
      ? new Set(['border-color'])
      : new Set(['bg-surface', 'bg-sunk', 'border-color']),
  );

  const hasOpacity = $derived(opacityKeys.size > 0);

  /** Convert a 6-digit hex + opacity% into an rgba() string. */
  function hexToRgba(hex: string, opacityPercent: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = +(opacityPercent / 100).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // ── Semantic Color Overrides ────────────────────────────────────────

  /** Extract hue (0–360) from a 6-digit hex string. */
  function hexToHue(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    if (d === 0) return 0;
    let h = 0;
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return h * 60;
  }

  /** Check if a hue falls within a range (handles wrap-around). */
  function hueInRange(hue: number, lo: number, hi: number): boolean {
    return lo <= hi ? hue >= lo && hue <= hi : hue >= lo || hue <= hi;
  }

  // Mode-appropriate stock defaults for the pickers
  const semanticDefaults = $derived(
    selectedMode === 'light'
      ? {
          premium: SEMANTIC_LIGHT['color-premium'],
          system: SEMANTIC_LIGHT['color-system'],
        }
      : {
          premium: SEMANTIC_DARK['color-premium'],
          system: SEMANTIC_DARK['color-system'],
        },
  );

  // User overrides — initialized to stock defaults, reset when mode changes
  let colorPremium = $state(SEMANTIC_DARK['color-premium']);
  let colorSystem = $state(SEMANTIC_DARK['color-system']);

  // Sync defaults when mode changes
  $effect(() => {
    colorPremium = semanticDefaults.premium;
    colorSystem = semanticDefaults.system;
  });

  /** True when the user has changed the override from the mode default. */
  const hasPremiumOverride = $derived(
    colorPremium !== semanticDefaults.premium,
  );
  const hasSystemOverride = $derived(colorSystem !== semanticDefaults.system);

  // Collision detection: check both energy-primary and energy-secondary hues
  const premiumCollision = $derived.by(() => {
    const hues = [
      hexToHue(palette['energy-primary']),
      hexToHue(palette['energy-secondary']),
    ];
    return hues.some((h) => hueInRange(h, 20, 55)) && !hasPremiumOverride;
  });
  const systemCollision = $derived.by(() => {
    const hues = [
      hexToHue(palette['energy-primary']),
      hexToHue(palette['energy-secondary']),
    ];
    return hues.some((h) => hueInRange(h, 260, 310)) && !hasSystemOverride;
  });

  // ── Preview State ────────────────────────────────────────────────────

  let previewId = $state<string | null>(null);
  let previewHandle = $state<number | null>(null);
  let previewResult = $state<GeneratedAtmosphere | null>(null);
  let error = $state('');

  // Cleanup when modal closes — covers all paths (Close button, backdrop,
  // Escape). Watches the reactive modal key instead of relying on $effect
  // cleanup, which is unreliable when Modal.svelte reuses the component
  // instance across close/reopen cycles without a full unmount.
  $effect(() => {
    if (modal.state.key !== 'manual-atmosphere') {
      cleanupPreview();
    }
  });

  // ── Derived ──────────────────────────────────────────────────────────

  let canPreview = $derived(label.trim().length > 0);

  // Helper to capitalize strings
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Helper to extract font display name
  const extractFontName = (family: string) =>
    family.match(/^'([^']+)'/)?.[1] || family;

  // Font options for selectors
  const fontOptions = Object.entries(FONTS).map(([key, def]) => ({
    label: `${capitalize(key)} (${extractFontName(def.family)})`,
    value: key,
  }));

  // Physics/mode options with constraint enforcement
  const physicsOptions = $derived([
    {
      value: 'glass' as const,
      label: 'Glass',
      disabled: selectedMode === 'light',
    },
    { value: 'flat' as const, label: 'Flat' },
    {
      value: 'retro' as const,
      label: 'Retro',
      disabled: selectedMode === 'light',
    },
  ]);

  const modeOptions = $derived([
    { value: 'dark' as const, label: 'Dark' },
    {
      value: 'light' as const,
      label: 'Light',
      disabled: selectedPhysics === 'glass' || selectedPhysics === 'retro',
    },
  ]);

  // Auto-correct invalid physics+mode combos
  $effect(() => {
    if (
      selectedMode === 'light' &&
      (selectedPhysics === 'glass' || selectedPhysics === 'retro')
    ) {
      selectedPhysics = 'flat';
    }
  });
  $effect(() => {
    if (
      (selectedPhysics === 'glass' || selectedPhysics === 'retro') &&
      selectedMode === 'light'
    ) {
      selectedMode = 'dark';
    }
  });

  // Palette field definitions grouped for display
  const paletteGroups: {
    heading: string;
    fields: { key: string; label: string; hint?: string }[];
  }[] = [
    {
      heading: 'Backgrounds',
      fields: [
        { key: 'bg-canvas', label: 'Canvas', hint: 'Base page color' },
        {
          key: 'bg-spotlight',
          label: 'Spotlight',
          hint: 'Gradient glow over Canvas. Match both for a plain look',
        },
      ],
    },
    {
      heading: 'Surfaces',
      fields: [
        {
          key: 'bg-surface',
          label: 'Surface',
          hint: 'Cards, panels, floating elements',
        },
        {
          key: 'bg-sunk',
          label: 'Sunk',
          hint: 'Recessed areas, inset containers',
        },
      ],
    },
    {
      heading: 'Energy & Border',
      fields: [
        { key: 'energy-primary', label: 'Primary' },
        { key: 'energy-secondary', label: 'Secondary' },
        { key: 'border-color', label: 'Border' },
      ],
    },
    {
      heading: 'Text',
      fields: [
        { key: 'text-main', label: 'Main' },
        { key: 'text-dim', label: 'Dim' },
        { key: 'text-mute', label: 'Mute' },
      ],
    },
  ];

  // ── Preview Lifecycle ────────────────────────────────────────────────

  function applyPreview(result: GeneratedAtmosphere) {
    voidEngine.registerEphemeralTheme(result.id, result.definition);

    const handle = voidEngine.pushTemporaryTheme(
      result.id,
      `Manual: ${result.label}`,
    );

    if (handle === null) {
      // adaptAtmosphere off — promote directly and close
      voidEngine.unregisterEphemeralTheme(result.id);
      voidEngine.registerTheme(result.id, result.definition);
      voidEngine.setAtmosphere(result.id);
      toast.show(`"${result.label}" applied and saved.`, 'success');
      modal.close();
      return;
    }

    previewId = result.id;
    previewHandle = handle;
    previewResult = result;

    // Clean up the parent's preview (AI generator) AFTER pushing ours.
    // Our theme is now on top of the stack, so the AI's releaseTemporaryTheme
    // splices its entry silently (no competing _applyAtmosphere / view transition).
    onPreviewActivated?.();
  }

  function replacePreview(result: GeneratedAtmosphere) {
    const oldId = previewId;
    voidEngine.registerEphemeralTheme(result.id, result.definition);
    voidEngine.updateTemporaryTheme(
      previewHandle!,
      result.id,
      `Manual: ${result.label}`,
    );
    if (oldId) voidEngine.unregisterEphemeralTheme(oldId);
    previewId = result.id;
    previewResult = result;
  }

  function cleanupPreview() {
    if (previewHandle !== null) {
      voidEngine.releaseTemporaryTheme(previewHandle);
    }
    if (previewId) {
      voidEngine.unregisterEphemeralTheme(previewId);
    }
    previewId = null;
    previewHandle = null;
    previewResult = null;
  }

  // ── Actions ──────────────────────────────────────────────────────────

  function preview() {
    if (!canPreview) return;
    error = '';

    const finalPalette = { ...palette };
    for (const key of opacityKeys) {
      finalPalette[key] = hexToRgba(palette[key], opacity[key]);
    }

    const result = buildManualAtmosphere({
      label: label.trim(),
      tagline: tagline.trim(),
      physics: selectedPhysics,
      mode: selectedMode,
      palette: finalPalette,
      fontHeadingKey,
      fontBodyKey,
      existingIds: new Set(voidEngine.availableAtmospheres),
      colorPremium: hasPremiumOverride ? colorPremium : undefined,
      colorSystem: hasSystemOverride ? colorSystem : undefined,
    });

    if (!result.ok) {
      error = result.error.message;
      if (result.error.issues) {
        error += ' ' + result.error.issues.join(', ');
      }
      toast.show(error, 'error');
      return;
    }

    if (previewHandle !== null && previewId) {
      replacePreview(result.data);
    } else {
      applyPreview(result.data);
    }

    // If adaptAtmosphere is off, applyPreview auto-promoted and already
    // showed its own toast + closed the flow. Don't add a second toast.
    if (previewHandle !== null) {
      toast.show(`Previewing "${result.data.label}"`, 'success');
    }
  }

  function keep() {
    if (!previewResult) return;

    const result = previewResult;
    const id = result.id;

    voidEngine.unregisterEphemeralTheme(id);
    voidEngine.registerTheme(id, result.definition);
    voidEngine.setAtmosphere(id);

    previewId = null;
    previewHandle = null;
    previewResult = null;

    toast.show(`"${result.label}" is now your atmosphere.`, 'success');
    modal.close();
  }

  function revert() {
    cleanupPreview();
    error = '';
  }

  function handleClose() {
    modal.close();
    // Cleanup runs reactively via the modal.state.key watcher above.
  }
</script>

<div
  class="modal-content"
  onclick={(e) => e.stopPropagation()}
  role="presentation"
  use:morph={{ width: false }}
>
  <h2 id="modal-title" class="text-h3 text-center">Manual Atmosphere</h2>

  <p class="text-center text-mute">
    Handcraft an atmosphere by picking every color yourself.
  </p>

  <!-- ── Identity ─────────────────────────────────────────────────── -->
  <SettingsRow label="Identity">
    <div class="flex flex-col gap-sm">
      <FormField label="Name" required>
        {#snippet children({ fieldId, descriptionId, invalid })}
          <input
            type="text"
            id={fieldId}
            bind:value={label}
            placeholder="Atmosphere name"
            maxlength={30}
            required
            aria-invalid={invalid}
            aria-describedby={descriptionId}
            class="w-full"
          />
        {/snippet}
      </FormField>
      <FormField label="Tagline">
        {#snippet children({ fieldId, descriptionId, invalid })}
          <input
            type="text"
            id={fieldId}
            bind:value={tagline}
            placeholder="Short description (e.g., Cyber / Synthwave)"
            maxlength={40}
            aria-invalid={invalid}
            aria-describedby={descriptionId}
            class="w-full"
          />
        {/snippet}
      </FormField>
    </div>
  </SettingsRow>

  <hr />

  <!-- ── Physics & Mode ───────────────────────────────────────────── -->
  <SettingsRow label="Presets">
    <div class="flex flex-row gap-lg flex-wrap justify-center">
      <Switcher
        options={physicsOptions}
        bind:value={selectedPhysics}
        label="Physics"
      />
      <Switcher options={modeOptions} bind:value={selectedMode} label="Mode" />
    </div>
    <p class="text-caption text-mute text-center">
      Glass and Retro require dark mode.
    </p>
  </SettingsRow>

  <hr />

  <!-- ── Color Palette ────────────────────────────────────────────── -->
  {#each paletteGroups as group}
    <SettingsRow label={group.heading}>
      <div class="surface-sunk p-md flex flex-col gap-md">
        {#if hasOpacity && group.heading === 'Surfaces' && selectedPhysics !== 'flat'}
          <p class="text-caption text-mute text-center" in:emerge out:dissolve>
            {selectedPhysics === 'glass' ? 'Glass' : 'Retro'} surfaces need transparency.
            Use the sliders to set opacity.
          </p>
        {/if}
        <div
          class="flex flex-col tablet:flex-row tablet:flex-wrap gap-md tablet:justify-center"
        >
          {#each group.fields as field}
            <div class="flex flex-col items-stretch tablet:items-center gap-xs">
              <span class="text-caption text-dim tablet:text-center"
                >{field.label}</span
              >
              <ColorField
                bind:value={palette[field.key]}
                class="w-full tablet:w-auto"
              />
              {#if field.hint}
                <span class="text-caption text-mute tablet:text-center"
                  >{field.hint}</span
                >
              {/if}
              {#if opacityKeys.has(field.key)}
                <div class="flex items-center gap-xs" in:emerge out:dissolve>
                  <SliderField
                    bind:value={opacity[field.key]}
                    min={5}
                    max={100}
                    step={5}
                    class="w-full"
                  />
                  <span class="text-caption text-mute"
                    >{opacity[field.key]}%</span
                  >
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </SettingsRow>
  {/each}

  <hr />

  <!-- ── Semantic Colors ────────────────────────────────────────────── -->
  <SettingsRow label="Semantic Colors">
    <div class="surface-sunk p-md flex flex-col gap-md">
      <div
        class="flex flex-col tablet:flex-row tablet:flex-wrap gap-md tablet:justify-center"
      >
        <div class="flex flex-col items-stretch tablet:items-center gap-xs">
          <span class="text-caption text-dim tablet:text-center">Premium</span>
          <ColorField bind:value={colorPremium} class="w-full tablet:w-auto" />
          <span class="text-caption text-mute tablet:text-center">
            Credits, badges, caution
          </span>
        </div>
        <div class="flex flex-col items-stretch tablet:items-center gap-xs">
          <span class="text-caption text-dim tablet:text-center">System</span>
          <ColorField bind:value={colorSystem} class="w-full tablet:w-auto" />
          <span class="text-caption text-mute tablet:text-center">
            AI features, platform alerts
          </span>
        </div>
      </div>
      {#if premiumCollision || systemCollision}
        <p
          class="text-caption text-center text-premium"
          in:emerge={{ y: -8 }}
          out:dissolve={{ y: -8 }}
        >
          {#if premiumCollision && systemCollision}
            Your energy colors overlap with both premium and system defaults.
            Pick distinct overrides to keep badges visible.
          {:else if premiumCollision}
            Your energy colors are in the gold/amber range and may blend with
            premium badges. Pick a non-amber premium color.
          {:else}
            Your energy colors are in the purple range and may blend with system
            indicators. Pick a non-purple system color.
          {/if}
        </p>
      {/if}
    </div>
  </SettingsRow>

  <hr />

  <!-- ── Typography ───────────────────────────────────────────────── -->
  <SettingsRow label="Typography">
    <div class="flex flex-col small-desktop:flex-row justify-center gap-sm">
      <Selector
        label="Heading Font"
        options={fontOptions}
        bind:value={fontHeadingKey}
      />
      <Selector
        label="Body Font"
        options={fontOptions}
        bind:value={fontBodyKey}
      />
    </div>
  </SettingsRow>

  <hr />

  <!-- ── Error Display ────────────────────────────────────────────── -->
  {#if error}
    <p
      class="text-error text-center text-small"
      in:emerge={{ y: -8 }}
      out:dissolve={{ y: -8 }}
    >
      {error}
    </p>
  {/if}

  <!-- ── Preview Controls ─────────────────────────────────────────── -->
  {#if previewResult && previewHandle !== null}
    <div
      class="surface-sunk p-md flex flex-col gap-md items-center"
      in:emerge
      out:dissolve
    >
      <div class="flex flex-row flex-wrap gap-md justify-center">
        <button class="btn-premium" onclick={keep}>
          Keep This Atmosphere
        </button>
        <ActionBtn
          icon={Refresh}
          text="Update Preview"
          type="button"
          class="btn-ghost btn-system"
          onclick={preview}
        />
        <ActionBtn
          icon={Undo}
          text="Revert"
          type="button"
          class="btn-ghost btn-error"
          onclick={revert}
        />
      </div>
      <p class="text-caption text-mute">
        Changes are not saved until you keep the atmosphere.
      </p>
    </div>
  {/if}

  <!-- ── Actions ──────────────────────────────────────────────────── -->
  <div class="flex flex-row justify-center gap-md">
    <button class="btn-ghost btn-error" onclick={handleClose}>
      {previewResult ? 'Cancel' : 'Close'}
    </button>
    {#if !previewResult}
      <ActionBtn
        icon={Sparkle}
        text="Preview"
        disabled={!canPreview}
        onclick={preview}
      />
    {/if}
  </div>
</div>
