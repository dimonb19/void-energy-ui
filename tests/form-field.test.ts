import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import FormFieldFixture from './fixtures/form-field-fixture.svelte';

describe('FormField accessibility wiring', () => {
  it('references only the rendered error node when hint and error coexist', () => {
    render(FormFieldFixture, {
      hint: 'Helpful guidance',
      error: 'Email is required',
    });

    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain('-error');
    expect(describedBy).not.toContain('-hint');
    expect(screen.queryByText('Helpful guidance')).toBeNull();

    const errorNode = document.getElementById(describedBy!);
    expect(errorNode?.textContent).toContain('Email is required');
  });

  it('references the hint node when no error is present', () => {
    render(FormFieldFixture, {
      hint: 'Helpful guidance',
    });

    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain('-hint');
    expect(screen.getByText('Helpful guidance')).toBeTruthy();

    const hintNode = document.getElementById(describedBy!);
    expect(hintNode?.textContent).toContain('Helpful guidance');
  });
});
