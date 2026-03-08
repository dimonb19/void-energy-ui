<!--
  PROFILEBTN COMPONENT
  Role-aware profile trigger for navbar use. Renders one of three states:
  - Unauthenticated: Silhouette icon (Profile) + chevron
  - Guest/Admin/Creator: Role initial badge (G/A/C) + chevron
  - Player:  Avatar image + chevron

  USAGE
  -------------------------------------------------------------------------
  <ProfileBtn />
  <ProfileBtn size="xl" onclick={toggleMenu} aria-expanded={menuOpen} />
  -------------------------------------------------------------------------

  PROPS:
  - size: Icon data-size for the guest silhouette (default: 'lg')
  - class: Additional CSS classes on the button
  - ...rest: All native button attributes (onclick, disabled, aria-*, etc.)

  BEHAVIOR:
  - Uses auth-only / public-only CSS utilities for FOUC-safe state switching
  - Avatar span is aria-hidden (label lives on the button via aria-label)
  - Chevron is always visible to signal dropdown affordance

  @see /src/styles/components/_navigation.scss (.profile-avatar)
  @see /src/components/icons/Profile.svelte
-->
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { user } from '@stores/user.svelte';
  import Profile from '../icons/Profile.svelte';
  import { ChevronDown } from '@lucide/svelte';

  interface ProfileBtnProps extends HTMLButtonAttributes {
    size?: string;
    class?: string;
  }

  let {
    class: className = '',
    size = 'lg',
    ...rest
  }: ProfileBtnProps = $props();

  const roleInitial = $derived.by(() => {
    const role = user.current?.role_name;
    if (!role) return null;
    return role.charAt(0);
  });

  const isSignedIn = $derived(user.isAuthenticated && roleInitial !== null);

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
  <span
    class="profile-avatar auth-only flex items-center justify-center shrink-0 overflow-hidden"
    aria-hidden="true"
  >
    {#if avatarUrl}
      <img class="w-full h-full" src={avatarUrl} alt="" />
    {:else if roleInitial}
      {roleInitial}
    {/if}
  </span>

  <Profile data-size={size} class="public-only" />

  <ChevronDown class="icon" data-size="sm" />
</button>
