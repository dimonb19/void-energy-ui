import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import PasswordField from '@components/ui/PasswordField.svelte';
import StableIdFixture from './fixtures/stable-id-fixture.svelte';

describe('stable id plumbing', () => {
  it('keeps generated ids unique across repeated icons and chart primitives', () => {
    const { container } = render(StableIdFixture);
    const ids = Array.from(container.querySelectorAll('[id]'), (element) =>
      element.getAttribute('id'),
    ).filter((value): value is string => Boolean(value));

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);

    for (const element of Array.from(
      container.querySelectorAll('[aria-labelledby]'),
    )) {
      const refs =
        element.getAttribute('aria-labelledby')?.split(/\s+/).filter(Boolean) ??
        [];

      expect(refs.length).toBeGreaterThan(0);
      for (const ref of refs) {
        expect(container.querySelector(`#${ref}`)).toBeTruthy();
      }
    }
  });

  it('toggles password visibility without duplicating the input id on the icon', async () => {
    const { container } = render(PasswordField, {
      value: 'hunter2',
      id: 'secret',
    });

    const input = container.querySelector('input');
    expect(input?.getAttribute('type')).toBe('password');
    expect(container.querySelectorAll('#secret')).toHaveLength(1);

    await fireEvent.click(
      screen.getByRole('button', { name: 'Show password' }),
    );

    expect(input?.getAttribute('type')).toBe('text');
    expect(container.querySelectorAll('#secret')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy();
  });
});
