<!--
  PROFILEBTN COMPONENT
  Role-aware profile trigger for navbar use. Renders one of three states:
  - Unauthenticated: Silhouette icon (Profile) + chevron
  - Guest/Admin/Creator: Role initial badge (G/A/C) + chevron
  - Player:  Avatar image + chevron

  USAGE
  -------------------------------------------------------------------------
  <ProfileBtn />
  <ProfileBtn onclick={toggleMenu} aria-expanded={menuOpen} />
  -------------------------------------------------------------------------

  PROPS:
  - class: Additional CSS classes on the button
  - ...rest: All native button attributes (onclick, disabled, aria-*, etc.)

  BEHAVIOR:
  - Uses auth-only / public-only CSS utilities for FOUC-safe state switching
  - Wrapping <button> carries the accessible name via aria-label; the inner
    <Avatar> content is suppressed from SR by the button's name calculation
  - Chevron is always visible to signal dropdown affordance
  - Auth-state Avatar and unauth-state silhouette icon are pinned to the
    same 24px (--space-md) bounding box so logout/login swaps don't reflow
    the parent button (btn-void opts out of global control-height min)

  @see /src/components/ui/Avatar.svelte (auth-state badge composes <Avatar size="xs">)
  @see /src/components/icons/Profile.svelte
-->
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { user } from '@stores/user.svelte';
  import Profile from '../icons/Profile.svelte';
  import Avatar from './Avatar.svelte';
  import { ChevronDown } from '@lucide/svelte';

  interface ProfileBtnProps extends HTMLButtonAttributes {
    size?: string;
    class?: string;
  }

  let {
    class: className = '',
    size = 'xl',
    ...rest
  }: ProfileBtnProps = $props();

  const isSignedIn = $derived(
    user.isAuthenticated && Boolean(user.current?.role_name),
  );

  const avatarUrl = $derived.by(() => {
    const role = user.current?.role_name;
    const avatar = user.current?.avatar;
    if (role === 'Player' && avatar) return avatar;
    return null;
  });
</script>

<button
  type="button"
  class="btn-void tab flex items-center gap-xs {className}"
  aria-label={isSignedIn
    ? `Profile: ${user.current?.name} (${user.current?.role_name})`
    : 'Sign in'}
  {...rest}
>
  <Avatar
    src={avatarUrl ?? undefined}
    name={user.current?.role_name ?? '?'}
    size="xs"
    class="auth-only"
  />

  <Profile data-size={size} class="public-only" />

  <ChevronDown class="icon" data-size="sm" />
</button>
