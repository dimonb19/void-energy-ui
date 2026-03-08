import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';

import Sidebar from '@components/ui/Sidebar.svelte';

function setMatchMedia({
  largeDesktop = false,
  reducedMotion = false,
}: {
  largeDesktop?: boolean;
  reducedMotion?: boolean;
} = {}) {
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        query === '(min-width: 1440px)'
          ? largeDesktop
          : query === '(prefers-reduced-motion: reduce)'
            ? reducedMotion
            : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    configurable: true,
    writable: true,
  });
}

describe('Sidebar', () => {
  it('uses instant scrolling when reduced motion is enabled', async () => {
    setMatchMedia({ largeDesktop: true, reducedMotion: true });

    const target = document.createElement('section');
    target.id = 'intro';
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    render(Sidebar, {
      sections: [{ items: [{ id: 'intro', label: 'Intro' }] }],
      trackScroll: false,
    });

    await fireEvent.click(screen.getByRole('link', { name: 'Intro' }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    });

    window.dispatchEvent(new Event('scrollend'));
  });

  it('marks the closed overlay sidebar inert and aria-hidden below desktop', async () => {
    setMatchMedia({ largeDesktop: false });

    const { container } = render(Sidebar, {
      sections: [{ items: [{ id: 'intro', label: 'Intro' }] }],
      open: false,
      trackScroll: false,
    });

    const nav = container.querySelector<HTMLElement>('#page-sidebar-nav');
    if (!nav) throw new Error('Expected sidebar nav to render');

    await waitFor(() => {
      expect(nav.getAttribute('aria-hidden')).toBe('true');
      expect(nav.hasAttribute('inert')).toBe(true);
    });
  });

  it('keeps the desktop sidebar interactive even when open is false', async () => {
    setMatchMedia({ largeDesktop: true });

    render(Sidebar, {
      sections: [{ items: [{ id: 'intro', label: 'Intro' }] }],
      open: false,
      trackScroll: false,
    });

    const nav = screen.getByRole('navigation', { name: 'Page sections' });

    await waitFor(() => {
      expect(nav.getAttribute('aria-hidden')).toBeNull();
      expect(nav.hasAttribute('inert')).toBe(false);
    });
  });
});
