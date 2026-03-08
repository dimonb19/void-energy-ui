<!--
  DONUT CHART COMPONENT
  Ring/donut chart with center metric label and optional legend.
  Uses stroke-dasharray technique for arc segments.

  USAGE
  ─────────────────────────────────────────────────────────────────────────
  <DonutChart data={[
    { label: 'Organic', value: 42 },
    { label: 'Direct', value: 28 },
    { label: 'Referral', value: 18 },
    { label: 'Social', value: 12 },
  ]} centerMetric={{ label: 'Total', value: '1,250' }} />
  ─────────────────────────────────────────────────────────────────────────

  PHYSICS: Glass = glow on segments. Flat = clean strokes. Retro = no glow.
-->
<script lang="ts">
  import { tooltip } from '@actions/tooltip';

  interface ChartDataPoint {
    label: string;
    value: number;
    series?: number;
  }

  interface DonutChartProps {
    /** Data segments */
    data: ChartDataPoint[];
    /** Ring coordinate space (viewBox units) */
    size?: number;
    /** Maximum display size in CSS px */
    maxSize?: number;
    /** Ring thickness as fraction of radius (0–1) */
    thickness?: number;
    /** Center metric display */
    centerMetric?: { label: string; value: string };
    /** Show legend below chart */
    showLegend?: boolean;
    /** Accessible chart title */
    title?: string;
    /** Unique ID prefix for accessible labels */
    id?: string;
    /** Custom value formatter for legend (default: value with percentage) */
    formatValue?: (value: number) => string;
    /** Selection callback (fires on segment click or Enter/Space) */
    onselect?: (item: ChartDataPoint, index: number) => void;
    /** Whether to show entry animations */
    animated?: boolean;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    data,
    size = 200,
    maxSize,
    thickness = 0.3,
    centerMetric,
    showLegend = true,
    formatValue,
    onselect,
    animated = true,
    title = 'Donut chart',
    id,
    class: className = '',
  }: DonutChartProps = $props();

  const componentId = $props.id();
  const generatedChartId = `donut-chart-${componentId}`;
  const chartId = $derived(id ?? generatedChartId);

  const negativeValueReason = $derived.by(() => {
    const point = data.find((entry) => entry.value < 0);
    return point
      ? `Segment "${point.label}" has unsupported value ${point.value}.`
      : null;
  });

  const normalizedData = $derived(negativeValueReason ? [] : data);

  const center = $derived(size / 2);
  const radius = $derived(center * 0.8);
  const strokeWidth = $derived(radius * thickness);
  const circumference = $derived(2 * Math.PI * radius);

  const total = $derived(
    normalizedData.reduce((sum, point) => sum + point.value, 0) || 1,
  );

  // Segment gap in degrees (as fraction of circumference)
  const gapSize = 3; // void-ignore (Donut segment gap — visual constant)
  const maxGapShare = 0.5; // void-ignore (Keep at least half the circumference for visible arcs)

  // SVG coordinate offsets for center text positioning
  const centerValueOffset = -4; // void-ignore (SVG text baseline nudge — sub-token)
  const centerLabelOffset = 14; // void-ignore (SVG label offset below value — sub-token)
  const centerFontScale = 0.12; // void-ignore (Proportional font size for SVG viewBox)

  function defaultFormatValue(v: number): string {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return v.toString();
  }

  const fmt = $derived(formatValue ?? defaultFormatValue);

  const accessibleSummary = $derived.by(() => {
    if (normalizedData.length === 0) return 'Empty donut chart';
    const largest = normalizedData.reduce((a, b) =>
      b.value > a.value ? b : a,
    );
    const pct = Math.round((largest.value / total) * 100);
    return `Donut chart with ${normalizedData.length} segments. Largest is ${largest.label} at ${pct}%.`;
  });

  const segments = $derived.by(() => {
    let offset = 0;
    const effectiveGap =
      normalizedData.length > 0
        ? Math.min(
            gapSize,
            (circumference * maxGapShare) / normalizedData.length,
          )
        : 0;
    const totalGap = effectiveGap * normalizedData.length;
    const availableCircumference = Math.max(circumference - totalGap, 0);

    return normalizedData.map((point, i) => {
      const fraction = point.value / total;
      const rawDashLength = fraction * availableCircumference;
      const dashLength = Math.max(rawDashLength, 0);
      const dashGap = circumference - dashLength;
      const rotation = offset - circumference / 4; // start at top (12 o'clock)

      offset += dashLength + effectiveGap;

      return {
        ...point,
        series: point.series ?? i % 6,
        dashArray: `${dashLength} ${dashGap}`,
        dashOffset: -rotation,
        percentage: Math.round(fraction * 100),
      };
    });
  });

  let lastNegativeValueError = $state<string | null>(null);

  $effect(() => {
    const reason = negativeValueReason;
    if (reason && reason !== lastNegativeValueError) {
      console.error(
        `Void: DonutChart does not support negative values. Rendering empty state. (${reason})`,
      );
      lastNegativeValueError = reason;
      return;
    }

    if (!reason) {
      lastNegativeValueError = null;
    }
  });
</script>

<div class="chart-donut relative {className}" data-animated={animated}>
  <div class="flex flex-col items-center gap-md">
    <svg
      class="block w-full h-auto"
      viewBox="0 0 {size} {size}"
      style="max-width: {maxSize ?? size}px; --donut-stroke: {strokeWidth}"
      role="img"
      aria-labelledby="{chartId}-title {chartId}-desc"
    >
      <title id="{chartId}-title">{title}</title>
      <desc id="{chartId}-desc">{accessibleSummary}</desc>
      {#if normalizedData.length > 0}
        <!-- Background track -->
        <circle
          class="chart-donut-track"
          cx={center}
          cy={center}
          r={radius}
          stroke-width={strokeWidth}
        />

        <!-- Segments -->
        {#each segments as seg, i}
          {#if onselect}
            <circle
              class="chart-donut-segment"
              cx={center}
              cy={center}
              r={radius}
              stroke-width={strokeWidth}
              stroke-dasharray={seg.dashArray}
              stroke-dashoffset={seg.dashOffset}
              data-series={seg.series}
              stroke-linecap="butt"
              role="button"
              tabindex="0"
              aria-label="{seg.label}: {fmt(seg.value)} ({seg.percentage}%)"
              onclick={() => onselect(normalizedData[i], i)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onselect(normalizedData[i], i);
                }
              }}
              use:tooltip={{
                content: `${seg.label}: ${fmt(seg.value)} (${seg.percentage}%)`,
              }}
            />
          {:else}
            <circle
              class="chart-donut-segment"
              cx={center}
              cy={center}
              r={radius}
              stroke-width={strokeWidth}
              stroke-dasharray={seg.dashArray}
              stroke-dashoffset={seg.dashOffset}
              data-series={seg.series}
              stroke-linecap="butt"
              use:tooltip={{
                content: `${seg.label}: ${fmt(seg.value)} (${seg.percentage}%)`,
              }}
            />
          {/if}
        {/each}
      {:else}
        <text
          class="chart-label"
          x={center}
          y={center}
          text-anchor="middle"
          dominant-baseline="middle">No data</text
        >
      {/if}

      <!-- Center text -->
      {#if centerMetric}
        <g class="chart-donut-center">
          <text
            class="chart-donut-value"
            x={center}
            y={center + centerValueOffset * 1.25}
            text-anchor="middle"
            dominant-baseline="middle"
            font-size={size * centerFontScale}
          >
            {centerMetric.value}
          </text>
          <text
            class="chart-donut-label"
            x={center}
            y={center + centerLabelOffset * 1.25}
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {centerMetric.label}
          </text>
        </g>
      {/if}
    </svg>

    <!-- Legend -->
    {#if showLegend && normalizedData.length > 0}
      <div class="flex flex-row flex-wrap justify-center gap-md">
        {#each segments as seg}
          <div class="flex items-center gap-xs">
            <span class="chart-legend-swatch" data-series={seg.series}></span>
            <span class="chart-legend-label"
              >{seg.label} ({seg.percentage}%)</span
            >
          </div>
        {/each}
      </div>
    {/if}

    <!-- Screen reader data table -->
    {#if normalizedData.length > 0}
      <table class="sr-only">
        <caption>{title}</caption>
        <thead><tr><th>Segment</th><th>Value</th><th>Percentage</th></tr></thead
        >
        <tbody>
          {#each segments as seg}
            <tr
              ><td>{seg.label}</td><td>{fmt(seg.value)}</td><td
                >{seg.percentage}%</td
              ></tr
            >
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
