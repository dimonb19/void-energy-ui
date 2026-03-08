import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import EditField from '@components/ui/EditField.svelte';
import EditTextarea from '@components/ui/EditTextarea.svelte';

describe('EditField', () => {
  it('ignores Enter while the field is still readonly', async () => {
    const onconfirm = vi.fn();
    const { container } = render(EditField, {
      value: 'Agent Zero',
      onconfirm,
    });

    const input = container.querySelector('input');
    expect(input).toBeTruthy();

    input?.focus();
    await fireEvent.keyDown(input!, { key: 'Enter' });

    expect(input?.value).toBe('Agent Zero');
    expect(onconfirm).not.toHaveBeenCalled();
  });

  it('commits draft changes on Enter while editing', async () => {
    const onconfirm = vi.fn();
    const { container } = render(EditField, {
      value: 'Agent Zero',
      onconfirm,
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const input = container.querySelector('input');
    expect(input).toBeTruthy();

    await fireEvent.input(input!, {
      target: { value: 'Agent Prime' },
    });
    await fireEvent.keyDown(input!, { key: 'Enter' });

    expect(input?.value).toBe('Agent Prime');
    expect(onconfirm).toHaveBeenCalledOnce();
    expect(onconfirm).toHaveBeenCalledWith('Agent Prime');
  });
});

describe('EditTextarea', () => {
  it('ignores modifier Enter while the textarea is still readonly', async () => {
    const onconfirm = vi.fn();
    const { container } = render(EditTextarea, {
      value: 'Initial briefing',
      rows: 4,
      onconfirm,
    });

    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();

    textarea?.focus();
    await fireEvent.keyDown(textarea!, {
      key: 'Enter',
      ctrlKey: true,
    });

    expect(textarea?.value).toBe('Initial briefing');
    expect(onconfirm).not.toHaveBeenCalled();
  });

  it('commits draft changes on modifier Enter while editing', async () => {
    const onconfirm = vi.fn();
    const { container } = render(EditTextarea, {
      value: 'Initial briefing',
      rows: 4,
      onconfirm,
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();

    await fireEvent.input(textarea!, {
      target: { value: 'Updated briefing' },
    });
    await fireEvent.keyDown(textarea!, {
      key: 'Enter',
      ctrlKey: true,
    });

    expect(textarea?.value).toBe('Updated briefing');
    expect(onconfirm).toHaveBeenCalledOnce();
    expect(onconfirm).toHaveBeenCalledWith('Updated briefing');
  });
});
