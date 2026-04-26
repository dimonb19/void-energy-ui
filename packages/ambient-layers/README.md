# @void-energy/ambient-layers

Full-viewport ambient overlay system for Void Energy hosts and standalone consumers. Four composable layer categories — **Atmosphere**, **Psychology**, **Action**, **Environment** — with 39 effects across weather, mood, impact, and color grading. Physics-aware, reduced-motion-safe, and driven by a unified `variant` + `intensity` vocabulary.

> **Private package** — distributed via private npm registry. Not published to the public npm registry.

## Installation

```bash
npm install @void-energy/ambient-layers
```

### Peer dependencies

| Package | Version | Notes |
|---------|---------|-------|
| `svelte` | `^5.0.0` | Required. Consumers compile `.svelte` source as part of their build. |

No runtime dependencies. No host adapter required — layers read the global `<html data-physics data-mode>` contract via CSS only.

## Quick start

Two APIs ship side-by-side. The **singleton API** is the recommended path for apps — one global host renders every active layer, consumers imperatively `push` / `fire` from anywhere. The **raw components** remain exported for showcases and consumers that need direct control over decay, `onChange`, or per-instance props.

### Singleton API — recommended

Mount `<AmbientHost />` once in your app shell, then drive it from any component. Handle-stack semantics mean nested scopes compose cleanly (page pushes `rain`, modal opens and pushes `calm`, modal closes → `rain` returns).

```svelte
<!-- src/layouts/Layout.astro (or App.svelte root) -->
<script lang="ts">
  import { AmbientHost } from '@void-energy/ambient-layers';
  import '@void-energy/ambient-layers/styles';
</script>

<!-- renders at the end of your shell, alongside Modal / Toast -->
<AmbientHost />
```

```svelte
<!-- anywhere else -->
<script lang="ts">
  import { ambient } from '@void-energy/ambient-layers';

  // Persistent layer scoped to component lifecycle. The layer rises
  // smoothly on mount and fades smoothly on cleanup — no visual pop.
  $effect(() => {
    const h = ambient.push('atmosphere', 'rain', 'medium');
    return () => ambient.release(h);
  });

  // One-shot burst — self-clears when the animation ends.
  function onHit() {
    ambient.fire('impact', 'high');
  }
</script>
```

See [Singleton API](#singleton-api) for the full surface.

### Raw components — direct control

The four category components remain exported. Use them when you need decay callbacks, per-instance `durationMs`, or when the singleton's global model is wrong for your case (e.g. a showcase demonstrating auto-decay).

```svelte
<script lang="ts">
  import {
    AtmosphereLayer,
    PsychologyLayer,
    ActionLayer,
    EnvironmentLayer,
  } from '@void-energy/ambient-layers';
  import '@void-energy/ambient-layers/styles';

  let showImpact = $state(false);
</script>

<EnvironmentLayer variant="night" intensity="medium" />
<AtmosphereLayer variant="rain" intensity="high" />
<PsychologyLayer variant="tension" intensity="medium" />

{#if showImpact}
  <ActionLayer
    variant="impact"
    intensity="high"
    onEnd={() => (showImpact = false)}
  />
{/if}
```

### Non-VE hosts

No adapter, no snapshot, no initialization. The same import works standalone — layers degrade gracefully when host tokens are absent and use sensible built-in fallbacks for color and timing.

```svelte
<script lang="ts">
  import { AtmosphereLayer } from '@void-energy/ambient-layers';
  import '@void-energy/ambient-layers/styles';
</script>

<AtmosphereLayer variant="fog" />
```

## Styles

Import the stylesheet once in your entry point or layout:

```js
import '@void-energy/ambient-layers/styles';
```

This provides all layer positioning, particle keyframes, SVG-filter definitions, vignette blends, environment tints, physics-variant easing, and reduced-motion overrides.

## Four layer categories

Each category has a distinct lifetime model and a dedicated z-lane. They compose freely — a scene can run Environment + Atmosphere + Psychology simultaneously while Action fires one-shot beats on top.

| Category | Lifetime | Z-lane | Mental model |
|---|---|---|---|
| **Atmosphere** | Persistent + smooth rise + optional auto-decay | Behind content | Weather and physical sensory layers |
| **Psychology** | Persistent + smooth rise + optional auto-decay | Above content, below UI | Edge-framed emotional / mental states |
| **Action** | One-shot, auto-unmount | Top | Single discrete beat (hit, flash, burst) |
| **Environment** | Persistent + smooth rise (no auto-decay) | Top (mix-blend) | Baseline color grade — hour and place |

### Lifetime semantics

Every persistent layer follows a three-phase lifecycle: **rise → settled → (decay or fade)**.

- **Rise (mount):** Layers ramp from invisible up to the requested `intensity` over a per-variant `riseMs` (snappy for `rain` / `storm` / `danger`, slower for inertial effects like `fog` / `underwater` / `awe`). The full SCSS effect builds up smoothly — particles thicken, fog rolls in — driven by `--ambient-level` ramping `0 → target`. No pop-in.
- **Settled:** Layer holds at the target intensity. Storm lightning, breathing vignettes, and other internal animations only start once the rise completes, so the first lightning strike lands on established rain rather than during the build-up.
- **Decay (Atmosphere & Psychology only):** Auto-decay through the intensity ladder `high → medium → low → off`, one step per `durationMs` ms. Default `durationMs` is `0` (pinned — no decay) when used via the singleton; the per-variant default is used when used as a raw component without the singleton.
- **Fade (any category):** Explicit clear via `release(handle)` ramps the layer down to zero over `totalMs` (default 1000ms) and self-cleans. Aborts any in-flight rise or decay. This is what `release()` does by default — pass `release(handle, 0)` for an immediate hard-cut.
- **One-shot** (Action): plays once for `durationMs` (per-variant, per-intensity), then auto-unmounts. Intensity scales amplitude via `--ambient-level`.

Environment is "sticky" in the auto-decay sense — it doesn't decay on its own — but it now rises smoothly on mount and fades smoothly on clear, just like the other categories.

## Unified props

All four layer components accept the same props interface. Only the `variant` union differs per category.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | category-specific union | — | **Required.** Picks the concrete effect within the category. |
| `intensity` | `'low' \| 'medium' \| 'high'` | `'medium'` | Intensity level. Scales opacity, particle counts, or animation amplitude depending on category. |
| `durationMs` | `number` | per-variant or `0` | Persistent (Atmosphere / Psychology): time per decay step. `0` = pinned (no auto-decay). Action: total animation duration. Environment: ignored (env doesn't auto-decay). |
| `fadeMs` | `number` | — | When set, the layer falls from its current level to `0` over this many ms (flat-time) and unmounts via `onEnd`. Driven by `release(handle)` — consumers rarely set this directly. Aborts any in-flight rise or decay. |
| `enabled` | `boolean` | `true` | When `false`, the layer is not rendered. |
| `reducedMotion` | `'respect' \| 'ignore'` | `'respect'` | `'respect'` freezes animations and halves opacity when the OS prefers reduced motion. `'ignore'` plays regardless. |
| `onChange` | `(level: AmbientLevel) => void` | — | Fires on every intensity transition, including initial mount and final `'off'`. |
| `onEnd` | `() => void` | — | Fires when a persistent layer reaches `'off'` (auto-decay or explicit fade) or an Action layer finishes. |
| `class` | `string` | `''` | Extra CSS classes forwarded to the root layer element. |

`AmbientLevel = 'light' | 'medium' | 'heavy' | 'off'`

Per-variant tuning (rise duration, decay duration, particle counts) lives in [`src/core/effects/params.ts`](src/core/effects/params.ts) — the SSOT registry. Each Atmosphere / Psychology entry exposes `riseMs` (used at mount) and `durationMs` (used at decay) alongside `defaultIntensity`.

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

Transient one-shot beats. Auto-unmount when `durationMs` expires. Intensity modulates amplitude through `--ambient-level` (`1` low, `2` medium, `3` high).

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

## Singleton API

Imperative reactive store backed by Svelte 5 runes. One instance, one renderer (`<AmbientHost />`), global availability.

### Mount the host once

```svelte
<!-- in your app shell, rendered once — typically next to Modal and Toast -->
<AmbientHost />
```

`<AmbientHost />` reads the singleton's state and renders the 4 category blocks in deepest-to-top z-order (environment → atmosphere → psychology → action). Persistent layers render with `durationMs={0}` — the singleton's handle-stack owns lifecycle, not the layer's built-in auto-decay.

### Driving state

```ts
import { ambient } from '@void-energy/ambient-layers';

// Persistent layers — returns a handle. The layer rises smoothly on mount.
const h1 = ambient.push('environment', 'night');
const h2 = ambient.push('atmosphere', 'rain', 'medium');
const h3 = ambient.push('psychology', 'tension', 'high');

// Change variant / intensity in place — preserves the handle and the
// auto-decay state. Use this for "swap rain for storm" without affecting
// the layer's lifecycle.
ambient.update(h2, 'storm', 'high');

// Toggle the auto-decay lifecycle. decay() = start decaying with the
// variant default; decay(h, ms) = custom decay duration; decay(h, 0) = pin.
// Works for atmosphere, psychology, AND environment (env has no built-in
// decay, but you can drive one via decay(h, ms)).
ambient.decay(h2);                 // start auto-decay
ambient.decay(h2, 8000);           // custom decay step
ambient.decay(h2, 0);              // pin at intensity

// Remove a layer with a smooth fade (default 1000ms). Self-cleans via onEnd.
ambient.release(h1);
ambient.release(h2, 600);          // custom fade duration
ambient.release(h3, 0);            // immediate hard-cut (no fade)

// One-shot burst — no handle, auto-clears when the animation finishes.
ambient.fire('impact', 'high');

// Escape hatch — hard-cuts every entry in the category. No fade.
ambient.clear('atmosphere');       // clear one category
ambient.clear();                   // clear everything
```

### Surface

| Member | Signature | Notes |
|---|---|---|
| `push` | `(category, variant, intensity?, decay?) → number` | Returns a numeric handle. Overloaded per category so `variant` narrows to the right union. The `decay` flag (atmosphere / psychology only) opts in to auto-decay at mount; defaults to pinned. |
| `update` | `(handle, variant, intensity?) → boolean` | Mutates variant / intensity in place. Preserves `durationMs` — use `decay()` for lifecycle changes. Returns `false` if the handle is stale. |
| `decay` | `(handle, durationMs?) → boolean` | Flips the entry's auto-decay state. `decay(h)` = decay using variant default; `decay(h, ms)` = custom; `decay(h, 0)` = pin. Works for env too. |
| `release` | `(handle, totalMs?) → boolean` | Removes a persistent entry by handle. Fades the layer out smoothly (default 1000ms) and self-cleans. Pass `totalMs: 0` for immediate hard-remove. Idempotent. |
| `fire` | `(variant, intensity?) → void` | One-shot action. Returns nothing — singleton owns the lifecycle. |
| `clear` | `(category?) → void` | **Hard-cut.** Omit for all. Accepts `'atmosphere'`, `'psychology'`, `'environment'`, `'action'`, or `'all'`. Use `release()` instead if you want layers to fade. |
| `atmosphere`, `psychology`, `environment`, `actions` | readable `$state.raw` arrays | Reactive snapshots, primarily for debug / UI introspection. |

Entry shapes are typed via `AtmosphereEntry`, `PsychologyEntry`, `EnvironmentEntry`, `ActionEntry`.

### Scoped lifecycle with `$effect`

The intended pattern: push on mount, release on cleanup. The cleanup runs in untrack mode, so the release cannot loop the effect.

```ts
$effect(() => {
  const h = ambient.push('atmosphere', 'rain', 'medium');
  return () => ambient.release(h);
});
```

Nested scopes compose naturally: each scope pushes its own handle and releases on unmount. There is no single "active" variant per category — the arrays are multi-stack.

### Multi-stack semantics

Each persistent category is a stack. Pushing twice pushes two entries, both of which render. This is intentional — it lets a modal overlay its own mood on top of the page's baseline without fighting for a single slot.

If you want single-slot-per-category behavior (one and only one atmosphere at a time), track your handle and `update` instead of pushing a second time:

```ts
let handle: number | null = null;

function setAtmosphere(variant: AtmosphereLayerId, intensity: AmbientIntensity) {
  if (handle === null) handle = ambient.push('atmosphere', variant, intensity);
  else ambient.update(handle, variant, intensity);
}
```

### Singleton vs raw components

| | Singleton (`ambient` + `<AmbientHost />`) | Raw (`<AtmosphereLayer />` etc.) |
|---|---|---|
| Mount site | Once, in app shell | Anywhere the effect should render |
| Lifecycle | Handle-stack, `release()` (fades by default) | Component mount/unmount (no fade) |
| Rise on mount | Smooth ramp via `riseMs` | Same — built into the layer |
| Decay | Off by default; opt in via `push(..., decay: true)` or `decay(handle)` | On by default; set `durationMs={0}` to pin |
| `onChange` / `onEnd` callbacks | Not exposed | Available |
| Style import | Once, in app shell | Once per app (deduped) |
| Best for | Apps, pages, modals, feature screens | Showcases, component-level demos, consumers that need decay callbacks |

## Composition recipes

Ambient Layers has **no director or manager** — composition is consumer-owned. Mount the layers you want as siblings and drive their props from your own state. Swapping one layer does not affect the others.

### Stormy night scene

```svelte
<EnvironmentLayer variant="night" />
<AtmosphereLayer variant="storm" intensity="high" durationMs={0} />
<PsychologyLayer variant="tension" intensity="medium" />
```

### One-shot impact on a calm scene

```svelte
<script lang="ts">
  let impactKey = $state(0);
</script>

<EnvironmentLayer variant="dawn" />
<AtmosphereLayer variant="fog" intensity="low" />

{#key impactKey}
  <ActionLayer variant="impact" intensity="high" />
{/key}

<button onclick={() => impactKey++}>Fire impact</button>
```

Incrementing `impactKey` remounts the Action layer, firing the one-shot again. Action layers auto-unmount when their animation completes.

### Driving decay callbacks

```svelte
<PsychologyLayer
  variant="danger"
  intensity="high"
  onChange={(level) => console.log('danger →', level)}
  onEnd={() => console.log('danger cleared')}
/>
```

`onChange` fires on every step (`high → medium → low → off`); `onEnd` fires once when the layer reaches `off`.

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

- `--ambient-level` — continuous float in `[0, 3]`, ramps during rise / decay / fade. Use this for **opacity / alpha / envelope** properties that should follow the visual lifecycle. The keyframes for amplitude and opacity read it.
- `--ambient-alpha` — derived scalar `calc(var(--ambient-level) / 3)`. Convenience for opacity multipliers.
- `--ambient-target-num` — locked numeric mirror of `intensity` (`1` / `2` / `3`). Stays static for the layer's lifetime — does not move during rise / decay / fade. Use this for **structural / geometric** properties that should snap-set per intensity, such as bubble tile size in underwater. Mixing this with structural calcs prevents geometry from morphing during the rise envelope (which would otherwise read as the effect speeding up or slowing down).
- `--ambient-duration` — Action layers only, the total animation duration in ms.
- `--ambient-env-level` — Environment layers only, the `0..1` tint strength scalar (also follows the rise / fade envelope).

**Rule of thumb:** opacity and alpha → `--ambient-level` (or `--ambient-alpha`). Geometry, density, blur radius, structural offsets → `--ambient-target-num`.

All layers are `aria-hidden` and never trap pointer events — they do not affect DOM semantics or interactivity.

## Exports

| Export path | Contents |
|---|---|
| `@void-energy/ambient-layers` | `AmbientHost`, `ambient` (singleton) + 4 raw layer components + public types |
| `@void-energy/ambient-layers/atmosphere` | `AtmosphereLayer` Svelte component only |
| `@void-energy/ambient-layers/psychology` | `PsychologyLayer` Svelte component only |
| `@void-energy/ambient-layers/action` | `ActionLayer` Svelte component only |
| `@void-energy/ambient-layers/environment` | `EnvironmentLayer` Svelte component only |
| `@void-energy/ambient-layers/types` | Type-only exports (`AmbientLevel`, `AtmosphereLayer`, etc.) |
| `@void-energy/ambient-layers/styles` | Compiled CSS stylesheet |

**From the top-level export, also available:**

- `ambient` — singleton instance
- `Ambient` — singleton class (for `instanceof` checks / testing)
- `AmbientHost` — the renderer component
- Entry type exports: `AtmosphereEntry`, `PsychologyEntry`, `EnvironmentEntry`, `ActionEntry`, `PersistentCategory`

## Build

```
npm --workspace @void-energy/ambient-layers run build
```

## License

UNLICENSED — proprietary. Private distribution only.
