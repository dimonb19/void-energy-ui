import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import Sidebar from '@components/ui/Sidebar.svelte';

describe('Sidebar', () => {
  it('uses instant scrolling when reduced motion is enabled', async () => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
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
});
