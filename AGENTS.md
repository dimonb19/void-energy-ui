# Agent Rules

Repo-wide instructions for coding agents working in `void-energy-ui`.

## Mission

- Preserve behavior while migrating or extending the Void Energy system.
- Prefer small, reversible edits that match existing patterns.
- Read the local code first. Do not invent patterns that the repo does not already use.

## Project Snapshot

- Stack: Astro 5, Svelte 5 runes, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`, no `tailwind.config.mjs` — bridge lives in `src/styles/tailwind-theme.css`), SCSS, Vitest.
- Design system: Void Energy UI for CoNexus.
- Dev server: `npm run dev` regenerates tokens and starts Astro.
- Key docs:
  - `README.md`
  - `CHEAT-SHEET.md`
  - `THEME-GUIDE.md`
  - `CONTRIBUTING.md`
  - `CLAUDE.md`
  - `.claude/rules/tokens-reference.md`
  - `.claude/rules/scss-reference.md`
  - `.claude/rules/spacing-protocol.md`

## Pre-Flight Before Editing

Before making changes:

1. Read the target file.
2. Read nearby files in the same directory that establish the local pattern.
3. Read the corresponding SCSS partial in `src/styles/components/` if the task touches UI.
4. Identify the nearest analog component, action, store, or utility and follow it closely.
5. Check `src/config/design-tokens.ts` and any relevant `.claude/rules/*.md` reference docs.
6. If the task affects a reusable UI API, inspect `src/config/component-registry.json`, `src/config/modal-registry.ts`, and the relevant `src/types/*.d.ts`.
7. Share a short pre-flight summary with the user: analog, related styles, relevant tokens, and plan.

Do not wait for approval unless the task is ambiguous, risky, or would change architecture.

## Non-Negotiables

### 1. Hybrid Protocol

- Tailwind owns page composition, responsive layout, spacing, and consumer-side geometry.
- SCSS owns visual physics, materials, complex state styling, and primitive-internal geometry.
- Do not move shadows, blur, borders, glows, or component material behavior into ad hoc Tailwind styling.
- Do not move page or section layout into SCSS.
- Avoid inline styles unless runtime positioning or browser APIs require them.

Examples:

- Correct: `class="flex flex-col gap-md p-lg"`
- Correct: `.card { @include surface-raised; }`
- Wrong: `.page-section { display: grid; gap: 24px; }`
- Wrong: `class="shadow-lg"`

### 2. Token Law

- Do not hardcode raw pixel values, arbitrary spacing, or hex/rgb/hsl colors in app code.
- Use semantic CSS variables from `src/config/design-tokens.ts` and Tailwind utilities bridged from those tokens.
- Examples of acceptable utility usage: `gap-md`, `p-lg`, `text-error`, `bg-canvas`.
- Keep reviewed exceptions marked with `// void-ignore`.

### 3. Svelte 5 Only

- Use runes: `$props`, `$state`, `$derived`, `$effect`, `$bindable`.
- Do not introduce `export let`, `$:`, `onMount`, `onDestroy`, or `createEventDispatcher`.
- Prefer callback props such as `onchange`, `onclose`, and `onsubmit`.
- Prefer snippets and `{@render ...}` over legacy slots when composition needs structure.

### 4. State Protocol

- Expose UI state through `data-*` and ARIA attributes, not modifier classes.
- Prefer `data-state`, `data-drop-position`, `aria-pressed`, `aria-checked`, `aria-expanded`, and similar semantic attributes.

### 5. Native-First Protocol

- Prefer styled native HTML before building custom widget behavior.
- Wrap native controls when needed, but do not rebuild platform behavior without a clear reason.
- Follow patterns like `Selector.svelte` for `<select>` and browser-backed popovers where appropriate.

### 6. Spacing Gravity

- Default to generous spacing.
- Floating surfaces should usually start at `p-lg gap-lg`.
- Sunk surfaces and field groups should usually start at `p-md gap-md`.
- If a layout feels tight, go one token size larger instead of smaller.

### 7. No Inventions

- Reuse existing mixins, actions, stores, registries, tokens, and component patterns.
- Do not add new abstractions, helper layers, or design-system rules unless the task truly requires them and existing patterns cannot handle it.

## Architecture Map

- `src/components/ui/`: reusable UI primitives.
- `src/components/icons/`: custom interactive icons only.
- `src/components/ui-library/`: showcase/demo pages for the design system.
- `src/components/core/`: app shell and theme bootstrap helpers.
- `src/actions/`: Svelte actions such as drag, kinetic text, morph, tooltip, and nav link behavior.
- `src/lib/`: shared runtime logic, controllers, validation, transitions, and utility modules.
- `src/adapters/void-engine.svelte.ts`: theme, mode, and physics singleton.
- `src/config/`: design tokens, registries, constants, and generated runtime artifacts.
- `src/styles/components/`: SCSS materials for shipped components.
- `src/types/`: ambient global shared types.

## Generated and Sync-Sensitive Files

Never hand-edit generated files:

- `src/styles/config/_generated-themes.scss`
- `src/styles/config/_fonts.scss`
- `src/config/font-registry.ts`
- `src/config/void-registry.json`
- `src/config/void-physics.json`

Instead:

- Edit `src/config/design-tokens.ts`
- Run `npm run build:tokens`

`src/config/component-registry.json` is not generated, but it is checked for accuracy. If you change a reusable UI component API, modal contract, shared utility exposure, or documented slots/snippets, keep the registry in sync and run `npm run check:registry`.

## Shared Types

- Do not export reusable types from implementation files such as `.svelte`, `src/lib/*`, `src/actions/*`, or `src/config/*`.
- If a type is reused across files, move it into a focused file under `src/types/`.
- Keep file-local types local. If a type is only used inside one file, remove `export`.
- Shared types in `src/types/` are ambient globals. Do not import them into app code.
- If no existing type file fits, create a small domain file such as `src/types/drag.d.ts` or `src/types/atmosphere-generator.d.ts`.

## Component and Styling Conventions

- SCSS component files should import the toolkit with `@use '../abstracts' as *;`.
- Default to `var(--radius-base)` for rounded corners and `var(--radius-full)` for pills.
- Retro physics force radius to zero; do not fight that with hardcoded values.
- Keep component APIs typed and explicit. Most reusable components include `class?: string` and callback props.
- Use snippets for structured children when the existing analog does.

### Icons

- Static icons come from `@lucide/svelte`.
- Custom animated or interactive icons live in `src/components/icons/`.
- Static icon usage should include `class="icon"`.
- Custom icon class names should follow the `icon-[name] icon` pattern.
- Icons inherit color via `currentColor`; set color at the usage site.
- Use `data-size` for icon sizing.

### Buttons

- Use `btn-icon` for icon-only buttons.
- Use `btn-ghost` for text-based secondary actions.
- Dismiss or cancel actions inside modals should use `btn-ghost btn-error`.

## Runtime Contracts

Import and use the existing singletons. Do not re-instantiate them.

- `voidEngine` from `@adapters/void-engine.svelte`
- `modal` from `@lib/modal-manager.svelte`
- `toast` from `@stores/toast.svelte`
- `layerStack` from `@lib/layer-stack.svelte`
- `shortcutRegistry` from `@lib/shortcut-registry.svelte`
- `user` from `@stores/user.svelte`

Available actions and helpers already in the system include:

- `morph`
- `tooltip`
- `navlink`
- `kinetic`
- `draggable`
- `dropTarget`
- `reorderByDrop`

The `<html>` element carries runtime state:

- `data-atmosphere`
- `data-physics`
- `data-mode`
- `data-auth`

Physics constraints are enforced by the engine:

- `glass` requires dark mode
- `retro` requires dark mode
- `flat` works with both light and dark

## Path Aliases

Use the configured aliases where they improve clarity:

- `@actions/*`
- `@adapters/*`
- `@components/*`
- `@config/*`
- `@lib/*`
- `@stores/*`
- `@styles/*`

## Verification

Run the narrowest command set that actually validates the work:

- `npm run check` for TypeScript, Svelte, and registry validation
- `npm run test` for logic, state, stores, actions, and utilities
- `npm run scan` after editing `.svelte` or `.scss` files
- `npm run build:tokens` after editing `src/config/design-tokens.ts`
- `npm run build` when changes affect integration, generated tokens, or page/build behavior
- `npm run format` when formatting is needed across touched files

When UI behavior or styling changes, verify the result across:

- all three physics presets: `glass`, `flat`, `retro`
- both color modes when supported: `light`, `dark`

## Working Style

- Scope changes tightly to the request.
- Preserve existing behavior unless the task explicitly changes it.
- Prefer extending an existing pattern over adding a new one.
- If documentation and code disagree, trust the codebase first, then update docs if the task calls for it.
