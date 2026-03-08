<!--
  GENERATE FIELD COMPONENT
  An always-editable input with an AI generation sparkle button.

  USAGE
  -------------------------------------------------------------------------
  <GenerateField
    bind:value={title}
    placeholder="Project title..."
    instructions="Generate a catchy project title"
    ongenerate={generateText}
  />
  -------------------------------------------------------------------------

  PROPS:
  - value: Text value (bindable — updated on successful generation)
  - placeholder: Placeholder text
  - disabled: Disables input and sparkle button
  - instructions: Developer-provided prompt context for this field's AI generation
  - ongenerate: Async handler receiving { currentValue, instructions, signal }
  - class: Additional CSS classes on the wrapper

  STATES:
  - idle: Input is editable, Sparkle icon shown on right
  - generating: Input disabled with shimmer, LoadingQuill replaces Sparkle

  BEHAVIOR:
  - Input is always editable — user can type freely
  - Click Sparkle → calls ongenerate with current value + instructions
  - Loading state: input disabled, shimmer overlay, LoadingQuill in slot
  - On resolve → value updated with generated text
  - On error → toast notification, value unchanged
  - Escape during generation → aborts via a temporary document listener

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import { materialize, dematerialize } from '@lib/transitions.svelte';
  import { toast } from '@stores/toast.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  import IconBtn from './IconBtn.svelte';
  import Sparkle from '@components/icons/Sparkle.svelte';
  import LoadingQuill from '@components/icons/LoadingQuill.svelte';

  interface GenerateContext {
    currentValue: string;
    instructions?: string;
    signal: AbortSignal;
  }

  interface GenerateFieldProps
    extends Omit<HTMLInputAttributes, 'type' | 'value'> {
    value: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    instructions?: string;
    ongenerate: (context: GenerateContext) => Promise<string>;
    class?: string;
  }

  let {
    value = $bindable(''),
    id,
    placeholder = '',
    disabled = false,
    instructions,
    ongenerate,
    class: className = '',
    ...rest
  }: GenerateFieldProps = $props();

  const componentId = $props.id();
  const generatedInputId = `generate-${componentId}`;
  const inputId = $derived(id ?? generatedInputId);

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
  class="field generate-field {className}"
  data-status={generating ? 'loading' : null}
  aria-busy={generating}
>
  <input
    id={inputId}
    type="text"
    {placeholder}
    disabled={disabled || generating}
    bind:value
    {...rest}
  />
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
        <LoadingQuill data-size="lg" aria-hidden="true" />
      {/if}
    </span>
  {/key}
</div>
