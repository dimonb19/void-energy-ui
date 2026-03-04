<!--
  LINE CHART COMPONENT
  Physics-aware line/area chart with grid, axes, optional dots,
  and multi-series support.

  USAGE
  ─────────────────────────────────────────────────────────────────────────
  Single series:
  <LineChart data={[
    { label: 'Jan', value: 1200 },
    { label: 'Feb', value: 1850 },
  ]} filled showDots />

  Multi-series:
  <LineChart data={[
    { name: 'Sessions', data: [...] },
    { name: 'Conversions', data: [...], series: 2 },
  ]} showLegend />
  ─────────────────────────────────────────────────────────────────────────

  PHYSICS: Glass = stroke glow + area fill. Flat = clean. Retro = square caps.
  ANIMATION: Line draws in via stroke-dashoffset (chart-draw-line keyframe).
-->
<script lang="ts">
  interface ChartTimePoint {
    label: string;
    value: number;
  }

  interface ChartSeries {
    name: string;
    data: ChartTimePoint[];
    series?: number;
  }

  interface LineChartProps {
    /** Single series or multi-series data */
    data: ChartTimePoint[] | ChartSeries[];
    /** Chart height in px */
    height?: number;
    /** Show filled area below lines */
    filled?: boolean;
    /** Show dots at data points */
    showDots?: boolean;
    /** Show horizontal grid lines */
    showGrid?: boolean;
    /** Show legend (multi-series) */
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
    height = 240,
    filled = false,
    showDots = false,
    showGrid = true,
    showLegend = false,
    title = 'Line chart',
    id,
    class: className = '',
  }: LineChartProps = $props();

  // svelte-ignore state_referenced_locally
  const chartId = id ?? `line-chart-${Math.random().toString(36).slice(2, 9)}`;

  // Layout constants (SVG viewBox coordinates — unitless, not CSS px) // void-ignore
  const paddingTop = 20;
  const paddingBottom = 28;
  const paddingLeft = 40;
  const paddingRight = 16;
  const labelOffset = 18; // void-ignore (SVG axis label offset — sub-token)
  const svgWidth = 800;
  const dotRadius = 4; // void-ignore (SVG dot radius — sub-token scale)

  const plotHeight = $derived(height - paddingTop - paddingBottom);
  const plotWidth = svgWidth - paddingLeft - paddingRight;

  // Normalize to array of series
  const isMultiSeries = $derived(
    data.length > 0 && Array.isArray((data[0] as ChartSeries).data),
  );

  const series = $derived.by(
    (): { name: string; data: ChartTimePoint[]; seriesIdx: number }[] => {
      if (isMultiSeries) {
        return (data as ChartSeries[]).map((s, i) => ({
          name: s.name,
          data: s.data,
          seriesIdx: s.series ?? i,
        }));
      }
      return [{ name: '', data: data as ChartTimePoint[], seriesIdx: 0 }];
    },
  );

  // Labels from first series
  const labels = $derived(series[0]?.data.map((d) => d.label) ?? []);

  // Global max across all series
  const maxValue = $derived.by(() => {
    let max = 0;
    for (const s of series) {
      for (const d of s.data) {
        if (d.value > max) max = d.value;
      }
    }
    return max || 1;
  });

  // Grid lines
  const gridLines = $derived.by(() => {
    const lines: number[] = [];
    const step = niceStep(maxValue, 4);
    for (let v = step; v <= maxValue; v += step) {
      lines.push(v);
    }
    return lines;
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

  function pointX(i: number, total: number): number {
    if (total <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (i / (total - 1)) * plotWidth;
  }

  function pointY(value: number): number {
    return paddingTop + plotHeight - (value / maxValue) * plotHeight;
  }

  // Build SVG path strings for each series
  const linePaths = $derived.by(() => {
    return series.map((s) => {
      const pts = s.data.map((d, i) => {
        const x = pointX(i, s.data.length);
        const y = pointY(d.value);
        return { x, y };
      });

      const linePath = pts
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
        .join(' ');

      let areaPath = '';
      if (filled && pts.length >= 2) {
        const bottomY = paddingTop + plotHeight;
        areaPath = `${linePath} L ${pts[pts.length - 1].x},${bottomY} L ${pts[0].x},${bottomY} Z`;
      }

      return {
        ...s,
        linePath,
        areaPath,
        points: pts,
      };
    });
  });

  const accessibleSummary = $derived.by(() => {
    const allValues = series.flatMap((s) => s.data.map((d) => d.value));
    if (allValues.length === 0) return 'Empty line chart';
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    return series.length > 1
      ? `Line chart with ${series.length} series, values ranging from ${formatValue(min)} to ${formatValue(max)}.`
      : `Line chart with ${allValues.length} data points, ranging from ${formatValue(min)} to ${formatValue(max)}.`;
  });

  // Measure path lengths for draw animation
  let pathLengths = $state<number[]>([]);
  let svgEl: SVGSVGElement | undefined = $state();

  $effect(() => {
    if (!svgEl) return;
    void linePaths; // read reactive data to re-run on data changes
    const paths = svgEl.querySelectorAll('.chart-line-path');
    pathLengths = Array.from(paths).map((p) =>
      (p as SVGPathElement).getTotalLength(),
    );
  });
</script>

<div class="chart-line relative {className}">
  <svg
    bind:this={svgEl}
    class="block w-full h-auto"
    viewBox="0 0 {svgWidth} {height}"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-labelledby="{chartId}-title {chartId}-desc"
  >
    <title id="{chartId}-title">{title}</title>
    <desc id="{chartId}-desc">{accessibleSummary}</desc>
    {#if series[0]?.data.length > 0}
      {#if showGrid}
        <!-- Grid lines -->
        {#each gridLines as gridVal}
          <line
            class="chart-grid-line"
            x1={paddingLeft}
            y1={pointY(gridVal)}
            x2={svgWidth - paddingRight}
            y2={pointY(gridVal)}
          />
          <text
            class="chart-label"
            x={paddingLeft - 6}
            y={pointY(gridVal) + 4}
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

      <!-- X-axis labels -->
      {#each labels as label, i}
        <text
          class="chart-label"
          x={pointX(i, labels.length)}
          y={paddingTop + plotHeight + labelOffset}
          text-anchor="middle"
        >
          {label}
        </text>
      {/each}

      <!-- Series -->
      {#each linePaths as lp, si}
        <!-- Area fill -->
        {#if filled && lp.areaPath}
          <path
            class="chart-area-fill"
            d={lp.areaPath}
            data-series={lp.seriesIdx}
          />
        {/if}

        <!-- Line path -->
        <path
          class="chart-line-path"
          d={lp.linePath}
          data-series={lp.seriesIdx}
          style={pathLengths[si] ? `--path-length: ${pathLengths[si]}` : ''}
        />

        <!-- Dots -->
        {#if showDots}
          {#each lp.points as pt}
            <circle
              class="chart-dot"
              cx={pt.x}
              cy={pt.y}
              r={dotRadius}
              data-series={lp.seriesIdx}
            />
          {/each}
        {/if}
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

  <!-- Legend -->
  {#if showLegend && isMultiSeries}
    <div class="flex flex-row flex-wrap justify-center gap-md mt-md">
      {#each series as s}
        <div class="flex items-center gap-xs">
          <span class="chart-legend-swatch" data-series={s.seriesIdx}></span>
          <span class="chart-legend-label">{s.name}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
