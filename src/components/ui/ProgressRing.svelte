<!--
  PROGRESS RING COMPONENT
  Circular progress indicator with optional center value label.
  Uses stroke-dasharray technique for the arc fill.

  USAGE
  ─────────────────────────────────────────────────────────────────────────
  <ProgressRing value={75} />
  <ProgressRing value={42} max={100} showValue series={2} scale="lg" />
  <ProgressRing value={3} max={10} formatValue={(v, m) => `${v}/${m}`} showValue />
  ─────────────────────────────────────────────────────────────────────────

  PHYSICS: Glass = glow on fill stroke. Flat = clean. Retro = square caps, no glow.
  SERIES: 0 = energy-primary, 1 = system, 2 = success, 3 = premium, 4 = error, 5 = secondary.
-->
<script lang="ts">
  interface ProgressRingProps {
    /** Current value */
    value: number;
    /** Maximum value (default 100) */
    max?: number;
    /** Display size: sm | md | lg | xl (default md) */
    scale?: 'sm' | 'md' | 'lg' | 'xl';
    /** Ring thickness as fraction of radius (0–1) */
    thickness?: number;
    /** Series color index (0–5) */
    series?: number;
    /** Show percentage/value label in center */
    showValue?: boolean;
    /** Custom value formatter (default: percentage) */
    formatValue?: (value: number, max: number) => string;
    /** Whether to show entry animation */
    animated?: boolean;
    /** Accessible label */
    label?: string;
    /** Unique ID prefix for accessible labels */
    id?: string;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    value,
    max = 100,
    scale = 'md',
    thickness = 0.25,
    series = 0,
    showValue = false,
    formatValue,
    animated = true,
    label = 'Progress',
    id,
    class: className = '',
  }: ProgressRingProps = $props();

  // ViewBox coordinate space
  const viewBoxSize = 100; // void-ignore (SVG viewBox coordinate space — unitless)
  const center = viewBoxSize / 2;
  const radius = center * 0.8;
  const strokeWidth = $derived(radius * thickness);
  const circumference = 2 * Math.PI * radius;

  const safeMax = $derived(max > 0 ? max : 0);
  const clampedValue = $derived(Math.min(Math.max(value, 0), safeMax));
  const fraction = $derived(safeMax > 0 ? clampedValue / safeMax : 0);
  const fillLength = $derived(fraction * circumference);
  const gapLength = $derived(circumference - fillLength);

  function defaultFormatValue(v: number, m: number): string {
    return m > 0 ? `${Math.round((v / m) * 100)}%` : '0%';
  }

  const fmt = $derived(formatValue ?? defaultFormatValue);
  const centerFontScale = 0.18; // void-ignore (Proportional font size for SVG viewBox)
</script>

<div
  {id}
  class="chart-progress-ring relative {className}"
  data-size={scale}
  data-animated={animated}
  role="progressbar"
  aria-valuenow={clampedValue}
  aria-valuemin={0}
  aria-valuemax={safeMax}
  aria-label={label}
>
  <svg
    class="block w-full h-auto"
    viewBox="0 0 {viewBoxSize} {viewBoxSize}"
    aria-hidden="true"
  >
    <!-- Background track -->
    <circle
      class="chart-progress-track"
      cx={center}
      cy={center}
      r={radius}
      stroke-width={strokeWidth}
    />

    <!-- Fill arc -->
    <circle
      class="chart-progress-fill"
      cx={center}
      cy={center}
      r={radius}
      stroke-width={strokeWidth}
      stroke-dasharray="{fillLength} {gapLength}"
      stroke-dashoffset={circumference / 4}
      data-series={series}
      opacity={fraction > 0 ? 1 : 0}
    />

    <!-- Center value label -->
    {#if showValue}
      <text
        class="chart-progress-value"
        x={center}
        y={center}
        text-anchor="middle"
        dominant-baseline="middle"
        font-size={viewBoxSize * centerFontScale}
      >
        {fmt(clampedValue, safeMax)}
      </text>
    {/if}
  </svg>
</div>
