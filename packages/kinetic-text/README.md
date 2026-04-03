# @dgrslabs/void-energy-kinetic-text

Character-level kinetic typography for Void Energy hosts and standalone consumers. Pretext-based layout with per-character reveal animations, 37 narrative effects (16 one-shot + 21 continuous), and physics-aware rendering.

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
    <KineticText text="The void stirs..." styleSnapshot={snapshot} revealMode="char" revealStyle="pop" />
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
import type { KineticCue } from '@dgrslabs/void-energy-kinetic-text/types';

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
  import { KineticSkeleton } from '@dgrslabs/void-energy-kinetic-text';
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

## Exports

| Export path | Contents |
|-------------|----------|
| `@dgrslabs/void-energy-kinetic-text` | `KineticText`, `KineticSkeleton` components, `createVoidEnergyTextStyleSnapshot` adapter, all public types |
| `@dgrslabs/void-energy-kinetic-text/component` | `KineticText` Svelte component only |
| `@dgrslabs/void-energy-kinetic-text/skeleton` | `KineticSkeleton` Svelte component only |
| `@dgrslabs/void-energy-kinetic-text/types` | Type-only exports |
| `@dgrslabs/void-energy-kinetic-text/adapters/void-energy-host` | `createVoidEnergyTextStyleSnapshot` function |
| `@dgrslabs/void-energy-kinetic-text/styles` | Compiled CSS stylesheet |

## License

UNLICENSED — proprietary. Private distribution only.
