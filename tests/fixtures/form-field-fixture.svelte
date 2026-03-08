<script lang="ts">
  import FormField from '@components/ui/FormField.svelte';

  let {
    hint = 'Helpful guidance',
    error = '',
  }: {
    hint?: string;
    error?: string;
  } = $props();

  let value = $state('');
</script>

<FormField label="Email" {hint} {error}>
  {#snippet children({ fieldId, descriptionId, invalid })}
    <input
      id={fieldId}
      type="text"
      bind:value
      aria-describedby={descriptionId}
      aria-invalid={invalid}
    />
  {/snippet}
</FormField>
