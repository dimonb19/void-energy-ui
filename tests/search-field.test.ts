import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';

import SearchField from '@components/ui/SearchField.svelte';

describe('SearchField', () => {
  it('prevents the native Enter behavior only when onsubmit is provided', async () => {
    const onsubmit = vi.fn();
    const { container } = render(SearchField, {
      value: 'void energy',
      onsubmit,
    });

    const input = container.querySelector('input');
    expect(input).toBeTruthy();

    const dispatchResult = await fireEvent.keyDown(input!, { key: 'Enter' });

    expect(dispatchResult).toBe(false);
    expect(onsubmit).toHaveBeenCalledWith('void energy');
  });

  it('preserves native Enter behavior when onsubmit is omitted', async () => {
    const { container } = render(SearchField, {
      value: 'void energy',
    });

    const input = container.querySelector('input');
    expect(input).toBeTruthy();

    const dispatchResult = await fireEvent.keyDown(input!, { key: 'Enter' });

    expect(dispatchResult).toBe(true);
  });
});
