<!--
  ATMOSPHERE GENERATOR
  "Type a vibe → get a complete atmosphere" — AI theme generation demo.

  Uses the Claude API (client-side, user's own key) to generate complete
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
  import {
    generateAtmosphere,
    getStoredApiKey,
    setStoredApiKey,
    clearStoredApiKey,
    type GeneratedAtmosphere,
  } from '@lib/atmosphere-generator';

  import { emerge, dissolve } from '@lib/transitions.svelte';

  import PasswordField from './ui/PasswordField.svelte';
  import Toggle from './ui/Toggle.svelte';
  import Sparkle from './icons/Sparkle.svelte';
  import { KeyRound, Trash2, Wand2 } from '@lucide/svelte';

  interface AtmosphereGeneratorProps {
    class?: string;
  }

  let { class: className = '' }: AtmosphereGeneratorProps = $props();

  // ── API Key State ──────────────────────────────────────────────────────

  let apiKey = $state('');
  let rememberKey = $state(false);
  let keyReady = $state(false);

  // Hydrate from localStorage on mount
  $effect(() => {
    const stored = getStoredApiKey();
    if (stored) {
      apiKey = stored;
      rememberKey = true;
      keyReady = true;
    }
  });

  function saveKey() {
    if (!apiKey.trim()) return;
    keyReady = true;
    if (rememberKey) {
      setStoredApiKey(apiKey.trim());
    }
  }

  function forgetKey() {
    apiKey = '';
    keyReady = false;
    rememberKey = false;
    clearStoredApiKey();
  }

  // Sync remember preference: persist or clear when toggled
  $effect(() => {
    if (keyReady && rememberKey && apiKey) {
      setStoredApiKey(apiKey);
    } else if (!rememberKey) {
      clearStoredApiKey();
    }
  });

  // ── Generation State ───────────────────────────────────────────────────

  let vibe = $state('');
  let generating = $state(false);
  let abortController = $state<AbortController | undefined>(undefined);

  // Preview tracking
  let previewId = $state<string | null>(null);
  let previewHandle = $state<number | null>(null);
  let previewResult = $state<GeneratedAtmosphere | null>(null);

  let canGenerate = $derived(keyReady && vibe.trim().length > 0 && !generating);

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

  async function generate() {
    if (!canGenerate) return;

    generating = true;
    const controller = new AbortController();
    abortController = controller;
    const loadingToast = toast.loading(
      'Generating atmosphere... (Esc to cancel)',
    );

    const result = await generateAtmosphere({
      apiKey,
      vibe: vibe.trim(),
      signal: controller.signal,
    });

    generating = false;
    abortController = undefined;

    if (!result.ok) {
      if (result.error.message === 'Generation cancelled.') {
        loadingToast.close();
        return;
      }

      if (result.error.status === 401) {
        forgetKey();
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

  function handleKeySubmit(e: SubmitEvent) {
    e.preventDefault();
    saveKey();
  }
</script>

<div class="surface-raised p-lg flex flex-col gap-lg {className}">
  <!-- ── API Key Section ──────────────────────────────────────────────── -->
  {#if !keyReady}
    <form
      class="flex flex-col gap-md"
      in:emerge
      out:dissolve
      onsubmit={handleKeySubmit}
    >
      <div class="flex flex-row gap-sm items-center">
        <KeyRound class="icon text-mute" />
        <h4>Claude API Key</h4>
      </div>
      <PasswordField
        bind:value={apiKey}
        placeholder="sk-ant-..."
        autocomplete="off"
      />
      <div class="flex flex-row gap-md items-center justify-between">
        <Toggle bind:checked={rememberKey} label="Remember on this device" />
        <button type="submit" disabled={!apiKey.trim()}>Save Key</button>
      </div>
      <p class="text-caption text-mute">
        Your key is stored locally and sent directly to Anthropic. It never
        touches our servers.
      </p>
    </form>
  {:else}
    <div
      class="flex flex-row gap-md items-center justify-between"
      in:emerge
      out:dissolve
    >
      <div class="flex flex-row gap-sm items-center">
        <KeyRound class="icon text-success" />
        <span class="text-small text-dim">API key ready</span>
      </div>
      <button type="button" class="btn-ghost btn-error" onclick={forgetKey}>
        <Trash2 class="icon" />
        Clear Key
      </button>
    </div>

    <!-- ── Vibe Input ───────────────────────────────────────────────── -->
    <form class="flex flex-col gap-md" onsubmit={handleSubmit}>
      <div class="flex flex-row gap-sm">
        <input
          type="text"
          bind:value={vibe}
          placeholder="Describe a vibe... (e.g., 'underwater bioluminescence')"
          disabled={generating}
          class="flex-1"
        />
        <button
          type="submit"
          disabled={!canGenerate}
          class="flex flex-row gap-xs items-center"
        >
          {#if generating}
            <Wand2 class="icon animate-spin" />
            Generating...
          {:else}
            <Sparkle class="icon" />
            Generate
          {/if}
        </button>
      </div>
    </form>

    <!-- ── Preview Controls ─────────────────────────────────────────── -->
    {#if previewResult && previewHandle !== null}
      <div
        class="surface-sunk p-md flex flex-col gap-md"
        in:emerge
        out:dissolve
      >
        <div class="flex flex-col gap-xs">
          <span class="text-small font-bold">{previewResult.label}</span>
          <span class="text-caption text-dim">{previewResult.tagline}</span>
          <span class="text-caption text-mute">
            {previewResult.definition.physics} &middot; {previewResult
              .definition.mode}
          </span>
        </div>
        <div class="flex flex-row gap-sm flex-wrap">
          <button onclick={keep} disabled={generating}
            >Keep This Atmosphere</button
          >
          <button
            type="button"
            class="btn-system"
            onclick={generate}
            disabled={generating}
          >
            Try Another
          </button>
          <button
            type="button"
            class="btn-ghost btn-error"
            onclick={revert}
            disabled={generating}
          >
            Revert
          </button>
        </div>
      </div>
    {/if}
  {/if}
</div>
