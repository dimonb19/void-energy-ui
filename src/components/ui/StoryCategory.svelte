<!--
  STORYCATEGORY COMPONENT
  A categorized row of story tiles with a title, tagline, and horizontal scroll strip.
  Includes always-visible navigation arrows for TV/remote and desktop use.

  USAGE
  -------------------------------------------------------------------------
  <StoryCategory title="Hottest right now" tagline="Most played this week.">
    <Tile ... />
    <Tile ... />
    <Tile ... />
  </StoryCategory>
  -------------------------------------------------------------------------

  PROPS:
  - title: Category heading (required)
  - tagline: Short description below the heading (optional)
  - children: Snippet — tile elements rendered inside the scroll strip
  - class: Additional CSS classes

  @see /src/styles/components/_tiles.scss
  @see /src/components/ui/Tile.svelte
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';

  interface StoryCategoryProps {
    title: string;
    tagline?: string;
    children: Snippet;
    class?: string;
  }

  let {
    title,
    tagline,
    children,
    class: className = '',
  }: StoryCategoryProps = $props();

  let stripEl = $state<HTMLElement | null>(null);
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

  // Track scroll position and observe strip + tile children for layout changes.
  // Observes children too so density/font/dynamic-content changes are caught.
  $effect(() => {
    if (!stripEl) return;

    updateScrollState();

    const el = stripEl;
    el.addEventListener('scroll', updateScrollState, { passive: true });

    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    for (const tile of el.querySelectorAll<HTMLElement>('.tile')) {
      ro.observe(tile);
    }

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  });
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
  </div>
</section>
