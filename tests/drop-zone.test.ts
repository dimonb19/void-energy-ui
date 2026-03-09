import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';

import DropZone from '@components/ui/DropZone.svelte';

function createDragEvent(
  type: string,
  {
    types = ['Files'],
    files = [],
    relatedTarget,
  }: {
    types?: string[];
    files?: File[];
    relatedTarget?: EventTarget | null;
  } = {},
) {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as DragEvent;

  Object.defineProperty(event, 'dataTransfer', {
    value: {
      types,
      files,
      dropEffect: 'none',
    },
    configurable: true,
  });

  Object.defineProperty(event, 'relatedTarget', {
    value: relatedTarget ?? null,
    configurable: true,
  });

  return event;
}

describe('DropZone', () => {
  it('ignores non-file drags', async () => {
    render(DropZone);

    const zone = screen.getByRole('button');
    zone.dispatchEvent(
      createDragEvent('dragenter', {
        types: ['text/plain'],
      }),
    );
    await tick();

    expect(zone.getAttribute('data-state')).toBeNull();
  });

  it('keeps the active state when dragleave moves to a nested element', async () => {
    render(DropZone);

    const zone = screen.getByRole('button');
    const child = zone.querySelector('.dropzone-content');

    zone.dispatchEvent(createDragEvent('dragenter'));
    await tick();
    expect(zone.getAttribute('data-state')).toBe('active');

    zone.dispatchEvent(
      createDragEvent('dragleave', {
        relatedTarget: child,
      }),
    );
    await tick();

    expect(zone.getAttribute('data-state')).toBe('active');
  });

  it('processes file drops and clears the active state', async () => {
    const onfiles = vi.fn();
    const file = new File(['alpha'], 'alpha.txt', { type: 'text/plain' });

    render(DropZone, {
      onfiles,
    });

    const zone = screen.getByRole('button');
    zone.dispatchEvent(createDragEvent('dragenter'));
    await tick();

    expect(zone.getAttribute('data-state')).toBe('active');

    zone.dispatchEvent(
      createDragEvent('drop', {
        files: [file],
      }),
    );
    await tick();

    expect(zone.getAttribute('data-state')).toBeNull();
    expect(onfiles).toHaveBeenCalledWith([file]);
  });
});
