<!--
  ICONBTN COMPONENT
  A circular icon-only button that forwards hover state to an interactive icon.

  USAGE
  -------------------------------------------------------------------------
  <IconBtn icon={Undo} onclick={reset} aria-label="Reset" />
  <IconBtn icon={Restart} onclick={replay} disabled={loading} aria-label="Replay" />
  <IconBtn icon={Search} size="xl" iconProps={{ 'data-zoom': 'in' }} />
  <IconBtn icon={Eye} iconProps={{ 'data-muted': hidden }} onclick={toggle} />
  <IconBtn icon={Burger} iconProps={{ 'data-state': open ? 'active' : '' }} />
  -------------------------------------------------------------------------

  PROPS:
  - icon: Svelte component (interactive icon from src/components/icons/)
  - size: Icon data-size attribute (default: 'lg')
  - iconProps: Extra attributes forwarded to the icon component.
    Spread AFTER defaults — consumer values override hover-driven data-state.
  - class: Additional CSS classes on the button
  - ...rest: All native button attributes (onclick, disabled, aria-*, etc.)

  BEHAVIOR:
  - Button hover drives icon animation via data-state="active"
  - Uses .btn-icon (circular, control-height sized, centered)
  - iconProps can override data-state for non-hover interactions (toggles, timers)
  - iconProps can add extra attributes (data-zoom, data-muted, id, etc.)

  COMPARISON WITH ActionBtn:
  - ActionBtn: Styled buttons (btn-cta, btn-alert, etc.) with optional text labels
  - IconBtn: Circular icon-only buttons (.btn-icon) for inline actions

  @see /src/styles/components/_buttons.scss (.btn-icon)
  @see /src/components/icons/
-->
<script lang="ts">
  import type { Component } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface IconBtnProps extends HTMLButtonAttributes {
    icon: Component;
    size?: string;
    iconProps?: Record<string, any>;
    class?: string;
  }

  let {
    icon: Icon,
    size = 'lg',
    iconProps = {},
    class: className = '',
    ...rest
  }: IconBtnProps = $props();

  let hovered = $state(false);
</script>

<button
  class="btn-icon {className}"
  type="button"
  data-size={size}
  onpointerenter={() => (hovered = true)}
  onpointerleave={() => (hovered = false)}
  {...rest}
>
  <Icon data-state={hovered ? 'active' : ''} data-size={size} {...iconProps} />
</button>
