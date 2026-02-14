<!--
  EDIT FIELD COMPONENT
  A readonly input that can be unlocked for editing with confirm/reset actions.

  USAGE
  -------------------------------------------------------------------------
  <EditField bind:value={name} placeholder="Agent name..." />
  <EditField bind:value={name} onconfirm={saveName} />
  -------------------------------------------------------------------------

  PROPS:
  - value: Text value (bindable — updated on confirm)
  - placeholder: Placeholder text
  - disabled: Disables all interaction
  - onconfirm: Callback when edit is confirmed (receives new value)
  - class: Additional CSS classes on the wrapper

  STATES:
  - idle: Input is readonly, Edit icon shown on right
  - editing: Input is editable, Undo on left + Check on right
  - unchanged: Both Undo and Check are disabled when draft matches original value

  BEHAVIOR:
  - Click Edit → unlocks input, shows Undo (left) + Check (right)
  - Click Check → confirms edit, calls onconfirm, returns to idle
  - Click Undo → restores original value, returns to idle
  - Undo + Check disabled when text hasn't changed
  - Hovering Check/Undo triggers their icon animations
  - Enter confirms, Escape resets

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import { Check } from '@lucide/svelte';
  import Edit from '@components/icons/Edit.svelte';
  import Undo from '@components/icons/Undo.svelte';

  interface EditFieldProps {
    value: string;
    placeholder?: string;
    disabled?: boolean;
    onconfirm?: (value: string) => void;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    onconfirm,
    class: className = '',
  }: EditFieldProps = $props();

  let editing = $state(false);
  let draft = $state('');
  let inputEl: HTMLInputElement | undefined = $state();
  let unchanged = $derived(draft === value);

  // Hover states for icon animations
  let undoHover = $state(false);

  function startEdit() {
    if (disabled) return;
    draft = value;
    editing = true;
    // Focus the input after it becomes editable
    requestAnimationFrame(() => inputEl?.focus());
  }

  function confirm() {
    value = draft;
    editing = false;
    onconfirm?.(value);
  }

  function reset() {
    editing = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      reset();
    }
  }
</script>

<div class="field edit-field {className}">
  {#if editing}
    <span class="field-slot-left">
      <button
        class="btn-void"
        type="button"
        disabled={unchanged}
        onclick={reset}
        aria-label="Reset"
        onpointerenter={() => (undoHover = true)}
        onpointerleave={() => (undoHover = false)}
      >
        <Undo data-state={undoHover ? 'active' : ''} data-size="lg" />
      </button>
    </span>
  {/if}
  <input
    bind:this={inputEl}
    type="text"
    {placeholder}
    {disabled}
    readonly={!editing}
    value={editing ? draft : value}
    oninput={(e) => (draft = (e.target as HTMLInputElement).value)}
    onkeydown={handleKeydown}
  />
  <span class="field-slot-right">
    {#if !editing}
      <button
        class="btn-void"
        type="button"
        onclick={startEdit}
        {disabled}
        aria-label="Edit"
      >
        <Edit data-state="active" data-size="lg" />
      </button>
    {:else}
      <button
        class="btn-void"
        type="button"
        disabled={unchanged}
        onclick={confirm}
        aria-label="Confirm"
      >
        <Check class="icon" data-size="lg" />
      </button>
    {/if}
  </span>
</div>
