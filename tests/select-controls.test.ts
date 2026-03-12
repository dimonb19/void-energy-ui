import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import Selector from '@components/ui/Selector.svelte';
import Switcher from '@components/ui/Switcher.svelte';

describe('typed select controls', () => {
  it('serializes selector values with native browser strings in FormData', () => {
    const form = document.createElement('form');
    document.body.append(form);

    render(Selector, {
      target: form,
      props: {
        name: 'font',
        options: [
          { value: null, label: 'System Default' },
          { value: 'Inter', label: 'Inter' },
        ],
        value: null,
      },
    });

    const formData = new FormData(form);

    expect(formData.get('font')).toBe('null');
  });

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

  it('maps selector align variants to static Tailwind classes', () => {
    const start = render(Selector, {
      label: 'Start aligned',
      align: 'start',
      options: [{ value: 'a', label: 'A' }],
      value: 'a',
    });
    expect(start.container.firstElementChild?.className).toContain(
      'items-start',
    );

    start.unmount();

    const center = render(Selector, {
      label: 'Center aligned',
      align: 'center',
      options: [{ value: 'a', label: 'A' }],
      value: 'a',
    });
    expect(center.container.firstElementChild?.className).toContain(
      'items-center',
    );

    center.unmount();

    const end = render(Selector, {
      label: 'End aligned',
      align: 'end',
      options: [{ value: 'a', label: 'A' }],
      value: 'a',
    });
    expect(end.container.firstElementChild?.className).toContain('items-end');
  });

  it('serializes switcher values with native browser strings in FormData', () => {
    const form = document.createElement('form');
    document.body.append(form);

    render(Switcher, {
      target: form,
      props: {
        name: 'density',
        options: [
          { value: 1, label: 'Standard' },
          { value: 2, label: 'Max' },
        ],
        value: 2,
      },
    });

    const formData = new FormData(form);

    expect(formData.get('density')).toBe('2');
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

  it('disables individual switcher options via option.disabled', () => {
    render(Switcher, {
      label: 'Physics',
      options: [
        { value: null, label: 'Auto' },
        { value: 'glass', label: 'Glass', disabled: true },
        { value: 'flat', label: 'Flat' },
      ],
      value: null,
    });

    const glassInput = screen.getByLabelText('Glass') as HTMLInputElement;
    const flatInput = screen.getByLabelText('Flat') as HTMLInputElement;
    const glassLabel = glassInput.closest('label');
    const flatLabel = flatInput.closest('label');

    expect(glassInput.disabled).toBe(true);
    expect(flatInput.disabled).toBe(false);
    expect(glassLabel?.getAttribute('aria-disabled')).toBe('true');
    expect(flatLabel?.hasAttribute('aria-disabled')).toBe(false);
  });

  it('does not fire onchange when clicking a disabled switcher option', async () => {
    const onchange = vi.fn();

    render(Switcher, {
      label: 'Physics',
      options: [
        { value: null, label: 'Auto' },
        { value: 'glass', label: 'Glass', disabled: true },
        { value: 'flat', label: 'Flat' },
      ],
      value: null,
      onchange,
    });

    await fireEvent.click(screen.getByLabelText('Glass'));

    expect(onchange).not.toHaveBeenCalled();
  });

  it('marks the selected shell as aria-disabled when the whole switcher is disabled', () => {
    const { container } = render(Switcher, {
      label: 'Mode',
      options: [
        { value: null, label: 'Auto' },
        { value: 'dark', label: 'Dark' },
        { value: 'light', label: 'Light' },
      ],
      value: 'dark',
      disabled: true,
    });

    const shells = Array.from(
      container.querySelectorAll<HTMLLabelElement>('.switcher-option'),
    );
    const darkInput = screen.getByLabelText('Dark') as HTMLInputElement;
    const darkLabel = darkInput.closest('label');

    expect(shells.length).toBe(3);
    expect(shells.every((shell) => shell.getAttribute('aria-disabled') === 'true')).toBe(
      true,
    );
    expect(darkLabel?.getAttribute('data-state')).toBe('active');
  });
});
