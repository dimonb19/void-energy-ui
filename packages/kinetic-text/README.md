# @void-energy/kinetic-text

Character-level kinetic typography for Void Energy hosts and standalone consumers. Pretext-based layout with per-character reveal animations, 37 narrative effects (16 one-shot + 21 continuous), and physics-aware rendering.

> **Private package** — distributed via private npm registry. Not published to the public npm registry.

## Installation

```bash
npm install @void-energy/kinetic-text
```

### Peer dependencies

| Package | Version | Notes |
|---------|---------|-------|
| `svelte` | `^5.0.0` | Required. Consumers compile `.svelte` source as part of their build. |

`@chenglou/pretext` is bundled as a direct dependency (not a peer).

## Quick start

### Void Energy hosts

Use the built-in adapter to resolve styles from the live DOM:

```svelte
<script lang="ts">
  import KineticText from '@void-energy/kinetic-text/component';
  import { createVoidEnergyTextStyleSnapshot } from '@void-energy/kinetic-text/adapters/void-energy-host';
  import '@void-energy/kinetic-text/styles';

  let el = $state<HTMLElement>();
  const snapshot = $derived(el ? createVoidEnergyTextStyleSnapshot(el) : null);
</script>

<div bind:this={el}>
  {#if snapshot}
    <KineticText text="The void stirs..." styleSnapshot={snapshot} revealMode="char" revealStyle="pop" />
  {/if}
</div>
```

The adapter reads `data-physics` and `data-mode` from `<html>`, computed font/lineHeight from the target element, and forwards relevant CSS variables for physics-tuned animations.

### Non-VE hosts

Construct `TextStyleSnapshot` manually — no adapter needed:

```svelte
<script lang="ts">
  import KineticText from '@void-energy/kinetic-text/component';
  import '@void-energy/kinetic-text/styles';

  const snapshot = {
    font: '16px "Inter", sans-serif',
    lineHeight: 24,
    physics: 'flat' as const,
    mode: 'dark' as const,
    density: 1,
    scale: 1,
    vars: {},
  };
</script>

<KineticText text="Hello world" styleSnapshot={snapshot} />
```

## Styles

Import the stylesheet in your entry point or layout:

```js
import '@void-energy/kinetic-text/styles';
```

This provides all reveal keyframes, effect animations, physics-variant easing, and reduced-motion overrides.

## Props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | — | **Required.** The text to render and reveal. |
| `styleSnapshot` | `TextStyleSnapshot` | — | **Required.** Font, lineHeight, physics, mode, and CSS variables. |
| `revealMode` | `'char' \| 'word' \| 'decode'` | `'char'` | How text is revealed: character-by-character, word-by-word, or scramble-then-decode. |
| `revealStyle` | `RevealStyle` | `'pop'` | Visual entrance animation: `instant`, `pop`, `scale`, `blur`, `scramble`, `rise`, `drop`. |
| `speedPreset` | `'slow' \| 'default' \| 'fast'` | `'default'` | Named speed preset. `slow` = 40/8ms, `default` = 20/4ms, `fast` = 8/2ms. Overridden by explicit `speed`/`charSpeed`. |
| `staggerPattern` | `StaggerPattern` | `'sequential'` | Timing pattern for reveal order. |
| `stagger` | `number` | `40` (char) / `30` (other) | Milliseconds between reveal units. |
| `revealDuration` | `number` | auto | Duration of each unit's reveal animation (ms). Auto-derived per `revealStyle`. |
| `activeEffect` | `KineticTextEffect \| null` | `null` | Continuous effect to apply (loops indefinitely). |
| `cues` | `KineticCue[]` | `[]` | One-shot effect cues triggered during or after reveal. |
| `oneShotEffect` | `KineticTextEffect \| null` | `null` | Imperative one-shot effect. Fires when `oneShotTrigger` increments. |
| `oneShotTrigger` | `number` | `0` | Counter — increment to fire the `oneShotEffect`. Value of 0 is ignored. |
| `styleSpans` | `StyleSpan[]` | `[]` | Inline visual styles applied to word ranges (dialogue, asides, emphasis, underline, code). Motion-neutral — composes with reveal + effects. See [AI-REFERENCE.md § Inline Style Spans](./AI-REFERENCE.md#inline-style-spans--word-range-decoration). |
| `loading` | `boolean` | `false` | Show skeleton loading state. Skeleton geometry is derived from real layout. Reveal is deferred until `loading` becomes `false`. |
| `skeletonLines` | `number` | `3` | Hint: number of skeleton lines before layout completes. Overridden by actual layout. |
| `skeletonLastLineWidth` | `number` | `0.7` | Hint: width ratio (0–1) of the last skeleton line. Overridden by actual layout. |
| `preRevealed` | `boolean` | `false` | Start with all text visible — skip reveal entirely. Useful for showcasing effects on already-visible text. |
| `seed` | `number` | hash(text + mode) | Deterministic seed for PRNG (decode scramble). |
| `reducedMotion` | `ReducedMotionMode` | `'auto'` | `auto` (OS preference), `always`, or `never`. |
| `speed` | `number` | per preset | Base speed (ms). Overrides `speedPreset`. |
| `charSpeed` | `number` | per preset | Inner character speed within word groups (ms). Overrides `speedPreset`. |
| `scramblePasses` | `number` | `4` | Number of scramble cycles per character in decode mode. |
| `onrevealcomplete` | `() => void` | — | Callback fired when all units are revealed. |
| `oneffectscomplete` | `() => void` | — | Callback fired when all one-shot effects finish. |
| `as` | `string` | `'span'` | HTML element tag for the root container. |
| `class` | `string` | `''` | Additional CSS classes for the root container. |

## Three Effect Layers

Kinetic Text runs three independent effect layers simultaneously on every block of text. They compose together — a single block can be revealing with one style, sustaining a continuous loop, and reacting to one-shot events all at the same time.

1. **Reveal** — how text first appears (entrance animation). Controlled by `revealMode` + `revealStyle`.
2. **Continuous** — sustained atmosphere loop after reveal. Set via `activeEffect` prop.
3. **One-shot** — dramatic punctuation moments fired on demand. Triggered via `cues` (timeline-driven) or `oneShotEffect` + `oneShotTrigger` (imperative).

Swapping one layer does not interrupt the others.

A fourth, motion-neutral layer — **inline style spans** (`styleSpans` prop) — decorates word ranges with dialogue quotes, emphasis, underline, or monospace chips. See [AI-REFERENCE.md § Inline Style Spans](./AI-REFERENCE.md#inline-style-spans--word-range-decoration).

## Effects

### One-shot effects (16)

Triggered via `cues` or `oneShotEffect` — fire once per trigger. Per-character, with stagger and duration variation.

| Effect | Description | Use Case |
|--------|-------------|----------|
| `shake` | Horizontal jitter with decaying amplitude | Door slam, collision, impact |
| `quake` | Heavy X+Y jitter with rolling settle | Earthquake, explosion, structural collapse |
| `jolt` | Sharp displacement + elastic snap-back | Jump scare, sudden shock |
| `glitch` | Choppy positional offset + skew | Digital corruption, reality break |
| `surge` | Ascending scale with brightness flash | Magic cast, power activation |
| `warp` | ScaleX oscillation with subtle skew | Teleportation, dimensional shift |
| `explode` | Radial blast — characters fly outward and reassemble | Detonation, catastrophic failure |
| `collapse` | Gravity-driven fall with tumbling rotation | Building demolition, cave-in |
| `scatter` | Gentle drift in random directions with slow fade | Wind dispersal, memory fragmenting |
| `spin` | Full 360° rotation with staggered domino wave | Vertigo, mechanical activation |
| `bounce` | Drop + elastic bounce with decreasing amplitude | Landing impact, playful energy |
| `flash` | Quick scale-up pulse with brightness burst | Lightning, camera flash, revelation |
| `shatter` | Sharp angular displacement with skew | Glass breaking, shield failure |
| `vortex` | Spiral inward with accelerating rotation | Black hole, whirlpool, summoning |
| `ripple` | Vertical wave propagating left-to-right | Shockwave, sonic boom, psychic wave |
| `slam` | Scale up huge then slam to normal with overshoot | Heavy impact, boss landing |

### Continuous effects (21)

Applied via `activeEffect` prop — loop indefinitely while active. Each character animates independently with unique parameters from a seeded PRNG.

| Effect | Description | Use Case | Secondary Harmonic |
|--------|-------------|----------|--------------------|
| `drift` | Gentle vertical sine wave + Y float | Underwater, dreaming, weightless | Yes |
| `flicker` | Irregular opacity stutters | Failing lights, unstable power | No |
| `breathe` | Slow rhythmic scale pulse | Suspense, emotional weight | Yes |
| `tremble` | Fast micro-vibration | Cold, fear, fragility | Yes |
| `pulse` | Heartbeat-tempo scale with sharp attack | Ritual energy, countdown | Yes |
| `whisper` | Opacity and scale recede together | Ghosts, fading memory, secrets | No |
| `fade` | Gradual opacity drift | Losing consciousness, time skip | No |
| `freeze` | Micro contraction + brightness reduction | Ice magic, paralysis, stasis | No |
| `burn` | Vertical micro-wobble with skew | Fire scenes, desert heat, rage | No |
| `static` | Rapid micro-jitter + opacity flicker | Radio noise, corrupted data | No |
| `distort` | Rotation + asymmetric scale oscillation | Drunk, hallucinating, vertigo | No |
| `sway` | Lateral X oscillation | Ship travel, storms, unstable footing | No |
| `glow` | Brightness emission cycle | Enchantment, bioluminescence | No |
| `wave` | Y sine wave with scale swell | Ocean, crowd motion, musical rhythm | Yes |
| `float` | Dual-axis drift with micro rotation | Zero gravity, levitation | Yes |
| `wobble` | Micro rotation oscillation | Instability, jelly physics | No |
| `sparkle` | Opacity twinkle with randomized phase | Magic particles, starlight, treasure | No |
| `drip` | Gravity-like downward Y drift | Rain, melting, cave dripping | No |
| `stretch` | Scale Y elongation cycle | Distortion fields, body horror | No |
| `vibrate` | High-frequency positional jitter | Machinery, engines, electrical charge | No |
| `haunt` | Ghostly drift with deep opacity cycling | Ghosts, afterimages, liminal spaces | Yes |

Effects marked **Secondary Harmonic** apply an additional animation layer on word wrappers, creating richer composite motion.

## Reveal styles (8)

| Style | Description | Physics Adaptation |
|-------|-------------|-------------------|
| `pop` | **Default.** Characters snap in from random offsets — fast, chaotic. | Universal across all physics presets |
| `scramble` | Characters fly in from random positions/rotations with spring settle | Wide radius, heavy rotation |
| `rise` | Characters ascend from below into position | Glass adds blur trail during ascent |
| `drop` | Characters fall from above with gravity feel and landing bounce | Glass/retro have custom variants |
| `scale` | Characters grow from zero scale to full size | Clean, no positional offset |
| `blur` | Characters emerge from gaussian blur into sharp focus | Glass adds extra depth |
| `instant` | No animation — binary visible flip | All physics |

## Cue authoring

Cues trigger one-shot effects during or after the reveal timeline.

```typescript
import type { KineticCue } from '@void-energy/kinetic-text/types';

const cues: KineticCue[] = [
  // Fire shake on a word range at 1.2s into reveal
  {
    id: 'word-3-shake',
    effect: 'shake',
    trigger: 'at-time',
    atMs: 1200,
    range: { start: 15, end: 20 },
  },
  // Fire surge on entire block when reveal completes
  {
    id: 'end-surge',
    effect: 'surge',
    trigger: 'on-complete',
  },
];
```

### Dispatch rules

- Time-triggered cues (`at-time`) fire when `elapsed >= atMs`
- Completion-triggered cues (`on-complete`) fire after all units are revealed
- Each cue fires at most once (tracked by `id`)
- Cues with out-of-range `range` targets are silently skipped (dev warning in non-production)

### Imperative one-shot (no cue system)

For effects fired by user interaction or external events rather than the reveal timeline:

```svelte
<script lang="ts">
  let trigger = $state(0);
</script>

<KineticText
  text="The reactor is unstable."
  styleSnapshot={snapshot}
  preRevealed
  oneShotEffect="shake"
  oneShotTrigger={trigger}
/>

<button onclick={() => trigger++}>Fire shake</button>
```

### Composing all three layers

```svelte
<!-- Reveal word-by-word with drop entrance,
     continuous pulse loop during and after reveal,
     fire surge on demand -->
<KineticText
  text={scene.text}
  styleSnapshot={snapshot}
  revealMode="word"
  revealStyle="drop"
  activeEffect="pulse"
  oneShotEffect="surge"
  oneShotTrigger={surgeTrigger}
  speed={40}
/>
```

## Skeleton loading

KineticText includes built-in skeleton loading that shows layout-accurate shimmer line-blocks while content loads. The skeleton geometry (line count, line height, last-line width) is derived from the same Pretext layout engine used for animation — no guessing.

### Loading prop

Set `loading={true}` to show the skeleton and defer the reveal. When `loading` becomes `false`, the skeleton crossfades out (300ms) while the reveal animation begins simultaneously.

```svelte
<script lang="ts">
  let isLoading = $state(true);

  async function fetchContent() {
    const text = await getAIResponse();
    // Text is set, skeleton shows real geometry while we decide the effect
    const effect = await decideEffect(text);
    isLoading = false; // skeleton fades out, reveal starts
  }
</script>

<KineticText
  text={content}
  styleSnapshot={snapshot}
  loading={isLoading}
  revealMode="word"
  revealStyle="blur"
/>
```

The `skeletonLines` and `skeletonLastLineWidth` hint props provide pre-layout estimates shown before the font loads and layout completes. Once the layout engine measures the real text, these are overridden with exact values.

### Standalone skeleton

The `<KineticSkeleton>` component renders shimmer line-blocks without the animation engine. Useful as a lightweight placeholder or premium-tier fallback.

```svelte
<script lang="ts">
  import { KineticSkeleton } from '@void-energy/kinetic-text';
</script>

<KineticSkeleton lines={4} lineHeight={24} styleSnapshot={snapshot} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lines` | `number` | `3` | Number of skeleton lines. |
| `lastLineWidth` | `number` | `0.7` | Width ratio (0–1) of the last line. |
| `lineHeight` | `number` | `24` | Line height in px. |
| `styleSnapshot` | `TextStyleSnapshot` | — | **Required.** CSS var injection and physics/mode detection. |
| `class` | `string` | `''` | Additional CSS classes. |

### Shimmer physics

The skeleton shimmer adapts to the active physics preset:

| Physics | Shimmer Style |
|---------|--------------|
| **Glass** (dark) | Energy-primary glow sweep at 15% opacity |
| **Flat** (light) | White beam at 60% opacity |
| **Retro** | Hard-cut border-color scan line, no border-radius |

Reduced motion disables the shimmer animation; the skeleton blocks remain visible as static placeholders.

## Physics behavior

The component adapts its animations to the active physics preset:

| Physics | Easing | Effects |
|---------|--------|---------|
| `glass` | `cubic-bezier(0.16, 1, 0.3, 1)` | Motion blur on displacement effects |
| `flat` | `ease-out` | Standard easing |
| `retro` | `steps(4)` | Stepped timing, ±30% seeded jitter on stagger delays |

## Reduced motion

When `reducedMotion` is `'auto'` (default), the component respects `prefers-reduced-motion: reduce`. When active:
- Reveal skips to end immediately (all text visible)
- All CSS animations are suppressed
- Callbacks still fire normally

Set `reducedMotion: 'always'` to force this behavior, or `'never'` to bypass OS preference.

## DOM architecture

KineticText builds a two-layer DOM for accessibility and animation isolation:

```
.kinetic-text (root)
├── .kt-skeleton-layer (visible during loading, fades out on transition)
│   └── .kt-skeleton-line (shimmer line-block, height/width from layout)
│
├── .kt-visual (aria-hidden, visual layer — built when loading=false)
│   └── .kt-line (per line)
│       └── .kt-word (word wrapper, secondary effect target)
│           └── .kt-unit (continuous effect layer, per-char CSS vars)
│               └── .kt-oneshot (one-shot isolation, animation-mix: additive)
│                   └── .kt-glyph (reveal animation target, data-kt-state)
│
└── .kt-semantic (sr-only, aria-live='polite')
    └── [full text for screen readers]
```

During loading, only the skeleton layer exists — no renderer DOM is built. When `loading` becomes `false`, the renderer builds `.kt-visual` while the skeleton layer goes `position: absolute` and fades out, preventing doubled height.

The visual layer is set to `user-select: none` — animated text cannot be selected or copied by users. The `.kt-semantic` layer provides the full plain text to screen readers and assistive technology via `aria-live="polite"`.

Each character receives unique CSS custom properties (`--kt-dx`, `--kt-dy`, `--kt-rotate`, `--kt-scale`, `--kt-phase`, etc.) computed by a seeded PRNG. Parametric keyframes read these variables, so the same animation produces different motion per character.

## TTS-synced playback

`<TtsKineticBlock>` is a drop-in component that pairs `<KineticText>` with spoken audio so the reveal unfolds at the same cadence as the voice, and arbitrary side effects fire on timed words. Three concerns are owned by the component: audio↔reveal sync, blob-URL lifecycle, and audio-driven action dispatch.

### Minimum setup

```svelte
<script lang="ts">
  import TtsKineticBlock from '@void-energy/kinetic-text/tts-block';
  // Pick any built-in provider — inworld / elevenLabs / openai — or write your own.
  // The core doesn't know which one you pick; swapping is a one-import change.
  import { elevenLabsSynthesize } from '@void-energy/kinetic-text/tts/providers';
  import { createVoidEnergyTextStyleSnapshot } from '@void-energy/kinetic-text/adapters/void-energy-host';
  import '@void-energy/kinetic-text/styles';

  let text = 'The reactor hums awake, then roars.';
  let audio = $state<Blob | null>(null);
  let wordTimestamps = $state();

  let el = $state<HTMLElement>();
  const snapshot = $derived(el ? createVoidEnergyTextStyleSnapshot(el) : null);

  async function prepare() {
    const r = await elevenLabsSynthesize(text, { voiceId: '...', apiKey: '...' });
    // Provider pre-creates an ObjectURL we won't use — revoke it so the Blob
    // isn't pinned twice. TtsKineticBlock creates its own URL from the Blob.
    URL.revokeObjectURL(r.audioUrl);
    audio = r.audioBlob;
    wordTimestamps = r.wordTimestamps.length ? r.wordTimestamps : undefined;
  }
</script>

<div bind:this={el}>
  {#if snapshot && audio}
    <TtsKineticBlock
      {text}
      {audio}
      {wordTimestamps}
      styleSnapshot={snapshot}
      revealStyle="drop"
      activeEffect="pulse"
    />
  {/if}
</div>
```

> **Provider-agnostic.** See the [TTS providers](#tts-providers) section below for built-in adapters, the platform matrix, and how to add a new provider in a single file.

`audio` accepts `HTMLAudioElement | Blob | string | null`. When you pass a `Blob`, the component owns the resulting ObjectURL and revokes it on unmount. When you pass an `HTMLAudioElement` or `string`, the consumer owns the lifecycle.

When `wordTimestamps` is omitted, the component waits for audio metadata and falls back to even-distribution word timing across the clip's duration. When `audio` is also omitted, the reveal runs on `speedPreset` alone — still usable for kinetic effects, just no voice.

### Timed cues and actions

Two timeline channels: `cues` fire kinetic effects, `actions` fire arbitrary payloads at timed words or absolute times.

```svelte
<script lang="ts">
  import type {
    TimedAction,
    TimedCue,
  } from '@void-energy/kinetic-text/tts';
  import { ambient } from '@void-energy/ambient-layers';

  const cues: TimedCue[] = [
    { atWord: 3, effect: 'flash' },           // kinetic effect on word 3
    { atMs: 2500, effect: 'shake' },          // kinetic effect at 2.5s
    { onComplete: true, effect: 'surge' },    // on reveal finish
  ];

  type BurstPayload = { variant: 'impact' | 'flash'; intensity: 'high' };
  const actions: TimedAction<BurstPayload>[] = [
    { atWord: 5, payload: { variant: 'impact', intensity: 'high' } },
    { atMs: 4000, payload: { variant: 'flash', intensity: 'high' } },
  ];
</script>

<TtsKineticBlock
  {text}
  {audio}
  {wordTimestamps}
  styleSnapshot={snapshot}
  {cues}
  {actions}
  onaction={(p) => ambient.fire(p.variant, p.intensity)}
/>
```

`onaction` fires on the same clock as the audio — rate changes, pauses, and user scrubs keep it in step. With no audio, actions fire on a wall-clock `setTimeout` at the estimated `atMs` instead.

### Replaying the same block

`<KineticText>` does not reset from its post-reveal `isComplete` state, so replaying the same beat requires a fresh mount. Key the block from the parent:

```svelte
{#key `${beat.id}-${replayCounter}`}
  <TtsKineticBlock … />
{/key}
```

### TTS providers

The package is **provider-agnostic**. The core (`syncAudioToKT`, `wordTimesToRevealMarks`, `attachAudioActions`, `TtsKineticBlock`) never imports any provider. Each provider is a single file that normalizes its vendor's API into the universal `TTSResult` shape:

```typescript
interface TTSResult {
  audioBlob: Blob;          // the rendered speech
  audioUrl: string;          // pre-made ObjectURL (caller owns the lifecycle)
  wordTimestamps: WordTimestamp[];   // [] when the provider can't produce them
  durationMs: number;        // total clip duration
}

interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}
```

Swapping providers = swapping one import. Everything downstream works unchanged.

#### Built-in providers

Six adapters ship with the package, covering the biggest browser-feasible TTS platforms. Each is an independent file — tree-shaking drops unused ones from your bundle.

| Adapter | Word timestamps | Auth pattern |
|---------|-----------------|--------------|
| `inworldSynthesize` | Yes | Basic (user-provided key) |
| `elevenLabsSynthesize` | Yes (char → word) | `xi-api-key` header |
| `openaiSynthesize` | No — uses duration fallback | Bearer (prefer proxy in prod) |
| `azureSynthesize` | No — uses duration fallback | `Ocp-Apim-Subscription-Key` |
| `googleSynthesize` | No — uses duration fallback | API key (REST path) |
| `deepgramSynthesize` | No — uses duration fallback | `Authorization: Token <key>` |

##### InWorld TTS

Game-focused, expressive voices, per-word alignment in the response.

```typescript
import { inworldSynthesize } from '@void-energy/kinetic-text/tts/providers';

const r = await inworldSynthesize('The reactor hums awake.', {
  voiceId: 'Ashley',
  apiKey: '...',
  // modelId, audioEncoding, sampleRateHertz, includeWordTimestamps — all optional
});
```

##### ElevenLabs

Industry leader for natural voices and voice cloning. Uses the `/with-timestamps` endpoint; the adapter aggregates character-level alignment into word timestamps.

```typescript
import { elevenLabsSynthesize } from '@void-energy/kinetic-text/tts/providers';

const r = await elevenLabsSynthesize('The reactor hums awake.', {
  voiceId: 'EXAVITQu4vr4xnSDxMaL',   // from ElevenLabs dashboard → VoiceLab
  apiKey: '...',
  // modelId — default 'eleven_multilingual_v2'
  // outputFormat — default 'mp3_44100_128'
  // useNormalizedAlignment — default true (recommended)
});
```

##### OpenAI TTS

Cheap and fast, widely adopted. **No word timestamps.** When no timestamps are available, `<TtsKineticBlock>` falls back to even-distribution word timing across the clip's audible duration — the reveal stays paced to the voice, just not character-accurate.

```typescript
import { openaiSynthesize } from '@void-energy/kinetic-text/tts/providers';

const r = await openaiSynthesize('The reactor hums awake.', {
  voice: 'nova',
  apiKey: '...',
  // model — default 'gpt-4o-mini-tts'
  // responseFormat — default 'mp3'
  // speed, instructions — optional
});
```

##### Azure Speech (REST)

Enterprise-grade, large voice catalog (incl. neural and multilingual). Simple subscription-key auth. **No word timestamps via REST** (WordBoundary is streaming-SDK-only) — duration fallback.

```typescript
import { azureSynthesize } from '@void-energy/kinetic-text/tts/providers';

const r = await azureSynthesize('The reactor hums awake.', {
  subscriptionKey: '...',
  region: 'eastus',
  voice: 'en-US-JennyNeural',
  // outputFormat — default 'audio-24khz-160kbitrate-mono-mp3'
  // prosody — optional { rate, pitch, volume } SSML prosody
});
```

##### Google Cloud Text-to-Speech (REST)

Huge voice catalog (Wavenet, Neural2, Chirp). **No word timestamps** via the REST path — duration fallback. Uses a restricted API key, not OAuth service accounts (those paths require a server proxy).

```typescript
import { googleSynthesize } from '@void-energy/kinetic-text/tts/providers';

const r = await googleSynthesize('The reactor hums awake.', {
  apiKey: '...',
  voiceName: 'en-US-Wavenet-D',
  // audioEncoding — default 'MP3'
  // speakingRate, pitch, volumeGainDb — optional
});
```

##### Deepgram Aura

New-generation realtime TTS, low latency. **No word timestamps from the speak endpoint** — duration fallback. Token-based auth, browser-safe when the key is short-lived.

```typescript
import { deepgramSynthesize } from '@void-energy/kinetic-text/tts/providers';

const r = await deepgramSynthesize('The reactor hums awake.', {
  apiKey: '...',
  model: 'aura-2-asteria-en',
  // encoding — default 'mp3'
  // sampleRate — optional
});
```

##### xAI Grok TTS

xAI's TTS API (same `XAI_API_KEY` as the Grok chat API). **No word timestamps** — duration fallback. 5 built-in voices (`eve`, `ara`, `rex`, `sal`, `leo`), 20 languages, and inline expressive tags (`[laugh]`, `[sigh]`, `[breath]`, `<whisper>…</whisper>`, `<emphasis>…</emphasis>`) that pass through `text` untouched — useful ammunition for AI-generated story beats. **Browser-origin note:** xAI's chat API historically does not set permissive CORS headers; test from your actual origin before relying on direct browser calls, a backend proxy may be required.

```typescript
import { xaiSynthesize } from '@void-energy/kinetic-text/tts/providers';

const r = await xaiSynthesize('She paused. [sigh] <whisper>Not like this.</whisper>', {
  apiKey: '...',
  voiceId: 'eve',
  // language — default 'en'; 'auto' for auto-detect
  // codec — default 'mp3'; also 'wav', 'pcm', 'mulaw', 'alaw'
  // sampleRate — default 24000
  // bitRate — default 128000 (mp3 only)
});
```

##### Kokoro (self-hosted via Kokoro-FastAPI)

Apache-2.0 82M-param open-weight TTS model by [hexgrad](https://huggingface.co/hexgrad/Kokoro-82M), competitive with hosted providers on English naturalness and ~free to run. The adapter targets [remsky/Kokoro-FastAPI](https://github.com/remsky/Kokoro-FastAPI) — a ready-to-deploy wrapper with OpenAI-compatible endpoints and a dev endpoint for word timestamps. **Default mode `'captioned'` returns real per-word timings** via `POST /dev/captioned_speech`. Switch to `mode: 'plain'` to call the OpenAI-compatible `POST /v1/audio/speech` endpoint when the dev path is unavailable (proxies that whitelist only the public path). 54 voices; voice-blending supported via the native FastAPI syntax `'af_bella(2)+af_sky(1)'`.

```typescript
import { kokoroSynthesize } from '@void-energy/kinetic-text/tts/providers';

const r = await kokoroSynthesize('The reactor hums awake.', {
  // endpoint — default 'http://localhost:8880' (your Kokoro-FastAPI instance)
  voice: 'af_bella',
  // mode — default 'captioned' (real word timestamps); 'plain' for /v1/audio/speech
  // responseFormat — default 'mp3'; also wav, opus, flac, m4a, pcm
  // speed — 0.25–4.0, default 1.0
  // language — optional override; inferred from the voice prefix
  // apiKey — optional bearer token if your deployment sits behind an auth proxy
});
```

#### Platform matrix

How each major TTS service fits the adapter pattern:

| Provider | Word timestamps | Browser-safe auth | Status | Integration notes |
|----------|-----------------|-------------------|--------|-------------------|
| **InWorld** | Yes | Yes (basic auth) | ✅ Built in | `inworldSynthesize` |
| **ElevenLabs** | Yes (char-level → word) | Yes (`xi-api-key`) | ✅ Built in | `elevenLabsSynthesize` |
| **OpenAI TTS** | No | Yes (bearer) | ✅ Built in (fallback) | `openaiSynthesize` — duration-estimate |
| **Azure Speech (REST)** | No (streaming SDK only) | Yes (subscription key) | ✅ Built in (fallback) | `azureSynthesize` — duration-estimate |
| **Google Cloud TTS** | No (SSML marks only) | Yes (API key) | ✅ Built in (fallback) | `googleSynthesize` — REST + API key. OAuth service-account paths need a proxy |
| **Deepgram Aura** | No (speak endpoint) | Yes (API token) | ✅ Built in (fallback) | `deepgramSynthesize` |
| **Kokoro (Kokoro-FastAPI)** | Yes (`/dev/captioned_speech`) | Yes (optional bearer) | ✅ Built in | `kokoroSynthesize` — self-host open-source, Apache-2.0, OpenAI-compatible path also supported |
| **xAI Grok TTS** | No | Yes (bearer) — CORS caveat | ✅ Built in (fallback) | `xaiSynthesize` — 5 voices, expressive tags (`[laugh]`, `<whisper>`, `<emphasis>`); may require backend proxy for browser calls |
| **Cartesia** | Yes (streaming only) | Yes (API key) | ⚙️ Follow ElevenLabs pattern | Timings come from `/tts/sse`; REST bytes endpoint has audio-only |
| **Play.ht** | Yes | Yes (API key + user id) | ⚙️ Follow ElevenLabs pattern | Job-poll API, receive word-level timings |
| **Amazon Polly** | Yes (via `SpeechMarks`) | SigV4 (**not browser-safe**) | ⚠️ Use server-proxy | Call through your backend; aggregate `SpeechMarks` response into `WordTimestamp[]` |
| **Web Speech API** | Yes (`onboundary`) | Native | ❌ Doesn't fit | Browser-native, produces no Blob; use `KineticText` directly with manual `revealMarks` |

#### Adding a new provider

A provider adapter is a single file that calls its vendor's API and returns `TTSResult`. Nothing else in the package needs to change.

**Step 1** — Create `src/tts/providers/<name>.ts`:

```typescript
import type { TTSResult, WordTimestamp } from '../types';

export interface MyProviderOptions {
  voiceId: string;
  apiKey: string;
  // whatever else your provider needs
}

export async function synthesize(
  text: string,
  options: MyProviderOptions,
): Promise<TTSResult> {
  const response = await fetch('https://api.myprovider.com/tts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${options.apiKey}` },
    body: JSON.stringify({ text, voice: options.voiceId }),
  });
  if (!response.ok) throw new Error(`MyProvider TTS failed: ${response.status}`);

  const json = await response.json();
  const audioBlob = /* decode base64 / fetch audio bytes */;
  const audioUrl = URL.createObjectURL(audioBlob);

  // Normalize to WordTimestamp[] — or return [] if the provider doesn't
  // expose alignment, and rely on <TtsKineticBlock>'s duration fallback.
  const wordTimestamps: WordTimestamp[] = normalizeAlignment(json);

  return {
    audioBlob,
    audioUrl,
    wordTimestamps,
    durationMs: wordTimestamps[wordTimestamps.length - 1]?.endMs ?? 0,
  };
}
```

**Step 2** — Add to the barrel `src/tts/providers/index.ts`:

```typescript
export {
  synthesize as myProviderSynthesize,
  type MyProviderOptions,
} from './my-provider';
```

That's the entire integration. `<TtsKineticBlock>` receives `audioBlob` + `wordTimestamps` and does the rest.

#### Char-level alignment → word timestamps

If your provider exposes only character-level timings (ElevenLabs, some others), collapse whitespace runs the same way the built-in ElevenLabs adapter does:

```typescript
export function aggregateCharTimestamps(
  chars: string[],
  starts: number[], // seconds
  ends: number[],
): WordTimestamp[] {
  const n = Math.min(chars.length, starts.length, ends.length);
  const words: WordTimestamp[] = [];
  let i = 0;
  while (i < n) {
    while (i < n && /\s/.test(chars[i])) i++;
    if (i >= n) break;
    const wordStart = starts[i];
    let wordEnd = ends[i];
    let word = chars[i++];
    while (i < n && !/\s/.test(chars[i])) {
      word += chars[i];
      wordEnd = ends[i++];
    }
    words.push({ word, startMs: wordStart * 1000, endMs: wordEnd * 1000 });
  }
  return words;
}
```

Using the same whitespace rule as `wordSpansOf` keeps the downstream helpers (`wordStartTimes`, `buildKineticCues`, `resolveActionTimes`) aligned to the same word indices authors author against.

#### Server-proxy pattern (for auth-heavy providers)

Polly (SigV4), Google Cloud (OAuth service account), and any production app hiding API keys should proxy TTS through your backend:

```typescript
// providers/my-backend.ts
export interface MyBackendOptions {
  sessionToken: string;  // short-lived, app-issued
  voiceId: string;
}

export async function synthesize(
  text: string,
  options: MyBackendOptions,
): Promise<TTSResult> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.sessionToken}`,
    },
    body: JSON.stringify({ text, voiceId: options.voiceId }),
  });
  const { audioBase64, wordTimestamps } = await response.json();
  const audioBlob = base64ToBlob(audioBase64, 'audio/mpeg');
  return {
    audioBlob,
    audioUrl: URL.createObjectURL(audioBlob),
    wordTimestamps,
    durationMs: wordTimestamps[wordTimestamps.length - 1]?.endMs ?? 0,
  };
}
```

Your backend endpoint owns the vendor API key, calls the real provider (Polly, Google, whatever), normalizes the response, and streams it back. From the package's perspective this is just another adapter.

#### Providers without Blob output (Web Speech API)

The browser's native `SpeechSynthesis` plays audio directly — it doesn't produce a `Blob`, so it can't satisfy the `TTSResult` contract. Integrate it differently: call `speechSynthesis.speak(utterance)` alongside `<KineticText>` and feed `onboundary` events into a manually-built `RevealMark[]`. This bypasses `<TtsKineticBlock>` but still gives you synced reveal.

### Using the helpers directly

If the component is too opinionated for your case, the building blocks are individually exported from `/tts`:

- `wordTimesToRevealMarks(text, timestamps)` — TTS word times → per-character `RevealMark[]` for `<KineticText>` `revealMarks` prop
- `wordStartTimes(text, speedPreset, timestamps?)` — the timestamp-or-fallback word clock
- `buildKineticCues(cues, wordStarts)` — resolve `TimedCue[]` → `KineticCue[]`
- `resolveActionTimes(actions, wordStarts)` — resolve `TimedAction<T>[]` → sorted `{atMs, payload}[]`
- `syncAudioToKT({ audio, controls })` — bind `<audio>` events to `KineticTextControls`
- `attachAudioActions(audio, scheduled, onFire)` — rate/pause/scrub-safe dispatcher
- `estimateCharSpeed(durationMs, text)` — uniform charSpeed for providers without word timestamps

## Exports

| Export path | Contents |
|-------------|----------|
| `@void-energy/kinetic-text` | `KineticText`, `KineticSkeleton`, `TtsKineticBlock` components, `createVoidEnergyTextStyleSnapshot` adapter, all public types |
| `@void-energy/kinetic-text/component` | `KineticText` Svelte component only |
| `@void-energy/kinetic-text/skeleton` | `KineticSkeleton` Svelte component only |
| `@void-energy/kinetic-text/tts-block` | `TtsKineticBlock` Svelte component only |
| `@void-energy/kinetic-text/types` | Type-only exports |
| `@void-energy/kinetic-text/adapters/void-energy-host` | `createVoidEnergyTextStyleSnapshot` function |
| `@void-energy/kinetic-text/tts` | `syncAudioToKT`, `wordTimesToRevealMarks`, `wordStartTimes`, `buildKineticCues`, `resolveActionTimes`, `attachAudioActions`, `estimateCharSpeed`, `stripEffectTokens`, `resolveEffectCues`, plus `TimedCue`, `TimedAction`, `TTSResult`, `WordTimestamp` types |
| `@void-energy/kinetic-text/tts/providers` | Provider adapters: `inworldSynthesize`, `elevenLabsSynthesize`, `openaiSynthesize`, `azureSynthesize`, `googleSynthesize`, `deepgramSynthesize` + their `*Options` types |
| `@void-energy/kinetic-text/styles` | Compiled CSS stylesheet |

## License

UNLICENSED — proprietary. Private distribution only.
