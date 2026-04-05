# AI Playbook

Compact operating guide for AI agents building apps with Void Energy.

## Job

Build pages and app screens by composing the shipped system.

- Reuse existing primitives, actions, controllers, layouts, and native HTML patterns.
- In the starter repo, prefer editing `src/pages/` and `src/components/app/`. Edit `src/layouts/` only for shared shell changes.
- Do not edit shipped system files in `src/components/ui/`, `src/components/icons/`, `src/components/core/`, `src/styles/`, `src/types/`, or `src/config/design-tokens.ts` unless the task explicitly asks for design-system work.

## First Stops

Read these in order before inventing anything:

1. `src/config/component-registry.json`
2. `COMPOSITION-RECIPES.md`
3. `CLAUDE.md`
4. `.claude/rules/*.md` relevant to the file type

Use `CHEAT-SHEET.md` for deeper examples only after the compact sources above.

## Build Order

1. Parse the user request into page goals, content blocks, interactions, and mood.
2. Check the component registry for shipped primitives, actions, controllers, and patterns.
3. Check `COMPOSITION-RECIPES.md` for the nearest page archetype.
4. Read the nearest local page analog in `src/pages/`, `src/components/app/`, or app-level `src/components/`. Read `src/layouts/` only if the task touches the shared shell.
5. Compose the page with shipped pieces.
6. Run the narrow verification set for the touched files.

## Compose-Only Rules

- There is no prize for creating a new primitive when a shipped one already exists.
- Native HTML is valid Void Energy output when the system styles it already.
- Tailwind owns page composition, responsive layout, spacing, and consumer-side geometry.
- SCSS owns visual physics, materials, and primitive-internal geometry. Do not move those concerns into Tailwind.
- State belongs in `data-*` and ARIA attributes, not modifier classes.
- Before writing Tailwind classes, check `.claude/rules/tailwind-registry.md` — standard Tailwind scales (numeric spacing, stock colors, default breakpoints) are fully replaced with semantic tokens.

## No-Invention Matrix

If the request sounds like this, use the shipped system first:

- Choice picker: `selector`, `switcher`, `tabs`, `combobox`
- Boolean control: `toggle`
- Text input: `edit-field`, `generate-field`, `edit-textarea`, `generate-textarea`, `search-field`
- Navigation: `sidebar`, `breadcrumbs`, `tabs`, `dropdown`, `navlink`
- Actions: native `<button>` with `btn-*`, `ActionBtn`, `IconBtn`
- Feedback: `toast`, `modal`, `portal-loader`, `skeleton`, `progress-ring`
- Data display: `tile`, `stat-card`, `line-chart`, `bar-chart`, `donut-chart`
- Motion: `tooltip`, `morph`, `kinetic`, `narrative`
- Drag and reorder: `draggable`, `dropTarget`, `reorderByDrop`, `resolveReorderByDrop`

If the request still appears uncovered, prove it by checking the registry first and naming the missing capability explicitly.

## Page Defaults

- Page wrapper: `container flex flex-col gap-2xl py-2xl`
- Section wrapper: `flex flex-col gap-xl`
- Floating surfaces: `surface-raised p-lg flex flex-col gap-lg`
- Sunk wells: `surface-sunk p-md flex flex-col gap-md`
- Tight coupling only: `gap-xs` for label -> input, icon + text, title + subtitle

## Verification

Run the narrowest set that matches the change:

- `npm run check` for TS/Svelte and registry validation
- `npm run scan` after editing `.svelte` or `.scss`
- `npm run test` when logic or stores change
- `npm run build:tokens` after editing `src/config/design-tokens.ts`

When UI changed, verify across `glass`, `flat`, and `retro`, and both modes where supported.

## Repo Roles

This repo is the editable source of the system.

- Design-system work: edit `src/components/ui/`, `src/styles/`, `src/config/`, `src/lib/`, `src/actions/`, `src/stores/`, and registry docs only when the task is about the system itself.
- App-building work: stay in consumer files and compose with what ships.

The future starter should copy the starter-specific material from `templates/starter/`.
