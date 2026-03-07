import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/svelte';

vi.mock('@actions/tooltip', () => ({
  tooltip: () => ({
    update() {},
    destroy() {},
  }),
}));

import AlertFragment from '@components/modals/AlertFragment.svelte';
import ConfirmFragment from '@components/modals/ConfirmFragment.svelte';

describe('modal body rendering', () => {
  it('renders plain body text as escaped content', () => {
    const { container } = render(AlertFragment, {
      title: 'Alert',
      body: 'Use <strong>plain text</strong> here.',
    });

    const body = container.querySelector('p');

    expect(body?.textContent).toContain('<strong>plain text</strong>');
    expect(body?.querySelector('strong')).toBeNull();
  });

  it('renders trusted html when bodyHtml is provided', () => {
    const { container } = render(AlertFragment, {
      title: 'Alert',
      bodyHtml: 'Use <strong>trusted html</strong> here.',
    });

    const body = container.querySelector('p');

    expect(body?.querySelector('strong')?.textContent).toBe('trusted html');
  });

  it('prefers bodyHtml over body when both are present at runtime', () => {
    const { container } = render(ConfirmFragment, {
      title: 'Confirm',
      body: 'Fallback <strong>text</strong>',
      bodyHtml: 'Preferred <strong>markup</strong>',
      onConfirm: vi.fn(),
    });

    const body = container.querySelector('p');

    expect(body?.innerHTML).toContain('<strong>markup</strong>');
    expect(body?.textContent).not.toContain('Fallback');
  });
});
