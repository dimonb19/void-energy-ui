/* User hydration store. Synchronous localStorage read on construction. */

import { STORAGE_KEYS } from '@config/constants';

class UserStore {
  // ── Reactive State ─────────────────────────────────────────────────
  current = $state<VoidUser | null>(null);
  developerMode = $state<boolean>(false);
  loading = $state<boolean>(false);

  // ── Derived Role Flags ─────────────────────────────────────────────
  isAuthenticated = $derived(this.current !== null);
  isAdmin = $derived(this.current?.role_name === 'Admin');
  isCreator = $derived(this.current?.role_name === 'Creator');
  isPlayer = $derived(
    this.current?.role_name === 'Creator' ||
      this.current?.role_name === 'Player',
  );
  isGuest = $derived(!this.current || this.current.role_name === 'Guest');
  approvedTester = $derived(this.current?.approved_tester ?? false);

  // ── Constructor: Synchronous Hydration ─────────────────────────────
  constructor() {
    if (typeof window !== 'undefined') {
      this.hydrate();
    }
  }

  // ── Public Methods ─────────────────────────────────────────────────

  /**
   * Sets the active user after login. Persists to localStorage.
   */
  login(userData: VoidUser) {
    this.current = userData;
    this.persist();
    this.syncAuthDOM();
  }

  /**
   * Clears user state and localStorage.
   * Resets all derived flags to guest state.
   */
  logout() {
    this.current = null;
    this.developerMode = false;
    this.clearStorage();
    this.syncAuthDOM();
  }

  /**
   * Partial update for user fields (e.g., profile edits).
   */
  update(partial: Partial<VoidUser>) {
    if (!this.current) return;
    this.current = { ...this.current, ...partial };
    this.persist();
  }

  /**
   * Two-phase hydration: async verify/refresh from an API.
   * Accepts any fetcher — the store stays decoupled from API clients.
   *
   * @example
   * // In Navigation.svelte (runs on every page)
   * user.refresh(() => Account.getUser());
   */
  async refresh(fetcher: () => Promise<VoidUser | null>) {
    this.loading = true;
    try {
      const freshUser = await fetcher();
      if (freshUser) {
        this.current = freshUser;
        this.persist();
      } else {
        this.logout();
      }
    } finally {
      this.loading = false;
    }
  }

  /**
   * Toggle developer mode (local preference, not a server role).
   */
  toggleDeveloperMode() {
    this.developerMode = !this.developerMode;
  }

  // ── Private Methods ────────────────────────────────────────────────

  private syncAuthDOM() {
    if (typeof document === 'undefined') return;
    if (this.current) {
      document.documentElement.setAttribute('data-auth', '');
    } else {
      document.documentElement.removeAttribute('data-auth');
    }
  }

  private hydrate() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        this.current = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Void: Corrupt user cache — resetting', e);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    // Sync DOM (confirms what UserScript already painted).
    this.syncAuthDOM();
  }

  private persist() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.current));
    } catch {
      // Storage full or unavailable
    }
  }

  private clearStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {
      // Storage unavailable
    }
  }
}

export const user = new UserStore();
