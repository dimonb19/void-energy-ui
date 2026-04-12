# Claude Code Setup — Quick Reference

## Directory Map

```
.claude/
  commands/                  On-demand skills (invoke with /name)
    document.md              Document recent changes
    build-page.md            Compose a page with shipped primitives
    new-page.md              Scaffold a new route + page-level screen
    new-component.md         Scaffold a new component
    migrate.md               Migrate legacy → Void Energy
    review.md                Check design system compliance
    showcase.md              Generate ui-library demo page

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

### `/new-page`

Creates a new route using the standard starter pattern: thin `.astro` shell plus page-level `.svelte` screen.

```
/new-page "account settings page"
```

How it works:
1. Reads the registry, playbook, recipes, and page scaffold rules
2. Creates a route file that imports `Layout` and a page-level Svelte screen
3. Builds the page screen from shipped primitives instead of inventing new ones
4. Leaves the system files untouched

### `/new-component ComponentName`

Scaffolds a new component with the correct Void Energy patterns.

```
/new-component DataGrid
```

Creates:
- `src/components/ui/DataGrid.svelte` — Svelte 5 runes, props interface, data-attributes
- `src/styles/components/_datagrid.scss` — surface-raised, physics blocks, token-only values

### `/migrate ComponentName`

Migrates all **consumers** of a `-legacy` component to use its Void Energy replacement.

```
/migrate Modal
/migrate Toggle
```

How it works:
1. Reads both `Modal.svelte` (new) and `Modal-legacy.svelte` (old) to build an API transformation map
2. Finds all files importing the `-legacy` version
3. Updates each consumer: imports, prop names, `on:event` → callback props, slots → snippets
4. Reports which `-legacy` files are safe to delete (zero remaining consumers)

**Never modifies the components themselves** — only their consumers.

### `/review`

Checks code for design system violations (the 5 Laws).

```
/review                              (all recent changes)
/review src/components/ui/Card.svelte (specific file)
```

Outputs: `file:line [Law N] violation → fix` for each issue found.

### `/showcase ComponentName`

Generates an interactive demo page in the ui-library.

```
/showcase DataGrid
```

Creates: `src/components/ui-library/SectionName.svelte` with live demos, props annotations, and explanations.

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
/new-component RangeSlider        1. Scaffold files
  ... implement the component ...
/review src/components/ui/RangeSlider.svelte   2. Check compliance
/showcase RangeSlider             3. Create demo page
/document RangeSlider             4. Update CHEAT-SHEET.md
```

### Migrating a legacy component (strangler fig pattern)

```
                                         Setup (one-time per component):
                                         - New Void Energy component → Modal.svelte
                                         - Old component renamed   → Modal-legacy.svelte

/migrate Modal                    1. Migrate all consumers from -legacy → new
/review                           2. Verify compliance
  ... test in browser across glass/flat/retro ...
/document Modal                   3. Document the result
  ... delete Modal-legacy.svelte when zero consumers remain ...
```

Track progress: `grep -r "legacy" src/ | wc -l` — when it hits zero, migration is complete.

### Reviewing recent work

```
/review                           Check all recent changes
```

Or ask directly: "Review my latest changes for design system violations and accessibility."

---

## Production Migration Tips

For migrating a large codebase using the strangler fig pattern:

1. **Import the foundation first.** Copy Void Energy's `styles/abstracts/`, `styles/tailwind-theme.css`, `config/design-tokens.ts`, VoidEngine, and the `.claude/` directory into the big repo. Rename the template to `CLAUDE.md` and fill in Section 0 (Legacy Patterns). Note: Void Energy uses Tailwind v4 via `@tailwindcss/vite` — there is no `tailwind.config.mjs` file to copy. Consumers must also be on v4 (or willing to migrate).

2. **Rename old files with `-legacy` suffix.** `Modal.svelte` → `Modal-legacy.svelte`, `/styles/` → `/styles-legacy/`. The Void Energy versions take the clean names.

3. **Start small.** Pick a component with few consumers first (`/migrate Toggle`) to build confidence.

4. **One component per session.** Run `/migrate ComponentName` → `/review` → test → `/document`. Keep changes reviewable and reversible.

5. **Test all 3 physics presets.** Every migrated consumer must work in glass, flat, and retro modes. Switch `data-physics` on `<html>` in dev tools.

6. **Track progress.** `grep -r "legacy" src/ | wc -l` — this number should decrease every session.

7. **Delete `-legacy` files** only when `/migrate` reports zero remaining consumers. Never before.

8. **Use agents for audits.** Ask "Run the design reviewer on src/components/" to scan an entire directory at once.

9. **The hooks are your safety net.** Auto-format keeps code clean. Protect-generated prevents accidents. Token-scan can flag common raw-value misses early, but it is advisory.
