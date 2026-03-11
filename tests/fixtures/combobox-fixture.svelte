<script lang="ts">
  import Combobox from '@components/ui/Combobox.svelte';
  import type { ComboboxOption } from '@components/ui/Combobox.svelte';

  interface Props {
    options?: ComboboxOption[];
    value?: string | number | null;
    name?: string;
    allowCustomValue?: boolean;
    disabled?: boolean;
    id?: string;
  }

  let {
    options = [
      { value: 'fr', label: 'France' },
      { value: 'de', label: 'Germany' },
      { value: 'jp', label: 'Japan', disabled: true },
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
    ],
    value = $bindable<string | number | null>(null),
    name,
    allowCustomValue = false,
    disabled = false,
    id = 'country-combobox',
  }: Props = $props();

  let open = $state(false);
</script>

<form>
  <Combobox
    {options}
    bind:value
    bind:open
    {name}
    {allowCustomValue}
    {disabled}
    {id}
    placeholder="Select a country..."
  />
</form>

<p data-testid="committed">{value ?? 'none'}</p>
<p data-testid="open-state">{open ? 'open' : 'closed'}</p>

<!-- Escape hatch for testing external open control without going through the input -->
<button
  type="button"
  data-testid="open-externally"
  onclick={() => (open = true)}
>
  Open externally
</button>
