<!--
  AVATAR COMPONENT
  Circular user representation. Image when available, initials fallback otherwise.

  USAGE
  -------------------------------------------------------------------------
  <Avatar name="Jane Doe" />
  <Avatar src="/jane.jpg" name="Jane Doe" size="lg" />
  <Avatar src="/jane.jpg" name="Jane Doe" presence="online" />
  <Avatar name="Quinn" size="xl" presence="busy" />
  -------------------------------------------------------------------------

  PROPS:
  - src:      Image URL. If omitted or fails to load, initials show.
  - name:     User name (required). Drives initials and accessible name.
  - size:     'xs' | 'sm' | 'md' | 'lg' | 'xl'. Default 'md'.
  - presence: 'online' | 'busy' | 'away' | 'offline'. Optional status dot.
  - class:    Consumer classes on outer .avatar wrapper.

  COMPOSITION NOTE
  Avatar wraps native <img> directly rather than composing <Image>: the
  initials-fallback / initials-during-load UX is fundamentally different from
  Image's skeleton-then-ImageOff behavior, and the surface adjustments needed
  to make Image accommodate it would weigh more than the small duplication.

  @see _avatar.scss for physics styling
-->

<script lang="ts">
  interface AvatarProps {
    src?: string;
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    presence?: 'online' | 'busy' | 'away' | 'offline';
    class?: string;
  }

  let {
    src,
    name,
    size = 'md',
    presence,
    class: className = '',
  }: AvatarProps = $props();

  let errored = $state(false);

  $effect(() => {
    src;
    errored = false;
  });

  let initials = $derived.by(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0]!.toUpperCase();
    return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
  });

  let showImage = $derived(Boolean(src) && !errored);
</script>

<div class="avatar {className}" data-size={size}>
  {#if showImage}
    <img
      {src}
      alt={name}
      loading="lazy"
      decoding="async"
      onerror={() => (errored = true)}
    />
  {:else}
    <span class="avatar-initials" role="img" aria-label={name}>{initials}</span>
  {/if}

  {#if presence}
    <span class="avatar-presence" data-presence={presence} aria-label={presence}
    ></span>
  {/if}
</div>
