# Claude Code Setup — Quick Reference

## Directory Map

```
.claude/
  commands/                  On-demand skills (invoke with /name)
    document.md              Document recent changes
    build-page.md            Compose a page with shipped primitives (handles new pages too)
    new-component.md         Match-first scaffold for new components
    review.md                Check design system compliance

  hooks/                     Automatic (runs on every edit, no action needed)
    auto-format.sh           Prettier after file saves
    protect-generated.sh     Block edits to generated files
    token-scan.sh            Scan for raw pixel values

  agents/                    Specialized AI reviewers (read-only)
    design-reviewer.md       5 Laws compliance checker
    a11y-checker.md          Accessibility (WCAG 2.1 AA) checker

  rules/                     Context loaded on-demand by file type
    page-composition.md      Astro route-shell and spacing rules
    component-usage.md       Registry-first usage rules for `.svelte` files
    styling.md               Starter styling and hybrid protocol guardrails
    read-only-system.md      Hard stop for shipped system files
    new-page.md              Copy-paste page scaffold for new routes
    tokens-reference.md      Token dictionary (when editing .scss/.svelte/.ts)
    scss-reference.md        SCSS toolkit (when editing styles/components)
    spacing-protocol.md      Spacing rules (when editing .svelte/.scss/.ts/.astro)

  settings.json              Hooks configuration (shared, checked into git)
  settings.local.json        Local permissions (gitignored)
```

---

## Skills

### `/build-page`

Builds a page or app screen by composing existing Void Energy primitives and documented recipes.

```
/build-page "creator dashboard with charts, filters, and recent activity"
```

How it works:
1. Reads the component registry, AI playbook, and composition recipes
2. Maps the brief onto shipped primitives, native-first patterns, and existing page analogs
3. Implements the page in consumer files without inventing new design-system primitives
4. Reports any real system gaps that remain

### `/new-component ComponentName`

Scaffolds a new component with the correct Void Energy patterns.

```
/new-component DataGrid
```

Creates:
- `src/components/ui/DataGrid.svelte` — Svelte 5 runes, props interface, data-attributes
- `src/styles/components/_datagrid.scss` — surface-raised, physics blocks, token-only values

### `/review`

Checks code for design system violations (the 5 Laws).

```
/review                              (all recent changes)
/review src/components/ui/Card.svelte (specific file)
```

Outputs: `file:line [Law N] violation → fix` for each issue found.

### `/document`

Updates CHEAT-SHEET.md with documentation for recent changes.

```
/document                  (all recent changes)
/document DataGrid         (specific component)
```

---

## Hooks (Automatic)

These run automatically — no commands needed. Restart Claude Code after first setup.

| What happens | When | Can it block? |
|-------------|------|--------------|
| Prettier formats the file | After every Edit/Write | No |
| Edits to generated files are blocked | Before Edit/Write to `_generated-themes.scss`, `void-registry.json`, `void-physics.json` | Yes (blocks the edit) |
| Token scan runs | After editing `.scss` or `.svelte` files | No (informational) |

If a hook blocks an edit, Claude sees the error message and adjusts automatically.

---

## Agents (Specialized Reviewers)

These are read-only — they can only Read, Glob, and Grep. They cannot modify files.

Claude uses them automatically when relevant, or you can ask:

```
"Run the design reviewer on src/components/ui/Card.svelte"
"Check accessibility on the Toggle component"
```

| Agent | What it checks |
|-------|---------------|
| `design-reviewer` | 5 Laws compliance, token usage, physics coverage, SCSS imports |
| `a11y-checker` | ARIA attributes, keyboard nav, focus management, color contrast, motion |

---

## Rules (On-Demand Context)

These load automatically when Claude edits matching file types. No action needed.

| Rule | Loads when editing | Content |
|------|-------------------|---------|
| `page-composition.md` | `src/pages/**/*.astro`, `src/layouts/**/*.astro` | Thin route-shell pattern and spacing defaults |
| `component-usage.md` | all `.svelte` files | Registry-first component reuse and state rules |
| `styling.md` | all `.scss` files | Starter styling guardrails and hybrid protocol |
| `read-only-system.md` | `src/components/ui/**/*`, `src/components/icons/**/*`, `src/components/core/**/*`, `src/styles/**/*`, `src/types/**/*`, `src/config/design-tokens.ts` | Hard stop for shipped system files |
| `new-page.md` | `src/pages/**/*.astro` | Copy-paste scaffold for new routes |
| `tokens-reference.md` | `.scss`, `.svelte`, `.ts`, `src/styles/tailwind-theme.css` | Full token dictionary (spacing, colors, physics, z-index, typography) |
| `scss-reference.md` | `src/styles/**/*.scss`, `src/components/**/*.svelte` | SCSS toolkit (mixins, functions, state selectors) |
| `spacing-protocol.md` | `.svelte`, `.scss`, `.ts`, `.astro` | Spacing floors, layout gaps, common mistakes, page scaffold |

---

## Workflow Examples

### Building a new component

```
/new-component RangeSlider        1. Match-first scaffold (refuses if existing component covers the need)
  ... implement the component ...
/review src/components/ui/RangeSlider.svelte   2. Check compliance
/document RangeSlider             3. Update CHEAT-SHEET.md
```

### Reviewing recent work

```
/review                           Check all recent changes
```

Or ask directly: "Review my latest changes for design system violations and accessibility."
