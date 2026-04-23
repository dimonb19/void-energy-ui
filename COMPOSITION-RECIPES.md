# Composition Recipes

Compact page archetypes for AI page-building. Start here after checking `src/config/component-registry.json`.

## General Scaffold

```svelte
<div class="container flex flex-col gap-2xl py-2xl">
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Section title</h2>
        <p class="text-dim">Short explanation.</p>
      </div>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <!-- content -->
      </div>
    </div>
  </section>
</div>
```

## Dashboard / App Home

Use when the page has summary metrics, quick actions, and recent activity.

- Header: native heading + short copy + `ActionBtn` / `IconBtn`
- Summary row: `stat-card`, `progress-ring`, or compact raised cards
- Navigation: `breadcrumbs` for hierarchy, `tabs` for mode switching, `sidebar` for section nav
- Activity or lists: native lists/tables inside `surface-sunk`
- Charts: `line-chart`, `bar-chart`, `donut-chart`

Avoid:

- Custom KPI widgets when `stat-card`, charts, or native markup already cover the need
- Dense card spacing; use `gap-lg`

## Marketing / Landing Page

Use when the page is mostly narrative, CTA-driven, and section based.

- Hero: native headings, paragraph text, `ActionBtn`, `IconBtn`, `btn-ghost`
- Feature grid: raised cards with icons, short text, and native links/buttons
- Social proof or highlights: `tile` if content is story-like, otherwise native cards
- FAQ: native `<details>` groups before inventing accordion widgets
- Footer CTAs: native buttons and links with shipped button classes

Avoid:

- Building a fake design-system `Hero` component
- Recreating carousels or accordions without proving a real need

## Settings / Preferences

Use when the page is form-heavy and grouped by concern.

- Page nav: `sidebar` or `tabs`
- Form groups: raised card per category, sunk wells per subgroup
- Inputs: `edit-field`, `selector`, `switcher`, `toggle`, `edit-textarea`, `slider-field`
- Async assist: `generate-field` and `generate-textarea`
- Save/cancel: native buttons with `btn-*` classes or `ActionBtn`

Recommended structure:

- Account
- Appearance
- Notifications
- Danger zone

## Story / Content Hub

Use when the page is about browsable media, editorial sections, or token-gated content.

- Hero or spotlight: raised card with native media/text layout
- Category rails: `tile` inside horizontal strips
- Filtering: `tabs`, `switcher`, `selector`, `search-field`
- Metadata: native text groups, badges, chips, and links
- Gated content: `tile` with `gate`

Avoid:

- Rebuilding cards for story browsing when `tile` already exists
- Hiding key state only in color; use labels and icons

## Analytics / Reporting

Use when the page is data heavy but still explanatory.

- Top row: `stat-card` or compact raised summaries
- Visualization block: `line-chart`, `bar-chart`, `donut-chart`
- Controls: `tabs`, `selector`, `switcher`
- Definitions and notes: native text blocks below charts
- Drill-down lists: native tables or list markup inside sunk wells

Guideline:

- Pair every chart with a visible title, short description, and value-format explanation

## Narrative UI (TTS + Kinetic + Ambient)

Use when a block of text should unfold at the cadence of spoken audio with timed visual effects — story beats, AI narration, cinematic UI, read-aloud tutorials.

Three packages collaborate and the wiring is a single component:

- `@void-energy/kinetic-text/tts-block` — `<TtsKineticBlock>` owns reveal sync, audio-driven action dispatch, and blob-URL lifecycle
- `@void-energy/kinetic-text/tts/providers` — provider-agnostic TTS adapters. Built-in: `inworldSynthesize`, `elevenLabsSynthesize`, `openaiSynthesize`. Adding a new provider (Deepgram, Cartesia, your backend, etc.) is a single file — see the kinetic-text README's "TTS providers" section
- `@void-energy/ambient-layers` — `ambient.fire(variant, intensity)` triggers one-shot backdrop bursts; `ambient.push(category, variant, intensity)` mounts persistent backdrop layers

Minimum viable composition:

```svelte
<script lang="ts">
  import TtsKineticBlock from '@void-energy/kinetic-text/tts-block';
  // Any built-in or custom adapter works — swap this one import to change vendor.
  import { elevenLabsSynthesize } from '@void-energy/kinetic-text/tts/providers';
  import { createVoidEnergyTextStyleSnapshot } from '@void-energy/kinetic-text/adapters/void-energy-host';
  import type {
    TimedAction,
    TimedCue,
  } from '@void-energy/kinetic-text/tts';
  import { ambient } from '@void-energy/ambient-layers';
  import '@void-energy/kinetic-text/styles';

  const text = 'The reactor hums awake, then roars.';
  type Burst = { variant: 'impact' | 'flash'; intensity: 'high' };
  const cues: TimedCue[] = [{ atWord: 5, effect: 'shake' }];
  const actions: TimedAction<Burst>[] = [
    { atWord: 5, payload: { variant: 'impact', intensity: 'high' } },
  ];

  let audio = $state<Blob | null>(null);
  let wordTimestamps = $state();
  let el = $state<HTMLElement>();
  const snapshot = $derived(el ? createVoidEnergyTextStyleSnapshot(el) : null);

  async function start() {
    const r = await elevenLabsSynthesize(text, { voiceId: '...', apiKey: '...' });
    URL.revokeObjectURL(r.audioUrl);
    audio = r.audioBlob;
    wordTimestamps = r.wordTimestamps.length ? r.wordTimestamps : undefined;
    // Optional: mount a persistent backdrop while the beat plays.
    ambient.push('atmosphere', 'heat', 'medium');
  }
</script>

<div bind:this={el} class="surface-sunk p-lg flex flex-col gap-lg">
  {#if snapshot && audio}
    <TtsKineticBlock
      {text}
      {audio}
      {wordTimestamps}
      styleSnapshot={snapshot}
      {cues}
      {actions}
      revealStyle="drop"
      activeEffect="pulse"
      onaction={(p) => ambient.fire(p.variant, p.intensity)}
    />
  {/if}
</div>
```

Notes:

- `<AmbientHost />` must be mounted once at the layout level — already wired into `src/layouts/Layout.astro`
- Replay the same block by keying on a counter: `{#key replay}<TtsKineticBlock …/>{/key}`
- When TTS is unavailable or the user hasn't provided a key, omit `audio` and `wordTimestamps` — the reveal runs on `speedPreset` alone and actions fire on a wall-clock `setTimeout`. Every other prop works unchanged
- A working end-to-end example is `src/components/conexus/VibeMachine.svelte`

Avoid:

- Wiring `syncAudioToKT` and `attachAudioActions` by hand unless `<TtsKineticBlock>` can't express what you need — the component handles pause/resume, rate changes, scrub, drift correction, blob-URL lifecycle, and autoplay errors
- Using `ambient.fire` in a `setInterval` to "beat" an effect — push a persistent layer instead and let physics own the loop
- Passing TTS timestamps as raw ms offsets — use `WordTimestamp[]` so the reveal marks stay character-accurate

## Auth / Onboarding

Use when the page is focused on one primary task.

- Narrow centered container
- One raised surface as the primary shell
- `edit-field`, `password-field`, `toggle`, `selector`
- `ActionBtn` for primary intent
- `btn-ghost` for secondary links and dismissive actions
- `toast` for async feedback, `modal` for confirmation or help

Avoid:

- Multi-panel complexity unless the flow truly requires it
- Tiny spacing inside the primary card

## Before Creating Something New

Ask these in order:

1. Is this already a registry component?
2. Is this already a registry action or controller?
3. Is this a documented recipe built from native HTML and shipped classes?
4. Is the missing need real, or am I failing to compose the existing system correctly?
