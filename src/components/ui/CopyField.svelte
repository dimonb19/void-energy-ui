<!--
  COPY FIELD COMPONENT
  A readonly input with a copy-to-clipboard button.

  USAGE
  -------------------------------------------------------------------------
  <CopyField value="sk-1234-abcd-5678" />
  <CopyField value={apiKey} class="w-full" />
  -------------------------------------------------------------------------

  PROPS:
  - value: The text to display and copy
  - class: Additional CSS classes on the wrapper

  BEHAVIOR:
  - Input is always readonly — clicking it selects all text
  - Copy button copies value to clipboard via navigator.clipboard
  - Copy icon shows checkmark feedback for ~2s, then resets

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import Copy from '@components/icons/Copy.svelte';
  import IconBtn from './IconBtn.svelte';
  import { toast } from '@stores/toast.svelte';

  interface CopyFieldProps {
    value: string;
    id?: string;
    class?: string;
  }

  let { value, id, class: className = '' }: CopyFieldProps = $props();

  const componentId = $props.id();
  const generatedInputId = `copy-${componentId}`;
  const inputId = $derived(id ?? generatedInputId);

  let copied = $state(false);
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let inputEl: HTMLInputElement | undefined;

  function showCopiedFeedback() {
    copied = true;
    toast.show('Copied to clipboard', 'success');
    clearTimeout(timeout);
    timeout = setTimeout(() => (copied = false), 2000);
  }

  function fallbackCopy(): boolean {
    if (!inputEl) return false;
    inputEl.focus();
    inputEl.select();
    return document.execCommand('copy');
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(value);
      showCopiedFeedback();
    } catch {
      // Fallback for older browsers / insecure context
      if (fallbackCopy()) {
        showCopiedFeedback();
      } else {
        toast.show('Copy failed', 'error');
      }
    }
  }

  function selectAll(e: FocusEvent) {
    (e.target as HTMLInputElement).select();
  }

  $effect(() => {
    return () => {
      clearTimeout(timeout);
    };
  });
</script>

<div class="field copy-field {className}">
  <input
    bind:this={inputEl}
    id={inputId}
    type="text"
    readonly
    {value}
    onfocus={selectAll}
  />
  <span class="field-slot-right">
    <IconBtn
      icon={Copy}
      iconProps={{ 'data-state': copied ? 'active' : '' }}
      onclick={copyToClipboard}
      aria-label="Copy to clipboard"
    />
  </span>
</div>
