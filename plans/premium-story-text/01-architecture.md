# Premium Story Text Architecture

## Goal

Lock the final architecture for the premium `pretext` story text package before implementation expands beyond phase 1 scaffolding.

## Inputs and dependencies

- Rules in [00-rules.md](./00-rules.md)
- Existing OSS reveal and narrative behavior
- `@chenglou/pretext` layout primitives

## In scope

- Package shape
- Internal subsystem boundaries
- DOM structure
- Runtime flow
- Layout flow
- Font resolution
- Physics mapping
- Effect scopes
- Cue model
- Host adapter contract
- Conexus consumer contract
- Type taxonomy (RevealMode, RevealStyle, StaggerPattern)

## Out of scope

- Final motion tuning values
- Conexus-specific scene authoring UX
- Registry and publishing automation

## Decisions already locked

- `pretext` owns text geometry only.
- The premium package owns reveal timing, cues, accessibility, and effect playback.
- Host apps supply runtime style information through `TextStyleSnapshot`.
- Conexus consumes the package through a thin app wrapper, not through private imports into package internals.

## Package Shape

```text
packages/story-text-premium/
  src/
    adapters/
      void-energy-host.ts          Host adapter: resolves VE runtime state into TextStyleSnapshot
    core/
      effects/
        index.ts                   Effect registry and scope-aware playback controller
        continuous.ts              Continuous effect implementations (CSS attribute driver)
        one-shot.ts                One-shot effect implementations (cue-triggered, animationend cleanup)
      layout/
        index.ts                   PretextLayout: adapter around @chenglou/pretext
        cache.ts                   Layout cache keyed by text + snapshot + width
        graphemes.ts               Grapheme extraction aligned with Pretext segments
      render/
        index.ts                   CharacterRenderer: builds and manages the DOM tree
        collapse.ts                Post-reveal collapse to plain text (optional)
      timeline/
        index.ts                   RAF timeline: deterministic clock, reveal scheduler, cue dispatcher
        prng.ts                    Seeded PRNG (mulberry32)
        stagger.ts                 Stagger pattern computation (sequential, wave, cascade, random)
    styles/
      story-text.scss              Package-scoped styles (cursor, reveal transitions, effect keyframes)
    svelte/
      StoryText.svelte             Primary exported component
    index.ts                       Public exports
    types.ts                       All public and internal types
```

## Type Taxonomy

Three orthogonal concepts control how text appears:

### RevealMode — grouping order (WHAT units are revealed together)

```typescript
type RevealMode = 'char' | 'word' | 'sentence' | 'sentence-pair' | 'cycle' | 'decode';
```

- `char`: one grapheme at a time
- `word`: one word at a time (whitespace-delimited)
- `sentence`: one sentence at a time (punctuation-delimited)
- `sentence-pair`: two sentences at a time
- `cycle`: rotate through a word list (does NOT use Pretext — lightweight separate path)
- `decode`: all units visible from frame 0, scrambled characters resolve progressively

### RevealStyle — per-unit animation (HOW each unit appears)

```typescript
type RevealStyle = 'instant' | 'fade' | 'rise' | 'drop' | 'scale' | 'blur';
```

- `instant`: binary visibility flip (current OSS behavior)
- `fade`: opacity 0 → 1
- `rise`: translateY(0.3em) + opacity → 0, 0
- `drop`: translateY(-0.3em) + opacity → 0, 0
- `scale`: scale(0) + opacity → 1, 1
- `blur`: filter blur(4px) + opacity → 0, 0

Each style is a CSS transition on the **inner glyph wrapper** (`st-glyph`), triggered by `data-st-state` change. See [Animation Composition Model](#animation-composition-model) for why reveal and effects live on separate DOM nodes. Physics presets modify the easing function only:
- Glass: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth spring overshoot)
- Flat: `ease-out`
- Retro: `steps(4)`

### StaggerPattern — delay distribution (WHERE the reveal wave flows)

```typescript
type StaggerPattern = 'sequential' | 'wave' | 'cascade' | 'random';
```

- `sequential`: linear left-to-right, top-to-bottom (default)
- `wave`: sine-wave delay based on x-position within each line
- `cascade`: diagonal sweep (delay = charX + lineY * factor)
- `random`: seeded random order

The stagger pattern computes a `--st-delay` CSS variable per unit. The timeline uses this to schedule reveal timing.

## DOM Structure

```html
<span class="story-text-premium" data-story-text="premium"
      data-reveal-mode="char" data-reveal-style="fade" data-physics="glass" data-mode="dark">

  <!-- Visual layer: Pretext-driven fixed-line layout, aria-hidden -->
  <span class="st-visual" aria-hidden="true">
    <span class="st-line" data-st-line="0">
      <span class="st-unit" data-st-index="0" style="--st-phase: 0.0">
        <span class="st-glyph" data-st-state="hidden" style="--st-delay: 0ms">H</span>
      </span>
      <span class="st-unit" data-st-index="1" style="--st-phase: 0.05">
        <span class="st-glyph" data-st-state="hidden" style="--st-delay: 30ms">e</span>
      </span>
      <span class="st-unit" data-st-index="2" style="--st-phase: 0.1">
        <span class="st-glyph" data-st-state="revealing" style="--st-delay: 60ms">l</span>
      </span>
      <!-- ... -->
      <span class="st-unit st-space" data-st-index="5" style="--st-phase: 0.25">
        <span class="st-glyph" data-st-state="hidden" style="--st-delay: 150ms"> </span>
      </span>
    </span>
    <span class="st-line" data-st-line="1">
      <!-- next line of units -->
    </span>
    <span class="st-cursor" aria-hidden="true">▍</span>
  </span>

  <!-- Semantic layer: full text for a11y and copy, always complete -->
  <span class="st-semantic sr-only" aria-live="polite" aria-busy="true">
    Hello world, this is the full text from frame 0.
  </span>
</span>
```

Key structural decisions:

- **Fixed line containers** (`st-line`): Each line is a block-level span with known height from Pretext. Total container height is deterministic from frame 0 — no layout shift during reveal.
- **Nested unit structure** (`st-unit` > `st-glyph`): Two-node architecture solves the CSS animation composition problem. See [Animation Composition Model](#animation-composition-model).
- **Outer node** (`st-unit`): Owns effect animations (`data-st-effect`), phase offset (`--st-phase`), and spatial identity (`data-st-index`). Always inline, always visible.
- **Inner node** (`st-glyph`): Owns reveal state (`data-st-state`), reveal delay (`--st-delay`), and the text content. Transitions from `hidden` → `revealing` → `visible`.
- **Space units** (`st-space`): Whitespace graphemes get the `st-space` class for targeted styling (e.g., no scale effect on spaces).
- **Line height**: Each `st-line` has `line-height` matching `TextStyleSnapshot.lineHeight`. The container's `min-height` is `lineCount * lineHeight`.
- **Phase offset** (`--st-phase`): Normalized 0.0–1.0 per unit on `st-unit`, used by continuous effects for organic per-character phase shifts.

## Animation Composition Model

**Problem**: reveal animations and continuous effects must be able to run simultaneously on the same grapheme. CSS animations on the same element override each other — two `animation` declarations on one node will conflict, not compose.

**Solution**: nested wrappers with strict property ownership.

```
st-unit (outer)          → owns EFFECT animations (shake, drift, tremble, etc.)
  st-glyph (inner)       → owns REVEAL transitions (fade, rise, scale, etc.)
```

Each layer animates exclusively via its own CSS properties:

| Layer | CSS properties | Driven by |
|-------|---------------|-----------|
| `st-unit` (effect) | `animation` (keyframes for transform, opacity, filter) | `data-st-effect` attribute |
| `st-glyph` (reveal) | `animation` (keyframes for opacity, translate, scale, filter) | `data-st-state` attribute |

Because they are separate DOM nodes, there is no CSS `animation` property conflict. The visual result composes naturally — the inner node's reveal transform is visually nested inside the outer node's effect transform.

**DOM cost**: two spans per grapheme instead of one. For a 200-character paragraph, this is 400 spans. This is within browser comfort for CSS animations — each span only runs a single animation, and the compositor handles transform/opacity animations on the GPU.

**When effects are at block or line scope** (the common case), only the `st-visual` or `st-line` element gets the effect animation. Per-unit `st-unit` nodes carry no effect in this case — zero overhead from the nesting.

**Post-reveal collapse**: when reveal is complete AND all pending cues have been exhausted AND no `word`-scope, `glyph`-scope, or `range`-scope effect is active (continuous or pending one-shot), the renderer can optionally collapse the `st-unit` > `st-glyph` structure to plain text nodes within each `st-line`. Line containers remain — only unit-level nodes are collapsible. Collapse must never happen while any of these conditions hold:
- Pending cues target `glyph`, `word`, or `range` scopes
- An active continuous effect targets `glyph` or `word` scope
Both `word` and `glyph` scope effects are applied on `st-unit` nodes, so collapsing those nodes removes their DOM targets. Block-scope and line-scope cues/effects are safe for collapse because they target `st-visual` and `st-line` containers which are never collapsed. This is a performance optimization, not a requirement.

## Runtime Flow

1. Host app resolves a `TextStyleSnapshot` (via adapter or manually).
2. `StoryText` receives `text`, `styleSnapshot`, reveal configuration, effect state, and cues.
3. The layout subsystem waits for font readiness, then computes final line geometry from the full text.
4. The renderer builds fixed line containers and visual units from the final layout. All `st-glyph` nodes start as `data-st-state="hidden"`.
5. The semantic layer is populated with the **full text immediately** — it always contains the complete text from frame 0, regardless of reveal progress. `aria-busy="true"` signals that the visual representation is still animating. See [Semantic Layer Contract](#semantic-layer-contract).
6. The timeline starts: RAF clock ticks, reveal progress advances, `st-glyph` nodes transition `hidden` → `revealing` → `visible`.
7. Time-triggered cues (`trigger: 'at-time'`) fire as the timeline's elapsed time reaches each cue's `atMs`.
8. On reveal completion, the following sequence executes in this exact order:
   1. All `trigger: 'on-complete'` cues fire — their one-shot CSS animations **begin** playing.
   2. `aria-busy="false"` is set on the semantic layer.
   3. Cursor is removed (if `cursorRemoveOnComplete` is true).
   4. `onrevealcomplete` callback fires. This signals that all text is visible and all cues have been dispatched. However, one-shot effects triggered by completion cues may still be animating — their CSS animations finish asynchronously via `animationend`.
   5. `oneffectscomplete` callback fires after the last active one-shot effect's `animationend` (or immediately if no completion cues exist). **This** is the safe unmount point — all visual activity is finished.

   Hosts that do not use completion cues can safely unmount on `onrevealcomplete`. Hosts that use `trigger: 'on-complete'` cues and need effects to finish visually before unmounting must wait for `oneffectscomplete`.

## Semantic Layer Contract

The semantic layer (`st-semantic`) is the accessibility surface. Its rules are:

- **Always contains the full text** from frame 0. It does NOT update progressively during reveal.
- **`aria-live="polite"` + `aria-busy` interaction**: `aria-busy="true"` is set during reveal, which defers assistive tech announcement until busy clears. This is the **intended behavior** — the screen reader announces the full text once, after the visual reveal completes, rather than trying to read mid-animation. When `text` changes (new step), the new content is written and busy is set; when reveal finishes, busy clears and the announcement fires.
- **Visually hidden** via `sr-only` class (position: absolute, clip, etc.), but remains in the DOM for screen readers.

### Copy behavior

The visual layer has `user-select: none` to steer selection toward the semantic layer. However, `user-select: none` is not an absolute guarantee across all browsers — some allow selection of `none` content in certain edge cases. To ensure clean copy:

- The component intercepts the `copy` event on the root element.
- On copy: replace clipboard content with the semantic layer's plain text via `clipboardData.setData('text/plain', fullText)`.
- This guarantees users always get clean, unfragmented text regardless of what the browser selected.

### Text search (Ctrl+F)

`aria-hidden` does **not** prevent browser find-in-page from matching content. Both the visual layer's fragmented spans and the semantic layer's full text will match Ctrl+F queries. The visual layer match may produce odd highlighting across per-glyph spans. This is a known and accepted trade-off of per-character rendering — the fragmented highlighting is cosmetic, not functional. The semantic layer's match will also highlight (invisibly, since it's `sr-only`). No mitigation is needed here.

## Layout Flow

1. Wait for fonts: `document.fonts.ready` + `document.fonts.load(snapshot.font)`.
2. Resolve `TextStyleSnapshot` into a Pretext-compatible font string and numeric line height.
3. `prepareWithSegments(text, font)` → segments, widths, breakableWidths, kinds.
4. Measure container width (initial: from element; resize: from ResizeObserver).
5. `layoutWithLines(prepared, maxWidth, lineHeight)` → lines with start/end cursors.
6. Extract graphemes aligned with Pretext's `breakableWidths` using `Intl.Segmenter`.
7. Compute per-grapheme metadata: `{ char, x, lineIndex, charIndexInLine, globalIndex, width }`.
8. Cache by `text + font + lineHeight + width` key. Invalidate on any change.

## Invalidation Inputs

- `text`
- width (via ResizeObserver)
- `styleSnapshot.font`
- `styleSnapshot.lineHeight`
- `styleSnapshot.physics` (does not invalidate layout, only visual tuning)
- `styleSnapshot.mode` (does not invalidate layout, only visual tuning)
- `styleSnapshot.density` (may affect font-size → invalidates layout)
- `styleSnapshot.scale` (may affect font-size → invalidates layout)

## Font Resolution

The host adapter resolves CSS variables to a concrete font string for Pretext:

```typescript
function resolveFont(element: HTMLElement): string {
  const computed = getComputedStyle(element);
  const size = computed.fontSize;           // e.g., "16px"
  const family = computed.fontFamily;       // e.g., "Inter, sans-serif"
  return `${size} ${family}`;              // e.g., "16px Inter, sans-serif"
}
```

Important: `system-ui` causes measurement mismatches between Canvas and DOM on macOS. The host adapter should warn or resolve `system-ui` to a named font. Void Energy uses named fonts (`--font-body` resolves to Inter or equivalent), so this is safe for VE hosts.

## Physics Mapping

`TextStyleSnapshot.physics` drives visual tuning. The package does NOT read `document.documentElement.dataset.physics` — all physics info comes through the snapshot.

| Aspect | Glass | Flat | Retro |
|--------|-------|------|-------|
| Reveal easing | smooth spring `cubic-bezier(0.16, 1, 0.3, 1)` | `ease-out` | `steps(4)` |
| Reveal jitter | none | none | ±30% per-unit delay variance (seeded PRNG) |
| Decode charset | full alphanumeric + symbols | full | uppercase + digits only |
| Effect easing | smooth | smooth | stepped |
| Motion blur filter | `blur(0.5px)` on displacement effects | none | none |
| Cursor blink | smooth `ease-in-out` | `steps(2)` | `steps(1)` |

Physics is applied via CSS selectors on `[data-physics]` at the component root. The package's SCSS file handles all physics variants — no JS branching needed except for retro jitter (which uses the seeded PRNG in the timeline).

## Required CSS Variables in `TextStyleSnapshot.vars`

At minimum, the host adapter should forward these for physics-tuned animations:

```typescript
vars: {
  '--speed-fast': '...',          // reveal duration base
  '--speed-base': '...',          // effect duration base
  '--ease-spring-gentle': '...',  // glass easing
  '--ease-flow': '...',           // general easing
  '--energy-primary': '...',      // cursor color, energy highlights
  '--delay-cascade': '...',       // stagger base from physics
  '--text-main': '...',           // cursor color fallback
}
```

The package reads these from `vars` and applies them as inline CSS variables on the root element. This keeps the package decoupled from any specific token system.

## Effect Scopes

- `block`: entire `StoryText` container
- `line`: individual `st-line` containers
- `word`: word-grouped units (adjacent non-space `st-unit` spans)
- `glyph`: individual `st-unit` spans
- `range`: arbitrary `TextRange` (start/end character indices)

Continuous effects default to `block` scope. One-shot cued effects support any scope.

Scope escalation is allowed in the effect registry: an effect can implement multiple scopes and the consumer picks. Not all effects need all scopes — `drift` at `glyph` scope is valid (each char drifts independently with phase offset), but `shake` at `glyph` scope may look wrong (individual char shake lacks visual impact).

## Cue Model

`StoryCue` is the single timed event model for one-shot effect playback.

```typescript
interface StoryCue {
  id: string;
  effect: StoryTextEffect;
  scope: EffectScope;
  trigger: 'at-time' | 'on-complete';  // when to fire
  atMs?: number;       // required when trigger is 'at-time'; milliseconds from reveal start
  range?: TextRange;   // for 'range' scope
  seed?: number;       // per-cue seed override (defaults to component seed + cue index)
  durationMs?: number; // override default effect duration
}
```

Field rules:
- `trigger: 'at-time'` requires `atMs` (a finite number). Fires when the timeline's elapsed time reaches `atMs`.
- `trigger: 'on-complete'` fires when reveal finishes. `atMs` is ignored if provided.
- `atMs: 0` with `trigger: 'at-time'` fires at reveal start.
- **No `Infinity` sentinel.** `Infinity` does not survive JSON serialization, so cues that should fire on completion use `trigger: 'on-complete'` instead.

Cues are sorted by `atMs` (time-triggered first, ascending) then completion-triggered. The timeline dispatches them in order as playback progresses. Each cue fires at most once (tracked by `id`).

## Cycle Mode

Cycle mode (`RevealMode: 'cycle'`) is fully rebuilt on the premium timeline and component, but does not use Pretext's paragraph layout engine — because there is no paragraph to lay out. Rotating single words does not benefit from line-break computation or per-grapheme positioning.

- **Rebuilt on premium timeline**: uses the same deterministic RAF clock, seeded PRNG, physics-tuned timing, and `StoryText` component shell as all other modes.
- **No Pretext layout**: no `prepareWithSegments`, no `layoutWithLines`, no `st-line` containers, no per-grapheme `st-unit` spans.
- **Rendering**: the visual layer shows a single text node (or per-char spans for decode transition). Rotates through `words[]` with `type`, `fade`, or `decode` sub-transitions.
- **Same contract**: same props, same accessibility layer, same data attributes, same host adapter.
- **Rationale**: Pretext solves paragraph geometry. Cycle mode has no paragraph — just short words appearing one at a time. Adding Pretext here would be complexity without benefit.

## Host Adapter Contract

The premium package does not read `document.documentElement.dataset.*` directly. Host apps convert their runtime state into `TextStyleSnapshot` and pass it via props.

The Void Energy host adapter reads:
- `data-physics`, `data-mode` from `<html>` element
- Computed font and line-height from the target element
- `density` and `scale` from VoidEngine user config
- Relevant CSS variable values from computed styles

Other host apps (non-VE) can construct `TextStyleSnapshot` manually.

## Conexus Consumer Contract

Conexus owns:
- story step orchestration
- TTS timing and cue authoring
- story seeds
- atmosphere-specific reveal/effect presets
- the `ConexusStoryText` wrapper component

The premium package owns:
- rendering
- reveal timing
- effect playback
- layout invalidation
- accessibility behavior

## Migration Mapping

The current OSS contract is preserved conceptually:

| OSS | Premium |
|-----|---------|
| `mode: 'char'` | `revealMode: 'char'` |
| `mode: 'word', chunk: 'word'` | `revealMode: 'word'` |
| `mode: 'word', chunk: 'sentence'` | `revealMode: 'sentence'` |
| `mode: 'word', chunk: 'sentence-pair'` | `revealMode: 'sentence-pair'` |
| `mode: 'cycle'` | `revealMode: 'cycle'` |
| `mode: 'decode'` | `revealMode: 'decode'` |
| (no equivalent) | `revealStyle: 'fade' / 'rise' / 'drop' / 'scale' / 'blur'` |
| (no equivalent) | `staggerPattern: 'wave' / 'cascade' / 'random'` |
| `data-narrative="shake"` | `activeEffect: 'shake'` |
| `onComplete` | `onrevealcomplete` |

Current narrative effect names carry over unchanged into `StoryTextEffect`.
