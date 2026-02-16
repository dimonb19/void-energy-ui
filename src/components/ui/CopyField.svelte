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

  const inputId = id ?? `copy-${Math.random().toString(36).slice(2, 9)}`;

  let copied = $state(false);
  let timeout: ReturnType<typeof setTimeout>;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
      toast.show('Copied to clipboard', 'success');
      clearTimeout(timeout);
      timeout = setTimeout(() => (copied = false), 2000);
    } catch {
      // Fallback for older browsers / insecure context
      const input =
        document.querySelector<HTMLInputElement>('.copy-field input');
      input?.select();
      document.execCommand('copy');
      copied = true;
      toast.show('Copied to clipboard', 'success');
      clearTimeout(timeout);
      timeout = setTimeout(() => (copied = false), 2000);
    }
  }

  function selectAll(e: FocusEvent) {
    (e.target as HTMLInputElement).select();
  }
</script>

<div class="field copy-field {className}">
  <input id={inputId} type="text" readonly {value} onfocus={selectAll} />
  <span class="field-slot-right">
    <IconBtn
      icon={Copy}
      iconProps={{ 'data-state': copied ? 'active' : '' }}
      onclick={copyToClipboard}
      aria-label="Copy to clipboard"
    />
  </span>
</div>
