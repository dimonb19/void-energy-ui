import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import BarChart from '@components/ui/BarChart.svelte';
import LineChart from '@components/ui/LineChart.svelte';

describe('chart data validation', () => {
  it('renders an invalid state for mismatched line series data', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(LineChart, {
      series: [
        {
          name: 'Sessions',
          data: [
            { label: 'Jan', value: 120 },
            { label: 'Feb', value: 160 },
          ],
        },
        {
          name: 'Conversions',
          data: [
            { label: 'Jan', value: 12 },
            { label: 'Mar', value: 18 },
          ],
        },
      ],
      onselect: vi.fn(),
    });

    expect(screen.getByText('Invalid chart data')).toBeTruthy();
    expect(container.querySelector('desc')?.textContent).toContain(
      'Invalid chart data',
    );
    expect(container.querySelectorAll('.chart-hit-target')).toHaveLength(0);
    expect(container.querySelector('table.sr-only')).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('renders an invalid state for grouped bar data with mismatched slots', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(BarChart, {
      groups: [
        {
          label: 'Q1',
          values: [
            { name: 'Revenue', value: 120 },
            { name: 'Profit', value: 45 },
          ],
        },
        {
          label: 'Q2',
          values: [
            { name: 'Profit', value: 50 },
            { name: 'Revenue', value: 130 },
          ],
        },
      ],
      onselect: vi.fn(),
    });

    expect(screen.getByText('Invalid chart data')).toBeTruthy();
    expect(container.querySelector('desc')?.textContent).toContain(
      'Invalid chart data',
    );
    expect(container.querySelectorAll('.chart-hit-target')).toHaveLength(0);
    expect(container.querySelector('table.sr-only')).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });
});
