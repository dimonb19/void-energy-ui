<!--
  EDIT TEXTAREA COMPONENT
  A readonly textarea that can be unlocked for editing with confirm/reset actions.

  USAGE
  -------------------------------------------------------------------------
  <EditTextarea bind:value={bio} placeholder="Write a bio..." />
  <EditTextarea bind:value={bio} rows={5} onconfirm={saveBio} />
  -------------------------------------------------------------------------

  PROPS:
  - value: Text value (bindable — updated on confirm)
  - placeholder: Placeholder text
  - rows: Number of visible text rows (default: 3)
  - disabled: Disables all interaction
  - onconfirm: Callback when edit is confirmed (receives new value)
  - class: Additional CSS classes on the wrapper

  STATES:
  - idle: Textarea is readonly, Edit icon shown at top-right
  - editing: Textarea is editable, Undo + Check at top-right
  - unchanged: Check is disabled when draft matches original value

  BEHAVIOR:
  - Click Edit → unlocks textarea, shows Undo + Check (top-right)
  - Click Check → confirms edit, calls onconfirm, returns to idle
  - Click Undo → cancels editing, restores original value, returns to idle
  - Undo is always active (allows immediate cancel)
  - Check disabled when text hasn't changed
  - Hovering Check/Undo triggers their icon animations
  - Ctrl/Cmd+Enter confirms, Escape cancels

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import { Check } from '@lucide/svelte';
  import { materialize, dematerialize } from '@lib/transitions.svelte';

  import IconBtn from './IconBtn.svelte';
  import Edit from '@components/icons/Edit.svelte';
  import Undo from '@components/icons/Undo.svelte';

  interface EditTextareaProps {
    value: string;
    id?: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    onconfirm?: (value: string) => void;
    class?: string;
  }

  let {
    value = $bindable(''),
    id,
    placeholder = '',
    rows = 3,
    disabled = false,
    onconfirm,
    class: className = '',
  }: EditTextareaProps = $props();

  const componentId = $props.id();
  const generatedTextareaId = `edit-textarea-${componentId}`;
  const textareaId = $derived(id ?? generatedTextareaId);

  let editing = $state(false);
  let draft = $state('');
  let textareaEl: HTMLTextAreaElement | undefined = $state();
  let unchanged = $derived(draft === value);

  function startEdit() {
    if (disabled) return;
    draft = value;
    editing = true;
    requestAnimationFrame(() => {
      textareaEl?.focus();
      // Place cursor at end of text
      if (textareaEl) {
        textareaEl.selectionStart = textareaEl.selectionEnd = draft.length;
      }
    });
  }

  function confirm() {
    if (!editing || disabled) return;
    value = draft;
    editing = false;
    onconfirm?.(value);
  }

  function reset() {
    editing = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!editing) return;

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      confirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      reset();
    }
  }
</script>

<div class="field edit-textarea {className}">
  <textarea
    bind:this={textareaEl}
    id={textareaId}
    {placeholder}
    {disabled}
    {rows}
    readonly={!editing}
    value={editing ? draft : value}
    oninput={(e) => (draft = (e.target as HTMLTextAreaElement).value)}
    onkeydown={handleKeydown}
  ></textarea>
  {#key editing}
    <span
      class="field-slot-right"
      in:materialize={{ y: 0 }}
      out:dematerialize={{ y: 0 }}
    >
      {#if !editing}
        <IconBtn
          icon={Edit}
          iconProps={{ 'data-state': 'active' }}
          onclick={startEdit}
          {disabled}
          aria-label="Edit"
        />
      {:else}
        <IconBtn icon={Undo} onclick={reset} aria-label="Cancel" />
        <IconBtn
          icon={Check}
          disabled={unchanged}
          onclick={confirm}
          aria-label="Confirm"
        />
      {/if}
    </span>
  {/key}
</div>
