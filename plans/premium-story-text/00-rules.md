# Premium Story Text Rules

## Goal

Define the hard implementation rules for the premium `pretext` story text package so the package remains extractable, deterministic, and independent from the OSS kinetic runtime.

## Inputs and dependencies

- Existing OSS behavior in `src/actions/kinetic.ts`, `src/actions/narrative.ts`, and `src/components/ui/KineticText.svelte`
- Current theme/runtime contracts in `src/config/design-tokens.ts`
- Upstream `@chenglou/pretext` package

## In scope

- Dependency direction
- Allowed and forbidden imports
- Naming rules
- Deterministic animation rules
- Animation implementation rules (CSS vs JS boundary)
- Accessibility rules
- Reduced-motion rules
- Phase-gate policy

## Out of scope

- Concrete renderer implementation
- Conexus story orchestration details
- Private package publishing automation

## Decisions already locked

- The premium package lives under `packages/story-text-premium` until extraction.
- The package exports `StoryText` as the primary component.
- The package is generic for premium users; Conexus adds app-specific wrappers on top.
- The OSS kinetic stack remains the public baseline and is not rewritten in place.

## Implementation tasks

1. Keep the import direction one-way:
   `void-energy` public core -> premium package consumer
   `void-energy-premium/story-text` may depend on public core inputs
   public core must never import premium
2. Restrict the premium package to these dependency categories:
   - `svelte`
   - browser APIs (`Intl.Segmenter`, `OffscreenCanvas`, `ResizeObserver`, `document.fonts`)
   - `@chenglou/pretext`
   - private package-local utilities and styles
3. Forbid direct imports from this repo's internal runtime paths:
   - `src/actions/*`
   - `src/components/*`
   - `src/styles/components/*`
   - `src/lib/*`
   - `src/stores/*`
   - `src/adapters/void-engine.svelte.ts`
4. Keep all host-specific values flowing through `TextStyleSnapshot`, props, and adapter functions only.
5. Keep all app-specific orchestration flowing through host wrappers only.

## Public APIs or types added or changed

- `TextStyleSnapshot`
- `StoryCue`
- `RevealMode`
- `RevealStyle`
- `StaggerPattern`
- `StoryTextEffect`
- `EffectScope`
- `StoryTextProps`

## Tests required

- Import boundary audit: no premium file imports app-local `src/` runtime modules
- Determinism audit: no reveal or effect path uses unseeded `Math.random()` directly
- Reduced-motion audit: full-text fallback exists without visual breakage
- Accessibility audit: semantic text remains coherent when the visual layer splits into many nodes

## Exit criteria

- Every implementation phase references these rules and stays inside them.
- The package can be moved to another repo without architectural edits.
- The allowed and forbidden dependency directions are documented and unambiguous.

## Risks and rollback notes

- The main risk is accidental coupling to `voidEngine`, current SCSS partials, or Conexus stores.
- If that coupling happens, stop the phase and move the leaked concern behind a host adapter before continuing.

## Dependency Direction

```text
public void-energy -> consumed by premium hosts
premium story-text -> may depend on public contracts only
conexus -> consumes public core + premium story-text
```

## Naming Rules

- Package path: `packages/story-text-premium`
- Package name: `@dgrslabs/void-energy-story-text`
- Primary component: `StoryText`
- Conexus wrapper name: `ConexusStoryText`
- Host adapter file: `src/adapters/void-energy-host.ts`
- CSS class namespace: `st-` (e.g., `st-visual`, `st-line`, `st-unit`, `st-semantic`)
- Data attribute namespace: `data-st-` for package-internal state (e.g., `data-st-state`, `data-st-line`)
- Public data attribute: `data-story-text="premium"` for external targeting

## Deterministic Animation Rules

- Use one RAF-driven clock per mounted `StoryText` instance.
- The clock's time source is `performance.now()` via `requestAnimationFrame`. This is the playback clock, not a randomness source.
- Seed all random behavior (decode charset selection, jitter variance, phase offsets) from stable inputs such as story id, step id, cue id, and explicit `seed`.
- Seeded PRNG: use a simple mulberry32 or similar deterministic RNG seeded from the `seed` prop. Never use `Math.random()` directly.
- Replay for the same text, width, style snapshot, cues, and seed must produce identical reveal ordering and effect behavior.

## Animation Implementation Rules (CSS vs JS boundary)

The package uses a hybrid CSS/JS model with strict property ownership across two DOM layers:

- **Nested wrapper model**: each grapheme has two nodes — `st-unit` (outer, effect layer) and `st-glyph` (inner, reveal layer). This prevents CSS `animation` property conflicts when reveal and effects run simultaneously on the same grapheme. See `01-architecture.md` Animation Composition Model for details.
- **Reveal timing** is JS-driven. The RAF timeline controls WHEN each `st-glyph` transitions from `hidden` to `revealing`. The timeline owns all scheduling decisions.
- **Reveal visuals** are CSS-driven on `st-glyph`. When `data-st-state` changes to `revealing`, a CSS animation handles the visual transition (fade, rise, scale, blur). Physics variants are pure CSS selectors on `[data-physics]` at the component root.
- **Effect animations** are CSS-driven on `st-unit` (for glyph-scope effects) or on `st-line`/`st-visual` (for line/block-scope effects). Applied via `data-st-effect` attribute.
- **Continuous effects** loop via CSS `animation: infinite`. Per-unit phase offsets use `--st-phase` CSS variable on `st-unit`, set once during render.
- **One-shot effects** are JS-triggered (timeline dispatches `trigger: 'at-time'` cues at their `atMs`, and `trigger: 'on-complete'` cues during the completion sequence), CSS-animated (keyframe plays on attribute set), JS-cleaned (removed on `animationend`).
- **No animation property conflict**: because reveal and effects live on different DOM nodes, they never compete for the same element's `animation` CSS property.
- **Rationale**: JS owns timing for determinism and TTS sync. CSS owns visuals for physics adaptation, GPU compositing, and separation of concerns. Nested wrappers guarantee composability.

## Accessibility Rules

- The visual renderer (`st-visual` and all children) must be `aria-hidden="true"` and `user-select: none`.
- A semantic plain-text layer (`st-semantic`) must remain available for screen readers with `aria-live="polite"`.
- The semantic layer always contains the **full text from frame 0**. It does NOT update progressively during reveal.
- `aria-busy="true"` on the semantic layer during reveal. This defers `aria-live` announcement until busy clears — the screen reader announces the full text **once**, after reveal completes. This is intentional.
- Copy: the visual layer has `user-select: none`. The component intercepts the `copy` event and replaces clipboard content with the semantic layer's plain text via `clipboardData.setData`. This guarantees clean copy regardless of browser `user-select` edge cases.
- Text search (Ctrl+F): `aria-hidden` does NOT prevent find-in-page matching. Both visual and semantic layers will match. Fragmented highlighting on the visual layer's per-glyph spans is a known, accepted cosmetic trade-off.
- Tab order: `StoryText` is not interactive by default. No `tabindex` unless the host explicitly makes it focusable.

## Reduced-Motion Rules

- `prefers-reduced-motion` must be supported in `auto` mode (reads media query).
- The `reducedMotion` prop supports `'auto' | 'always' | 'never'` to allow host override.
- Reduced-motion mode skips all visual animation: all units are immediately `visible`, no reveal stagger, no effect keyframes.
- Content is never skipped. Reduced-motion shows the complete final text instantly.
- One-shot cue semantics still resolve cleanly: cue callbacks fire, `onrevealcomplete` fires, and `oneffectscomplete` fires immediately after (since no CSS animations play, there is nothing to wait for). The full completion sequence runs synchronously.

## Cursor Rules

- Cursor is supported via an optional `cursor` prop (default: `false`).
- When enabled, a `<span class="st-cursor">` is appended after the last revealed unit.
- Cursor character is configurable via `cursorChar` prop (default: `'▍'`).
- Cursor is removed on reveal completion unless the host explicitly keeps it.
- Cursor blink is CSS-driven with physics variants (glass smooth, flat stepped, retro hard on/off).
- Cursor is `aria-hidden="true"`.

## Phase-Gate Policy

- No phase starts until the previous phase exit criteria are met.
- No feature parity claim is valid until the matching phase test plan is complete.
- If a phase discovers a contract gap, update `01-architecture.md` first, then resume implementation.
