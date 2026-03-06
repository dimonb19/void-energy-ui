import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import CopyField from '@components/ui/CopyField.svelte';
import { toast } from '@stores/toast.svelte';

describe('CopyField', () => {
  it('falls back to execCommand copy when the clipboard API rejects', async () => {
    const toastSpy = vi.spyOn(toast, 'show');
    const clipboardSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('blocked'));
    const execCommandSpy = vi
      .spyOn(document, 'execCommand')
      .mockReturnValue(true);

    render(CopyField, { value: 'sk-demo-123' });

    const input = screen.getByDisplayValue('sk-demo-123') as HTMLInputElement;
    const button = screen.getByRole('button', { name: 'Copy to clipboard' });

    await fireEvent.click(button);

    await waitFor(() => {
      expect(clipboardSpy).toHaveBeenCalledWith('sk-demo-123');
    });

    expect(document.activeElement).toBe(input);
    expect(execCommandSpy).toHaveBeenCalledWith('copy');
    expect(toastSpy).toHaveBeenCalledWith('Copied to clipboard', 'success');
  });
});
