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
  interface ChartDataPoint {
    label: string;
    value: number;
    series?: number;
  }

  interface DonutChartProps {
    /** Data segments */
    data: ChartDataPoint[];
    /** Ring diameter in px */
    size?: number;
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
    /** Additional CSS classes */
    class?: string;
  }

  let {
    data,
    size = 200,
    thickness = 0.3,
    centerMetric,
    showLegend = true,
    title = 'Donut chart',
    id,
    class: className = '',
  }: DonutChartProps = $props();

  // svelte-ignore state_referenced_locally
  const chartId = id ?? `donut-chart-${Math.random().toString(36).slice(2, 9)}`;

  const center = $derived(size / 2);
  const radius = $derived(center * 0.8);
  const strokeWidth = $derived(radius * thickness);
  const circumference = $derived(2 * Math.PI * radius);

  const total = $derived(data.reduce((sum, d) => sum + d.value, 0) || 1);

  // Segment gap in degrees (as fraction of circumference)
  const gapSize = 3; // void-ignore (Donut segment gap — visual constant)

  // SVG coordinate offsets for center text positioning
  const centerValueOffset = -4; // void-ignore (SVG text baseline nudge — sub-token)
  const centerLabelOffset = 14; // void-ignore (SVG label offset below value — sub-token)
  const centerFontScale = 0.12; // void-ignore (Proportional font size for SVG viewBox)

  const accessibleSummary = $derived.by(() => {
    if (data.length === 0) return 'Empty donut chart';
    const largest = data.reduce((a, b) => (b.value > a.value ? b : a));
    const pct = Math.round((largest.value / total) * 100);
    return `Donut chart with ${data.length} segments. Largest is ${largest.label} at ${pct}%.`;
  });

  const segments = $derived.by(() => {
    let offset = 0;
    const totalGap = gapSize * data.length;
    const availableCircumference = circumference - totalGap;

    return data.map((point, i) => {
      const fraction = point.value / total;
      const rawDashLength = fraction * availableCircumference;
      const dashLength = Math.max(rawDashLength, gapSize); // minimum visible arc floor
      const dashGap = circumference - dashLength;
      const rotation = offset - circumference / 4; // start at top (12 o'clock)

      offset += dashLength + gapSize;

      return {
        ...point,
        series: point.series ?? i % 6,
        dashArray: `${dashLength} ${dashGap}`,
        dashOffset: -rotation,
        percentage: Math.round(fraction * 100),
      };
    });
  });
</script>

<div class="chart-donut relative {className}">
  <div class="flex flex-col items-center gap-md">
    <svg
      class="block"
      viewBox="0 0 {size} {size}"
      width={size}
      height={size}
      style="--donut-stroke: {strokeWidth}"
      role="img"
      aria-labelledby="{chartId}-title {chartId}-desc"
    >
      <title id="{chartId}-title">{title}</title>
      <desc id="{chartId}-desc">{accessibleSummary}</desc>
      {#if data.length > 0}
        <!-- Background track -->
        <circle
          class="chart-donut-track"
          cx={center}
          cy={center}
          r={radius}
          stroke-width={strokeWidth}
        />

        <!-- Segments -->
        {#each segments as seg}
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
          />
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
            y={center + centerValueOffset}
            text-anchor="middle"
            dominant-baseline="middle"
            font-size={size * centerFontScale}
          >
            {centerMetric.value}
          </text>
          <text
            class="chart-donut-label"
            x={center}
            y={center + centerLabelOffset}
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {centerMetric.label}
          </text>
        </g>
      {/if}
    </svg>

    <!-- Legend -->
    {#if showLegend && data.length > 0}
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
  </div>
</div>
