<!--
  FORM FIELD COMPONENT
  A wrapper that provides consistent label, error, and hint wiring
  around any form input. Manages ARIA associations automatically.

  USAGE
  -------------------------------------------------------------------------
  <FormField label="Email" error={emailError} required fieldId="email">
    {#snippet children({ fieldId, descriptionId, invalid })}
      <input
        type="email"
        id={fieldId}
        required
        aria-invalid={invalid}
        aria-describedby={descriptionId}
        class="input"
      />
    {/snippet}
  </FormField>
  -------------------------------------------------------------------------

  PROPS:
  - label:    Text label above the input (if absent, consumer must provide aria-label)
  - error:    Error message text (triggers error state when non-empty)
  - hint:     Help text shown below input
  - required: Shows required indicator on label
  - fieldId:  Explicit ID override (auto-generated if not provided)
  - children: Snippet receiving { fieldId, descriptionId, invalid } for ARIA wiring

  ARIA WIRING:
  - The snippet receives fieldId, descriptionId, and invalid
  - fieldId: Use as the input's id (label's for points here)
  - descriptionId: Use as aria-describedby (combines hint + error IDs)
  - invalid: Use as aria-invalid (true when error is non-empty)

  @see /_fields.scss for .form-field styles
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { CircleAlert } from '@lucide/svelte';
  import { materialize, dematerialize } from '@lib/transitions.svelte';

  interface FormFieldProps {
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    fieldId?: string;
    children: Snippet<
      [{ fieldId: string; descriptionId: string | undefined; invalid: boolean }]
    >;
    class?: string;
  }

  let {
    label,
    error,
    hint,
    required = false,
    fieldId,
    children,
    class: className = '',
  }: FormFieldProps = $props();

  // svelte-ignore state_referenced_locally
  const id = fieldId ?? `field-${Math.random().toString(36).slice(2, 9)}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const hasError = $derived(!!error);
  const hasHint = $derived(!!hint);

  const descriptionId = $derived(
    [hasHint ? hintId : null, hasError ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined,
  );
</script>

<div
  class="form-field flex flex-col gap-xs {className}"
  data-state={hasError ? 'error' : ''}
>
  {#if label}
    <label for={id} class="form-field-label">
      {label}
      {#if required}
        <span class="form-field-required" aria-hidden="true">*</span>
      {/if}
    </label>
  {/if}

  {@render children({ fieldId: id, descriptionId, invalid: hasError })}

  {#if hasHint && !hasError}
    <p id={hintId} class="form-field-hint">{hint}</p>
  {/if}

  {#if hasError}
    <p
      id={errorId}
      class="form-field-error flex items-center gap-xs"
      aria-live="polite"
      role="alert"
      in:materialize={{ y: -8 }}
      out:dematerialize={{ y: -8 }}
    >
      <CircleAlert class="icon" />
      {error}
    </p>
  {/if}
</div>
