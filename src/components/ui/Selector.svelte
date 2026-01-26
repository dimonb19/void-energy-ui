<!--
  SELECTOR COMPONENT
  A native <select> wrapper with label, placeholder, and layout control.

  USAGE:
  <Selector
    label="Heading Font"
    options={[
      { value: 'inter', label: 'Inter' },
      { value: 'lora', label: 'Lora' }
    ]}
    bind:value={selectedFont}
    placeholder="Select a font..."
    selectClass="flex-1"
  />

  PROPS:
  - options: Array of { value, label } objects
  - value: Currently selected value (bindable, null for placeholder)
  - onchange: Callback when selection changes
  - label: Optional label text above select
  - id: Optional ID for label association (auto-generated if omitted)
  - disabled: Disables the select
  - placeholder: Hidden first option text (value={null})
  - selectClass: CSS classes for inner <select>
  - align: Flex alignment ('start' | 'center' | 'end'), default 'center'
  - class: CSS classes for wrapper div

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
    placeholder,
    selectClass = '',
    align = 'center',
    class: className = '',
  }: SelectorProps = $props();

  // Auto-generate ID for label association if not provided
  const inputId = id ?? `select-${Math.random().toString(36).slice(2, 9)}`;

  // Normalize empty values: null, undefined, '' all mean "no selection"
  const isEmpty = (v: unknown): boolean => v == null || v === '';

  function handleChange(e: Event) {
    const target = e.currentTarget as HTMLSelectElement;
    const newValue = target.value === '' ? null : target.value;
    value = newValue;
    onchange?.(newValue as string);
  }
</script>

<div class="flex flex-col gap-xs items-{align} {className}">
  {#if label}
    <label for={inputId} class="text-small px-xs">{label}</label>
  {/if}
  <select id={inputId} {disabled} onchange={handleChange} class={selectClass}>
    {#if placeholder}
      <option value="" hidden selected={isEmpty(value)}>{placeholder}</option>
    {/if}
    {#each options as option (option.value)}
      <option
        value={option.value}
        selected={!isEmpty(value) && String(value) === String(option.value)}
        >{option.label}</option
      >
    {/each}
  </select>
</div>
