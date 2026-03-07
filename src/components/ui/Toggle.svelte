<!--
  TOGGLE COMPONENT
  A physics-aware switch for boolean on/off states.

  USAGE EXAMPLES
  -------------------------------------------------------------------------
  Basic toggle (minimalist: circle fades when ON):
  <Toggle bind:checked={enabled} />

  With external label:
  <Toggle bind:checked={enabled} label="Enable notifications" />

  Custom icons (iconOn=left/visible when ON, iconOff=right/visible when OFF):
  <Toggle bind:checked={darkMode} iconOn={MoonIcon} iconOff={SunIcon} />

  Sized toggle:
  <Toggle size="lg" bind:checked={enabled} />

  Hide icons entirely:
  <Toggle bind:checked={enabled} hideIcons />
  -------------------------------------------------------------------------

  PROPS:
  - checked: Boolean state (bindable)
  - onchange: Callback when state changes
  - label: Accessible label text (displayed externally)
  - id: Optional ID for label association
  - disabled: Disables interaction
  - class: Additional CSS classes
  - size: Toggle size variant ('sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl')
  - iconOn: ON state icon, left side (optional, no default)
  - iconOff: OFF state icon, right side (default: circle ○)
  - hideIcons: Hide icons entirely

  ACCESSIBILITY:
  - Uses native checkbox semantics
  - Keyboard: browser-native checkbox behavior
  - Focus visible ring on keyboard navigation

  @see /_toggle.scss for physics-aware styling
-->
<script lang="ts">
  import type { Component } from 'svelte';
  import { Circle } from '@lucide/svelte';
  import { toNativeControlState } from '@lib/native-control-foundation';

  interface ToggleProps {
    checked: boolean;
    onchange?: (checked?: boolean) => void;
    label?: string;
    id?: string;
    disabled?: boolean;
    class?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    iconOn?: string | Component;
    iconOff?: string | Component;
    hideIcons?: boolean;
  }

  let {
    checked = $bindable(false),
    onchange,
    label,
    id,
    disabled = false,
    class: className = '',
    size,
    iconOn,
    iconOff,
    hideIcons = false,
  }: ToggleProps = $props();

  // Shared native-control identity (stable per component instance)
  const componentId = $props.id();
  const generatedInputId = `toggle-${componentId}`;
  const inputId = $derived(id ?? generatedInputId);

  let checkedState = $derived(toNativeControlState(checked));

  function handleChange() {
    onchange?.(checked);
  }
</script>

<!-- Default OFF indicator (circle, no default ON icon) -->
{#snippet DefaultOff()}
  <Circle class="icon" aria-hidden="true" />
{/snippet}

<div class="toggle-wrapper inline-flex items-center gap-xs {className}">
  {#if label}
    <label for={inputId} class="toggle-label text-small">
      {label}
    </label>
  {/if}

  <div class="toggle" data-size={size} data-state={checkedState}>
    <input
      id={inputId}
      type="checkbox"
      class="toggle-native"
      bind:checked
      aria-label={label ? undefined : 'Toggle'}
      {disabled}
      onchange={handleChange}
    />
    <span class="toggle-track">
      {#if !hideIcons}
        <!-- Left (ON) icon: only rendered if custom iconOn provided -->
        {#if iconOn}
          <span class="toggle-content toggle-content-left" aria-hidden="true">
            {#if typeof iconOn === 'string'}
              {iconOn}
            {:else}
              {@const IconOn = iconOn}
              <IconOn class="icon" />
            {/if}
          </span>
        {/if}

        <!-- Right (OFF) icon: custom or default circle -->
        <span class="toggle-content toggle-content-right" aria-hidden="true">
          {#if iconOff}
            {#if typeof iconOff === 'string'}
              {iconOff}
            {:else}
              {@const IconOff = iconOff}
              <IconOff class="icon" />
            {/if}
          {:else}
            {@render DefaultOff()}
          {/if}
        </span>
      {/if}

      <span class="toggle-thumb" aria-hidden="true"></span>
    </span>
  </div>
</div>
