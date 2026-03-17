<script lang="ts">
  import FormField from '@components/ui/FormField.svelte';
  import Selector from '@components/ui/Selector.svelte';
  import StatCard from '@components/ui/StatCard.svelte';
  import Toggle from '@components/ui/Toggle.svelte';

  const releaseOptions: SelectorOption[] = [
    { value: 'preview', label: 'Preview' },
    { value: 'staged', label: 'Staged' },
    { value: 'live', label: 'Live' },
  ];

  let siteName = $state('Nebula Studio');
  let releaseMode = $state<string | number | null>('preview');
  let productUpdates = $state(true);
</script>

<div class="container flex flex-col gap-2xl py-2xl">
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <p class="text-caption text-mute">Starter Example</p>
        <h1>Compose pages, not primitives.</h1>
        <p class="text-dim max-w-2xl">
          This starter ships the Void Energy system as a fixed surface. Build
          new pages in <code>src/pages/</code> and
          <code>src/components/app/</code>, and reuse the registry before
          creating anything.
        </p>
      </div>

      <div class="grid grid-cols-1 tablet:grid-cols-3 gap-lg">
        <StatCard
          label="Shipped primitives"
          value="40+"
          trend="up"
          delta="Registry-first"
        />
        <StatCard
          label="Edit target"
          value="Consumer files"
          trend="flat"
          delta="Compose only"
        />
        <StatCard
          label="System status"
          value="Locked"
          trend="up"
          delta="Validate before handoff"
        />
      </div>
    </div>
  </section>

  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Starter Pattern</h2>
        <p class="text-dim max-w-2xl">
          This example keeps the page shell thin and pushes interaction into a
          page-level Svelte screen.
        </p>
      </div>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <FormField
          label="Site name"
          hint="Use the shipped field wrappers for labels, hints, and errors."
        >
          {#snippet children({ fieldId, descriptionId, invalid })}
            <input
              id={fieldId}
              type="text"
              bind:value={siteName}
              aria-describedby={descriptionId}
              aria-invalid={invalid}
            />
          {/snippet}
        </FormField>

        <Selector
          label="Release mode"
          options={releaseOptions}
          bind:value={releaseMode}
        />

        <Toggle bind:checked={productUpdates} label="Product updates" />
      </div>

      <div class="flex flex-wrap gap-md">
        <button class="btn-cta">Save draft</button>
        <button class="btn-ghost">Clone the template page</button>
      </div>
    </div>
  </section>
</div>
