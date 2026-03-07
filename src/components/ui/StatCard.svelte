<!--
  STAT CARD COMPONENT
  KPI metric display with label, formatted value, trend indicator,
  and optional embedded sparkline.

  USAGE
  ─────────────────────────────────────────────────────────────────────────
  <StatCard label="Revenue" value="$12,450" trend="up" delta="+12.5%" />
  <StatCard label="Users" value="3,847" trend="up" delta="+8.2%" sparkline={weeklyUsers} />
  <StatCard label="Latency" value="142ms" trend="down" delta="-23%" />
  ─────────────────────────────────────────────────────────────────────────

  PHYSICS: Container uses glass-float (adapts to all 3 presets + both modes).
  TREND: up = green (success), down = red (error), flat = muted.
-->
<script lang="ts">
  import { TrendingUp, TrendingDown, Minus } from '@lucide/svelte';
  import Sparkline from './Sparkline.svelte';

  type ChartTrend = 'up' | 'down' | 'flat';

  interface StatCardProps {
    /** Metric label (e.g., "Monthly Revenue") */
    label: string;
    /** Formatted display value (e.g., "$12,450") */
    value: string;
    /** Trend direction */
    trend?: ChartTrend;
    /** Trend delta text (e.g., "+12.5%") */
    delta?: string;
    /** Sparkline data for inline trend */
    sparkline?: number[];
    /** Unique ID prefix for accessible labels */
    id?: string;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    label,
    value,
    trend,
    delta,
    sparkline,
    id,
    class: className = '',
  }: StatCardProps = $props();

  const componentId = $props.id();
  const generatedChartId = `stat-card-${componentId}`;
  const chartId = $derived(id ?? generatedChartId);

  const TrendIcon = $derived(
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus,
  );
</script>

<div class="chart-stat flex flex-col gap-md p-lg {className}">
  <div class="flex flex-row justify-between gap-md">
    <span class="chart-stat-label">{label}</span>
    {#if trend && delta}
      <span
        class="chart-stat-delta flex items-center gap-xs"
        data-trend={trend}
      >
        <TrendIcon class="icon" data-size="sm" />
        {delta}
      </span>
    {/if}
  </div>

  <div class="flex flex-wrap justify-between gap-md tablet:flex-nowrap">
    <span class="chart-stat-value text-h4">{value}</span>

    {#if sparkline && sparkline.length >= 2}
      <Sparkline
        data={sparkline}
        id="{chartId}-sparkline"
        width={80}
        height={28}
        series={trend === 'up' ? 2 : trend === 'down' ? 4 : 0}
        filled
      />
    {/if}
  </div>
</div>
