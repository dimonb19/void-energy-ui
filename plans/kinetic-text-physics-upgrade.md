# Kinetic Text — Physics Upgrade Plan

Make existing effects feel more alive and physical through 3 CSS-level techniques:
1. Per-character duration variation
2. Secondary animation layers (coprime durations) for select continuous effects
3. Keyframe enrichment for the most mechanical-feeling effects

No architecture changes. No new JS animation loops. Same params.ts → CSS vars → keyframes pipeline.

---

## Files Changed

| File | What changes |
|------|-------------|
| `packages/kinetic-text/src/core/effects/params.ts` | Add `durationMult` field + extend param generators |
| `packages/kinetic-text/src/styles/kinetic-text.scss` | Duration via CSS var, new secondary keyframes, enriched keyframe stops |
| `packages/kinetic-text/src/core/effects/index.ts` | No changes needed (registry stays the same) |

---

## Step 1: Per-Character Duration Variation

**The single biggest win.** Right now every character plays the same effect at the exact same speed — only delay differs. Adding a ±15% duration spread makes characters drift in and out of phase naturally.

### params.ts
- Add `durationMult: number` to `CharEffectParams` (default: `1`)
- Add `['durationMult', '--kt-duration-mult', '']` to `PARAM_KEYS`
- In every param generator function, add: `durationMult: range(rng, 0.85, 1.15)`

Exceptions (no duration variation — these need tight synchronization):
- `jolt` — all chars must move together (impact wave)
- `flash` — brightness burst must feel simultaneous
- `glitch` — digital effect, timing precision is the point

### kinetic-text.scss
**Continuous effects** — replace hardcoded durations with calc:
```scss
// Before:
.kt-unit[data-kt-effect='breathe'] {
  animation: kt-effect-breathe 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

// After:
.kt-unit[data-kt-effect='breathe'] {
  animation: kt-effect-breathe calc(5s * var(--kt-duration-mult, 1)) cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: calc(var(--kt-phase, 0) * calc(-5s * var(--kt-duration-mult, 1)) + var(--kt-delay-offset, 0ms));
}
```

Apply this pattern to all 21 continuous effects. The delay's negative phase multiplier must also scale with duration so characters don't bunch up.

**One-shot effects** — the `--kt-effect-duration` var already exists; JS can set it to `base * durationMult`:
```scss
// Already works — one-shot.ts sets --kt-effect-duration per char
// We just need one-shot.ts to multiply by durationMult
```

### one-shot.ts
When setting `--kt-effect-duration`, multiply by `durationMult`:
```ts
const baseDuration = cue.durationMs ?? def.defaultDuration;
const charDuration = Math.round(baseDuration * params.durationMult);
el.style.setProperty('--kt-effect-duration', `${charDuration}ms`);
```
(Always set it, not just when `cue.durationMs !== undefined`)

Also adjust fallback timer to use max possible duration (base * 1.15).

---

## Step 2: Secondary Animation Layers (Continuous Only)

Add a secondary keyframe to select continuous effects. The two keyframes run at coprime durations, so the combined motion never exactly repeats — creating organic, non-repetitive movement.

The `static` effect already proves this pattern works (180ms jitter + 2s flicker).

### Target effects and their secondary layers:

| Effect | Primary | Secondary keyframe | Purpose | Durations |
|--------|---------|-------------------|---------|-----------|
| **breathe** | 5s scale swell | `kt-effect-breathe-drift` | subtle Y float + rotation | 5s / 7.3s |
| **drift** | 4.5s Y float | `kt-effect-drift-wander` | subtle X lateral wander | 4.5s / 6.7s |
| **wave** | 3.5s Y sine | `kt-effect-wave-swell` | subtle scale breathing | 3.5s / 5.3s |
| **float** | 6s dual-axis | `kt-effect-float-spin` | micro rotation oscillation | 6s / 8.7s |
| **pulse** | 1.5s scale beat | `kt-effect-pulse-glow` | brightness after-ripple | 1.5s / 2.3s |
| **tremble** | 180ms XY jitter | `kt-effect-tremble-twist` | micro rotation noise | 180ms / 270ms |
| **haunt** | 7s ghostly drift | `kt-effect-haunt-fade` | deep opacity cycling | 7s / 10.3s |

### Approach for each:

Secondary keyframes reuse existing `--kt-*` CSS vars but apply them to different transform axes with smaller multipliers. No new CSS vars needed.

**Example — breathe:**
```scss
@keyframes kt-effect-breathe-drift {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  30% { transform: translateY(calc(var(--kt-dy, 0px) * 0.3)) rotate(calc(var(--kt-rotate, 0deg) * 0.2)); }
  65% { transform: translateY(calc(var(--kt-dy, 0px) * -0.2)) rotate(calc(var(--kt-rotate, 0deg) * -0.15)); }
}
```

Wait — this won't work. CSS `animation` with multiple keyframes on the same element: the LAST keyframe's `transform` wins (they don't ADD). Two transform-based keyframes on the same element override each other.

**Correction:** Secondary keyframes must animate a DIFFERENT property. Options:
- Primary = `transform`, Secondary = `filter` (brightness, blur)  
- Or: move secondary to the **parent `kt-word`** element, which wraps the `kt-unit`

The DOM structure is: `kt-word > kt-unit > kt-oneshot > kt-glyph`

**Revised approach:** Apply secondary ambient animation on `kt-word` elements. This composes via CSS transform nesting — `kt-word`'s transform applies to everything inside, independent of `kt-unit`'s transform.

This is architecturally clean:
- `kt-word` = secondary ambient motion (new)
- `kt-unit` = primary continuous effect (existing)
- `kt-oneshot` = one-shot effects (existing)
- `kt-glyph` = reveal animation (existing)

### params.ts changes for secondary layers:
Extend param generators for the 7 target effects to also populate `--kt-rotate` / `--kt-dy` / `--kt-dx` with secondary values that the `kt-word` animation reads.

Actually, we need separate vars for the secondary layer since `kt-word` and `kt-unit` are different elements. The simplest approach:

- Add `dx2`, `dy2`, `rotate2` to `CharEffectParams`
- Add them as `--kt-dx2`, `--kt-dy2`, `--kt-rotate2` CSS vars
- Set them on the `kt-word` element (not `kt-unit`)
- Secondary keyframes on `kt-word` read these vars

### continuous.ts changes:
When applying a continuous effect, also set secondary params on the word wrapper element (if the effect has a secondary layer). Need access to word elements via renderer.

### render/index.ts:
Add `getWord(i)` method that returns the word wrapper for unit `i`.

### SCSS:
New animation rules on `.kt-word` for effects with secondary layers:
```scss
.kt-word[data-kt-effect-secondary='breathe-drift'] {
  animation: kt-effect-breathe-drift calc(7.3s * var(--kt-duration-mult, 1)) ease-in-out infinite;
  animation-delay: calc(var(--kt-phase, 0) * calc(-7.3s * var(--kt-duration-mult, 1)) + var(--kt-delay-offset, 0ms));
}
```

---

## Step 3: Keyframe Enrichment

Rewrite the most mechanical-feeling keyframes with physically-motivated timing.

### wave (currently 3 stops — most mechanical effect)
```
Current:  0%/50%/100%  — pure sine, robotic
New:      0%/18%/42%/58%/82%/100% — asymmetric with slight overshoot and hold
```
The up-phase should be slightly faster (lighter), down-phase slightly slower (heavier). Add micro-overshoot at peaks.

### drift (currently 4 stops)
```
Current:  0%/35%/55%/80%/100% — linear-ish float
New:      0%/12%/35%/48%/68%/85%/100% — longer hang at top, faster initial lift, gentle settle
```

### wobble (currently 6 stops, uniform damping)
```
Current:  0%/15%/35%/50%/65%/80%/100% — uniform percentage spacing
New:      0%/8%/22%/38%/56%/74%/88%/100% — faster initial swing, slower settle, non-uniform
```

### ripple (currently 4 uniform stops — second most mechanical)
```
Current:  0%/25%/50%/75%/100% — perfect sine quarters
New:      0%/15%/38%/62%/85%/100% — asymmetric with sharper peaks and longer valleys
```

### sway (currently 6 stops)
```
Current:  0%/15%/35%/50%/65%/85%/100% — symmetric pendulum
New:      0%/12%/30%/46%/55%/72%/90%/100% — hold slightly at extremes, faster through center
```

### drip (currently 5 stops)
```  
Current:  0%/30%/55%/70%/85%/100% — smooth sag
New:      0%/15%/35%/52%/65%/80%/92%/100% — gravity acceleration, slight bounce at bottom
```

---

## Implementation Order

1. **Step 1 first** (duration variation) — Biggest impact, smallest change footprint. Easy to test immediately.
2. **Step 3 next** (keyframe enrichment) — Pure SCSS, no JS changes. Can test effect-by-effect.  
3. **Step 2 last** (secondary layers) — Most complex: touches params.ts, continuous.ts, render/index.ts, SCSS. Requires `kt-word` secondary animation wiring.

---

## What This Doesn't Change

- Effect names, categories, and API
- One-shot vs continuous distinction
- The `data-kt-effect` / `data-kt-oneshot` attribute system
- Reveal styles and timeline logic
- Physics variants (glass blur, retro steps) — these layer on top as before
- The `KineticText` component props
