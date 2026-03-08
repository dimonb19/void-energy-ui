import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/svelte';

import Toggle from '@components/ui/Toggle.svelte';
import PasswordField from '@components/ui/PasswordField.svelte';
import GenerateField from '@components/ui/GenerateField.svelte';
import GenerateTextarea from '@components/ui/GenerateTextarea.svelte';

describe('native form interop', () => {
  it('serializes checked toggle values into FormData', () => {
    const form = document.createElement('form');
    document.body.append(form);

    render(Toggle, {
      target: form,
      props: {
        name: 'agree',
        value: 'yes',
        checked: true,
      },
    });

    const formData = new FormData(form);

    expect(formData.get('agree')).toBe('yes');
  });

  it('serializes password field values into FormData', () => {
    const form = document.createElement('form');
    document.body.append(form);

    render(PasswordField, {
      target: form,
      props: {
        name: 'password',
        value: 's3cr3t',
      },
    });

    const formData = new FormData(form);

    expect(formData.get('password')).toBe('s3cr3t');
  });

  it('forwards native attributes to the generate field input', () => {
    const { container } = render(GenerateField, {
      value: 'Existing title',
      name: 'title',
      form: 'editor-form',
      required: true,
      ongenerate: vi.fn().mockResolvedValue('Generated title'),
    });

    const input = container.querySelector('input');

    expect(input?.getAttribute('name')).toBe('title');
    expect(input?.getAttribute('form')).toBe('editor-form');
    expect(input?.hasAttribute('required')).toBe(true);
  });

  it('forwards native attributes to the generate textarea', () => {
    const { container } = render(GenerateTextarea, {
      value: 'Existing bio',
      name: 'bio',
      form: 'profile-form',
      required: true,
      ongenerate: vi.fn().mockResolvedValue('Generated bio'),
    });

    const textarea = container.querySelector('textarea');

    expect(textarea?.getAttribute('name')).toBe('bio');
    expect(textarea?.getAttribute('form')).toBe('profile-form');
    expect(textarea?.hasAttribute('required')).toBe(true);
  });
});
