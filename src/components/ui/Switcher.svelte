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
    name="physics-selector"
  />

  PROPS:
  - options: Array of { value, label, icon? } objects
  - value: Currently selected value (bindable)
  - onchange: Callback when selection changes
  - name: ARIA label for the radiogroup
  - disabled: Disables all interaction
  - class: Additional CSS classes

  ACCESSIBILITY:
  - Uses role="radiogroup" with role="radio" children
  - Keyboard: Arrow keys navigate, Tab moves focus in/out
  - Roving tabindex: Only selected option is tabbable

  @see /_switcher.scss for physics-aware styling
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
  const inputId = id ?? `switcher-${Math.random().toString(36).slice(2, 9)}`;

  // Track references for focus management
  let optionRefs = $state<HTMLButtonElement[]>([]);

  function select(newValue: string) {
    if (disabled) return;
    value = newValue;
    onchange?.(newValue);
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    let nextIndex: number | null = null;

    // Arrow key navigation (ARIA radiogroup best practice)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = options.length - 1;
    }

    if (nextIndex !== null) {
      select(String(options[nextIndex].value));
      // Move focus to the newly selected option
      optionRefs[nextIndex]?.focus();
    }
  }
</script>

<div class="flex flex-col gap-xs justify-center {className}">
  {#if label}
    <label for={inputId} class="text-small">{label}</label>
  {/if}
  <div
    class="flex flex-row flex-wrap gap-sm justify-center {className}"
    id={inputId}
    role="radiogroup"
    aria-label={label}
    data-disabled={disabled || undefined}
  >
    {#each options as option, i (option.value)}
      <button
        bind:this={optionRefs[i]}
        type="button"
        class="switcher-option"
        role="radio"
        aria-checked={value === option.value}
        tabindex={value === option.value ? 0 : -1}
        {disabled}
        onclick={() => {
          if (value !== option.value) select(String(option.value));
        }}
        onkeydown={(e) => handleKeydown(e, i)}
      >
        {#if option.icon}
          <span class="switcher-icon" aria-hidden="true">
            {#if typeof option.icon === 'string'}
              {option.icon}
            {:else}
              {@const Icon = option.icon}
              <Icon />
            {/if}
          </span>
        {/if}
        <span class="switcher-label">{option.label}</span>
      </button>
    {/each}
  </div>
</div>
