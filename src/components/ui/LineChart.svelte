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
  <LineChart series={[
    { name: 'Sessions', data: [...] },
    { name: 'Conversions', data: [...], series: 2 },
  ]} showLegend />
  ─────────────────────────────────────────────────────────────────────────

  PHYSICS: Glass = stroke glow + area fill. Flat = clean. Retro = square caps.
  ANIMATION: Line draws in via stroke-dashoffset (chart-draw-line keyframe).
-->
<script lang="ts">
  import { morph } from '@actions/morph';
  import { tooltip } from '@actions/tooltip';

  const INVALID_CHART_LABEL = 'Invalid chart data';
  const SHOULD_WARN_INVALID =
    import.meta.env.DEV || import.meta.env.MODE === 'test';

  interface LineChartProps {
    /** Single-series data points */
    data?: LineChartPoint[];
    /** Multi-series data (takes precedence over data) */
    series?: LineChartSeries[];
    /** Chart height in px */
    height?: number;
    /** Show filled area below lines */
    filled?: boolean;
    /** Show dots at data points */
    showDots?: boolean;
    /** Show horizontal grid lines */
    showGrid?: boolean;
    /** Use smooth Catmull-Rom curves instead of straight lines */
    smooth?: boolean;
    /** Show legend (multi-series) */
    showLegend?: boolean;
    /** Custom value formatter (default: compact k/M abbreviation) */
    formatValue?: (value: number) => string;
    /** Selection callback (fires on dot click or Enter/Space) */
    onselect?: (item: LineChartPoint, index: number) => void;
    /** Horizontal reference lines */
    referenceLines?: ChartReferenceLine[];
    /** X-axis label */
    xLabel?: string;
    /** Y-axis label */
    yLabel?: string;
    /** Accessible chart title */
    title?: string;
    /** Unique ID prefix for accessible labels */
    id?: string;
    /** Whether to show entry animations */
    animated?: boolean;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    data,
    series: seriesProp,
    height = 240,
    filled = false,
    showDots = false,
    showGrid = true,
    smooth = false,
    showLegend = false,
    formatValue,
    onselect,
    referenceLines,
    xLabel,
    yLabel,
    animated = true,
    title = 'Line chart',
    id,
    class: className = '',
  }: LineChartProps = $props();

  const componentId = $props.id();
  const generatedChartId = `line-chart-${componentId}`;
  const chartId = $derived(id ?? generatedChartId);

  // Fluid sizing via ResizeObserver
  let wrapperEl: HTMLDivElement | undefined = $state();
  let measuredWidth = $state(0);

  $effect(() => {
    if (!wrapperEl) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) measuredWidth = Math.round(entry.contentRect.width);
    });
    ro.observe(wrapperEl);
    return () => ro.disconnect();
  });

  // Layout constants (SVG viewBox coordinates — unitless, not CSS px) // void-ignore
  const basePaddingTop = 20;
  const basePaddingBottom = 28;
  const basePaddingLeft = 40;
  const paddingRight = 16;

  // Dynamic padding for axis labels
  const paddingTop = basePaddingTop;
  const paddingBottom = $derived(
    xLabel ? basePaddingBottom + 18 : basePaddingBottom,
  ); // void-ignore (SVG axis label space)
  const paddingLeft = $derived(yLabel ? basePaddingLeft + 16 : basePaddingLeft); // void-ignore (SVG axis label space)
  const labelOffset = 18; // void-ignore (SVG axis label offset — sub-token)
  const dotRadius = 4; // void-ignore (SVG dot radius — sub-token scale)
  const hitTargetRadius = 12; // void-ignore (SVG hit expansion — accessibility)

  // Computed layout — svgWidth adapts to container
  const svgWidth = $derived(measuredWidth || 800);
  const plotHeight = $derived(height - paddingTop - paddingBottom);
  const plotWidth = $derived(svgWidth - paddingLeft - paddingRight);

  // Normalize to internal series array — series prop takes precedence
  const rawNormalizedSeries = $derived.by(
    (): { name: string; data: LineChartPoint[]; seriesIdx: number }[] => {
      if (seriesProp && seriesProp.length > 0) {
        return seriesProp.map((s, i) => ({
          name: s.name,
          data: s.data,
          seriesIdx: s.series ?? i,
        }));
      }
      if (data && data.length > 0) {
        return [{ name: '', data, seriesIdx: 0 }];
      }
      return [];
    },
  );

  const negativeValueReason = $derived.by(() => {
    for (const series of rawNormalizedSeries) {
      const point = series.data.find((entry) => entry.value < 0);
      if (point) {
        const seriesLabel = series.name || 'Value';
        return `Series "${seriesLabel}", label "${point.label}" has unsupported value ${point.value}.`;
      }
    }

    return null;
  });

  const normalizedSeries = $derived.by(() =>
    negativeValueReason ? [] : rawNormalizedSeries,
  );

  const isMultiSeries = $derived(normalizedSeries.length > 1);

  const lineChartValidation = $derived.by(() => {
    if (normalizedSeries.length <= 1) {
      return { valid: true, reason: null as string | null };
    }

    const baseline = normalizedSeries[0]?.data ?? [];

    for (const series of normalizedSeries.slice(1)) {
      if (series.data.length !== baseline.length) {
        return {
          valid: false,
          reason: 'Line chart series must contain the same number of points.',
        };
      }

      for (let index = 0; index < baseline.length; index += 1) {
        if (series.data[index]?.label !== baseline[index]?.label) {
          return {
            valid: false,
            reason:
              'Line chart series must use the same labels in the same order.',
          };
        }
      }
    }

    return { valid: true, reason: null as string | null };
  });

  // Labels from first series
  const labels = $derived(
    lineChartValidation.valid
      ? (normalizedSeries[0]?.data.map((d) => d.label) ?? [])
      : [],
  );

  // Global max across all series
  const maxValue = $derived.by(() => {
    let max = 0;
    for (const s of normalizedSeries) {
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

  function defaultFormatValue(v: number): string {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return v.toString();
  }

  const fmt = $derived(formatValue ?? defaultFormatValue);

  function pointX(i: number, total: number): number {
    if (total <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (i / (total - 1)) * plotWidth;
  }

  function pointY(value: number): number {
    return paddingTop + plotHeight - (value / maxValue) * plotHeight;
  }

  // Catmull-Rom to cubic Bezier path conversion
  function catmullRomPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return '';
    if (pts.length === 2)
      return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

    const tension = 0.5; // void-ignore (Catmull-Rom tension — math constant)
    let d = `M ${pts[0].x},${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3; // void-ignore (Bezier control point)
      const cp1y = p1.y + ((p2.y - p0.y) * tension) / 3; // void-ignore (Bezier control point)
      const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3; // void-ignore (Bezier control point)
      const cp2y = p2.y - ((p3.y - p1.y) * tension) / 3; // void-ignore (Bezier control point)

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    return d;
  }

  // Build SVG path strings for each series
  const linePaths = $derived.by(() => {
    if (!lineChartValidation.valid) {
      return [];
    }

    return normalizedSeries.map((s) => {
      const pts = s.data.map((d, i) => {
        const x = pointX(i, s.data.length);
        const y = pointY(d.value);
        return { x, y };
      });

      const linePath = smooth
        ? catmullRomPath(pts)
        : pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

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
    if (!lineChartValidation.valid) {
      return `${INVALID_CHART_LABEL}. ${lineChartValidation.reason}`;
    }

    const allValues = normalizedSeries.flatMap((s) =>
      s.data.map((d) => d.value),
    );
    if (allValues.length === 0) return 'Empty line chart';
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    return normalizedSeries.length > 1
      ? `Line chart with ${normalizedSeries.length} series, values ranging from ${fmt(min)} to ${fmt(max)}.`
      : `Line chart with ${allValues.length} data points, ranging from ${fmt(min)} to ${fmt(max)}.`;
  });

  // Measure path lengths for draw animation
  let pathLengths = $state<number[]>([]);
  let svgEl: SVGSVGElement | undefined = $state();
  let lastInvalidWarning = $state<string | null>(null);
  let lastNegativeValueError = $state<string | null>(null);

  $effect(() => {
    if (!svgEl) return;
    void linePaths; // read reactive data to re-run on data changes
    const paths = svgEl.querySelectorAll('.chart-line-path');
    pathLengths = Array.from(paths).map((p) =>
      (p as SVGPathElement).getTotalLength(),
    );
  });

  $effect(() => {
    const reason = negativeValueReason;
    if (reason && reason !== lastNegativeValueError) {
      console.error(
        `Void: LineChart does not support negative values. Rendering empty state. (${reason})`,
      );
      lastNegativeValueError = reason;
      return;
    }

    if (!reason) {
      lastNegativeValueError = null;
    }
  });

  $effect(() => {
    if (!SHOULD_WARN_INVALID) return;

    const reason = lineChartValidation.valid
      ? null
      : lineChartValidation.reason;
    if (reason && reason !== lastInvalidWarning) {
      console.warn(`Void: ${INVALID_CHART_LABEL.toLowerCase()} (${reason})`);
      lastInvalidWarning = reason;
    }

    if (!reason) {
      lastInvalidWarning = null;
    }
  });
</script>

<div
  bind:this={wrapperEl}
  class="chart-line relative {className}"
  data-animated={animated}
  use:morph={{ width: false }}
>
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
    {#if !lineChartValidation.valid}
      <text
        class="chart-label"
        x={svgWidth / 2}
        y={height / 2}
        text-anchor="middle"
        dominant-baseline="middle">{INVALID_CHART_LABEL}</text
      >
    {:else if normalizedSeries[0]?.data.length > 0}
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
            {fmt(gridVal)}
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

      <!-- Reference lines -->
      {#if referenceLines}
        {#each referenceLines as ref}
          <line
            class="chart-reference-line"
            x1={paddingLeft}
            y1={pointY(ref.value)}
            x2={svgWidth - paddingRight}
            y2={pointY(ref.value)}
            data-series={ref.series}
          />
          {#if ref.label}
            <text
              class="chart-reference-label"
              x={svgWidth - paddingRight + 4}
              y={pointY(ref.value) + 4}
              text-anchor="start"
            >
              {ref.label}
            </text>
          {/if}
        {/each}
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
          {#each lp.points as pt, di}
            <circle
              class="chart-dot"
              cx={pt.x}
              cy={pt.y}
              r={dotRadius}
              data-series={lp.seriesIdx}
              use:tooltip={{
                content: `${lp.data[di].label}: ${fmt(lp.data[di].value)}`,
              }}
            />
          {/each}
        {/if}

        <!-- Hit targets for interaction -->
        {#if onselect}
          {#each lp.data as dataPoint, di}
            <circle
              class="chart-hit-target"
              cx={lp.points[di].x}
              cy={lp.points[di].y}
              r={hitTargetRadius}
              role="button"
              tabindex="0"
              aria-label="{dataPoint.label}: {fmt(dataPoint.value)}"
              onclick={() => onselect(dataPoint, di)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onselect(dataPoint, di);
                }
              }}
              use:tooltip={{
                content: `${dataPoint.label}: ${fmt(dataPoint.value)}`,
              }}
            />
          {/each}
        {/if}
      {/each}

      <!-- Axis labels -->
      {#if xLabel}
        <text
          class="chart-axis-label"
          x={paddingLeft + plotWidth / 2}
          y={height - 4}
          text-anchor="middle"
        >
          {xLabel}
        </text>
      {/if}
      {#if yLabel}
        <text
          class="chart-axis-label"
          x={14}
          y={paddingTop + plotHeight / 2}
          text-anchor="middle"
          transform="rotate(-90, 14, {paddingTop + plotHeight / 2})"
        >
          {yLabel}
        </text>
      {/if}
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
  {#if showLegend && isMultiSeries && lineChartValidation.valid}
    <div class="flex flex-row flex-wrap justify-center gap-md mt-md">
      {#each normalizedSeries as s}
        <div class="flex items-center gap-xs">
          <span class="chart-legend-swatch" data-series={s.seriesIdx}></span>
          <span class="chart-legend-label">{s.name}</span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Screen reader data table -->
  {#if lineChartValidation.valid && normalizedSeries.length > 0 && normalizedSeries[0].data.length > 0}
    <table class="sr-only">
      <caption>{title}</caption>
      <thead>
        <tr>
          <th>Label</th>
          {#each normalizedSeries as s}
            <th>{s.name || 'Value'}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each normalizedSeries[0].data as _, rowIdx}
          <tr>
            <td>{normalizedSeries[0].data[rowIdx].label}</td>
            {#each normalizedSeries as s}
              <td>{fmt(s.data[rowIdx]?.value ?? 0)}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
