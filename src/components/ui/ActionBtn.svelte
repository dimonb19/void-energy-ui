<!--
  ACTIONBTN COMPONENT
  A generic button composing any interactive icon with a text label.

  USAGE
  -------------------------------------------------------------------------
  <ActionBtn icon={Play} text="Play" onclick={handlePlay} />
  <ActionBtn icon={Remove} text="Delete" class="btn-error" onclick={del} />
  <ActionBtn icon={Contract} text="Approve" class="btn-success" onclick={ok} />
  <ActionBtn icon={Refresh} text="Retry" disabled={loading} onclick={retry} />
  -------------------------------------------------------------------------

  PROPS:
  - icon: Svelte component (interactive icon from src/components/icons/)
  - text: Button label (optional — omit for icon-only)
  - class: Style variant ('btn-cta', 'btn-error', 'btn-success', etc.)
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
  import { laserAim } from '@actions/laser-aim';

  interface ActionBtnProps extends HTMLButtonAttributes {
    icon: Component;
    text?: string;
    class?: string;
    size?: string;
  }

  let {
    icon: Icon,
    text = '',
    class: className = '',
    disabled = false,
    size = 'lg',
    ...rest
  }: ActionBtnProps = $props();

  let hovered = $state(false);
  let iconState = $derived(!disabled && hovered ? 'active' : '');

  $effect(() => {
    if (disabled && hovered) {
      hovered = false;
    }
  });
</script>

<button
  class={className}
  type="button"
  {disabled}
  use:laserAim={{ enabled: className.split(/\s+/).includes('btn-cta') }}
  onpointerenter={() => {
    if (disabled) return;
    hovered = true;
  }}
  onpointerleave={() => (hovered = false)}
  {...rest}
>
  <Icon data-state={iconState} data-size={size} />
  {text}
</button>
