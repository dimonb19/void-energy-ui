<!--
  GENERATE TEXTAREA COMPONENT
  An always-editable textarea with an AI generation sparkle button.

  USAGE
  -------------------------------------------------------------------------
  <GenerateTextarea
    bind:value={bio}
    placeholder="Tell us about yourself..."
    instructions="Generate a professional bio"
    ongenerate={generateText}
    rows={5}
  />
  -------------------------------------------------------------------------

  PROPS:
  - value: Text value (bindable — updated on successful generation)
  - placeholder: Placeholder text
  - rows: Number of visible text rows (default: 3)
  - disabled: Disables textarea and sparkle button
  - instructions: Developer-provided prompt context for this field's AI generation
  - ongenerate: Async handler receiving { currentValue, instructions, signal }
  - class: Additional CSS classes on the wrapper

  STATES:
  - idle: Textarea is editable, Sparkle icon shown at top-right
  - generating: Textarea disabled with shimmer, SpinLoader replaces Sparkle

  BEHAVIOR:
  - Textarea is always editable — user can type freely
  - Click Sparkle → calls ongenerate with current value + instructions
  - Loading state: textarea disabled, shimmer overlay, SpinLoader in slot
  - On resolve → value updated with generated text
  - On error → toast notification, value unchanged
  - Escape during generation → aborts the request

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import { materialize, dematerialize } from '@lib/transitions.svelte';
  import { toast } from '@stores/toast.svelte';

  import IconBtn from './IconBtn.svelte';
  import Sparkle from '@components/icons/Sparkle.svelte';
  import SpinLoader from '@components/icons/SpinLoader.svelte';

  interface GenerateContext {
    currentValue: string;
    instructions?: string;
    signal: AbortSignal;
  }

  interface GenerateTextareaProps {
    value: string;
    id?: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    instructions?: string;
    ongenerate: (context: GenerateContext) => Promise<string>;
    class?: string;
  }

  let {
    value = $bindable(''),
    id,
    placeholder = '',
    rows = 3,
    disabled = false,
    instructions,
    ongenerate,
    class: className = '',
  }: GenerateTextareaProps = $props();

  const textareaId =
    id ?? `generate-textarea-${Math.random().toString(36).slice(2, 9)}`;

  let generating = $state(false);
  let abortController: AbortController | undefined = $state();

  async function generate() {
    if (disabled || generating) return;

    abortController = new AbortController();
    generating = true;

    try {
      const result = await ongenerate({
        currentValue: value,
        instructions,
        signal: abortController.signal,
      });

      if (result) {
        value = result;
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.show(err.message, 'error');
      }
    } finally {
      generating = false;
      abortController = undefined;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && generating) {
      e.preventDefault();
      abortController?.abort();
    }
  }
</script>

<div
  class="field generate-textarea {className}"
  data-status={generating ? 'loading' : null}
  aria-busy={generating}
>
  <textarea
    id={textareaId}
    {placeholder}
    {rows}
    disabled={disabled || generating}
    bind:value
    onkeydown={handleKeydown}
  ></textarea>
  {#key generating}
    <span
      class="field-slot-right"
      in:materialize={{ y: 0 }}
      out:dematerialize={{ y: 0 }}
    >
      {#if !generating}
        <IconBtn
          icon={Sparkle}
          onclick={generate}
          {disabled}
          aria-label="Generate"
        />
      {:else}
        <SpinLoader data-size="lg" aria-hidden="true" />
      {/if}
    </span>
  {/key}
</div>
