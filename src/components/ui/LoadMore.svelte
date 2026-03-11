<!--
  LOAD MORE COMPONENT
  Observer-driven infinite pagination with a manual "Load more" fallback button.
  Uses IntersectionObserver to automatically trigger loading when a sentinel
  element enters the viewport. The manual button is always rendered as an
  intentional fallback — auto-load fires by default, but the button remains
  available for users who prefer explicit interaction or when the observer
  is disabled.

  USAGE:
  <LoadMore {loading} {hasMore} onloadmore={fetchNextPage} />
  <LoadMore {loading} {hasMore} onloadmore={fetchNextPage} rootMargin={300} />
  <LoadMore {loading} {hasMore} onloadmore={fetchNextPage} observer={false} />

  PROPS:
  - loading: Whether a load is currently in progress (disables trigger + button)
  - hasMore: Whether more items are available (hides component when false)
  - onloadmore: Callback to trigger the next batch
  - rootMargin: Pixel offset for early trigger (default 0) — maps to IO rootMargin
  - observer: Enable automatic IO-driven loading (default true); false = button only
  - label: Button text and aria-label (default 'Load more')
  - class: Additional CSS classes on the wrapper

  OBSERVER EFFECT:
  Depends on sentinel, observer, hasMore, loading, onloadmore, and rootMargin.
  Always disconnects the previous observer on any reactive change to avoid
  stale callbacks and duplicate observers.

  @see /_pagination.scss for physics-aware styling (load-more section)
-->
<script lang="ts">
  import LoadingSpin from '@components/icons/LoadingSpin.svelte';

  interface LoadMoreProps {
    loading?: boolean;
    hasMore?: boolean;
    onloadmore: () => void;
    rootMargin?: number;
    observer?: boolean;
    label?: string;
    class?: string;
  }

  let {
    loading = false,
    hasMore = true,
    onloadmore,
    rootMargin = 0,
    observer = true,
    label = 'Load more',
    class: className = '',
  }: LoadMoreProps = $props();

  // Normalize to a non-negative integer, matching Pagination's coercion pattern.
  const safeMargin = $derived(Math.max(0, Math.floor(rootMargin)));

  let sentinel: HTMLDivElement | undefined = $state();

  // ─── IntersectionObserver auto-load ──────────────────────────────────────
  // Reads all reactive dependencies up front so Svelte tracks them.
  // Returns cleanup that disconnects, preventing stale callbacks.
  $effect(() => {
    const el = sentinel;
    const enabled = observer;
    const more = hasMore;
    const busy = loading;
    const callback = onloadmore;
    const margin = safeMargin;

    if (!el || !enabled || !more || busy) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          callback();
        }
      },
      {
        rootMargin: `${margin}px 0px`,
      },
    );

    io.observe(el);

    return () => io.disconnect();
  });
</script>

{#if hasMore}
  <!-- Sentinel: 1px target for IntersectionObserver, visually hidden -->
  {#if observer}
    <div
      bind:this={sentinel}
      class="load-more-sentinel"
      aria-hidden="true"
    ></div>
  {/if}

  <!-- Fallback button: always available alongside auto-load -->
  <div class="load-more flex justify-center p-md {className}">
    <button
      class="load-more-btn"
      type="button"
      disabled={loading}
      onclick={() => onloadmore()}
      aria-label={label}
    >
      {#if loading}
        <LoadingSpin data-size="sm" />
        Loading&hellip;
      {:else}
        {label}
      {/if}
    </button>
  </div>
{/if}
