# @dgrslabs/void-energy-ambient-layers

Premium full-viewport ambient overlay layers for Void Energy hosts.

Four category components, each driven by a `variant` prop that selects the
concrete effect within its category. Every layer is a `pointer-events: none`
fixed full-viewport overlay that adapts to the active physics preset
(glass / flat / retro) and color mode (light / dark) via the host's
`<html data-physics data-mode>` runtime contract.

## Categories

| Category | Lifetime | Z-lane | Mental model |
|---|---|---|---|
| **Atmosphere** | Persistent + decay | Behind content | Weather and physical sensory layers |
| **Psychology** | Persistent + decay | Above content, below UI | Edge-framed mental/emotional states |
| **Action** | One-shot, auto-unmount | Top | Single discrete beat (hit, flash, burst) |
| **Environment** | Sticky | Top (mix-blend) | Baseline color grade — hour and place |

## Usage

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

## Unified props

Every category accepts the same shape:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | category-specific union | required | Picks the concrete effect |
| `intensity` | `'light' \| 'medium' \| 'heavy'` | `'medium'` | Same vocabulary across all four categories |
| `durationMs` | `number` | per-effect default | Persistent: time per decay step. Action: total animation. Environment: ignored. |
| `enabled` | `boolean` | `true` | When false, the layer is not rendered |
| `reducedMotion` | `'respect' \| 'ignore'` | `'respect'` | Freeze + halve opacity when user prefers reduced motion |
| `onChange` | `(level) => void` | — | Fires on every intensity transition (including initial and `'off'`) |
| `onEnd` | `() => void` | — | Fires once when the layer reaches `'off'` (persistent) or completes (action). Environment never fires. |
| `class` | `string` | `''` | Forwarded to the root layer element |

Per-effect tuning lives in [`src/core/effects/params.ts`](src/core/effects/params.ts) — the SSOT registry.

## Effect catalog

### Atmosphere

| Variant | Visual |
|---|---|
| `rain` | Vertical particle field, three depth bands |
| `snow` | Soft radial flakes, sway + slow rotation |
| `ash` | Torn-paper flakes tumbling down, ~10% embers |
| `fog` | Volumetric: vertical gradient + two turbulence-masked banks |
| `underwater` | Soft displacement + info tint + drifting caustics |
| `heat` | Real SVG displacement melt + warm wash |
| `storm` | Rain particles (denser/faster) + lightning flashes + horizontal wind drift |
| `wind` | Horizontal dust/leaf streaks, no precipitation |

### Psychology

| Variant | Visual | Tone |
|---|---|---|
| `danger` | Crimson heartbeat vignette | Negative — threat |
| `tension` | Staccato micro-tremors, constricting vignette | Negative — pressure |
| `dizzy` | Two off-center dark lobes in counter-orbits | Disorientation |
| `focus` | Living tunnel vision that breathes and tightens | Concentration |
| `filmGrain` | Heavy sepia wash + frame-drop flickers | Memory, vintage |
| `haze` | Multi-bloom drift, wide hue rotation | Soft layered glow |
| `calm` | Cool vignette, slow breathing pulse | Positive — relief |
| `serenity` | Pale outer glow, near-imperceptible drift | Positive — peace |
| `success` | Warm green vignette with one outward bloom | Positive — achievement |
| `awe` | Pale gold/white radial brightening from center | Positive — wonder |
| `melancholy` | Desaturated cool vignette, slow downward drift | Negative — grief |

### Action

| Variant | Visual |
|---|---|
| `impact` | Radial shockwave ring expanding from center |
| `speed` | Three-layer parallax sweep with radial edge mask |
| `glitch` | RGB chromatic aberration on underlying content |
| `flash` | Full-screen bright pulse |
| `reveal` | Radial expand wipe from center |
| `dissolve` | Soft fade-to-transparent over a gentle blur |
| `shake` | Damped translate random walk on the layer root |
| `zoomBurst` | Brief radial scale + outward motion blur from center |

### Environment

| Variant | Tint |
|---|---|
| `night` | Cool deep-blue wash |
| `neon` | Cyan/magenta cyberpunk cast |
| `dawn` | Sunrise: cool sky above, warm peach horizon, slow bloom |
| `dusk` | Deep orange to violet vertical gradient |
| `sickly` | Green/yellow radial with vignette darkening |
| `toxic` | Saturated irradiated green, even chemical cast |
| `underground` | Dark cool-grey radial with heavy edge darkening |
| `candlelit` | Warm radial spotlight, strong edge falloff |
| `overcast` | Flat grey-blue desaturated wash, slight green tint |

## Stacking notes

Categories are designed to compose freely. Atmosphere + Psychology + Environment
can all be active simultaneously, with Action firing one-shot beats on top.

Atmosphere and Environment overlap in role for "stormy weather" — `overcast`
sets the *tone* without committing to precipitation, while `storm` is the
dramatic option. They can be stacked but are not designed for it; pick one.

## Build

```
npm --workspace @dgrslabs/void-energy-ambient-layers run build
```
