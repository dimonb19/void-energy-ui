<!--
  BAR CHART COMPONENT
  Physics-aware vertical bar chart with category labels, optional grid
  lines, and value annotations.

  USAGE
  ─────────────────────────────────────────────────────────────────────────
  <BarChart data={[
    { label: 'Q1', value: 12400 },
    { label: 'Q2', value: 18700 },
    { label: 'Q3', value: 15200 },
    { label: 'Q4', value: 22100 },
  ]} />

  <BarChart {data} showValues showGrid={false} height={300} />
  ─────────────────────────────────────────────────────────────────────────

  PHYSICS: Glass = glow on bars. Flat = clean solid. Retro = stroke-only, no glow.
  ANIMATION: Bars grow from bottom with staggered delay (uses chart-grow-bar keyframe).
-->
<script lang="ts">
  interface ChartDataPoint {
    label: string;
    value: number;
    series?: number;
  }

  interface BarChartProps {
    /** Data points (one bar per point) */
    data: ChartDataPoint[];
    /** Chart height in px */
    height?: number;
    /** Show value labels above bars */
    showValues?: boolean;
    /** Show horizontal grid lines */
    showGrid?: boolean;
    /** Accessible chart title */
    title?: string;
    /** Unique ID prefix for accessible labels */
    id?: string;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    data,
    height = 240,
    showValues = false,
    showGrid = true,
    title = 'Bar chart',
    id,
    class: className = '',
  }: BarChartProps = $props();

  // svelte-ignore state_referenced_locally
  const chartId = id ?? `bar-chart-${Math.random().toString(36).slice(2, 9)}`;

  // Layout constants (SVG viewBox coordinates — unitless, not CSS px) // void-ignore
  const paddingTop = 24;
  const paddingBottom = 28;
  const paddingLeft = 40;
  const paddingRight = 16;
  const labelOffset = 18; // void-ignore (SVG axis label offset — sub-token)
  const barGap = 0.3; // fraction of bar step used as gap

  // Computed layout
  const svgWidth = 800;
  const plotHeight = $derived(height - paddingTop - paddingBottom);
  const plotWidth = svgWidth - paddingLeft - paddingRight;

  const maxValue = $derived(Math.max(...data.map((d) => d.value), 1));

  // Nice grid intervals
  const gridLines = $derived.by(() => {
    const lines: number[] = [];
    const step = niceStep(maxValue, 4);
    for (let v = step; v <= maxValue; v += step) {
      lines.push(v);
    }
    return lines;
  });

  const barWidth = $derived.by(() => {
    const step = plotWidth / data.length;
    return step * (1 - barGap);
  });

  function niceStep(max: number, targetLines: number): number {
    const rough = max / targetLines;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
    const residual = rough / magnitude;
    if (residual <= 1.5) return magnitude;
    if (residual <= 3) return 2 * magnitude;
    if (residual <= 7) return 5 * magnitude;
    return 10 * magnitude;
  }

  function formatValue(v: number): string {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return v.toString();
  }

  function barX(i: number): number {
    const step = plotWidth / data.length;
    return paddingLeft + i * step + (step - barWidth) / 2;
  }

  function barY(value: number): number {
    return paddingTop + plotHeight - (value / maxValue) * plotHeight;
  }

  function barHeight(value: number): number {
    return (value / maxValue) * plotHeight;
  }

  const accessibleSummary = $derived.by(() => {
    if (data.length === 0) return 'Empty bar chart';
    const maxPoint = data.reduce((a, b) => (b.value > a.value ? b : a));
    return `Bar chart with ${data.length} categories. Highest value is ${formatValue(maxPoint.value)} at ${maxPoint.label}.`;
  });
</script>

<div class="chart-bar relative {className}">
  <svg
    class="block w-full h-auto"
    viewBox="0 0 {svgWidth} {height}"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-labelledby="{chartId}-title {chartId}-desc"
  >
    <title id="{chartId}-title">{title}</title>
    <desc id="{chartId}-desc">{accessibleSummary}</desc>
    {#if data.length > 0}
      {#if showGrid}
        <!-- Grid lines -->
        {#each gridLines as gridVal}
          <line
            class="chart-grid-line"
            x1={paddingLeft}
            y1={barY(gridVal)}
            x2={svgWidth - paddingRight}
            y2={barY(gridVal)}
          />
          <text
            class="chart-label"
            x={paddingLeft - 6}
            y={barY(gridVal) + 4}
            text-anchor="end"
          >
            {formatValue(gridVal)}
          </text>
        {/each}

        <!-- Baseline -->
        <line
          class="chart-grid-line"
          x1={paddingLeft}
          y1={paddingTop + plotHeight}
          x2={svgWidth - paddingRight}
          y2={paddingTop + plotHeight}
        />
      {/if}

      <!-- Bars -->
      {#each data as point, i}
        {@const series = point.series ?? i % 6}
        <rect
          class="chart-bar-rect"
          x={barX(i)}
          y={barY(point.value)}
          width={barWidth}
          height={barHeight(point.value)}
          data-series={series}
          style="--item-index: {i}"
        />

        <!-- Value label above bar -->
        {#if showValues}
          <text
            class="chart-value-label"
            x={barX(i) + barWidth / 2}
            y={barY(point.value) - 6}
            text-anchor="middle"
          >
            {formatValue(point.value)}
          </text>
        {/if}

        <!-- Category label below bar -->
        <text
          class="chart-label"
          x={barX(i) + barWidth / 2}
          y={paddingTop + plotHeight + labelOffset}
          text-anchor="middle"
        >
          {point.label}
        </text>
      {/each}
    {:else}
      <text
        class="chart-label"
        x={svgWidth / 2}
        y={height / 2}
        text-anchor="middle"
        dominant-baseline="middle">No data</text
      >
    {/if}
  </svg>
</div>
