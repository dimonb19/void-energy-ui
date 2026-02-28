# Phase 3: Global Treatments & Infrastructure

## Context

You are working on the Void Energy UI system — Svelte 5 / Astro / TypeScript with a physics-based design engine (glass/flat/retro modes), 12 themes, density scaling.

**Phases 1 and 2 have been completed.** All native HTML elements now have physics-aware base styling. This final phase adds system-wide visual treatments (selection, scrollbars, print) and sets up infrastructure (container queries) for the upcoming component build phase.

## Critical: Read Before Writing

Read these files before doing anything:

1. `src/styles/global.scss` — Understand the full import structure and cascade order. Your additions must be placed correctly.
2. `src/styles/base/_reset.scss` — Check what global treatments already exist.
3. `src/styles/base/_themes.scss` — Understand how themes switch, what tokens are available per theme.
4. `src/styles/base/_accessibility.scss` — Check for existing `prefers-reduced-motion` handling, `forced-colors` support, and any other global accessibility patterns.
5. `src/styles/abstracts/_engine.scss` — Physics engine variables and mixins.
6. `src/styles/abstracts/_mixins.scss` — Available mixins for physics modes, respond-up breakpoints, etc.
7. `src/config/design-tokens.ts` — Available tokens, especially breakpoints.
8. `tailwind.config.mjs` — Current Tailwind configuration, plugins, custom extensions.
9. **All changes from Phase 1 and Phase 2** — Read the new/modified files to stay consistent.

---

## Subagent 1: Text Selection Styling

### `::selection` pseudo-element

Style the text selection (highlight) color across the entire system.

**Implementation:**

```scss
::selection {
  background: /* energy-primary at ~25-30% opacity */;
  color: /* text-main or high-contrast text */;
}
```

**Requirements:**
- Background: use the system's primary energy color (`--energy-primary` or equivalent) at reduced opacity. The exact approach depends on the token format:
  - If the token is a full color value (e.g., `#ff6b35`), you'll need to use `color-mix(in srgb, var(--energy-primary) 25%, transparent)` or a manual rgba
  - If the token provides raw RGB/HSL channels, use those with an alpha value
  - Read the token format first before deciding the technique
- Text color: should contrast with the selection background. In dark mode, this might need to be different from light mode. Check both.
- Should work across ALL 12 themes — the selection color should adapt when the theme changes (because it reads from `--energy-primary`)
- Physics modes: no differentiation needed — selection highlight is a system-level treatment, not physics-specific
- Test mentally: does the selection look good when highlighting text inside `<code>`, `<mark>`, `<kbd>`? The selection background will layer on top of these elements' backgrounds.

**Placement:** Add to `_reset.scss` or `_typography.scss` — whichever is the more appropriate home for a global text treatment.

---

## Subagent 2: Scrollbar Styling

### Custom scrollbar appearance

Custom scrollbars are impactful in glass mode (where default gray scrollbars break the immersion) and useful across all modes for visual consistency.

**Implementation — two approaches required (both browsers):**

**WebKit/Blink (Chrome, Edge, Safari):**
```scss
// Thin scrollbar
::-webkit-scrollbar {
  width: /* 8px or density-scaled */;
  height: /* same, for horizontal scrollbars */;
}

::-webkit-scrollbar-track {
  background: /* surface-secondary or transparent */;
}

::-webkit-scrollbar-thumb {
  background: /* border-color or muted energy color */;
  border-radius: /* radius-full for pill shape */;
  border: /* 2px solid transparent — creates padding between thumb and track edge */;
  background-clip: content-box; /* works with the border trick to create visual padding */;
}

::-webkit-scrollbar-thumb:hover {
  background: /* slightly brighter/more opaque */;
}
```

**Firefox:**
```scss
* {
  scrollbar-width: thin;
  scrollbar-color: /* thumb-color track-color */;
}
```

Note: Firefox's `scrollbar-color` only accepts two color values (thumb and track). Less control than WebKit, but sufficient.

**Physics differentiation:**
- **Glass**: translucent thumb with glass-like appearance. Track is transparent or very subtle. Thumb has a subtle glow or higher opacity on hover. This is where custom scrollbars matter most — glass UI with default gray scrollbars looks broken.
- **Flat**: clean minimal thumb, solid color from border/muted tokens. Track transparent or `--surface-secondary`. No effects.
- **Retro**: thicker thumb, visible track borders. Consider a more traditional/chunky scrollbar appearance. Track could have a subtle pattern or visible edges.

**Important considerations:**
- `prefers-reduced-motion`: scrollbar styling has no motion, so no concern here
- `forced-colors` / high contrast mode: scrollbars should respect `forced-colors: active` — use `@media (forced-colors: active) { * { scrollbar-color: auto; } }` to let the OS handle it
- Dark/light mode: scrollbar colors should automatically adapt because they read from CSS custom properties that change with theme
- Don't make scrollbars so thin they're unusable — minimum thumb width should be comfortable for mouse interaction
- Consider: should these rules apply globally (`*` or `:root`) or only to specific containers (`.scrollable`, the main content area)? Global is simpler and more consistent. But verify it doesn't break any existing scroll containers that have specific behavior.

**Placement:** Add to `_reset.scss` (it's a global treatment) or a new `_scrollbars.scss` base partial.

---

## Subagent 3: Print Stylesheet

### `@media print` — complete print optimization

This is the largest single addition in this phase. Create a comprehensive print stylesheet.

**Placement:** Create `src/styles/base/_print.scss` and import it in `global.scss`. It should be imported LAST or near-last in the cascade (print styles override everything).

**Requirements:**

### Colors and backgrounds:
```scss
@media print {
  // Force light, ink-friendly rendering
  *, *::before, *::after {
    background: transparent !important; // Remove all backgrounds
    color: #000 !important; // Force black text
    box-shadow: none !important; // Remove all shadows
    text-shadow: none !important;
    filter: none !important; // Remove all filters (glass effects, etc.)
  }
  
  // But preserve meaningful backgrounds where needed:
  mark {
    background: #ff0 !important; // Standard yellow highlighter
    color: #000 !important;
  }
  
  code, pre, kbd, samp {
    background: #f5f5f5 !important; // Light gray for code blocks
    border: 1px solid #ddd !important;
  }
}
```

Note: `!important` is correct and necessary in print stylesheets — this is one of the legitimate use cases. Print styles must override everything.

### Hidden elements (non-print content):
```scss
@media print {
  // Hide interactive/navigational UI
  nav,
  .skip-link,
  footer,
  // Toasts, modals, dropdowns — check the actual class names in the system:
  .toast-container,
  dialog[open],
  [popover],
  // Any "back to top" buttons, FABs, etc.
  // Sidebar navigation if it exists
  // Theme switcher, settings panels
  {
    display: none !important;
  }
}
```

Read the actual codebase to find the correct selectors for these UI elements. Don't guess class names — open the component files and find the actual selectors/elements used.

### Typography adjustments:
```scss
@media print {
  body {
    font-size: 12pt; // Standard print size
    line-height: 1.5;
    max-width: 100%;
    margin: 0;
    padding: 0;
  }
  
  h1 { font-size: 24pt; }
  h2 { font-size: 20pt; }
  h3 { font-size: 16pt; }
  h4, h5, h6 { font-size: 14pt; }
  
  // Ensure headings break to new page rather than orphaned at bottom
  h1, h2, h3, h4, h5, h6 {
    break-after: avoid;
  }
}
```

### Link handling:
```scss
@media print {
  // Show URLs after links so printed pages have the reference
  a[href^="http"]::after,
  a[href^="https"]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666 !important;
    word-break: break-all;
  }
  
  // Don't show URLs for internal/anchor links
  a[href^="#"]::after,
  a[href^="javascript"]::after {
    content: none;
  }
  
  // Remove link underline decoration (or keep it — decide based on readability)
  a {
    text-decoration: underline;
    color: #000 !important;
  }
}
```

### Table printing:
```scss
@media print {
  table {
    border-collapse: collapse;
  }
  
  th, td {
    border: 1px solid #ddd !important;
    padding: 0.5em;
  }
  
  thead {
    // Repeat table headers on each page
    display: table-header-group;
  }
  
  tr {
    break-inside: avoid; // Don't split rows across pages
  }
}
```

### Page break control:
```scss
@media print {
  // Prevent awkward page breaks
  img, figure, blockquote, pre, table {
    break-inside: avoid;
  }
  
  // Ensure sufficient content after headings before page break
  h1, h2, h3 {
    break-after: avoid;
    orphans: 3;
    widows: 3;
  }
  
  p {
    orphans: 3; // Minimum lines at bottom of page
    widows: 3; // Minimum lines at top of page
  }
}
```

### Media handling:
```scss
@media print {
  img {
    max-width: 100% !important;
    // Optional: reduce image rendering for ink saving
  }
  
  video, audio, iframe, canvas {
    display: none !important; // Can't print interactive media
  }
  
  // Show alt text or figcaption for hidden media
  figure:has(video) figcaption::before,
  figure:has(audio) figcaption::before {
    content: "[Media: ";
  }
  figure:has(video) figcaption::after,
  figure:has(audio) figcaption::after {
    content: "]";
  }
}
```

### Physics/theme reset for print:
```scss
@media print {
  // Remove all physics-based visual effects
  // Glass mode glows, retro effects, etc.
  [data-physics] {
    // If physics effects use specific CSS properties, reset them here
    // This depends on what the physics engine applies — READ the engine SCSS
  }
}
```

### Verification:
- Print preview (Cmd+P / Ctrl+P) should show a clean, black-on-white document
- No navigation, sidebars, toasts, or interactive UI visible
- Links show their URL in parentheses
- Tables have visible borders and repeat headers
- Code blocks have subtle gray background
- No page breaks split tables, images, or code blocks mid-content
- Highlighted `<mark>` text is still highlighted in yellow

---

## Subagent 4: Container Query Infrastructure

### Setup — NOT building responsive components yet, just enabling the system

**Step 1: Assess Tailwind version and available options**
- Read `tailwind.config.mjs` and `package.json`
- If Tailwind v3.x: need `@tailwindcss/container-queries` plugin
- If Tailwind v4.x: container queries may be built-in

**Step 2: Install plugin (if needed)**
- Add `@tailwindcss/container-queries` to the Tailwind config plugins array
- This enables `@container` variants in Tailwind classes (e.g., `@lg:grid-cols-2`)

**Step 3: Create SCSS mixin for container queries**

The system has a `respond-up($breakpoint)` mixin for viewport breakpoints. Create a parallel mixin for container queries:

```scss
// In _mixins.scss or a new _container-queries.scss abstract partial

@mixin container-up($size) {
  @container (min-width: #{$size}) {
    @content;
  }
}

// Or with named breakpoints matching the system's breakpoint tokens:
// Read design-tokens.ts to get the actual breakpoint values
// Define container breakpoint equivalents (they'll be different from viewport breakpoints)
// Container breakpoints are typically smaller since they're measuring element width, not viewport

$container-breakpoints: (
  'sm': 320px,   // Small container
  'md': 480px,   // Medium container  
  'lg': 640px,   // Large container
  'xl': 800px,   // Extra large container
) !default;

@mixin container-up($name) {
  @if map.has-key($container-breakpoints, $name) {
    @container (min-width: #{map.get($container-breakpoints, $name)}) {
      @content;
    }
  } @else {
    @error "Unknown container breakpoint: #{$name}";
  }
}
```

**Important:** The exact breakpoint values should be informed by the system's actual layout contexts. Read the existing viewport breakpoints and create proportionally smaller container breakpoints. Don't guess — look at the actual sidebar width, modal width, card widths in the codebase.

**Step 4: Create container type utility**

A base utility class for making elements into container query contexts:

```scss
.container-query {
  container-type: inline-size;
}
```

Check: does Tailwind's container query plugin provide this automatically via `@container` class? If so, don't duplicate it. Only create the SCSS version if it's needed outside of Tailwind context.

**Step 5: Document**

Add a comment block in the mixin file explaining:
- How `container-up()` works
- The breakpoint scale and how it differs from viewport breakpoints
- Usage example: how a component would use `@include container-up('md') { ... }`
- Note that this is infrastructure only — no components have been migrated to container queries yet

### Verification:
- Tailwind container query plugin is installed and configured
- SCSS mixin compiles without errors
- A test usage of `@include container-up('md') { color: red; }` produces valid `@container` CSS
- The mixin values align sensibly with the system's actual layout sizes
- Existing code is not affected by the plugin addition

---

## Final Assembly

After all subagents complete:

1. **Import order**: verify all new files are imported in `global.scss` in the correct position:
   - Print stylesheet should be last or near-last
   - Scrollbar/selection styles in the base layer
   - Container query mixin in the abstracts layer
2. **Run build**: SCSS compiles, no errors
3. **Run `npm run scan`**: no token violations (print stylesheet will have hardcoded values — these are justified because print is a context where tokens don't apply. If the scanner flags them, add appropriate ignore comments matching the system's existing pattern.)
4. **Conflict check**: nothing breaks. Specifically:
   - Selection styling doesn't conflict with any component that manages its own selection
   - Scrollbar styling doesn't break existing scroll containers
   - Print stylesheet doesn't affect screen rendering (all rules inside `@media print`)
   - Container query plugin doesn't change any existing Tailwind utility behavior
5. **Report**: complete list of everything added, files modified/created, any design decisions made with rationale

---

## Phase 3 Completion Checklist

When this phase is done, the following should ALL be true:

- [ ] `::selection` styled with energy-primary color, adapts across all 12 themes
- [ ] Scrollbars styled per physics mode (glass: translucent, flat: minimal, retro: chunky), works in Chrome and Firefox
- [ ] Complete print stylesheet: hides UI chrome, forces light colors, shows link URLs, controls page breaks, handles tables
- [ ] Container query infrastructure: Tailwind plugin installed, SCSS mixin created with documented breakpoint scale
- [ ] All additions respect `prefers-reduced-motion` and `forced-colors` where applicable
- [ ] Zero conflicts with existing components
- [ ] Build passes clean

This completes the "base layer" of the UI system. After this phase, every native HTML element is fully styled, every global treatment is in place, and the infrastructure is ready for the component build phase.
