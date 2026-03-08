import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';

import { layerStack } from '@lib/layer-stack.svelte';
import { toast } from '@stores/toast.svelte';
import GenerateField from '@components/ui/GenerateField.svelte';
import GenerateTextarea from '@components/ui/GenerateTextarea.svelte';

describe('GenerateField', () => {
  it('applies empty-string generation results', async () => {
    const { container } = render(GenerateField, {
      value: 'Existing title',
      ongenerate: vi.fn().mockResolvedValue(''),
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => {
      const input = container.querySelector('input');
      expect(input?.value).toBe('');
    });
  });

  it('aborts on Escape without dismissing the top layer', async () => {
    let aborted = false;
    const ongenerate = vi.fn(({ signal }: { signal: AbortSignal }) => {
      return new Promise<string>((_, reject) => {
        signal.addEventListener(
          'abort',
          () => {
            aborted = true;
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    });

    render(GenerateField, {
      value: 'Existing title',
      ongenerate,
    });

    const dismiss = vi.fn();
    layerStack.push(dismiss);

    await fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    const dispatchResult = await fireEvent.keyDown(document, {
      key: 'Escape',
    });

    expect(dispatchResult).toBe(false);

    await waitFor(() => expect(aborted).toBe(true));
    expect(dismiss).not.toHaveBeenCalled();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Generate' })).toBeTruthy(),
    );

    await fireEvent.keyDown(document, { key: 'Escape' });

    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it('aborts in-flight generation on unmount without showing an error toast', async () => {
    let aborted = false;
    const ongenerate = vi.fn(({ signal }: { signal: AbortSignal }) => {
      return new Promise<string>((_, reject) => {
        signal.addEventListener(
          'abort',
          () => {
            aborted = true;
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    });

    const { unmount } = render(GenerateField, {
      value: 'Existing title',
      ongenerate,
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    unmount();

    await waitFor(() => expect(aborted).toBe(true));
    await Promise.resolve();

    expect(toast.items).toHaveLength(0);
  });
});

describe('GenerateTextarea', () => {
  it('applies empty-string generation results', async () => {
    const { container } = render(GenerateTextarea, {
      value: 'Existing bio',
      rows: 4,
      ongenerate: vi.fn().mockResolvedValue(''),
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => {
      const textarea = container.querySelector('textarea');
      expect(textarea?.value).toBe('');
    });
  });

  it('aborts on Escape without dismissing the top layer', async () => {
    let aborted = false;
    const ongenerate = vi.fn(({ signal }: { signal: AbortSignal }) => {
      return new Promise<string>((_, reject) => {
        signal.addEventListener(
          'abort',
          () => {
            aborted = true;
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    });

    render(GenerateTextarea, {
      value: 'Existing bio',
      rows: 4,
      ongenerate,
    });

    const dismiss = vi.fn();
    layerStack.push(dismiss);

    await fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    const dispatchResult = await fireEvent.keyDown(document, {
      key: 'Escape',
    });

    expect(dispatchResult).toBe(false);

    await waitFor(() => expect(aborted).toBe(true));
    expect(dismiss).not.toHaveBeenCalled();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Generate' })).toBeTruthy(),
    );

    await fireEvent.keyDown(document, { key: 'Escape' });

    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it('aborts in-flight generation on unmount without showing an error toast', async () => {
    let aborted = false;
    const ongenerate = vi.fn(({ signal }: { signal: AbortSignal }) => {
      return new Promise<string>((_, reject) => {
        signal.addEventListener(
          'abort',
          () => {
            aborted = true;
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    });

    const { unmount } = render(GenerateTextarea, {
      value: 'Existing bio',
      rows: 4,
      ongenerate,
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    unmount();

    await waitFor(() => expect(aborted).toBe(true));
    await Promise.resolve();

    expect(toast.items).toHaveLength(0);
  });
});
