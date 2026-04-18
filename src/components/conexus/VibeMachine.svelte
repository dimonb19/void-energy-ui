<!--
  VIBE MACHINE — One-shot AI vibe generator.

  Click "Generate" → Claude invents a fresh vibe (palette + ambient layers +
  kinetic text + one-shots). If an InWorld API key is saved, the text narrates
  in sync with the reveal — audio drives the kinetic timeline, one-shot ambient
  bursts fire on their dramatic words.

  STATES
  idle     → nothing rendered, button shows "Generate vibe"
  loading  → skeleton shimmer, beat + TTS fetching in parallel
  playing  → theme applied, ambient layers mounted, audio + reveal running
  done     → reveal complete, button shows "Generate another vibe"

  API KEYS
  - Story beats: server-side via ANTHROPIC_API_KEY (same pattern as
    /api/generate-atmosphere).
  - TTS: user-provided InWorld key, stored in localStorage.
-->
<script lang="ts">
  import KineticText from '@dgrslabs/void-energy-kinetic-text/component';
  import { createVoidEnergyTextStyleSnapshot } from '@dgrslabs/void-energy-kinetic-text/adapters/void-energy-host';
  import type {
    KineticCue,
    KineticTextControls,
    RevealMark,
    TextStyleSnapshot,
  } from '@dgrslabs/void-energy-kinetic-text/types';
  import {
    syncAudioToKT,
    wordTimesToRevealMarks,
  } from '@dgrslabs/void-energy-kinetic-text/tts';
  import { inworldSynthesize } from '@dgrslabs/void-energy-kinetic-text/tts/providers';
  import {
    ActionLayer,
    AtmosphereLayer,
    EnvironmentLayer,
    PsychologyLayer,
  } from '@dgrslabs/void-energy-ambient-layers';
  import '@dgrslabs/void-energy-ambient-layers/styles';
  import '@dgrslabs/void-energy-kinetic-text/styles';

  import { tick } from 'svelte';
  import { toast } from '@stores/toast.svelte';
  import { storyBeatEngine } from '@lib/story-beat-engine.svelte';
  import { generateNextBeat } from '@lib/story-beat-client';
  import type { StoryAction, StoryBeat } from '@lib/story-beat-types';
  import {
    buildCuesFromOneShots,
    generateSpontaneousExtras,
    scheduleActions,
    wordSpansOf,
    wordStartTimes,
  } from '@lib/story-beat-cues';
  import type { WordTimestamp } from '@dgrslabs/void-energy-kinetic-text/tts';
  import { morph } from '@actions/morph';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import PasswordField from '@components/ui/PasswordField.svelte';
  import Selector from '@components/ui/Selector.svelte';
  import Toggle from '@components/ui/Toggle.svelte';
  import Sparkle from '@components/icons/Sparkle.svelte';
  import Restart from '@components/icons/Restart.svelte';
  import { Trash2, FastForward } from '@lucide/svelte';
  import LoadingTextCycler from '../../../packages/dgrs/src/components/LoadingTextCycler.svelte';

  type Status = 'idle' | 'loading' | 'playing' | 'done';
  type TtsStatus = 'idle' | 'synthesizing' | 'playing' | 'error';

  const TTS_KEY_STORAGE = 'vibe-machine-inworld-key';
  const DEFAULT_VOICE = 'Ashley';
  const RECENT_TITLES_CAP = 10;
  /** Ms of idle time in `status === 'done'` before ambient layers auto-release. */
  const IDLE_AMBIENT_TIMEOUT_MS = 30_000;

  /** Curated InWorld voice presets. Users can experiment — all InWorld voices
   * work, these are just the well-known starting points. */
  const VOICE_OPTIONS = [
    { value: 'Ashley', label: 'Ashley — warm, female' },
    { value: 'Alex', label: 'Alex — clear, male' },
    { value: 'Dennis', label: 'Dennis — deep, male' },
    { value: 'Hades', label: 'Hades — dark, male' },
    { value: 'Dominus', label: 'Dominus — authoritative, male' },
    { value: 'Julia', label: 'Julia — calm, female' },
    { value: 'Emma', label: 'Emma — bright, female' },
    { value: 'Craig', label: 'Craig — gravelly, male' },
  ];

  // ── Core state ───────────────────────────────────────────────────────
  let status = $state<Status>('idle');
  let abortController = $state<AbortController | null>(null);
  let recentTitles = $state<string[]>([]);

  // ── TTS state ────────────────────────────────────────────────────────
  /** Key committed to localStorage — source of truth for "am I connected". */
  let storedKey = $state('');
  /** Draft input value — only promoted to storedKey on explicit save. */
  let draftKey = $state('');
  let ttsVoiceId = $state<string | number | null>(DEFAULT_VOICE);
  let narrate = $state(true);
  let ttsStatus = $state<TtsStatus>('idle');
  // Token guards against a late-returning synth hijacking a newer beat.
  let ttsGeneration = 0;
  // Counter appended to `ktKey` purely to force a KT remount when the beat.id
  // alone can't signal "play again from scratch" — replay re-runs the same
  // beat, so without this the timeline stays in `isComplete` and the audio
  // sync handler early-returns on `play`. New generations get a fresh mount
  // automatically via the new beat.id.
  let ktRemountCounter = $state(0);

  // ── Playback state (per beat) ────────────────────────────────────────
  let audioEl = $state<HTMLAudioElement | null>(null);
  let revealMarks = $state<RevealMark[] | undefined>(undefined);
  let kineticCues = $state<KineticCue[]>([]);
  let paused = $state(false);
  let ktControls = $state<KineticTextControls | undefined>(undefined);
  let actionTimers: number[] = [];
  let liveActions = $state<Array<{ id: number; action: StoryAction }>>([]);
  let nextLiveActionId = 0;

  // ── Replay cache ─────────────────────────────────────────────────────
  // Owns the synthesized blob URL across replays. Cleared (and the URL
  // revoked) only on a brand-new generation or unmount — never on the
  // per-playback teardown that detaches `audioEl`.
  type ReplayPayload = {
    beat: StoryBeat;
    audioUrl: string | null;
    marks: RevealMark[] | undefined;
    cues: KineticCue[];
    wordStarts: number[];
    // Spontaneous ambient bursts generated at playback time. Cached so replay
    // fires the same surprises at the same word indices — replay should be
    // deterministic against the vibe the user just heard.
    extraActions: StoryAction[];
  };
  let replayCache = $state<ReplayPayload | null>(null);

  // ── Snapshot target — KT reads typography from this element ──────────
  let snapshotEl: HTMLElement | undefined = $state();
  let snapshotTick = $state(0);
  const snapshot: TextStyleSnapshot | null = $derived(
    snapshotEl && snapshotTick >= 0
      ? createVoidEnergyTextStyleSnapshot(snapshotEl)
      : null,
  );

  const currentBeat = $derived<StoryBeat | null>(storyBeatEngine.currentBeat);
  const activeAmbient = $derived(storyBeatEngine.activeAmbient);

  // Remount only on new-beat or explicit replay. We intentionally do NOT key
  // on `ttsGeneration` — it bumps mid-synth as a guard token, and keying on
  // it would tear down the skeleton while the user is watching it.
  const ktKey = $derived(
    currentBeat ? `${currentBeat.id}-${ktRemountCounter}` : 'none',
  );

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

  // ── Cleanup helpers ──────────────────────────────────────────────────
  function clearActionTimers() {
    for (const t of actionTimers) clearTimeout(t);
    actionTimers = [];
  }

  function cleanupAudio() {
    // Nulling audioEl triggers the sync $effect's cleanup, which detaches
    // syncAudioToKT. Don't try to manage the sync handle externally —
    // letting the effect own it avoids stale-handle races across beats.
    //
    // Do NOT touch ktControls here: it's a $bindable prop, and assigning
    // `undefined` propagates through the binding into the still-mounted
    // child component, confusing its internals and causing flicker.
    // The stale-controls problem is solved by `await tick()` in
    // playWithTts before setting audioEl — by then the old KT is
    // unmounted and the new one has written fresh controls back.
    //
    // The blob URL is owned by replayCache, not this function — discarding
    // it here would break replay. Call discardReplayCache() to revoke.
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
      audioEl = null;
    }
  }

  function cacheForReplay(payload: ReplayPayload) {
    if (
      replayCache &&
      replayCache.audioUrl &&
      replayCache.audioUrl !== payload.audioUrl
    ) {
      URL.revokeObjectURL(replayCache.audioUrl);
    }
    replayCache = payload;
  }

  function discardReplayCache() {
    if (replayCache?.audioUrl) {
      URL.revokeObjectURL(replayCache.audioUrl);
    }
    replayCache = null;
  }

  function scheduleBeatActions(
    actions: StoryAction[] | undefined,
    wordStarts: number[],
    audioStartMs: number,
  ) {
    clearActionTimers();
    const scheduled = scheduleActions(actions, wordStarts);
    for (const { atMs, action } of scheduled) {
      const delayMs = Math.max(0, atMs - audioStartMs);
      const timerId = window.setTimeout(() => {
        const id = nextLiveActionId++;
        liveActions = [...liveActions, { id, action }];
      }, delayMs);
      actionTimers.push(timerId);
    }
  }

  function removeLiveAction(id: number) {
    liveActions = liveActions.filter((e) => e.id !== id);
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
      cleanupAudio();
      discardReplayCache();
      clearActionTimers();
      liveActions = [];
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

  // Bind audio ↔ KineticText once BOTH are ready. The effect owns its own
  // cleanup — when any dep flips (new beat's audio replaces the old,
  // KT remounts with fresh controls), the cleanup detaches the previous
  // sync before the new one attaches. No external handle needed.
  // Bind audio ↔ KineticText once BOTH are ready. The effect owns its own
  // cleanup — when any dep flips the previous sync detaches before the new
  // one attaches. Guard requires marks to be a non-empty array (empty marks
  // produces a degenerate all-at-t=0 timeline — see stagger.marksToDelays).
  $effect(() => {
    const audio = audioEl;
    const controls = ktControls;
    const marks = revealMarks;
    if (!audio || !controls || !marks || marks.length === 0) return;

    const detachSync = syncAudioToKT({ audio, controls });

    const onEnded = () => {
      if (ttsStatus === 'playing') ttsStatus = 'idle';
    };
    audio.addEventListener('ended', onEnded);

    audio.play().then(
      () => {
        ttsStatus = 'playing';
        paused = false;
      },
      (err: Error) => {
        toast.show(`Audio playback blocked: ${err.message}`, 'error');
        ttsStatus = 'error';
      },
    );

    return () => {
      audio.removeEventListener('ended', onEnded);
      detachSync();
    };
  });

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
  // Keeps the text on screen but silences the always-on GPU cost so a laptop
  // left on the page doesn't spin up fans forever.
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
    cleanupAudio();
    discardReplayCache();
    clearActionTimers();
    liveActions = [];
    revealMarks = undefined;
    kineticCues = [];
    paused = false;
    ttsStatus = 'idle';
    // Clear the previous beat's text + ambient before we start generating.
    // The template routes on `currentBeat`: keeping the old one through
    // Claude gen would render the KT skeleton for the old text under the
    // old title. Releasing here puts us back in a clean "no beat" state
    // so the LoadingTextCycler shows until the new beat arrives.
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
    // KineticText skeleton with pretext-measured geometry (exact line count +
    // widths) instead of a generic loader. When status flips to 'playing' the
    // skeleton crossfades straight into the reveal, no remount.
    storyBeatEngine.applyBeat(beat);

    const key = storedKey.trim();
    const voice = typeof ttsVoiceId === 'string' ? ttsVoiceId.trim() : '';
    const shouldNarrate = narrate && !!key && !!voice;

    if (shouldNarrate) {
      loadingToast.update('Synthesizing voice…');
      await playWithTts(beat, key, voice, loadingToast);
    } else {
      loadingToast.success(`"${beat.title}" is playing.`);
      playWithoutTts(beat);
    }
  }

  /**
   * InWorld sometimes returns zero word timestamps (voice tier, API quirk).
   * When that happens we fall back to evenly distributing the beat's words
   * across the actual audio duration — the reveal stays paced to the voice
   * even without provider-level alignment.
   *
   * Requires the audio element to have `loadedmetadata` fired first so
   * `audio.duration` is known.
   */
  function synthesizeEvenTimestamps(
    text: string,
    durationMs: number,
  ): WordTimestamp[] {
    const spans = wordSpansOf(text);
    if (spans.length === 0 || durationMs <= 0) return [];
    const slice = durationMs / spans.length;
    return spans.map((s, i) => ({
      word: text.slice(s.start, s.end),
      startMs: i * slice,
      endMs: (i + 1) * slice,
    }));
  }

  function waitForAudioDuration(el: HTMLAudioElement): Promise<number> {
    return new Promise((resolve) => {
      if (Number.isFinite(el.duration) && el.duration > 0) {
        resolve(el.duration * 1000);
        return;
      }
      const onLoaded = () => {
        el.removeEventListener('loadedmetadata', onLoaded);
        el.removeEventListener('error', onError);
        resolve(Number.isFinite(el.duration) ? el.duration * 1000 : 0);
      };
      const onError = () => {
        el.removeEventListener('loadedmetadata', onLoaded);
        el.removeEventListener('error', onError);
        resolve(0);
      };
      el.addEventListener('loadedmetadata', onLoaded);
      el.addEventListener('error', onError);
    });
  }

  async function playWithTts(
    beat: StoryBeat,
    key: string,
    voice: string,
    loadingToast: VoidLoadingToastController,
  ) {
    const token = ++ttsGeneration;
    ttsStatus = 'synthesizing';
    try {
      const synthResult = await inworldSynthesize(beat.text, {
        voiceId: voice,
        apiKey: key,
      });
      if (token !== ttsGeneration) {
        URL.revokeObjectURL(synthResult.audioUrl);
        loadingToast.close();
        return;
      }

      const el = new Audio();
      el.preload = 'auto';
      el.src = synthResult.audioUrl;

      // Decide on timestamps. Prefer InWorld's alignment when present;
      // otherwise derive even spacing from the actual audio duration.
      let timestamps = synthResult.wordTimestamps;
      let derivedDuration = 0;
      if (timestamps.length === 0) {
        derivedDuration = await waitForAudioDuration(el);
        if (token !== ttsGeneration) {
          URL.revokeObjectURL(synthResult.audioUrl);
          loadingToast.close();
          return;
        }
        timestamps = synthesizeEvenTimestamps(beat.text, derivedDuration);
      }

      const speed = beat.kinetic.speed ?? 'default';
      const wordStarts = wordStartTimes(beat.text, speed, timestamps);
      const marks =
        timestamps.length > 0
          ? wordTimesToRevealMarks(beat.text, timestamps)
          : [];

      // If we STILL have no marks (no alignment + no duration), fall back to
      // stagger mode. Leaving marks as [] would collapse to an instant reveal
      // via stagger.marksToDelays.
      if (marks.length === 0) {
        loadingToast.success(`"${beat.title}" is playing.`);
        playWithoutTts(beat, el, synthResult.audioUrl);
        return;
      }

      const extras = generateSpontaneousExtras(beat, wordStarts.length);
      const allOneShots = [
        ...(beat.kinetic.oneShots ?? []),
        ...extras.oneShots,
      ];
      const allActions = [...(beat.ambient.actions ?? []), ...extras.actions];

      const cues = buildCuesFromOneShots(allOneShots, wordStarts);
      revealMarks = marks;
      kineticCues = cues;
      paused = true;

      scheduleBeatActions(allActions, wordStarts, 0);

      status = 'playing';

      cacheForReplay({
        beat,
        audioUrl: synthResult.audioUrl,
        marks,
        cues,
        wordStarts,
        extraActions: extras.actions,
      });

      // Let fresh KT mount and write its controls back via bind:controls
      // BEFORE exposing audioEl to the sync $effect — otherwise the effect
      // fires once with stale controls (bind:controls doesn't clear on
      // unmount), consumes audio's `play` event, and the fresh sync misses
      // the chance to catch it.
      await tick();
      if (token !== ttsGeneration) {
        URL.revokeObjectURL(synthResult.audioUrl);
        loadingToast.close();
        return;
      }
      audioEl = el;
      loadingToast.success(`"${beat.title}" is playing.`);
    } catch (e) {
      if (token !== ttsGeneration) {
        loadingToast.close();
        return;
      }
      const message = e instanceof Error ? e.message : 'TTS synthesis failed.';
      loadingToast.error(message);
      ttsStatus = 'error';
      playWithoutTts(beat);
    }
  }

  /**
   * Stagger-reveal fallback. Called directly when no TTS key is set, and
   * also from the TTS path when InWorld + audio duration both fail to
   * yield usable word timings. Optionally plays the pre-loaded audio in
   * parallel (audio on, kinetic on its own stagger clock).
   */
  function playWithoutTts(
    beat: StoryBeat,
    preloadedAudio?: HTMLAudioElement,
    preloadedAudioUrl?: string,
  ) {
    const speed = beat.kinetic.speed ?? 'default';
    const wordStarts = wordStartTimes(beat.text, speed);
    const extras = generateSpontaneousExtras(beat, wordStarts.length);
    const allOneShots = [...(beat.kinetic.oneShots ?? []), ...extras.oneShots];
    const allActions = [...(beat.ambient.actions ?? []), ...extras.actions];
    const cues = buildCuesFromOneShots(allOneShots, wordStarts);
    revealMarks = undefined;
    kineticCues = cues;
    paused = false;
    ttsGeneration++;

    scheduleBeatActions(allActions, wordStarts, 0);

    status = 'playing';

    cacheForReplay({
      beat,
      audioUrl: preloadedAudioUrl ?? null,
      marks: undefined,
      cues,
      wordStarts,
      extraActions: extras.actions,
    });

    // Best-effort: if the TTS path already loaded audio, play it alongside
    // the stagger reveal. Sync won't be word-perfect but the voice still
    // accompanies the beat.
    if (preloadedAudio) {
      preloadedAudio.play().catch(() => {
        // Autoplay blocked — quietly skip; the reveal still runs.
      });
    }
  }

  function onRevealComplete() {
    if (status === 'playing') status = 'done';
  }

  function handleSkip() {
    if (status !== 'playing') return;
    ktControls?.skipToEnd();
    audioEl?.pause();
  }

  /**
   * Re-runs the last beat from cache: same text, same audio buffer, same
   * action schedule. Skips Claude + InWorld entirely — both calls are
   * paid, and the user just wants to re-experience what they already saw.
   *
   * Bumps ttsGeneration to remount KineticText (fresh timeline) and
   * re-creates the Audio element from the cached blob URL so the sync
   * $effect re-attaches.
   */
  async function handleReplay() {
    if (!replayCache || status === 'loading' || status === 'playing') return;

    cleanupAudio();
    clearActionTimers();
    liveActions = [];
    ttsStatus = 'idle';

    const { beat, audioUrl, marks, cues, wordStarts, extraActions } =
      replayCache;
    const hasAlignedAudio = !!audioUrl && !!marks && marks.length > 0;

    revealMarks = marks;
    kineticCues = cues;
    paused = hasAlignedAudio;
    ttsGeneration++;
    // Replay reuses the same beat.id — bump the remount counter so KT gets a
    // fresh timeline instead of one stuck in the post-reveal `isComplete`
    // state, which would cause the audio sync handler to early-return.
    ktRemountCounter++;

    const allActions = [...(beat.ambient.actions ?? []), ...extraActions];
    scheduleBeatActions(allActions, wordStarts, 0);
    storyBeatEngine.applyBeat(beat);
    status = 'playing';

    if (audioUrl) {
      const el = new Audio();
      el.preload = 'auto';
      el.src = audioUrl;
      await tick();
      if (hasAlignedAudio) {
        // Sync $effect will start playback once KT remounts and writes
        // fresh controls — same handoff as the original playWithTts.
        audioEl = el;
      } else {
        // Stagger-with-audio replay: $effect bails (no marks), so play
        // independently. Still assign audioEl so cleanup detaches later.
        audioEl = el;
        el.play().catch(() => {});
      }
    }
  }
</script>

<!-- Persistent ambient layers — mounted declaratively from engine.activeAmbient. -->
{#if activeAmbient.environment}
  {#each activeAmbient.environment as entry (entry.layer)}
    {#key `${entry.layer}-${entry.intensity}`}
      <EnvironmentLayer variant={entry.layer} intensity={entry.intensity} />
    {/key}
  {/each}
{/if}
{#if activeAmbient.atmosphere}
  {#each activeAmbient.atmosphere as entry (entry.layer)}
    {#key `${entry.layer}-${entry.intensity}`}
      <AtmosphereLayer
        variant={entry.layer}
        intensity={entry.intensity}
        durationMs={0}
      />
    {/key}
  {/each}
{/if}
{#if activeAmbient.psychology}
  {#each activeAmbient.psychology as entry (entry.layer)}
    {#key `${entry.layer}-${entry.intensity}`}
      <PsychologyLayer
        variant={entry.layer}
        intensity={entry.intensity}
        durationMs={0}
      />
    {/key}
  {/each}
{/if}

<!-- One-shot ambient action bursts (scheduled to spoken words). -->
{#each liveActions as entry (entry.id)}
  <ActionLayer
    variant={entry.action.variant}
    intensity={entry.action.intensity}
    onEnd={() => removeLiveAction(entry.id)}
  />
{/each}

<section class="container py-2xl flex flex-col gap-xl items-center">
  <div class="flex flex-col gap-xs text-center max-w-2xl">
    <h1 class="text-h2">Vibe Machine</h1>
    <p class="text-dim text-body">
      Claude invents a fresh vibe on every click — new ambient layers, new
      kinetic text, one-shot bursts on dramatic words.
    </p>
  </div>

  <div
    class="surface-raised p-lg flex flex-col gap-lg w-full max-w-4xl"
    use:morph
  >
    {#if currentBeat}
      <header class="flex flex-col gap-xs text-center">
        <h2 class="text-h3">{currentBeat.title}</h2>
        {#if currentBeat.tagline}
          <p class="text-small text-dim">{currentBeat.tagline}</p>
        {/if}
      </header>
    {/if}

    <div
      class="surface-sunk p-lg flex flex-col gap-lg text-body"
      bind:this={snapshotEl}
    >
      {#if status === 'idle'}
        <p class="text-mute text-center text-body p-lg">
          Your vibe will appear here.
        </p>
      {:else if status === 'loading' && !currentBeat}
        <!-- Pre-beat phase: text is not known yet (Claude still generating).
             Once the beat returns the branch below takes over with a
             pretext-measured skeleton sized to the real text. -->
        <div class="flex justify-center p-lg">
          <LoadingTextCycler />
        </div>
      {:else if snapshot && currentBeat}
        {#key ktKey}
          <KineticText
            text={currentBeat.text}
            styleSnapshot={snapshot}
            loading={status === 'loading'}
            revealMode="char"
            revealStyle={currentBeat.kinetic.revealStyle}
            activeEffect={currentBeat.kinetic.continuous ?? null}
            speedPreset={ttsEnabled
              ? undefined
              : (currentBeat.kinetic.speed ?? 'default')}
            {revealMarks}
            cues={kineticCues}
            {paused}
            bind:controls={ktControls}
            onrevealcomplete={onRevealComplete}
          />
        {/key}
      {/if}
    </div>

    {#if currentBeat && (status === 'playing' || status === 'done')}
      <div
        class="flex flex-wrap justify-center gap-xs"
        aria-label="Active effects"
      >
        <span
          class="inline-flex items-center gap-xs px-sm py-xs text-caption border border-border rounded-full bg-sunk"
        >
          <span class="text-mute">reveal</span>
          <span class="text-main">{currentBeat.kinetic.revealStyle}</span>
        </span>
        {#if currentBeat.kinetic.continuous}
          <span
            class="inline-flex items-center gap-xs px-sm py-xs text-caption border border-border rounded-full bg-sunk"
          >
            <span class="text-mute">continuous</span>
            <span class="text-main">{currentBeat.kinetic.continuous}</span>
          </span>
        {/if}
        {#if currentBeat.kinetic.speed}
          <span
            class="inline-flex items-center gap-xs px-sm py-xs text-caption border border-border rounded-full bg-sunk"
          >
            <span class="text-mute">speed</span>
            <span class="text-main">{currentBeat.kinetic.speed}</span>
          </span>
        {/if}
        {#each currentBeat.ambient.environment ?? [] as e (e.layer)}
          <span
            class="inline-flex items-center gap-xs px-sm py-xs text-caption border border-border rounded-full bg-sunk"
          >
            <span class="text-mute">environment</span>
            <span class="text-main">{e.layer}</span>
            <span class="text-dim">· {e.intensity}</span>
          </span>
        {/each}
        {#each currentBeat.ambient.atmosphere ?? [] as a (a.layer)}
          <span
            class="inline-flex items-center gap-xs px-sm py-xs text-caption border border-border rounded-full bg-sunk"
          >
            <span class="text-mute">atmosphere</span>
            <span class="text-main">{a.layer}</span>
            <span class="text-dim">· {a.intensity}</span>
          </span>
        {/each}
        {#each currentBeat.ambient.psychology ?? [] as p (p.layer)}
          <span
            class="inline-flex items-center gap-xs px-sm py-xs text-caption border border-border rounded-full bg-sunk"
          >
            <span class="text-mute">psychology</span>
            <span class="text-main">{p.layer}</span>
            <span class="text-dim">· {p.intensity}</span>
          </span>
        {/each}
        {#each currentBeat.kinetic.oneShots ?? [] as o, i (`${o.effect}-${o.atWord}-${i}`)}
          <span
            class="inline-flex items-center gap-xs px-sm py-xs text-caption border border-premium-subtle rounded-full bg-sunk"
          >
            <span class="text-mute">one-shot</span>
            <span class="text-premium">{o.effect}</span>
            <span class="text-dim">@word {o.atWord}</span>
          </span>
        {/each}
        {#each currentBeat.ambient.actions ?? [] as a, i (`${a.variant}-${a.atWord}-${i}`)}
          <span
            class="inline-flex items-center gap-xs px-sm py-xs text-caption border border-premium-subtle rounded-full bg-sunk"
          >
            <span class="text-mute">burst</span>
            <span class="text-premium">{a.variant}</span>
            <span class="text-dim">· {a.intensity} @word {a.atWord}</span>
          </span>
        {/each}
      </div>
    {/if}

    <div class="flex flex-wrap justify-center gap-md">
      <ActionBtn
        class="btn-system"
        icon={buttonIcon}
        text={buttonLabel}
        onclick={status === 'playing' ? handleSkip : handleGenerate}
        disabled={status === 'loading'}
      />
      {#if replayCache && status === 'done'}
        <ActionBtn icon={Restart} text="Replay vibe" onclick={handleReplay} />
      {/if}
    </div>

    <div class="surface-sunk p-md flex flex-col gap-md">
      <div class="flex flex-col gap-xs">
        <p class="text-small text-dim">InWorld TTS narration</p>
        <p class="text-caption text-mute">
          Optional — spoken voice with reveal word-timed to the audio.
        </p>
      </div>

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
              class="btn-system"
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
        <div class="flex items-center justify-between gap-md">
          <div class="flex flex-col gap-xs">
            <p class="text-small">
              <span class="text-success">Connected to InWorld</span>
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

      <Selector
        label="Voice"
        options={VOICE_OPTIONS}
        bind:value={ttsVoiceId}
        disabled={!hasStoredKey}
      />

      <Toggle
        checked={narrate}
        onchange={(v) => (narrate = v ?? false)}
        disabled={!hasStoredKey}
        label="Narrate each new vibe"
      />
    </div>
  </div>
</section>
