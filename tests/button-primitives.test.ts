import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import ActionBtn from '@components/ui/ActionBtn.svelte';
import IconBtn from '@components/ui/IconBtn.svelte';
import Sparkle from '@components/icons/Sparkle.svelte';
import Refresh from '@components/icons/Refresh.svelte';

describe('button primitives', () => {
  it('does not animate ActionBtn icons while disabled', async () => {
    render(ActionBtn, {
      icon: Sparkle,
      text: 'Generate',
      disabled: true,
    });

    const button = screen.getByRole('button', { name: 'Generate' });
    const icon = document.querySelector('.icon-sparkle');

    await fireEvent.pointerEnter(button);

    expect(icon?.getAttribute('data-state')).toBe('');
  });

  it('still animates ActionBtn icons on hover when enabled', async () => {
    render(ActionBtn, {
      icon: Sparkle,
      text: 'Generate',
    });

    const button = screen.getByRole('button', { name: 'Generate' });
    const icon = document.querySelector('.icon-sparkle');

    await fireEvent.pointerEnter(button);

    expect(icon?.getAttribute('data-state')).toBe('active');
  });

  it('does not animate IconBtn icons while disabled', async () => {
    render(IconBtn, {
      icon: Refresh,
      disabled: true,
      'aria-label': 'Refresh',
    });

    const button = screen.getByRole('button', { name: 'Refresh' });
    const icon = document.querySelector('.icon-refresh');

    await fireEvent.pointerEnter(button);

    expect(icon?.getAttribute('data-state')).toBe('');
  });
});
