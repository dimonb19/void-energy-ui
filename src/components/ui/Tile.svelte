<!--
  TILE COMPONENT
  Landscape content card with cover image, stretched-link pattern, and state marks.

  USAGE
  -------------------------------------------------------------------------
  <Tile
    title="Machine Rebellion"
    href="/story/123"
    author={{ name: 'Creator Name', avatar: '/avatars/user.jpg', href: '/user/456' }}
    genres={['Psychological', 'Sci-Fi']}
    image="/covers/machine-rebellion.jpg"
    mark="resume"
  />

  Loading skeleton:
  <Tile loading />
  -------------------------------------------------------------------------

  PROPS:
  - title: Story title (required unless loading)
  - href: Story page URL (required unless loading)
  - author: { name, avatar?, href? } — author info with optional PFP and profile link
  - genres: string[] — genre labels rendered as comma-separated text
  - image: Cover image URL (optional — falls back to sunk surface)
  - mark: 'resume' | 'complete' | 'replay' — state badge (optional)
  - gate: TileGate[] — token gate requirements (lock icon + premium styling + tooltip)
  - loading: boolean — renders a shimmer skeleton instead of content
  - class: Additional CSS classes

  ANATOMY:
  - Uses the "stretched link" pattern: title <a> covers full tile via ::after
  - Author link sits above via z-index — independently clickable

  @see /src/styles/components/_tiles.scss
-->
<script lang="ts">
  import PlayPause from '@components/icons/PlayPause.svelte';
  import Undo from '@components/icons/Undo.svelte';
  import { tooltip } from '@actions/tooltip';
  import { dematerialize, materialize } from '@lib/transitions.svelte';
  import { Lock } from '@lucide/svelte';

  interface TileProps {
    title?: string;
    href?: string;
    author?: TileAuthor;
    genres?: string[];
    image?: string;
    mark?: 'resume' | 'complete' | 'replay';
    gate?: TileGate[];
    loading?: boolean;
    class?: string;
  }

  const MARK_LABELS: Record<string, string> = {
    resume: 'Resume',
    complete: 'Complete',
    replay: 'Replay',
  };

  const MARK_ICONS: Record<string, typeof PlayPause | typeof Undo> = {
    resume: PlayPause,
    replay: Undo,
  };

  let {
    title,
    href,
    author,
    genres = [],
    image,
    mark,
    gate,
    loading = false,
    class: className = '',
  }: TileProps = $props();

  let hovered = $state(false);
  const iconState = $derived(hovered && !loading ? 'active' : '');

  /** First letter of author name for PFP fallback. */
  const authorInitial = $derived(author?.name.charAt(0).toUpperCase() ?? '');

  /** Human-readable label for a single gate requirement. */
  function formatGateLabel(g: TileGate): string {
    switch (g.type) {
      case 'nft-collection':
        return `${g.name} NFT`;
      case 'nft-id':
        if ('ids' in g)
          return `${g.collection} ${g.ids.map((id) => `#${id}`).join(', ')}`;
        return `${g.collection} #${g.range[0]}–#${g.range[1]}`;
      case 'fungible':
        return `${g.amount.toLocaleString()} $${g.token}`;
    }
  }

  const isGated = $derived(gate && gate.length > 0);
  const gateTooltip = $derived(
    isGated ? `Requires ${gate!.map(formatGateLabel).join(' or ')}` : '',
  );
</script>

{#snippet authorInner()}
  {#if author?.avatar}
    <img class="tile-pfp" src={author.avatar} alt="" />
  {:else}
    <span class="tile-pfp tile-pfp-fallback">{authorInitial}</span>
  {/if}
  <span class="text-truncate">{author?.name}</span>
{/snippet}

<article
  class="tile {className}"
  data-state={loading ? 'loading' : undefined}
  aria-busy={loading || undefined}
  data-gated={isGated || undefined}
  onpointerenter={() => {
    if (!loading) hovered = true;
  }}
  onpointerleave={() => (hovered = false)}
>
  {#if loading}
    <div class="tile-image" aria-hidden="true"></div>
    <div class="tile-content">
      <span class="skeleton-line"></span>
    </div>
  {:else}
    {#if image}
      <img class="tile-image" src={image} alt="{title} cover" />
    {:else}
      <div class="tile-image" aria-hidden="true"></div>
    {/if}

    {#if mark}
      {@const MarkIcon = MARK_ICONS[mark]}
      <div class="tile-mark" data-mark={mark} in:materialize out:dematerialize>
        {#if MarkIcon}
          <MarkIcon data-state={iconState} data-size="sm" />
        {/if}
        {MARK_LABELS[mark]}
      </div>
    {/if}

    {#if isGated}
      <button
        type="button"
        class="tile-gate btn-void"
        aria-label={gateTooltip}
        in:materialize={{ y: 0 }}
        out:dematerialize={{ y: 0 }}
        use:tooltip={gateTooltip}
      >
        <Lock class="icon" data-size="sm" />
      </button>
    {/if}

    <div class="tile-content" in:materialize={{ y: 0 }}>
      <a {href} class="tile-link">
        <h5>{title}</h5>
      </a>

      {#if author}
        {#if author.href}
          <a href={author.href} class="tile-author">
            {@render authorInner()}
          </a>
        {:else}
          <span class="tile-author">
            {@render authorInner()}
          </span>
        {/if}
      {/if}

      {#if genres.length > 0}
        <span class="tile-genres">
          {genres.join(', ')}
        </span>
      {/if}
    </div>
  {/if}
</article>
