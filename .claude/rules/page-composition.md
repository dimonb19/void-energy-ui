---
paths:
  - "src/pages/**/*.astro"
  - "src/layouts/**/*.astro"
---

# Page Composition

For starter page work, `.astro` files are route shells first. `src/layouts/` owns the shared app shell, not page-specific body markup.

## Default Pattern

- Import `Layout` from `@layouts/Layout.astro`
- Import one page-level Svelte screen from `@components/app/...`
- Render the Svelte screen inside `<Layout>`
- Use `client:load` for interactive pages

## Keep Pages Thin

Do in `.astro`:

- route title
- breadcrumbs
- top-level shell wiring

Do in `src/layouts/*.astro` only when changing the shared shell:

- shared frame markup
- shared slots and wrappers
- shell-level scripts
- global chrome changes

Do in `src/components/app/*.svelte`:

- sections
- form state
- filters
- charts
- async actions

## Spacing Rhythm

- Page wrapper: `container flex flex-col gap-2xl py-2xl`
- Section wrapper: `flex flex-col gap-xl`
- Card shell: `surface-raised p-lg flex flex-col gap-lg`
- Inner well: `surface-sunk p-md flex flex-col gap-md`

## Layout Notes

- Use the `Layout` default slot for page content
- Pass `breadcrumbs` only when the page needs them
- Avoid building bespoke page shells when `Layout` already provides the app frame
- Do not put page-specific sections, cards, or forms directly into `src/layouts/`

If this page is new or mostly empty, read `.claude/rules/new-page.md` and start from that exact scaffold.
