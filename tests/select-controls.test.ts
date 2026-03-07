import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import Selector from '@components/ui/Selector.svelte';
import Switcher from '@components/ui/Switcher.svelte';

describe('typed select controls', () => {
  it('returns null for explicit null selector options', async () => {
    const onchange = vi.fn();
    const { container } = render(Selector, {
      label: 'Heading Font',
      options: [
        { value: null, label: 'System Default' },
        { value: 'Inter', label: 'Inter' },
      ],
      value: 'Inter',
      placeholder: 'Choose a font',
      onchange,
    });

    const select = container.querySelector('select');
    expect(select).toBeTruthy();

    select!.selectedIndex = 1;
    await fireEvent.change(select!);

    expect(onchange).toHaveBeenLastCalledWith(null);
  });

  it('returns numeric selector values without string coercion', async () => {
    const onchange = vi.fn();
    const { container } = render(Selector, {
      label: 'Scale',
      options: [
        { value: 0.85, label: 'Small' },
        { value: 1, label: 'Standard' },
      ],
      value: 1,
      onchange,
    });

    const select = container.querySelector('select');
    expect(select).toBeTruthy();

    select!.selectedIndex = 0;
    await fireEvent.change(select!);

    expect(onchange).toHaveBeenLastCalledWith(0.85);
  });

  it('returns numeric switcher values without string coercion', async () => {
    const onchange = vi.fn();

    render(Switcher, {
      label: 'Density',
      options: [
        { value: 1, label: 'Standard' },
        { value: 2, label: 'Max' },
      ],
      value: 1,
      onchange,
    });

    await fireEvent.click(screen.getByLabelText('Max'));

    expect(onchange).toHaveBeenLastCalledWith(2);
  });
});
