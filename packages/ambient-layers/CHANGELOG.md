# Changelog

## 0.3.0

### Breaking — API reconciliation

- **Unified intensity prop.** `EnvironmentLayer` now takes
  `intensity: 'light' | 'medium' | 'heavy'` (default `'medium'`); the previous
  `opacity` prop is removed. All four categories now share the same intensity
  vocabulary. The CSS variable consumed by the environment SCSS is now
  `--ambient-env-level` (was `--ambient-env-opacity`).
- **Unified lifecycle callbacks.** `onLevelChange` and `onComplete` are
  removed from every category. All four now accept:
  - `onChange?: (level) => void` — fires on every intensity transition,
    including the initial value and the final `'off'` step.
  - `onEnd?: () => void` — fires exactly once when the layer reaches `'off'`
    (persistent) or when the one-shot animation completes (action).
    Environment never fires `onEnd`.
- **`decayMs` → `durationMs`.** Renamed across props, the per-effect registry,
  and the decay runtime. Action layers also gain `durationMs` as a per-instance
  override (was previously locked to `params.ts`).
- **Effect renames** (no compat aliases — pre-1.0):
  - `flashback` → `filmGrain` (psychology). The mechanic is generic sepia +
    grain texture; the new name describes the visual, not a narrative use.
  - `dreaming` → `haze` (psychology). Generic soft double vignette; consumers
    map it to "dream" themselves.
  - SCSS class names follow: `.ambient-flashback` → `.ambient-film-grain`,
    `.ambient-dreaming` → `.ambient-haze`. CamelCase variant ids are
    automatically kebab-cased for the SCSS class binding.

### Added — catalog completion

- **Psychology positive/neutral states.** `calm`, `serenity`, `success`,
  `awe`, `melancholy`. Fills the previously lopsided catalog so the layer can
  depict relief, peace, achievement, wonder, and grief — not just edge states.
- **Action soft beats.** `dissolve` (graceful exit, blur fade), `shake`
  (damped translate random walk on the layer root, amplitude scales with
  intensity), `zoomBurst` (radial scale + outward motion blur from center).
- **Atmosphere weather completion.** `storm` (composes the rain particle
  system internally + lightning flashes + horizontal wind drift — the only
  effect in the package that composes another), `wind` (horizontal dust/leaf
  streaks, no precipitation).
- **Environment overcast.** Flat grey-blue desaturated wash with slight green
  tint — storm/gloom *tone* without committing to atmosphere precipitation.

### Internal

- `params.ts` is now declared the SSOT per-effect registry via header
  comment. Every effect carries `{ defaultIntensity, durationMs }`.
- `PsychologyLayer` and `ActionLayer` derive a kebab-case `variantClass` from
  the camelCase variant id so SCSS class bindings stay readable
  (e.g. `zoomBurst` → `.ambient-zoom-burst`).

## 0.1.0

- Initial scaffold (slice 1 of Phase 1 — Ambient Layers).
- `SnowLayer` — CSS-particle snowfall, physics-aware (glass bloom, flat silhouettes,
  retro stepped pixels), mode-aware (dark/light flake colors), reduced-motion respect.
