<script lang="ts">
  import { materialize, dematerialize } from '@lib/transitions.svelte';

  // ─────────────────────────────────────────────────────────────────────────
  // Types
  // ─────────────────────────────────────────────────────────────────────────

  interface SidebarItem {
    id: string;
    label: string;
  }

  interface SidebarSection {
    label?: string;
    items: SidebarItem[];
  }

  interface SidebarProps {
    sections: SidebarSection[];
    activeId?: string;
    open?: boolean;
    trackScroll?: boolean;
    onclose?: () => void;
    class?: string;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Props
  // ─────────────────────────────────────────────────────────────────────────

  let {
    sections,
    activeId = $bindable(''),
    open = $bindable(false),
    trackScroll = true,
    onclose,
    class: className = '',
  }: SidebarProps = $props();

  // ─────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────

  let isScrolling = $state(false);

  // Flat list of all item IDs for observer setup
  const allItems = $derived(sections.flatMap((s) => s.items));

  // ─────────────────────────────────────────────────────────────────────────
  // Hash URL Sync (page load + browser back/forward)
  // ─────────────────────────────────────────────────────────────────────────

  $effect(() => {
    function onHashChange() {
      const hash = window.location.hash.slice(1);
      if (hash && allItems.some((item) => item.id === hash)) {
        activeId = hash;
      }
    }

    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scroll Tracking (IntersectionObserver)
  // ─────────────────────────────────────────────────────────────────────────

  $effect(() => {
    if (!trackScroll) return;

    const elements = allItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip observer updates while programmatic scroll is in progress
        if (isScrolling) return;

        // Find all currently intersecting entries
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          activeId = visible[0].target.id;
        }
      },
      {
        // Narrow band near top — section crossing ~20% from top becomes active
        rootMargin: '-20% 0px -70% 0px',
      },
    );

    for (const el of elements) observer.observe(el);

    return () => observer.disconnect();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Keyboard — Escape closes dropdown
  // ─────────────────────────────────────────────────────────────────────────

  $effect(() => {
    if (!open) return;

    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        open = false;
        onclose?.();
      }
    }

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Click Handling
  // ─────────────────────────────────────────────────────────────────────────

  let scrollController: AbortController | undefined;
  let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

  function scrollToSection(event: Event, id: string) {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    // Optimistic update — set active immediately to avoid observer flicker
    activeId = id;

    // Close dropdown on navigation (+ restore focus via onclose)
    if (open) {
      open = false;
      onclose?.();
    }

    // Cancel any in-flight scroll tracking before starting new
    scrollController?.abort();
    if (scrollTimeout) clearTimeout(scrollTimeout);

    // Temporarily suppress observer updates during programmatic scroll
    isScrolling = true;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Use scrollend when available, with timeout fallback for Safari < 18
    scrollController = new AbortController();
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      scrollController = undefined;
      scrollTimeout = undefined;
    }, 1200);

    window.addEventListener(
      'scrollend',
      () => {
        isScrolling = false;
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollController = undefined;
        scrollTimeout = undefined;
      },
      { once: true, signal: scrollController.signal },
    );
  }
</script>

<!-- Shared item rendering -->
{#snippet sidebarItems()}
  {#each sections as section}
    <div class="flex flex-col gap-xs">
      {#if section.label}
        <span class="page-sidebar-label px-sm">{section.label}</span>
      {/if}
      {#each section.items as item}
        <a
          class="page-sidebar-item py-xs px-sm"
          href="#{item.id}"
          data-state={activeId === item.id ? 'active' : ''}
          aria-current={activeId === item.id ? 'location' : undefined}
          onclick={(e) => scrollToSection(e, item.id)}
        >
          {item.label}
        </a>
      {/each}
    </div>
  {/each}
{/snippet}

{#if open}
  <div
    class="page-sidebar-scrim"
    role="presentation"
    aria-hidden="true"
    onclick={() => {
      open = false;
      onclose?.();
    }}
    in:materialize
    out:dematerialize
  ></div>
{/if}

<nav
  id="page-sidebar-nav"
  class="page-sidebar flex flex-col gap-lg px-md {className}"
  data-state={open ? 'open' : undefined}
  aria-label="Page sections"
>
  {@render sidebarItems()}
</nav>
