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
  import { toast } from '@stores/toast.svelte';

  interface CopyFieldProps {
    value: string;
    class?: string;
  }

  let { value, class: className = '' }: CopyFieldProps = $props();

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
  <input type="text" readonly {value} tabindex={-1} onfocus={selectAll} />
  <span class="field-slot-right">
    <button
      class="btn-void"
      type="button"
      onclick={copyToClipboard}
      aria-label="Copy to clipboard"
    >
      <Copy data-state={copied ? 'active' : ''} data-size="lg" />
    </button>
  </span>
</div>
