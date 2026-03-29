# Phase 2 — Layout and Renderer

## Goal

Build the `pretext` layout adapter, stable final-layout pipeline, and renderer foundation that makes the entire text layout deterministic from frame 0 — before any reveal animation begins.

## Inputs and dependencies

- Phase 1 package scaffold and contracts
- `@chenglou/pretext` (`prepareWithSegments`, `layoutWithLines`)
- Font and line-height inputs from `TextStyleSnapshot`
- DOM structure defined in [01-architecture.md](./01-architecture.md)

## In scope

- `pretext` adapter (PretextLayout class)
- Layout cache and invalidation
- Grapheme segmentation aligned with Pretext segments
- Fixed line container rendering
- Visual and semantic layer split
- Resize handling via ResizeObserver
- Font readiness handling

## Out of scope

- Reveal mode timing (Phase 3)
- Narrative effect parity (Phase 4)
- TTS cue playback (Phase 5)

## Decisions already locked

- The full final text is measured before reveal begins.
- The visual layer is separate from the semantic accessibility layer.
- Layout invalidation is host-driven through `TextStyleSnapshot`.
- Line containers are block-level with fixed height from Pretext.
- Units are inline within lines — browser handles sub-line flow.

## Implementation tasks

### Layout subsystem (`core/layout/`)

1. Build `PretextLayout` class wrapping `@chenglou/pretext`:
   ```typescript
   class PretextLayout {
     // Wait for font readiness, then prepare text
     async prepare(text: string, font: string): Promise<PreparedTextWithSegments>

     // Compute layout at a given width
     layout(prepared: PreparedTextWithSegments, maxWidth: number, lineHeight: number): LayoutLinesResult

     // Clear cached preparations when text or font changes
     invalidate(): void
   }
   ```
2. Build grapheme extraction (`graphemes.ts`):
   - Walk Pretext's `segments[]` and `breakableWidths[]` arrays
   - For each multi-grapheme segment, use `Intl.Segmenter('grapheme')` to get individual grapheme strings
   - Align grapheme strings with `breakableWidths[segmentIndex]` widths
   - For single-grapheme segments and non-word segments (spaces, tabs), use `segments[i]` and `widths[i]`
   - Output: `GraphemeInfo[]` where each entry has: `{ char, segmentIndex, graphemeIndex, width }`
3. Build position computation:
   - Walk `layoutWithLines` result + `GraphemeInfo[]`
   - Compute per-grapheme: `{ char, x, lineIndex, charIndexInLine, globalIndex, width }`
   - The `x` is accumulated from widths within each line
   - The `lineIndex` determines which `st-line` container the grapheme belongs to
4. Build layout cache (`cache.ts`):
   - Cache key: `text + font + lineHeight + width` (string hash)
   - Store: prepared text + layout result + grapheme positions
   - Invalidate when any key input changes
5. Font readiness:
   - Before first `prepare()`: await `document.fonts.ready`
   - Call `document.fonts.load(font)` to trigger font fetch if not yet loaded
   - Re-prepare if font loading changes metrics (rare but possible)

### Renderer subsystem (`core/render/`)

6. Build `CharacterRenderer` class:
   ```typescript
   class CharacterRenderer {
     constructor(container: HTMLElement, positions: CharPosition[], options: RenderOptions)

     // Build the full DOM tree: st-visual > st-line > st-unit > st-glyph, plus st-semantic
     render(): void

     // Get the outer (effect) span at a global character index
     getUnit(index: number): HTMLSpanElement | null

     // Get the inner (reveal) span at a global character index
     getGlyph(index: number): HTMLSpanElement | null

     // Get all units in a line
     getLine(lineIndex: number): HTMLSpanElement[]

     // Get all units in a word group (adjacent non-space units)
     getWordGroup(unitIndex: number): HTMLSpanElement[]

     // Set reveal state on a glyph (inner node): 'hidden' | 'revealing' | 'visible'
     setGlyphState(index: number, state: UnitState): void

     // Set reveal state on a range of glyphs
     setGlyphRangeState(start: number, end: number, state: UnitState): void

     // Set effect attribute on a unit (outer node)
     setUnitEffect(index: number, effect: string | null): void

     // Collapse visual layer to plain text (post-reveal optimization)
     collapse(): void

     // Total unit count
     get length(): number

     // Cleanup
     destroy(): void
   }
   ```
7. DOM construction rules (nested wrapper model — see `01-architecture.md` Animation Composition Model):
   - Create `st-visual` container with `aria-hidden="true"` and `user-select: none`
   - Create one `st-line` per Pretext line, with `display: block` and `height: lineHeight`
   - Create two nodes per grapheme:
     - `st-unit` (outer): inline, `data-st-index` (global), `--st-phase` — effect animation target
     - `st-glyph` (inner): inline, `data-st-state="hidden"`, `--st-delay` — reveal animation target, holds text content
   - Mark whitespace units with `st-space` class on `st-unit`
   - Create `st-semantic` with full text content, `aria-live="polite"`, `aria-busy="true"`, `sr-only` class
   - Set container `min-height: lineCount * lineHeight` to prevent layout shift
8. Resize handling:
   - Attach `ResizeObserver` to the component container
   - On width change: re-run `layoutWithLines` with new width (Pretext — no DOM reflow)
   - Re-distribute graphemes across line containers if line breaks changed
   - Preserve unit states during re-layout (a revealed char stays revealed)

### Integration with StoryText.svelte

9. Wire `PretextLayout` + `CharacterRenderer` into `StoryText.svelte`:
   - On mount: prepare text, measure container width, compute layout, render DOM
   - On text/snapshot change: invalidate, re-prepare, re-render
   - On resize: re-layout, re-distribute
   - For now: all units start `hidden` and stay `hidden` (Phase 3 drives reveal)

## Public APIs or types added or changed

- Internal layout result types only, unless phase work proves a public contract is missing
- `GraphemeInfo`, `CharPosition`, `UnitState` (internal types)
- `RenderOptions` (internal type for renderer configuration)

## Tests required

- Stable final height during reveal: container height matches `lineCount * lineHeight` from frame 0
- Stable line breaks during reveal: graphemes don't shift between lines
- Width invalidation: narrower width produces more lines
- Font and line-height invalidation: different font produces different layout
- Mixed script coverage: emoji, ZWJ sequences, Arabic RTL, CJK
- Grapheme alignment: `Intl.Segmenter` graphemes match Pretext `breakableWidths` array lengths
- Semantic layer: contains full text, updates during reveal, coherent for screen readers
- Resize: re-layout preserves revealed state
- Reduced-motion: all units immediately visible, no layout shift

## Exit criteria

- Final line wrapping no longer shifts during reveal.
- Layout recomputes correctly when host style inputs change.
- Accessibility behavior is documented and verified.
- The renderer produces the DOM structure defined in [01-architecture.md](./01-architecture.md).
- Grapheme extraction handles all test scripts correctly.
- ResizeObserver-driven re-layout works without visual glitch.

## Risks and rollback notes

- Risk: Pretext line breaks don't match browser rendering for certain fonts/sizes.
  Mitigation: validate with accuracy tests across Chrome, Safari, Firefox. Fall back to sequential stagger if mismatch detected.
- Risk: `system-ui` font causes Canvas/DOM measurement mismatch.
  Mitigation: host adapter warns on `system-ui`; VE uses named fonts.
- Risk: tying layout caching to DOM state instead of explicit snapshot inputs.
  Rollback: keep the adapter internal and replace cache keys before moving to Phase 3.
