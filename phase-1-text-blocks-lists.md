# Phase 1: Text-Level Semantics, Block Content & Lists

## Context

You are working on the Void Energy UI system — a Svelte 5 / Astro / TypeScript design system with a physics-based engine (glass/flat/retro visual modes), 12 themes, and density scaling. Styling is split: Tailwind for layout, SCSS for visual styling. Design tokens are the single source of truth.

This phase adds comprehensive base styling for native HTML elements — text-level semantics, block content elements, and list elements. When complete, a raw HTML page with zero classes and only semantic elements should look like it belongs in the Void Energy design system.

## Critical: Read Before Writing

**BEFORE writing any SCSS**, every subagent MUST read these files completely to understand the system's patterns:

1. `src/styles/base/_typography.scss` — Understand how headings, paragraphs, links, code, and kbd are currently styled. Match ALL conventions: how physics modes are differentiated, how tokens are consumed, how density affects sizing, how selectors are structured.
2. `src/styles/abstracts/_engine.scss` — Understand the physics engine. How does `[data-physics="glass"]`, `[data-physics="flat"]`, `[data-physics="retro"]` work? What mixins exist for physics-conditional styling?
3. `src/styles/abstracts/_mixins.scss` — Read ALL available mixins. Especially: `when-physics()`, `when-glass()`, `when-flat()`, `when-retro()`, `glass-float()`, `glass-sunk()`, `respond-up()`, `entry-transition()`, and any text/typography-related mixins. You MUST use these existing mixins — do NOT write raw `[data-physics]` selectors if a mixin exists for it.
4. `src/styles/base/_reset.scss` — Understand what's already normalized. Don't duplicate.
5. `src/styles/config/_generated-themes.scss` — Understand available color tokens.
6. `src/config/design-tokens.ts` — Understand the spacing scale, type scale, and other tokens available.

**Also check:** Is there a `.legal-content` or `.prose` class that styles lists? Read it — we need to extract that styling to base elements while keeping the class as an optional enhanced version.

**Conventions to follow (gathered from reading the files above):**
- Use CSS custom properties (tokens) for ALL values — zero hardcoded pixels, colors, or font sizes
- Use existing physics mixins for mode differentiation
- Use `var()` with fallbacks where appropriate
- Respect density via `calc()` with `--density` multiplier where sizing is involved
- Keep SCSS nesting to 2-3 levels max
- No `!important` unless genuinely necessary (and document why)
- No `@extend` — use mixins or direct styles
- All spacing/sizing must use the spacing token scale

## File Strategy

After reading the existing files, determine the correct placement for each category:
- If `_typography.scss` is the right home for text-level and block content elements: add there
- If it's getting too large, create new partials (e.g., `_prose.scss`, `_lists.scss`) and import them in `global.scss` in the correct cascade position (after reset, within the base layer)
- Either approach is fine — match whatever pattern the codebase already uses for file organization

**Do NOT create a new file unless the existing file would exceed ~400 lines with additions, or unless the codebase already splits base styles across multiple partials.**

---

## Subagent 1: Inline Text-Level Semantics

Style every inline text element so it looks correct inside any prose context (`<p>`, `<li>`, `<td>`, `<blockquote>`, etc.).

### Elements to style:

**`<small>`**
- Map to one step down in the type scale (e.g., `font-size: var(--text-sm)` or equivalent token)
- Use `--text-mute` color (or the system's equivalent muted text token)
- Common for legal text, captions, fine print

**`<mark>`**
- Background highlight using the system's primary energy color at low opacity (~20-30%)
- Text color should remain readable (verify contrast)
- Physics differentiation:
  - Glass: subtle glow/luminance on the highlight (`box-shadow` or `filter`)
  - Flat: solid fill, clean edges
  - Retro: inverted or high-contrast fill
- Ensure it works on both light and dark modes
- Padding: tiny horizontal padding (`0.1em 0.2em`) so highlight doesn't touch text edges
- Border-radius: minimal, from token scale

**`<del>` and `<s>`**
- Strikethrough (default), `text-decoration: line-through`
- Reduce opacity slightly or use `--text-mute` color
- Optional: change `text-decoration-color` to use a semantic color (error/red for `<del>` specifically)
- Physics: minimal differentiation needed

**`<ins>`**
- Underline via `text-decoration: underline`
- Subtle background tint (success/green at very low opacity)
- `text-decoration-style: solid` (distinct from regular link underlines)
- Physics: minimal differentiation needed

**`<sub>` and `<sup>`**
- Critical fix: prevent them from disrupting parent line-height
- Apply: `font-size: 0.75em; line-height: 0; position: relative; vertical-align: baseline;`
- `<sup>`: `top: -0.5em`
- `<sub>`: `bottom: -0.25em`
- This is a well-known technique — the `line-height: 0` prevents the superscript/subscript from increasing the parent line's height

**`<abbr>` (with title attribute)**
- `text-decoration: underline dotted`
- `text-decoration-color` using a subtle border token
- `cursor: help`
- `text-underline-offset` for readability (use a small spacing token value)
- No physics differentiation needed

**`<samp>`**
- Sample output — should look like `<code>` (monospace, recessed surface)
- If `<code>` has a specific SCSS treatment, `<samp>` should share it (either same rules or a shared mixin)
- Do NOT use `@extend` — either duplicate the rules (if minimal) or create a mixin if `<code>` styling is substantial

**`<var>`**
- Variable name — `font-style: italic; font-family: [monospace token]`
- Subtle color differentiation if appropriate (e.g., `--text-dim`)
- Used in mathematical/programming contexts

**`<cite>`**
- Citation — `font-style: italic`
- Optionally use `--text-dim` color to visually distinguish from regular text
- Used for titles of works (books, films, etc.)

**`<q>`**
- Browser adds quotation marks automatically — preserve this behavior
- Optionally style the quotes themselves: `color: var(--text-mute)` on the `::before`/`::after` pseudo-elements if the system's aesthetic calls for subdued quotation marks
- If existing paragraph text styling exists, `<q>` should harmonize with it

**`<dfn>`**
- Definition term — `font-style: italic; font-weight: [semi-bold token]`
- Signals "this term is being defined here"
- Minimal, almost invisible enhancement — just enough to notice

### Verification for Subagent 1:
- Write a raw HTML test block (as a comment in the SCSS file or mentally verify) containing every element nested inside a `<p>`:
  ```html
  <p>This is <strong>bold</strong> and <em>italic</em> and <small>small</small> and
  <mark>highlighted</mark> and <del>deleted</del> and <ins>inserted</ins> and
  H<sub>2</sub>O and E=mc<sup>2</sup> and <abbr title="Cascading Style Sheets">CSS</abbr>
  and <samp>output</samp> and <var>x</var> and <cite>Moby Dick</cite> and
  <q>quoted</q> and the <dfn>definition</dfn>.</p>
  ```
- Every element should be visually distinguishable from plain text
- No element should break the line-height rhythm of the paragraph
- All elements should look correct in glass, flat, and retro physics modes

---

## Subagent 2: Block Content Elements

### Elements to style:

**`<blockquote>`**
- This should be a statement piece in the physics system. Structure:
  - Indentation: `padding-inline-start` using spacing tokens
  - Vertical margin: consistent with heading/paragraph rhythm
  - Physics differentiation (use existing mixins):
    - Glass: `glass-sunk` inset effect on the left border or full background. Subtle luminance. Left border using `--energy-primary` with glow
    - Flat: Clean left border (3-4px solid using `--energy-primary`). No background or very subtle `--surface-secondary`
    - Retro: Double border or thick dashed border. Consider `border-left-style: double` or a pixel-art-style stepped border
  - Body text: inherit parent font-size, optionally italic (check if the system's typography convention favors italic blockquotes)
  - Nested blockquotes: should visually differentiate (reduced border width, slightly more indentation, or shifted color)
  - `<blockquote> <footer>` or `<blockquote> <cite>`: attribution line — smaller text, `--text-mute`, preceded by an em dash or similar
  - Paragraphs inside blockquotes should have tighter spacing than top-level paragraphs

**`<figure>` and `<figcaption>`**
- `<figure>`:
  - Remove default margin (browser adds ~40px)
  - Optional subtle surface treatment (physics-dependent)
  - `overflow: hidden` if border-radius is applied
  - Contents should be centered or left-aligned (whichever matches system convention)
- `<figcaption>`:
  - `font-size`: one step down in type scale
  - `color: var(--text-mute)`
  - Padding-top: small spacing token
  - Alignment: `text-align: center` or `text-align: start` — pick one, be consistent
  - Works for images, code blocks, charts, and any other media inside `<figure>`

**`<address>`**
- Contact information block
- `font-style: normal` (remove browser italic default — most modern designs don't italicize addresses)
- `color: var(--text-dim)`
- Margin consistent with other block elements

**`<details>` and `<summary>` (enhance from PARTIAL to COMPLETE)**
- This is the most complex element in this subagent. Read the existing partial styling first.
- `<summary>`:
  - `cursor: pointer`
  - `list-style: none` (remove default triangle) + custom disclosure marker via `::before` or `::marker`
  - Custom marker per physics mode:
    - Glass: subtle glowing chevron or triangle using `--energy-primary`
    - Flat: clean chevron (▶ rotates to ▼)
    - Retro: bracket or ASCII-style marker (► or [+]/[-])
  - Marker rotation on `[open]`: `details[open] > summary::before { transform: rotate(90deg) }` (or whatever the marker convention is)
  - Hover state: subtle background shift (behind `@media (hover: hover)`)
  - Focus-visible: use existing focus ring pattern
  - Padding: density-aware
  - Font-weight: slightly bolder than body text
  - Border-bottom on summary (optional, depends on aesthetic)
- `<details>`:
  - Content area padding (the part that expands)
  - **Animated open/close** — use modern CSS approach:
    ```scss
    details {
      interpolate-size: allow-keywords;
    }
    details > *:not(summary) {
      // or use a content wrapper approach
      overflow: hidden;
      transition: height var(--duration-normal) var(--ease-out);
      height: 0;
    }
    details[open] > *:not(summary) {
      height: auto;
    }
    ```
    Note: `interpolate-size: allow-keywords` enables transition between `height: 0` and `height: auto` in CSS without JS. This is a 2024+ CSS feature with good modern browser support. If the system needs to support older browsers, add a `@supports` check.
  - Respect `prefers-reduced-motion` — disable the height transition
  - Surface treatment per physics mode:
    - Glass: subtle glass-sunk for the content area
    - Flat: border or background differentiation
    - Retro: visible border/box around content
  - Nested `<details>` inside `<details>`: indentation, reduced border
  - `<details>` inside a list: should work without layout conflicts

### Verification for Subagent 2:
- Blockquote should look like a designed pull-quote, not a browser default indent
- Figure/figcaption should work with `<img>`, `<pre>`, `<video>` inside the figure
- Details/summary should animate open/close smoothly (or instant if reduced-motion)
- All elements respect physics modes (glass, flat, retro) and don't look the same across them
- Density changes should affect padding/spacing but not break layouts

---

## Subagent 3: Lists

### Elements to style:

**`<ul>` (base styling)**
- First: read the existing `.legal-content` list styling. Extract the core rules to base `<ul>`.
- Custom list markers per physics mode:
  - Glass: glowing dot or circle using `--energy-primary` (via `::marker` color or a `list-style-image` with an SVG data-URI)
  - Flat: solid disc (default but colored to match `--energy-primary` or `--text-mute`)
  - Retro: dash, arrow (→), or other character-based marker via `list-style-type` or `::marker` content
- `margin-inline-start` (NOT `margin-left`) for indentation — use spacing token
- `padding-inline-start` for marker space
- Consistent gap between items (`li + li { margin-block-start: ... }` or `li { margin-block-end: ... }`)
- Nested `<ul>` inside `<li>`:
  - Different marker style for level 2 (circle), level 3 (square) or custom per physics mode
  - Additional indentation per level
  - Slightly reduced font-size at deeper nesting levels (optional — only if the type scale supports it gracefully)

**`<ol>` (base styling)**
- Styled counters — `list-style-type: decimal` is fine for default, but ensure counter color matches `--text-dim` or `--energy-primary`
- `::marker` color: use token (not all browsers support `::marker` fully — check and provide fallback)
- Nested numbering options:
  - CSS counters are already used in `.legal-content` — read that implementation
  - For base `<ol>`, standard decimal numbering is fine without automatic sub-numbering
  - Sub-numbering (1.1, 1.2.1) should remain a class-based enhancement (`.legal-content` or a new `.ol-nested` class), not the default
- Same spacing rules as `<ul>`

**`<dl>`, `<dt>`, `<dd>` (full styling from scratch)**
- `<dl>`: block container, vertical margin consistent with other block elements
- `<dt>`:
  - `font-weight` semi-bold (use weight token)
  - `color: var(--text-dim)` (or `--text-main` if you prefer bold to carry it)
  - `margin-block-start` for separation between pairs (except first)
- `<dd>`:
  - `margin-inline-start: 0` (remove browser default indent) — display below `<dt>`, not indented
  - OR keep a small indent if the system's aesthetic prefers it
  - `color: var(--text-main)`
  - `margin-block-end` small spacing token
- Multiple `<dd>` for one `<dt>`: should stack naturally
- Multiple `<dt>` for one `<dd>`: should work (dt1, dt2 both above dd)
- Physics: minimal differentiation needed — this is content typography, not a widget. Optional: separator line between dt/dd pairs in glass mode

**List nesting (cross-type)**
- `<ol>` inside `<ul>` and vice versa should work correctly
- Indentation should be consistent regardless of list type
- Marker style should reflect the list type, not the nesting level's parent type

### Verification for Subagent 3:
- A plain `<ul>` with 5 items and 2 levels of nesting should look designed, not default-browser
- `<ol>` numbering should be visible and well-styled
- `<dl>` with multiple dt/dd pairs should present as a clean key-value display
- All lists should be readable when placed inside a `<blockquote>`, `<td>`, `<details>`, or `<figure>`
- Confirm `.legal-content` or any existing list class still works correctly (not broken by new base styles)

---

## Final Assembly

After all subagents complete:

1. **Verify import order**: if new files were created, ensure they're imported in `global.scss` in the correct position
2. **Run the build** to confirm SCSS compiles without errors
3. **Run `npm run scan`** (if it exists) to verify no token violations were introduced (no hardcoded values)
4. **Check for conflicts**: do the new base styles override anything in existing components? If `.legal-content` lists were styled differently than the new base `<ul>`/`<ol>`, make sure the class styles win via specificity
5. **Report**: list every element styled, the file(s) modified, lines added, and any decisions made (with rationale)
