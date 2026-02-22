<script lang="ts">
  import { user } from '@stores/user.svelte';
  import { toast } from '@stores/toast.svelte';
  import Toggle from '../ui/Toggle.svelte';

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
      avatar: null,
      role_name: 'Player',
      approved_tester: false,
    },
  };

  function loginAs(role: string) {
    const u = demoUsers[role];
    if (u) {
      user.login(u);
      toast.show(`Logged in as ${u.name} (${u.role_name})`, 'success');
    }
  }

  function handleLogout() {
    user.logout();
    toast.show('Logged out', 'info');
  }

  function simulateRefresh() {
    const cached = user.current;
    user.refresh(async () => {
      // Simulate API latency
      await new Promise((r) => setTimeout(r, 1500));
      // Return a "fresh" user with updated name (or null if not logged in)
      if (!cached) return null;
      return { ...cached, name: `${cached.name} (verified)` };
    });
  }
</script>

<section id="user-state" class="flex flex-col gap-md">
  <h2>12 // USER STATE</h2>

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
    <div class="flex flex-col gap-sm">
      <h5>Current State</h5>
      <div class="surface-sunk p-md flex flex-col gap-md">
        <p class="text-small">
          <strong>User:</strong>
          {user.current?.name ?? 'Guest (not logged in)'}
        </p>
        <p class="text-small">
          <strong>Role:</strong>
          {user.current?.role_name ?? 'Guest'}
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
    <div class="flex flex-col gap-sm">
      <h5>Login / Logout</h5>
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button class="btn-system" onclick={() => loginAs('admin')}>
          Login as Admin
        </button>
        <button class="btn-success" onclick={() => loginAs('creator')}>
          Login as Creator
        </button>
        <button onclick={() => loginAs('player')}> Login as Player </button>
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
    <div class="flex flex-col gap-sm">
      <h5>Two-Phase Hydration</h5>
      <p class="text-small text-mute">
        Phase 1: synchronous cache read (constructor). Phase 2:
        <code>refresh(fetcher)</code> verifies against the server. The store accepts
        any async function &mdash; decoupled from API clients.
      </p>
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button
          onclick={simulateRefresh}
          disabled={!user.isAuthenticated || user.loading}
        >
          {user.loading ? 'Verifying...' : 'Simulate Async Refresh'}
        </button>
      </div>
      <p class="text-caption text-mute px-xs">
        Login first, then click to simulate a 1.5s API verification. The user
        name updates to confirm the refresh completed.
      </p>
    </div>

    <!-- FOUC PREVENTION -->
    <div class="flex flex-col gap-sm">
      <h5>FOUC Prevention</h5>
      <p class="text-small text-mute">
        <code>UserScript.astro</code> sets <code>data-auth</code> on
        <code>&lt;html&gt;</code> before first paint. CSS utilities
        <code>.auth-only</code> / <code>.guest-only</code> react immediately &mdash;
        no flash. Login, then hard-refresh to verify.
      </p>
      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="auth-only p-md border-l-2 border-success">
          <p class="text-small">
            <strong class="text-success">auth-only:</strong> This content is visible
            only when authenticated. Hidden before Svelte hydrates if no cached user.
          </p>
        </div>
        <div class="guest-only p-md border-l-2 border-system">
          <p class="text-small">
            <strong class="text-system">guest-only:</strong> This content is visible
            only for guests. Hidden immediately when a cached user exists.
          </p>
        </div>
      </div>
    </div>

    <!-- DEVELOPER MODE -->
    <div class="flex flex-col gap-sm">
      <h5>Developer Mode</h5>
      <div class="surface-sunk p-md flex justify-center">
        <Toggle
          bind:checked={user.developerMode}
          label={user.developerMode ? 'Enabled' : 'Disabled'}
          id="dev-mode-toggle"
        />
      </div>
      <p class="text-caption text-mute px-xs">
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
await user.refresh(() =&gt; Account.getUser());
// user.loading is true during fetch, false after

// Partial update
user.update(&#123; name: 'Commander Voss' &#125;);

// Logout (clears everything, resets to guest)
user.logout();</code
        ></pre>
    </details>
  </div>
</section>
