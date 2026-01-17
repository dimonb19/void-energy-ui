<script lang="ts">
  import { materialize, dematerialize } from '../lib/transitions.svelte';

  import Burger from './icons/Burger.svelte';
  import Logo from './icons/Logo.svelte';
  import Search from './icons/Search.svelte';
  import Door from './icons/Door.svelte';
  import ThemeSelector from './ui/Themes.svelte';

  let sidebarOpen = $state<boolean>(false);
  let activeTab = $state<string>('Stories');

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

<nav class="nav-bar" aria-label="Navigation" data-hidden={navHidden}>
  <!-- Desktop Nav Links -->
  <ul class="tab-list hidden tablet:flex">
    <li>
      <a class="tab line-right logo" href="/" aria-label="Logo">
        <Logo />
      </a>
    </li>
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
    <li class="flex">
      <Search
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
    </li>
  </ul>

  <!-- Right Side: Profile + Burger -->
  <div class="tab-list">
    <!-- Profile Button -->
    <a
      class="tab pr-xs"
      href="/"
      data-state={activeTab === 'Profile' ? 'active' : ''}
      onclick={(e) => selectTab(e, 'Profile')}
    >
      Profile
      <img class="icon rounded-full" src="/pfp.jpg" alt="PFP" data-size="xl" />
    </a>

    <!-- Burger Button -->
    <button
      class="btn-void text-primary tab line-left"
      onclick={() => (sidebarOpen = !sidebarOpen)}
      aria-expanded={sidebarOpen}
      aria-controls="burger-menu"
      aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
    >
      <Burger open={sidebarOpen} />
    </button>
  </div>

  <aside class="sidebar" class:open={sidebarOpen}>
    <a
      class="subtab"
      href="/"
      data-state={activeTab === 'Dashboard' ? 'active' : ''}
      onclick={(e) => selectTab(e, 'Dashboard')}
    >
      Dashboard
    </a>
    <a
      class="subtab expandable"
      href="/"
      data-state={activeTab === 'Account' ? 'active' : ''}
      onclick={(e) => selectTab(e, 'Account')}
    >
      Account
      <svg
        class="icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke-width="2"
        style:transform={activeTab === 'Account'
          ? 'rotate(90deg)'
          : 'rotate(0deg)'}
      >
        <polyline points="9 6 15 12 9 18" />
      </svg>
    </a>
    {#if activeTab === 'Account' || activeTab === 'Overview' || activeTab === 'Bookmarks'}
      <ul class="submenu">
        <li>
          <a
            class="subtab"
            href="/"
            in:materialize
            out:dematerialize={{ delay: 50 }}
          >
            Overview
          </a>
        </li>
        <li>
          <a
            class="subtab"
            href="/"
            in:materialize={{ delay: 50 }}
            out:dematerialize
          >
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
    >
      Settings
    </a>
    <ThemeSelector className="btn-void subtab flex-row-reverse" />
    <Door
      state="outside"
      text="Sign Out"
      className="subtab flex-row-reverse"
      voidBtn={true}
      onclick={() => console.log('Sign Out')}
    />
  </aside>
</nav>

{#if sidebarOpen}
  <div
    class="sidebar-scrim"
    role="presentation"
    aria-hidden="true"
    onclick={() => (sidebarOpen = false)}
    in:materialize
    out:dematerialize
  ></div>
{/if}
