Review code for Void Energy design system compliance.

## Input

`$ARGUMENTS` is either:
- Empty → review all recent changes (`git diff HEAD --name-only` + `git diff --staged --name-only`)
- A file path → review that specific file
- A directory → review all `.svelte` and `.scss` files in it

## Review Checklist

For each file, check against the 5 Laws and report violations with `file:line` references.

### Law 1 — Hybrid Protocol
- **VIOLATION:** Layout properties in SCSS (`display`, `flex`, `grid`, `gap`, `padding`, `margin`, `width`, `height`, `align-items`, `justify-content`)
- **VIOLATION:** Physics/material properties in Tailwind classes (`shadow-*`, `bg-*` with colors, `blur-*`, `border-*` with colors, `opacity-*`, `backdrop-*`)
- **OK:** Tailwind for geometry, SCSS for surfaces/shadows/blur/animations

### Law 2 — Token Law
- **VIOLATION:** Raw pixel values (except 0px, 1px, 2px, 3px and negatives)
- **VIOLATION:** Raw hex colors (#fff, #000, #ab12cd)
- **VIOLATION:** Raw rgb/rgba/hsl values
- **VIOLATION:** Tailwind arbitrary values (`gap-[20px]`, `p-[32px]`, `text-[#fff]`)
- **OK:** Semantic tokens (`var(--space-md)`, `var(--text-main)`, `gap-md`, `p-lg`)
- **OK:** Raw values annotated with `// void-ignore` — reviewed physical exceptions (shimmer highlights, scrollbar constants, readability floors)

### Law 3 — Runes Doctrine (Svelte files only)
- **VIOLATION:** `export let` (should be `$props()`)
- **VIOLATION:** `$:` reactive declarations (should be `$derived()` or `$effect()`)
- **VIOLATION:** `onMount`, `onDestroy` imports (should be `$effect()`)
- **VIOLATION:** `import { writable }` or `$store` syntax (should be `$state()`)
- **VIOLATION:** `createEventDispatcher` (should be callback props)
- **OK:** All Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`, `$bindable`)

### Law 4 — State Protocol
- **VIOLATION:** `class:active=`, `class:open=`, `class:selected=` for state
- **VIOLATION:** `class="is-active"`, `class="open"`, `class="selected"`
- **OK:** `data-state="active"`, `aria-checked="true"`, `aria-pressed="true"`, `aria-expanded="true"`

### Law 5 — Spacing Gravity
- **VIOLATION:** `p-sm` or `p-xs` on `.surface-glass` / `.surface-glass-action` (must be `p-lg`)
- **VIOLATION:** `p-xs` on `.surface-sunk` (must be `p-md` minimum; `p-sm` only for justified dense pickers)
- **VIOLATION:** `gap-sm` or `gap-xs` on button/action rows inside containers (must be `gap-md`)
- **VIOLATION:** `gap-xs` between content groups (only valid for tight coupling: label→input, icon+text, title+subtitle)
- **OK:** `p-lg gap-lg` on floating surfaces, `p-md gap-md` on sunk surfaces, `gap-xs` for tight coupling

### Physics Coverage (SCSS files)
- **WARNING:** Component SCSS missing `when-retro` block (for components with border-radius, box-shadow, or visible borders)
- **WARNING:** Component SCSS missing `when-light` block (for components with visible background surfaces)
- **INFO:** Missing `when-glass` block is only a concern if the component makes glass-specific overrides beyond what `glass-float`/`glass-sunk` provides

### SCSS Import
- **VIOLATION:** Importing individual SCSS partials (should be `@use '../abstracts' as *;`)

## Output Format

```
## Design System Review

### file.svelte
- [Law 2] line 42: Raw value `padding: 16px` → use `var(--space-sm)`
- [Law 3] line 5: Legacy `export let value` → use `$props()`
- [Law 4] line 28: State via class `class:active={on}` → use `data-state={on ? 'active' : ''}`

### _file.scss
- [Law 1] line 12: Layout in SCSS `display: flex` → move to Tailwind `class="flex"`
- [Physics] Missing `when-retro` block

### Summary
- 3 violations found, 1 warning
- Files clean: component-b.svelte, _component-b.scss
```

If no violations are found, output: "All files pass design system review."