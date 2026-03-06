/* User hydration store. Synchronous localStorage read on construction. */

import { STORAGE_KEYS } from '@config/constants';
import {
  formatBoundaryError,
  parseIncomingUser,
  parseStoredUser,
  type BoundaryError,
} from '@lib/boundary';
import { ok, err, type Result } from '@lib/result';

type UserRefreshFetcher = () => Promise<Result<VoidUser | null, BoundaryError>>;

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
  login(userData: VoidUser): Result<VoidUser, BoundaryError> {
    const parsed = parseIncomingUser(userData, 'UserStore.login');
    if (!parsed.ok) {
      console.error(formatBoundaryError(parsed.error));
      return parsed;
    }

    this.current = parsed.data;
    this.persist();
    this.syncAuthDOM();
    return parsed;
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
  update(partial: Partial<VoidUser>): Result<VoidUser, BoundaryError> {
    if (!this.current) {
      return err({
        code: 'invalid_shape',
        source: 'UserStore.update',
        message: 'Cannot update: no user is logged in.',
      });
    }

    const parsed = parseIncomingUser(
      { ...this.current, ...partial },
      'UserStore.update',
    );
    if (!parsed.ok) {
      console.error(formatBoundaryError(parsed.error));
      return parsed;
    }

    this.current = parsed.data;
    this.persist();
    return parsed;
  }

  /**
   * Two-phase hydration: async verify/refresh from an API.
   * Accepts any fetcher — the store stays decoupled from API clients.
   *
   * @example
   * // In Navigation.svelte (runs on every page)
   * user.refresh(() => Account.getUserResult());
   */
  async refresh(
    fetcher: UserRefreshFetcher,
  ): Promise<Result<VoidUser | null, BoundaryError>> {
    this.loading = true;
    try {
      const result = await fetcher();
      if (!result.ok) {
        console.error(formatBoundaryError(result.error));
        return result;
      }

      const freshUser = result.data;
      if (freshUser) {
        const parsedUser = parseIncomingUser(freshUser, 'UserStore.refresh');
        if (!parsedUser.ok) {
          console.error(formatBoundaryError(parsedUser.error));
          this.logout();
          return parsedUser;
        }

        this.current = parsedUser.data;
        this.persist();
      } else {
        this.logout();
      }
      return ok(freshUser);
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
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      const parsed = parseStoredUser(stored, 'UserStore.hydrate');
      if (parsed.ok) {
        this.current = parsed.data;
      } else {
        console.error(formatBoundaryError(parsed.error));
        try {
          localStorage.removeItem(STORAGE_KEYS.USER);
        } catch {
          // Storage unavailable
        }
      }
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
