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
  - disabled: Disables all interaction
  - class: Additional CSS classes

  ACCESSIBILITY:
  - Uses native radio inputs with shared name
  - Keyboard: browser-native radio behavior (Tab + Arrow keys)

  @see /_inputs.scss for physics-aware styling
-->
<script lang="ts">
  import type { Component } from 'svelte';
  import {
    toNativeControlState,
    toNativeControlValue,
  } from '@lib/native-control-foundation';

  interface SwitcherOption {
    value: string | number | null;
    label: string;
    icon?: string | Component;
  }

  interface SwitcherProps {
    options: SwitcherOption[];
    value: string | number | null;
    onchange?: (value: string) => void;
    label?: string;
    id?: string;
    disabled?: boolean;
    class?: string;
  }

  let {
    options,
    value = $bindable(),
    onchange,
    label,
    id,
    disabled = false,
    class: className = '',
  }: SwitcherProps = $props();

  // Shared native-control identity (stable per component instance)
  const componentId = $props.id();
  const generatedInputId = `switcher-${componentId}`;
  const inputId = $derived(id ?? generatedInputId);
  const groupName = $derived(`${inputId}-group`);
  const labelId = $derived(`${inputId}-label`);

  let selectedValue = $derived(toNativeControlValue(value));

  function select(newValue: string | number | null) {
    if (disabled) return;
    const next = toNativeControlValue(newValue);
    value = next;
    onchange?.(next);
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
    {#each options as option (option.value)}
      {@const optionValue = toNativeControlValue(option.value)}
      {@const optionActive = selectedValue === optionValue}

      <label
        class="switcher-option btn"
        data-state={toNativeControlState(optionActive)}
      >
        <input
          type="radio"
          class="switcher-native"
          name={groupName}
          value={optionValue}
          checked={optionActive}
          {disabled}
          onchange={() => {
            if (!optionActive) select(option.value);
          }}
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
