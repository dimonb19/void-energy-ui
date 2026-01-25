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
  - className: Additional CSS classes
  - size: Toggle size variant ('sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl')
  - iconOn: ON state icon, left side (optional, no default)
  - iconOff: OFF state icon, right side (default: circle ○)
  - hideIcons: Hide icons entirely

  ACCESSIBILITY:
  - Uses role="switch" with aria-checked
  - Keyboard: Space/Enter toggles state
  - Focus visible ring on keyboard navigation

  @see /_toggle.scss for physics-aware styling
-->
<script lang="ts">
  import type { Component } from 'svelte';

  interface ToggleProps {
    checked: boolean;
    onchange?: (checked?: boolean) => void;
    label?: string;
    id?: string;
    disabled?: boolean;
    className?: string;
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
    className = '',
    size,
    iconOn,
    iconOff,
    hideIcons = false,
  }: ToggleProps = $props();

  // Auto-generate ID for label association if not provided
  const inputId = id ?? `toggle-${Math.random().toString(36).slice(2, 9)}`;

  function toggle() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }
</script>

<!-- Default OFF indicator (circle, no default ON icon) -->
{#snippet DefaultOff()}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="5" />
  </svg>
{/snippet}

<div class="toggle-wrapper inline-flex items-center gap-xs {className}">
  {#if label}
    <label for={inputId} class="toggle-label text-small">
      {label}
    </label>
  {/if}

  <button
    id={inputId}
    type="button"
    class="toggle btn-void"
    data-size={size}
    role="switch"
    aria-checked={checked}
    aria-label={label ?? 'Toggle'}
    {disabled}
    onclick={toggle}
  >
    <span class="toggle-track">
      {#if !hideIcons}
        <!-- Left (ON) icon: only rendered if custom iconOn provided -->
        {#if iconOn}
          <span class="toggle-content toggle-content-left" aria-hidden="true">
            {#if typeof iconOn === 'string'}
              {iconOn}
            {:else}
              {@const IconOn = iconOn}
              <IconOn />
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
              <IconOff />
            {/if}
          {:else}
            {@render DefaultOff()}
          {/if}
        </span>
      {/if}

      <span class="toggle-thumb" aria-hidden="true"></span>
    </span>
  </button>
</div>
