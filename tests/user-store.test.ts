import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@config/constants';
import { user } from '@stores/user.svelte';
import ProfileBtn from '@components/ui/ProfileBtn.svelte';

const guestUser: VoidUser = {
  id: 'guest-001',
  name: 'Guest User',
  email: 'guest@void.energy',
  avatar: null,
  role_name: 'Guest',
  approved_tester: false,
};

const adminUser: VoidUser = {
  id: 'admin-001',
  name: 'Admin User',
  email: 'admin@void.energy',
  avatar: null,
  role_name: 'Admin',
  approved_tester: true,
};

async function loadFreshUserStore() {
  vi.resetModules();
  return await import('@stores/user.svelte');
}

describe('user store hydration', () => {
  it('fails closed when localStorage reads throw during startup', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    const { user } = await loadFreshUserStore();

    expect(user.current).toBeNull();
    expect(user.isAuthenticated).toBe(false);
  });

  it('hydrates Guest users as authenticated with data-auth', async () => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(guestUser));

    const { user } = await loadFreshUserStore();

    expect(user.current).toMatchObject({ role_name: 'Guest' });
    expect(user.isAuthenticated).toBe(true);
    expect(user.isGuest).toBe(true);
    expect(document.documentElement.hasAttribute('data-auth')).toBe(true);
  });

  it('sets data-auth for all authenticated users including Guest', async () => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(adminUser));

    const { user } = await loadFreshUserStore();

    expect(document.documentElement.hasAttribute('data-auth')).toBe(true);

    user.logout();
    expect(document.documentElement.hasAttribute('data-auth')).toBe(false);

    user.login(guestUser);
    expect(user.isAuthenticated).toBe(true);
    expect(document.documentElement.hasAttribute('data-auth')).toBe(true);

    user.login(adminUser);
    expect(document.documentElement.hasAttribute('data-auth')).toBe(true);
  });

  it('isGuest is false when no user is logged in', async () => {
    const { user } = await loadFreshUserStore();

    expect(user.current).toBeNull();
    expect(user.isGuest).toBe(false);
    expect(user.isAuthenticated).toBe(false);
  });
});

describe('user profile rendering', () => {
  it('shows authenticated profile badge for Guest users', () => {
    user.logout();
    user.login(guestUser);

    const { container } = render(ProfileBtn);

    expect(user.isGuest).toBe(true);
    expect(document.documentElement.hasAttribute('data-auth')).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Profile: Guest User (Guest)' }),
    ).toBeTruthy();
    expect(container.querySelector('.auth-only')).toBeTruthy();
  });

  it('shows guest silhouette for unauthenticated users', () => {
    user.logout();

    const { container } = render(ProfileBtn);

    expect(document.documentElement.hasAttribute('data-auth')).toBe(false);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
    expect(container.querySelector('.public-only')).toBeTruthy();
  });
});
