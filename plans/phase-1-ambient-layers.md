# Phase 1 — Ambient Layers: Catalog Completion & API Reconciliation

> The `@dgrslabs/void-energy-ambient-layers` package scaffold, four category components, and initial effect catalog already ship. This phase **closes the emotional/expressive gaps in the catalog** and **rationalizes inconsistencies in the cross-category API** so the package is ready to be lifted into the premium repo in Phase 3 without future refactors.

**Status:** Planning
**Depends on:** existing `packages/ambient-layers/` (4 category components, 25 effects total)
**Blocks:** Phase 2 (AI automation reads a stable ambient catalog), Phase 3 (premium repo lift)

---

## Why this phase exists

A design review of the current package surfaced two distinct problems:

1. **Catalog gaps.** The effect vocabulary is lopsided. Psychology only depicts negative/edge states (no calm, no success, no awe). Action only has hard "impact"-style beats (no dissolve, no shake). Atmosphere is missing storms. Several effects are misnamed (`flashback` is generic film grain; `dreaming` is generic haze).
2. **API drift across categories.** Each layer category invented its own intensity semantics, lifecycle callbacks, and decay shape. The four components no longer feel like one system. Adding more effects on top of an inconsistent foundation compounds the drift.

This phase fixes (2) **first**, then expands (1) on the cleaned-up foundation. Order matters: if we add ten new effects to an inconsistent API, every consumer ends up writing ten different integration shapes.

---

## Current state (snapshot, 2026-04-08)

| Category | Effects today | Lifetime model | Intensity model | Lifecycle callback |
|---|---|---|---|---|
| **Atmosphere** | rain, snow, ash, fog, underwater, heat | persistent + decay | scales **particle count** | `onLevelChange` |
| **Psychology** | danger, tension, dizzy, focus, flashback, dreaming | persistent + decay | scales **vignette opacity** | `onLevelChange` |
| **Action** | impact, speed, glitch, flash, reveal | one-shot, auto-unmount | scales **animation amplitude** | `onComplete` |
| **Environment** | night, neon, dawn, dusk, sickly, toxic, underground, candlelit | sticky, no decay | **opacity only**, no levels | none |

**Files:**
- [packages/ambient-layers/src/types.ts](packages/ambient-layers/src/types.ts) — union SSOT
- [packages/ambient-layers/src/core/effects/params.ts](packages/ambient-layers/src/core/effects/params.ts) — per-effect defaults
- [packages/ambient-layers/src/core/runtime/decay.ts](packages/ambient-layers/src/core/runtime/decay.ts) — shared stepper
- [packages/ambient-layers/src/svelte/AtmosphereLayer.svelte](packages/ambient-layers/src/svelte/AtmosphereLayer.svelte)
- [packages/ambient-layers/src/svelte/PsychologyLayer.svelte](packages/ambient-layers/src/svelte/PsychologyLayer.svelte)
- [packages/ambient-layers/src/svelte/ActionLayer.svelte](packages/ambient-layers/src/svelte/ActionLayer.svelte)
- [src/components/AmbientLayersPage.svelte](src/components/AmbientLayersPage.svelte) — showcase

---

## Goals

1. **Unified intensity model** across all four categories — same prop name, same value space, same mental model.
2. **Unified lifecycle callbacks** — persistent and one-shot layers share a predictable observation surface.
3. **Effect renames** so generic mechanics aren't trapped under narrative-specific names.
4. **Psychology positive/neutral expansion** — calm, serenity, success, awe, melancholy.
5. **Action soft-beat expansion** — dissolve, shake, zoom-burst.
6. **Atmosphere weather completion** — storm, wind/dust.
7. **Environment minor completion** — overcast.
8. **Documentation parity** — every effect appears in showcase, README, and registry.

Out of scope: per-physics branches beyond the single retro `steps()` rule, narrative orchestration, audio, plugin/custom-effect API.

---

## Part A — API Reconciliation (must land first)

### A1. Unify the intensity prop across all categories

**Problem:** Three different shapes today: `intensity: 1|2|3` (persistent), `level: 'light'|'medium'|'heavy'` (action), nothing (environment).

**Decision:** Standardize on `intensity: 'light' | 'medium' | 'heavy'` for **all four** categories.
- Strings (not numbers) read better in templates and AI tool calls.
- Environment gains a real intensity prop instead of a raw `opacity` escape hatch — `light` = barely-there tint, `heavy` = fully-saturated grade.
- Persistent layers keep decay; the decay path becomes `heavy → medium → light → off`.

**Rejected alternatives:**
- Keep `1|2|3` numeric — harder to read, AI mistakes `0` for `off`.
- Allow both — drift returns immediately.

**Migration:**
- Edit `types.ts` — `AmbientIntensity = 'light'|'medium'|'heavy'`.
- All four category prop interfaces consume `intensity?: AmbientIntensity`.
- Action loses its separate `level` prop. The decay code path remains persistent-only.
- Environment maps `intensity` → CSS `--ambient-level` (0.33 / 0.66 / 1.0) consumed by SCSS opacity.
- Update [params.ts](packages/ambient-layers/src/core/effects/params.ts) so each effect's `defaults` block uses the new shape.
- Update [AmbientLayersPage.svelte](src/components/AmbientLayersPage.svelte) controls.

### A2. Unify lifecycle callbacks

**Problem:** Persistent uses `onLevelChange(level)`; Action uses `onComplete()`; Environment has nothing.

**Decision:** Single callback shape per concern, named consistently:
```ts
interface AmbientLifecycle {
  onChange?: (intensity: AmbientIntensity | 'off') => void; // fired on every level transition
  onEnd?: () => void;                                       // fired exactly once when layer reaches 'off' / completes
}
```
- Persistent layers fire `onChange` on each decay step, then `onEnd` when reaching `off`.
- Action layers fire `onChange('heavy' → 'off')` synthetically (start/end), then `onEnd` on animation completion.
- Environment fires `onChange` on intensity prop change, no `onEnd`.

This gives consumers **one mental model**: subscribe to `onChange` if you care about steps, `onEnd` if you only care about teardown.

### A3. Standardize the decay prop

**Problem:** `decayMs` lives only on persistent layers. Action effects encode their durations inside `params.ts` and consumers can't tune them per-instance.

**Decision:** Promote a single `durationMs?: number` prop on all categories.
- Persistent: time **per level** before stepping down (current `decayMs` behavior). Rename `decayMs` → `durationMs` for consistency.
- Action: total animation duration, overrides `params.ts` default.
- Environment: ignored (sticky).
- Default per effect lives in [params.ts](packages/ambient-layers/src/core/effects/params.ts).

Rename `decayMs` everywhere (props, params, runtime helper). One pass, no compat alias — package is pre-1.0.

### A4. Document params.ts as the registry

Add a header comment to [params.ts](packages/ambient-layers/src/core/effects/params.ts) declaring it the SSOT for per-effect tuning. Every effect must have an entry: `{ defaultIntensity, durationMs, category }`. The decay runtime reads from here, not from component-local constants.

---

## Part B — Renames (after API unification)

These are simple but must happen before the new effects land, otherwise we cement the old names by association.

| Old | New | Reason |
|---|---|---|
| `flashback` (psychology) | `filmGrain` (psychology) | Effect is generic sepia + grain texture; "flashback" is narrative, not mechanical. Reusable as ambience for memory, vintage, photography UI. |
| `dreaming` (psychology) | `haze` (psychology) | Effect is a soft double vignette with no dream-specific signal. `haze` describes the visual; consumers map it to "dream" themselves. |
| `decayMs` (prop, param key, runtime arg) | `durationMs` | Aligns with A3. |

**Migration:** rename in `types.ts`, `params.ts`, the SCSS class names (`.ambient-flashback` → `.ambient-film-grain`, `.ambient-dreaming` → `.ambient-haze`), the variant switch in [PsychologyLayer.svelte](packages/ambient-layers/src/svelte/PsychologyLayer.svelte), and [AmbientLayersPage.svelte](src/components/AmbientLayersPage.svelte).

No backwards-compat alias — pre-1.0 package, single consumer (the showcase).

---

## Part C — New Effects

Built on the unified API. Each effect ships with: variant in `types.ts`, entry in `params.ts`, SCSS block in `ambient-layers.scss`, branch in the relevant category Svelte file, showcase tile.

### C1. Psychology — positive/neutral states

The biggest catalog gap. Today the layer can only depict things going wrong.

| Effect | Visual | Default duration | Purpose |
|---|---|---|---|
| **calm** | Soft cool-blue vignette, slow breathing pulse (4s cycle), no tension | 10 000ms | Counterpart to `tension`. Relief, safety, post-conflict downbeat. |
| **serenity** | Pale white/cyan glow on outer edges, near-imperceptible drift | 12 000ms | Ambient peacefulness; meditation, idle, contemplative reading. |
| **success** | Warm green vignette with one slow outward bloom on entry | 8 000ms | Counterpart to `danger`. Achievement, resolution, positive narrative beat. |
| **awe** | Pale gold/white radial brightening from center outward, very slow | 12 000ms | Wonder, discovery, reveal of something significant. Distinct from `flash` (one-shot) — this lingers. |
| **melancholy** | Desaturated blue-grey vignette, slow downward drift on edge gradient | 10 000ms | Sadness, loss, reflective sorrow. Not negative-as-threat (that's `danger`); negative-as-grief. |

**Why these five and not more:** they fill the four obvious quadrants (positive-active = success, positive-passive = serenity, neutral-restorative = calm, positive-transcendent = awe) plus the missing "negative-not-threatening" slot (melancholy). Anger, confusion, shock — anger overlaps `danger`, confusion overlaps `dizzy`, shock belongs in Action.

### C2. Action — soft and physical beats

| Effect | Visual | Default duration | Purpose |
|---|---|---|---|
| **dissolve** | Whole-screen gentle fade-to-transparent over a soft blur | 1 200ms | Soft narrative close. The "exit" counterpart to `reveal`. Every story needs a way to end gracefully. |
| **shake** | Translate canvas in a damped random walk; no color/blur change | 600ms | Earthquake, heavy collision aftermath, jolt. Pairs with `impact` (impact = ring, shake = vibration). |
| **zoomBurst** | Brief radial scale-up + outward motion blur from center | 500ms | Sudden attention shift, dramatic emphasis, "wait, what?" beat. Distinct from `flash` (no luminance change). |

`shake` is the most physically-interesting addition. It's implemented via a CSS transform on a wrapper div, not on `<html>`, so it doesn't fight scroll position.

### C3. Atmosphere — weather completion

| Effect | Visual | Default duration | Purpose |
|---|---|---|---|
| **storm** | Rain particles (denser than `rain`) + occasional full-viewport `flash` style lightning + slow horizontal wind drift | 12 000ms | True storm. Rain-only is drizzle; this is the dramatic option. Internally composes the rain particle system + a separate lightning timer. |
| **wind** | Drifting horizontal streaks (dust/leaves), no precipitation | 10 000ms | Dryness, desert, exposure, foreboding without rain. Pairs with `heat` for desert scenes. |

Storm is the only effect in this phase that **internally composes** another effect. Document this clearly in the SCSS section comment so future contributors know the pattern is allowed for atmosphere only.

### C4. Environment — minor completion

| Effect | Visual | Purpose |
|---|---|---|
| **overcast** | Flat grey-blue desaturated wash, very slight green tint | Storm/gloom **tone** without committing to Atmosphere precipitation. Lets consumers tint a scene "stormy" while keeping the atmosphere slot free for fog or nothing. |

---

## Part D — Showcase, docs, registry

Every new effect must appear in:
- [src/components/AmbientLayersPage.svelte](src/components/AmbientLayersPage.svelte) — variant picker tile + live preview
- `packages/ambient-layers/README.md` — effect table per category
- `packages/ambient-layers/CHANGELOG.md` — bump to 0.3.0, list renames as breaking
- `src/config/component-registry.json` — if ambient is registered there yet (check; if not, defer to Phase 2)

Showcase controls must use the new unified `intensity` prop so users see the consistent API in action.

---

## Implementation order

The order is deliberate: API first, renames second, additions third. Each step compiles cleanly on its own and can be its own commit.

1. **A1 — Unify intensity.** Edit `types.ts`, all four category components, `params.ts`, showcase. Verify compile + showcase still works for all 25 existing effects.
2. **A2 — Unify lifecycle callbacks.** `onChange` / `onEnd` everywhere. Update showcase if it currently subscribes to `onLevelChange`.
3. **A3 — Rename `decayMs` → `durationMs`.** Single rename pass across `params.ts`, `decay.ts`, props, showcase.
4. **A4 — Header comment in `params.ts`** declaring registry status. No code change.
5. **B — Renames.** `flashback` → `filmGrain`, `dreaming` → `haze`. SCSS classes, variant strings, showcase tiles.
6. **C1 — Psychology positive states.** Add `calm`, `serenity`, `success`, `awe`, `melancholy`. Each: type union, params entry, SCSS block, variant branch, showcase tile. Land as a single commit per effect or one bundled commit — author's choice.
7. **C2 — Action soft beats.** Add `dissolve`, `shake`, `zoomBurst`.
8. **C3 — Atmosphere weather.** Add `storm`, `wind`. Storm composes the rain particle system internally — implement carefully, document in the SCSS section header.
9. **C4 — Environment overcast.** Single tint addition.
10. **D — Documentation pass.** README tables, CHANGELOG entry, showcase verification, screenshot if useful.
11. **Bump package version** to `0.3.0`. Renames are breaking; positive states are additive.

---

## Verification checklist

### API consistency
- [ ] All four category components accept `intensity: 'light' | 'medium' | 'heavy'`
- [ ] Action no longer has a separate `level` prop
- [ ] Environment uses `intensity` (not raw opacity) to scale its tint
- [ ] All four categories accept `onChange` and `onEnd`; no `onLevelChange` or `onComplete` remain
- [ ] All four categories accept `durationMs`; no `decayMs` remains
- [ ] Every effect has an entry in `params.ts` with `{ defaultIntensity, durationMs, category }`
- [ ] `params.ts` has a header comment declaring it the per-effect registry SSOT

### Renames
- [ ] `flashback` is gone everywhere (types, params, SCSS class, showcase, variant string); `filmGrain` works
- [ ] `dreaming` is gone everywhere; `haze` works
- [ ] No `decayMs` anywhere in the package

### New effects (showcase smoke test)
- [ ] Psychology: `calm`, `serenity`, `success`, `awe`, `melancholy` all render and decay correctly
- [ ] Action: `dissolve`, `shake`, `zoomBurst` all fire once and auto-unmount
- [ ] Atmosphere: `storm` produces rain + lightning + wind drift without leaking timers; `wind` produces dust streaks
- [ ] Environment: `overcast` applies as a sticky tint and respects `intensity`

### System hygiene
- [ ] `npm run check` passes from repo root
- [ ] `npm run check` passes inside `packages/ambient-layers/`
- [ ] No raw values introduced in new SCSS blocks (Token Law)
- [ ] All new effects respect `prefers-reduced-motion` (freeze animation, halve opacity)
- [ ] All new effects are `pointer-events: none`
- [ ] Showcase demonstrates every effect across every category, with the new unified controls
- [ ] CHANGELOG documents A1–A3 and B as **breaking**, C1–C4 as additive, version bumped to `0.3.0`

---

## Out of scope

- **Per-physics branching** beyond the existing global retro `steps()` rule. Stays out.
- **Stacking semantics** between Atmosphere and Environment (e.g., "is `overcast` + `rain` allowed?"). Document the answer in README but do not enforce in code.
- **Plugin / custom-effect API.** Effects remain a closed enum.
- **Audio layers.** Separate future package.
- **Narrative orchestration / story-engine bindings.** CoNexus concern, not the package's job.
- **Effect combinations beyond `storm`.** `storm` is the only composition; everything else stays atomic.
