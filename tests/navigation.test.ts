import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';

import Navigation from '@components/Navigation.svelte';

describe('Navigation', () => {
  it('marks only the active navigation links as the current page', () => {
    const { container } = render(Navigation, {
      pathname: '/components',
    });

    const currentLinks = [
      ...container.querySelectorAll<HTMLAnchorElement>(
        'a[aria-current="page"]',
      ),
    ];

    expect(currentLinks).toHaveLength(2);
    expect(
      currentLinks.every((link) => link.getAttribute('href') === '/components'),
    ).toBe(true);
    expect(
      container.querySelectorAll('a[href="/conexus"][aria-current="page"]'),
    ).toHaveLength(0);
    expect(
      container.querySelectorAll('a[href="/"][aria-current="page"]'),
    ).toHaveLength(0);
  });
});
