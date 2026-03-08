import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@config/constants';
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

  it('hydrates Guest users without exposing authenticated DOM chrome', async () => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(guestUser));

    const { user } = await loadFreshUserStore();

    expect(user.current).toMatchObject({ role_name: 'Guest' });
    expect(user.isAuthenticated).toBe(true);
    expect(user.isGuest).toBe(true);
    expect(document.documentElement.hasAttribute('data-auth')).toBe(false);
  });

  it('sets data-auth only for non-Guest users during hydrate and runtime sync', async () => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(adminUser));

    const { user } = await loadFreshUserStore();

    expect(document.documentElement.hasAttribute('data-auth')).toBe(true);

    user.logout();
    expect(document.documentElement.hasAttribute('data-auth')).toBe(false);

    user.login(guestUser);
    expect(user.isAuthenticated).toBe(true);
    expect(document.documentElement.hasAttribute('data-auth')).toBe(false);

    user.login(adminUser);
    expect(document.documentElement.hasAttribute('data-auth')).toBe(true);
  });

  it('keeps the guest profile affordance available for hydrated Guest users', async () => {
    const { user } = await import('@stores/user.svelte');

    user.logout();
    user.login(guestUser);

    const { container } = render(ProfileBtn);

    expect(document.documentElement.hasAttribute('data-auth')).toBe(false);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
    expect(container.querySelector('.guest-only')).toBeTruthy();
  });
});
