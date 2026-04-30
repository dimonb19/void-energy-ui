<!--
  COLOR FIELD COMPONENT
  A color picker with hex value display and swatch preview.

  USAGE
  -------------------------------------------------------------------------
  <ColorField bind:value={color} />
  <ColorField bind:value={color} class="w-full" />
  -------------------------------------------------------------------------

  PROPS:
  - value: Hex color string (bindable, e.g. "#ff5733")
  - id: Optional explicit ID for the native input
  - onchange: Callback when color changes
  - disabled: Disables the input
  - invalid: Maps to aria-invalid on the input (for FormField wiring)
  - describedby: Maps to aria-describedby on the input (for FormField wiring)
  - class: Additional CSS classes on the wrapper
  - ...rest: All native input[type="color"] attributes

  BEHAVIOR:
  - Clicking the swatch or hex text opens the native color picker
  - Hex value updates reactively as the user picks colors
  - Swatch preview in left slot, monospace hex in the display area
  - The native input is the form control — label, validation, and a11y
    attributes wire to it directly via FormField's snippet contract.

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface ColorFieldProps
    extends Omit<
      HTMLInputAttributes,
      'value' | 'type' | 'onchange' | 'oninput'
    > {
    value: string;
    id?: string;
    onchange?: (value: string) => void;
    invalid?: boolean;
    describedby?: string;
    class?: string;
  }

  let {
    value = $bindable('#000000'),
    id,
    disabled = false,
    invalid = false,
    describedby,
    onchange,
    class: className = '',
    ...rest
  }: ColorFieldProps = $props();

  const componentId = $props.id();
  const generatedInputId = `color-${componentId}`;
  const inputId = $derived(id ?? generatedInputId);

  function handleInput(e: Event) {
    value = (e.target as HTMLInputElement).value;
    onchange?.(value);
  }
</script>

<div
  class="field color-field {className}"
  data-disabled={disabled || undefined}
>
  <!-- Native color input — visually hidden but focusable and form-participating -->
  <input
    id={inputId}
    type="color"
    {value}
    {disabled}
    oninput={handleInput}
    class="color-field-native"
    aria-invalid={invalid || undefined}
    aria-describedby={describedby}
    {...rest}
  />

  <!-- Label wraps the display area — clicking it activates the native input -->
  <label class="color-field-display" for={inputId}>
    <span class="field-slot-left">
      <span class="color-field-swatch" style:background-color={value}></span>
    </span>
    <span class="color-field-hex">{value.toUpperCase()}</span>
  </label>
</div>
