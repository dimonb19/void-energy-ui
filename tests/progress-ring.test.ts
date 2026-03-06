import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ProgressRing from '@components/ui/ProgressRing.svelte';

describe('ProgressRing', () => {
  it('clamps over-max values and exposes the expected progress semantics', () => {
    render(ProgressRing, {
      value: 150,
      max: 100,
      showValue: true,
      label: 'Upload progress',
    });

    const progressbar = screen.getByRole('progressbar', {
      name: 'Upload progress',
    });

    expect(progressbar.getAttribute('aria-valuenow')).toBe('100');
    expect(progressbar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('100');
    expect(screen.getByText('100%')).toBeTruthy();
  });
});
