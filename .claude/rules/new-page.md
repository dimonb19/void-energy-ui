---
paths:
  - "src/pages/**/*.astro"
---

# New Page Scaffold

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
