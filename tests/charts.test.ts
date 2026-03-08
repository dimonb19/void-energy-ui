import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import BarChart from '@components/ui/BarChart.svelte';
import DonutChart from '@components/ui/DonutChart.svelte';
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

  it('keeps donut segment geometry within one circumference budget for dense datasets', () => {
    const data = Array.from({ length: 300 }, (_, index) => ({
      label: `Segment ${index + 1}`,
      value: 1,
    }));

    const { container } = render(DonutChart, {
      data,
      showLegend: false,
      animated: false,
    });

    const segments = Array.from(
      container.querySelectorAll<SVGCircleElement>('.chart-donut-segment'),
    );

    expect(segments).toHaveLength(data.length);

    const dashLengths = segments.map((segment) => {
      const dashArray = segment.getAttribute('stroke-dasharray');
      const dashLength = Number.parseFloat(dashArray?.split(' ')[0] ?? 'NaN');

      expect(Number.isFinite(dashLength)).toBe(true);
      expect(dashLength).toBeGreaterThanOrEqual(0);

      return dashLength;
    });

    const size = 200;
    const radius = (size / 2) * 0.8;
    const circumference = 2 * Math.PI * radius;
    const totalAllocatedLength = dashLengths.reduce(
      (sum, dashLength) => sum + dashLength,
      0,
    );

    expect(totalAllocatedLength).toBeLessThanOrEqual(circumference + 0.001);
  });

  it('logs an error and renders donut empty state for negative values', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(DonutChart, {
      data: [
        { label: 'Organic', value: 42 },
        { label: 'Refunds', value: -5 },
      ],
      onselect: vi.fn(),
    });

    expect(screen.getByText('No data')).toBeTruthy();
    expect(container.querySelectorAll('.chart-donut-segment')).toHaveLength(0);
    expect(container.querySelector('table.sr-only')).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('logs an error and renders line-chart empty state for negative single-series data', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(LineChart, {
      data: [
        {
          label: 'Jan',
          value: 120,
        },
        {
          label: 'Feb',
          value: -4,
        },
      ],
      onselect: vi.fn(),
    });

    expect(screen.getByText('No data')).toBeTruthy();
    expect(screen.queryByText('Invalid chart data')).toBeNull();
    expect(container.querySelectorAll('.chart-hit-target')).toHaveLength(0);
    expect(container.querySelector('table.sr-only')).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('logs an error and renders line-chart empty state for negative multi-series data', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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
            { label: 'Feb', value: -4 },
          ],
        },
      ],
      onselect: vi.fn(),
    });

    expect(screen.getByText('No data')).toBeTruthy();
    expect(screen.queryByText('Invalid chart data')).toBeNull();
    expect(container.querySelectorAll('.chart-hit-target')).toHaveLength(0);
    expect(container.querySelector('table.sr-only')).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('logs an error and renders bar-chart empty state for negative grouped data', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(BarChart, {
      groups: [
        {
          label: 'Q1',
          values: [
            { name: 'Revenue', value: 120 },
            { name: 'Profit', value: -12 },
          ],
        },
      ],
      onselect: vi.fn(),
    });

    expect(screen.getByText('No data')).toBeTruthy();
    expect(screen.queryByText('Invalid chart data')).toBeNull();
    expect(container.querySelectorAll('.chart-hit-target')).toHaveLength(0);
    expect(container.querySelector('table.sr-only')).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('logs an error and renders bar-chart empty state for negative horizontal data', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(BarChart, {
      data: [
        { label: 'Q1', value: 120 },
        { label: 'Q2', value: -12 },
      ],
      orientation: 'horizontal',
      onselect: vi.fn(),
    });

    expect(screen.getByText('No data')).toBeTruthy();
    expect(screen.queryByText('Invalid chart data')).toBeNull();
    expect(container.querySelectorAll('.chart-hit-target')).toHaveLength(0);
    expect(container.querySelector('table.sr-only')).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });
});
