<script lang="ts">
  import type { Component } from 'svelte';
  import { materialize, dematerialize } from '@lib/transitions.svelte';
  import { morph } from '@actions/morph';

  import ThemeSelector from './ui/Themes.svelte';

  import Burger from './icons/Burger.svelte';
  import LogoDGRS from './icons/LogoDGRS.svelte';
  import Quill from './icons/Quill.svelte';
  import Grid from './icons/Grid.svelte';

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

  type SidebarItem =
    | NavItem
    | {
        id: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: Component<any>;
        props?: Record<string, unknown>;
      };

  // Main navigation tabs (desktop header + mobile bottom nav)
  const navItems: NavItem[] = [
    { id: 'conexus', label: 'CoNexus', href: '/conexus', icon: Quill },
    { id: 'components', label: 'Components', href: '/components', icon: Grid },
  ];

  // Sidebar/dropdown menu items
  const sidebarItems: SidebarItem[] = [
    {
      id: 'library',
      label: 'Library',
      children: [
        { id: 'Buttons', label: 'Buttons', href: '/' },
        { id: 'Icons', label: 'Icons', href: '/' },
      ],
    },
    {
      id: 'ThemeSelector',
      component: ThemeSelector,
      props: { class: 'btn-void subtab flex-row-reverse' },
    },
  ];

  // Helper to check if item is a component slot (not a link)
  const isComponentItem = (
    item: SidebarItem,
  ): item is {
    id: string;
    component: Component;
    props?: Record<string, unknown>;
  } => 'component' in item;

  // Helper to check if an expandable item should be open
  const isExpanded = (item: NavItem): boolean => {
    if (!item.children) return false;
    return (
      activeTab === item.id || item.children.some((c) => activeTab === c.id)
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────────

  let sidebarOpen = $state<boolean>(false);
  let activeTab = $state<string>('');

  // Sidebar hover control (desktop dropdown behavior)
  let sidebarTimer: ReturnType<typeof setTimeout> | null = null;

  function openSidebar(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    if (sidebarTimer) clearTimeout(sidebarTimer);
    sidebarOpen = true;
  }

  function closeSidebarDelayed(event: PointerEvent) {
    // Don't auto-close on touch - let the user tap links without the menu disappearing
    if (event.pointerType === 'touch') return;

    sidebarTimer = setTimeout(() => {
      sidebarOpen = false;
    }, 300);
  }

  let navHidden = $state<boolean>(false);
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

  // Resolve active tab from current URL on mount
  $effect(() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const match = navItems.find(
      (t) => t.href && t.href.replace(/\/+$/, '') === path,
    );
    if (match) activeTab = match.id;
  });

  // "The Peek" - reveal navbar on mouse hover at top edge
  let peekTimer: ReturnType<typeof setTimeout> | null = null;
  const PEEK_THRESHOLD = 12; // px from top edge (the stratosphere)
  const PEEK_DELAY = 300; // ms debounce for intent

  const onmousemove = (event: MouseEvent) => {
    // Only activate when navbar is hidden and page is scrolled
    if (!navHidden || window.scrollY <= clamp) return;

    if (event.clientY <= PEEK_THRESHOLD) {
      // Mouse in the stratosphere - start peek timer
      if (!peekTimer) {
        peekTimer = setTimeout(() => {
          navHidden = false;
          peekTimer = null;
        }, PEEK_DELAY);
      }
    } else {
      // Mouse left the stratosphere - cancel peek
      if (peekTimer) {
        clearTimeout(peekTimer);
        peekTimer = null;
      }
    }
  };

  const onscroll = (event: Event) => {
    const y = window.scrollY;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (y > lastY && y > clamp) {
        navHidden = true;
        sidebarOpen = false;
      } else if (y < lastY) navHidden = false;
      lastY = y;
      ticking = false;
    });
  };

  const selectTab = (
    event: Event,
    tabName: string,
    hasChildren: boolean = false,
  ) => {
    if (hasChildren) {
      // Expandable parent: toggle open/closed, prevent navigation
      event.preventDefault();
      if (tabName === activeTab) {
        activeTab = '';
        return;
      }
    } else {
      // Leaf item: let the browser navigate, close sidebar
      sidebarOpen = false;
    }
    activeTab = tabName;
  };
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
          data-state={activeTab === tab.id ? 'active' : ''}
          onclick={(e) => selectTab(e, tab.id)}
        >
          {tab.label}
        </a>
      </li>
    {/each}
  </ul>

  <!-- Burger Button -->
  <button
    class="btn-void text-primary tab ml-auto"
    onclick={() => (sidebarOpen = !sidebarOpen)}
    aria-expanded={sidebarOpen}
    aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
    aria-controls="burger-menu"
    onpointerenter={openSidebar}
    onpointerleave={closeSidebarDelayed}
  >
    <Burger data-size="2xl" data-state={sidebarOpen ? 'active' : ''} />
  </button>
</nav>

<!-- Mobile Nav Links -->
<nav class="bottom-nav flex flex-row items-center justify-center tablet:hidden">
  {#each navItems as tab}
    <a
      class="tab"
      href={tab.href}
      data-state={activeTab === tab.id ? 'active' : ''}
      onclick={(e) => selectTab(e, tab.id)}
    >
      {#if tab.icon}
        <tab.icon />
      {/if}
    </a>
  {/each}
</nav>

{#if sidebarOpen}
  <div
    class="sidebar flex flex-col items-center gap-xs"
    role="menu"
    aria-label="Dropdown"
    onpointerenter={openSidebar}
    onpointerleave={closeSidebarDelayed}
    in:materialize
    out:dematerialize={{ y: 0 }}
    use:morph={{ height: true, width: false }}
  >
    {#each sidebarItems as item, i (item.id)}
      {#if isComponentItem(item)}
        <span class="w-full" style="--item-index: {i}">
          <item.component {...item.props} />
        </span>
      {:else if item.children}
        <button
          class="btn-void subtab expandable"
          type="button"
          style="--item-index: {i}"
          data-state={activeTab === item.id ? 'active' : ''}
          aria-expanded={isExpanded(item)}
          onclick={(e) => selectTab(e, item.id, true)}
        >
          {item.label}
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke-width="2"
            data-expanded={isExpanded(item)}
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
        {#if isExpanded(item)}
          <ul class="submenu" out:dematerialize>
            {#each item.children as child, j (child.id)}
              <li style="--item-index: {j}">
                <a
                  class="subtab"
                  href={child.href}
                  data-state={activeTab === child.id ? 'active' : ''}
                  onclick={(e) => selectTab(e, child.id)}
                >
                  {child.label}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      {:else}
        <a
          class="subtab"
          href={item.href}
          style="--item-index: {i}"
          data-state={activeTab === item.id ? 'active' : ''}
          onclick={(e) => selectTab(e, item.id)}
        >
          {item.label}
        </a>
      {/if}
    {/each}
  </div>

  <div
    class="sidebar-scrim"
    role="presentation"
    aria-hidden="true"
    onclick={() => (sidebarOpen = false)}
    in:materialize
    out:dematerialize
  ></div>
{/if}
