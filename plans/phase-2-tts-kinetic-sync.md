# Phase 2 — TTS + Kinetic Text Synchronization

> Extend the Kinetic Text premium package with a timeline-driven reveal mode that syncs character/word reveal to TTS audio playback, using InWorld TTS as the reference provider.

**Status:** Planning
**Priority:** Phase 2 (after L0 Tailwind preset, before AI automation foundation)
**Depends on:** Phase 1 (L0 shipped). KT package already exists at `packages/kinetic-text/` with working build + RevealTimeline engine.
**Blocks:** Phase 6 narrative orchestration (CoNexus needs synced KT + TTS for its reading experience)
**Related:** [phase-4b-premium-packages.md](phase-4b-premium-packages.md) (KT package), [phase-6-conexus-migration.md](phase-6-conexus-migration.md) (consumer)

---

## Goal

A consumer can play an InWorld TTS audio clip alongside a `<KineticText>` component and have characters reveal in precise sync with the spoken words — no drift, no estimation. One-shot effects (shatter, glitch, etc.) fire at exact moments keyed to the audio timeline.

After Phase 2:
- KT accepts externally-provided timing marks and reveals by them instead of computed stagger
- A thin integration layer converts InWorld TTS timestamps to KT's format
- Audio playback events (play, pause, seek) propagate to the KT timeline
- One-shot effect cues can be authored inline in story text and resolved to audio timestamps
- The entire sync system is provider-agnostic at the KT layer — InWorld is one adapter

---

## Why this is a separate phase

TTS sync is not repo restructuring (Phase 4) and not CoNexus app code (Phase 6). It's a **capability enhancement** to the KT premium package that must land before CoNexus can build its narrative reading experience. The KT package already exists locally at `packages/kinetic-text/` with a working build and RevealTimeline engine — no monorepo restructure required. Building it now while the package is in the current repo means the TTS integration ships with KT when Phase 4 lifts it into the premium monorepo.

---

## Research findings

### InWorld TTS capabilities (verified 2026-04-11)

- **Word + character timestamps:** `timestampType: 'WORD'` or `'CHARACTER'` in the API request. Response includes parallel arrays: `words[]`, `wordStartTimeSeconds[]`, `wordEndTimeSeconds[]` (or char equivalents).
- **Transport modes:** `SYNC` (audio + timestamps arrive together per chunk — required for real-time reveal) and `ASYNC` (timestamps trail audio — only for pre-rendered).
- **Latency:** ~100ms added when timestamps are enabled. Negligible for narration.
- **Language:** English stable, others experimental.
- **SSML:** supports pronunciation/pitch/speed/emotion markup. `<mark name="..."/>` event support is **unconfirmed** — do not rely on it for effect cues.
- **Inline audio tags:** `[happy]`, `[sad]`, `[whisper]`, `[cough]`, `[sigh]` — experimental, English only. These control vocal delivery, not timing events.

### TTS provider landscape (timestamp support)

The architecture is provider-agnostic, but not all providers are equal. This table documents which providers can drive precise sync (timestamps) vs which need the estimated pacing fallback.

| Provider | Timestamp support | Mechanism | SSML `<mark>` events | Notes |
|---|---|---|---|---|
| **InWorld** | Word + character | `timestampType: 'WORD'`/`'CHARACTER'` in request, parallel arrays in response | Unconfirmed | Reference provider for Phase 2. ~100ms latency added. |
| **ElevenLabs** | Per-character | `/v1/text-to-speech/{id}/with-timestamps` returns start/end per char | N/A | Strong candidate for second adapter. |
| **Azure Speech** | Word boundaries | `WordBoundary` events fire during playback (real-time) | Yes — robust support | Best `<mark>` support of any provider. Good for effect cues via SSML. |
| **Google Cloud TTS** | Word-level | `timepoints[]` in response when `SSML` input used | Yes — via `<mark name="..."/>` | Requires SSML input format for timepoints. |
| **OpenAI TTS** | None | No native timestamp support | No | **Blocker for precise sync.** Must use estimated pacing fallback or post-hoc alignment. |
| **Browser SpeechSynthesis** | Word boundaries | `onboundary` event | No | Quality/consistency varies by OS. Unreliable for production sync. |

**Implication:** InWorld, ElevenLabs, Azure, and Google all support precise sync. OpenAI TTS and browser SpeechSynthesis require the estimated pacing fallback (see below). When adding future provider adapters, the adapter returns `TTSResult` with `wordTimestamps` populated (precise) or empty (triggers fallback).

### Current KT architecture (relevant parts)

- **RevealTimeline** uses RAF loop with `elapsed` tracking from `performance.now()`.
- **Reveal timing** is computed once upfront via `computeStaggerDelays()` — returns a `delays[]` array where `delays[i]` = ms when char `i` should reveal.
- **`seek(ms)`** jumps to any point and reprocesses all glyph states. Works but resets from zero each call — too expensive for 60fps external clock driving.
- **`pause()` / `resume()`** freeze/unfreeze the internal clock.
- **`KineticCue[]`** with `trigger: 'at-time'` + `atMs` already fires effects at precise timestamps during the RAF loop.
- **Per-character DOM:** `kt-glyph` > `kt-unit` > `kt-word` > `kt-line` — all addressable.
- **RevealTimeline is not exposed** to consumers — it's internal to `KineticText.svelte`.

### Sync strategy decision

**Chosen: timestamp-derived delays (Strategy B).** Convert InWorld's word timestamps into the same `delays[]` array format the timeline already uses, then let the RAF loop run normally. The internal clock and audio clock reference the same duration — for pre-rendered audio this is sufficient.

**Rejected: seek-driven (Strategy A).** Calling `seek()` every frame is architecturally wrong — it resets all glyph states and reprocesses from zero each time. Would require rewriting seek to be incremental, which is a larger change for no benefit over Strategy B.

**Audio drift mitigation:** for pre-rendered audio (not streaming), both clocks start from the same moment and run at wall-clock speed. Drift is sub-frame. For pause/resume, the KT timeline pauses when audio pauses — clocks stay aligned. For seek (user scrubs audio), a single `seek()` call realigns. This is the only case where `seek()` fires, and it's user-initiated so the per-call cost is fine.

### Estimated pacing fallback (no-timestamp providers)

Not all TTS providers return timestamps (notably OpenAI TTS). For these, a simple fallback:

1. Measure the audio's total `duration` (from the `<audio>` element's `loadedmetadata` event or the API response).
2. Compute `charSpeed = duration / charCount`.
3. Feed that as a uniform `charSpeed` to KT's existing computed stagger path — no `revealMarks` needed.

This produces linear, evenly-paced reveal that roughly follows the audio. It drifts on long passages (speakers don't talk at constant speed) and can't fire effects at precise moments, but it's good enough for ambient narration where the audio sets the mood rather than demanding frame-perfect sync.

**Implementation:** a helper function in the TTS core module:

```ts
// packages/kinetic-text/src/tts/fallback.ts
function estimateCharSpeed(audioDurationMs: number, text: string): number;
```

Returns a `charSpeed` value (ms per character) that KT's existing `computeStaggerDelays()` consumes directly. The consumer checks whether their `TTSResult` has `wordTimestamps` — if yes, use `wordTimesToRevealMarks()` for precise sync; if no, use `estimateCharSpeed()` for approximate pacing.

```ts
// Consumer decision:
if (tts.wordTimestamps.length > 0) {
  // Precise sync — timestamp-driven
  const revealMarks = wordTimesToRevealMarks(cleanText, tts.wordTimestamps);
  // pass revealMarks to <KineticText>
} else {
  // Estimated pacing — no timestamps available
  const charSpeed = estimateCharSpeed(tts.durationMs, cleanText);
  // pass charSpeed to <KineticText> (existing prop)
}
```

**Scope:** the fallback helper ships in Phase 2. No provider adapter is required to use it — it works with any audio source, even a local file with known duration.

---

## Architecture

Three layers, clean separation:

```
┌──────────────────────────────────────────────────────┐
│  Layer 3 — Narrative Pipeline (Phase 6 / CoNexus)    │
│  LLM streams text → strips {{fx}} tokens → sends     │
│  clean text to TTS → feeds audio + marks to Layer 2   │
└──────────────────────┬───────────────────────────────┘
                       │ consumes
┌──────────────────────▼───────────────────────────────┐
│  Layer 2 — TTS Integration (this phase)               │
│                                                       │
│  ┌─ Core (provider-agnostic) ──────────────────────┐ │
│  │  marks.ts    — wordTimesToRevealMarks            │ │
│  │  sync.ts     — syncAudioToKT                    │ │
│  │  cues.ts     — stripEffectTokens, resolveEffects│ │
│  │  types.ts    — TTSResult, WordTimestamp          │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─ Providers (one file per TTS model) ────────────┐ │
│  │  providers/inworld.ts  → TTSResult              │ │
│  │  providers/elevenlabs.ts  (future)              │ │
│  │  providers/azure.ts       (future)              │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────┘
                       │ drives
┌──────────────────────▼───────────────────────────────┐
│  Layer 1 — KT Package Changes (this phase)            │
│  revealMarks prop, exposed timeline control,          │
│  optional onrevealword callback                       │
└───────────────────────────────────────────────────────┘
```

**Layer 1** changes the KT package (premium). **Layer 2** is a new integration module — lives inside the KT package as optional sub-exports. The core (`@dgrslabs/void-energy-kinetic-text/tts`) is provider-agnostic. Providers (`@dgrslabs/void-energy-kinetic-text/tts/providers`) are one-file adapters that normalize API responses to the universal `TTSResult` type. Switching TTS models = swap one import. **Layer 3** is CoNexus-specific app code built in Phase 6.

---

## Layer 1 — KT Package Changes

### 1.1 New prop: `revealMarks`

```ts
interface RevealMark {
  /** Character index (0-based, global across full text) */
  index: number;
  /** Time in ms from start when this character should reveal */
  timeMs: number;
}

// On KineticTextProps:
revealMarks?: RevealMark[];
```

When `revealMarks` is provided, `computeDelays()` uses these instead of `computeStaggerDelays()`. Each mark maps directly to a `delays[i]` entry. Characters between explicit marks get micro-staggered (linear interpolation between surrounding marks) so they don't all pop at once.

**Word-level marks are the common case.** InWorld returns word timestamps; the converter (Layer 2) expands them to char-level marks by distributing each word's duration across its characters. The KT package doesn't need to know about words — it only sees char-index + timeMs.

### 1.2 Expose timeline control

Add a `bind:controls` prop that exposes a subset of RevealTimeline:

```ts
interface KineticTextControls {
  pause(): void;
  resume(): void;
  seek(ms: number): void;
  skipToEnd(): void;
  readonly progress: number;
  readonly elapsed: number;
  readonly isPaused: boolean;
  readonly isComplete: boolean;
}

// On KineticTextProps:
controls?: KineticTextControls;  // $bindable()
```

The component populates this object once the timeline is created. Consumer can then wire audio events to `controls.pause()`, `controls.resume()`, `controls.seek()`.

### 1.3 Optional callback: `onrevealword`

```ts
// On KineticTextProps:
onrevealword?: (wordIndex: number, word: string) => void;
```

Fires when the first character of a new word reveals. Useful for transcript highlighting (active word indicator in a sidebar). Implementation: in the RAF tick, when a unit reveals and it's the first char of its `kt-word` group, fire the callback.

### 1.4 Reduced-motion handling

When `revealMarks` is provided and `reducedMotion` resolves to `true`, skip animation but still respect timing — reveal each word as a block at the word's start time. The audio is the primary experience; text appearing on time matters even without animation.

### Summary of KT package changes

| Change | Files touched | Effort |
|--------|---------------|--------|
| `revealMarks` prop + delay override | `types.ts`, `KineticText.svelte`, `timeline/index.ts`, `timeline/stagger.ts` | ~80 lines |
| `bind:controls` | `types.ts`, `KineticText.svelte` | ~30 lines |
| `onrevealword` callback | `types.ts`, `KineticText.svelte`, `timeline/index.ts` | ~40 lines |
| Reduced-motion adjustment | `KineticText.svelte` | ~15 lines |

**Total: ~165 lines of additive code. No changes to existing reveal paths.**

---

## Layer 2 — TTS Integration Module

Split into a **provider-agnostic core** and **provider-specific adapters**. The core handles everything that doesn't touch a TTS API. Adapters are thin wrappers that normalize a specific provider's response into the core's universal types.

### File structure

```
packages/kinetic-text/src/tts/
├── index.ts                  ← core re-exports (provider-agnostic)
├── types.ts                  ← shared types (TTSResult, WordTimestamp, etc.)
├── marks.ts                  ← wordTimesToRevealMarks (pure function)
├── sync.ts                   ← syncAudioToKT (event wiring)
├── cues.ts                   ← stripEffectTokens, resolveEffectCues
├── fallback.ts               ← estimateCharSpeed (no-timestamp providers)
└── providers/
    ├── index.ts              ← provider re-exports
    └── inworld.ts            ← InWorld adapter (the only one for now)
```

### 2.1 Universal types

```ts
// packages/kinetic-text/src/tts/types.ts

/** Provider-agnostic TTS result. Every adapter normalizes to this. */
interface TTSResult {
  audioBlob: Blob;
  audioUrl: string;              // Object URL, caller must revoke
  wordTimestamps: WordTimestamp[];
  durationMs: number;
}

interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}

/** Contract that every provider adapter implements. */
interface TTSProvider {
  synthesize(text: string, options: Record<string, unknown>): Promise<TTSResult>;
}
```

`TTSResult` is the universal currency. The core never sees provider-specific shapes — only `TTSResult`. Adding a new provider means writing one file that returns `TTSResult`. Nothing else changes.

### 2.2 InWorld adapter (first provider)

```ts
// packages/kinetic-text/src/tts/providers/inworld.ts

interface InWorldOptions {
  voiceId: string;
  apiKey: string;
  timestampType?: 'WORD' | 'CHARACTER';  // default: 'WORD'
  transportStrategy?: 'SYNC' | 'ASYNC';  // default: 'SYNC'
}

/** Normalize InWorld's response arrays into TTSResult. */
async function synthesize(text: string, options: InWorldOptions): Promise<TTSResult>;
```

Thin wrapper around InWorld's API. Converts `startTimeSeconds` → ms, zips parallel arrays into `WordTimestamp[]`, creates an Object URL. Future providers (ElevenLabs, Azure, Google) each get their own file in `providers/` with the same `(text, options) → TTSResult` shape.

### 2.3 Timestamp-to-marks converter (core, provider-agnostic)

```ts
// packages/kinetic-text/src/tts/marks.ts

/**
 * Convert word-level timestamps to character-level RevealMark[].
 * Each char within a word gets a micro-staggered time:
 *   charTime = wordStart + (charIndexInWord / wordLength) * (wordEnd - wordStart)
 * Spaces between words reveal at the preceding word's endMs.
 */
function wordTimesToRevealMarks(
  text: string,
  wordTimestamps: WordTimestamp[]
): RevealMark[];
```

Takes the universal `WordTimestamp[]` — doesn't matter which provider produced it. Pure function, no side effects, easily testable.

### 2.4 Audio-KT synchronizer (core, provider-agnostic)

```ts
// packages/kinetic-text/src/tts/sync.ts

interface SyncOptions {
  audio: HTMLAudioElement;
  controls: KineticTextControls;
  /** Tolerance in ms before forcing a seek (default: 150) */
  driftThreshold?: number;
}

/**
 * Binds audio playback events to KT timeline controls.
 * Returns a cleanup function.
 *
 * - audio.play   → controls.resume() (or start on first play)
 * - audio.pause  → controls.pause()
 * - audio.seeked → controls.seek(audio.currentTime * 1000)
 * - audio.ended  → controls.skipToEnd() (if not already complete)
 *
 * Optionally monitors drift: if |audio.currentTime*1000 - controls.elapsed| > driftThreshold,
 * issues a corrective seek. Checked on timeupdate events (~4Hz).
 */
function syncAudioToKT(options: SyncOptions): () => void;
```

Works with any `HTMLAudioElement` — the audio could come from InWorld, ElevenLabs, or a local file. The synchronizer doesn't care where the audio originated.

### 2.5 Effect cue resolver (core, provider-agnostic)

```ts
// packages/kinetic-text/src/tts/cues.ts

interface InlineEffectToken {
  /** Original position in the raw text (before stripping) */
  rawIndex: number;
  /** Effect name from {{fx:name}} */
  effect: string;
}

/**
 * Strip {{fx:name}} tokens from text.
 * Returns clean text (for TTS) and extracted tokens with positions.
 */
function stripEffectTokens(rawText: string): {
  cleanText: string;
  tokens: InlineEffectToken[];
};

/**
 * Resolve stripped tokens to KineticCue[] using word timestamps.
 * Maps each token's position to the nearest word boundary,
 * then uses that word's startMs as the cue's atMs.
 */
function resolveEffectCues(
  tokens: InlineEffectToken[],
  cleanText: string,
  wordTimestamps: WordTimestamp[]
): KineticCue[];
```

Takes universal `WordTimestamp[]`. The `{{fx:token}}` format and resolution logic are provider-agnostic by nature — they operate on text positions and timestamps, not API responses.

### Module export structure

Two entry points — core and providers are separate imports:

```ts
// packages/kinetic-text/src/tts/index.ts  (core — provider-agnostic)
export type { TTSResult, WordTimestamp, TTSProvider } from './types';
export { wordTimesToRevealMarks } from './marks';
export { syncAudioToKT, type SyncOptions } from './sync';
export { stripEffectTokens, resolveEffectCues, type InlineEffectToken } from './cues';
export { estimateCharSpeed } from './fallback';

// packages/kinetic-text/src/tts/providers/index.ts
export { synthesize as inworldSynthesize, type InWorldOptions } from './inworld';
```

Consumer imports:
```ts
// Core utilities — never change when switching providers
import { wordTimesToRevealMarks, syncAudioToKT, stripEffectTokens, resolveEffectCues } from '@dgrslabs/void-energy-kinetic-text/tts';

// Provider-specific — swap this one import when switching TTS models
import { inworldSynthesize } from '@dgrslabs/void-energy-kinetic-text/tts/providers';
```

### Adding a future provider

To add ElevenLabs (or any other provider):

1. Create `providers/elevenlabs.ts` — implement `(text, options) → TTSResult`
2. Re-export from `providers/index.ts`
3. Done. The consumer swaps one import line. Core utilities, sync logic, effect cues — all unchanged.

```ts
// providers/elevenlabs.ts (future, not Phase 2 scope)
interface ElevenLabsOptions {
  voiceId: string;
  apiKey: string;
  modelId?: string;
}

async function synthesize(text: string, options: ElevenLabsOptions): Promise<TTSResult>;
```

---

## Consumer usage (preview of Phase 6 wiring)

This is **not** Phase 2 scope — it's here to validate that the API shape works for CoNexus.

```svelte
<script lang="ts">
  import { KineticText } from '@dgrslabs/void-energy-kinetic-text';

  // Core utilities — provider-agnostic, never change when switching TTS
  import {
    wordTimesToRevealMarks,
    syncAudioToKT,
    stripEffectTokens,
    resolveEffectCues
  } from '@dgrslabs/void-energy-kinetic-text/tts';

  // Provider — swap this one import to switch TTS models
  import { inworldSynthesize } from '@dgrslabs/void-energy-kinetic-text/tts/providers';

  // 1. Author or LLM provides raw text with effect tokens
  const rawScript = "The glass {{fx:shatter}}shattered into a thousand pieces.";

  // 2. Strip tokens, get clean text for TTS
  const { cleanText, tokens } = stripEffectTokens(rawScript);
  // cleanText = "The glass shattered into a thousand pieces."

  // 3. Synthesize speech + get timestamps (provider-specific call)
  const tts = await inworldSynthesize(cleanText, {
    voiceId: 'narrator-deep',
    apiKey: INWORLD_API_KEY,
  });

  // 4. Convert universal TTSResult to char-level reveal marks
  const revealMarks = wordTimesToRevealMarks(cleanText, tts.wordTimestamps);

  // 5. Resolve effect tokens to timed cues (uses same universal wordTimestamps)
  const cues = resolveEffectCues(tokens, cleanText, tts.wordTimestamps);

  // 6. Set up audio
  let audio: HTMLAudioElement;
  let controls: KineticTextControls;

  $effect(() => {
    if (audio && controls) {
      const cleanup = syncAudioToKT({ audio, controls });
      return cleanup;
    }
  });
</script>

<audio bind:this={audio} src={tts.audioUrl}></audio>

<KineticText
  text={cleanText}
  styleSnapshot={snapshot}
  revealMarks={revealMarks}
  cues={cues}
  bind:controls={controls}
/>

<button onclick={() => audio.play()}>Play</button>
```

---

## What this does NOT include

- **Streaming TTS.** Phase 2 assumes pre-rendered audio (call API, get full response, play). Streaming reveal (audio chunks arrive while playing) is a future enhancement if needed. The architecture doesn't preclude it — `revealMarks` could be updated incrementally — but it's not designed or tested for it here.
- **Forced alignment (Whisper).** If a TTS provider returns no timestamps, a Whisper-based forced aligner could recover precise word timings post-hoc. Out of scope — the estimated pacing fallback (see above) covers no-timestamp providers cheaply. Forced alignment is a future option if fallback quality proves insufficient.
- **Additional provider adapters.** Only the InWorld adapter ships in Phase 2. The architecture is provider-agnostic (`TTSResult`, `WordTimestamp`, `TTSProvider` interface) — adding ElevenLabs or Azure is one file in `providers/` — but writing those adapters is not Phase 2 scope.
- **Lip sync / viseme data.** InWorld supports viseme timestamps. Not needed for text reveal ��� potentially useful for character portraits in CoNexus but that's Phase 6 scope.
- **SSML `<mark>` event cues for effects.** Azure and Google Cloud TTS support `<mark name="..."/>` events natively — the cleanest mechanism for firing one-shot effects with zero drift. InWorld's SSML mark support is unconfirmed. Phase 2 uses the `{{fx:token}}` approach which is provider-agnostic and works regardless. A future provider adapter for Azure/Google could use SSML marks as an alternative to `{{fx:token}}` stripping.
- **Narrative pipeline / LLM streaming.** That's Layer 3, which is CoNexus-specific Phase 6 work.

---

## Implementation order

1. **Layer 1 first — KT package changes.** These are small, additive, and testable in isolation with mock data. Wire up `revealMarks` → `delays[]` override, expose `bind:controls`, add `onrevealword`.
2. **Layer 2 second — TTS integration module.** Start with the converter (`wordTimesToRevealMarks`) and cue resolver — these are pure functions, easy to unit test. Then the InWorld adapter (needs API key). Then the audio-KT synchronizer.
3. **Integration test.** Build a minimal demo page (in the KT package's dev environment or the showcase) that synthesizes a sentence via InWorld, plays the audio, and reveals KT in sync. Verify across physics presets.
4. **Effect cue test.** Add `{{fx:shatter}}` to the demo text, verify the cue fires at the correct audio moment.

---

## Open questions

1. **Where does the InWorld API key live?** Session-first (user provides in UI) like the AI theme generator, or server-side only? For Phase 2 demo/testing, a `.env` variable is fine. CoNexus production architecture is Phase 6's problem.
2. **Sub-export or separate package?** Current plan: `@dgrslabs/void-energy-kinetic-text/tts` sub-export. Alternative: a separate `@dgrslabs/void-energy-tts` package. Sub-export is simpler and avoids a fifth premium package, but it does couple TTS to KT at the package level. Decision: **sub-export** unless we discover TTS integration is useful independent of KT (unlikely in the near term).
3. **Drift threshold tuning.** The synchronizer has a configurable `driftThreshold` (default 150ms). This may need tuning based on real InWorld response latency. Flag for testing.
4. **Char-level vs word-level timestamps from InWorld.** Word-level is more reliable and lower overhead. Char-level exists but adds more data per response. Start with word-level + micro-stagger interpolation; switch to char-level only if interpolation quality is insufficient.

---

## Verification checklist

- [ ] `revealMarks` prop accepted by `<KineticText>`, overrides computed stagger
- [ ] Mock reveal marks produce correct char-by-char timing (unit test)
- [ ] `bind:controls` exposes pause/resume/seek to consumer
- [ ] `onrevealword` fires at correct word boundaries
- [ ] `wordTimesToRevealMarks()` correctly distributes word times to char-level marks (unit test)
- [ ] `stripEffectTokens()` extracts `{{fx:name}}` tokens and returns clean text (unit test)
- [ ] `resolveEffectCues()` maps tokens to correct `atMs` values (unit test)
- [ ] InWorld adapter successfully synthesizes audio with word timestamps
- [ ] Audio ↔ KT sync: play/pause/seek propagate correctly
- [ ] One-shot effects fire at correct audio moments
- [ ] Works across all 3 physics presets (glass, flat, retro)
- [ ] Reduced motion: text still reveals on time, animations suppressed
- [ ] `estimateCharSpeed()` produces reasonable pacing for audio without timestamps (unit test)
- [ ] Fallback path works end-to-end: audio with no timestamps still drives reveal at approximate pace
- [ ] Consumers who don't use TTS are unaffected (no bundle cost, no API changes)
- [ ] Demo page demonstrates end-to-end sync with real InWorld audio
