<!--
  SLIDER FIELD COMPONENT
  A range slider with optional preset snap points. When presets are provided,
  the slider locks to those values only — like a visual <select>. Without
  presets it degrades to a plain labeled range input.

  USAGE
  -------------------------------------------------------------------------
  <SliderField bind:value={quality} presets={qualityPresets} label="Quality" />
  <SliderField bind:value={volume} min={0} max={100} step={5} />
  -------------------------------------------------------------------------

  PROPS:
  - value: Current slider value (bindable)
  - presets: Array of { label, value } snap points (locks slider to preset values)
  - min, max, step: Native range input attributes (ignored when presets are provided; defaults: 0, 100, 1)
  - label: Optional label rendered above the slider
  - id: ID for the range input (auto-generated if omitted)
  - disabled: Disables slider and all preset buttons
  - onchange: Callback when value changes
  - class: Additional CSS classes on the wrapper

  BEHAVIOR:
  - When presets are provided, slider is locked to preset values (index-mapped range input)
  - Clicking a preset button snaps the slider to that preset's value
  - Active preset highlights when the current value matches exactly
  - State driven by data-state="active" (Law 4), not utility classes
  - Presets should be sorted ascending by value for correct visual ordering

  @see /_fields.scss for .slider-field styles
-->
<script lang="ts">
  interface SliderFieldProps {
    value: number;
    presets?: SliderFieldPreset[];
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    id?: string;
    disabled?: boolean;
    onchange?: (value: number) => void;
    class?: string;
  }

  let {
    value = $bindable(0),
    presets = [],
    min = 0,
    max = 100,
    step = 1,
    label,
    id,
    disabled = false,
    onchange,
    class: className = '',
  }: SliderFieldProps = $props();

  const componentId = $props.id();
  const generatedInputId = `slider-${componentId}`;
  const inputId = $derived(id ?? generatedInputId);

  const isStrict = $derived(presets.length > 0);

  const activePresetValue = $derived(
    presets.find((p) => p.value === value)?.value ?? null,
  );

  // Index of current value in presets (for strict mode slider position)
  const activeIndex = $derived(presets.findIndex((p) => p.value === value));

  // Strict mode: snap to first preset if value doesn't match any
  $effect(() => {
    if (isStrict && activeIndex === -1) {
      value = presets[0].value;
    }
  });

  function snapTo(preset: SliderFieldPreset) {
    if (disabled) return;
    value = preset.value;
    onchange?.(value);
  }

  function handleInput(e: Event) {
    const raw = Number((e.target as HTMLInputElement).value);
    if (isStrict) {
      value = presets[raw].value;
    } else {
      value = raw;
    }
    onchange?.(value);
  }
</script>

<div
  class="slider-field flex flex-col gap-xs {className}"
  data-disabled={disabled || undefined}
>
  {#if label}
    <label for={inputId} class="text-small px-xs">{label}</label>
  {/if}

  <input
    id={inputId}
    type="range"
    min={isStrict ? 0 : min}
    max={isStrict ? presets.length - 1 : max}
    step={isStrict ? 1 : step}
    value={isStrict ? activeIndex : value}
    {disabled}
    oninput={handleInput}
  />

  {#if presets.length > 0}
    <div
      class="slider-presets flex justify-between"
      role="group"
      aria-label="Presets"
    >
      {#each presets as preset (preset.value)}
        <button
          type="button"
          class="slider-preset btn-void"
          data-state={activePresetValue === preset.value ? 'active' : ''}
          {disabled}
          onclick={() => snapTo(preset)}
          aria-pressed={activePresetValue === preset.value}
        >
          {preset.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
