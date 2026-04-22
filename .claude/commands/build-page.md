Build or extend a page by composing existing Void Energy primitives and documented recipes. Covers both creating new pages and modifying existing ones.

## Input

`$ARGUMENTS` is the page brief. Examples:

```text
/build-page account settings page with profile form and notification toggles
/build-page extend /dashboard with a revenue-by-quarter chart section
/build-page new marketing landing for the atmospheres feature
```

If the brief is empty, ask for:

- **Target route** (new or existing — check `src/pages/` first)
- **Page purpose** (what task does it serve the user?)
- **Mood** (dense + data-heavy, airy + editorial, focused + transactional, etc.)

## Mandatory Read Order

Before writing anything, read:

1. [src/config/component-registry.json](../../src/config/component-registry.json) — authoritative inventory of shipped primitives
2. [AI-PLAYBOOK.md](../../AI-PLAYBOOK.md) — operating principles for page composition
3. [COMPOSITION-RECIPES.md](../../COMPOSITION-RECIPES.md) — page archetypes
4. [SYSTEM-PROMPT.md](../../SYSTEM-PROMPT.md) — condensed system contract (5 Laws, tokens, imports)
5. Nearest local analog in `src/pages/`, `src/components/app/`, or app-level `src/components/`
6. `src/layouts/` — only if the task changes the shared shell
7. Any file-type rules under [.claude/rules/](../rules/) that match the files you will touch

## Goal

Produce page-level work that **reuses the shipped system instead of editing or reinventing it**. Pages are consumers of the library, not extensions of it.

## Hard Rules

- Edit targets: `src/pages/` and `src/components/app/`. Edit `src/layouts/` only for shared shell changes.
- **Do not edit** shipped system files in `src/components/ui/`, `src/components/icons/`, `src/components/core/`, `src/styles/`, `src/types/`, or `src/config/design-tokens.ts` unless the user explicitly asks for design-system work. If a genuine gap appears, stop and surface it — do not reach across.
- Use native HTML when the platform already gives the right semantics.
- Tailwind owns composition and spacing. Shipped SCSS classes own material.
- If a request sounds like a missing primitive, prove it by naming the specific gap after checking the registry. Do not assume.
- Semantic tokens only. No raw px, hex, rgb, hsl.
- Svelte 5 runes only — `$props`, `$state`, `$derived`, `$effect`, `$bindable`. No `export let`, `$:`, `onMount`, `onDestroy`, `createEventDispatcher`.
- State in `data-*` and ARIA, never utility classes.

## Working Steps

### 1. Determine mode

- **New page:** target route does not exist in `src/pages/`. Scaffold both files (see §4).
- **Extend page:** target route exists. Locate the page-level Svelte screen in `src/components/app/` and extend in place.

### 2. Break the brief into parts

Identify:

- Page sections and their hierarchy
- Navigation needs (tabs, sidebar, breadcrumbs)
- Forms or data entry
- Lists, cards, or media
- Charts or metrics
- Async states (loading, error, empty)
- Desired visual mood

### 3. Map each part to shipped pieces

For each need, pick one of:

- A shipped component (from the registry)
- An action or controller (`use:tooltip`, `use:morph`, `use:kinetic`, `use:narrative`, `use:draggable`)
- A documented composition recipe
- Native HTML plus a shipped class (`<button class="btn-cta">`, `<input class="field">`)

Anchor the overall layout to one of `COMPOSITION-RECIPES.md`'s archetypes when possible:

- dashboard / app home
- marketing / landing
- settings / preferences
- story / content hub
- analytics / reporting
- auth / onboarding

### 4. Scaffold (new pages only)

Create both files:

1. **`src/pages/<route>.astro`** — thin shell. Imports `Layout`, imports the page-level Svelte screen, passes title and optional breadcrumbs, renders the screen with `client:load`.
2. **`src/components/app/<PascalCase>Page.svelte`** — owns local state, sections, forms, lists, charts, page actions.

Use the page scaffold from [templates/starter/src/pages/_template.astro](../../templates/starter/src/pages/_template.astro) as the reference shape. Keep the `.astro` file thin — all behavior lives in the Svelte screen.

### 5. Implement with composition only

- Spacing Gravity (Law 5): `surface-raised → p-lg gap-lg`, `surface-sunk → p-md gap-md`, between sections `gap-2xl`.
- State via `data-*` and ARIA. No `is-active`, `is-open`, `selected`.
- Use `surface-raised` and `surface-sunk` wrappers where appropriate.
- Prefer shipped primitives (`ActionBtn`, `IconBtn`, `Tabs`, `Sidebar`, `Selector`, `Toggle`, `StatCard`, charts) over hand-rolled substitutes.
- Typography: use `text-body`, `text-dim`, `text-mute` — don't reach for raw font sizes.

### 6. Handle async states

For anything that loads or mutates:

- Loading → `Skeleton` or `ProgressRing`
- Empty → `<p class="text-mute text-center p-lg">No items yet</p>` (plain text, muted, generous padding — no italic)
- Error → `toast.show(message, 'error')` or an inline field error via `FormField`

### 7. Verify

Run the narrowest checks that fit the change:

- `npm run check` (TypeScript + Svelte + registry)
- `npm run scan` when `.svelte` or `.scss` changed
- `npm run test` when logic changed
- Visual check across glass / flat / retro if the work involves new surfaces or physics-sensitive elements

## Output

After implementation, summarize:

- Mode (new page vs extend)
- Files created or changed
- Shipped primitives used
- Recipe anchor (if one was followed)
- Any real gaps in the current system that surfaced (name the specific missing primitive, not a vague wish)
- What was verified
