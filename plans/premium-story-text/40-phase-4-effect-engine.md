# Phase 4 — Effect Engine

## Goal

Rebuild all existing narrative effects on top of explicit premium scopes so continuous and one-shot effects can operate during reveal, after reveal, or on exact TTS cues.

## Inputs and dependencies

- Phase 3 reveal engine (timeline, renderer, stagger)
- Current narrative effect names in `src/types/narrative.d.ts`
- Existing effect semantics and keyframes from `src/actions/narrative.ts` and `src/styles/components/_narrative.scss`
- `NARRATIVE-EFFECTS.md` reference

## In scope

- Effect registry
- Continuous effect playback
- One-shot effect playback
- Scope-aware transforms (block, line, word, glyph, range)
- Per-unit phase offsets for organic continuous effects
- Seeded randomness for repeatable visual noise
- Physics-aware tuning through `TextStyleSnapshot`
- CSS keyframe definitions for all 18 effects

## Out of scope

- Conexus TTS integration details (Phase 5)
- Package extraction (Phase 6)
- New effects not in the current set (future phase)

## Decisions already locked

- Effect names stay unchanged (all 18 from current narrative system).
- Continuous effects may run during reveal.
- One-shot effects may fire during reveal or at exact cues.
- Host style state arrives only through `TextStyleSnapshot`.
- Effects are CSS-driven (keyframes + data attributes). JS controls WHEN effects start/stop.

## Implementation tasks

### Effect registry (`core/effects/index.ts`)

1. Build an internal effect registry keyed by `StoryTextEffect` name:
   ```typescript
   interface EffectDefinition {
     name: StoryTextEffect;
     category: 'one-shot' | 'continuous';
     defaultScope: EffectScope;
     supportedScopes: EffectScope[];
     cssAnimationName: string;
     defaultDuration: number;   // ms
   }

   const EFFECT_REGISTRY: Map<StoryTextEffect, EffectDefinition>
   ```
2. Register all 18 effects with their metadata.

### Continuous effects (`core/effects/continuous.ts`)

3. Implement continuous effect application:
   - Set `data-st-effect="<name>"` on the target scope element(s)
   - For glyph scope: set on each `st-unit` (outer node) — this is the effect layer, separate from the `st-glyph` (inner node) that handles reveal. No animation property conflict.
   - CSS keyframes handle the actual animation (defined in `styles/story-text.scss`)
   - Clear by removing the attribute
4. Per-unit phase offsets for organic motion:
   - `--st-phase` is set on each `st-unit` during render (0.0 to 1.0, based on `globalIndex / totalUnits`)
   - CSS uses `animation-delay: calc(var(--st-phase) * -<duration>)` for negative phase shift
   - Negative delay means each character starts at a different point in the SAME animation cycle — they all loop in sync but offset
   - Result: organic wave-like motion where neighboring characters are at slightly different phases
5. Scope application:
   - `block`: `data-st-effect` on `st-visual` container
   - `line`: `data-st-effect` on each `st-line` element
   - `word`: `data-st-effect` on each `st-unit` within the word group (adjacent non-space units)
   - `glyph`: `data-st-effect` on each `st-unit` element (outer node — never conflicts with `st-glyph` reveal)
   - `range`: `data-st-effect` on `st-unit` elements within the specified `TextRange`

### One-shot effects (`core/effects/one-shot.ts`)

6. Implement one-shot effect application:
   - Set `data-st-effect="<name>"` and `data-st-effect-type="one-shot"` on scope element(s)
   - Listen for `animationend` on the target
   - On completion: remove effect attributes, fire cleanup callback
   - Guard: only respond to the expected animation name (prevents false triggers from nested animations)
7. Cue-triggered one-shots:
   - Time-triggered cues (`trigger: 'at-time'`): the timeline dispatches when `elapsed >= cue.atMs`
   - Completion cues (`trigger: 'on-complete'`): the timeline dispatches as part of the completion sequence, before `onrevealcomplete`
   - Each cue specifies `effect`, `scope`, `trigger`, and optional `range`
   - The effect engine applies the effect to the specified scope
   - Multiple cues can fire on the same frame (different scopes)

### CSS keyframes (`styles/story-text.scss`)

8. Port all 18 effect keyframes from `_narrative.scss`:

   **One-shot effects (6):**
   - `st-effect-shake`: horizontal jitter, decaying amplitude (500ms)
   - `st-effect-quake`: X+Y displacement, long settle (800ms)
   - `st-effect-jolt`: single sharp displacement, elastic snap (300ms)
   - `st-effect-glitch`: choppy offset + skew, steps(8) (600ms)
   - `st-effect-surge`: scale buildup + brightness overshoot (500ms)
   - `st-effect-warp`: scaleX oscillation + skew (600ms)

   **Continuous effects (12):**
   - `st-effect-drift`: vertical sine wave (3s)
   - `st-effect-flicker`: irregular opacity drops, steps(1) (2s)
   - `st-effect-breathe`: slow scale pulse (4s)
   - `st-effect-tremble`: fast micro-shake (100ms)
   - `st-effect-pulse`: heartbeat scale, sharp attack (1s)
   - `st-effect-whisper`: opacity + scale recede (3s)
   - `st-effect-fade`: pure opacity drift (5s)
   - `st-effect-freeze`: micro contraction + dim (5s)
   - `st-effect-burn`: vertical wobble + skew (1.5s)
   - `st-effect-static`: dual jitter + flicker (200ms + 2s)
   - `st-effect-distort`: rotation + asymmetric scale (3.5s)
   - `st-effect-sway`: horizontal sine wave (2.5s)

9. Physics variants for effects:
   ```scss
   // Glass: motion blur on displacement effects
   [data-physics='glass'] [data-st-effect='shake'],
   [data-physics='glass'] [data-st-effect='quake'],
   [data-physics='glass'] [data-st-effect='jolt'] {
     filter: blur(0.5px);
   }

   // Retro: stepped timing
   [data-physics='retro'] [data-st-effect='shake'] {
     animation-timing-function: steps(4);
   }
   // ... etc for all retro overrides
   ```

10. Per-unit continuous effect with phase offset (targets `st-unit` outer node — never conflicts with `st-glyph` reveal animation on the inner node):
    ```scss
    // Glyph-scope continuous: each unit at different phase in the cycle
    .st-unit[data-st-effect='drift'] {
      animation: st-effect-drift 3s ease-in-out infinite;
      animation-delay: calc(var(--st-phase, 0) * -3s);  // negative = offset within cycle
    }
    .st-unit[data-st-effect='tremble'] {
      animation: st-effect-tremble 100ms linear infinite;
      animation-delay: calc(var(--st-phase, 0) * -100ms);
    }
    ```

11. Reduced-motion: all effect animations are `none !important`.

### Integration with timeline

12. Add effect hooks to `RevealTimeline`:
    - Time-triggered cues: timeline calls `effectEngine.fireCue(cue)` when `elapsed >= cue.atMs`
    - Completion cues: timeline calls `effectEngine.fireCue(cue)` for all `trigger: 'on-complete'` cues as part of the completion sequence — BEFORE `onrevealcomplete` fires to the host (see `01-architecture.md` completion ordering)
    - Continuous effects can be set at any time via `activeEffect` prop change

### Scope escalation strategy

13. Not all effects need all scopes. Default implementation plan:

| Effect | block | line | glyph | Notes |
|--------|-------|------|-------|-------|
| drift | yes | yes | yes | Per-glyph drift is the premium showcase |
| flicker | yes | yes | yes | Per-glyph flicker = haunted text |
| breathe | yes | yes | no | Per-glyph scale looks jittery |
| tremble | yes | yes | yes | Per-glyph tremble = fear effect |
| pulse | yes | yes | no | Heartbeat needs unified scale |
| whisper | yes | yes | yes | Per-glyph fade = ghostly |
| fade | yes | yes | yes | Per-glyph fade = consciousness dissolve |
| freeze | yes | yes | no | Freeze needs unified contraction |
| burn | yes | yes | yes | Per-glyph wobble = heat shimmer |
| static | yes | yes | yes | Per-glyph jitter = digital noise |
| distort | yes | yes | no | Per-glyph rotation looks broken |
| sway | yes | yes | no | Sway needs unified lateral motion |
| shake | yes | line | no | Shaking individual glyphs lacks impact |
| quake | yes | no | no | Quake must be block-level |
| jolt | yes | no | no | Jolt must be block-level |
| glitch | yes | line | glyph | Per-glyph glitch = premium sci-fi |
| surge | yes | no | no | Surge needs unified scale |
| warp | yes | line | no | Warp at block/line only |

## Public APIs or types added or changed

- `StoryTextEffect` (existing — no change to names)
- `EffectScope` (existing — no change)
- `StoryCue` (existing — no change)

## Tests required

- All 18 effect names are supported
- Continuous effects play during reveal
- One-shot effects play on completion and at explicit cue times
- Seeded PRNG produces repeatable noise for effects
- Physics variants: glass blur, retro stepped timing
- Per-unit phase offsets produce organic staggered motion
- Effect scope application: block, line, glyph, range
- Effect cleanup: one-shot attributes removed after animationend
- Multiple simultaneous effects: continuous + one-shot on different scopes
- Reduced-motion: no animations, cue callbacks still fire

## Exit criteria

- All current narrative effect names are supported in premium form.
- Continuous and one-shot timing works independently from reveal mode.
- Effects replay identically for fixed seeds and inputs.
- Per-unit effects at glyph scope produce visibly richer results than block-scope equivalents.
- Physics variants match the existing glass/flat/retro tuning.

## Risks and rollback notes

- Risk: over-scoping every effect to glyph level and inflating DOM event listener count or animation cost.
  Rollback: keep block and line implementations as the default where they already achieve the intended result.
- Risk: `animationend` events from per-unit one-shot effects fire hundreds of times.
  Mitigation: for glyph-scope one-shots, listen on the container with event delegation, not on each unit.
- Risk: continuous effect + reveal animation CSS conflict.
  Resolution: **resolved by architecture**. Effects animate `st-unit` (outer node). Reveal animates `st-glyph` (inner node). Different DOM nodes cannot conflict on the CSS `animation` property. See `01-architecture.md` Animation Composition Model.
