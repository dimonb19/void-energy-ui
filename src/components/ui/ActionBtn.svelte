<!--
  ACTIONBTN COMPONENT
  A generic button composing any interactive icon with a text label.

  USAGE
  -------------------------------------------------------------------------
  <ActionBtn icon={Play} text="Play" onclick={handlePlay} />
  <ActionBtn icon={Remove} text="Delete" class="btn-alert" onclick={del} />
  <ActionBtn icon={Contract} text="Approve" class="btn-signal" onclick={ok} />
  <ActionBtn icon={Refresh} text="Retry" disabled={loading} onclick={retry} />
  -------------------------------------------------------------------------

  PROPS:
  - icon: Svelte component (interactive icon from src/components/icons/)
  - text: Button label (optional — omit for icon-only)
  - class: Style variant ('btn-cta', 'btn-alert', 'btn-signal', etc.)
  - ...rest: All native button attributes (onclick, disabled, aria-*, etc.)

  BEHAVIOR:
  - Button hover drives icon animation via data-state="active"
  - Inherits base .btn styles from _buttons.scss (no dedicated class needed)
  - Style variants via class prop — all existing btn-* classes work

  @see /src/styles/components/_buttons.scss
  @see /src/components/icons/
-->
<script lang="ts">
  import type { Component } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface ActionBtnProps extends HTMLButtonAttributes {
    icon: Component;
    text?: string;
    class?: string;
  }

  let {
    icon: Icon,
    text = '',
    class: className = '',
    disabled = false,
    ...rest
  }: ActionBtnProps = $props();

  let hovered = $state(false);
</script>

<button
  class={className}
  type="button"
  {disabled}
  onpointerenter={() => (hovered = true)}
  onpointerleave={() => (hovered = false)}
  {...rest}
>
  <Icon data-state={hovered ? 'active' : ''} data-size="lg" />
  {text}
</button>
