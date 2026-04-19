<!--
  TtsKineticBlock — TTS-synced kinetic text with timed actions.

  A thin wrapper around <KineticText> that packages the common pattern of
  "play spoken audio, reveal text at the same cadence, fire side effects
  on timed words." Consumers pass text, audio, and timed cues/actions; the
  component owns the audio↔KT sync, blob-URL lifecycle, and action dispatch.

  The component is payload-agnostic: `actions: TimedAction<T>[]` carries any
  shape the consumer wants, and `onaction` fires with the payload at the
  right moment. Typical payload is an ambient burst descriptor dispatched
  via `ambient.fire(...)`, but it could equally be an analytics event or
  any custom side effect timed to narration.

  REPLAY: KineticText does not reset from the post-reveal `isComplete`
  state when new props arrive. To replay the same beat, key this component
  from the parent: `{#key replayCounter} <TtsKineticBlock ... /> {/key}`.
-->
<script module lang="ts">
  /** What the component is currently doing. Useful for loading/error UI. */
  export type TtsKineticStatus =
    | 'idle'
    | 'preparing'
    | 'ready'
    | 'playing'
    | 'done'
    | 'error';

  /** Acceptable audio sources. Blob is wrapped and the URL revoked on unmount. */
  export type TtsAudioSource =
    | HTMLAudioElement
    | Blob
    | string
    | null
    | undefined;
</script>

<script lang="ts" generics="ActionPayload = unknown">
  import type {
    KineticCue,
    KineticSpeedPreset,
    KineticTextControls,
    KineticTextEffect,
    ReducedMotionMode,
    RevealMark,
    RevealMode,
    RevealStyle,
    TextStyleSnapshot,
  } from '../types';
  import type { WordTimestamp } from '../tts/types';
  import type { TimedAction, TimedCue } from '../tts/timeline';
  import {
    buildKineticCues,
    resolveActionTimes,
    wordStartTimes,
  } from '../tts/timeline';
  import { wordTimesToRevealMarks } from '../tts/marks';
  import { syncAudioToKT } from '../tts/sync';
  import { attachAudioActions } from '../tts/dispatch';
  import KineticText from './KineticText.svelte';

  interface Props {
    text: string;
    styleSnapshot: TextStyleSnapshot;

    // Audio — any one of these, or none for a pure kinetic reveal.
    audio?: TtsAudioSource;
    /**
     * Word-level timestamps from the TTS provider. When present with audio,
     * the reveal syncs character-accurately to spoken audio. When absent with
     * audio, the component waits for audio metadata and falls back to even
     * distribution of words across the clip's duration.
     */
    wordTimestamps?: WordTimestamp[];

    // Timeline — all generic, payload-agnostic.
    cues?: TimedCue[];
    actions?: TimedAction<ActionPayload>[];
    onaction?: (payload: ActionPayload) => void;

    // Pass-through to KineticText.
    revealMode?: RevealMode;
    revealStyle?: RevealStyle;
    activeEffect?: KineticTextEffect | null;
    /**
     * Used only when no audio timestamps are available. Drives both the
     * reveal stagger and the fallback `atWord` resolution for cues/actions.
     */
    speedPreset?: KineticSpeedPreset;
    reducedMotion?: ReducedMotionMode;
    seed?: number;
    loading?: boolean;
    preRevealed?: boolean;
    skeletonLines?: number;
    skeletonLastLineWidth?: number;

    // Playback state.
    /**
     * Two-way bound. Set true to pause audio + reveal together, false to
     * resume. When audio is present, autoplay may be blocked — errors surface
     * via `onerror`.
     */
    paused?: boolean;
    /**
     * Two-way bound. Set externally only if you want to override the
     * component's internal state machine (rare).
     */
    status?: TtsKineticStatus;

    // Events.
    onrevealcomplete?: () => void;
    onplay?: () => void;
    onended?: () => void;
    onerror?: (err: Error) => void;
    onword?: (wordIndex: number, word: string) => void;

    // Presentation.
    as?: string;
    class?: string;
  }

  let {
    text,
    styleSnapshot,
    audio,
    wordTimestamps,
    cues,
    actions,
    onaction,
    revealMode = 'char',
    revealStyle,
    activeEffect = null,
    speedPreset = 'default',
    reducedMotion = 'auto',
    seed,
    loading = false,
    preRevealed = false,
    skeletonLines = 3,
    skeletonLastLineWidth = 0.7,
    paused = $bindable(false),
    status = $bindable('idle'),
    onrevealcomplete,
    onplay,
    onended,
    onerror,
    onword,
    as = 'span',
    class: className = '',
  }: Props = $props();

  // ── Resolved audio element ──────────────────────────────────────────
  // Effective word timestamps (either consumer-provided or fallback-derived).
  let effectiveTimestamps = $state<WordTimestamp[] | undefined>(undefined);
  let audioEl = $state<HTMLAudioElement | null>(null);
  let ownedUrl: string | null = null;
  let ktControls = $state<KineticTextControls | undefined>(undefined);

  // Resolve an audio source to an HTMLAudioElement. Records the ObjectURL
  // we create so we can revoke it on unmount — URLs the consumer owns
  // (passed as string or HTMLAudioElement) are left alone.
  function resolveAudio(source: TtsAudioSource): HTMLAudioElement | null {
    if (!source) return null;
    if (source instanceof HTMLAudioElement) return source;
    const el = new Audio();
    el.preload = 'auto';
    if (source instanceof Blob) {
      ownedUrl = URL.createObjectURL(source);
      el.src = ownedUrl;
    } else if (typeof source === 'string') {
      el.src = source;
    }
    return el;
  }

  function revokeOwnedUrl() {
    if (ownedUrl) {
      URL.revokeObjectURL(ownedUrl);
      ownedUrl = null;
    }
  }

  // Whenever the `audio` prop changes identity, resolve it and — when the
  // consumer didn't supply word timestamps — wait for metadata to derive
  // an even-distribution fallback that still paces the reveal to the voice.
  $effect(() => {
    const source = audio;
    revokeOwnedUrl();
    const el = resolveAudio(source);
    audioEl = el;

    if (!el) {
      effectiveTimestamps = wordTimestamps;
      status = 'ready';
      return;
    }

    if (wordTimestamps && wordTimestamps.length > 0) {
      effectiveTimestamps = wordTimestamps;
      status = 'ready';
      return;
    }

    // No timestamps — derive from duration once metadata is known.
    status = 'preparing';
    let cancelled = false;

    const finalize = (durationMs: number) => {
      if (cancelled) return;
      effectiveTimestamps =
        durationMs > 0 ? evenTimestamps(text, durationMs) : [];
      status = 'ready';
    };

    if (Number.isFinite(el.duration) && el.duration > 0) {
      finalize(el.duration * 1000);
    } else {
      const onLoaded = () => {
        el.removeEventListener('loadedmetadata', onLoaded);
        el.removeEventListener('error', onErrorMeta);
        finalize(Number.isFinite(el.duration) ? el.duration * 1000 : 0);
      };
      const onErrorMeta = () => {
        el.removeEventListener('loadedmetadata', onLoaded);
        el.removeEventListener('error', onErrorMeta);
        finalize(0);
      };
      el.addEventListener('loadedmetadata', onLoaded);
      el.addEventListener('error', onErrorMeta);
    }

    return () => {
      cancelled = true;
    };
  });

  // ── Derived timeline artifacts ──────────────────────────────────────
  // wordStarts drives `atWord` resolution for both cues and actions.
  const wordStarts = $derived(
    wordStartTimes(text, speedPreset, effectiveTimestamps),
  );

  // RevealMarks come from the TTS word timestamps. No timestamps → undefined,
  // and KineticText falls back to its computed stagger from speedPreset.
  const revealMarks = $derived<RevealMark[] | undefined>(
    effectiveTimestamps && effectiveTimestamps.length > 0
      ? wordTimesToRevealMarks(text, effectiveTimestamps)
      : undefined,
  );

  const kineticCues = $derived<KineticCue[]>(
    buildKineticCues(cues, wordStarts),
  );

  // ── Audio ↔ KT sync ─────────────────────────────────────────────────
  // Bind audio events to KT controls once both are available AND marks are
  // non-empty. Empty marks produce a degenerate all-at-t=0 timeline, so
  // without the marks check the sync would force an instant reveal.
  $effect(() => {
    const el = audioEl;
    const controls = ktControls;
    const marks = revealMarks;
    if (!el || !controls || !marks || marks.length === 0) return;
    return syncAudioToKT({ audio: el, controls });
  });

  // ── Audio-driven action dispatch ────────────────────────────────────
  $effect(() => {
    const el = audioEl;
    const scheduled = resolveActionTimes(actions, wordStarts);
    if (!el || scheduled.length === 0 || !onaction) return;
    return attachAudioActions(el, scheduled, onaction);
  });

  // ── Stagger-only fallback (no audio): wall-clock action dispatch ────
  // When there's no audio to ride, actions fire on setTimeout at estimated
  // atMs. Rate/pause/seek semantics don't apply — there's nothing to ride.
  $effect(() => {
    if (audioEl) return;
    const scheduled = resolveActionTimes(actions, wordStarts);
    if (scheduled.length === 0 || !onaction) return;
    const timers: number[] = [];
    for (const { atMs, payload } of scheduled) {
      timers.push(
        window.setTimeout(() => onaction(payload), Math.max(0, atMs)),
      );
    }
    return () => timers.forEach((t) => clearTimeout(t));
  });

  // ── Pause/resume bridge ─────────────────────────────────────────────
  // When the consumer flips `paused`, reflect it onto the audio element.
  // syncAudioToKT observes audio.pause/play events and keeps KT in step.
  // Without audio, fall through to KineticText's own `paused` prop.
  //
  // Defers play() until revealMarks are computed — otherwise the voice
  // plays while text stays frozen (sync hasn't attached yet because its
  // guard requires non-empty marks).
  $effect(() => {
    const el = audioEl;
    if (!el) return;
    const marks = revealMarks;
    if (!marks || marks.length === 0) {
      if (!el.paused) el.pause();
      return;
    }
    if (paused && !el.paused) {
      el.pause();
    } else if (!paused && el.paused && status !== 'done') {
      el.play().then(
        () => {
          status = 'playing';
          onplay?.();
        },
        (err: Error) => {
          status = 'error';
          onerror?.(err);
        },
      );
    }
  });

  // Track "ended" on the audio to transition status → 'done'.
  $effect(() => {
    const el = audioEl;
    if (!el) return;
    const onEnd = () => {
      status = 'done';
      onended?.();
    };
    el.addEventListener('ended', onEnd);
    return () => el.removeEventListener('ended', onEnd);
  });

  function handleRevealComplete() {
    // For the no-audio path, reveal-complete marks "done". With audio, we
    // wait for audio.ended — reveal may finish slightly before the final
    // audio tail.
    if (!audioEl) status = 'done';
    onrevealcomplete?.();
  }

  // ── Cleanup ─────────────────────────────────────────────────────────
  $effect(() => {
    return () => {
      // If we own the audio element (created from Blob/string), stop it.
      // HTMLAudioElement consumers own their element and we leave it alone.
      if (audioEl && !(audio instanceof HTMLAudioElement)) {
        audioEl.pause();
        audioEl.src = '';
      }
      revokeOwnedUrl();
    };
  });

  // ── Helpers ─────────────────────────────────────────────────────────
  function evenTimestamps(txt: string, durationMs: number): WordTimestamp[] {
    const spans = splitWords(txt);
    if (spans.length === 0 || durationMs <= 0) return [];
    const slice = durationMs / spans.length;
    return spans.map((s, i) => ({
      word: txt.slice(s.start, s.end),
      startMs: i * slice,
      endMs: (i + 1) * slice,
    }));
  }

  function splitWords(txt: string): Array<{ start: number; end: number }> {
    const spans: Array<{ start: number; end: number }> = [];
    let i = 0;
    while (i < txt.length) {
      while (i < txt.length && /\s/.test(txt[i])) i++;
      if (i >= txt.length) break;
      const start = i;
      while (i < txt.length && !/\s/.test(txt[i])) i++;
      spans.push({ start, end: i });
    }
    return spans;
  }

  // Pause KineticText until sync can take over. syncAudioToKT only attaches
  // when marks are non-empty — without this gate KT would start revealing on
  // wall-clock time while audio is still preparing (flashes a few characters
  // that immediately reset when sync attaches and seeks to 0).
  //
  // Once marks are ready, sync attaches and owns pause state via audio events.
  // Without audio, the consumer's `paused` is authoritative.
  const ktPaused = $derived(
    audio != null ? !revealMarks || revealMarks.length === 0 : paused,
  );
</script>

<KineticText
  {text}
  {styleSnapshot}
  {revealMode}
  revealStyle={revealStyle ?? undefined}
  {activeEffect}
  {speedPreset}
  {reducedMotion}
  {seed}
  {loading}
  {preRevealed}
  {skeletonLines}
  {skeletonLastLineWidth}
  {revealMarks}
  cues={kineticCues}
  paused={ktPaused}
  bind:controls={ktControls}
  onrevealcomplete={handleRevealComplete}
  onrevealword={onword}
  {as}
  class={className}
/>
