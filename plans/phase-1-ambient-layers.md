# Phase 1 — Ambient Layers

> Build immersive visual overlay layers (Blood, Snow, Rain, Fog) as a dedicated `@dgrslabs/void-energy-ambient-layers` package from day one, following the existing pattern established by Kinetic Text and DGRS.

**Status:** Planning — not started
**Priority:** Phase 1 (current)
**Blocks:** Phase 2 (AI Automation foundation)
**Depends on:** nothing — greenfield

---

## Why Phase 1

The Phase 3 monorepo restructure is a large, disruptive reorganization of every file in the project. Mixing "build a new feature" with "reorganize every file" produces slow, risky changes with entangled diffs. Completing the design system feature set *first* means Phase 3 becomes pure plumbing — no feature work, just file movement and package configuration.

Ambient Layers is the last major feature the system needs before it can be considered complete.

---

## Why a separate package from day one

The current monorepo already contains `packages/kinetic-text/` and `packages/dgrs/`, both scoped as `@dgrslabs/void-energy-*`. Kinetic Text has been built and expanded as a dedicated package since inception, not as loose files in `src/` later lifted into a package. This is the correct pattern.

**Advantages over building in `src/` first:**

- **Zero lift later.** When Phase 3 moves packages to the premium repo, ambient is already in its final shape. No refactoring of imports, no path aliasing, no rewriting SCSS `@use` statements.
- **Forced API discipline.** A package has an `exports` map from day one. You cannot reach into other parts of the codebase through relative paths — you must import via public APIs. This keeps the ambient module clean and portable.
- **Independent versioning.** The ambient package has its own `version` field from commit 1. When we ship a fix, we bump the ambient version, not the whole monorepo.
- **Consistent with the rest of the system.** Kinetic Text and DGRS already live in `packages/`. Ambient should too. Uniformity matters for AI automation (the AI sees the same structure across all premium packages) and for developer ergonomics.
- **Easier to demo in isolation.** A package can be installed into any test project without pulling the whole monorepo with it.

---

## What Ambient Layers is

A **layer** is a full-viewport visual overlay that sits above the page content and below the UI chrome, adding environmental atmosphere without interfering with interaction. Think particle systems, weather effects, mood overlays — immersive but non-blocking.

Four layers ship in Phase 1:

| Layer | Effect | Use case |
|-------|--------|----------|
| **Blood** | Crimson vignette, pulsing edges, occasional drip | Horror, intensity, combat, danger |
| **Snow** | Drifting flakes, frost vignette, cold desaturation | Cold, isolation, winter, tragedy |
| **Rain** | Falling streaks, glass droplets, blue-gray mood | Melancholy, weather, transition |
| **Fog** | Rolling mist, edge obscuration, depth fade | Mystery, dreams, unknown, tension |

Each is a single Svelte component that can be mounted into any page and configured via props.

---

## Design goals

1. **Non-blocking** — layers are `pointer-events: none` by default. User interaction with the page is never affected.
2. **Physics-adaptive** — each layer responds to the active physics preset (glass, flat, retro) with different rendering strategies. Glass gets blur and depth. Flat gets clean silhouettes. Retro gets dithered/pixelated simulations.
3. **Color-mode aware** — layers adapt to light/dark mode automatically via semantic tokens. Snow on light mode is not the same as snow on dark mode.
4. **Performance-first** — layers must hit 60fps on a mid-tier laptop. Use CSS transforms, `will-change` sparingly, prefer GPU-accelerated properties. Fall back to reduced-motion CSS when `prefers-reduced-motion` is set.
5. **Controllable intensity** — each layer accepts an `intensity` prop (0–1) to scale the effect strength. Lets consumers fade layers in/out narratively.
6. **No raw values** — all colors, timings, blur amounts flow through design tokens. Token Law applies fully.
7. **Peer-dependency on `void-energy`** — the package does not bundle the core. It depends on `void-energy` as a peer, exactly like Kinetic Text does.

---

## Public API

Each layer is a Svelte component imported from the package:

```svelte
<script lang="ts">
  import { BloodLayer, SnowLayer, RainLayer, FogLayer } from '@dgrslabs/void-energy-ambient-layers';
</script>

<BloodLayer intensity={0.6} />
<SnowLayer intensity={0.8} wind={0.3} />
<RainLayer intensity={0.5} />
<FogLayer intensity={0.7} drift="slow" />
```

### Common props (all layers)

```ts
interface AmbientLayerProps {
  intensity?: number;        // 0..1, default 0.5
  enabled?: boolean;         // default true; false removes from DOM
  reducedMotion?: 'auto' | 'respect' | 'ignore'; // default 'respect'
  class?: string;
}
```

### Layer-specific props

- **BloodLayer:** `pulse?: boolean` (default true), `dripRate?: number` (drips/min)
- **SnowLayer:** `wind?: number` (0..1 horizontal drift), `flakeCount?: 'sparse' | 'medium' | 'heavy'`
- **RainLayer:** `angle?: number` (degrees from vertical), `density?: 'light' | 'medium' | 'heavy'`
- **FogLayer:** `drift?: 'still' | 'slow' | 'fast'`, `opacity?: number`

### Global coordinator (optional)

A thin store for coordinating multiple layers narratively:

```ts
import { ambient } from '@dgrslabs/void-energy-ambient-layers';

ambient.show('rain', { intensity: 0.7 });
ambient.fade('rain', 0, { duration: 2000 });
ambient.replace('fog', { intensity: 0.5 });
ambient.clear();
```

Optional — consumers can mount components directly without the coordinator for simple cases.

---

## Package layout

Inside the current monorepo at `packages/ambient/`, mirroring the existing `packages/kinetic-text/` structure:

```
packages/
└── ambient/
    ├── package.json                              { "name": "@dgrslabs/void-energy-ambient-layers" }
    ├── tsconfig.json
    ├── tsconfig.build.json
    ├── README.md
    ├── CHANGELOG.md
    ├── scripts/                                  build pipeline
    ├── src/
    │   ├── index.ts                              public API barrel
    │   ├── components/
    │   │   ├── BloodLayer.svelte
    │   │   ├── SnowLayer.svelte
    │   │   ├── RainLayer.svelte
    │   │   └── FogLayer.svelte
    │   ├── lib/
    │   │   ├── ambient-store.svelte.ts          global coordinator
    │   │   ├── particle-engine.ts                shared particle logic
    │   │   ├── physics-adapters.ts               per-physics rendering strategies
    │   │   └── reduced-motion.ts
    │   ├── styles/
    │   │   ├── _ambient.scss                    shared base
    │   │   ├── _ambient-blood.scss
    │   │   ├── _ambient-snow.scss
    │   │   ├── _ambient-rain.scss
    │   │   └── _ambient-fog.scss
    │   ├── types/
    │   │   └── ambient.d.ts
    │   └── adapters/
    │       └── void-energy-host.ts               token bridge to void-energy
    └── dist/                                     build output (gitignored)
```

### `package.json` template

Modeled after `packages/kinetic-text/package.json`:

```json
{
  "name": "@dgrslabs/void-energy-ambient-layers",
  "version": "0.1.0",
  "type": "module",
  "license": "UNLICENSED",
  "description": "Immersive visual overlay layers for Void Energy (Blood, Snow, Rain, Fog)",
  "files": [
    "dist",
    "README.md",
    "CHANGELOG.md"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./components/blood": {
      "svelte": "./dist/components/BloodLayer.svelte",
      "default": "./dist/components/BloodLayer.svelte"
    },
    "./components/snow": { "...": "..." },
    "./components/rain": { "...": "..." },
    "./components/fog":  { "...": "..." },
    "./styles": "./dist/styles/index.scss"
  },
  "peerDependencies": {
    "svelte": "^5.0.0",
    "void-energy": "workspace:*"
  },
  "scripts": {
    "build": "...",
    "check": "svelte-check",
    "test": "vitest run"
  }
}
```

The `workspace:*` on `void-energy` lets ambient develop against the local library copy inside the current monorepo. When the package is lifted into the premium repo in Phase 3, this gets rewritten to `"void-energy": "^0.1.0"` (published version).

---

## The token bridge (`adapters/void-energy-host.ts`)

Because the ambient package is separate from the core library, it cannot directly read design tokens from `src/config/design-tokens.ts`. Instead, it imports them through the public `void-energy` entry point:

```ts
// packages/ambient/src/adapters/void-energy-host.ts
import { designTokens } from 'void-energy/tokens';

export const ambientTokens = {
  bloodBase: designTokens.ambient.blood.base,
  snowFlake: designTokens.ambient.snow.flake,
  // ...
};
```

**Critical:** the core `void-energy/tokens` export must include an `ambient` namespace. This means Phase 1 adds new tokens to the core `src/config/design-tokens.ts` **in addition to** building the ambient package. The tokens are core (part of the public system), but the implementation that consumes them is the premium package.

**Why tokens live in core, not in the ambient package:** if a premium package defined its own tokens, every premium package would need its own token pipeline, and themes would fragment. Keeping all tokens in one place (core) preserves a single source of truth. The premium package is just an implementation that reads them.

---

## Implementation strategy

### Particle-based layers (Snow, Rain)

Pure CSS particles animated via `@keyframes` are cheapest:
- Generate N particles at component mount via a `{#each}` loop
- Each particle gets randomized delay, duration, horizontal position via CSS custom properties
- Single shared `@keyframes` animation per layer
- `intensity` scales opacity and particle count via `--ambient-intensity`

No JS per-frame updates. The browser handles everything.

### Vignette layers (Blood, Fog)

Radial gradient + optional animated SVG filter:
- Blood: fixed radial gradient, CSS `@keyframes` pulse on opacity
- Fog: layered SVG `feTurbulence` + `feDisplacementMap` with slow `animate` on turbulence seed for drift
- Both adapt via CSS custom properties responding to physics data attributes

### Physics adaptation

Each layer's SCSS uses the existing `@include when-glass/when-flat/when-retro` mixins from `void-energy/styles/abstracts`:
- **Glass:** full visual fidelity, blur, depth, subtle glow on particles
- **Flat:** clean silhouettes, no blur, slightly reduced opacity
- **Retro:** dithered halftone pattern, stepped animation timing, hard pixel edges

### Reduced motion

When `prefers-reduced-motion: reduce` and `reducedMotion === 'respect'`:
- Particle layers freeze particles at their starting positions
- Vignette layers stop pulsing/drifting but remain visible
- Opacity scales to 50% of `intensity`

Never fully hide the layer.

### Performance budget

- Each layer independently: **under 2ms per frame** on a mid-tier laptop
- All four layers simultaneously: **under 8ms per frame**
- Verify with Chrome DevTools Performance tab
- If a layer exceeds budget, reduce particle count or simplify — never add per-frame JS

---

## Token additions to `void-energy`

Add to `src/config/design-tokens.ts` (in the core library, not the ambient package):

```ts
ambient: {
  blood: { base, pulse, drip },
  snow:  { flake, vignette, tint },
  rain:  { streak, glass, tint },
  fog:   { base, drift, edge },
  zIndex: { layer: number }
}
```

Each token has light-mode and dark-mode variants. Run `npm run build:tokens` after adding them so `_generated-themes.scss` includes them.

---

## Showcase integration

The existing showcase site (currently in the monorepo, will become `apps/showcase` in Phase 3) demonstrates ambient. Add a new section to the showcase page:
- Install the ambient package as a workspace dependency in the showcase app
- Import all four layers
- Live toggle buttons, intensity sliders, layer-specific controls
- Physics switcher nearby so users can see layers adapt in real time

**This is the visible Phase 1 deliverable.** When the showcase shows all four layers working across all three physics presets and both modes, Phase 1 is done.

---

## Implementation order

1. **Create the package scaffold**
   - `packages/ambient/` directory
   - `package.json` modeled after `kinetic-text`
   - `tsconfig.json`, `tsconfig.build.json`
   - `README.md` stub, `CHANGELOG.md` stub
   - Wire into the monorepo workspaces

2. **Add ambient tokens to core**
   - Edit `src/config/design-tokens.ts` in the core library
   - Run `npm run build:tokens`
   - Verify `void-energy/tokens` export exposes the new namespace

3. **Build the adapter layer**
   - `packages/ambient/src/adapters/void-energy-host.ts` — reads tokens through the public `void-energy/tokens` export

4. **SnowLayer first** (simplest particle-based)
   - Component, SCSS, physics adaptation
   - Add to showcase
   - Verify 60fps and reduced-motion

5. **RainLayer** (follows Snow's pattern)

6. **FogLayer** (first vignette-based)
   - Establish SVG turbulence pattern
   - Document the approach in the component header

7. **BloodLayer**

8. **Global coordinator** (`ambient-store.svelte.ts`)

9. **Performance audit**
   - Profile each layer individually
   - Profile all four simultaneously
   - Fix anything over budget

10. **Reduced motion audit**

11. **Documentation**
    - Package README with full API
    - CHEAT-SHEET additions (ambient catalog)
    - Register in `component-registry.json` (once Phase 2 AI automation defines how premium packages register)
    - `packages/ambient/CLAUDE.md` — package-level rules

---

## Verification checklist

- [ ] `packages/ambient/` exists with the package scaffold matching the `kinetic-text` pattern
- [ ] `package.json` declares `"name": "@dgrslabs/void-energy-ambient-layers"` and `"peerDependencies": { "void-energy": "workspace:*" }`
- [ ] Ambient tokens added to core `design-tokens.ts` and generated into `_generated-themes.scss`
- [ ] All four layers render correctly in glass / flat / retro physics
- [ ] All four layers render correctly in light and dark modes
- [ ] Each layer independently stays under 2ms per frame
- [ ] All four layers simultaneously stay under 8ms per frame
- [ ] `prefers-reduced-motion: reduce` produces frozen/calmed behavior without hiding layers
- [ ] Layers are `pointer-events: none`
- [ ] Global coordinator store works: show, hide, fade, crossfade
- [ ] Showcase demonstrates all four layers with live controls
- [ ] Showcase works on mobile (test at 375px viewport)
- [ ] The ambient package has **zero direct imports from other parts of the monorepo** — everything goes through `void-energy/*` public exports
- [ ] `npm run check` passes inside `packages/ambient/`
- [ ] `npm run test` passes inside `packages/ambient/`
- [ ] Package CHANGELOG reflects the 0.1.0 release
- [ ] Package README documents the full public API
- [ ] The package is trivially liftable into the Phase 3 premium repo — no refactoring required, just file move + rewrite `workspace:*` to `^0.1.0`

---

## Out of scope for Phase 1

- **Sound ambient.** Audio layers (wind, rain sounds, ambient drones) are a separate future package. Phase 1 is visual only.
- **Narrative orchestration.** Automatic layer sequencing based on story events is CoNexus-specific and belongs in the story engine.
- **Custom layer creation API.** Four concrete layers is the deliverable. Plugin API is over-engineering.
- **Mobile-specific optimizations beyond the performance budget.** 60fps desktop + 30fps mid-range mobile is acceptable.
- **Publishing to GitHub Packages.** The package lives in the current monorepo as a workspace only. Publishing to a private registry happens in Phase 3 when the premium repo is created.
