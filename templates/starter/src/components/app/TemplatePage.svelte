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
