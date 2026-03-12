<!--
  SWITCHER COMPONENT
  A segmented control for selecting between N options.

  USAGE:
  <Switcher
    options={[
      { value: 'glass', label: 'Glass' },
      { value: 'flat', label: 'Flat' },
      { value: 'retro', label: 'Retro' }
    ]}
    bind:value={selectedPhysics}
  />

  PROPS:
  - options: Array of { value, label, icon? } objects
  - value: Currently selected value (bindable)
  - onchange: Callback when selection changes
  - label: Optional visible/accessibility label
  - name: Optional radio group name override for native form submission
  - required: Marks the group as required
  - form: Associates the radios with a specific form
  - disabled: Disables all interaction
  - class: Additional CSS classes

  PER-OPTION DISABLED:
  Each option may carry `disabled: true` to grey it out individually.
  The native <input> is disabled, preventing keyboard and programmatic selection.
  SCSS targets `.switcher-option:has(.switcher-native:disabled)` for visual muting.

  ACCESSIBILITY:
  - Uses native radio inputs with shared name
  - Keyboard: browser-native radio behavior (Tab + Arrow keys)

  @see /_inputs.scss for physics-aware styling
-->
<script lang="ts">
  import type { Component } from 'svelte';
  import { toNativeControlState } from '@lib/native-control-foundation';

  interface SwitcherOption {
    value: string | number | null;
    label: string;
    icon?: string | Component;
    disabled?: boolean;
  }

  interface SwitcherProps {
    options: SwitcherOption[];
    value: string | number | null;
    onchange?: (value: string | number | null) => void;
    label?: string;
    id?: string;
    name?: string;
    required?: boolean;
    form?: string;
    disabled?: boolean;
    class?: string;
  }

  let {
    options,
    value = $bindable(),
    onchange,
    label,
    id,
    name,
    required = false,
    form,
    disabled = false,
    class: className = '',
  }: SwitcherProps = $props();

  // Shared native-control identity (stable per component instance)
  const componentId = $props.id();
  const generatedInputId = `switcher-${componentId}`;
  const inputId = $derived(id ?? generatedInputId);
  const generatedGroupName = $derived(`${inputId}-group`);
  const groupName = $derived(name ?? generatedGroupName);
  const labelId = $derived(`${inputId}-label`);

  function isOptionDisabled(optionValue: string | number | null): boolean {
    if (disabled) return true;
    return (
      options.find((o) => Object.is(o.value, optionValue))?.disabled ?? false
    );
  }

  function select(newValue: string | number | null) {
    if (isOptionDisabled(newValue)) return;
    value = newValue;
    onchange?.(newValue);
  }

  function isOptionActive(optionValue: string | number | null): boolean {
    return Object.is(value, optionValue);
  }

  function handleChange(nextValue: string | number | null) {
    if (!isOptionActive(nextValue)) {
      select(nextValue);
    }
  }
</script>

<div class="switcher-wrapper flex flex-col gap-xs justify-center {className}">
  {#if label}
    <p id={labelId} class="text-small">{label}</p>
  {/if}

  <fieldset
    class="switcher-group flex flex-row flex-wrap gap-sm justify-center"
    id={inputId}
    aria-labelledby={label ? labelId : undefined}
    aria-label={label ? undefined : 'Switcher'}
    {disabled}
  >
    {#each options as option}
      {@const optionActive = isOptionActive(option.value)}
      {@const optionDisabled = disabled || option.disabled}

      <label
        class="switcher-option btn"
        data-state={toNativeControlState(optionActive)}
      >
        <input
          type="radio"
          class="switcher-native"
          name={groupName}
          value={String(option.value)}
          checked={optionActive}
          {required}
          {form}
          disabled={optionDisabled}
          onchange={() => handleChange(option.value)}
        />

        <span class="switcher-option-content">
          {#if option.icon}
            <span class="switcher-icon" aria-hidden="true">
              {#if typeof option.icon === 'string'}
                {option.icon}
              {:else}
                {@const Icon = option.icon}
                <Icon class="icon" />
              {/if}
            </span>
          {/if}
          <span class="switcher-label">{option.label}</span>
        </span>
      </label>
    {/each}
  </fieldset>
</div>
