Build a page or app screen by composing existing Void Energy primitives and documented recipes.

## Input

`$ARGUMENTS` is the user brief for the page or screen.

If the brief is empty, ask the user what page should be built and what the desired mood is.

## Mandatory Order

1. Read `src/config/component-registry.json`
2. Read `AI-PLAYBOOK.md`
3. Read `COMPOSITION-RECIPES.md`
4. Read the nearest local page analog in `src/pages/`, `src/components/app/`, or app-level `src/components/`
5. Read `src/layouts/` only if the task changes the shared shell
6. Read any file-type rules under `.claude/rules/`

## Goal

Produce page-level work that reuses the shipped system instead of editing or reinventing it.

## Rules

- Prefer editing `src/pages/` and `src/components/app/`
- Edit `src/layouts/` only for shared shell changes
- Do not edit shipped system files in `src/components/ui/`, `src/components/icons/`, `src/components/core/`, `src/styles/`, `src/types/`, or `src/config/design-tokens.ts` unless the user explicitly asks for design-system work
- Use native HTML when the platform already gives the right semantics
- Use Tailwind for page composition and spacing
- Use shipped classes and components for material behavior
- If a request sounds like a missing primitive, prove it by naming the gap after checking the registry

## Working Steps

### 1. Break the brief into parts

Identify:

- page sections
- navigation needs
- forms or data entry
- lists, cards, or media
- charts or metrics
- async states
- desired visual mood

### 2. Map each part to shipped pieces

Use the registry to map each need to:

- a component
- an action
- a controller
- a documented recipe
- native HTML plus shipped classes

### 3. Choose the nearest recipe

Use `COMPOSITION-RECIPES.md` to anchor the page:

- dashboard / app home
- marketing / landing
- settings / preferences
- story / content hub
- analytics / reporting
- auth / onboarding

### 4. Implement with composition only

- Keep spacing generous
- Keep state in `data-*` or ARIA
- Use `surface-raised` and `surface-sunk` wrappers where appropriate
- Use `ActionBtn`, `IconBtn`, `tabs`, `sidebar`, `selector`, `toggle`, `tile`, and charts instead of hand-rolled substitutes

### 5. Verify

Run the narrowest checks that fit the change:

- `npm run check`
- `npm run scan` when `.svelte` or `.scss` changed
- `npm run test` when logic changed

## Output

After implementation, summarize:

- which existing primitives and recipes were used
- which files changed
- what was verified
- any real gaps found in the current system
