<!--
  ATMOSPHERE GENERATOR
  "Type a vibe → get a complete atmosphere" — AI theme generation demo.

  Uses the AI pipeline (server-side proxy at /api/generate-atmosphere)
  to generate complete VoidThemeDefinitions from creative concept descriptions.

  Includes an inline palette editor for manual color tweaking — either from
  scratch or refining an AI-generated result.

  LIFECYCLE:
  Generate → validate → registerEphemeralTheme → pushTemporaryTheme → preview
  Keep    → unregisterEphemeral → registerTheme → setAtmosphere (clears stack, no restore)
  Revert  → releaseTemporaryTheme → unregisterEphemeralTheme
  Regen   → registerEphemeral(new) → updateTemporaryTheme(handle) → unregisterEphemeral(old)

  PLACEMENT:
  Lives in src/components/ (not ui/) because it's a landing-page feature,
  not a registered primitive.
-->
<script lang="ts">
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { toast } from '@stores/toast.svelte';
  import {
    generateAtmosphere,
    buildManualAtmosphere,
    PALETTE_GROUPS,
    cssColorToHex,
    hexToRgba,
    hexToHue,
    hexToLightness,
    hueInRange,
    CORE_PALETTE_KEYS,
  } from '@lib/atmosphere-generator';
  import {
    ATMOSPHERES,
    FONTS,
    FONT_FAMILY_TO_KEY,
    SEMANTIC_DARK,
    SEMANTIC_LIGHT,
  } from '@config/design-tokens';

  import { untrack } from 'svelte';
  import { emerge, dissolve } from '@lib/transitions.svelte';

  import ActionBtn from './ui/ActionBtn.svelte';
  import FormField from './ui/FormField.svelte';
  import Switcher from './ui/Switcher.svelte';
  import Selector from './ui/Selector.svelte';
  import SliderField from './ui/SliderField.svelte';
  import Sparkle from './icons/Sparkle.svelte';
  import Refresh from './icons/Refresh.svelte';
  import Undo from './icons/Undo.svelte';
  import Copy from './icons/Copy.svelte';
  import IconBtn from './ui/IconBtn.svelte';
  import LoadingQuill from './icons/LoadingQuill.svelte';

  interface AtmosphereGeneratorProps {
    class?: string;
  }

  let { class: className = '' }: AtmosphereGeneratorProps = $props();

  // ── Helpers ─────────────────────────────────────────────────────────────

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const extractFontName = (family: string) =>
    family.match(/^'([^']+)'/)?.[1] || family;

  // ── Generation State ───────────────────────────────────────────────────

  let vibe = $state('');
  let generating = $state(false);
  let abortController = $state<AbortController | undefined>(undefined);

  // Preview tracking
  let previewId = $state<string | null>(null);
  let previewHandle = $state<number | null>(null);
  let previewResult = $state<GeneratedAtmosphere | null>(null);
  /** Snapshot of the last AI-generated atmosphere — used by Restore button. */
  let generatedResult = $state<GeneratedAtmosphere | null>(null);

  // Detect when our preview was cleaned up externally.
  $effect(() => {
    if (previewId && !voidEngine.availableAtmospheres.includes(previewId)) {
      previewId = null;
      previewHandle = null;
      previewResult = null;
    }
  });

  // ── AI Preference State ───────────────────────────────────────────────

  let selectedPhysics = $state<PhysicsPreference | null>(null);
  let selectedMode = $state<ModePreference | null>(null);

  const physicsOptions = $derived([
    { value: null, label: 'Auto' },
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

  const darkOnlyPhysics = $derived(
    selectedPhysics === 'glass' || selectedPhysics === 'retro',
  );

  const modeOptions = $derived([
    { value: null, label: 'Auto', disabled: darkOnlyPhysics },
    { value: 'dark' as const, label: 'Dark' },
    {
      value: 'light' as const,
      label: 'Light',
      disabled: darkOnlyPhysics,
    },
  ]);

  $effect(() => {
    if (
      selectedMode === 'light' &&
      (selectedPhysics === 'glass' || selectedPhysics === 'retro')
    ) {
      selectedPhysics = null;
    }
  });
  $effect(() => {
    if (selectedPhysics === 'glass' || selectedPhysics === 'retro') {
      selectedMode = 'dark';
    }
  });

  let canGenerate = $derived(vibe.trim().length > 0 && !generating);

  // ── Abort on Escape ────────────────────────────────────────────────────

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && generating && abortController) {
      e.preventDefault();
      abortController.abort();
    }
  }

  $effect(() => {
    if (generating) {
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }
  });

  // ── Inline Palette Editor State ────────────────────────────────────────

  let paletteOpen = $state(false);
  let editLabel = $state('');
  let editTagline = $state('');
  let editPhysics = $state<PhysicsPreference>('flat');
  let editMode = $state<ModePreference>('dark');
  // Default to Slate atmosphere as starting point (same as old manual picker)
  let editPalette = $state<Record<string, string>>({
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
  let editOpacity = $state<Record<string, number>>({
    'bg-surface': 60,
    'bg-sunk': 40,
    'border-color': 25,
  });
  let editFontHeadingKey = $state('clean');
  let editFontBodyKey = $state('clean');
  let editError = $state('');
  /** True once the user has changed any color/font/semantic value (not physics/mode). */
  let editDirty = $state(false);

  // Semantic color overrides
  let editColorPremium = $state(SEMANTIC_DARK['color-premium']);
  let editColorSystem = $state(SEMANTIC_DARK['color-system']);

  const editSemanticDefaults = $derived(
    editMode === 'light'
      ? {
          premium: SEMANTIC_LIGHT['color-premium'],
          system: SEMANTIC_LIGHT['color-system'],
        }
      : {
          premium: SEMANTIC_DARK['color-premium'],
          system: SEMANTIC_DARK['color-system'],
        },
  );

  const hasEditPremiumOverride = $derived(
    editColorPremium !== editSemanticDefaults.premium,
  );
  const hasEditSystemOverride = $derived(
    editColorSystem !== editSemanticDefaults.system,
  );

  // Collision detection
  const editPremiumCollision = $derived.by(() => {
    const primary = editPalette['energy-primary'];
    const secondary = editPalette['energy-secondary'];
    if (!primary || !secondary) return false;
    const hues = [hexToHue(primary), hexToHue(secondary)];
    return hues.some((h) => hueInRange(h, 20, 55)) && !hasEditPremiumOverride;
  });
  const editSystemCollision = $derived.by(() => {
    const primary = editPalette['energy-primary'];
    const secondary = editPalette['energy-secondary'];
    if (!primary || !secondary) return false;
    const hues = [hexToHue(primary), hexToHue(secondary)];
    return hues.some((h) => hueInRange(h, 260, 310)) && !hasEditSystemOverride;
  });

  // Mode compatibility warnings
  const editBgModeWarning = $derived.by(() => {
    const canvas = editPalette['bg-canvas'];
    const surface = editPalette['bg-surface'];
    if (!canvas || !isValidHex(canvas)) return false;
    const canvasL = hexToLightness(canvas);
    const surfaceL =
      surface && isValidHex(surface) ? hexToLightness(surface) : null;
    if (editMode === 'dark') {
      return canvasL > 30 || (surfaceL !== null && surfaceL > 35);
    }
    return canvasL < 25 || (surfaceL !== null && surfaceL < 20);
  });

  const editTextModeWarning = $derived.by(() => {
    const main = editPalette['text-main'];
    const dim = editPalette['text-dim'];
    const mute = editPalette['text-mute'];
    if (!main || !isValidHex(main)) return false;
    const mainL = hexToLightness(main);
    const dimL = dim && isValidHex(dim) ? hexToLightness(dim) : null;
    const muteL = mute && isValidHex(mute) ? hexToLightness(mute) : null;
    if (editMode === 'dark') {
      return (
        mainL < 25 ||
        (dimL !== null && dimL < 10) ||
        (muteL !== null && muteL < 6)
      );
    }
    return (
      mainL > 90 ||
      (dimL !== null && dimL > 92) ||
      (muteL !== null && muteL > 95)
    );
  });

  // Sync semantic defaults when mode changes
  $effect(() => {
    editColorPremium = editSemanticDefaults.premium;
    editColorSystem = editSemanticDefaults.system;
  });

  /** Opacity keys that need sliders for the current physics. */
  const editOpacityKeys = $derived<Set<string>>(
    editPhysics === 'flat'
      ? new Set(['border-color'])
      : new Set(['bg-surface', 'bg-sunk', 'border-color']),
  );

  // Physics/mode constraint enforcement for editor
  const editPhysicsOptions = $derived([
    {
      value: 'glass' as const,
      label: 'Glass',
      disabled: editMode === 'light',
    },
    { value: 'flat' as const, label: 'Flat' },
    {
      value: 'retro' as const,
      label: 'Retro',
      disabled: editMode === 'light',
    },
  ]);

  const editModeOptions = $derived([
    { value: 'dark' as const, label: 'Dark' },
    {
      value: 'light' as const,
      label: 'Light',
      disabled: editPhysics === 'glass' || editPhysics === 'retro',
    },
  ]);

  $effect(() => {
    if (
      editMode === 'light' &&
      (editPhysics === 'glass' || editPhysics === 'retro')
    ) {
      editPhysics = 'flat';
    }
  });
  $effect(() => {
    if (
      (editPhysics === 'glass' || editPhysics === 'retro') &&
      editMode === 'light'
    ) {
      editMode = 'dark';
    }
  });

  // Font options
  const fontOptions = Object.entries(FONTS).map(([key, def]) => ({
    label: `${capitalize(key)} (${extractFontName(def.family)})`,
    value: key,
  }));

  // ── Seed Editor from Theme Definition ────────────────────────────────

  function seedEditor(
    source: GeneratedAtmosphere['definition'] | VoidThemeDefinition,
    label: string,
    tagline: string,
  ) {
    const palette = source.palette;

    // Decompose each core color into hex + opacity
    const newPalette: Record<string, string> = {};
    const newOpacity: Record<string, number> = {
      'bg-surface': 60,
      'bg-sunk': 40,
      'border-color': 25,
    };

    for (const key of CORE_PALETTE_KEYS) {
      const value = palette[key];
      if (value) {
        const parsed = cssColorToHex(value);
        newPalette[key] = parsed.hex;
        if (key in newOpacity) {
          newOpacity[key] = parsed.opacity;
        }
      } else {
        newPalette[key] = '#000000';
      }
    }

    editPalette = newPalette;
    editOpacity = newOpacity;
    editPhysics = source.physics;
    editMode = source.mode;
    editLabel = label;
    editTagline = tagline;

    // Capture font keys from source
    const headingFamily = palette['font-atmos-heading'];
    const bodyFamily = palette['font-atmos-body'];
    editFontHeadingKey =
      (headingFamily && FONT_FAMILY_TO_KEY[headingFamily]) ?? 'clean';
    editFontBodyKey = (bodyFamily && FONT_FAMILY_TO_KEY[bodyFamily]) ?? 'clean';

    // Seed semantic overrides from source
    const semanticBase =
      source.mode === 'light' ? SEMANTIC_LIGHT : SEMANTIC_DARK;
    const premiumVal = palette['color-premium'];
    const systemVal = palette['color-system'];
    editColorPremium =
      premiumVal && premiumVal !== semanticBase['color-premium']
        ? cssColorToHex(premiumVal).hex
        : semanticBase['color-premium'];
    editColorSystem =
      systemVal && systemVal !== semanticBase['color-system']
        ? cssColorToHex(systemVal).hex
        : semanticBase['color-system'];

    editError = '';
    editDirty = false;
  }

  /** Seed from the mode-appropriate default: Frost (dark) or Meridian (light). */
  function seedFromModeDefault(mode: ModePreference) {
    const source = mode === 'light' ? ATMOSPHERES.meridian : ATMOSPHERES.frost;
    seedEditor(source, '', '');
    // Restore the user's chosen mode/physics — seedEditor overwrites them
    // with the source theme's values, but the user may have picked differently.
    editMode = mode;
  }

  function seedFromCurrentTheme() {
    if (previewResult) {
      const source = previewResult.definition;
      seedEditor(source, previewResult.label, previewResult.tagline);
    } else {
      seedFromModeDefault(editMode);
    }
  }

  function restoreGenerated() {
    if (generatedResult) {
      seedEditor(
        generatedResult.definition,
        generatedResult.label,
        generatedResult.tagline,
      );

      // Immediately restore the generated preview (don't wait for debounce)
      if (previewHandle !== null && previewId) {
        replacePreview(generatedResult);
      } else {
        applyPreview(generatedResult);
      }
    } else {
      // No AI result — reset to mode-appropriate defaults and clean up preview
      cleanupPreview();
      seedFromModeDefault(editMode);
    }
  }

  // Re-seed palette when mode changes and user hasn't touched colors yet
  $effect(() => {
    const mode = editMode;
    untrack(() => {
      if (!paletteOpen || editDirty) return;
      seedFromModeDefault(mode);
    });
  });

  function handleDetailsToggle(e: Event) {
    const details = e.currentTarget as HTMLDetailsElement;
    paletteOpen = details.open;
    if (details.open) {
      seedFromCurrentTheme();
    }
  }

  // ── Hex Input Handling ─────────────────────────────────────────────────

  /** Sanitize hex input: strip invalid chars, auto-prepend #. */
  function sanitizeHex(raw: string): string {
    let cleaned = raw.replace(/[^0-9a-fA-F#]/g, '');
    if (!cleaned.startsWith('#')) cleaned = '#' + cleaned;
    return cleaned.slice(0, 7);
  }

  function isValidHex(value: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function handleHexInput(key: string, e: Event) {
    const input = e.target as HTMLInputElement;
    const sanitized = sanitizeHex(input.value);
    input.value = sanitized;
    editPalette[key] = sanitized;
    editDirty = true;
  }

  function handleSemanticHexInput(setter: (v: string) => void, e: Event) {
    const input = e.target as HTMLInputElement;
    const sanitized = sanitizeHex(input.value);
    input.value = sanitized;
    setter(sanitized);
    editDirty = true;
  }

  // ── Export to Code ──────────────────────────────────────────────────────

  let exportCopied = $state(false);
  let exportTimeout: ReturnType<typeof setTimeout> | undefined;

  function buildExportCode(): string {
    const id =
      editLabel
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') || 'custom';
    const semanticSpread =
      editMode === 'light' ? '...SEMANTIC_LIGHT' : '...SEMANTIC_DARK';

    // Build palette entries with opacity applied
    const paletteLines: string[] = [`    ${semanticSpread},`];

    // Font references
    paletteLines.push(
      `    'font-atmos-heading': FONTS.${editFontHeadingKey}.family,`,
    );
    paletteLines.push(
      `    'font-atmos-body': FONTS.${editFontBodyKey}.family,`,
    );

    // Core palette keys
    for (const key of CORE_PALETTE_KEYS) {
      const hex = editPalette[key];
      if (!hex) continue;
      // Apply opacity for keys that need it
      if (editOpacityKeys.has(key) && isValidHex(hex)) {
        paletteLines.push(
          `    '${key}': '${hexToRgba(hex, editOpacity[key])}',`,
        );
      } else {
        paletteLines.push(`    '${key}': '${hex}',`);
      }
    }

    // Semantic color overrides
    if (hasEditPremiumOverride) {
      paletteLines.push(`    'color-premium': '${editColorPremium}',`);
    }
    if (hasEditSystemOverride) {
      paletteLines.push(`    'color-system': '${editColorSystem}',`);
    }

    const tagline = editTagline.trim() || editLabel.trim() || 'Custom theme';

    return [
      `// Add to ATMOSPHERES in src/config/atmospheres.ts, then run: npm run build:tokens`,
      `${id}: {`,
      `  mode: '${editMode}',`,
      `  physics: '${editPhysics}',`,
      `  tagline: '${tagline.replace(/'/g, "\\'")}',`,
      `  palette: {`,
      ...paletteLines,
      `  },`,
      `},`,
    ].join('\n');
  }

  async function copyExportCode() {
    const code = buildExportCode();
    try {
      await navigator.clipboard.writeText(code);
      exportCopied = true;
      toast.show('Theme code copied to clipboard', 'success');
      clearTimeout(exportTimeout);
      exportTimeout = setTimeout(() => (exportCopied = false), 2000);
    } catch {
      toast.show('Copy failed', 'error');
    }
  }

  // ── Preview Lifecycle ──────────────────────────────────────────────────

  function applyPreview(result: GeneratedAtmosphere) {
    voidEngine.registerEphemeralTheme(result.id, result.definition);

    const handle = voidEngine.pushTemporaryTheme(result.id, result.label);

    if (handle === null) {
      voidEngine.unregisterEphemeralTheme(result.id);
      voidEngine.registerTheme(result.id, result.definition);
      voidEngine.setAtmosphere(result.id);
      previewId = null;
      previewHandle = null;
      previewResult = result;
      toast.show(`"${result.label}" applied and saved.`, 'success');
      return;
    }

    previewId = result.id;
    previewHandle = handle;
    previewResult = result;
  }

  function replacePreview(result: GeneratedAtmosphere) {
    const oldId = previewId;

    voidEngine.registerEphemeralTheme(result.id, result.definition);
    voidEngine.updateTemporaryTheme(previewHandle!, result.id, result.label);

    if (oldId && oldId !== result.id) {
      voidEngine.unregisterEphemeralTheme(oldId);
    }

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

  // ── AI Actions ─────────────────────────────────────────────────────────

  async function generate(retry = false) {
    if (!canGenerate) return;

    generating = true;
    const controller = new AbortController();
    abortController = controller;
    const loadingToast = toast.loading(
      'Generating atmosphere... (Esc to cancel)',
    );

    const result = await generateAtmosphere({
      vibe: vibe.trim(),
      physics: selectedPhysics ?? undefined,
      mode: selectedMode ?? undefined,
      retry,
      signal: controller.signal,
      existingIds: new Set(voidEngine.availableAtmospheres),
    });

    generating = false;
    abortController = undefined;

    if (!result.ok) {
      if (result.error.message === 'Generation cancelled.') {
        loadingToast.close();
        return;
      }

      loadingToast.error(result.error.message);
      return;
    }

    generatedResult = result.data;

    if (previewHandle !== null && previewId) {
      replacePreview(result.data);
    } else {
      applyPreview(result.data);
    }
    loadingToast.success(`"${result.data.label}" generated!`);
  }

  function keep() {
    if (!previewResult || generating) return;

    const result = previewResult;
    const id = result.id;

    voidEngine.unregisterEphemeralTheme(id);
    voidEngine.registerTheme(id, result.definition);
    voidEngine.setAtmosphere(id);

    previewId = null;
    previewHandle = null;
    previewResult = null;
    generatedResult = null;

    toast.show(`"${result.label}" is now your atmosphere.`, 'success');
  }

  function revert() {
    if (generating) return;
    cleanupPreview();
    generatedResult = null;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    generate();
  }

  // ── Live Preview ────────────────────────────────────────────────────────

  /** Build and apply/update the live preview. Silently skips invalid states. */
  function livePreview() {
    const finalPalette: Record<string, string> = { ...editPalette };
    for (const key of editOpacityKeys) {
      if (finalPalette[key] && isValidHex(finalPalette[key])) {
        finalPalette[key] = hexToRgba(finalPalette[key], editOpacity[key]);
      }
    }

    // Exclude current preview ID so same label keeps same ID (no churn)
    const existingIds = new Set(
      voidEngine.availableAtmospheres.filter((id) => id !== previewId),
    );

    const result = buildManualAtmosphere({
      label: editLabel.trim(),
      tagline: editTagline.trim(),
      physics: editPhysics,
      mode: editMode,
      palette: finalPalette,
      fontHeadingKey: editFontHeadingKey,
      fontBodyKey: editFontBodyKey,
      existingIds,
      colorPremium: hasEditPremiumOverride ? editColorPremium : undefined,
      colorSystem: hasEditSystemOverride ? editColorSystem : undefined,
    });

    if (!result.ok) return; // silently skip invalid states

    if (previewHandle !== null && previewId) {
      replacePreview(result.data);
    } else {
      applyPreview(result.data);
    }
  }

  let livePreviewTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    // Read all editor state to establish reactive tracking
    const _ = [
      JSON.stringify(editPalette),
      JSON.stringify(editOpacity),
      editPhysics,
      editMode,
      editFontHeadingKey,
      editFontBodyKey,
      editColorPremium,
      editColorSystem,
      editLabel,
      editTagline,
    ];

    if (!paletteOpen || !editDirty) return;

    clearTimeout(livePreviewTimer);
    livePreviewTimer = setTimeout(livePreview, 150);

    return () => clearTimeout(livePreviewTimer);
  });
</script>

<div class="surface-raised p-lg flex flex-col gap-lg {className}">
  <!-- ── Vibe Input ─────────────────────────────────────────────────── -->
  <form class="flex flex-col gap-md items-center" onsubmit={handleSubmit}>
    <div class="w-full flex flex-col tablet:flex-row gap-sm">
      <input
        type="text"
        bind:value={vibe}
        placeholder="Describe a vibe... (e.g., 'underwater bioluminescence')"
        disabled={generating}
        class="flex-1"
      />
      <ActionBtn
        icon={generating ? LoadingQuill : Sparkle}
        text={generating ? 'Generating...' : 'Generate'}
        type="submit"
        disabled={!canGenerate}
        class="shrink-0"
      />
    </div>

    <!-- ── Optional Preferences ──────────────────────────────────────── -->
    <div
      class="w-full flex flex-row gap-md flex-wrap justify-center small-desktop:gap-xl"
    >
      <Switcher
        options={physicsOptions}
        bind:value={selectedPhysics}
        label="Physics"
        disabled={generating}
        class="items-center small-desktop:items-baseline"
      />
      <Switcher
        options={modeOptions}
        bind:value={selectedMode}
        label="Mode"
        disabled={generating}
        class="items-center small-desktop:items-baseline"
      />
    </div>
    <p class="text-caption text-mute text-center">
      Glass and Retro require dark mode. Leave on Auto to let the AI decide.
    </p>
  </form>

  <!-- ── Preview Controls ───────────────────────────────────────────── -->
  {#if previewResult && previewHandle !== null}
    <div
      class="surface-void p-md flex flex-col-reverse small-desktop:flex-col gap-md items-center"
      in:emerge
      out:dissolve
    >
      <div class="flex flex-row flex-wrap gap-md justify-center">
        <button
          class="btn-premium"
          onclick={keep}
          disabled={generating || !editLabel.trim()}
        >
          Keep This Atmosphere
        </button>
        <ActionBtn
          icon={Refresh}
          text="Try Another"
          type="button"
          class="btn-ghost btn-system"
          onclick={() => generate(true)}
          disabled={generating}
        />
        <ActionBtn
          icon={Undo}
          text="Revert"
          type="button"
          class="btn-ghost btn-error"
          onclick={revert}
          disabled={generating}
        />
      </div>

      <div class="flex flex-row flex-wrap gap-md justify-center">
        <div class="flex flex-row gap-md">
          <span class="text-small text-main">{previewResult.label}</span>
          <span class="text-small text-mute">{previewResult.tagline}</span>
        </div>
        <div class="flex flex-row gap-sm">
          <span class="badge">{previewResult.definition.physics}</span>
          <span class="badge">{previewResult.definition.mode}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- ── Inline Palette Editor ──────────────────────────────────────── -->
  <details ontoggle={handleDetailsToggle}>
    <summary>Customize Colors</summary>
    <div class="flex flex-col gap-lg p-md">
      <!-- Identity -->
      <div class="flex flex-col gap-md">
        <h5 class="text-center">Identity</h5>
        <div class="flex flex-col tablet:flex-row gap-sm">
          <FormField
            label="Name"
            required
            error={editDirty && !editLabel.trim()
              ? 'Give your atmosphere a name to keep it'
              : ''}
            class="flex-1"
          >
            {#snippet children({ fieldId, descriptionId, invalid })}
              <input
                type="text"
                id={fieldId}
                bind:value={editLabel}
                oninput={() => (editDirty = true)}
                placeholder="Atmosphere name"
                maxlength={30}
                required
                aria-invalid={invalid}
                aria-describedby={descriptionId}
                class="w-full"
              />
            {/snippet}
          </FormField>
          <FormField label="Tagline" class="flex-1">
            {#snippet children({ fieldId, descriptionId, invalid })}
              <input
                type="text"
                id={fieldId}
                bind:value={editTagline}
                placeholder="Short description (e.g., Cyber / Synthwave)"
                maxlength={40}
                aria-invalid={invalid}
                aria-describedby={descriptionId}
                class="w-full"
              />
            {/snippet}
          </FormField>
        </div>
      </div>

      <!-- Physics & Mode -->
      <div class="flex flex-col gap-md">
        <h5 class="text-center">Presets</h5>
        <div class="flex flex-row gap-lg flex-wrap justify-center">
          <Switcher
            options={editPhysicsOptions}
            bind:value={editPhysics}
            label="Physics"
          />
          <Switcher
            options={editModeOptions}
            bind:value={editMode}
            label="Mode"
          />
        </div>
        <p class="text-caption text-mute text-center">
          Glass and Retro require dark mode.
        </p>
      </div>

      <!-- Core Palette -->
      {#each PALETTE_GROUPS as group}
        <div class="flex flex-col gap-md">
          <h5 class="text-center">{group.heading}</h5>
          {#if group.heading === 'Surfaces' && editPhysics !== 'flat'}
            <p
              class="text-caption text-mute text-center"
              in:emerge
              out:dissolve
            >
              {editPhysics === 'glass' ? 'Glass' : 'Retro'} surfaces need transparency.
              Use the sliders to set opacity.
            </p>
          {/if}
          <div
            class="surface-void p-md flex flex-col tablet:flex-row tablet:flex-wrap gap-md tablet:justify-center"
          >
            {#each group.fields as field}
              <div
                class="flex flex-col items-stretch tablet:items-center gap-xs"
              >
                <span class="text-caption text-dim tablet:text-center"
                  >{field.label}</span
                >
                <div class="flex flex-row items-center gap-xs">
                  <input
                    type="color"
                    value={isValidHex(editPalette[field.key] ?? '')
                      ? editPalette[field.key]
                      : '#000000'}
                    oninput={(e) => {
                      editPalette[field.key] = (
                        e.target as HTMLInputElement
                      ).value;
                      editDirty = true;
                    }}
                    class="palette-picker"
                  />
                  <input
                    type="text"
                    value={editPalette[field.key] ?? ''}
                    oninput={(e) => handleHexInput(field.key, e)}
                    maxlength={7}
                    placeholder="#000000"
                    spellcheck={false}
                    autocomplete="off"
                    aria-invalid={editPalette[field.key] &&
                    !isValidHex(editPalette[field.key])
                      ? true
                      : undefined}
                    class="palette-hex-input"
                  />
                </div>
                {#if field.hint}
                  <span class="text-caption text-mute tablet:text-center"
                    >{field.hint}</span
                  >
                {/if}
                {#if editOpacityKeys.has(field.key)}
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    class="flex items-center gap-xs"
                    in:emerge
                    out:dissolve
                    oninput={() => (editDirty = true)}
                  >
                    <SliderField
                      bind:value={editOpacity[field.key]}
                      min={5}
                      max={100}
                      step={5}
                      class="w-full"
                    />
                    <span class="text-caption text-mute"
                      >{editOpacity[field.key]}%</span
                    >
                  </div>
                {/if}
              </div>
            {/each}
            {#if group.heading === 'Backgrounds' && editBgModeWarning}
              <p
                class="text-caption text-center text-premium"
                in:emerge={{ y: -8 }}
                out:dissolve={{ y: -8 }}
              >
                {editMode === 'dark'
                  ? 'Your backgrounds look light for a dark theme. Consider darker values or switching to light mode.'
                  : 'Your backgrounds look dark for a light theme. Consider lighter values or switching to dark mode.'}
              </p>
            {/if}
            {#if group.heading === 'Text' && editTextModeWarning}
              <p
                class="text-caption text-center text-premium"
                in:emerge={{ y: -8 }}
                out:dissolve={{ y: -8 }}
              >
                {editMode === 'dark'
                  ? 'Some text colors look dark and may lack contrast on dark backgrounds.'
                  : 'Some text colors look light and may lack contrast on light backgrounds.'}
              </p>
            {/if}
          </div>
        </div>
      {/each}

      <!-- Semantic Color Overrides -->
      <div class="flex flex-col gap-md">
        <h5 class="text-center">Semantic Colors</h5>
        <div class="surface-void p-md flex flex-col gap-md">
          <div
            class="flex flex-col tablet:flex-row tablet:flex-wrap gap-md tablet:justify-center"
          >
            <div class="flex flex-col items-stretch tablet:items-center gap-xs">
              <span class="text-caption text-dim tablet:text-center"
                >Premium</span
              >
              <div class="flex flex-row items-center gap-xs">
                <input
                  type="color"
                  value={isValidHex(editColorPremium)
                    ? editColorPremium
                    : '#000000'}
                  oninput={(e) => {
                    editColorPremium = (e.target as HTMLInputElement).value;
                    editDirty = true;
                  }}
                  class="palette-picker"
                />
                <input
                  type="text"
                  value={editColorPremium}
                  oninput={(e) =>
                    handleSemanticHexInput((v) => (editColorPremium = v), e)}
                  maxlength={7}
                  placeholder="#000000"
                  spellcheck={false}
                  autocomplete="off"
                  aria-invalid={editColorPremium &&
                  !isValidHex(editColorPremium)
                    ? true
                    : undefined}
                  class="palette-hex-input"
                />
              </div>
              <span class="text-caption text-mute tablet:text-center"
                >Credits, badges, caution</span
              >
            </div>
            <div class="flex flex-col items-stretch tablet:items-center gap-xs">
              <span class="text-caption text-dim tablet:text-center"
                >System</span
              >
              <div class="flex flex-row items-center gap-xs">
                <input
                  type="color"
                  value={isValidHex(editColorSystem)
                    ? editColorSystem
                    : '#000000'}
                  oninput={(e) => {
                    editColorSystem = (e.target as HTMLInputElement).value;
                    editDirty = true;
                  }}
                  class="palette-picker"
                />
                <input
                  type="text"
                  value={editColorSystem}
                  oninput={(e) =>
                    handleSemanticHexInput((v) => (editColorSystem = v), e)}
                  maxlength={7}
                  placeholder="#000000"
                  spellcheck={false}
                  autocomplete="off"
                  aria-invalid={editColorSystem && !isValidHex(editColorSystem)
                    ? true
                    : undefined}
                  class="palette-hex-input"
                />
              </div>
              <span class="text-caption text-mute tablet:text-center"
                >AI features, platform alerts</span
              >
            </div>
          </div>
          {#if editPremiumCollision || editSystemCollision}
            <p
              class="text-caption text-center text-premium"
              in:emerge={{ y: -8 }}
              out:dissolve={{ y: -8 }}
            >
              {#if editPremiumCollision && editSystemCollision}
                Your energy colors overlap with both premium and system
                defaults. Pick distinct overrides to keep badges visible.
              {:else if editPremiumCollision}
                Your energy colors are in the gold/amber range and may blend
                with premium badges. Pick a non-amber premium color.
              {:else}
                Your energy colors are in the purple range and may blend with
                system indicators. Pick a non-purple system color.
              {/if}
            </p>
          {/if}
        </div>
      </div>

      <!-- Typography -->
      <div class="flex flex-col gap-md">
        <h5 class="text-center">Typography</h5>
        <div class="flex flex-col small-desktop:flex-row justify-center gap-sm">
          <Selector
            label="Heading Font"
            options={fontOptions}
            bind:value={editFontHeadingKey}
            onchange={() => (editDirty = true)}
          />
          <Selector
            label="Body Font"
            options={fontOptions}
            bind:value={editFontBodyKey}
            onchange={() => (editDirty = true)}
          />
        </div>
      </div>

      <!-- Error -->
      {#if editError}
        <p
          class="text-error text-center text-small"
          in:emerge={{ y: -8 }}
          out:dissolve={{ y: -8 }}
        >
          {editError}
        </p>
      {/if}

      <!-- Restore / Export -->
      <div class="flex justify-center gap-md">
        <ActionBtn
          icon={Undo}
          text={generatedResult ? 'Restore Generated' : 'Reset Colors'}
          type="button"
          class="btn-ghost"
          onclick={restoreGenerated}
          disabled={!editDirty}
        />
        <IconBtn
          icon={Copy}
          iconProps={{ 'data-state': exportCopied ? 'active' : '' }}
          onclick={copyExportCode}
          disabled={!editLabel.trim()}
          aria-label="Copy theme code"
        />
      </div>
    </div>
  </details>

  {#if !voidEngine.userConfig.adaptAtmosphere}
    <p class="text-caption text-mute text-center">
      Theme overrides are disabled, so generated atmospheres will be saved and
      applied immediately with no preview or live customizer. Enable "Allow
      theme overrides" in the Themes modal to preview before keeping.
    </p>
  {/if}
</div>

<style lang="scss">
  @use '../styles/abstracts' as *;

  .palette-picker {
    width: var(--space-lg);
    height: var(--space-lg);
    border-radius: var(--radius-full);
    border: var(--physics-border-width) solid var(--border-color);
    flex-shrink: 0;
    padding: 0;
    cursor: pointer;
    background: none;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    &::-webkit-color-swatch {
      border: none;
      border-radius: var(--radius-full);
    }

    &::-moz-color-swatch {
      border: none;
      border-radius: var(--radius-full);
    }
  }

  .palette-hex-input {
    font-family: var(--font-code);
    width: 7em;
  }
</style>
