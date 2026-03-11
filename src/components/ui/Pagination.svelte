<!--
  PAGINATION COMPONENT
  Controlled page navigation with prev/next, optional first/last, and
  windowed page numbers with ellipsis collapse. Responsive: on mobile
  (< tablet) the windowed numbers collapse to a compact "Page X of Y"
  indicator with prev/next arrows always visible.

  USAGE:
  <Pagination bind:currentPage totalPages={20} />
  <Pagination bind:currentPage totalPages={50} siblings={2} />
  <Pagination bind:currentPage totalPages={10} showFirstLast={false} />
  <Pagination bind:currentPage totalPages={5} showPrevNext={false} />

  PROPS:
  - currentPage: Active page number, 1-indexed (bindable)
  - totalPages: Total number of pages
  - onchange: Callback when page changes
  - siblings: Pages visible on each side of current page (default 1)
  - showFirstLast: Show jump-to-first/last buttons on desktop (default true)
  - showPrevNext: Show prev/next buttons on desktop (default true);
    on mobile prev/next are always visible for navigation
  - label: aria-label for the nav landmark (default 'Pagination')
  - class: Additional CSS classes on the nav element

  DESKTOP (siblings=1, currentPage=5, totalPages=10):
  [«] [‹] [1] […] [4] [5] [6] […] [10] [›] [»]

  MOBILE:
  [‹] Page 5 of 10 [›]

  WINDOWING:
  - Always shows first and last page numbers
  - Shows `siblings` pages on each side of currentPage
  - Ellipsis appears when gaps exist between visible ranges
  - Small totalPages renders all pages without ellipsis

  ACCESSIBILITY:
  - <nav> with aria-label (customizable via `label` prop)
  - aria-current="page" on the active page button (and compact indicator)
  - Disabled buttons for prev/first at page 1 and next/last at last page
  - Ellipsis spans are aria-hidden="true"

  @see /_pagination.scss for physics-aware styling
-->
<script lang="ts">
  import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
  } from '@lucide/svelte';

  interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onchange?: (page: number) => void;
    siblings?: number;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    label?: string;
    class?: string;
  }

  let {
    currentPage = $bindable(1),
    totalPages,
    onchange,
    siblings = 1,
    showFirstLast = true,
    showPrevNext = true,
    label = 'Pagination',
    class: className = '',
  }: PaginationProps = $props();

  // Normalize inputs to non-negative integers
  const safeTotal = $derived(Math.max(0, Math.floor(totalPages)));
  const safeSiblings = $derived(Math.max(0, Math.floor(siblings)));

  // Clamp currentPage to valid range — leave unchanged when no pages exist
  const clampedPage = $derived(
    safeTotal <= 0
      ? currentPage
      : Math.max(1, Math.min(Math.floor(currentPage), safeTotal)),
  );

  $effect(() => {
    if (safeTotal > 0 && currentPage !== clampedPage) {
      currentPage = clampedPage;
    }
  });

  function goTo(page: number) {
    if (page < 1 || page > safeTotal || page === currentPage) return;
    currentPage = page;
    onchange?.(page);
  }

  // --- Windowed page number generation ---
  const ELLIPSIS = 'ellipsis' as const;
  type PageItem = number | typeof ELLIPSIS;

  const pages = $derived.by((): PageItem[] => {
    if (safeTotal <= 0) return [];

    // If total pages fit without ellipsis, show them all.
    // Threshold: first + last + 2*siblings + current + 2 ellipsis slots = 5 + 2*siblings
    const maxWithoutEllipsis = 5 + safeSiblings * 2;
    if (safeTotal <= maxWithoutEllipsis) {
      return Array.from({ length: safeTotal }, (_, i) => i + 1);
    }

    const items: PageItem[] = [];
    const page = clampedPage;

    // Left boundary: always show page 1
    items.push(1);

    // Left ellipsis or contiguous range
    const leftSiblingStart = Math.max(2, page - safeSiblings);
    if (leftSiblingStart > 2) {
      items.push(ELLIPSIS);
    } else {
      // Fill gap between 1 and sibling window
      for (let i = 2; i < leftSiblingStart; i++) {
        items.push(i);
      }
    }

    // Sibling window (including current page)
    const rightSiblingEnd = Math.min(safeTotal - 1, page + safeSiblings);
    for (let i = leftSiblingStart; i <= rightSiblingEnd; i++) {
      items.push(i);
    }

    // Right ellipsis or contiguous range
    if (rightSiblingEnd < safeTotal - 1) {
      items.push(ELLIPSIS);
    } else {
      // Fill gap between sibling window and last page
      for (let i = rightSiblingEnd + 1; i < safeTotal; i++) {
        items.push(i);
      }
    }

    // Right boundary: always show last page
    items.push(safeTotal);

    return items;
  });

  const isFirst = $derived(clampedPage === 1);
  const isLast = $derived(clampedPage === safeTotal);
</script>

{#if safeTotal > 1}
  <nav
    class="pagination flex items-center gap-sm {className}"
    aria-label={label}
  >
    {#if showFirstLast}
      <button
        class="pagination-btn hidden tablet:inline-flex"
        type="button"
        aria-label="First page"
        disabled={isFirst}
        onclick={() => goTo(1)}
      >
        <ChevronsLeft class="icon" data-size="sm" />
      </button>
    {/if}

    <!-- Prev: always visible on mobile, respects showPrevNext on desktop -->
    <button
      class="pagination-btn inline-flex {showPrevNext ? '' : 'tablet:hidden'}"
      type="button"
      aria-label="Previous page"
      disabled={isFirst}
      onclick={() => goTo(clampedPage - 1)}
    >
      <ChevronLeft class="icon" data-size="sm" />
    </button>

    <!-- Desktop: full windowed page numbers -->
    <div class="hidden tablet:flex items-center gap-sm">
      {#each pages as item, i}
        {#if item === ELLIPSIS}
          <span class="pagination-ellipsis" aria-hidden="true">…</span>
        {:else}
          <button
            class="pagination-btn"
            type="button"
            aria-current={item === clampedPage ? 'page' : undefined}
            data-state={item === clampedPage ? 'active' : undefined}
            onclick={() => goTo(item)}
          >
            {item}
          </button>
        {/if}
      {/each}
    </div>

    <!-- Mobile: compact page indicator -->
    <span class="pagination-compact flex tablet:hidden" aria-current="page">
      Page {clampedPage} of {safeTotal}
    </span>

    <!-- Next: always visible on mobile, respects showPrevNext on desktop -->
    <button
      class="pagination-btn inline-flex {showPrevNext ? '' : 'tablet:hidden'}"
      type="button"
      aria-label="Next page"
      disabled={isLast}
      onclick={() => goTo(clampedPage + 1)}
    >
      <ChevronRight class="icon" data-size="sm" />
    </button>

    {#if showFirstLast}
      <button
        class="pagination-btn hidden tablet:inline-flex"
        type="button"
        aria-label="Last page"
        disabled={isLast}
        onclick={() => goTo(safeTotal)}
      >
        <ChevronsRight class="icon" data-size="sm" />
      </button>
    {/if}
  </nav>
{/if}
