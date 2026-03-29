# Phase 3 — Reveal Engine

## Goal

Replace timeout-driven reveal with a deterministic RAF timeline and rebuild all current reveal modes on top of the stable premium renderer. Add new premium reveal styles and stagger patterns.

## Inputs and dependencies

- Phase 2 layout and renderer
- Existing mode semantics from `src/types/kinetic.d.ts`
- Seed policy from [00-rules.md](./00-rules.md)

## In scope

- RAF timeline clock
- Seeded PRNG
- Reveal scheduling (mode + style + stagger)
- Pause, resume, seek model
- Grapheme-safe `decode`
- Mode parity for `char`, `word`, `sentence`, `sentence-pair`, `cycle`, and `decode`
- New reveal styles: `fade`, `rise`, `drop`, `scale`, `blur`
- New stagger patterns: `sequential`, `wave`, `cascade`, `random`
- Cursor positioning during reveal
- Physics-driven timing adjustments

## Out of scope

- Narrative effect parity (Phase 4)
- Conexus cue wiring (Phase 5)

## Decisions already locked

- One deterministic RAF clock drives reveal and cue timing.
- No code-unit slicing is allowed. All text operations are grapheme-safe.
- Current mode names remain available in premium form.
- Reveal timing is JS-driven; reveal visuals are CSS-driven.

## Implementation tasks

### Seeded PRNG (`core/timeline/prng.ts`)

1. Implement mulberry32 or equivalent deterministic PRNG:
   ```typescript
   function createPRNG(seed: number): () => number  // returns 0-1 float
   ```
2. All random behavior in the package routes through this PRNG.
3. Default seed when none provided: hash of `text + revealMode`.

### Stagger computation (`core/timeline/stagger.ts`)

4. Compute `--st-delay` per unit based on `StaggerPattern` and `CharPosition[]`:
   - `sequential`: `delay = globalIndex * stagger`
   - `wave`: `delay = globalIndex * stagger + sin(x / lineWidth * PI) * stagger * 3`
   - `cascade`: `delay = (charIndexInLine + lineIndex * charsPerLine * 0.3) * stagger`
   - `random`: `delay = seededShuffle(indices)[globalIndex] * stagger`
5. The `stagger` prop (default: 30ms) is the base delay between units.
6. Physics adjustment: retro adds ±30% seeded jitter to each unit's delay.

### RAF Timeline (`core/timeline/index.ts`)

7. Build the timeline state machine:
   ```typescript
   class RevealTimeline {
     constructor(renderer: CharacterRenderer, config: TimelineConfig)

     start(): void           // Begin RAF loop
     pause(): void           // Freeze at current progress
     resume(): void          // Continue from paused state
     seek(ms: number): void  // Jump to specific time (for TTS sync)
     skipToEnd(): void       // Reveal all immediately (reduced motion)
     abort(): void           // Stop and cleanup

     get progress(): number  // 0-1 normalized reveal progress
     get elapsed(): number   // Elapsed ms since start
     get isComplete(): boolean
     get isPaused(): boolean
   }
   ```
8. On each RAF tick:
   - Compute elapsed time since start (minus paused duration)
   - Determine which units should be revealed based on elapsed time and per-unit `--st-delay`
   - For each newly due unit: call `renderer.setGlyphState(index, 'revealing')` (sets `data-st-state` on the inner `st-glyph` node)
   - After the reveal CSS animation completes, state becomes `visible` (via `animationend` listener or a fallback timer matching `revealDuration`)
   - Update cursor position (move after last revealed unit)
   - Dispatch any time-triggered cues whose `atMs <= elapsed` (Phase 4 adds the effect engine, Phase 5 adds cue wiring)
   - If all units revealed, execute the completion sequence in this exact order:
     1. Fire all `trigger: 'on-complete'` cues (one-shot CSS animations begin)
     2. Set `aria-busy="false"` on semantic layer
     3. Remove cursor (if configured)
     4. Fire `onrevealcomplete` callback — all text visible, all cues dispatched, but completion-triggered one-shot effects may still be animating
     5. After the last completion-triggered one-shot's `animationend` fires (or immediately if none): fire `oneffectscomplete` — this is the safe unmount point

### Reveal modes

9. **`char` mode**: Timeline reveals one grapheme per stagger interval. Default stagger: 40ms. Cursor enabled by default.

10. **`word` mode**: Timeline reveals all graphemes in the next word group simultaneously, then pauses. "Word group" = adjacent non-space units. Stagger between words: `speed` prop. Inner-word chars can optionally stagger at `charSpeed` (default: 8ms) for the burst-stream effect.

11. **`sentence` mode**: Timeline reveals all graphemes in the next sentence simultaneously. Sentence boundaries detected by `.!?` followed by whitespace. Inner-sentence reveals at `charSpeed`.

12. **`sentence-pair` mode**: Same as sentence but groups two sentences per reveal burst.

13. **`decode` mode**: All units are visible from frame 0 (set `data-st-state="visible"` on all `st-glyph` nodes), but each glyph shows a scrambled character instead of the real one. The timeline progressively resolves units left-to-right. Unresolved units cycle through random characters from the decode charset (seeded PRNG). Characters per scramble pass: `scramblePasses` (default: 4). Physics: retro uses uppercase-only charset.
    - Implementation: the renderer sets `textContent` on each `st-glyph` node (inner wrapper) to the scrambled char, then to the real char on resolve.
    - No `hidden` → `revealing` transition for decode — glyphs are always visible, only their content changes.

14. **`cycle` mode**: Lightweight path (no Pretext). The visual layer shows a single text node (not per-grapheme spans). Rotates through `words[]` with `type`, `fade`, or `decode` transitions. Reuses timing logic from OSS `kinetic.ts` cycle sub-transitions but implemented on the premium timeline. Cursor optional.

### Reveal styles (CSS)

15. Add CSS animations in `styles/story-text.scss` for each `RevealStyle`. Animations target `st-glyph` (inner node), leaving `st-unit` (outer node) free for effect animations:
    ```scss
    // Reveal style selectors — target st-glyph, NOT st-unit
    [data-reveal-style='fade'] .st-glyph[data-st-state='revealing'] {
      animation: st-reveal-fade var(--st-reveal-duration, 300ms) var(--st-easing) both;
    }

    @keyframes st-reveal-fade {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes st-reveal-rise {
      from { opacity: 0; transform: translateY(0.3em); }
      to   { opacity: 1; transform: translateY(0); }
    }

    // ... drop, scale, blur keyframes
    ```
    The `st-glyph` hidden state uses `opacity: 0; visibility: hidden` so it reserves layout space but is invisible.
16. `instant` style: no animation, binary `opacity: 0 → 1` via state attribute change on `st-glyph`.
17. Physics easing via CSS selectors:
    ```scss
    [data-physics='glass'] .st-glyph[data-st-state='revealing'] {
      --st-easing: cubic-bezier(0.16, 1, 0.3, 1);
    }
    [data-physics='flat'] .st-glyph[data-st-state='revealing'] {
      --st-easing: ease-out;
    }
    [data-physics='retro'] .st-glyph[data-st-state='revealing'] {
      --st-easing: steps(4);
    }
    ```
18. Reduced-motion override: all animations are `none !important`, all units visible.

## Public APIs or types added or changed

- `RevealMode` (existing — no change)
- `RevealStyle` (new — added in Phase 1 types)
- `StaggerPattern` (new — added in Phase 1 types)
- `StoryTextProps` reveal-related fields: `revealStyle`, `staggerPattern`, `stagger`, `revealDuration`, `speed`, `charSpeed`, `scramblePasses`, `cursor`, `cursorChar`, `onrevealcomplete`, `oneffectscomplete`

## Tests required

- Deterministic playback: same seed + inputs → same reveal order and timing
- Parity coverage for all six reveal modes
- All five reveal styles render correctly (fade, rise, drop, scale, blur)
- All four stagger patterns produce expected delay distributions
- Reduced-motion full-text fallback (no animation, all visible)
- Long paragraph reveal without layout shift
- Decode mode: scrambled chars are seeded and repeatable
- Cycle mode: rotates correctly without Pretext
- Cursor tracks last revealed unit and is removed on completion
- Pause/resume preserves elapsed state
- Skip-to-end reveals all units and fires completion

## Exit criteria

- Every current reveal mode exists in premium form.
- New reveal styles and stagger patterns are functional.
- Playback is repeatable for the same seed and inputs.
- Layout remains stable while reveal progresses.
- Physics variants affect timing and easing as specified.
- Cursor works correctly across all modes.

## Risks and rollback notes

- Risk: mixing effect timing into the reveal scheduler too early.
  Rollback: keep the reveal scheduler independent and add effect hooks only after parity is proven.
- Risk: `animationend` unreliable for glyph state → visible transition.
  Mitigation: use a fallback timer matching `revealDuration` if `animationend` doesn't fire within 2x the expected duration.
- Risk: decode mode `textContent` updates cause reflow.
  Mitigation: batch updates within a single RAF frame; measure impact with Performance API.
