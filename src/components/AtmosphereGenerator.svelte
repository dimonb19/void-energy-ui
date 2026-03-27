<!--
  ATMOSPHERE GENERATOR
  "Type a vibe → get a complete atmosphere" — AI theme generation demo.

  Uses the Claude API (client-side, PUBLIC_ env key) to generate complete
  VoidThemeDefinitions from creative concept descriptions.

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
  import { modal } from '@lib/modal-manager.svelte';
  import { generateAtmosphere } from '@lib/atmosphere-generator';

  import { emerge, dissolve } from '@lib/transitions.svelte';

  import ActionBtn from './ui/ActionBtn.svelte';
  import Switcher from './ui/Switcher.svelte';
  import Sparkle from './icons/Sparkle.svelte';
  import Refresh from './icons/Refresh.svelte';
  import Undo from './icons/Undo.svelte';
  import LoadingQuill from './icons/LoadingQuill.svelte';
  import { Palette } from '@lucide/svelte';

  interface AtmosphereGeneratorProps {
    class?: string;
  }

  let { class: className = '' }: AtmosphereGeneratorProps = $props();

  // ── Generation State ───────────────────────────────────────────────────

  let vibe = $state('');
  let generating = $state(false);
  let abortController = $state<AbortController | undefined>(undefined);

  // Preview tracking
  let previewId = $state<string | null>(null);
  let previewHandle = $state<number | null>(null);
  let previewResult = $state<GeneratedAtmosphere | null>(null);

  // Detect when our preview was cleaned up externally (e.g., manual
  // fragment activated its own preview via the onPreviewActivated callback).
  // Reset local UI so stale controls don't linger.
  $effect(() => {
    if (previewId && !voidEngine.availableAtmospheres.includes(previewId)) {
      previewId = null;
      previewHandle = null;
      previewResult = null;
    }
  });

  // ── Preference State ──────────────────────────────────────────────────

  let selectedPhysics = $state<PhysicsPreference | null>(null);
  let selectedMode = $state<ModePreference | null>(null);

  // Glass and retro require dark mode; light only works with flat.
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

  const modeOptions = $derived([
    { value: null, label: 'Auto' },
    { value: 'dark' as const, label: 'Dark' },
    {
      value: 'light' as const,
      label: 'Light',
      disabled: selectedPhysics === 'glass' || selectedPhysics === 'retro',
    },
  ]);

  // Reconcile stale state: if the other switcher makes our value invalid, reset to Auto.
  // This is a defensive cleanup path — with disabled options the user can't normally
  // reach an invalid combo through clicks, but programmatic or rapid state changes
  // could leave stale values.
  $effect(() => {
    if (
      selectedMode === 'light' &&
      (selectedPhysics === 'glass' || selectedPhysics === 'retro')
    ) {
      selectedPhysics = null;
    }
  });
  $effect(() => {
    if (
      (selectedPhysics === 'glass' || selectedPhysics === 'retro') &&
      selectedMode === 'light'
    ) {
      selectedMode = null;
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

  // ── Preview Lifecycle ──────────────────────────────────────────────────

  /**
   * Apply a fresh preview (no existing preview active).
   * If adaptAtmosphere is off, promotes immediately.
   */
  function applyPreview(result: GeneratedAtmosphere) {
    voidEngine.registerEphemeralTheme(result.id, result.definition);

    // pushTemporaryTheme returns null when adaptAtmosphere is off.
    // Since this is explicitly user-initiated, promote directly.
    const handle = voidEngine.pushTemporaryTheme(
      result.id,
      `AI: ${result.label}`,
    );

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

  /**
   * Swap an existing preview for a new one in-place (single transition).
   * Uses updateTemporaryTheme to avoid the restore→reapply bounce.
   */
  function replacePreview(result: GeneratedAtmosphere) {
    const oldId = previewId;

    // Register new ephemeral first so the theme exists before swapping
    voidEngine.registerEphemeralTheme(result.id, result.definition);

    // Swap the temporary theme handle in-place — single _applyAtmosphere call
    voidEngine.updateTemporaryTheme(
      previewHandle!,
      result.id,
      `AI: ${result.label}`,
    );

    // Clean up old ephemeral registration
    if (oldId) {
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

  // ── Actions ────────────────────────────────────────────────────────────

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

    // Success — swap in-place if preview exists, otherwise fresh push
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

    // Promote: unregister ephemeral → register persistent → setAtmosphere.
    // setAtmosphere calls clearTemporaryThemes (empties stack, no restore)
    // then _applyAtmosphere — single transition, no flicker.
    voidEngine.unregisterEphemeralTheme(id);
    voidEngine.registerTheme(id, result.definition);
    voidEngine.setAtmosphere(id);

    previewId = null;
    previewHandle = null;
    previewResult = null;

    toast.show(`"${result.label}" is now your atmosphere.`, 'success');
  }

  function revert() {
    if (generating) return;
    cleanupPreview();
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    generate();
  }
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

    <ActionBtn
      icon={Palette}
      text="Pick Colors Manually"
      type="button"
      class="btn-ghost"
      disabled={generating}
      onclick={() =>
        modal.open(
          'manual-atmosphere',
          { onPreviewActivated: () => cleanupPreview() },
          'lg',
        )}
    />
  </form>

  <!-- ── Preview Controls ───────────────────────────────────────────── -->
  {#if previewResult && previewHandle !== null}
    <div
      class="surface-sunk p-md flex flex-col-reverse small-desktop:flex-col gap-md items-center"
      in:emerge
      out:dissolve
    >
      <div class="flex flex-row flex-wrap gap-md justify-center">
        <button class="btn-premium" onclick={keep} disabled={generating}>
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
</div>
