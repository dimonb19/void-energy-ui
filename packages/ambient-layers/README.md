# @dgrslabs/void-energy-ambient-layers

Full-viewport ambient overlay system for Void Energy hosts and standalone consumers. Four composable layer categories — **Atmosphere**, **Psychology**, **Action**, **Environment** — with 39 effects across weather, mood, impact, and color grading. Physics-aware, reduced-motion-safe, and driven by a unified `variant` + `intensity` vocabulary.

> **Private package** — distributed via private npm registry. Not published to the public npm registry.

## Installation

```bash
npm install @dgrslabs/void-energy-ambient-layers
```

### Peer dependencies

| Package | Version | Notes |
|---------|---------|-------|
| `svelte` | `^5.0.0` | Required. Consumers compile `.svelte` source as part of their build. |

No runtime dependencies. No host adapter required — layers read the global `<html data-physics data-mode>` contract via CSS only.

## Quick start

### Void Energy hosts

```svelte
<script lang="ts">
  import {
    AtmosphereLayer,
    PsychologyLayer,
    ActionLayer,
    EnvironmentLayer,
  } from '@dgrslabs/void-energy-ambient-layers';
  import '@dgrslabs/void-energy-ambient-layers/styles';

  let showImpact = $state(false);
</script>

<EnvironmentLayer variant="night" intensity="medium" />
<AtmosphereLayer variant="rain" intensity="heavy" />
<PsychologyLayer variant="tension" intensity="medium" />

{#if showImpact}
  <ActionLayer
    variant="impact"
    intensity="heavy"
    onEnd={() => (showImpact = false)}
  />
{/if}
```

### Non-VE hosts

No adapter, no snapshot, no initialization. The same import works standalone — layers degrade gracefully when host tokens are absent and use sensible built-in fallbacks for color and timing.

```svelte
<script lang="ts">
  import { AtmosphereLayer } from '@dgrslabs/void-energy-ambient-layers';
  import '@dgrslabs/void-energy-ambient-layers/styles';
</script>

<AtmosphereLayer variant="fog" />
```

## Styles

Import the stylesheet once in your entry point or layout:

```js
import '@dgrslabs/void-energy-ambient-layers/styles';
```

This provides all layer positioning, particle keyframes, SVG-filter definitions, vignette blends, environment tints, physics-variant easing, and reduced-motion overrides.

## Four layer categories

Each category has a distinct lifetime model and a dedicated z-lane. They compose freely — a scene can run Environment + Atmosphere + Psychology simultaneously while Action fires one-shot beats on top.

| Category | Lifetime | Z-lane | Mental model |
|---|---|---|---|
| **Atmosphere** | Persistent + auto-decay | Behind content | Weather and physical sensory layers |
| **Psychology** | Persistent + auto-decay | Above content, below UI | Edge-framed emotional / mental states |
| **Action** | One-shot, auto-unmount | Top | Single discrete beat (hit, flash, burst) |
| **Environment** | Sticky (no decay) | Top (mix-blend) | Baseline color grade — hour and place |

### Lifetime semantics

- **Persistent + decay** (Atmosphere, Psychology): mounts at the given `intensity`, then steps down `heavy → medium → light → off` every `durationMs` ms. Set `durationMs={0}` to disable decay and stay sticky at the starting intensity.
- **One-shot** (Action): plays once for `durationMs` (per-variant, per-intensity), then auto-unmounts. Intensity scales amplitude via the `--ambient-level` CSS variable.
- **Sticky** (Environment): no decay, no animation lifecycle. Tint persists until the prop is changed or the component unmounts.

## Unified props

All four layer components accept the same props interface. Only the `variant` union differs per category.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | category-specific union | — | **Required.** Picks the concrete effect within the category. |
| `intensity` | `'light' \| 'medium' \| 'heavy'` | `'medium'` | Intensity level. Scales opacity, particle counts, or animation amplitude depending on category. |
| `durationMs` | `number` | per-variant | Persistent: time per decay step. Action: total animation duration. Environment: ignored. Set to `0` on persistent layers to disable decay. |
| `enabled` | `boolean` | `true` | When `false`, the layer is not rendered. |
| `reducedMotion` | `'respect' \| 'ignore'` | `'respect'` | `'respect'` freezes animations and halves opacity when the OS prefers reduced motion. `'ignore'` plays regardless. |
| `onChange` | `(level: AmbientLevel) => void` | — | Fires on every intensity transition, including initial mount and final `'off'`. |
| `onEnd` | `() => void` | — | Fires when a persistent layer reaches `'off'` or an Action layer finishes. Environment never fires. |
| `class` | `string` | `''` | Extra CSS classes forwarded to the root layer element. |

`AmbientLevel = 'light' | 'medium' | 'heavy' | 'off'`

Per-variant tuning (default duration, particle counts, intensity ladders) lives in [`src/core/effects/params.ts`](src/core/effects/params.ts) — the SSOT registry.

## Effects

### Atmosphere (10)

Weather and physical sensory overlays. Persistent with auto-decay. Particle fields use three parallax depth bands; SVG-filter variants use real displacement.

| Variant | Description | Use Case |
|---|---|---|
| `rain` | Vertical particle field with three depth bands | Storms, noir scenes, melancholy |
| `snow` | Soft radial flakes with sway and slow rotation | Winter, cold environments, quiet |
| `ash` | Torn-paper flakes tumbling down, ~10% glowing embers | Post-apocalypse, aftermath, burning world |
| `storm` | Dense rain + lightning flashes + horizontal wind drift | Peak weather drama, chaos beats |
| `wind` | Horizontal dust / leaf streaks without precipitation | Desert, plains, rising tension |
| `fog` | Volumetric turbulence: vertical gradient + two masked banks | Mystery, liminal spaces, dream logic |
| `underwater` | Soft SVG displacement + cool tint + drifting caustics | Submerged scenes, dreaming, drowning |
| `heat` | Real SVG displacement melt + warm wash | Desert, fire aftermath, fever |
| `spores` | Tiny motes drifting in Brownian motion, rise + wobble | Alien forest, fungal environment, biological hazard |
| `fireflies` | Hovering point emitters with discrete pulse pattern | Enchanted forest, summer night, wonder |

### Psychology (12)

Edge-framed emotional and mental states. Persistent with auto-decay. Rendered as vignettes, bloom lobes, or SVG filter washes.

| Variant | Description | Tone |
|---|---|---|
| `danger` | Crimson heartbeat vignette pulsing from the edges | Threat, alarm |
| `tension` | Staccato micro-tremors with constricting vignette | Pressure, anticipation |
| `dizzy` | Two off-center dark lobes in counter-orbits | Disorientation, vertigo |
| `focus` | Living tunnel vision that breathes and tightens | Concentration, lock-on |
| `filmGrain` | Heavy sepia wash + frame-drop flickers | Memory, vintage, unreliable narrator |
| `haze` | Multi-bloom drift with wide hue rotation | Soft layered glow, daze |
| `calm` | Cool vignette with slow breathing pulse | Relief, recovery |
| `serenity` | Pale outer glow, near-imperceptible drift | Peace, stillness |
| `success` | Warm green vignette with one outward bloom | Achievement, confirmation |
| `fail` | Red edge flash, sharp attack, quick decay | Rejection, failure beat |
| `awe` | Pale gold / white radial brightening from center | Wonder, revelation |
| `melancholy` | Desaturated cool vignette with slow downward drift | Grief, loss |

### Action (8)

Transient one-shot beats. Auto-unmount when `durationMs` expires. Intensity modulates amplitude through `--ambient-level` (`1` light, `2` medium, `3` heavy).

| Variant | Description | Use Case |
|---|---|---|
| `impact` | Radial shockwave ring expanding from center | Hits, landings, collisions |
| `speed` | Three-layer parallax sweep with radial edge mask | Dashes, launches, acceleration |
| `glitch` | RGB chromatic aberration on underlying content | Corruption, reality break |
| `flash` | Full-screen bright pulse | Lightning, camera flash, revelation |
| `reveal` | Radial expand wipe from center outward | Scene entry, unveiling, scan reveal |
| `dissolve` | Soft fade-to-transparent over a gentle blur | Scene exit, memory fade |
| `shake` | Damped translate random walk on the layer root | Earthquake, heavy impact |
| `zoomBurst` | Brief radial scale with outward motion blur | Punch-in, focus strike, boss spawn |

### Environment (9)

Sticky baseline color grades. No decay, no animation (or very slow drift). Use to set hour-of-day and place without committing to weather.

| Variant | Description |
|---|---|
| `dawn` | Sunrise — cool sky above, warm peach horizon, slow bloom |
| `dusk` | Deep orange to violet vertical gradient |
| `candlelit` | Warm radial spotlight with strong edge falloff |
| `night` | Cool deep-blue wash |
| `neon` | Cyan / magenta cyberpunk cast |
| `overcast` | Flat grey-blue desaturated wash with slight green tint |
| `sickly` | Green / yellow radial with vignette darkening |
| `toxic` | Saturated irradiated green, even chemical cast |
| `underground` | Dark cool-grey radial with heavy edge darkening |

## Composition recipes

Ambient Layers has **no director or manager** — composition is consumer-owned. Mount the layers you want as siblings and drive their props from your own state. Swapping one layer does not affect the others.

### Stormy night scene

```svelte
<EnvironmentLayer variant="night" />
<AtmosphereLayer variant="storm" intensity="heavy" durationMs={0} />
<PsychologyLayer variant="tension" intensity="medium" />
```

### One-shot impact on a calm scene

```svelte
<script lang="ts">
  let impactKey = $state(0);
</script>

<EnvironmentLayer variant="dawn" />
<AtmosphereLayer variant="fog" intensity="light" />

{#key impactKey}
  <ActionLayer variant="impact" intensity="heavy" />
{/key}

<button onclick={() => impactKey++}>Fire impact</button>
```

Incrementing `impactKey` remounts the Action layer, firing the one-shot again. Action layers auto-unmount when their animation completes.

### Driving decay callbacks

```svelte
<PsychologyLayer
  variant="danger"
  intensity="heavy"
  onChange={(level) => console.log('danger →', level)}
  onEnd={() => console.log('danger cleared')}
/>
```

`onChange` fires on every step (`heavy → medium → light → off`); `onEnd` fires once when the layer reaches `off`.

### Disabling auto-decay

```svelte
<!-- Persistent rain that never decays until the consumer unmounts it -->
<AtmosphereLayer variant="rain" intensity="medium" durationMs={0} />
```

## Stacking notes

Categories are designed to compose. Atmosphere + Psychology + Environment can all be active simultaneously, with Action firing one-shot beats on top.

Atmosphere and Environment overlap in role for "stormy weather" — `overcast` sets the *tone* without committing to precipitation, while `storm` is the dramatic option. They can be stacked but are not designed for it; pick one.

Running multiple layers of the same category (two Atmosphere layers, two Psychology layers) is supported but not recommended — the unified vignette / particle budget is tuned for one layer per category at a time.

## Physics behavior

Layers read the host's `<html data-physics>` attribute in SCSS and adapt timing accordingly:

| Physics | Timing |
|---------|--------|
| `glass` | Smooth cubic-bezier easing, soft particle blur, filter glow |
| `flat` | Standard `ease-out`, crisp edges |
| `retro` | `steps(12, end)` stepped timing on all layer animations — keyframed CRT feel |

Particle-field variants (`rain`, `snow`, `ash`, `wind`, `storm`) also use depth-band softening: near band sharp, mid band light blur, far band heavier blur for parallax depth-of-field.

## Reduced motion

When `reducedMotion` is `'respect'` (default), the component honors `prefers-reduced-motion: reduce`. When active:

- All layer animations are paused (`animation-play-state: paused`)
- Layer opacity is halved to reduce visual weight
- SVG filter `<animate>` tags are suspended
- Environment tints remain visible as static color grades
- Action layers still unmount after `durationMs` even though they don't animate

Set `reducedMotion: 'ignore'` to bypass OS preference when the layer is essential to the content.

## DOM architecture

Every layer renders a single root element — fixed, full-viewport, `pointer-events: none`, `aria-hidden="true"` — with class naming driven by category and variant.

```
.ambient-layer .ambient-[category] .ambient-[variant]
  [data-variant="..."]
  [data-reduced-motion="respect" | "ignore"]
  [style="--ambient-level: 1|2|3; --ambient-duration: ...ms"]
├── particle fields (atmosphere)
│   └── .ambient-atmosphere__particle[data-band][data-kind][data-ember]
├── SVG filter variants
│   ├── .ambient-atmosphere__wash
│   └── .ambient-atmosphere__svg  (inline <filter> + <rect filter="url(#...)" />)
├── psychology vignettes
│   ├── .ambient-psychology__vignette
│   └── .ambient-psychology__vignette--b  (variants with dual lobes)
├── action content
│   └── .ambient-[variant]__ring | __svg  (variant-specific)
└── environment tint
    └── (no children — background rendered via SCSS)
```

Category class → z-lane:

| Class | z-index |
|---|---|
| `.ambient-atmosphere` | `5` (behind content) |
| `.ambient-psychology` | `11` (above content) |
| `.ambient-action` | `12` (above psychology) |
| `.ambient-environment` | `100` (top, mix-blend) |

CSS custom properties set on the root:

- `--ambient-level` — `1` / `2` / `3`, read by keyframes for amplitude and opacity
- `--ambient-alpha` — derived scalar `calc(var(--ambient-level) / 3)`
- `--ambient-duration` — Action layers only, the total animation duration in ms
- `--ambient-env-level` — Environment layers only, the `0..1` tint strength scalar

All layers are `aria-hidden` and never trap pointer events — they do not affect DOM semantics or interactivity.

## Exports

| Export path | Contents |
|---|---|
| `@dgrslabs/void-energy-ambient-layers` | All four layer components + public types |
| `@dgrslabs/void-energy-ambient-layers/atmosphere` | `AtmosphereLayer` Svelte component only |
| `@dgrslabs/void-energy-ambient-layers/psychology` | `PsychologyLayer` Svelte component only |
| `@dgrslabs/void-energy-ambient-layers/action` | `ActionLayer` Svelte component only |
| `@dgrslabs/void-energy-ambient-layers/environment` | `EnvironmentLayer` Svelte component only |
| `@dgrslabs/void-energy-ambient-layers/types` | Type-only exports (`AmbientLevel`, `AtmosphereLayer`, etc.) |
| `@dgrslabs/void-energy-ambient-layers/styles` | Compiled CSS stylesheet |

## Build

```
npm --workspace @dgrslabs/void-energy-ambient-layers run build
```

## License

UNLICENSED — proprietary. Private distribution only.
