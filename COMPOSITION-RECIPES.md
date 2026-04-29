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
- Skip an in-flight reveal by binding `controls` (`TtsKineticBlockControls`) and calling `controls.skipToEnd()` — it snaps the text complete, stops audio, and fires `onended`
- When TTS is unavailable or the user hasn't provided a key, omit `audio` and `wordTimestamps` — the reveal runs on `speedPreset` alone and actions fire on a wall-clock `setTimeout`. Every other prop works unchanged
- A working end-to-end example is `packages/dgrs/src/components/VibeMachine.svelte`

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

## Ambient light from an image

Use when an image-backed or atmosphere-primary surface should bleed soft colored light into its surroundings — story scenes, hero panels, album-cover-style cards, scene tiles in a narrative reader. The container becomes a light source, not just a frame.

Two pieces collaborate:

- `use:aura` ([src/actions/aura.ts](src/actions/aura.ts)) — toggles `data-aura` on the host. When a color is passed, writes `--aura-color` inline; otherwise the SCSS falls back to `var(--energy-primary)` so the glow tracks the active atmosphere. Rendered on a `::after` pseudo-element.
- `extractAura()` ([src/lib/aura.ts](src/lib/aura.ts)) — samples a single dominant color from an image and clamps it into a glow-friendly HSL range. Always returns a valid CSS color, never throws.

### Atmosphere-driven (no image, color tracks the active theme)

The simplest path. Drop `use:aura` on a surface and the glow follows whichever atmosphere is active.

```svelte
<script lang="ts">
  import { aura } from '@actions/aura';
</script>

<div class="surface-raised p-lg flex flex-col gap-lg" use:aura>
  <h3>Scene title</h3>
  <p class="text-dim">The glow recolors when the user switches atmospheres.</p>
</div>
```

### Image-driven (extract color from the image itself)

```svelte
<script lang="ts">
  import { aura } from '@actions/aura';
  import { extractAura } from '@lib/aura';

  let { src, alt }: { src: string; alt: string } = $props();
  let img = $state<HTMLImageElement>();
  let color = $state<string | undefined>();

  $effect(() => {
    if (img) extractAura(img).then((c) => (color = c));
  });
</script>

<div class="surface-raised p-lg flex flex-col gap-lg" use:aura={{ color }}>
  <img bind:this={img} {src} {alt} crossorigin="anonymous" />
  <div class="flex flex-col gap-xs">
    <h3>Scene title</h3>
    <p class="text-dim">Short narrative beat.</p>
  </div>
</div>
```

Notes:

- Aura is active on dark glass and dark flat only. Light mode and retro disable the `::after` pseudo-element automatically — the same consumer markup works everywhere.
- `prefers-reduced-motion: reduce` collapses the color crossfade to an instant swap.
- The host gets `position: relative`. If you need `position: absolute` or `fixed` on the host itself, wrap aura on a child instead.
- See [CHEAT-SHEET › Aura](CHEAT-SHEET.md#g-aura-useaura) for the full prop and option reference.

Avoid:

- Attaching `use:aura` to dashboard tiles, form fields, navigation chrome, or generic cards. Aura is for image-backed or atmosphere-primary surfaces only.
- Stacking multiple Auras inside one visible region — pages with several glows fight each other and read as visual noise. Prefer one focal Aura per region.
- Hand-writing `box-shadow`, `radial-gradient`, or `filter: blur()` to recreate ambient color spill — that is what `use:aura` exists for.
- Calling `extractAura` on every render — drive it from a `$effect` keyed off the image element or src.

## Foreign / User-Generated Content

Use when rendering HTML the application **does not author**: rich-text-editor output, embedded third-party blocks, markdown rendered from user input, paste-to-publish flows.

- Wrap the foreign HTML in `<div class="prose-untrusted">…</div>` — the scope caps runaway media, wraps wide tables, re-anchors inheritable typography, and isolates layout/stacking context.
- Sanitize the HTML **separately** before rendering (DOMPurify, trusted-types). `.prose-untrusted` is the visual quarantine layer, not a security layer — it does not strip `<script>`, event handlers, or dangerous URL schemes.
- For **trusted** rich text the app controls (markdown blogs, legal documents, in-house articles) use `.prose` or `.legal-content` instead — `.prose-untrusted` is heavier and constrains layout in ways that matter only for foreign content.
- Inline `style="…"` on foreign elements still wins locally — that is by design. The scope defends against block-level leakage, not against attributes the sanitizer left in place.

```svelte
<div class="prose-untrusted">
  {@html sanitize(userHtml)}
</div>
```

Avoid:

- Building a new wrapper component to "safely render rich text" — `.prose-untrusted` plus a sanitizer is the system answer
- Using `.prose-untrusted` on content the app authors — `.prose` is the right scope for trusted rich text
- Skipping the sanitizer because the scope "looks safe" — visual containment is not script containment

## Markdown Strings

Use when the content arrives as a markdown string (AI-generated narrative, help text, changelog entries, CMS field, toast detail body). The `Markdown` primitive bundles parser + sanitizer + prose wrapper so consumers don't make those decisions per-call.

```svelte
<!-- AI / untrusted content (default — sanitizer runs) -->
<Markdown source={aiOutput} />

<!-- System-authored / trusted content (sanitizer bypassed) -->
<Markdown source={changelogMd} trusted />

<!-- Inline phrasing (tooltip body, label text — wrapper is <span>, no <p>) -->
<Markdown source={tooltipBody} inline />
```

- Default is **safe**: bare `<Markdown source={x} />` sanitizes, scopes to `.prose`, and auto-applies `target="_blank" rel="noopener noreferrer"` to external links.
- The `trusted` flag is for system-authored markdown committed in source (changelog, help copy, settings descriptions). Treat the word `trusted` in a diff as a sanitizer-bypass review surface.
- Empty / `null` / `undefined` / whitespace-only sources render an empty wrapper without throwing — pre-first-chunk AI streaming is safe.
- Markdown is **complete strings only** in v1; if a streaming surface needs incremental render of chunks, buffer them consumer-side until a sentence/paragraph boundary and pass the completed string.

**Phase 0c W1 transition (active until `.prose-untrusted` lands in `_prose.scss`):** the primitive currently emits `.prose` only on the sanitized path. Sanitization runs and the security posture is identical to the final shape, but the UGC-vs-system styling-scope differentiation is deferred. When Phase 0c W1 ships `.prose-untrusted`, the wrapper class on the sanitized branch of `Markdown.svelte` becomes `prose prose-untrusted {className}` — a one-line change. Consumer code does not need to change.

Avoid:

- Hand-rolling `marked()` / `markdown-it()` + `{@html}` calls — the `Markdown` primitive is the system answer
- Wrapping `<Markdown>` in your own sanitizer — the sanitizer already runs by default
- Passing `trusted` for AI-generated, CMS-derived, or user-authored content — that's an XSS hole
- Using `<Markdown>` for plain text that contains no markdown syntax — pass the string directly to a `<p>` instead

## Before Creating Something New

Ask these in order:

1. Is this already a registry component?
2. Is this already a registry action or controller?
3. Is this a documented recipe built from native HTML and shipped classes?
4. Is the missing need real, or am I failing to compose the existing system correctly?
