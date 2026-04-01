# @dgrslabs/void-energy-kinetic-text

Kinetic text component for Void Energy hosts and standalone consumers. Pretext-based layout with character-level reveal animations, 18 narrative effects, and physics-aware rendering.

> **Private package** — distributed via private npm registry. Not published to the public npm registry.

## Installation

```bash
npm install @dgrslabs/void-energy-kinetic-text
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
  import KineticText from '@dgrslabs/void-energy-kinetic-text/component';
  import { createVoidEnergyTextStyleSnapshot } from '@dgrslabs/void-energy-kinetic-text/adapters/void-energy-host';
  import '@dgrslabs/void-energy-kinetic-text/styles';

  let el = $state<HTMLElement>();
  const snapshot = $derived(el ? createVoidEnergyTextStyleSnapshot(el) : null);
</script>

<div bind:this={el}>
  {#if snapshot}
    <KineticText text="The void stirs..." styleSnapshot={snapshot} revealMode="char" revealStyle="fade" />
  {/if}
</div>
```

The adapter reads `data-physics` and `data-mode` from `<html>`, computed font/lineHeight from the target element, and forwards relevant CSS variables for physics-tuned animations.

### Non-VE hosts

Construct `TextStyleSnapshot` manually — no adapter needed:

```svelte
<script lang="ts">
  import KineticText from '@dgrslabs/void-energy-kinetic-text/component';
  import '@dgrslabs/void-energy-kinetic-text/styles';

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
import '@dgrslabs/void-energy-kinetic-text/styles';
```

This provides all reveal keyframes, effect animations, physics-variant easing, cursor blink, and reduced-motion overrides.

## Props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | — | **Required.** The text to render and reveal. |
| `styleSnapshot` | `TextStyleSnapshot` | — | **Required.** Font, lineHeight, physics, mode, and CSS variables. |
| `revealMode` | `RevealMode` | `'char'` | How text is revealed: `char`, `word`, `decode`. |
| `speedPreset` | `'fast' \| 'rapid' \| 'instant'` | `'fast'` | Named speed preset. `fast` = 40/8ms, `rapid` = 20/4ms, `instant` = 8/2ms. Overridden by explicit `speed`/`charSpeed`. |
| `revealStyle` | `RevealStyle` | `'instant'` | Visual style of the reveal animation: `instant`, `fade`, `rise`, `drop`, `scale`, `blur`. |
| `staggerPattern` | `StaggerPattern` | `'sequential'` | Timing pattern: `sequential`, `wave`, `cascade`, `random`. |
| `stagger` | `number` | `40` (char) / `30` (other) | Milliseconds between reveal units. |
| `revealDuration` | `number` | `300` | Duration of each unit's reveal animation (ms). |
| `activeEffect` | `KineticTextEffect \| null` | `null` | Continuous effect to apply. |
| `effectScope` | `EffectScope` | `'block'` | Scope for the active effect: `block`, `line`, `word`, `glyph`, `range`. |
| `cues` | `KineticCue[]` | `[]` | One-shot effect cues triggered during or after reveal. |
| `seed` | `number` | hash(text + mode) | Deterministic seed for PRNG (stagger, decode, random). |
| `reducedMotion` | `ReducedMotionMode` | `'auto'` | `auto` (OS preference), `always`, or `never`. |
| `cursor` | `boolean` | `false` | Show a blinking cursor during reveal. |
| `cursorChar` | `string` | `'▍'` | Character used for the cursor. |
| `cursorRemoveOnComplete` | `boolean` | `true` | Remove cursor after reveal completes. |
| `speed` | `number` | `200` (char) / `80` (word) | Base speed for grouped reveal modes (ms per group). |
| `charSpeed` | `number` | `8` | Inner character speed within word/sentence groups (ms). |
| `scramblePasses` | `number` | `4` | Number of scramble cycles per character in decode mode. |
| `onrevealcomplete` | `() => void` | — | Callback fired when all units are revealed. |
| `oneffectscomplete` | `() => void` | — | Callback fired when all one-shot effects finish. |
| `as` | `string` | `'span'` | HTML element tag for the root container. |
| `class` | `string` | `''` | Additional CSS classes for the root container. |

## Effects

### One-shot effects (6)

Triggered via `cues` — fire once at a specific time or on reveal completion.

| Effect | Description | Default scope |
|--------|-------------|---------------|
| `shake` | Horizontal jitter with decaying amplitude | `block` |
| `quake` | Heavy X+Y jitter | `block` |
| `jolt` | Sharp displacement + elastic snap-back | `block` |
| `glitch` | Choppy positional offset + skew | `block` |
| `surge` | Ascending power buildup with brightness flash | `block` |
| `warp` | Spatial distortion via scaleX oscillation | `block` |

### Continuous effects (12)

Applied via `activeEffect` prop — loop indefinitely while active.

| Effect | Description | Default scope |
|--------|-------------|---------------|
| `drift` | Gentle vertical sine wave | `block` |
| `flicker` | Irregular opacity stutters | `block` |
| `breathe` | Slow rhythmic scale pulse | `block` |
| `tremble` | Fast micro-shake | `block` |
| `pulse` | Heartbeat-tempo scale | `block` |
| `whisper` | Shrink + fade, fragile presence | `block` |
| `fade` | Slow consciousness dissolve | `block` |
| `freeze` | Cold stillness / paralysis | `block` |
| `burn` | Heat distortion / thermal haze | `block` |
| `static` | Persistent signal noise | `block` |
| `distort` | Woozy perception warp | `block` |
| `sway` | Lateral oscillation | `block` |

## Cue authoring

Cues trigger one-shot effects during or after the reveal timeline.

```typescript
import type { KineticCue } from '@dgrslabs/void-energy-kinetic-text/types';

const cues: KineticCue[] = [
  // Fire shake on a word range at 1.2s into reveal
  {
    id: 'word-3-shake',
    effect: 'shake',
    scope: 'range',
    trigger: 'at-time',
    atMs: 1200,
    range: { start: 15, end: 20 },
  },
  // Fire surge on entire block when reveal completes
  {
    id: 'end-surge',
    effect: 'surge',
    scope: 'block',
    trigger: 'on-complete',
  },
];
```

### Dispatch rules

- Time-triggered cues (`at-time`) fire when `elapsed >= atMs`
- Completion-triggered cues (`on-complete`) fire after all units are revealed
- Each cue fires at most once (tracked by `id`)
- Cues with out-of-range `range` targets are silently skipped (dev warning in non-production)

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
- Cursor blink is disabled
- Callbacks still fire normally

Set `reducedMotion: 'always'` to force this behavior, or `'never'` to bypass OS preference.

## Exports

| Export path | Contents |
|-------------|----------|
| `@dgrslabs/void-energy-kinetic-text` | `KineticText` component, `createVoidEnergyTextStyleSnapshot` adapter, all public types |
| `@dgrslabs/void-energy-kinetic-text/types` | Type-only exports |
| `@dgrslabs/void-energy-kinetic-text/adapters/void-energy-host` | `createVoidEnergyTextStyleSnapshot` function |
| `@dgrslabs/void-energy-kinetic-text/styles` | Compiled CSS stylesheet |

## License

UNLICENSED — proprietary. Private distribution only.
