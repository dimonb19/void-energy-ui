import { describe, expect, it, vi } from 'vitest';
import { DOM_ATTRS, DEFAULTS, STORAGE_KEYS } from '@config/constants';
import { hydrate } from '@lib/void-boot.js';

describe('void boot hydration', () => {
  it('applies stored theme data and only safe preference fields on first paint', () => {
    localStorage.setItem(STORAGE_KEYS.ATMOSPHERE, 'nebula');
    localStorage.setItem(
      STORAGE_KEYS.USER_CONFIG,
      JSON.stringify({
        density: 'low',
        scale: 'oversized',
        fontHeading: "'Cinzel', serif",
        unknown: 'ignored',
      }),
    );
    document.head.innerHTML = '<meta name="theme-color" content="#111111">';

    const activeId = hydrate(
      {
        nebula: {
          mode: 'dark',
          physics: 'glass',
          palette: {
            'bg-canvas': '#010203',
            'text-main': '#f5f5f5',
          },
        },
      },
      STORAGE_KEYS,
      DOM_ATTRS,
      DEFAULTS,
    );

    const root = document.documentElement;
    const themeColor = document.querySelector(
      'meta[name="theme-color"]',
    ) as HTMLMetaElement | null;

    expect(activeId).toBe('nebula');
    expect(root.getAttribute(DOM_ATTRS.ATMOSPHERE)).toBe('nebula');
    expect(root.getAttribute(DOM_ATTRS.PHYSICS)).toBe('glass');
    expect(root.getAttribute(DOM_ATTRS.MODE)).toBe('dark');
    expect(root.style.getPropertyValue('--density')).toBe('1.25');
    expect(root.style.getPropertyValue('--text-scale')).toBe('');
    expect(root.style.getPropertyValue('--user-font-heading')).toBe(
      "'Cinzel', serif",
    );
    expect(root.style.getPropertyValue('--unknown')).toBe('');
    expect(themeColor?.getAttribute('content')).toBe('#010203');
  });

  it('falls back to the default triad when hydration throws', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const root = document.documentElement;
    root.setAttribute(DOM_ATTRS.ATMOSPHERE, 'broken');
    root.setAttribute(DOM_ATTRS.PHYSICS, 'retro');
    root.setAttribute(DOM_ATTRS.MODE, 'light');
    root.style.setProperty('--bg-canvas', '#ffffff');
    root.style.setProperty('--density', '9');

    const activeId = hydrate(null, STORAGE_KEYS, DOM_ATTRS, DEFAULTS);

    expect(activeId).toBe(DEFAULTS.ATMOSPHERE);
    expect(root.getAttribute(DOM_ATTRS.ATMOSPHERE)).toBe(DEFAULTS.ATMOSPHERE);
    expect(root.getAttribute(DOM_ATTRS.PHYSICS)).toBe(DEFAULTS.PHYSICS);
    expect(root.getAttribute(DOM_ATTRS.MODE)).toBe(DEFAULTS.MODE);
    expect(root.style.getPropertyValue('--bg-canvas')).toBe('');
    expect(root.style.getPropertyValue('--density')).toBe('');
    expect(localStorage.getItem(STORAGE_KEYS.ATMOSPHERE)).toBe(
      DEFAULTS.ATMOSPHERE,
    );
  });
});
