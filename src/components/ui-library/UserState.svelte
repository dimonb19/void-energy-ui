<script lang="ts">
  import { ok } from '@lib/result';
  import { user } from '@stores/user.svelte';
  import { toast } from '@stores/toast.svelte';
  import Toggle from '../ui/Toggle.svelte';
  import ProfileBtn from '../ui/ProfileBtn.svelte';

  const demoUsers: Record<string, VoidUser> = {
    admin: {
      id: 'usr_001',
      name: 'Commander Voss',
      email: 'voss@void.energy',
      avatar: null,
      role_name: 'Admin',
      approved_tester: true,
    },
    creator: {
      id: 'usr_002',
      name: 'Architect Lume',
      email: 'lume@void.energy',
      avatar: null,
      role_name: 'Creator',
      approved_tester: true,
    },
    player: {
      id: 'usr_003',
      name: 'Agent Drift',
      email: 'drift@void.energy',
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=drift',
      role_name: 'Player',
      approved_tester: false,
    },
    guest: {
      id: 'usr_000',
      name: 'Wanderer Nyx',
      email: 'nyx@void.energy',
      avatar: null,
      role_name: 'Guest',
      approved_tester: false,
    },
  };

  function loginAs(role: string) {
    const u = demoUsers[role];
    if (!u) return;

    const result = user.login(u);
    if (result.ok) {
      toast.show(
        `Logged in as ${result.data.name} (${result.data.role_name})`,
        'success',
      );
    } else {
      toast.show(result.error.message, 'error');
    }
  }

  function handleLogout() {
    user.logout();
    toast.show('Logged out', 'info');
  }

  async function simulateRefresh() {
    const cached = user.current;
    const result = await user.refresh(async () => {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Return a "fresh" user with updated name (or null if not logged in)
      if (!cached) return ok(null);
      return ok({ ...cached, name: `${cached.name} (verified)` });
    });

    if (!result.ok) {
      toast.show(result.error.message, 'error');
      return;
    }

    if (result.data) {
      toast.show(`Verified ${result.data.name}`, 'success');
    } else {
      toast.show('No active session to verify', 'info');
    }
  }
</script>

<section id="user-state" class="flex flex-col gap-md">
  <h2>11 // USER STATE</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Reactive user hydration from localStorage. The store reads synchronously
      at construction time &mdash; before any component renders. Derived role
      flags are computed from the user object and cannot desync.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        The <code>user</code> singleton uses <code>$state</code> for the user
        object and <code>$derived</code> for role flags. The constructor reads localStorage
        before first paint. Login, logout, and partial updates persist immediately.
        Developer mode is a local toggle, not a server role. Refresh the page after
        logging in to verify hydration persists.
      </p>
    </details>

    <!-- CURRENT STATE -->
    <div class="flex flex-col gap-md">
      <h5>Current State</h5>
      <div class="surface-sunk p-md flex flex-col gap-md">
        <p class="text-small">
          <strong>User:</strong>
          {user.current?.name ?? 'Not signed in'}
        </p>
        <p class="text-small">
          <strong>Role:</strong>
          {user.current?.role_name ?? 'None'}
        </p>
        <p class="text-small">
          <strong>Flags:</strong>
          admin={String(user.isAdmin)}, creator={String(user.isCreator)},
          player={String(user.isPlayer)}, guest={String(user.isGuest)}
        </p>
        <p class="text-small">
          <strong>Tester:</strong>
          {String(user.approvedTester)}
          &middot;
          <strong>Dev Mode:</strong>
          {String(user.developerMode)}
          &middot;
          <strong>Loading:</strong>
          {String(user.loading)}
        </p>
      </div>
    </div>

    <!-- LOGIN / LOGOUT -->
    <div class="flex flex-col gap-md">
      <h5>Login / Logout</h5>
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button class="btn-system" onclick={() => loginAs('admin')}>
          Login as Admin
        </button>
        <button class="btn-success" onclick={() => loginAs('creator')}>
          Login as Creator
        </button>
        <button onclick={() => loginAs('player')}> Login as Player </button>
        <button class="btn-ghost" onclick={() => loginAs('guest')}>
          Login as Guest
        </button>
        <button
          class="btn-ghost btn-error"
          onclick={handleLogout}
          disabled={!user.isAuthenticated}
        >
          Logout
        </button>
      </div>
    </div>

    <!-- ASYNC REFRESH (Two-Phase Hydration) -->
    <div class="flex flex-col gap-md">
      <h5>Two-Phase Hydration</h5>
      <p class="text-small text-mute">
        Phase 1: synchronous cache read (constructor). Phase 2:
        <code>refresh(fetcher)</code> verifies against the server. The fetcher returns
        a typed Result, so transport and payload failures stay out of the component
        tree.
      </p>
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button
          onclick={simulateRefresh}
          disabled={!user.isAuthenticated || user.loading}
        >
          {user.loading ? 'Verifying...' : 'Simulate Async Refresh'}
        </button>
      </div>
      <p class="text-caption text-mute px-sm">
        Login first, then click to simulate a 1.5s API verification. The user
        name updates to confirm the refresh completed.
      </p>
    </div>

    <!-- PROFILE BUTTON -->
    <div class="flex flex-col gap-md">
      <h5>Profile Button</h5>
      <p class="text-small text-mute">
        Role-aware avatar with tab styling for navbar use. Players show their
        profile picture, all other roles show a role initial badge (G/A/C), and
        unauthenticated visitors see a silhouette icon. The chevron signals a
        dropdown menu that works for both auth states. Use the login buttons
        above to switch between roles.
      </p>
      <div
        class="surface-sunk p-md flex flex-wrap items-center justify-center gap-lg"
      >
        <ProfileBtn />
      </div>
      <p class="text-caption text-mute px-sm">
        <strong>Player</strong> (avatar image) &middot;
        <strong>Admin / Creator / Guest</strong> (initial badge) &middot;
        <strong>Unauthenticated</strong> (silhouette icon). Login as each role to
        see the difference. Hard-refresh (Cmd+Shift+R) to verify no avatar flash.
      </p>
    </div>

    <!-- FOUC PREVENTION -->
    <div class="flex flex-col gap-md">
      <h5>FOUC Prevention</h5>
      <p class="text-small text-mute">
        <code>UserScript.astro</code> sets <code>data-auth</code> on
        <code>&lt;html&gt;</code> before first paint. CSS utilities
        <code>.auth-only</code> / <code>.public-only</code> react immediately &mdash;
        no flash. Login, then hard-refresh to verify.
      </p>
      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="auth-only p-md border-l border-success">
          <p class="text-small">
            <strong class="text-success">auth-only:</strong> This content is visible
            for any authenticated user, including Guest role. Hidden before Svelte
            hydrates if no cached user exists.
          </p>
        </div>
        <div class="public-only p-md border-l border-system">
          <p class="text-small">
            <strong class="text-system">public-only:</strong> This content is visible
            only when unauthenticated (no user). Hidden immediately when any cached
            user exists, regardless of role.
          </p>
        </div>
      </div>
    </div>

    <!-- NAV INTEGRATION -->
    <div class="flex flex-col gap-md">
      <h5>Nav Integration</h5>
      <p class="text-small text-mute">
        ProfileBtn is designed for navbar use with the built-in Nav Menu
        Pattern. <code>Navigation.svelte</code> contains a step-by-step blueprint
        for a burger-triggered dropdown menu with ProfileBtn as the trigger. The
        pattern includes scrim, hover control, expandable sections, stagger animation,
        and Escape-to-close.
      </p>
      <div class="surface-sunk p-md flex flex-col gap-md">
        <p class="text-small">
          <strong>How it works:</strong> The Nav Menu already supports embedding
          custom components as menu items. ProfileBtn replaces the burger trigger
          or sits alongside it. The dropdown renders different content per auth state
          &mdash; full profile menu for signed-in users, limited options for guests.
        </p>

        <p class="text-small text-dim">
          <strong>Key integration points:</strong>
        </p>
        <ul class="text-small text-dim flex flex-col gap-sm px-md">
          <li>
            Wrap the menu trigger in <code>.auth-only</code> /
            <code>.public-only</code> if the trigger itself should change per auth
            state, or conditionally render menu items inside.
          </li>
          <li>
            The <code>.subtab</code> class from the navigation SCSS provides correct
            hover and active states for dropdown links.
          </li>
          <li>
            Use <code>.submenu</code> for nested sections with stagger animation
            via <code>--item-index</code>.
          </li>
          <li>
            See <code>Navigation.svelte</code> for the full commented blueprint with
            imports, state, and markup.
          </li>
        </ul>

        <details>
          <summary>View Pattern</summary>
          <pre><code
              >&lt;!-- In Navigation.svelte, replace ThemesBtn with ProfileBtn trigger --&gt;
&lt;button
  class="btn-void text-primary tab ml-auto"
  onclick=&#123;() =&gt; (menuOpen = !menuOpen)&#125;
  aria-expanded=&#123;menuOpen&#125;
  aria-controls="profile-menu"
&gt;
  &lt;ProfileBtn /&gt;
&lt;/button&gt;

&lt;!-- Menu items adapt to auth state --&gt;
&#123;#if menuOpen&#125;
  &lt;div id="profile-menu" class="nav-menu" role="menu"&gt;
    &#123;#if user.isAuthenticated&#125;
      &lt;a class="subtab" href="/profile"&gt;My Profile&lt;/a&gt;
      &lt;a class="subtab" href="/settings"&gt;Settings&lt;/a&gt;
      &lt;hr /&gt;
      &lt;button class="btn-ghost btn-error"&gt;Sign Out&lt;/button&gt;
    &#123;:else&#125;
      &lt;a class="subtab" href="/login"&gt;Sign In&lt;/a&gt;
      &lt;a class="subtab" href="/register"&gt;Create Account&lt;/a&gt;
    &#123;/if&#125;
  &lt;/div&gt;
&#123;/if&#125;</code
            ></pre>
        </details>
      </div>
      <p class="text-caption text-mute px-sm">
        This demo app only has 2 pages, so the profile menu is not wired into
        the actual navbar. The pattern is production-ready &mdash; uncomment and
        adapt the blueprint in Navigation.svelte.
      </p>
    </div>

    <!-- DEVELOPER MODE -->
    <div class="flex flex-col gap-md">
      <h5>Developer Mode</h5>
      <div class="surface-sunk p-md flex justify-center">
        <Toggle
          bind:checked={user.developerMode}
          label={user.developerMode ? 'Enabled' : 'Disabled'}
          id="dev-mode-toggle"
        />
      </div>
      <p class="text-caption text-mute px-sm">
        Local preference, not a server role. Resets on logout.
      </p>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >import &#123; user &#125; from '@stores/user.svelte';

// Login (persists to localStorage)
user.login(&#123;
  id: '1', name: 'Voss', email: 'v@void.energy',
  avatar: null, role_name: 'Admin', approved_tester: true,
&#125;);

// Derived flags (auto-update, cannot desync)
user.isAdmin;         // true
user.isAuthenticated; // true
user.approvedTester;  // true

// Two-phase hydration: verify cached user with API
await user.refresh(() =&gt; Account.getUserResult());
// user.loading is true during fetch, false after

// Partial update
user.update(&#123; name: 'Commander Voss' &#125;);

// Logout (clears everything, resets to unauthenticated)
user.logout();</code
        ></pre>
    </details>
  </div>
</section>
