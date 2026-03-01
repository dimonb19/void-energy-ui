<!--
  PASSWORD FIELD COMPONENT
  A password input with an Eye toggle for visibility.

  USAGE
  -------------------------------------------------------------------------
  <PasswordField bind:value={password} placeholder="Enter password..." />
  -------------------------------------------------------------------------

  PROPS:
  - value: Password text (bindable)
  - placeholder: Placeholder text
  - disabled: Disables the input
  - invalid: Maps to aria-invalid on the input (for FormField wiring)
  - describedby: Maps to aria-describedby on the input (for FormField wiring)
  - class: Additional CSS classes on the wrapper

  BEHAVIOR:
  - Eye icon toggles password visibility via data-muted
  - Eye is muted (crossed out) when password is hidden
  - Input type switches between 'password' and 'text'

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import Eye from '@components/icons/Eye.svelte';
  import IconBtn from './IconBtn.svelte';

  interface PasswordFieldProps {
    value: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    autocomplete?: HTMLInputElement['autocomplete'];
    invalid?: boolean;
    describedby?: string;
    class?: string;
  }

  let {
    value = $bindable(''),
    id,
    placeholder = 'Enter password...',
    disabled = false,
    autocomplete = 'current-password',
    invalid = false,
    describedby,
    class: className = '',
  }: PasswordFieldProps = $props();

  // svelte-ignore state_referenced_locally
  const inputId = id ?? `password-${Math.random().toString(36).slice(2, 9)}`;

  let visible = $state(false);

  function toggleVisibility() {
    visible = !visible;
  }
</script>

<div class="field password-field {className}">
  <input
    id={inputId}
    type={visible ? 'text' : 'password'}
    {placeholder}
    {disabled}
    {autocomplete}
    bind:value
    aria-invalid={invalid || undefined}
    aria-describedby={describedby}
  />
  <span class="field-slot-right">
    <IconBtn
      icon={Eye}
      iconProps={{ 'data-muted': !visible, id: inputId }}
      onclick={toggleVisibility}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
    />
  </span>
</div>
