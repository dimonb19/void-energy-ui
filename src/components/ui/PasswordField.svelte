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
  - class: Additional CSS classes on the wrapper

  BEHAVIOR:
  - Eye icon toggles password visibility via data-muted
  - Eye is muted (crossed out) when password is hidden
  - Input type switches between 'password' and 'text'

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import Eye from '@components/icons/Eye.svelte';

  interface PasswordFieldProps {
    value: string;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = 'Enter password...',
    disabled = false,
    class: className = '',
  }: PasswordFieldProps = $props();

  let visible = $state(false);

  function toggleVisibility() {
    visible = !visible;
  }
</script>

<div class="field password-field {className}">
  <input
    type={visible ? 'text' : 'password'}
    {placeholder}
    {disabled}
    bind:value
  />
  <span class="field-slot-right">
    <button
      class="btn-void"
      type="button"
      onclick={toggleVisibility}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
    >
      <Eye data-muted={!visible} data-size="lg" />
    </button>
  </span>
</div>
