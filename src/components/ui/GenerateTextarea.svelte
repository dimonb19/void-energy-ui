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
  - generating: Textarea disabled with shimmer, LoadingSparkle replaces Sparkle

  BEHAVIOR:
  - Textarea is always editable — user can type freely
  - Click Sparkle → calls ongenerate with current value + instructions
  - Loading state: textarea disabled, shimmer overlay, LoadingSparkle in slot
  - On resolve → value updated with generated text
  - On error → toast notification, value unchanged
  - Escape during generation → aborts via a temporary document listener

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import { materialize, dematerialize } from '@lib/transitions.svelte';
  import { toast } from '@stores/toast.svelte';
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  import IconBtn from './IconBtn.svelte';
  import Sparkle from '@components/icons/Sparkle.svelte';
  import LoadingSparkle from '@components/icons/LoadingSparkle.svelte';

  interface GenerateTextareaProps
    extends Omit<HTMLTextareaAttributes, 'value'> {
    value: string;
    id?: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    instructions?: string;
    ongenerate: (context: GenerateFieldContext) => Promise<string>;
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
    ...rest
  }: GenerateTextareaProps = $props();

  const componentId = $props.id();
  const generatedTextareaId = `generate-textarea-${componentId}`;
  const textareaId = $derived(id ?? generatedTextareaId);

  let generating = $state(false);
  let abortController: AbortController | undefined = $state();

  function handleEscapeAbort(e: KeyboardEvent) {
    if (e.key !== 'Escape' || !generating) return;

    e.preventDefault();
    e.stopPropagation();
    abortController?.abort();
  }

  $effect(() => {
    if (!generating || typeof document === 'undefined') return;

    document.addEventListener('keydown', handleEscapeAbort, true);

    return () => {
      document.removeEventListener('keydown', handleEscapeAbort, true);
    };
  });

  $effect(() => {
    return () => {
      abortController?.abort();
    };
  });

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

      value = result;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.show(err.message, 'error');
      }
    } finally {
      generating = false;
      abortController = undefined;
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
    {...rest}
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
        <LoadingSparkle data-size="lg" aria-hidden="true" />
      {/if}
    </span>
  {/key}
</div>
