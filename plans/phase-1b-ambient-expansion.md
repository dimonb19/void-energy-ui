# Phase 1b — Ambient Layers Expansion

> Expand `@dgrslabs/void-energy-ambient-layers` from 4 layers to a full catalog across 4 categories. Mirror the structural patterns established by `@dgrslabs/void-energy-kinetic-text`. No physics branching.

**Status:** Planning
**Depends on:** Phase 1 ambient-layers package scaffold (done)
**Pattern source:** `packages/kinetic-text/`

---

## Guiding principle

Structurally identical to kinetic-text. Every deviation must be justified. Where kinetic-text has `KineticTextEffect`, ambient has `AmbientLayerId`. Where kinetic-text splits `one-shot.ts` / `continuous.ts`, ambient splits `action.ts` / `persistent.ts`. No new architectural ideas — copy the shape.

---

## Categories (flat union, kinetic-text style)

```ts
// types.ts — single SSOT
export type AmbientCategory = 'atmosphere' | 'psychology' | 'action' | 'environment';

export type AtmosphereLayer  = 'rain' | 'snow' | 'ash' | 'fog' | 'underwater' | 'heat';
export type PsychologyLayer  = 'danger' | 'tension' | 'dizzy' | 'focus' | 'flashback' | 'dreaming';
export type ActionLayer      = 'impact' | 'speed' | 'glitch' | 'flash' | 'reveal';
export type EnvironmentLayer = 'night' | 'indoor_warm' | 'neon';

export type AmbientLayerId =
  | AtmosphereLayer
  | PsychologyLayer
  | ActionLayer
  | EnvironmentLayer;
```

### Category behavior

| Category | Z-slot | Lifetime | Intensity API |
|---|---|---|---|
| **environment** | deepest, baseline | sticky, rarely changes | single (no level) |
| **atmosphere** | behind content | persistent, auto-decay over seconds | `1 \| 2 \| 3` |
| **psychology** | screen edges, above content | persistent, auto-decay over seconds | `1 \| 2 \| 3` |
| **action** | top, one-shot | transient, auto-clear after animation | variant: `'light' \| 'medium' \| 'heavy'` |

**Decisions resolved:**
- Blood → dropped. `DangerLayer` (psychology) replaces it. Existing Blood SCSS becomes `_danger.scss` block.
- Fog stays in atmosphere.
- Action variants = animation intensity (speed/distance scaling via `--ambient-action-level`), not distinct keyframes.
- Decay units = seconds (`decayMs` prop per layer, default per-layer in `params.ts`).

---

## File layout (mirror kinetic-text, flat)

```
packages/ambient-layers/src/
├── svelte/
│   ├── AtmosphereLayer.svelte     # one component, variant prop switches which effect
│   ├── PsychologyLayer.svelte
│   ├── ActionLayer.svelte
│   └── EnvironmentLayer.svelte
├── core/
│   ├── effects/
│   │   ├── persistent.ts          # atmosphere + psychology: decay scheduler
│   │   ├── action.ts              # one-shot: fire-and-forget, cooldown
│   │   ├── environment.ts         # sticky baseline
│   │   ├── params.ts              # layer → { decayMs, defaultIntensity, ... }
│   │   └── index.ts
│   └── runtime/
│       └── decay.ts               # shared setTimeout-based level stepper
├── adapters/
│   └── void-energy-host.ts        # DOM snapshot (tokens, mode) — kinetic-text pattern
├── styles/
│   └── ambient-layers.scss        # SINGLE file, all layer styles
├── types.ts                       # SSOT — all unions, all prop interfaces
└── index.ts                       # barrel
```

**Deleted from current package:** per-layer Svelte files (`BloodLayer.svelte`, `SnowLayer.svelte`, `RainLayer.svelte`, `FogLayer.svelte`). They collapse into 4 category components, each taking a `variant` prop that selects the layer within its category. This matches kinetic-text where one `KineticText.svelte` handles all 30+ effects via an `effect` prop.

---

## Component API (4 components, variant-driven)

```svelte
<AtmosphereLayer  variant="rain"    intensity={3} decayMs={8000} />
<PsychologyLayer  variant="danger"  intensity={2} />
<ActionLayer      variant="impact"  level="heavy" />  <!-- auto-unmounts after animation -->
<EnvironmentLayer variant="night" />
```

### Shared props

```ts
interface AmbientBaseProps {
  enabled?: boolean;          // default true
  reducedMotion?: 'respect' | 'ignore';  // default 'respect'
  class?: string;
}
```

### Category-specific props

```ts
interface PersistentProps extends AmbientBaseProps {
  intensity?: 1 | 2 | 3;      // default 2
  decayMs?: number;           // time at each level before stepping down; 0 = no decay
}

interface ActionProps extends AmbientBaseProps {
  level?: 'light' | 'medium' | 'heavy';  // default 'medium'
  onComplete?: () => void;
}
```

No coordinator store. No `ambient.show()` API. Consumers mount components imperatively (`{#if active}<AtmosphereLayer ... />{/if}`) exactly like kinetic-text cues. This matches the user's answered question — kinetic-text has no store, ambient shouldn't either.

---

## Decay model (`core/runtime/decay.ts`)

Tiny helper — ~30 lines. Persistent layers internally track a `$state` intensity level and step it down via `setTimeout(decayMs)` until 0, at which point the component signals `onComplete`. Parent owns the mount/unmount. No global scheduler, no `decayTick()` method.

```ts
// pseudocode
export function createDecay(initial: 1|2|3, ms: number, onStep: (n: 0|1|2|3) => void) {
  let level = $state(initial);
  let timer: number;
  $effect(() => { if (ms > 0 && level > 0) timer = setTimeout(() => level--, ms); });
  $effect(() => onStep(level));
  return { get level() { return level; } };
}
```

---

## Action cooldowns

Dropped as an internal concern. If the consumer fires two `<ActionLayer variant="impact" />` in rapid succession, that's the consumer's problem — same as firing two kinetic-text `shake` cues back to back. Kinetic-text doesn't enforce cooldowns; ambient shouldn't either. **Remove `cooldowns.ts` from the original proposal.**

---

## Token additions (core `src/config/design-tokens.ts`)

```ts
ambient: {
  zIndex: {
    environment: number;   // deepest
    atmosphere: number;
    // (content lives here)
    psychology: number;
    action: number;        // top
  },
  atmosphere: {
    rain: { streak, tint },
    snow: { flake, tint },
    ash:  { particle, tint },
    fog:  { base, edge },
    underwater: { tint, caustic },
    heat: { tint, shimmer },
  },
  psychology: {
    danger:    { edge, pulse },
    tension:   { edge, pulse },
    dizzy:     { blur, rotate },
    focus:     { vignette },
    flashback: { tint, grain },
    dreaming:  { glow, drift },
  },
  action: {
    impact: { color, duration },
    speed:  { streak, duration },
    glitch: { tint, duration },
    flash:  { color, duration },
    reveal: { color, duration },
  },
  environment: {
    night:       { tint, grade },
    indoor_warm: { tint, grade },
    neon:        { tint, grade },
  },
}
```

Run `npm run build:tokens` after adding. Export `ambient` namespace through `void-energy/tokens`.

---

## SCSS structure

Single `styles/ambient-layers.scss`, organized by category with section comments:

```scss
@use 'void-energy/styles/abstracts' as *;

/* ============ base ============ */
.ambient-layer {
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: var(--ambient-z);
}

/* Retro: stepped timing — single global rule, no per-layer branches */
html[data-physics='retro'] .ambient-layer { animation-timing-function: steps(6, end); }

/* ============ atmosphere ============ */
.ambient-rain { /* ... */ }
.ambient-snow { /* ... */ }
/* ... */

/* ============ psychology ============ */
.ambient-danger { /* ... */ }
/* ... */

/* ============ action ============ */
.ambient-impact { /* ... */ }
/* ... */

/* ============ environment ============ */
.ambient-night { /* ... */ }
/* ... */
```

Intensity surfaces as a CSS variable on the component root: `style="--ambient-level: {intensity};"`. SCSS uses it for opacity/scale/particle-count interpolation via `calc()`. No `[data-intensity="3"]` selector duplication.

---

## Exports (`package.json`)

```json
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "svelte": "./dist/index.js", "default": "./dist/index.js" },
    "./atmosphere":  { "svelte": "./dist/svelte/AtmosphereLayer.svelte",  "default": "./dist/svelte/AtmosphereLayer.svelte" },
    "./psychology":  { "svelte": "./dist/svelte/PsychologyLayer.svelte",  "default": "./dist/svelte/PsychologyLayer.svelte" },
    "./action":      { "svelte": "./dist/svelte/ActionLayer.svelte",      "default": "./dist/svelte/ActionLayer.svelte" },
    "./environment": { "svelte": "./dist/svelte/EnvironmentLayer.svelte", "default": "./dist/svelte/EnvironmentLayer.svelte" },
    "./types":       { "types": "./dist/types.d.ts", "default": "./dist/types.js" },
    "./adapters/void-energy-host": { "types": "./dist/adapters/void-energy-host.d.ts", "default": "./dist/adapters/void-energy-host.js" },
    "./styles": { "default": "./dist/styles/ambient-layers.css" }
  }
}
```

---

## Migration from current state

Current package has `BloodLayer.svelte`, `SnowLayer.svelte`, `RainLayer.svelte`, `FogLayer.svelte` in `src/svelte/`. Migration:

1. Create 4 new category components (`AtmosphereLayer`, `PsychologyLayer`, `ActionLayer`, `EnvironmentLayer`).
2. Port existing rain/snow/fog markup into `AtmosphereLayer`'s variant switch.
3. Port existing blood markup into `PsychologyLayer` as the `danger` variant.
4. Delete the 4 old per-layer Svelte files.
5. Rename SCSS classes: `.blood-layer` → `.ambient-danger`, etc.
6. Update `index.ts` barrel.

---

## Implementation order

1. **types.ts** — write all union types, props interfaces. Land first, nothing else compiles without it.
2. **params.ts** — registry: `{ rain: { decayMs: 8000, defaultIntensity: 2 }, ... }`.
3. **Core tokens** — add `ambient` namespace to `src/config/design-tokens.ts`, run `build:tokens`.
4. **adapters/void-energy-host.ts** — copy pattern from kinetic-text.
5. **decay.ts** — the ~30-line helper.
6. **SCSS base** — `.ambient-layer`, z-index vars, retro rule.
7. **AtmosphereLayer.svelte + SCSS** — migrate rain/snow/fog, add ash/underwater/heat.
8. **PsychologyLayer.svelte + SCSS** — migrate blood→danger, add tension/dizzy/focus/flashback/dreaming.
9. **ActionLayer.svelte + SCSS** — all 5 variants (new).
10. **EnvironmentLayer.svelte + SCSS** — all 3 variants (new).
11. **Delete old per-layer components.** Update `index.ts`.
12. **Showcase** — section per category with variant picker + intensity/level controls.
13. **README + CHANGELOG** bump to 0.2.0.

---

## Verification checklist

- [ ] `types.ts` is the single SSOT for all unions and props
- [ ] 4 category components, not 20 per-layer components
- [ ] Single `ambient-layers.scss` file (no split)
- [ ] No coordinator store, no global singleton
- [ ] No physics-adapt code beyond the single global retro rule
- [ ] Old `BloodLayer/SnowLayer/RainLayer/FogLayer` files deleted
- [ ] Core tokens include full `ambient` namespace
- [ ] Showcase demonstrates every variant across every category
- [ ] Package structure matches `packages/kinetic-text/` shape 1:1 where applicable
- [ ] `npm run check` passes in `packages/ambient-layers/`
- [ ] Zero direct imports from monorepo internals — everything via `void-energy/*` public exports

---

## Out of scope

- Cooldown enforcement (consumer's responsibility)
- Global `ambient.show()` coordinator API (kinetic-text has none; neither do we)
- Per-physics SCSS branches beyond the single retro `steps()` rule
- Reduced-motion beyond "respect = freeze animation, keep layer visible"
- Narrative orchestration / story engine bindings (CoNexus concern)
