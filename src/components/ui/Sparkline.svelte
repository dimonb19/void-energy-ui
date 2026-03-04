<!--
  SPARKLINE COMPONENT
  Compact inline trend line for embedding in stat cards, tables, and lists.
  No axes, no labels — just the shape of the data.

  USAGE
  ─────────────────────────────────────────────────────────────────────────
  <Sparkline data={[45, 52, 48, 61, 55, 67, 72]} />
  <Sparkline data={weeklyTrend} filled series={2} width={160} height={40} />
  ─────────────────────────────────────────────────────────────────────────

  PHYSICS: Glass = glow on stroke. Flat = clean. Retro = square caps, no glow.
  SERIES: 0 = energy-primary, 1 = system, 2 = success, 3 = premium, 4 = error, 5 = secondary.
-->
<script lang="ts">
  interface SparklineProps {
    /** Array of numeric values (min 2 points) */
    data: number[];
    /** SVG width in px */
    width?: number;
    /** SVG height in px */
    height?: number;
    /** Series color index (0–5) */
    series?: number;
    /** Show filled area below line */
    filled?: boolean;
    /** Fluid mode — stretches to fill container width */
    fluid?: boolean;
    /** Accessible label */
    label?: string;
    /** Unique ID prefix for accessible labels */
    id?: string;
    /** Whether to show entry animations */
    animated?: boolean;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    data,
    width = 120,
    height = 32,
    series = 0,
    filled = false,
    fluid = false,
    animated = true,
    label = 'Sparkline trend',
    id,
    class: className = '',
  }: SparklineProps = $props();

  // svelte-ignore state_referenced_locally
  const chartId = id ?? `sparkline-${Math.random().toString(36).slice(2, 9)}`;

  // Internal padding to prevent stroke clipping
  const pad = 2; // void-ignore (SVG internal padding — sub-token)

  const points = $derived.by(() => {
    if (data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = (width - pad * 2) / (data.length - 1);

    return data
      .map((v, i) => {
        const x = pad + i * stepX;
        const y = pad + (1 - (v - min) / range) * (height - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  });

  const accessibleSummary = $derived.by(() => {
    if (data.length < 2) return 'Insufficient data';
    return `Trend from ${data[0]} to ${data[data.length - 1]} over ${data.length} points.`;
  });

  const areaPath = $derived.by(() => {
    if (!filled || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = (width - pad * 2) / (data.length - 1);

    const linePoints = data.map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    });

    return `M ${linePoints[0]} L ${linePoints.join(' L ')} L ${pad + (data.length - 1) * stepX},${height - pad} L ${pad},${height - pad} Z`;
  });
</script>

<span
  class="chart-sparkline items-center align-middle {fluid
    ? 'flex w-full'
    : 'inline-flex'} {className}"
  data-animated={animated}
>
  <svg
    class="block {fluid ? 'w-full' : ''}"
    viewBox="0 0 {width} {height}"
    width={fluid ? undefined : width}
    height={fluid ? undefined : height}
    style={fluid ? `height: ${height}px` : undefined}
    preserveAspectRatio="none"
    role="img"
    aria-labelledby="{chartId}-title {chartId}-desc"
  >
    <title id="{chartId}-title">{label}</title>
    <desc id="{chartId}-desc">{accessibleSummary}</desc>
    {#if filled && areaPath}
      <path class="chart-sparkline-area" d={areaPath} data-series={series} />
    {/if}
    {#if points}
      <polyline
        class="chart-sparkline-path"
        {points}
        data-series={series}
        fill="none"
      />
    {/if}
  </svg>
</span>
