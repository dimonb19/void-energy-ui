import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';

import ColorField from '@components/ui/ColorField.svelte';

describe('ColorField', () => {
  it('forwards native and accessibility attributes to the input', () => {
    const { container } = render(ColorField, {
      value: '#123456',
      id: 'brand-color',
      name: 'brandColor',
      form: 'theme-form',
      required: true,
      disabled: true,
      invalid: true,
      describedby: 'brand-color-hint',
    });

    const input = container.querySelector<HTMLInputElement>(
      'input[type="color"]',
    );

    expect(input?.id).toBe('brand-color');
    expect(input?.getAttribute('name')).toBe('brandColor');
    expect(input?.getAttribute('form')).toBe('theme-form');
    expect(input?.hasAttribute('required')).toBe(true);
    expect(input?.disabled).toBe(true);
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-describedby')).toBe('brand-color-hint');
  });

  it('updates the input value and calls onchange on user input', async () => {
    const onchange = vi.fn();
    const { container } = render(ColorField, {
      value: '#123456',
      onchange,
    });

    const input = container.querySelector<HTMLInputElement>(
      'input[type="color"]',
    );
    expect(input).toBeTruthy();

    await fireEvent.input(input!, {
      target: { value: '#abcdef' },
    });

    expect(input?.value).toBe('#abcdef');
    expect(onchange).toHaveBeenCalledOnce();
    expect(onchange).toHaveBeenCalledWith('#abcdef');
  });

  it('activates the native input when the visible label is clicked', async () => {
    const { container } = render(ColorField, {
      value: '#123456',
    });

    const input = container.querySelector<HTMLInputElement>(
      'input[type="color"]',
    );
    const label = container.querySelector<HTMLLabelElement>(
      'label.color-field-display',
    );

    expect(input).toBeTruthy();
    expect(label).toBeTruthy();

    const clickSpy = vi.fn();
    input?.addEventListener('click', clickSpy);

    await fireEvent.click(label!);

    expect(clickSpy).toHaveBeenCalled();
  });
});
