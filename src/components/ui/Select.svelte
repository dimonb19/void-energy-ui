<!--
  SELECT COMPONENT
  A labeled select wrapper for consistent form styling.

  USAGE:
  <Select
    label="Heading Font"
    options={[
      { value: 'inter', label: 'Inter' },
      { value: 'lora', label: 'Lora' }
    ]}
    bind:value={selectedFont}
  />

  PROPS:
  - options: Array of { value, label } objects
  - value: Currently selected value (bindable)
  - onchange: Callback when selection changes
  - label: Optional label text above select
  - id: Optional ID for label association (auto-generated if omitted)
  - disabled: Disables the select
  - class: Additional CSS classes for wrapper

  @see /_inputs.scss for select styling
-->
<script lang="ts">
  let {
    options,
    value = $bindable(),
    onchange,
    label,
    id,
    disabled = false,
    class: className = '',
  }: SwitcherProps = $props();

  // Auto-generate ID for label association if not provided
  const inputId = id ?? `select-${Math.random().toString(36).slice(2, 9)}`;

  function handleChange(e: Event) {
    const newValue = (e.currentTarget as HTMLSelectElement).value;
    value = newValue;
    onchange?.(newValue);
  }
</script>

<div class="flex flex-col gap-xs items-center {className}">
  {#if label}
    <label for={inputId} class="text-small">{label}</label>
  {/if}
  <select id={inputId} {value} {disabled} onchange={handleChange}>
    {#each options as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>
