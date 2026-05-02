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

Canonical scale lives in `.claude/rules/spacing-protocol.md`. Quick reference for page work:

- Page wrapper: `container flex flex-col gap-2xl py-2xl`
- Section wrapper: `flex flex-col gap-xl`
- Card shell: `surface-raised p-lg flex flex-col gap-lg`
- Inner well: `surface-sunk p-md flex flex-col gap-md`

## Layout Notes

- Use the `Layout` default slot for page content
- Pass `breadcrumbs` only when the page needs them
- Avoid building bespoke page shells when `Layout` already provides the app frame
- Do not put page-specific sections, cards, or forms directly into `src/layouts/`

---

# Scaffold for New Pages

If this page is new or mostly empty, start from this scaffold and modify it to fit the brief.

## Route Shell

```astro
---
import Layout from '@layouts/Layout.astro';
import AccountPage from '@components/app/AccountPage.svelte';
---

<Layout title="Account">
  <AccountPage client:load />
</Layout>
```

## Page Screen

```svelte
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

## Keep These Defaults

- `.astro` file stays thin
- page-level `.svelte` file owns interactions
- app-level page screens live in `src/components/app/`
- `surface-raised p-lg gap-lg` for the main card
- `surface-sunk p-md gap-md` for the inner well
- `FormField` wraps each form control when labels or errors are needed

Clone this scaffold first. Replace content and primitives only after checking the registry.
