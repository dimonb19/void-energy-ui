import { describe, expect, it, vi } from 'vitest';

describe('user store hydration', () => {
  it('fails closed when localStorage reads throw during startup', async () => {
    vi.resetModules();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    const { user } = await import('@stores/user.svelte');

    expect(user.current).toBeNull();
    expect(user.isAuthenticated).toBe(false);
  });
});
