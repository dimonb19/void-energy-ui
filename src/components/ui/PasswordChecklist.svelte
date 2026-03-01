<!--
  PASSWORD CHECKLIST COMPONENT
  A visual list of password requirements with check/X icons that update
  reactively as the user satisfies each rule.

  USAGE
  -------------------------------------------------------------------------
  const pv = createPasswordValidation(() => password);
  <PasswordChecklist password={password} validation={pv} />
  -------------------------------------------------------------------------

  PROPS:
  - password: The password string (controls visibility — hidden when empty)
  - validation: PasswordValidationState from createPasswordValidation()
  - class: Additional CSS classes on the wrapper

  BEHAVIOR:
  - Hidden when password is empty (no visual noise)
  - Each rule shows a Check (met) or X (unmet) icon
  - State conveyed via data-state="met" on each rule item

  @see /_fields.scss for .password-checklist styles
-->
<script lang="ts">
  import { Check, X } from '@lucide/svelte';
  import { dematerialize, materialize } from '@lib/transitions.svelte';

  interface PasswordChecklistProps {
    password: string;
    validation: PasswordValidationState;
    class?: string;
  }

  let {
    password,
    validation,
    class: className = '',
  }: PasswordChecklistProps = $props();
</script>

{#if password}
  <ul
    class="password-checklist flex flex-col gap-xs {className}"
    role="list"
    aria-label="Password requirements"
    in:materialize
    out:dematerialize
  >
    {#each validation.rules as rule (rule.label)}
      <li
        class="password-checklist-rule flex items-center gap-xs"
        data-state={rule.met ? 'met' : ''}
      >
        {#if rule.met}
          <Check class="icon" data-size="sm" />
        {:else}
          <X class="icon" data-size="sm" />
        {/if}
        <span>{rule.label}</span>
      </li>
    {/each}
  </ul>
{/if}
