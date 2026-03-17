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
  - ...rest: Native <select> attributes (name, required, form, aria-*, etc.)

  @see /_inputs.scss for select styling
-->
<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';

  interface SelectorProps
    extends Omit<HTMLSelectAttributes, 'value' | 'onchange'> {
    options: SelectorOption[];
    value?: string | number | null;
    onchange?: (value: string | number | null) => void;
    label?: string;
    id?: string;
    disabled?: boolean;
    /** Hidden placeholder option text (renders as first option with value={null}) */
    placeholder?: string;
    /** CSS classes applied to the inner <select> element */
    selectClass?: string;
    /** Flex alignment for the wrapper (default: 'center') */
    align?: 'start' | 'center' | 'end';
    /** CSS classes applied to the wrapper div */
    class?: string;
  }

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
    ...rest
  }: SelectorProps = $props();

  // Auto-generate ID for label association if not provided
  const componentId = $props.id();
  const generatedInputId = `select-${componentId}`;
  const inputId = $derived(id ?? generatedInputId);
  const placeholderOffset = $derived(placeholder ? 1 : 0);
  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
  } as const;

  function serializeOptionValue(optionValue: string | number | null): string {
    return String(optionValue);
  }

  const selectedOptionIndex = $derived(
    options.findIndex((option) => Object.is(option.value, value)),
  );

  const placeholderSelected = $derived(
    Boolean(placeholder) && selectedOptionIndex === -1,
  );

  function handleChange(e: Event) {
    const target = e.currentTarget as HTMLSelectElement;
    const nextIndex = target.selectedIndex - placeholderOffset;
    const newValue =
      nextIndex >= 0 && nextIndex < options.length
        ? options[nextIndex].value
        : null;
    value = newValue;
    onchange?.(newValue);
  }
</script>

<div class="flex flex-col gap-xs {alignClass[align]} {className}">
  {#if label}
    <label for={inputId} class="text-small px-xs">{label}</label>
  {/if}
  <select
    id={inputId}
    {disabled}
    onchange={handleChange}
    class={selectClass}
    {...rest}
  >
    {#if placeholder}
      <option value="" disabled hidden selected={placeholderSelected}
        >{placeholder}</option
      >
    {/if}
    {#each options as option, index (index)}
      <option
        value={serializeOptionValue(option.value)}
        selected={selectedOptionIndex === index}>{option.label}</option
      >
    {/each}
  </select>
</div>
