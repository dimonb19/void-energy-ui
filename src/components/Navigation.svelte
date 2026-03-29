<script lang="ts">
  import type { Component } from 'svelte';

  import { untrack } from 'svelte';
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { modal } from '@lib/modal-manager.svelte';
  import { shortcutRegistry } from '@lib/shortcut-registry.svelte';
  import ThemesBtn from './ui/ThemesBtn.svelte';
  import Breadcrumbs from './ui/Breadcrumbs.svelte';

  import { navlink } from '@actions/navlink';
  import LogoDGRS from './icons/LogoDGRS.svelte';
  import Quill from './icons/Quill.svelte';
  import { LayoutGrid, Type } from '@lucide/svelte';

  // ─────────────────────────────────────────────────────────────────────────────
  // Navigation Data Structure
  // ─────────────────────────────────────────────────────────────────────────────

  type NavItem = {
    id: string;
    label: string;
    href?: string;
    icon?: Component;
    children?: NavItem[];
  };

  // Main navigation tabs (desktop header + mobile bottom nav)
  const navItems: NavItem[] = [
    { id: 'conexus', label: 'CoNexus', href: '/conexus', icon: Quill },
    {
      id: 'kinetic-text',
      label: 'Kinetic Text',
      href: '/kinetic-text',
      icon: Type,
    },
    {
      id: 'components',
      label: 'Components',
      href: '/components',
      icon: LayoutGrid,
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // Props
  // ─────────────────────────────────────────────────────────────────────────────

  let {
    pathname = '',
    breadcrumbs,
  }: {
    pathname?: string;
    breadcrumbs?: BreadcrumbItem[];
  } = $props();

  function resolveTab(path: string): string {
    const normalized = path.replace(/\/+$/, '') || '/';
    return (
      navItems.find((t) => t.href && t.href.replace(/\/+$/, '') === normalized)
        ?.id ?? ''
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────────

  // svelte-ignore state_referenced_locally
  let activeTab = $state<string>(resolveTab(pathname));
  let navHidden = $state<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // Bottom Nav Sliding Indicator (same pattern as Tabs component)
  // ─────────────────────────────────────────────────────────────────────────────

  let bottomNavEl = $state<HTMLElement>();
  let bottomNavMounted = false;

  function updateBottomIndicator() {
    if (!bottomNavEl) return;

    const activeEl = bottomNavEl.querySelector<HTMLElement>(
      `[data-state="active"]`,
    );
    if (!activeEl) {
      bottomNavEl.style.setProperty('--_indicator-width', '0');
      return;
    }

    const indicator = bottomNavEl.querySelector<HTMLElement>(
      '.bottom-nav-indicator',
    );
    if (!indicator) return;

    // First paint: position instantly, then trigger fade-in animation
    if (!bottomNavMounted) {
      indicator.style.transition = 'none';
      bottomNavMounted = true;
      // Schedule data-ready after position is applied so animation plays visibly
      requestAnimationFrame(() => {
        indicator.style.transition = '';
        indicator.dataset.ready = '';
      });
    } else {
      indicator.style.transition = '';
    }

    const navRect = bottomNavEl.getBoundingClientRect();
    const tabRect = activeEl.getBoundingClientRect();
    bottomNavEl.style.setProperty(
      '--_indicator-left',
      `${tabRect.left - navRect.left}px`,
    );
    bottomNavEl.style.setProperty('--_indicator-width', `${tabRect.width}px`);
    bottomNavEl.style.setProperty('--_indicator-height', `${tabRect.height}px`);
  }

  // Recompute on active tab change
  $effect(() => {
    void activeTab;
    requestAnimationFrame(() => requestAnimationFrame(updateBottomIndicator));
  });

  // Recompute on layout shifts
  $effect(() => {
    if (!bottomNavEl) return;
    const ro = new ResizeObserver(updateBottomIndicator);
    ro.observe(bottomNavEl);
    for (const tab of bottomNavEl.querySelectorAll<HTMLElement>('.tab')) {
      ro.observe(tab);
    }
    return () => ro.disconnect();
  });

  const clamp = 64; // px after which hiding can kick in
  let lastY = 0;
  let ticking = false;

  // Expose navbar visibility to CSS for pull-refresh coordination
  $effect(() => {
    document.documentElement.style.setProperty(
      '--nav-hidden',
      navHidden ? '1' : '0',
    );
  });

  // Force-reveal navbar when fixedNav preference is enabled
  $effect(() => {
    if (voidEngine.userConfig.fixedNav) {
      navHidden = false;
    }
  });

  // Resolve active tab from current URL on mount
  $effect(() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const match = navItems.find(
      (t) => t.href && t.href.replace(/\/+$/, '') === path,
    );
    if (match) activeTab = match.id;
  });

  // "The Peek" - reveal navbar on mouse hover at top edge
  const PEEK_THRESHOLD = 12; // px from top edge (the stratosphere)

  const onmousemove = (event: MouseEvent) => {
    // Only activate when navbar is hidden and page is scrolled
    if (!navHidden || window.scrollY <= clamp) return;

    if (event.clientY <= PEEK_THRESHOLD) {
      navHidden = false;
    }
  };

  const onscroll = () => {
    if (voidEngine.userConfig.fixedNav) return;

    const y = window.scrollY;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (y > lastY && y > clamp) {
        navHidden = true;
        // menuOpen = false; // ← uncomment when nav menu is enabled
      } else if (y < lastY) navHidden = false;
      lastY = y;
      ticking = false;
    });
  };

  const selectTab = (event: Event, tabName: string) => {
    activeTab = tabName;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Global Keyboard Shortcuts
  // ─────────────────────────────────────────────────────────────────────────────

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  $effect(() => {
    untrack(() => {
      shortcutRegistry.register({
        key: 'f',
        label: 'Toggle fullscreen',
        group: 'General',
        action: toggleFullscreen,
      });

      shortcutRegistry.register({
        key: 't',
        label: 'Open atmospheres',
        group: 'General',
        action: () => modal.themes(),
      });

      shortcutRegistry.register({
        key: '?',
        label: 'Show keyboard shortcuts',
        group: 'General',
        action: () => modal.shortcuts(),
      });

      shortcutRegistry.register({
        key: 'k',
        modifier: 'meta',
        label: 'Command palette',
        group: 'General',
        action: () => modal.palette(),
      });
    });

    return () => {
      shortcutRegistry.unregister('f');
      shortcutRegistry.unregister('t');
      shortcutRegistry.unregister('?');
      shortcutRegistry.unregister('k', 'meta');
    };
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // NAV MENU PATTERN
  // ─────────────────────────────────────────────────────────────────────────────
  // Burger-triggered dropdown menu with scrim, hover control, expandable
  // sections, stagger animation, and Escape-to-close. Disabled for this
  // showcase (only 2 pages). To enable in another app:
  //
  // 1. ADD IMPORTS:
  //
  //   import { materialize, dematerialize } from '@lib/transitions.svelte';
  //   import { morph } from '@actions/morph';
  //   import Burger from './icons/Burger.svelte';
  //   import { ChevronRight } from '@lucide/svelte';
  //
  // 2. ADD TYPES (after NavItem):
  //
  //   type MenuItem =
  //     | NavItem
  //     | {
  //         id: string;
  //         component: Component;
  //         props?: Record<string, unknown>;
  //       };
  //
  // 3. CONFIGURE MENU ITEMS (replace with your routes):
  //
  //   const menuItems: MenuItem[] = [
  //     {
  //       id: 'section',
  //       label: 'Section Name',
  //       children: [
  //         { id: 'page-a', label: 'Page A', href: '/page-a' },
  //         { id: 'page-b', label: 'Page B', href: '/page-b' },
  //       ],
  //     },
  //     // Embed a component directly (e.g., ThemesBtn):
  //     {
  //       id: 'theme',
  //       component: ThemesBtn,
  //       props: { class: 'btn-void subtab flex-row-reverse' },
  //     },
  //   ];
  //
  // 4. ADD HELPERS:
  //
  //   const isComponentItem = (
  //     item: MenuItem,
  //   ): item is { id: string; component: Component; props?: Record<string, unknown> } =>
  //     'component' in item;
  //
  //   const isExpanded = (item: NavItem): boolean => {
  //     if (!item.children) return false;
  //     return activeTab === item.id || item.children.some((c) => activeTab === c.id);
  //   };
  //
  // 5. ADD STATE & FUNCTIONS:
  //
  //   let menuOpen = $state<boolean>(false);
  //   let menuTimer: ReturnType<typeof setTimeout> | null = null;
  //
  //   function openMenu(event: PointerEvent) {
  //     if (event.pointerType === 'touch') return;
  //     if (menuTimer) clearTimeout(menuTimer);
  //     menuOpen = true;
  //   }
  //
  //   function closeMenuDelayed(event: PointerEvent) {
  //     if (event.pointerType === 'touch') return;
  //     menuTimer = setTimeout(() => { menuOpen = false; }, 300);
  //   }
  //
  // 6. UPGRADE selectTab (replace the simplified version):
  //
  //   const selectTab = (event: Event, tabName: string, hasChildren: boolean = false) => {
  //     if (hasChildren) {
  //       event.preventDefault();
  //       if (tabName === activeTab) { activeTab = ''; return; }
  //     } else {
  //       menuOpen = false;
  //     }
  //     activeTab = tabName;
  //   };
  //
  // 7. ADD TO <svelte:window>:
  //
  //   onkeydown={(e) => { if (e.key === 'Escape' && menuOpen) menuOpen = false; }}
  //
  // 8. REPLACE <ThemesBtn> IN NAV BAR with burger button:
  //
  //   <button
  //     class="btn-void text-primary tab ml-auto"
  //     onclick={() => (menuOpen = !menuOpen)}
  //     aria-expanded={menuOpen}
  //     aria-label={menuOpen ? 'Close menu' : 'Open menu'}
  //     aria-controls="burger-menu"
  //     onpointerenter={openMenu}
  //     onpointerleave={closeMenuDelayed}
  //   >
  //     <Burger data-size="2xl" data-state={menuOpen ? 'active' : ''} />
  //   </button>
  //
  // 9. ADD MENU DROPDOWN + SCRIM (after bottom-nav):
  //
  //   {#if menuOpen}
  //     <div
  //       id="burger-menu"
  //       class="nav-menu flex flex-col items-center gap-xs"
  //       role="menu"
  //       aria-label="Menu"
  //       onpointerenter={openMenu}
  //       onpointerleave={closeMenuDelayed}
  //       in:materialize
  //       out:dematerialize={{ y: 0 }}
  //       use:morph={{ width: false }}
  //     >
  //       {#each menuItems as item, i (item.id)}
  //         {#if isComponentItem(item)}
  //           <span class="w-full" style="--item-index: {i}">
  //             <item.component {...item.props} />
  //           </span>
  //         {:else if item.children}
  //           <button
  //             class="btn-void subtab expandable"
  //             type="button"
  //             style="--item-index: {i}"
  //             data-state={activeTab === item.id ? 'active' : ''}
  //             aria-expanded={isExpanded(item)}
  //             onclick={(e) => selectTab(e, item.id, true)}
  //           >
  //             {item.label}
  //             <ChevronRight class="icon" data-expanded={isExpanded(item)} />
  //           </button>
  //           {#if isExpanded(item)}
  //             <ul class="submenu" out:dematerialize>
  //               {#each item.children as child, j (child.id)}
  //                 <li style="--item-index: {j}">
  //                   <a
  //                     class="subtab"
  //                     href={child.href}
  //                     data-state={activeTab === child.id ? 'active' : ''}
  //                     onclick={(e) => selectTab(e, child.id)}
  //                   >
  //                     {child.label}
  //                   </a>
  //                 </li>
  //               {/each}
  //             </ul>
  //           {/if}
  //         {:else}
  //           <a
  //             class="subtab"
  //             href={item.href}
  //             style="--item-index: {i}"
  //             data-state={activeTab === item.id ? 'active' : ''}
  //             onclick={(e) => selectTab(e, item.id)}
  //           >
  //             {item.label}
  //           </a>
  //         {/if}
  //       {/each}
  //     </div>
  //
  //     <div
  //       class="nav-menu-scrim"
  //       role="presentation"
  //       aria-hidden="true"
  //       onclick={() => (menuOpen = false)}
  //       in:materialize
  //       out:dematerialize
  //     ></div>
  //   {/if}
  //
  // SCSS: .nav-menu, .nav-menu-scrim, .submenu, .subtab, stagger animation
  //       already exist in src/styles/components/_navigation.scss
  // ─────────────────────────────────────────────────────────────────────────────
</script>

<svelte:window {onscroll} {onmousemove} />

<nav
  class="nav-bar flex flex-row items-center justify-between tablet:justify-normal gap-xs px-xs"
  aria-label="Navigation"
  data-hidden={navHidden}
>
  <a class="tab" href="/" aria-label="Logo">
    <LogoDGRS class="text-primary w-4xl" />
  </a>

  <!-- Desktop Nav Links -->
  <ul class="hidden tablet:flex items-center gap-xs">
    {#each navItems as tab}
      <li>
        <a
          class="tab"
          href={tab.href}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          data-state={activeTab === tab.id ? 'active' : ''}
          onclick={(e) => selectTab(e, tab.id)}
          use:navlink
        >
          {tab.label}
        </a>
      </li>
    {/each}
  </ul>

  <ThemesBtn class="btn-void tab ml-auto flex-row-reverse gap-sm" />
</nav>

<!-- Mobile Nav Links -->
<nav
  class="bottom-nav flex flex-row items-center justify-center tablet:hidden"
  aria-label="Mobile navigation"
  bind:this={bottomNavEl}
>
  {#each navItems as tab}
    <a
      class="tab"
      href={tab.href}
      aria-label={tab.label}
      aria-current={activeTab === tab.id ? 'page' : undefined}
      data-state={activeTab === tab.id ? 'active' : ''}
      onclick={(e) => selectTab(e, tab.id)}
      use:navlink
    >
      {#if tab.icon}
        <tab.icon class="icon" />
      {/if}
    </a>
  {/each}
  <span class="bottom-nav-indicator" aria-hidden="true"></span>
</nav>

<!-- Breadcrumbs -->
{#if breadcrumbs && breadcrumbs.length > 0}
  <Breadcrumbs items={breadcrumbs} hidden={navHidden} />
{/if}
