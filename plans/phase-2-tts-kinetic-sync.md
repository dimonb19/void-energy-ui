# Phase 2 — Vibe Machine: AI-Orchestrated Story Atmospheres

> A single-page AI vibe generator living on `/conexus`. Click "Generate vibe" → Claude invents a fresh atmospheric beat (ambient layer mix + kinetic-text recipe + 3–5 sentence text). If an InWorld API key is saved, the text narrates in sync with the reveal — audio drives the kinetic timeline, ambient bursts fire on dramatic words. This file reflects what actually shipped and supersedes every earlier draft.

**Status:** Shipped 2026-04-18. This document was rewritten from scratch to reflect the implementation; prior drafts described a branching "choose-your-path" game and a full per-beat theme swap, both of which were dropped during build (see [Dropped from earlier drafts](#dropped-from-earlier-drafts)).
**Depends on:** Phase 1 (L0 shipped).
**Blocks:** Phase 3 (AI automation) inherits the prompt/tool-use pattern. Phase 6 (CoNexus migration) promotes this into the real narrative engine — at which point the dropped branching/theme features will likely come back, with actual gameplay justifying them.
**Related:** [phase-3-ai-automation.md](phase-3-ai-automation.md), [phase-4b-premium-packages.md](phase-4b-premium-packages.md), [phase-6-conexus-migration.md](phase-6-conexus-migration.md)

---

## Goal, as built

A visitor lands on `/conexus`, scrolls past the existing demos, and meets the **Vibe Machine** card. One button:

1. **idle** — card shows a muted "Your vibe will appear here." + the Generate button.
2. Click **Generate vibe** → **loading** — skeleton shimmer in the text well, Claude + (optionally) InWorld fetch in parallel.
3. **playing** — ambient layers mount, the kinetic reveal starts, audio plays, one-shot kinetic effects + ambient action bursts fire on pre-selected dramatic words. If TTS is active the reveal is word-aligned to the voice; otherwise it runs on a stagger clock.
4. **done** — reveal complete. Button swaps to "Generate another vibe". A **Replay vibe** button appears. After 30s of idle the ambient layers release (text stays) so laptops don't spin fans forever.

No choices, no branching, no theme swap. One click = one fresh vibe, shown once.

---

## What's in the ambient-layers + kinetic-text packages (all prerequisites)

These shipped before Phase 2 and are treated as read-only API surface by the consumer layer. Listed so future phases know what they can reach for.

### KT package additions ([`packages/kinetic-text/src/`](../packages/kinetic-text/src/))

- **`revealMarks?: RevealMark[]`** — external per-character timing. When present, bypasses `computeStaggerDelays()` via `marksToDelays()` (linear interpolation between marks).
- **`paused?: boolean`** + **`startPaused`** timeline config — external-clock gating. Flipping `paused` live pauses/resumes without rebuilding the timeline.
- **`bind:controls`** — exposes `KineticTextControls = { pause, resume, seek, skipToEnd, progress, elapsed, isPaused, isComplete }`. The control surface is a stable proxy closure; its identity doesn't change across re-layouts, so consumer `$effect`s that depend on `controls` don't thrash.
- **`onrevealword?: (wordIndex, word) => void`** — fires once on the first-char reveal of each non-space word group.
- **Reduced-motion + revealMarks** path (`startReducedMotionWithMarks`) — respects external timing but reveals each word as a block, one `setTimeout` per word.
- **Seek hardening** — RAF cancelled, fallback timers cleared, and `pendingRevealAnimations` reset before re-anchoring `startTime`. Prevents stale reveals when audio is scrubbed.

### TTS core + InWorld adapter ([`packages/kinetic-text/src/tts/`](../packages/kinetic-text/src/tts/))

- `types.ts` — `TTSResult`, `WordTimestamp`, `TTSProvider`.
- `marks.ts` — `wordTimesToRevealMarks(text, wordTimestamps) → RevealMark[]`. Case-insensitive word matching so providers that capitalize sentence starts still align.
- `sync.ts` — `syncAudioToKT({ audio, controls, driftThreshold? }) → cleanup`. Audio is master clock. Seeks on `play`/`seeked`, corrects drift >250ms on `timeupdate`, skips to end on `ended`.
- `cues.ts` — `stripEffectTokens(raw)` + `resolveEffectCues(tokens, cleanText, wordTimestamps)`. **Not used by the Vibe Machine** (beats use `kinetic.oneShots` from the schema, not inline `{{fx:…}}` tokens). Kept for future consumers.
- `fallback.ts` — `estimateCharSpeed(audioDurationMs, text)`. **Not used by the Vibe Machine** either; see [Known gaps](#known-gaps--rough-edges).
- `providers/inworld.ts` — `inworldSynthesize(text, { voiceId, apiKey, … }) → TTSResult`. Normalizes InWorld's base64 audio + `timestampInfo.wordAlignment` into `{ audioBlob, audioUrl, wordTimestamps, durationMs }`. Caller owns `URL.revokeObjectURL`.
- Sub-path exports: `@dgrslabs/void-energy-kinetic-text/tts` and `/tts/providers`.
- Tests: [`kt-tts-cues.test.ts`](../tests/kt-tts-cues.test.ts), [`kt-tts-marks.test.ts`](../tests/kt-tts-marks.test.ts), [`kt-tts-inworld.test.ts`](../tests/kt-tts-inworld.test.ts), [`kt-tts-fallback.test.ts`](../tests/kt-tts-fallback.test.ts).

### Ambient-layers package

The `godRays` ambient layer was removed before this phase landed — types and params registrations pulled; the effect file never existed. Four layer components remain: `EnvironmentLayer`, `AtmosphereLayer`, `PsychologyLayer`, `ActionLayer`. See `packages/ambient-layers/` for the complete list.

---

## Architecture — what actually shipped

Three concerns, three files:

```
┌──────────────────────────────────────────────────────────────────┐
│  Consumer — src/components/conexus/VibeMachine.svelte            │
│  Owns status state machine, InWorld key UI, replay cache,        │
│  snapshot/observer wiring, and the declarative ambient-layer     │
│  render from engine.activeAmbient.                               │
└──────────────────────────┬───────────────────────────────────────┘
                           │ uses
┌──────────────────────────▼───────────────────────────────────────┐
│  Orchestration — src/lib/story-beat-engine.svelte.ts             │
│  ~35 lines. Two $state fields (`currentBeat`, `activeAmbient`),  │
│  three methods (`applyBeat`, `releaseAmbient`, `release`). No    │
│  theme stacking, no history — just reactive state the consumer   │
│  reads from.                                                     │
└──────────────────────────┬───────────────────────────────────────┘
                           │ calls
┌──────────────────────────▼───────────────────────────────────────┐
│  Transport — src/lib/story-beat-client.ts                        │
│  Browser-side: POST /api/generate-story-beat, defensive Zod      │
│  re-validate, return VoidResult<StoryBeat, BoundaryError>.       │
│                                                                  │
│  Server — src/pages/api/generate-story-beat.ts                   │
│  Reads ANTHROPIC_API_KEY via resolveAIConfig('BEAT'), calls      │
│  Anthropic tool-use, re-validates with the same Zod schema,      │
│  retries ONCE on schema failure.                                 │
└──────────────────────────────────────────────────────────────────┘
```

All types/enums derive from the same literal tuples in [`src/lib/story-beat-types.ts`](../src/lib/story-beat-types.ts), so the prompt, the JSONSchema tool input, and the Zod validator can't drift.

The Anthropic call is server-side. The InWorld call is browser-side with a user-pasted key (saved to `localStorage` under `vibe-machine-inworld-key`) — see [TTS: browser-direct is intentional](#tts-browser-direct-is-intentional).

---

## The `StoryBeat` contract — what Claude actually emits

Defined in [`src/lib/story-beat-types.ts`](../src/lib/story-beat-types.ts). No theme, no choices, no history.

```ts
export interface StoryBeat {
  id: string;                 // kebab-case, 1–48 chars
  title: string;              // 1–64 chars, shown in the card header
  tagline?: string;           // optional 2–6 word vibe description, shown under title
  text: string;               // 150–550 chars, 3–5 sentences
  ambient: StoryAmbient;
  kinetic: StoryKinetic;
}

interface StoryAmbient {
  environment?: Array<{ layer: EnvironmentLayer; intensity: AmbientIntensity }>;  // exactly 1
  atmosphere?:  Array<{ layer: AtmosphereLayer;  intensity: AmbientIntensity }>;  // at most 1, XOR psychology
  psychology?:  Array<{ layer: PsychologyLayer;  intensity: AmbientIntensity }>;  // at most 1, XOR atmosphere
  actions?:     Array<{ atWord: number; variant: ActionLayer; intensity: AmbientIntensity }>;  // exactly 1
}

interface StoryKinetic {
  revealStyle: RevealStyle;              // required
  continuous?: KineticTextEffect;        // optional looping effect
  speed?: KineticSpeedPreset;            // slow | default | fast
  oneShots?: Array<{ atWord: number; effect: KineticTextEffect }>;  // exactly 1
}
```

Enforced-at-schema coherence rules ([`story-beat-schema.ts`](../src/lib/story-beat-schema.ts)):

- `ambient.atmosphere` XOR `ambient.psychology` — one ambient signal per beat, never both.
- `ambient.actions` must contain exactly 1 entry (the beat's money moment).
- `kinetic.oneShots` must contain exactly 1 entry (same money-moment idea, kinetic side).
- **GPU budget gate:** if `kinetic.continuous` is set, `ambient.atmosphere` cannot be one of `{heat, underwater, fog}` and `ambient.psychology` cannot be one of `{dizzy, haze}`. These layers warp the whole backdrop via SVG filters or large blurs; stacking a continuous kinetic effect on top re-composites the filter pipeline per frame and janks low-end GPUs (M1 Air was the reference target). The `HEAVY_*` lists live in `story-beat-types.ts`.
- `atWord` fields are capped at 0–200 but **not** validated against the actual word count of `text`. Out-of-range indices silently clamp to the last word's start via `wordStartTimes` in [`story-beat-cues.ts`](../src/lib/story-beat-cues.ts).

---

## Orchestration — `storyBeatEngine`

[`src/lib/story-beat-engine.svelte.ts`](../src/lib/story-beat-engine.svelte.ts) is intentionally narrow:

```ts
class StoryBeatEngine {
  currentBeat  = $state<StoryBeat | null>(null);
  activeAmbient = $state<StoryAmbient>({});

  applyBeat(beat: StoryBeat): void {
    this.currentBeat = beat;
    this.activeAmbient = beat.ambient;
  }

  /** Keep text on screen, stop the always-on GPU cost. */
  releaseAmbient(): void { this.activeAmbient = {}; }

  release(): void { this.currentBeat = null; this.activeAmbient = {}; }
}
```

No ephemeral theme registration. No temporary-theme stack push. No `history[]`. The consumer reads `currentBeat` + `activeAmbient` directly as reactive state and renders layer components declaratively via `{#each activeAmbient.atmosphere}` etc.

Why so thin: the Vibe Machine showcases the ambient + kinetic systems on top of the user's existing theme. Preserving the host palette means visitors can pick a theme they like from the main theme switcher, then see how the effects layer over it. Swapping the whole palette per beat was tried on paper and dropped — it fights the user's taste choice and makes the demo feel like a random-theme generator rather than an effects showcase.

---

## Transport

### Browser — [`src/lib/story-beat-client.ts`](../src/lib/story-beat-client.ts)

- `generateNextBeat({ recentTitles?, signal? }) → Promise<VoidResult<StoryBeat, BoundaryError>>`.
- POSTs `{ recentTitles }` to `/api/generate-story-beat`.
- Defensively re-validates the server response with the same `StoryBeatSchema` Zod — a misconfigured server can never inject a malformed beat into the engine.
- Maps HTTP status codes to user-facing messages (401 invalid key, 429 rate limit, 502/504 upstream, 529 busy, etc.).
- `AbortError` surfaces as `{ code: 'network', message: 'Generation cancelled.' }` so the UI can silently swallow it.

### Server — [`src/pages/api/generate-story-beat.ts`](../src/pages/api/generate-story-beat.ts)

- Reads `ANTHROPIC_API_KEY` via `resolveAIConfig('BEAT')`. Per-pipeline env overrides: `BEAT_AI_MODEL`, `BEAT_AI_PROVIDER` (must stay `anthropic` — tool-use is what guarantees schema shape).
- Calls Anthropic with the `emit_story_beat` tool ([`beat-tool-schema.ts`](../src/service/beat-tool-schema.ts)), `tool_choice` forced to that tool, `max_tokens: 1536`.
- Retries **once** on schema-validation failure (`status === 502 && attempt.issues`). The LLM occasionally emits an out-of-range intensity or an incomplete ambient object; re-rolling almost always fixes it. Does not retry on other failures (network, upstream 5xx, parse errors).

### Prompt — [`src/service/beat-prompts.ts`](../src/service/beat-prompts.ts)

`buildSystemPrompt()` emits enum lists derived from the same literal tuples as the Zod schema. Key rules it teaches the model:

- `text`: 3–5 sentences, 150–550 chars, present tense, sensory, no dialogue/Markdown/effect tokens.
- Ambient: one `environment` baseline, then `atmosphere` XOR `psychology`, plus exactly one action burst.
- Kinetic: one `revealStyle`, optional `continuous`, exactly one one-shot on the beat's most dramatic word.
- GPU gate: `continuous` omitted when ambient is HEAVY.
- Two few-shot example beats (Static Garden + Kitchen at Dawn) anchor on quality.
- Host's colors/rendering stay untouched — the beat is effects + mood, not a full page re-skin.

`buildUserPrompt(recentTitles)` carries the last 10 titles the session has seen so Claude can steer away from repetition. Anything beyond 10 is collapsed to a count prefix.

---

## TTS integration — how the audio drives the reveal

Entirely client-side. The VibeMachine owns the choreography:

1. **Synth:** `inworldSynthesize(text, { voiceId, apiKey })`. Returns `{ audioBlob, audioUrl, wordTimestamps, durationMs }`.
2. **Token guard:** `ttsGeneration++` on each synth start; late-returning responses compare their captured token against the current one and bail if a newer beat has started.
3. **Timestamps:** prefer InWorld's `wordTimestamps`. When the provider returns empty alignment (happens occasionally on some voices), `synthesizeEvenTimestamps` distributes words evenly across the actual audio duration. Requires `loadedmetadata` first (`waitForAudioDuration` awaits it).
4. **Marks:** `wordTimesToRevealMarks(text, timestamps) → RevealMark[]`. If the mark list is empty (no alignment AND no duration), the path falls through to the stagger fallback so the reveal doesn't collapse to t=0.
5. **One-shots + actions:** `wordStartTimes(text, speed, timestamps)` + `buildCuesFromOneShots` + `scheduleActions` ([`story-beat-cues.ts`](../src/lib/story-beat-cues.ts)). One-shots become `KineticCue[]` handed to KT; actions become `setTimeout` handles that push entries into `liveActions` at the right moment.
6. **Mount order:** the KT remount is keyed by `${beat.id}-${ttsGeneration}` and `paused` is set to `true` before assigning `audioEl`. An `await tick()` ensures fresh KT mounts and writes its controls back through `bind:controls` before the sync `$effect` reads them. Without that `tick`, the effect fires with stale controls and misses the audio `play` event.
7. **Sync lifecycle:** `syncAudioToKT` runs inside a `$effect` keyed on `{audio, controls, marks}`. Cleanup detaches listeners; the next attach starts fresh.
8. **Replay cache:** on successful setup, `cacheForReplay({ beat, audioUrl, marks, cues, wordStarts })`. `handleReplay` re-creates an `Audio` element from the cached blob URL, bumps `ttsGeneration` to remount KT, and reuses the pre-computed cues — no second Claude/InWorld call.
9. **Blob URL ownership:** `replayCache` owns the URL. `cleanupAudio` detaches the element; `discardReplayCache` revokes. The two are deliberately separate.

### Fallback paths

- **No InWorld key, or Narrate toggled off:** `playWithoutTts(beat)` — stagger reveal with `speedPreset`, no audio. One-shots and action bursts still fire on estimated word-start times.
- **TTS failed (auth, network, quota):** surface the error via toast, fall through to `playWithoutTts`.
- **TTS succeeded, audio loaded, but zero usable marks:** `playWithoutTts(beat, preloadedAudio, preloadedAudioUrl)` — audio plays in parallel with a stagger reveal. Not word-perfect, but the voice still accompanies the beat and the replay cache still works.

### TTS: browser-direct is intentional

The InWorld call bypasses the server and uses a user-pasted key stored in `localStorage`. The UI copy makes this explicit ("Stored only in your browser's localStorage. Sent directly to InWorld's API from your browser — never to our servers."). Anthropic goes server-side because the Vibe Machine can't work without it — everyone hitting `/conexus` needs an anonymous generate button. InWorld is optional polish — users bring their own key if they want narration. When this graduates to CoNexus proper, InWorld will likely move server-side behind billing.

---

## UI — [`src/components/conexus/VibeMachine.svelte`](../src/components/conexus/VibeMachine.svelte)

Single Svelte file (~950 lines). The chunks, in rough order:

- **State machine:** `status: 'idle' | 'loading' | 'playing' | 'done'`.
- **Ambient render block:** declarative `{#each activeAmbient.*}` at the top of the template, outside the card. Keyed by `${layer}-${intensity}` so intensity changes remount cleanly. One-shot action bursts render as `<ActionLayer>` from a `liveActions` array with `onEnd` cleanup.
- **Card body:** header (title + optional tagline + "Now playing" caption), text well (skeleton | `<KineticText>` | muted idle text), chip row (shows the active `revealStyle`/`continuous`/`speed`/environment/atmosphere/psychology/one-shots/actions so viewers can read the recipe), button row (Generate + conditional Replay).
- **TTS section:** three states — no key (password input + Save), have key (mask + Remove), always (voice Selector + Narrate toggle).
- **Snapshot plumbing:** `snapshotEl` bound to the text well; `createVoidEnergyTextStyleSnapshot` feeds `<KineticText>`. A MutationObserver on `<html>` watches `data-atmosphere`, `data-physics`, `data-mode` and bumps `snapshotTick` so the snapshot re-reads when the user changes theme mid-playback.
- **Cleanup on unmount:** disconnects the observer, aborts any in-flight generation, cleans up audio, revokes the blob URL, clears action timers, resets `liveActions`, calls `storyBeatEngine.release()`.

### Placement in `/conexus`

In [`src/components/CoNexus.svelte`](../src/components/CoNexus.svelte), `<VibeMachine />` is mounted as a sibling of `<PullRefresh>`, not inside it. Why: `.ambient-layer` uses `position: fixed; inset: 0;`, but `.pull-content` has `transform: translateY(var(--pull-distance))` applied at all times (even with distance=0). A non-none `transform` on an ancestor creates a containing block for fixed descendants, which would stretch the ambient layers across the full page height instead of the viewport. Keeping VibeMachine outside `<PullRefresh>` restores viewport-scoped positioning. **Do not move it back inside.**

---

## Dropped from earlier drafts

Earlier versions of this plan described features that were cut during implementation. Listing them so readers don't wonder where they went:

| Dropped | Why |
|---|---|
| **Choices / branching gameplay** | The Vibe Machine is a non-interactive atmosphere generator, not a story game. Branching belongs in Phase 6 (CoNexus) where actual narrative justifies it. |
| **Full theme swap per beat** (palette, physics, mode) | Fights the user's theme choice. The demo shows effects layered over the user's theme, which reads as "additive capability" rather than "random skin generator." The server tool-use, Zod schema, prompt, types, and example beats all dropped the `theme` field in commit [ref]. |
| **`choiceId` on `generateNextBeat`** | Moot without choices. |
| **`history[]` on the engine** | `StoryBeatEngine` keeps only `currentBeat`. The consumer tracks `recentTitles` locally for anti-repetition. |
| **Curated opening** | The idle state is a single muted line. No cold-path pre-generated beat. |
| **Story-trail breadcrumb** | Linear `history[]` was dropped; there's nothing to breadcrumb. |
| **Materialization transition** (ambience-dim + title card during generation) | Replaced by a simpler skeleton shimmer in the text well. Loading feels fast enough with the 2–4s Sonnet latency that the extra choreography wasn't worth it. |
| **Server-routed InWorld** | Stayed client-side with a user-pasted key — see [TTS: browser-direct is intentional](#tts-browser-direct-is-intentional). |
| **`engine.releaseAll()`** | Renamed `release()` for the narrower contract (no stack to unwind). |

---

## Added during build (not in any earlier draft)

- **Recent-titles anti-repetition.** Session-local array capped at 10 entries, passed to the prompt builder so Claude steers away from recent vibes.
- **30-second idle ambient release.** After `status === 'done'` sits for 30s with no interaction, `releaseAmbient()` clears the GPU-intensive layers. Text stays on screen.
- **Replay cache.** One-click replay of the last beat using the cached blob URL — no paid re-generation.
- **Environment layer as a required third ambient category.** The original plan had atmosphere + psychology only. Environment (night/neon/dawn/dusk/candlelit/etc.) ended up required-and-exactly-one, providing the sticky baseline tint.
- **Ambient action bursts** (`ambient.actions`). One-shot bursts timed to a spoken word — the ambient-side counterpart to `kinetic.oneShots`. Exactly one per beat.
- **GPU budget gate** at the schema level. Enforced for the LLM (via prompt + tool schema + Zod) so the model can never emit a beat that stacks HEAVY ambient with `kinetic.continuous`.
- **Skeleton shimmer during loading.** Replaces the dropped materialization transition.
- **`MutationObserver` on `<html>`** for live theme changes. The reveal re-reads its style snapshot when the user switches atmosphere mid-playback.
- **Defensive `ttsGeneration` token.** Guards the TTS path against late-returning syntheses hijacking a newer beat.

---

## Known gaps / rough edges

Things that work but would benefit from a follow-up. None block the demo.

1. **`estimateCharSpeed` is exported but unused.** The consumer uses a local `synthesizeEvenTimestamps` that achieves roughly the same thing. Two paths to the same goal. Either delete the shipped helper or replace the consumer's inline copy with it.
2. **`stripEffectTokens` / `resolveEffectCues` are exported but unused here.** The Vibe Machine uses the schema's `kinetic.oneShots`, not inline `{{fx:…}}` tokens. The token path is kept for future consumers (CoNexus text-with-embedded-FX), but right now it's dead weight in this phase.
3. **Server retry policy is narrow.** Only retries on `502 + issues` (Zod validation). Transient upstream errors (503, 504, 529) surface directly. A single retry with small backoff on those would reduce user-visible flake.
4. **`atWord` can exceed actual word count.** Schema caps at 0–200, but doesn't cross-validate against `text.split(/\s+/).length`. `wordStartTimes` clamps silently. Fine for a demo, but a "post-parse" refinement that caps `atWord` to actual word count would catch LLM off-by-ones cleanly.
5. **No streaming.** A full Sonnet + tool-use response is 2–4s. Skeleton shimmer is adequate but a streamed title (fast first token) would feel faster. Anthropic tool-use does support streaming; not wired up.
6. **Ambient auto-release is silent.** After 30s the rain stops and the viewer may not know why. A tiny "Effects paused — generate another vibe to resume" hint near the card, or a re-engage-on-interaction handler, would close the loop.
7. **Voice list is static.** Eight curated InWorld voice IDs hardcoded in the component. InWorld has more; a fetched voice list or free-form text input would let users experiment.
8. **`storyBeatEngine` is a singleton exported from `.svelte.ts`.** That's fine for this page where only one Vibe Machine exists at a time, but nested or side-by-side vibes (Phase 6?) would fight. Revisit when CoNexus needs multiple simultaneous scenes.
9. **Test fixtures are hand-minimal.** They cover schema rules and engine state transitions, but there's no end-to-end replay of a full beat through the `<KineticText>` DOM. Good integration coverage would catch regressions in the tick-await-mount dance (see step 6 of [TTS integration](#tts-integration--how-the-audio-drives-the-reveal)).

---

## Verification checklist (for replaying this phase)

### Contract
- [x] `StoryBeatSchema` rejects out-of-range intensities, unknown layers, missing required fields.
- [x] `atmosphere` + `psychology` together is rejected.
- [x] `kinetic.continuous` + HEAVY ambient is rejected.
- [x] `tagline`, `continuous`, `speed` are optional; everything else the schema requires is strictly required.

### Engine
- [x] `applyBeat` sets `currentBeat` and `activeAmbient` atomically.
- [x] `releaseAmbient` clears ambient but keeps `currentBeat` on screen.
- [x] `release` resets both fields.

### Transport
- [x] Server returns a valid beat end-to-end against a real `ANTHROPIC_API_KEY`.
- [x] Client defensively re-validates server responses.
- [x] One retry on schema failure; two consecutive failures surface via toast.
- [x] AbortError surfaces as "Generation cancelled." (soft error, no toast).

### UI
- [x] `/conexus` renders `VibeMachine` below existing demos as a sibling of `PullRefresh`.
- [x] Ambient layers cover the viewport (100vh), not the full scrolling page height.
- [x] Idle state is a muted one-liner, no network call.
- [x] Generate transitions `idle → loading → playing → done`.
- [x] Chips row reflects the beat's actual effect recipe.
- [x] Replay button skips Claude + InWorld and re-runs from the cache.
- [x] TTS key is masked in the connected-state UI; Remove clears `localStorage`.
- [x] 30s idle in `done` releases ambient; text stays.
- [x] Theme change mid-playback re-reads the KT style snapshot.
- [x] Escape cancels an in-flight generation.

### TTS
- [x] With InWorld key + Narrate on: reveal is word-aligned to the voice.
- [x] Without a key: stagger reveal with audio off.
- [x] Missing word timestamps: fall through to even-distribution, then to stagger-with-audio.
- [x] Replay reuses the cached blob URL; no second synth.
- [x] Blob URL revoked on new generation or unmount.
- [x] Reduced motion: reveal still lands at word-start times, one `setTimeout` per word.
