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
  import { morph } from '@actions/morph';
  import { tooltip } from '@actions/tooltip';
  import { TOOLTIP_CHART_LABEL_OFFSET_PX } from '@config/ui-geometry';

  const INVALID_CHART_LABEL = 'Invalid chart data';
  const SHOULD_WARN_INVALID =
    import.meta.env.DEV || import.meta.env.MODE === 'test';

  interface ChartDataPoint {
    label: string;
    value: number;
    series?: number;
  }

  interface BarChartGroupValue {
    name: string;
    value: number;
    series?: number;
  }

  interface BarChartGroup {
    label: string;
    values: BarChartGroupValue[];
  }

  interface BarChartProps {
    /** Data points (one bar per point) */
    data?: ChartDataPoint[];
    /** Grouped bar data (clustered bars per category) */
    groups?: BarChartGroup[];
    /** Chart height in px */
    height?: number;
    /** Bar orientation (default: vertical) */
    orientation?: 'vertical' | 'horizontal';
    /** Show value labels above bars */
    showValues?: boolean;
    /** Show horizontal grid lines */
    showGrid?: boolean;
    /** Custom value formatter (default: compact k/M abbreviation) */
    formatValue?: (value: number) => string;
    /** Selection callback (fires on bar click or Enter/Space) */
    onselect?: (item: ChartDataPoint, index: number) => void;
    /** Horizontal reference lines */
    referenceLines?: { value: number; label?: string; series?: number }[];
    /** X-axis label */
    xLabel?: string;
    /** Y-axis label */
    yLabel?: string;
    /** Show legend below chart */
    showLegend?: boolean;
    /** Whether to show entry animations */
    animated?: boolean;
    /** Accessible chart title */
    title?: string;
    /** Unique ID prefix for accessible labels */
    id?: string;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    data = [],
    groups,
    orientation = 'vertical',
    height = 240,
    showValues = false,
    showGrid = true,
    formatValue,
    onselect,
    referenceLines,
    xLabel,
    yLabel,
    showLegend = false,
    animated = true,
    title = 'Bar chart',
    id,
    class: className = '',
  }: BarChartProps = $props();

  const componentId = $props.id();
  const generatedChartId = `bar-chart-${componentId}`;
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

  const isHorizontal = $derived(orientation === 'horizontal');
  const isGrouped = $derived(!!groups && groups.length > 0);
  const barChartValidation = $derived.by(() => {
    if (!isGrouped) {
      return { valid: true, reason: null as string | null };
    }

    const baseline = groups?.[0]?.values ?? [];

    for (const group of groups?.slice(1) ?? []) {
      if (group.values.length !== baseline.length) {
        return {
          valid: false,
          reason:
            'Grouped bar charts must contain the same number of value slots in every group.',
        };
      }

      for (let index = 0; index < baseline.length; index += 1) {
        const baselineSlot = baseline[index];
        const groupSlot = group.values[index];
        const baselineSeries = baselineSlot?.series ?? index;
        const groupSeries = groupSlot?.series ?? index;

        if (
          groupSlot?.name !== baselineSlot?.name ||
          groupSeries !== baselineSeries
        ) {
          return {
            valid: false,
            reason:
              'Grouped bar charts must use the same value slots in the same order for every group.',
          };
        }
      }
    }

    return { valid: true, reason: null as string | null };
  });

  // Layout constants (SVG viewBox coordinates — unitless, not CSS px) // void-ignore
  const basePaddingTop = 24;
  const basePaddingBottom = 28;
  const basePaddingLeft = 40;
  const paddingRight = 16;
  const hLabelWidth = 80; // void-ignore (Horizontal bar label area — SVG coordinate space)

  // Dynamic padding for axis labels
  const paddingTop = basePaddingTop;
  const paddingBottom = $derived(
    xLabel ? basePaddingBottom + 18 : basePaddingBottom,
  ); // void-ignore (SVG axis label space)
  const paddingLeft = $derived(
    isHorizontal
      ? hLabelWidth
      : yLabel
        ? basePaddingLeft + 16
        : basePaddingLeft,
  ); // void-ignore (SVG axis label space)
  const labelOffset = 18; // void-ignore (SVG axis label offset — sub-token)
  const barGap = 0.3; // fraction of bar step used as gap
  const maxBarSize = 60; // void-ignore (Max bar thickness — SVG coordinate space)
  const maxHBarSize = 48; // void-ignore (Max horizontal bar height — SVG coordinate space)

  // Computed layout — svgWidth adapts to container
  const svgWidth = $derived(measuredWidth || 800);
  const plotHeight = $derived(height - paddingTop - paddingBottom);
  const plotWidth = $derived(svgWidth - paddingLeft - paddingRight);

  const maxValue = $derived.by(() => {
    if (isGrouped) {
      let max = 0;
      for (const g of groups!) {
        for (const v of g.values) {
          if (v.value > max) max = v.value;
        }
      }
      return max || 1;
    }
    return Math.max(...data.map((d) => d.value), 1);
  });

  // Nice grid intervals
  const gridLines = $derived.by(() => {
    const lines: number[] = [];
    const step = niceStep(maxValue, 4);
    for (let v = step; v <= maxValue; v += step) {
      lines.push(v);
    }
    return lines;
  });

  // Vertical bar geometry
  const barWidth = $derived.by(() => {
    const count = data.length || 1;
    const step = plotWidth / count;
    return Math.min(step * (1 - barGap), maxBarSize);
  });

  // Horizontal bar geometry
  const hBarHeight = $derived.by(() => {
    const count = data.length || 1;
    const step = plotHeight / count;
    return Math.min(step * (1 - barGap), maxHBarSize);
  });

  // Grouped bar geometry
  const subBarCount = $derived(
    isGrouped ? (groups![0]?.values.length ?? 0) : 0,
  );
  const innerBarGap = 0.15; // fraction of sub-bar step used as gap within group

  const groupStep = $derived(isGrouped ? plotWidth / groups!.length : 0);
  const groupWidth = $derived(groupStep * (1 - barGap));
  const subBarStep = $derived(subBarCount > 0 ? groupWidth / subBarCount : 0);
  const subBarWidth = $derived(
    Math.min(subBarStep * (1 - innerBarGap), maxBarSize),
  );

  function groupedBarX(gi: number, vi: number): number {
    const gx = paddingLeft + gi * groupStep + (groupStep - groupWidth) / 2;
    return gx + vi * subBarStep + (subBarStep - subBarWidth) / 2;
  }

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

  // Horizontal orientation helpers
  function hBarX(): number {
    return paddingLeft;
  }

  function hBarY(i: number): number {
    const step = plotHeight / data.length;
    return paddingTop + i * step + (step - hBarHeight) / 2;
  }

  function hBarWidth(value: number): number {
    return (value / maxValue) * plotWidth;
  }

  function handleKeydown(
    e: KeyboardEvent,
    point: ChartDataPoint,
    index: number,
  ) {
    if (onselect && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onselect(point, index);
    }
  }

  const accessibleSummary = $derived.by(() => {
    if (!barChartValidation.valid) {
      return `${INVALID_CHART_LABEL}. ${barChartValidation.reason}`;
    }

    if (isGrouped) {
      if (groups!.length === 0) return 'Empty bar chart';
      const seriesNames = groups![0].values.map((v) => v.name).join(', ');
      return `Grouped bar chart with ${groups!.length} categories and ${groups![0].values.length} series (${seriesNames}).`;
    }
    if (data.length === 0) return 'Empty bar chart';
    const maxPoint = data.reduce((a, b) => (b.value > a.value ? b : a));
    return `Bar chart with ${data.length} categories. Highest value is ${fmt(maxPoint.value)} at ${maxPoint.label}.`;
  });

  let lastInvalidWarning = $state<string | null>(null);

  $effect(() => {
    if (!SHOULD_WARN_INVALID) return;

    const reason = barChartValidation.valid ? null : barChartValidation.reason;
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
  class="chart-bar relative {className}"
  data-animated={animated}
  data-orientation={orientation}
  use:morph={{ height: true, width: false }}
>
  <svg
    class="block w-full h-auto"
    viewBox="0 0 {svgWidth} {height}"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-labelledby="{chartId}-title {chartId}-desc"
  >
    <title id="{chartId}-title">{title}</title>
    <desc id="{chartId}-desc">{accessibleSummary}</desc>
    {#if !barChartValidation.valid}
      <text
        class="chart-label"
        x={svgWidth / 2}
        y={height / 2}
        text-anchor="middle"
        dominant-baseline="middle">{INVALID_CHART_LABEL}</text
      >
    {:else if isGrouped || data.length > 0}
      {#if isGrouped}
        <!-- GROUPED MODE -->
        {#if showGrid}
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
              {fmt(gridVal)}
            </text>
          {/each}
          <line
            class="chart-grid-line"
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={svgWidth - paddingRight}
            y2={paddingTop + plotHeight}
          />
        {/if}

        {#if referenceLines}
          {#each referenceLines as ref}
            <line
              class="chart-reference-line"
              x1={paddingLeft}
              y1={barY(ref.value)}
              x2={svgWidth - paddingRight}
              y2={barY(ref.value)}
              data-series={ref.series}
            />
          {/each}
        {/if}

        {#each groups! as group, gi}
          {#each group.values as val, vi}
            {@const series = val.series ?? vi % 6}
            <rect
              class="chart-bar-rect"
              x={groupedBarX(gi, vi)}
              y={barY(val.value)}
              width={subBarWidth}
              height={barHeight(val.value)}
              data-series={series}
              style="--item-index: {gi * subBarCount + vi}"
              use:tooltip={{
                content: `${group.label} — ${val.name}: ${fmt(val.value)}`,
                offset: showValues ? TOOLTIP_CHART_LABEL_OFFSET_PX : undefined,
              }}
            />
            {#if showValues}
              <text
                class="chart-value-label"
                x={groupedBarX(gi, vi) + subBarWidth / 2}
                y={barY(val.value) - 6}
                text-anchor="middle"
              >
                {fmt(val.value)}
              </text>
            {/if}
            {#if onselect}
              <rect
                class="chart-hit-target"
                x={groupedBarX(gi, vi)}
                y={paddingTop}
                width={subBarWidth}
                height={plotHeight}
                role="button"
                tabindex="0"
                aria-label="{group.label} — {val.name}: {fmt(val.value)}"
                onclick={() =>
                  onselect(
                    { label: group.label, value: val.value, series },
                    gi,
                  )}
                onkeydown={(e) =>
                  handleKeydown(
                    e,
                    { label: group.label, value: val.value, series },
                    gi,
                  )}
              />
            {/if}
          {/each}
          <text
            class="chart-label"
            x={paddingLeft + gi * groupStep + groupStep / 2}
            y={paddingTop + plotHeight + labelOffset}
            text-anchor="middle"
          >
            {group.label}
          </text>
        {/each}

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
      {:else if isHorizontal}
        <!-- HORIZONTAL MODE -->
        {#if showGrid}
          {#each gridLines as gridVal}
            {@const gx = paddingLeft + (gridVal / maxValue) * plotWidth}
            <line
              class="chart-grid-line"
              x1={gx}
              y1={paddingTop}
              x2={gx}
              y2={paddingTop + plotHeight}
            />
            <text
              class="chart-label"
              x={gx}
              y={paddingTop + plotHeight + labelOffset}
              text-anchor="middle"
            >
              {fmt(gridVal)}
            </text>
          {/each}
          <line
            class="chart-grid-line"
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + plotHeight}
          />
        {/if}

        {#each data as point, i}
          {@const series = point.series ?? i % 6}
          <rect
            class="chart-bar-rect"
            x={hBarX()}
            y={hBarY(i)}
            width={hBarWidth(point.value)}
            height={hBarHeight}
            data-series={series}
            style="--item-index: {i}"
            use:tooltip={{ content: `${point.label}: ${fmt(point.value)}` }}
          />
          {#if showValues}
            {@const overflows = hBarWidth(point.value) > plotWidth * 0.85}
            <text
              class="chart-value-label"
              x={overflows
                ? hBarX() + hBarWidth(point.value) - 6
                : hBarX() + hBarWidth(point.value) + 6}
              y={hBarY(i) + hBarHeight / 2 + 4}
              text-anchor={overflows ? 'end' : 'start'}
            >
              {fmt(point.value)}
            </text>
          {/if}
          <text
            class="chart-label"
            x={paddingLeft - 6}
            y={hBarY(i) + hBarHeight / 2 + 4}
            text-anchor="end"
          >
            {point.label}
          </text>
          {#if onselect}
            <rect
              class="chart-hit-target"
              x={paddingLeft}
              y={hBarY(i)}
              width={plotWidth}
              height={hBarHeight}
              role="button"
              tabindex="0"
              aria-label="{point.label}: {fmt(point.value)}"
              onclick={() => onselect(point, i)}
              onkeydown={(e) => handleKeydown(e, point, i)}
            />
          {/if}
        {/each}
      {:else}
        <!-- VERTICAL MODE -->
        {#if showGrid}
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
              {fmt(gridVal)}
            </text>
          {/each}
          <line
            class="chart-grid-line"
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={svgWidth - paddingRight}
            y2={paddingTop + plotHeight}
          />
        {/if}

        {#if referenceLines}
          {#each referenceLines as ref}
            <line
              class="chart-reference-line"
              x1={paddingLeft}
              y1={barY(ref.value)}
              x2={svgWidth - paddingRight}
              y2={barY(ref.value)}
              data-series={ref.series}
            />
          {/each}
        {/if}

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
            use:tooltip={{
              content: `${point.label}: ${fmt(point.value)}`,
              offset: showValues ? TOOLTIP_CHART_LABEL_OFFSET_PX : undefined,
            }}
          />
          {#if showValues}
            <text
              class="chart-value-label"
              x={barX(i) + barWidth / 2}
              y={barY(point.value) - 6}
              text-anchor="middle"
            >
              {fmt(point.value)}
            </text>
          {/if}
          <text
            class="chart-label"
            x={barX(i) + barWidth / 2}
            y={paddingTop + plotHeight + labelOffset}
            text-anchor="middle"
          >
            {point.label}
          </text>
          {#if onselect}
            <rect
              class="chart-hit-target"
              x={barX(i)}
              y={paddingTop}
              width={barWidth}
              height={plotHeight}
              role="button"
              tabindex="0"
              aria-label="{point.label}: {fmt(point.value)}"
              onclick={() => onselect(point, i)}
              onkeydown={(e) => handleKeydown(e, point, i)}
            />
          {/if}
        {/each}

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
  {#if barChartValidation.valid && showLegend && (isGrouped ? groups!.length > 0 : data.length > 0)}
    <div class="flex flex-row flex-wrap justify-center gap-md mt-md">
      {#if isGrouped}
        {#each groups![0].values as val, vi}
          {@const series = val.series ?? vi % 6}
          <div class="flex items-center gap-xs">
            <span class="chart-legend-swatch" data-series={series}></span>
            <span class="chart-legend-label">{val.name}</span>
          </div>
        {/each}
      {:else}
        {#each data as point, i}
          {@const series = point.series ?? i % 6}
          <div class="flex items-center gap-xs">
            <span class="chart-legend-swatch" data-series={series}></span>
            <span class="chart-legend-label">{point.label}</span>
          </div>
        {/each}
      {/if}
    </div>
  {/if}

  {#if barChartValidation.valid && referenceLines?.some((r) => r.label)}
    <div class="flex flex-row flex-wrap justify-center gap-md mt-md">
      {#each referenceLines!.filter((r) => r.label) as ref}
        <div class="flex items-center gap-xs">
          <span class="chart-reference-swatch" data-series={ref.series}></span>
          <span class="chart-legend-label">{ref.label}: {fmt(ref.value)}</span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Screen reader data table -->
  {#if barChartValidation.valid && (isGrouped ? groups!.length > 0 : data.length > 0)}
    <table class="sr-only">
      <caption>{title}</caption>
      {#if isGrouped}
        <thead
          ><tr
            ><th>Group</th>{#each groups![0].values as val}<th>{val.name}</th
              >{/each}</tr
          ></thead
        >
        <tbody>
          {#each groups! as group}
            <tr
              ><td>{group.label}</td>{#each group.values as val}<td
                  >{fmt(val.value)}</td
                >{/each}</tr
            >
          {/each}
        </tbody>
      {:else}
        <thead><tr><th>Category</th><th>Value</th></tr></thead>
        <tbody>
          {#each data as point}
            <tr><td>{point.label}</td><td>{fmt(point.value)}</td></tr>
          {/each}
        </tbody>
      {/if}
    </table>
  {/if}
</div>
