<!--
  PASSWORD METER COMPONENT
  A visual strength indicator for passwords. Shows a native <meter> bar
  and a text label that updates reactively as the user types.

  USAGE
  -------------------------------------------------------------------------
  const pv = createPasswordValidation(() => password);
  <PasswordMeter {password} validation={pv} />
  -------------------------------------------------------------------------

  PROPS:
  - password: The password string (controls visibility — hidden when empty)
  - validation: PasswordValidationState from createPasswordValidation()
  - class: Additional CSS classes on the wrapper

  BEHAVIOR:
  - Hidden when password is empty (no visual noise)
  - Four levels: Weak (red), Fair (amber), Good (green), Strong (green)
  - Uses native <meter> element for the bar (reuses existing meter SCSS)
  - Persistent aria-live region announces strength changes to screen readers

  @see /_inputs.scss for <meter> element physics styling
  @see /_fields.scss for .password-meter wrapper styles
-->
<script lang="ts">
  import { emerge, dissolve } from '@lib/transitions.svelte';

  interface PasswordMeterProps {
    password: string;
    validation: PasswordValidationState;
    class?: string;
  }

  let {
    password,
    validation,
    class: className = '',
  }: PasswordMeterProps = $props();

  const score = $derived(validation.score);
  const level = $derived(validation.level);

  const labels: Record<PasswordStrengthLevel, string> = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };
</script>

<span class="sr-only" aria-live="polite" aria-atomic="true">
  {password ? labels[level] : ''}
</span>

{#if password}
  <div
    class="password-meter flex flex-col gap-xs {className}"
    data-strength={level}
    in:emerge
    out:dissolve
  >
    <meter
      min={0}
      max={100}
      low={40}
      high={60}
      optimum={100}
      value={score}
      aria-label="Password strength"
    ></meter>
    <span class="password-meter-label">
      {labels[level]}
    </span>
  </div>
{/if}
