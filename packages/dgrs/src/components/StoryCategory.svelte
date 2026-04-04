<!--
  STORYCATEGORY COMPONENT
  A categorized row of story tiles with a title, tagline, and horizontal scroll strip.
  Includes always-visible navigation arrows for TV/remote and desktop use.
  Supports optional horizontal pagination: when the user scrolls near the end,
  an IntersectionObserver fires `onloadmore` to fetch the next page. Loading
  skeleton tiles are appended automatically while the page is in flight.

  USAGE
  -------------------------------------------------------------------------
  Basic (no pagination):
  <StoryCategory title="Hottest right now" tagline="Most played this week.">
    <Tile ... />
  </StoryCategory>

  With pagination:
  <StoryCategory
    title="Hottest right now"
    tagline="Most played this week."
    loading={pageLoading}
    hasMore={hasNextPage}
    onloadmore={fetchNextPage}
    pageSize={4}
  >
    {#each stories as story}
      <Tile ... />
    {/each}
  </StoryCategory>
  -------------------------------------------------------------------------

  PROPS:
  - title: Category heading (required)
  - tagline: Short description below the heading (optional)
  - children: Snippet — tile elements rendered inside the scroll strip
  - loading: Whether a page is currently loading (shows skeleton tiles)
  - hasMore: Whether more pages are available (enables sentinel observer)
  - onloadmore: Callback fired when the sentinel enters the scroll viewport
  - pageSize: Number of skeleton tiles to show while loading (default 4)
  - class: Additional CSS classes

  @see /src/styles/components/_tiles.scss
  @see /src/components/ui/Tile.svelte
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import Tile from './Tile.svelte';

  interface StoryCategoryProps {
    title: string;
    tagline?: string;
    children: Snippet;
    loading?: boolean;
    hasMore?: boolean;
    onloadmore?: () => void;
    pageSize?: number;
    class?: string;
  }

  let {
    title,
    tagline,
    children,
    loading = false,
    hasMore = false,
    onloadmore,
    pageSize = 4,
    class: className = '',
  }: StoryCategoryProps = $props();

  let stripEl = $state<HTMLElement | null>(null);
  let sentinelEl = $state<HTMLElement | null>(null);
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  /** Respect reduced-motion preference for JS-initiated scrolling. */
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  /** Measure whether there is scrollable overflow in either direction. */
  function updateScrollState() {
    if (!stripEl) return;
    const { scrollLeft, scrollWidth, clientWidth } = stripEl;
    canScrollLeft = scrollLeft > 1;
    canScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
  }

  /** Scroll by approximately one tile width in the given direction. */
  function scroll(direction: -1 | 1) {
    if (!stripEl) return;
    const firstTile = stripEl.querySelector('.tile') as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(stripEl).columnGap) || 0;
    const step = firstTile
      ? firstTile.offsetWidth + gap
      : stripEl.clientWidth * 0.8;
    const behavior = prefersReducedMotion?.matches ? 'auto' : 'smooth';
    stripEl.scrollBy({ left: direction * step, behavior });
  }

  // Track scroll position and observe strip for layout / content changes.
  // ResizeObserver on the strip catches viewport resize; on individual tiles
  // catches density/font-driven width changes (tile width is density-scaled).
  // MutationObserver catches children added/removed (pagination, skeletons)
  // and re-observes new tiles with the RO so density changes are tracked.
  $effect(() => {
    if (!stripEl) return;

    updateScrollState();

    const el = stripEl;
    el.addEventListener('scroll', updateScrollState, { passive: true });

    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);

    const observedTiles = new Set<HTMLElement>();

    function syncTileObservers() {
      const currentTiles = new Set(el.querySelectorAll<HTMLElement>('.tile'));

      // Unobserve removed tiles.
      for (const tile of observedTiles) {
        if (!currentTiles.has(tile)) {
          ro.unobserve(tile);
          observedTiles.delete(tile);
        }
      }

      // Observe new tiles.
      for (const tile of currentTiles) {
        if (!observedTiles.has(tile)) {
          ro.observe(tile);
          observedTiles.add(tile);
        }
      }
    }
    syncTileObservers();

    const mo = new MutationObserver(() => {
      syncTileObservers();
      updateScrollState();
    });
    mo.observe(el, { childList: true });

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
      mo.disconnect();
    };
  });

  // ─── Horizontal IntersectionObserver for pagination ──────────────────────
  // Watches a sentinel element at the end of the strip. When the sentinel
  // scrolls into view (within the strip's scroll viewport), fires onloadmore.
  $effect(() => {
    const sentinel = sentinelEl;
    const strip = stripEl;
    const more = hasMore;
    const busy = loading;
    const callback = onloadmore;

    if (!sentinel || !strip || !more || busy || !callback) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          callback();
        }
      },
      {
        root: strip,
        rootMargin: '0px 200px 0px 0px',
      },
    );

    io.observe(sentinel);

    return () => io.disconnect();
  });

  const skeletonArray = $derived(Array.from({ length: pageSize }));
</script>

<section class="story-category {className}">
  <div class="story-category-header">
    <h3>{title}</h3>
    {#if tagline}
      <p>{tagline}</p>
    {/if}

    <div class="hidden tablet:flex items-center gap-xs ml-auto">
      <button
        class="story-category-nav"
        type="button"
        aria-label="Scroll left"
        disabled={!canScrollLeft}
        onclick={() => scroll(-1)}
      >
        <ChevronLeft class="icon" data-size="sm" />
      </button>
      <button
        class="story-category-nav"
        type="button"
        aria-label="Scroll right"
        disabled={!canScrollRight}
        onclick={() => scroll(1)}
      >
        <ChevronRight class="icon" data-size="sm" />
      </button>
    </div>
  </div>

  <div class="story-category-strip" bind:this={stripEl}>
    {@render children()}

    {#if loading}
      {#each skeletonArray as _, i (i)}
        <Tile loading />
      {/each}
    {/if}

    {#if hasMore && onloadmore}
      <div
        bind:this={sentinelEl}
        class="story-category-sentinel"
        aria-hidden="true"
      ></div>
    {/if}
  </div>
</section>
