import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import Toast from '@components/Toast.svelte';
import { toast } from '@stores/toast.svelte';

describe('Toast accessibility', () => {
  it('keeps a single status region and pauses action toasts on keyboard focus', async () => {
    const pauseSpy = vi.spyOn(toast, 'pause');
    const resumeSpy = vi.spyOn(toast, 'resume');

    render(Toast);

    const id = toast.show('Saved changes', 'success', 4000, {
      label: 'Undo',
      onclick: vi.fn(),
    });

    const actionLabel = await screen.findByText('Undo');
    const action = actionLabel.closest('button');
    const statusNodes = document.querySelectorAll('[role="status"]');

    expect(action).toBeTruthy();
    expect(statusNodes).toHaveLength(1);

    await fireEvent.focusIn(action!);
    await fireEvent.focusOut(action!);

    expect(pauseSpy).toHaveBeenCalledWith(id);
    expect(resumeSpy).toHaveBeenCalledWith(id);
  });
});
