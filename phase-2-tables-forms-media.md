# Phase 2: Tables, Form Enhancements & Media Elements

## Context

You are working on the Void Energy UI system — Svelte 5 / Astro / TypeScript with a physics-based design engine (glass/flat/retro modes), 12 themes, density scaling. Tailwind for layout, SCSS for visual styling.

**Phase 1 has been completed.** Text-level semantics, block content, and list elements now have full base styling. This phase adds base styling for tables, form element enhancements, and media elements.

## Critical: Read Before Writing

**BEFORE writing any SCSS**, read these files completely:

1. `src/styles/base/_typography.scss` — See how Phase 1 additions were structured. Match conventions.
2. `src/styles/components/_inputs.scss` — Understand existing form element styling (text inputs, select, textarea, checkbox, radio, toggle). Understand how `:user-invalid` is used (recently changed from `:invalid`). Understand `accent-color` usage on checkbox/radio.
3. `src/styles/components/_buttons.scss` — Understand physics-aware styling patterns on interactive elements.
4. `src/styles/abstracts/_engine.scss` — Physics engine, CSS custom properties available.
5. `src/styles/abstracts/_mixins.scss` — ALL available mixins. Use them. Don't reinvent.
6. `src/styles/base/_reset.scss` — What's already normalized for form/table/media elements.
7. `src/config/design-tokens.ts` — Available spacing, color, typography, radius tokens.
8. `src/styles/base/_accessibility.scss` — Understand focus ring patterns, reduced-motion handling.

**Also read any changes from Phase 1** — check what was added to `_typography.scss` or any new base partials. Understand the patterns established there and be consistent.

---

## Subagent 1: Base Table Styling

This is **base SCSS** for native `<table>` elements — NOT the Table Svelte component (that comes later). When someone writes a raw HTML table, it should look designed.

### Placement decision:
- Check if there's an existing `_tables.scss` in `src/styles/components/` or `src/styles/base/`
- If not, create `src/styles/base/_tables.scss` (since this is base element styling, not a component) and import in `global.scss` in the base layer section
- If the codebase convention is to put all element styling in one file, add to the appropriate existing file

### Table structure to style:

**`<table>`**
- `width: 100%` (tables should fill their container by default)
- `border-collapse: separate; border-spacing: 0;` — separate allows border-radius on cells if needed, spacing 0 gives clean edges
- `text-align: start` (logical property, RTL-ready)
- `font-variant-numeric: tabular-nums` — aligns numbers in columns

**`<caption>`**
- `caption-side: top` (or bottom — check system convention, top is more accessible)
- `font-size`: one step down from body
- `color: var(--text-mute)`
- `padding-block-end`: small spacing token
- `text-align: start`

**`<thead>`**
- Bottom border: visible, using `--color-border` or `--energy-secondary` token
- Background: subtle — `--surface-secondary` or transparent depending on physics mode

**`<th>`**
- `font-weight`: semi-bold token
- `color: var(--text-dim)` or `--text-mute`
- `text-align: start` (NOT center — left-align headers for readability, numbers right-align)
- `padding`: density-aware via `calc()` with `--density`
- `scope` handling: no SCSS needed, but note this is semantically important
- `white-space: nowrap` — headers shouldn't wrap (optional, might depend on use case)
- `text-transform: uppercase; font-size: 0.85em; letter-spacing: 0.05em;` — ONLY if the system's design language favors uppercase table headers. Read existing heading/label conventions first. Skip if the system doesn't use uppercase anywhere else.
- Bottom border to separate header from body

**`<td>`**
- `padding`: same density-aware value as `<th>`
- `color: var(--text-main)`
- Vertical alignment: `vertical-align: top` (or `middle` — pick one, be consistent)

**`<tr>`**
- Row borders: `border-bottom: 1px solid var(--color-border)` (subtle horizontal rules between rows)
- Last row: no bottom border (`tr:last-child { border-bottom: none }` or `tbody tr:last-child td { border-bottom: none }`)

**`<tbody>`**
- Optional striped rows: `tr:nth-child(even) { background: var(--surface-secondary) }` — BUT: this should be a class-based opt-in (`.table-striped`) rather than the default, because stripes conflict with some physics modes

**`<tfoot>`**
- Top border (separating from body)
- Optionally bold or semi-bold text
- Same padding as `<th>`

### Physics differentiation:

- **Glass**: 
  - Subtle glass-sunk inset on the table container (or just on thead)
  - Row borders using low-opacity energy color
  - Hover row: subtle glow or brightness shift (behind `@media (hover: hover)`)
  - Header: slight glass-float or differentiated surface
  
- **Flat**:
  - Clean minimal borders
  - No background effects
  - Hover row: `--surface-secondary` background
  - Header: solid bottom border, clear separation
  
- **Retro**:
  - Visible grid borders (not just horizontal rules — full cell borders)
  - Thicker borders, possibly double-line
  - Header: heavy bottom border or inverted colors
  - Hover row: highlight color

### Responsive wrapper utility:

Create a utility class `.table-responsive` (or `.table-scroll` — check system naming convention):
```scss
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  // Optional: scrollbar styling for the overflow container
  // Use existing scrollbar patterns if they were added in Phase 1 globals
}
```

This wraps a table to enable horizontal scrolling on narrow viewports. The Table Svelte component will use this internally, but it's also available as a standalone utility.

### Verification:
- A raw `<table>` with `<thead>`, `<tbody>`, `<th>`, `<td>` should look clean and professional
- Numbers should align in columns (`tabular-nums`)
- Table should look distinct across glass, flat, and retro modes
- Table should scroll horizontally when wrapped in `.table-responsive` on narrow viewports
- Density changes should affect cell padding proportionally

---

## Subagent 2: Form Element Enhancements

These enhance native form elements that currently have minimal or no physics-aware styling. **Read `_inputs.scss` fully first** — understand everything that already exists. Do not duplicate or conflict.

### Placement:
Add to existing `src/styles/components/_inputs.scss` unless it's already very large. If over ~300 lines, consider a new `_form-elements.scss` partial in the same directory.

### Elements to enhance:

**Checkbox — physics enhancement (currently `accent-color` only)**
- Keep `appearance: auto` (preserve native accessibility — this is the system's native-first philosophy)
- Add subtle physics differentiation:
  - Glass: `filter: drop-shadow(0 0 3px var(--energy-primary))` on `:checked` state. Gives a glow effect while keeping native rendering.
  - Flat: no additional treatment needed (accent-color handles it)
  - Retro: slightly larger via `transform: scale(1.15)` or `width`/`height` override. Retro likes chunkier controls.
- `:focus-visible` ring: should match the system's existing focus ring pattern (read `_accessibility.scss`)
- Density scaling: `width` and `height` using `calc()` with `--density` (native checkboxes respect width/height)
- Transition on the `filter` and `transform`: respect `prefers-reduced-motion`
- Gate all hover effects behind `@media (hover: hover)`

**Radio — same approach as checkbox**
- Same physics enhancement strategy
- Glass: glow on `:checked`
- Flat: accent-color suffices
- Retro: slightly scaled up
- All the same focus/density/motion rules

**`<fieldset>`**
- `border: 1px solid var(--color-border)`
- `border-radius` using the system's radius token (probably `--radius-md` or similar)
- `padding` using spacing tokens, density-aware
- `margin-block-end`: spacing between fieldsets
- Physics:
  - Glass: `glass-sunk` inset effect or subtle background
  - Flat: simple border
  - Retro: `border-style: double` or thick border
- `min-inline-size: 0` — fix browser default that can cause overflow issues
- Important: fieldset styling should work correctly when used inside the FormField component

**`<legend>`**
- `font-weight`: semi-bold token
- `font-size`: slightly larger than body or same size (read heading conventions)
- `color: var(--text-dim)`
- Positioning: the classic "legend breaking the fieldset border" technique:
  - `padding-inline: [small spacing token]` (gives space around text within the border gap)
  - `margin-inline-start: [spacing token]` (offset from left edge)
  - Browser handles the border-breaking natively — just ensure padding looks right
- Physics: inherit from context, minimal special treatment

**`<progress>`**
- Remove native appearance: `appearance: none; -webkit-appearance: none;`
- Dimensions: `width: 100%; height: [density-scaled, ~8px base]`
- Border-radius: `--radius-full` (pill shape)
- Track (background): `--surface-secondary` or `--surface-tertiary`
- Fill (value bar): `--energy-primary`
- WebKit pseudo-elements:
  ```scss
  ::-webkit-progress-bar { background: var(--surface-secondary); border-radius: var(--radius-full); }
  ::-webkit-progress-value { background: var(--energy-primary); border-radius: var(--radius-full); transition: width var(--duration-normal) var(--ease-out); }
  ```
- Firefox:
  ```scss
  ::-moz-progress-bar { background: var(--energy-primary); border-radius: var(--radius-full); }
  ```
- Physics:
  - Glass: glow on the fill bar (`box-shadow` or `filter`), track has glass-sunk treatment
  - Flat: solid colors, clean edges
  - Retro: segmented appearance — if achievable via `background: repeating-linear-gradient()` on the fill, use it. Otherwise, solid is fine.
- Indeterminate state: `progress:indeterminate` — use a CSS animation. Sliding gradient or bouncing highlight. Respect `prefers-reduced-motion`.
- Color variants: consider whether error/warning/success states are needed. If so, use a modifier class (`.progress-success`, `.progress-warning`, `.progress-error`) with corresponding semantic tokens. Don't over-build — only add if it's zero additional complexity.

**`<meter>`**
- Similar approach to `<progress>` but with segment coloring
- Remove native appearance
- Three value ranges:
  - Optimum: `--color-success` (green)
  - Suboptimum: `--color-warning` (yellow/amber)
  - Sub-suboptimum / danger: `--color-error` (red)
- WebKit pseudo-elements:
  ```scss
  ::-webkit-meter-bar { background: var(--surface-secondary); border-radius: var(--radius-full); }
  ::-webkit-meter-optimum-value { background: var(--color-success); }
  ::-webkit-meter-suboptimum-value { background: var(--color-warning); }
  ::-webkit-meter-even-less-good-value { background: var(--color-error); }
  ```
- Firefox: `appearance: none` + custom styling (Firefox meter support via pseudo-elements is limited — may need a different approach. Check current browser support and do the best possible.)
- Physics: same strategy as progress (glow for glass, solid for flat, segmented for retro)
- Dimensions and border-radius: same as progress (consistency)

**`<output>`**
- `font-variant-numeric: tabular-nums` (for numeric output alignment)
- `font-family`: monospace token (if the output is typically code/numbers) OR inherit (if it's typically prose). Decide based on common use cases — monospace is safer.
- Subtle background: `--surface-secondary`
- Padding: small, density-aware
- Border-radius: small token
- `display: inline-block` (so padding/background works on inline element)
- Minimal physics treatment — this is a data display element, not a widget

**Native `<select>` base styling check**
- The Selector.svelte component wraps `<select>`. But does a BARE `<select>` (without the wrapper) look acceptable?
- Read `_inputs.scss` to see if there's a base `select` rule or if styling is only applied via a wrapper class
- If bare `<select>` inherits the general input styling (border, padding, focus ring), it's fine
- If bare `<select>` looks like browser default, add base rules to match the input styling
- The custom dropdown arrow: if it's only in the Svelte component, consider adding it to base `<select>` too via `background-image` with an SVG data-URI

### Verification:
- Checkboxes and radios should have subtle visual differences across glass, flat, retro
- `<fieldset>` with `<legend>` should look correct with the legend breaking the border
- `<progress>` determinate and indeterminate states should both look designed
- `<meter>` should change color based on its value relative to min/max/low/high/optimum attributes
- `<output>` should be visually distinguishable from regular text
- All new styles must work alongside existing input/button styles without conflicts
- Run `npm run scan` to verify no token violations

---

## Subagent 3: Media Element Defaults & Interactive Element Base

### Media elements — base CSS rules (not components):

**Placement:** These go in `_reset.scss` or a new `_media.scss` base partial — whichever matches the codebase convention. Check what's already in the reset file for media elements and extend it.

**`<img>`**
- Check what's already in reset (likely `max-width: 100%`)
- Add if missing:
  - `height: auto` (prevent aspect ratio distortion when width is constrained)
  - `display: block` (remove the inline whitespace gap below images) — BUT: only if this won't break existing layouts that depend on inline `<img>`. Check existing usage patterns. If risky, apply only within `.prose` or article contexts.
  - `font-style: italic` on `<img>` — this is a trick: when alt text is displayed (broken image), italic helps distinguish it from surrounding text
  - `max-inline-size: 100%; block-size: auto;` — logical property versions if the system uses logical properties consistently (check existing codebase)

**`<picture>`**
- Inherits `<img>` styles on its inner `<img>` — no additional styling needed
- Verify `<picture>` itself doesn't need `display: block` or other container treatment

**`<video>`**
- `max-width: 100%; height: auto;`
- `display: block`
- Optional: `background: var(--surface-secondary)` (visible before poster loads)

**`<audio>`**
- Minimal treatment
- `width: 100%` so it fills its container
- `color-scheme: dark` or `light` based on active mode (affects native controls rendering)
- Very low priority — browser defaults are acceptable

**`<iframe>`**
- `max-width: 100%`
- `border: none` (remove default border)
- `display: block`

**`<canvas>`**
- `max-width: 100%; height: auto;`
- `display: block`

**Inline `<svg>`**
- `display: inline-block` (prevent baseline alignment issues)
- `vertical-align: middle` (common need when SVG is adjacent to text)
- `fill: currentColor` — allows SVG to inherit text color (ONLY as a default, should be overridable)
- `flex-shrink: 0` — prevent SVGs from being squished in flex containers
- Note: only target inline SVGs (not SVGs used as `<img src>`). Use `svg:not([class])` or `svg:where(:not([class]))` as selector to avoid overriding SVGs that have specific component classes. Or check what the system's existing icon system does and ensure no conflicts.

### Aspect ratio utility classes:

Create a small set of utility classes for responsive media embedding (especially iframes and videos):

```scss
.aspect-video { aspect-ratio: 16 / 9; }
.aspect-square { aspect-ratio: 1 / 1; }
.aspect-4-3 { aspect-ratio: 4 / 3; }
.aspect-21-9 { aspect-ratio: 21 / 9; }
```

Check: does Tailwind already provide these? (`aspect-video`, `aspect-square` are Tailwind defaults). If so, DON'T duplicate them in SCSS — they're Tailwind's responsibility (layout). Only add SCSS versions if they're needed outside of Tailwind context (e.g., in a `.prose` block where Tailwind classes aren't used).

### Interactive element base styling:

**`<dialog>` (bare element)**
- The Modal.svelte component styles its dialog. But a raw `<dialog>` element should also look acceptable.
- Check: does the existing modal SCSS use a class selector (`.modal-dialog`) or element selector (`dialog`)?
- If class-based: add base `dialog` element styling:
  - `border: none` (remove browser default)
  - `border-radius` from token
  - `padding` from spacing token
  - `background: var(--surface-primary)` (or equivalent)
  - `color: var(--text-main)`
  - `box-shadow` from elevation token
  - `max-width: min(90vw, [max-width token])` — prevent full-screen dialogs
  - `max-height: 85vh; overflow-y: auto;`
- `::backdrop`:
  - If the Modal component already styles `::backdrop`, check if it's on a class or the element
  - Base `dialog::backdrop` should have a dark overlay: `background: rgba(0, 0, 0, 0.5)` (or better, use a token if one exists)
  - Backdrop blur (if glass mode): `backdrop-filter: blur(4px)` — only in glass physics mode

**`[popover]` (bare element)**
- Similar to dialog: check if existing popover styling is class-based or attribute-based
- Base `[popover]` styling:
  - `border: 1px solid var(--color-border)`
  - `border-radius` from token
  - `padding` from spacing token
  - `background: var(--surface-primary)`
  - `box-shadow` from elevation token
  - Remove any browser default popover border/outline

### Verification:
- A raw `<img>` in a container should not overflow its container on any viewport size
- An `<iframe>` wrapped in `.aspect-video` (or Tailwind's `aspect-video`) should maintain 16:9 ratio
- A bare `<dialog>` opened with `.showModal()` should look acceptable without any classes
- Inline SVGs should inherit text color and not cause layout shifts
- None of these changes should break existing components that use these elements

---

## Final Assembly

After all subagents complete:

1. **Verify import order**: new files imported in correct cascade position in `global.scss`
2. **Run build**: SCSS compiles without errors
3. **Run `npm run scan`**: no token violations
4. **Conflict check**: existing components (Modal, Dropdown, Toggle, inputs, buttons) still work correctly — base element styles don't override component styles due to specificity
5. **Report**: list every element styled, files modified/created, lines added, decisions made with rationale
