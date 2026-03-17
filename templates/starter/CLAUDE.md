# Void Energy Starter

## 1. Hard Constraints

- Job: build pages and app features by composing the shipped system.
- Read `src/config/component-registry.json` before creating anything.
- Default edit targets: `src/pages/` and `src/components/app/`. Edit `src/layouts/` only for shared shell changes.
- Treat `src/components/ui/`, `src/components/icons/`, `src/components/core/`, `src/styles/`, `src/types/`, and `src/config/design-tokens.ts` as read-only.
- If a component exists, use it. If not, stop and ask.
- Tailwind owns page layout, spacing, and responsive structure.
- Shipped SCSS owns materials, shadows, blur, borders, and complex states.
- Use semantic tokens only. No raw px, hex, rgb, or hsl values.
- Use Svelte 5 runes only. No `export let`, `$:`, or `createEventDispatcher`.
- State belongs in `data-*` and ARIA, not modifier classes.
- Prefer native HTML when Void Energy already styles it correctly.
- No new stores for routine page work. Use `$state`, `modal`, `toast`, `user`, `voidEngine`.

## 2. How To Build A Page

Clone this structure first, then replace the content:

```astro
---
// src/pages/account.astro
import Layout from '@layouts/Layout.astro';
import AccountPage from '@components/app/AccountPage.svelte';
---

<Layout title="Account">
  <AccountPage client:load />
</Layout>
```

```svelte
<!-- src/components/app/AccountPage.svelte -->
<script lang="ts">
  import FormField from '@components/ui/FormField.svelte';
  import Toggle from '@components/ui/Toggle.svelte';

  let email = $state('');
  let alerts = $state(true);
</script>

<div class="container flex flex-col gap-2xl py-2xl">
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <p class="text-caption text-mute">Section label</p>
        <h1>Page title</h1>
        <p class="text-dim max-w-2xl">One short explanation of the page.</p>
      </div>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <FormField label="Email" hint="Used for notifications.">
          {#snippet children({ fieldId, descriptionId, invalid })}
            <input
              type="email"
              id={fieldId}
              bind:value={email}
              aria-describedby={descriptionId}
              aria-invalid={invalid}
            />
          {/snippet}
        </FormField>

        <Toggle bind:checked={alerts} label="Email alerts" />
      </div>

      <div class="flex flex-wrap gap-md">
        <button class="btn-cta">Save changes</button>
        <button class="btn-ghost">Cancel</button>
      </div>
    </div>
  </section>
</div>
```

Keep the route file thin. Put page body and interactions in the page-level `.svelte` file. Only edit `src/layouts/` when the shared app shell itself needs to change.
`src/pages/_template.astro` is an intentional scaffold route; clone it into real pages, then keep or delete the scaffold as needed.

## 3. How To Find Components

- Read `src/config/component-registry.json`.
- Search by need, category, related entries, and examples.
- Read the matching component entry and the nearest local analog.
- If the registry points to native HTML or a recipe, use that instead of inventing a wrapper.
- If nothing fits, stop and ask.

## 4. Common Patterns

- Card: `surface-raised p-lg flex flex-col gap-lg`
- Inner well: `surface-sunk p-md flex flex-col gap-md`
- Form: one `FormField` per input; stack fields with `flex flex-col gap-lg`
- Filters: `Selector`, `Switcher`, `Tabs`, `Combobox`, `SearchField`
- Text entry: `EditField`, `EditTextarea`, `GenerateField`, `GenerateTextarea`
- Actions: native `button` with `btn-*`, or `ActionBtn` / `IconBtn`
- List/grid: native `ul`, `ol`, or `table` inside a raised card or sunk well
- Modal: `modal.open(key, props, size)` or convenience methods like `modal.confirm(...)`
- Toast: `toast.show(...)`, `toast.promise(...)`, `toast.loading(...)`
- Navigation: `Layout` for shell, `Sidebar` / `Tabs` / `Breadcrumbs` for structure
- Charts: use the shipped chart/stat components before building data widgets by hand

## 5. Never Do This

- Do not edit shipped system files under `src/components/ui/`, `src/components/icons/`, `src/components/core/`, `src/styles/`, `src/types/`, or `src/config/design-tokens.ts`
- Do not create `Card.svelte`, `Button.svelte`, `Modal.svelte`, or other replacement primitives
- Do not create a new store for page-local state
- Do not hardcode spacing or colors
- Do not move materials into Tailwind classes
- Do not put page layout into SCSS
- Do not use class-based state like `is-active`, `open`, or `selected`
- Do not put complex page logic directly in `.astro` when a page-level `.svelte` file should own it
- Do not put page-specific body markup into `src/layouts/`

## 6. Commands

- `npm run validate`
- `npm run check`
- `npm run scan`
- `npm run test`

## 7. Decision Tree

- Need a page? Clone `src/pages/_template.astro` and pair it with a screen in `src/components/app/`.
- Need a component? Read `src/config/component-registry.json`. If it exists, use it. If not, stop and ask.
- Need a form? `FormField` wraps each input. Stack fields with `flex flex-col gap-lg`.
- Need a card? `surface-raised p-lg flex flex-col gap-lg`. Never build a custom card component.
- Need a modal? `modal.open(key, props, size)` or convenience helpers.
- Need a toast? `toast.show`, `toast.promise`, or `toast.loading`.
- Need state? `$state` for local state. `voidEngine`, `user`, `toast`, `modal` for global state.
- Need styling? Prefer composition first. If you truly need SCSS, keep it token-only and app-local.
