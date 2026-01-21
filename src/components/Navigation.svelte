<script lang="ts">
  import { materialize, dematerialize } from '../lib/transitions.svelte';

  import Burger from './icons/Burger.svelte';
  import Logo from './icons/Logo.svelte';
  import Quill from './icons/Quill.svelte';
  import SearchBtn from './icons/SearchBtn.svelte';
  import DoorBtn from './icons/DoorBtn.svelte';
  import Dream from './icons/Dream.svelte';
  import Home from './icons/Home.svelte';
  import ThemeSelector from './ui/Themes.svelte';

  let sidebarOpen = $state<boolean>(false);
  let activeTab = $state<string>('Stories');

  // Sidebar hover control (desktop dropdown behavior)
  let sidebarTimer: ReturnType<typeof setTimeout> | null = null;

  function openSidebar() {
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

  let searchInput: HTMLInputElement | null;
  let svgFocus = $state<boolean>(false);
  const handleSearchFocus = () => {
    // clicking the magnifier should focus the native input for accessibility shortcuts
    if (!searchInput) return;
    searchInput.focus();
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

  const selectTab = (event: Event, tabName: string) => {
    event.preventDefault();
    if (tabName === activeTab) {
      activeTab = '';
      return;
    }
    activeTab = tabName;
  };
</script>

<svelte:window {onscroll} />

<nav
  class="nav-bar flex flex-row items-center justify-between tablet:justify-normal gap-xs px-xs"
  aria-label="Navigation"
  data-hidden={navHidden}
>
  <!-- Mobile logo -->
  <a class="tab small-desktop:hidden" href="/" aria-label="Logo">
    <Quill />
  </a>
  <!-- Desktop logo -->
  <a class="tab hidden small-desktop:flex" href="/" aria-label="Logo">
    <Logo />
  </a>

  <!-- Desktop Nav Links -->
  <ul class="hidden tablet:flex items-center gap-xs">
    <li>
      <a
        class="tab"
        href="/"
        data-state={activeTab === 'Stories' ? 'active' : ''}
        onclick={(e) => selectTab(e, 'Stories')}
      >
        Stories
      </a>
    </li>
    <li>
      <a
        class="tab"
        href="/"
        data-state={activeTab === 'Dream' ? 'active' : ''}
        onclick={(e) => selectTab(e, 'Dream')}
      >
        Dream
      </a>
    </li>
  </ul>

  <!-- Search input -->
  <span class="search">
    <SearchBtn
      onclick={handleSearchFocus}
      {svgFocus}
      className="text-secondary"
    />
    <input
      id="search"
      type="text"
      placeholder="Search..."
      aria-label="Search"
      bind:this={searchInput}
      onfocus={() => (svgFocus = true)}
      onblur={() => (svgFocus = false)}
    />
  </span>

  <!-- Profile Button (Desktop) - Hover triggers sidebar as dropdown -->
  <a
    class="tab hidden tablet:flex ml-auto"
    href="/"
    data-state={activeTab === 'Profile' ? 'active' : ''}
    onclick={(e) => selectTab(e, 'Profile')}
    onpointerenter={openSidebar}
    onpointerleave={closeSidebarDelayed}
  >
    <img class="icon rounded-full" src="/pfp.jpg" alt="PFP" data-size="2xl" />
    Profile
    <span class="arrow icon" data-size="sm" aria-hidden="true"></span>
  </a>

  <!-- Burger Button (Mobile) -->
  <button
    class="burger-tab btn-void text-primary tab"
    onclick={() => (sidebarOpen = !sidebarOpen)}
    aria-expanded={sidebarOpen}
    aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
    aria-controls="burger-menu"
  >
    <Burger open={sidebarOpen} />
  </button>
</nav>

<nav class="bottom-nav flex flex-row items-center justify-center tablet:hidden">
  <a
    class="tab"
    href="/"
    data-state={activeTab === 'Stories' ? 'active' : ''}
    onclick={(e) => selectTab(e, 'Stories')}
  >
    <Home />
  </a>
  <a
    class="tab"
    href="/"
    data-state={activeTab === 'Dream' ? 'active' : ''}
    onclick={(e) => selectTab(e, 'Dream')}
  >
    <Dream />
  </a>
  <a
    class="tab"
    href="/"
    data-state={activeTab === 'Profile' ? 'active' : ''}
    onclick={(e) => selectTab(e, 'Profile')}
  >
    <img class="icon rounded-full" src="/pfp.jpg" alt="PFP" />
  </a>
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
  >
    <a
      class="subtab"
      href="/"
      data-state={activeTab === 'Dashboard' ? 'active' : ''}
      onclick={(e) => selectTab(e, 'Dashboard')}
      in:materialize
    >
      Dashboard
    </a>
    <a
      class="subtab expandable"
      href="/"
      data-state={activeTab === 'Account' ? 'active' : ''}
      onclick={(e) => selectTab(e, 'Account')}
      in:materialize={{ delay: 50 }}
    >
      Account
      <svg
        class="icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke-width="2"
        data-expanded={activeTab === 'Account'}
      >
        <polyline points="9 6 15 12 9 18" />
      </svg>
    </a>
    {#if activeTab === 'Account' || activeTab === 'Overview' || activeTab === 'Bookmarks'}
      <ul class="submenu" in:materialize>
        <li>
          <a class="subtab" href="/" in:materialize> Overview </a>
        </li>
        <li>
          <a class="subtab" href="/" in:materialize={{ delay: 50 }}>
            Bookmarks
          </a>
        </li>
      </ul>
    {/if}
    <a
      class="subtab"
      href="/"
      data-state={activeTab === 'Settings' ? 'active' : ''}
      onclick={(e) => selectTab(e, 'Settings')}
      in:materialize={{ delay: 100 }}
    >
      Personal Settings
    </a>
    <span class="w-full" in:materialize={{ delay: 150 }}>
      <ThemeSelector className="btn-void subtab flex-row-reverse" />
    </span>
    <span class="w-full" in:materialize={{ delay: 200 }}>
      <DoorBtn
        state="outside"
        text="Sign Out"
        className="subtab flex-row-reverse"
        voidBtn={true}
        onclick={() => console.log('Sign Out')}
      />
    </span>
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
