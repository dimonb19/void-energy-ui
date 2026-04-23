<!--
  VIBE MACHINE — One-shot AI vibe generator.

  Click "Generate" → Claude invents a fresh vibe (palette + ambient layers +
  kinetic text + one-shots). If an InWorld API key is saved, the text narrates
  in sync with the reveal — audio drives the kinetic timeline, one-shot ambient
  bursts fire on their dramatic words.

  All TTS↔kinetic sync plus audio-driven burst dispatch is delegated to
  <TtsKineticBlock>. This component owns beat generation, TTS synthesis,
  ambient-layer application, and replay caching — playback mechanics live
  in the kinetic-text package.

  STATES
  idle     → nothing rendered, button shows "Generate vibe"
  loading  → skeleton shimmer, beat + TTS fetching in parallel
  playing  → theme applied, ambient layers mounted, audio + reveal running
  done     → reveal complete, button shows "Generate another vibe"

  API KEYS
  - Story beats: server-side via ANTHROPIC_API_KEY.
  - TTS: user-provided InWorld key, stored in localStorage.
-->
<script lang="ts">
  import { createVoidEnergyTextStyleSnapshot } from '@void-energy/kinetic-text/adapters/void-energy-host';
  import type {
    TextStyleSnapshot,
    KineticSpeedPreset,
  } from '@void-energy/kinetic-text/types';
  import type {
    TimedAction,
    TimedCue,
    WordTimestamp,
  } from '@void-energy/kinetic-text/tts';
  import TtsKineticBlock from '@void-energy/kinetic-text/tts-block';
  import KineticText from '@void-energy/kinetic-text/component';
  import { inworldSynthesize } from '@void-energy/kinetic-text/tts/providers';
  import { ambient } from '@void-energy/ambient-layers';
  import '@void-energy/kinetic-text/styles';

  import { toast } from '@stores/toast.svelte';
  import { storyBeatEngine } from '@lib/story-beat-engine.svelte';
  import { generateNextBeat } from '@lib/story-beat-client';
  import type {
    StoryAction,
    StoryBeat,
    StoryOneShot,
  } from '@lib/story-beat-types';
  import { generateSpontaneousExtras, wordSpansOf } from '@lib/story-beat-cues';
  import { morph } from '@actions/morph';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import PasswordField from '@components/ui/PasswordField.svelte';
  import Selector from '@components/ui/Selector.svelte';
  import Toggle from '@components/ui/Toggle.svelte';
  import Sparkle from '@components/icons/Sparkle.svelte';
  import Restart from '@components/icons/Restart.svelte';
  import Remove from '@components/icons/Remove.svelte';
  import { Trash2, FastForward } from '@lucide/svelte';
  import {
    dematerialize,
    dissolve,
    emerge,
    materialize,
  } from '@lib/transitions.svelte';

  type Status = 'idle' | 'loading' | 'playing' | 'done';

  const TTS_KEY_STORAGE = 'vibe-machine-inworld-key';
  const DEFAULT_VOICE = 'Ashley';
  const RECENT_TITLES_CAP = 10;
  /** Ms of idle time in `status === 'done'` before ambient layers auto-release. */
  const IDLE_AMBIENT_TIMEOUT_MS = 30_000;

  /** Playback rate presets. TtsKineticBlock inherits these via `audio.playbackRate`. */
  const RATE_OPTIONS = [
    { value: 0.75, label: '0.75× — slower' },
    { value: 1, label: '1× — real time' },
    { value: 1.25, label: '1.25× — brisk' },
    { value: 1.5, label: '1.5× — fast' },
    { value: 2, label: '2× — double' },
  ];

  const VOICE_OPTIONS = [
    { value: 'Ashley', label: 'Ashley — warm, female' },
    { value: 'Olivia', label: 'Olivia — upbeat British, female' },
    { value: 'Julia', label: 'Julia — calm, female' },
    { value: 'Emma', label: 'Emma — bright, female' },
    { value: 'Sarah', label: 'Sarah — female' },
    { value: 'Chloe', label: 'Chloe — female' },
    { value: 'Alex', label: 'Alex — clear, male' },
    { value: 'Edward', label: 'Edward — fast-talking, male' },
    { value: 'Dennis', label: 'Dennis — deep, male' },
    { value: 'Hades', label: 'Hades — dark, male' },
    { value: 'Dominus', label: 'Dominus — authoritative, male' },
    { value: 'Craig', label: 'Craig — gravelly, male' },
  ];

  // ── Core state ───────────────────────────────────────────────────────
  let status = $state<Status>('idle');
  let abortController = $state<AbortController | null>(null);
  let recentTitles = $state<string[]>([]);

  // ── TTS state ────────────────────────────────────────────────────────
  let storedKey = $state('');
  let draftKey = $state('');
  let ttsVoiceId = $state<string | number | null>(DEFAULT_VOICE);
  let narrate = $state(true);
  let playbackRate = $state<string | number | null>(1);

  // ── Playback data (per beat) ─────────────────────────────────────────
  // Mirrors what <TtsKineticBlock> needs to drive reveal + bursts. A fresh
  // PlaybackData identity is a new "vibe"; keying the block on
  // `beat.id + replayCounter` remounts it for replay.
  interface PlaybackData {
    beat: StoryBeat;
    audio: Blob | null;
    wordTimestamps: WordTimestamp[] | undefined;
    cues: TimedCue[];
    actions: TimedAction<StoryAction>[];
    extras: { actions: StoryAction[]; oneShots: StoryOneShot[] };
  }
  let playbackData = $state<PlaybackData | null>(null);
  let replayCounter = $state(0);
  let paused = $state(false);

  // Normalized numeric rate pushed straight to TtsKineticBlock as a prop.
  // The block applies it to its internal audio element and the `ratechange`
  // event inside the package scales the reveal timeline in lock-step.
  const resolvedPlaybackRate = $derived(
    typeof playbackRate === 'number' ? playbackRate : 1,
  );

  // ── Snapshot target — KT reads typography from this element ──────────
  let snapshotEl: HTMLElement | undefined = $state();
  let titleEl: HTMLElement | undefined = $state();
  let taglineEl: HTMLElement | undefined = $state();
  let snapshotTick = $state(0);
  const snapshot: TextStyleSnapshot | null = $derived(
    snapshotEl && snapshotTick >= 0
      ? createVoidEnergyTextStyleSnapshot(snapshotEl)
      : null,
  );
  const titleSnapshot: TextStyleSnapshot | null = $derived(
    titleEl && snapshotTick >= 0
      ? createVoidEnergyTextStyleSnapshot(titleEl)
      : null,
  );
  const taglineSnapshot: TextStyleSnapshot | null = $derived(
    taglineEl && snapshotTick >= 0
      ? createVoidEnergyTextStyleSnapshot(taglineEl)
      : null,
  );

  const currentBeat = $derived<StoryBeat | null>(storyBeatEngine.currentBeat);

  const hasStoredKey = $derived(storedKey.trim().length > 0);
  const ttsEnabled = $derived(narrate && hasStoredKey);
  const buttonLabel = $derived(
    status === 'idle'
      ? 'Generate vibe'
      : status === 'loading'
        ? 'Generating…'
        : status === 'playing'
          ? 'Skip to end'
          : 'Generate another vibe',
  );
  const buttonIcon = $derived(status === 'playing' ? FastForward : Sparkle);

  // ── Playback block key (drives remount on new beat + replay) ─────────
  const blockKey = $derived(
    playbackData ? `${playbackData.beat.id}-${replayCounter}` : 'none',
  );

  // ── Helpers ──────────────────────────────────────────────────────────
  function buildCuesFromBeat(
    oneShots: StoryOneShot[],
    extras: StoryOneShot[],
  ): TimedCue[] {
    return [...oneShots, ...extras].map((shot) => ({
      atWord: shot.atWord,
      effect: shot.effect,
    }));
  }

  function buildActionsFromBeat(
    beatActions: StoryAction[],
    extras: StoryAction[],
  ): TimedAction<StoryAction>[] {
    return [...beatActions, ...extras].map((action) => ({
      atWord: action.atWord,
      payload: action,
    }));
  }

  function dispatchAmbientAction(action: StoryAction) {
    ambient.fire(action.variant, action.intensity);
  }

  function discardPlayback() {
    playbackData = null;
  }

  // ── Mount / unmount ──────────────────────────────────────────────────
  $effect(() => {
    try {
      const stored = localStorage.getItem(TTS_KEY_STORAGE);
      if (stored) storedKey = stored;
    } catch {
      // localStorage may be unavailable — ignore
    }

    const observer = new MutationObserver(() => {
      snapshotTick++;
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-atmosphere', 'data-physics', 'data-mode'],
    });

    return () => {
      observer.disconnect();
      abortController?.abort();
      discardPlayback();
      ambient.clear('action');
      storyBeatEngine.release();
    };
  });

  function saveKey() {
    const k = draftKey.trim();
    if (!k) return;
    try {
      localStorage.setItem(TTS_KEY_STORAGE, k);
      storedKey = k;
      draftKey = '';
      toast.show('InWorld key saved', 'success');
    } catch {
      toast.show('Could not save — localStorage may be unavailable.', 'error');
    }
  }

  function removeKey() {
    try {
      localStorage.removeItem(TTS_KEY_STORAGE);
    } catch {
      // Storage unavailable — state reset below still takes effect
    }
    storedKey = '';
    toast.show('InWorld key removed', 'info');
  }

  function maskKey(k: string): string {
    if (k.length <= 8) return '•'.repeat(Math.max(k.length, 4));
    return `${k.slice(0, 6)}…${k.slice(-4)}`;
  }

  function onKeyInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveKey();
    }
  }

  // Escape cancels an in-flight generation.
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && status === 'loading' && abortController) {
      e.preventDefault();
      abortController.abort();
    }
  }

  $effect(() => {
    if (status !== 'loading') return;
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });

  // Auto-release ambient layers after the reveal has been idle for a while.
  $effect(() => {
    if (status !== 'done') return;
    const timerId = window.setTimeout(() => {
      storyBeatEngine.releaseAmbient();
    }, IDLE_AMBIENT_TIMEOUT_MS);
    return () => clearTimeout(timerId);
  });

  // ── Generate flow ────────────────────────────────────────────────────
  async function handleGenerate() {
    if (status === 'loading' || status === 'playing') return;

    abortController?.abort();
    discardPlayback();
    ambient.clear('action');
    paused = false;
    storyBeatEngine.release();

    status = 'loading';

    const controller = new AbortController();
    abortController = controller;
    const loadingToast = toast.loading('Generating vibe… (Esc to cancel)');

    const beatResult = await generateNextBeat({
      recentTitles,
      signal: controller.signal,
    });

    abortController = null;

    if (!beatResult.ok) {
      if (beatResult.error.message === 'Generation cancelled.') {
        loadingToast.close();
      } else {
        loadingToast.error(beatResult.error.message);
      }
      status = currentBeat ? 'done' : 'idle';
      return;
    }

    const beat = beatResult.data;
    recentTitles = [
      ...recentTitles.slice(-(RECENT_TITLES_CAP - 1)),
      beat.title,
    ];

    // Apply the beat now — before TTS synth — so the text well can render the
    // KineticText skeleton with pretext-measured geometry while TTS fetches.
    storyBeatEngine.applyBeat(beat);

    const key = storedKey.trim();
    const voice = typeof ttsVoiceId === 'string' ? ttsVoiceId.trim() : '';
    const shouldNarrate = narrate && !!key && !!voice;

    // Spontaneous extras are filler cues unrelated to the voiced narration.
    // During TTS they compete with the deliberate, semantically-anchored
    // moments the LLM placed on dramatic words — so we only use them on the
    // silent fallback path, where there's no narration for them to fight with.
    const wordCount = wordSpansOf(beat.text).length;
    const extras = shouldNarrate
      ? { actions: [] as StoryAction[], oneShots: [] as StoryOneShot[] }
      : generateSpontaneousExtras(beat, wordCount);
    const cues = buildCuesFromBeat(
      beat.kinetic.oneShots ?? [],
      extras.oneShots,
    );
    const actions = buildActionsFromBeat(
      beat.ambient.actions ?? [],
      extras.actions,
    );

    // Mount the block now with no audio yet. TtsKineticBlock measures `beat.text`
    // and shows a correctly-sized skeleton while TTS synth is in flight.
    // Audio/timestamps get patched in when synthesis resolves; blockKey is keyed
    // on beat.id + replayCounter so this prop update never remounts — the
    // skeleton crossfades straight into the reveal.
    playbackData = {
      beat,
      audio: null,
      wordTimestamps: undefined,
      cues,
      actions,
      extras,
    };

    if (shouldNarrate) {
      loadingToast.update('Synthesizing voice…');
      try {
        const synthResult = await inworldSynthesize(beat.text, {
          voiceId: voice,
          apiKey: key,
        });
        // The provider pre-creates an ObjectURL we won't use — TtsKineticBlock
        // wraps the Blob itself. Revoke the provider's URL so the Blob doesn't
        // get pinned twice.
        URL.revokeObjectURL(synthResult.audioUrl);

        playbackData = {
          beat,
          audio: synthResult.audioBlob,
          wordTimestamps:
            synthResult.wordTimestamps.length > 0
              ? synthResult.wordTimestamps
              : undefined,
          cues,
          actions,
          extras,
        };
        status = 'playing';
        loadingToast.success(`"${beat.title}" is playing.`);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'TTS synthesis failed.';
        loadingToast.error(message);
        // Fall through to non-narrated playback — playbackData already holds
        // the null-audio shape, so just flip status and KT starts the stagger reveal.
        status = 'playing';
      }
    } else {
      status = 'playing';
      loadingToast.success(`"${beat.title}" is playing.`);
    }
  }

  function onRevealComplete() {
    if (status === 'playing') status = 'done';
  }

  function handleSkip() {
    // Audio lives inside TtsKineticBlock (constructed via `new Audio()`, not
    // in the DOM) and is not currently exposed to consumers — so we can only
    // mark status done here. Audio will continue playing in the background
    // until the clip ends. A follow-up should expose a skipToEnd() method on
    // TtsKineticBlock so the consumer can properly silence audio on skip.
    status = 'done';
  }

  function handleClear() {
    abortController?.abort();
    discardPlayback();
    ambient.clear('action');
    paused = false;
    storyBeatEngine.release();
    status = 'idle';
  }

  function handleReplay() {
    if (!playbackData || status === 'loading' || status === 'playing') return;
    // Re-apply ambient (cleared on cancel/done can leave environment stale if
    // `done` path already ran the idle timer).
    storyBeatEngine.applyBeat(playbackData.beat);
    ambient.clear('action');
    replayCounter++;
    paused = false;
    status = 'playing';
  }
</script>

<section class="container py-2xl flex flex-col gap-lg">
  <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
    <h3 class="text-dim">Vibe Machine</h3>
    <p class="text-small text-mute">
      Claude invents a fresh vibe on every click — new ambient layers, new
      kinetic text, one-shot bursts on dramatic words.
    </p>
  </div>

  <div class="surface-raised p-lg flex flex-col gap-lg" use:morph>
    <header class="flex flex-col gap-xs text-center">
      <h2 class="text-h3" bind:this={titleEl}>
        {#if currentBeat && titleSnapshot}
          {#key currentBeat.title}
            <KineticText
              text={currentBeat.title}
              styleSnapshot={titleSnapshot}
            />
          {/key}
        {:else}
          Vibe Machine
        {/if}
      </h2>
      <p class="text-small text-dim" bind:this={taglineEl}>
        {#if currentBeat?.tagline && taglineSnapshot}
          {#key currentBeat.tagline}
            <KineticText
              text={currentBeat.tagline}
              styleSnapshot={taglineSnapshot}
            />
          {/key}
        {:else}
          A fresh atmosphere, invented on demand.
        {/if}
      </p>
    </header>

    <div
      class="surface-sunk p-lg flex flex-col gap-lg text-body"
      bind:this={snapshotEl}
    >
      {#if status === 'idle'}
        <p class="text-mute text-center text-body p-lg">
          Your vibe will appear here.
        </p>
      {:else if status === 'loading' && !currentBeat}
        <!-- Pre-beat phase: text not known yet. Render a skeleton matching
             the same geometry KineticText uses pre-measurement (3 lines,
             last at 70%). When the beat arrives and TtsKineticBlock mounts,
             it starts with the same defaults then reflows to real geometry. -->
        <span class="kt-skeleton-layer" data-kt-skeleton="visible">
          {#each Array(3) as _, i}
            <span
              class="kt-skeleton-line"
              style:height="{snapshot?.lineHeight ?? 24}px"
              style:width={i === 2 ? '70%' : '100%'}
            ></span>
          {/each}
        </span>
      {:else if snapshot && playbackData}
        {#key blockKey}
          {@const beat = playbackData.beat}
          {@const fallbackSpeed: KineticSpeedPreset = beat.kinetic.speed ?? 'default'}
          <TtsKineticBlock
            text={beat.text}
            styleSnapshot={snapshot}
            audio={playbackData.audio ?? undefined}
            wordTimestamps={playbackData.wordTimestamps}
            revealMode="char"
            revealStyle={beat.kinetic.revealStyle}
            activeEffect={beat.kinetic.continuous ?? null}
            speedPreset={ttsEnabled ? undefined : fallbackSpeed}
            cues={playbackData.cues}
            actions={playbackData.actions}
            styleSpans={beat.styles}
            playbackRate={resolvedPlaybackRate}
            onaction={dispatchAmbientAction}
            loading={status === 'loading'}
            bind:paused
            onrevealcomplete={onRevealComplete}
          />
        {/key}
      {/if}
    </div>

    {#if currentBeat && playbackData && (status === 'playing' || status === 'done')}
      {@const k = currentBeat.kinetic}
      {@const env = currentBeat.ambient.environment ?? []}
      {@const atm = currentBeat.ambient.atmosphere ?? []}
      {@const psy = currentBeat.ambient.psychology ?? []}
      {@const beatOnes = k.oneShots ?? []}
      {@const beatBursts = currentBeat.ambient.actions ?? []}
      {@const extraOnes = playbackData.extras.oneShots}
      {@const extraBursts = playbackData.extras.actions}
      {@const wordCount = wordSpansOf(currentBeat.text).length}
      {@const timeline = [
        ...beatOnes.map((o) => ({
          atWord: o.atWord,
          channel: 'kinetic' as const,
          name: o.effect as string,
          detail: '',
          extra: false,
        })),
        ...extraOnes.map((o) => ({
          atWord: o.atWord,
          channel: 'kinetic' as const,
          name: o.effect as string,
          detail: '',
          extra: true,
        })),
        ...beatBursts.map((b) => ({
          atWord: b.atWord,
          channel: 'ambient' as const,
          name: b.variant as string,
          detail: b.intensity as string,
          extra: false,
        })),
        ...extraBursts.map((b) => ({
          atWord: b.atWord,
          channel: 'ambient' as const,
          name: b.variant as string,
          detail: b.intensity as string,
          extra: true,
        })),
      ].sort((a, b) => a.atWord - b.atWord)}
      {@const spans = currentBeat.styles ?? []}
      {@const wordRanges = wordSpansOf(currentBeat.text)}
      {@const sceneRows = env.length + atm.length + psy.length}
      {@const revealRows = 1 + (k.continuous ? 1 : 0) + (k.speed ? 1 : 0)}
      {@const total = sceneRows + revealRows + timeline.length + spans.length}
      <details in:emerge out:dissolve>
        <summary>Active effects · {total}</summary>
        <div class="p-md flex flex-col gap-lg">
          {#if sceneRows > 0}
            <div class="flex flex-col gap-xs">
              <p class="text-caption text-mute uppercase">Scene</p>
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Layer</th>
                      <th>Variant</th>
                      <th>Intensity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each env as e (e.layer)}
                      <tr>
                        <td>environment</td>
                        <td class="text-main">{e.layer}</td>
                        <td>{e.intensity}</td>
                      </tr>
                    {/each}
                    {#each atm as a (a.layer)}
                      <tr>
                        <td>atmosphere</td>
                        <td class="text-main">{a.layer}</td>
                        <td>{a.intensity}</td>
                      </tr>
                    {/each}
                    {#each psy as p (p.layer)}
                      <tr>
                        <td>psychology</td>
                        <td class="text-main">{p.layer}</td>
                        <td>{p.intensity}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/if}

          <div class="flex flex-col gap-xs">
            <p class="text-caption text-mute uppercase">Text</p>
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Behavior</th>
                    <th>Effect</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>reveal style</td>
                    <td class="text-main">{k.revealStyle}</td>
                  </tr>
                  {#if k.continuous}
                    <tr>
                      <td>continuous</td>
                      <td class="text-main">{k.continuous}</td>
                    </tr>
                  {/if}
                  {#if k.speed}
                    <tr>
                      <td>speed</td>
                      <td class="text-main">{k.speed}</td>
                    </tr>
                  {/if}
                </tbody>
              </table>
            </div>
          </div>

          {#if spans.length > 0}
            <div class="flex flex-col gap-xs">
              <p class="text-caption text-mute uppercase">
                Styles · {spans.length}
              </p>
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Range</th>
                      <th>Kind</th>
                      <th>Phrase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each spans as s, i (`${s.kind}-${s.fromWord}-${s.toWord}-${i}`)}
                      {@const from = wordRanges[s.fromWord]}
                      {@const to = wordRanges[s.toWord]}
                      {@const phrase =
                        from && to
                          ? currentBeat.text.slice(from.start, to.end)
                          : '—'}
                      <tr>
                        <td>
                          {#if s.fromWord === s.toWord}
                            @ word {s.fromWord}
                          {:else}
                            words {s.fromWord}–{s.toWord}
                          {/if}
                        </td>
                        <td class="text-premium">{s.kind}</td>
                        <td>{phrase}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/if}

          {#if timeline.length > 0}
            <div class="flex flex-col gap-xs">
              <p class="text-caption text-mute uppercase">
                Timeline · {timeline.length}
              </p>
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Channel</th>
                      <th>Effect</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each timeline as t, i (`${t.channel}-${t.atWord}-${t.name}-${i}`)}
                      <tr>
                        <td>@ word {t.atWord} / {wordCount}</td>
                        <td>{t.channel}</td>
                        <td class="text-premium">
                          {t.name}{#if t.extra}<span class="text-mute">
                              · extra</span
                            >{/if}
                        </td>
                        <td>{t.detail || '—'}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/if}
        </div>
      </details>
    {/if}

    <div class="flex flex-wrap justify-center gap-md">
      <ActionBtn
        class="btn-system"
        icon={buttonIcon}
        text={buttonLabel}
        onclick={status === 'playing' ? handleSkip : handleGenerate}
        disabled={status === 'loading'}
      />
      {#if playbackData && status === 'done'}
        <span in:materialize out:dematerialize>
          <ActionBtn icon={Restart} text="Replay vibe" onclick={handleReplay} />
        </span>
      {/if}
      {#if currentBeat && (status === 'playing' || status === 'done')}
        <span in:materialize out:dematerialize>
          <ActionBtn
            class="btn-ghost btn-error"
            icon={Remove}
            text="Clear vibe"
            onclick={handleClear}
          />
        </span>
      {/if}
    </div>

    <div class="surface-sunk p-md flex flex-col gap-md">
      {#if !hasStoredKey}
        <div class="flex flex-col gap-xs">
          <label class="text-small text-dim" for="vibe-tts-key">
            InWorld API key
          </label>
          <div class="flex gap-sm items-start">
            <PasswordField
              id="vibe-tts-key"
              placeholder="inworld-..."
              autocomplete="off"
              bind:value={draftKey}
              onkeydown={onKeyInputKeydown}
              class="flex-1"
            />
            <ActionBtn
              class="btn-success"
              icon={Sparkle}
              text="Save"
              onclick={saveKey}
              disabled={draftKey.trim().length === 0}
            />
          </div>
          <p class="text-caption text-mute">
            Stored only in your browser's localStorage. Sent directly to
            InWorld's API from your browser — never to our servers.
          </p>
        </div>
      {:else}
        <div
          class="flex flex-row flex-wrap justify-center gap-sm items-center large-desktop:justify-between"
          in:materialize
          out:dematerialize
        >
          <span class="flex flex-col gap-sm small-desktop:flex-row">
            <Selector
              label="Voice"
              options={VOICE_OPTIONS}
              bind:value={ttsVoiceId}
              disabled={!hasStoredKey}
            />
            <Selector
              label="Playback speed"
              options={RATE_OPTIONS}
              bind:value={playbackRate}
              disabled={!hasStoredKey}
            />
          </span>
          <Toggle
            checked={narrate}
            onchange={(v) => (narrate = v ?? false)}
            disabled={!hasStoredKey}
            label="Narrate each new vibe"
          />
        </div>

        <div
          class="surface-spotlight p-md flex items-center justify-between gap-md"
          in:materialize
          out:dematerialize
        >
          <div class="flex flex-col gap-xs">
            <p class="text-small">
              <span class="text-success">InWorld TTS narration</span>
            </p>
            <p class="text-caption text-mute">
              Key: <code>{maskKey(storedKey)}</code>
            </p>
          </div>
          <button type="button" class="btn-ghost btn-error" onclick={removeKey}>
            <Trash2 class="icon" data-size="md" />
            Remove key
          </button>
        </div>
      {/if}
    </div>

    <details>
      <summary>How the sync works</summary>
      <div class="p-md flex flex-col gap-lg">
        <div class="flex flex-col gap-xs">
          <p class="text-caption text-mute uppercase">Clock</p>
          <p class="text-small text-dim">
            When <code>audio</code> is present it's the
            <span class="text-main">master clock</span>. Per-word timestamps
            spread linearly across each word's glyphs so characters reveal in
            lock-step with the voice; ambient actions ride the same clock.
            Reveal and actions follow <code>play</code>, <code>pause</code>,
            <code>seeked</code>, <code>ratechange</code>, and auto-nudge on
            drift &gt; 250 ms. No audio → reveal runs on
            <code>speedPreset</code>.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-caption text-mute uppercase">Three effect layers</p>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>What it does</th>
                  <th>Driven by</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Reveal</td>
                  <td>
                    Per-glyph entrance (<code>pop</code>, <code>drop</code>,
                    <code>scramble</code>)
                  </td>
                  <td><code>revealStyle</code> + reveal marks</td>
                </tr>
                <tr>
                  <td>Continuous</td>
                  <td>
                    Sustained loop (<code>pulse</code>, <code>drift</code>,
                    <code>breathe</code>)
                  </td>
                  <td><code>activeEffect</code></td>
                </tr>
                <tr>
                  <td>One-shot</td>
                  <td>
                    Punctuating hits (<code>shake</code>, <code>flash</code>,
                    <code>surge</code>) at word positions
                  </td>
                  <td><code>cues: TimedCue[]</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-caption text-mute">
            All three compose — swapping one never interrupts the others.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-caption text-mute uppercase">Fallbacks</p>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Situation</th>
                  <th>Behavior</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Audio + word timestamps</td>
                  <td>Character-accurate sync (ideal path)</td>
                </tr>
                <tr>
                  <td>Audio, no timestamps</td>
                  <td>Distribute words evenly across clip duration</td>
                </tr>
                <tr>
                  <td>No audio</td>
                  <td>
                    Stagger reveal on <code>speedPreset</code>; actions fire on
                    <code>setTimeout</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-caption text-mute uppercase">Inline text styles</p>
          <p class="text-small text-dim">
            Claude can tag word ranges with one of five inline visual
            treatments. Zero to three per beat. Applied on the
            <code>kt-word</code> wrapper as <code>data-kt-style</code>; composes
            with effects — a styled word can still carry a one-shot at the same
            position.
          </p>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Style</th>
                  <th>Example</th>
                  <th>When Claude reaches for it</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-premium">speech</td>
                  <td>a voice says <em>&ldquo;come home&rdquo;</em></td>
                  <td>
                    Direct dialogue — a voice, command, or remembered phrase.
                  </td>
                </tr>
                <tr>
                  <td class="text-premium">aside</td>
                  <td>
                    the house settles,
                    <span class="text-mute">tired of morning</span>
                  </td>
                  <td>
                    Hushed parenthetical or second-layer detail. Volume-down
                    pair to <em>emphasis</em>.
                  </td>
                </tr>
                <tr>
                  <td class="text-premium">emphasis</td>
                  <td>
                    the world <span class="font-bold">tilts</span>
                  </td>
                  <td>
                    The single load-bearing word the beat pivots on. At most
                    once per beat.
                  </td>
                </tr>
                <tr>
                  <td class="text-premium">underline</td>
                  <td>
                    the sign reads <span class="underline">KEEP OUT</span>
                  </td>
                  <td>Stark callout. Rare. Never more than two words.</td>
                </tr>
                <tr>
                  <td class="text-premium">code</td>
                  <td>
                    a notification surfaces: <code>OFFLINE</code>
                  </td>
                  <td>
                    System / machine voice — terminal lines, screen labels,
                    signage. Prefer single word; 2 is fine, 3+ rare.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </details>
  </div>
</section>
