<script lang="ts">
  import StatCard from '../ui/StatCard.svelte';
  import Sparkline from '../ui/Sparkline.svelte';
  import BarChart from '../ui/BarChart.svelte';
  import DonutChart from '../ui/DonutChart.svelte';
  import LineChart from '../ui/LineChart.svelte';
  import Toggle from '../ui/Toggle.svelte';

  // ── Stat Card data ───────────────────────────────────────────────────────
  const revenueSparkline = [38, 42, 35, 48, 52, 45, 61, 58, 67, 72, 68, 78];
  const usersSparkline = [
    1200, 1350, 1280, 1450, 1520, 1480, 1650, 1720, 1690, 1840, 1900, 1950,
  ];
  const uptimeSparkline = [
    99.9, 99.8, 100, 99.9, 99.7, 99.9, 100, 100, 99.8, 99.9, 100, 100,
  ];
  const latencySparkline = [
    180, 165, 172, 155, 148, 152, 142, 138, 145, 135, 130, 128,
  ];

  // ── Bar Chart data ───────────────────────────────────────────────────────
  const revenueByQuarter = [
    { label: 'Q1', value: 12400 },
    { label: 'Q2', value: 18700 },
    { label: 'Q3', value: 15200 },
    { label: 'Q4', value: 22100 },
  ];

  let barShowValues = $state(true);
  let barShowGrid = $state(true);

  // ── Line Chart data ──────────────────────────────────────────────────────
  const userGrowth = [
    { label: 'Jan', value: 1200 },
    { label: 'Feb', value: 1850 },
    { label: 'Mar', value: 2100 },
    { label: 'Apr', value: 1900 },
    { label: 'May', value: 2800 },
    { label: 'Jun', value: 3400 },
  ];

  const multiSeriesData = [
    {
      name: 'Sessions',
      data: [
        { label: 'Jan', value: 4200 },
        { label: 'Feb', value: 5100 },
        { label: 'Mar', value: 4800 },
        { label: 'Apr', value: 5900 },
        { label: 'May', value: 6200 },
        { label: 'Jun', value: 7100 },
      ],
      series: 0,
    },
    {
      name: 'Conversions',
      data: [
        { label: 'Jan', value: 840 },
        { label: 'Feb', value: 1020 },
        { label: 'Mar', value: 960 },
        { label: 'Apr', value: 1180 },
        { label: 'May', value: 1364 },
        { label: 'Jun', value: 1562 },
      ],
      series: 2,
    },
  ];

  let lineFilled = $state(true);
  let lineShowDots = $state(true);
  let lineShowGrid = $state(true);
  let lineMultiSeries = $state(false);

  // ── Donut Chart data ─────────────────────────────────────────────────────
  const trafficSources = [
    { label: 'Organic', value: 42 },
    { label: 'Direct', value: 28 },
    { label: 'Referral', value: 18 },
    { label: 'Social', value: 12 },
  ];

  const statusBreakdown = [
    { label: 'Completed', value: 64, series: 2 },
    { label: 'In Progress', value: 21, series: 3 },
    { label: 'Failed', value: 8, series: 4 },
    { label: 'Queued', value: 7, series: 1 },
  ];

  // ── Sparkline demo data ──────────────────────────────────────────────────
  const sparklines = [
    { data: [45, 52, 48, 61, 55, 67, 72], label: 'Primary', series: 0 },
    { data: [30, 28, 35, 32, 40, 38, 42], label: 'System', series: 1 },
    { data: [80, 85, 82, 90, 88, 92, 95], label: 'Success', series: 2 },
    { data: [15, 22, 18, 25, 20, 28, 24], label: 'Premium', series: 3 },
    { data: [60, 55, 58, 50, 52, 48, 45], label: 'Error', series: 4 },
    { data: [35, 40, 38, 45, 42, 50, 48], label: 'Secondary', series: 5 },
  ];

  let sparklineFilled = $state(false);
</script>

<section id="charts" class="flex flex-col gap-md">
  <h2>14 // CHARTS & DATA VIZ</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Data visualization components for dashboards, analytics, and metric
      displays. Five chart types cover KPI metrics, trends, comparisons, and
      composition breakdowns. All charts are pure SVG &mdash; no external
      library. Every element adapts to atmosphere, physics, and mode via the
      series color system.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-md">
        <p>
          Charts use a 6-color series palette mapped to existing semantic
          tokens:
          <code>0: --energy-primary</code>, <code>1: --color-system</code>,
          <code>2: --color-success</code>, <code>3: --color-premium</code>,
          <code>4: --color-error</code>, <code>5: --energy-secondary</code>.
          Series color is applied via <code>data-series</code> attributes on SVG
          elements, styled in <code>_charts.scss</code> with physics-aware
          mixins following the <code>_badge-variant</code> pattern.
        </p>
        <p>
          Glass physics adds glow filters. Flat uses clean solid fills. Retro
          uses stroke-only rendering with dashed grid lines. All animations
          respect <code>--speed-base</code> and go instant in retro. Bar charts
          use <code>chart-grow-bar</code> with staggered delay; line charts use
          <code>chart-draw-line</code> (stroke-dashoffset).
        </p>
      </div>
    </details>

    <!-- ─── STAT CARDS ────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Stat Cards</h5>
      <p class="text-small text-mute">
        KPI metric cards with formatted values, trend indicators, and optional
        embedded sparklines. Use <code>StatCard</code> for dashboard headers and
        summary metrics.
      </p>

      <div class="surface-sunk p-md">
        <div
          class="grid grid-cols-1 tablet:grid-cols-2 full-hd:flex justify-center gap-md"
        >
          <StatCard
            id="stat-revenue"
            label="Revenue"
            value="$78.4k"
            trend="up"
            delta="+12.5%"
            sparkline={revenueSparkline}
          />
          <StatCard
            id="stat-users"
            label="Users"
            value="1,950"
            trend="up"
            delta="+8.2%"
            sparkline={usersSparkline}
          />
          <StatCard
            id="stat-uptime"
            label="Uptime"
            value="99.9%"
            trend="flat"
            delta="0.0%"
            sparkline={uptimeSparkline}
          />
          <StatCard
            id="stat-latency"
            label="Latency"
            value="128ms"
            trend="down"
            delta="-23%"
            sparkline={latencySparkline}
          />
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;StatCard
  label="Revenue"
  value="$78.4k"
  trend="up"
  delta="+12.5%"
  sparkline=&#123;[38, 42, 35, 48, 52, 45, 61, 58, 67, 72, 68, 78]&#125;
/&gt;

&lt;!-- trend: 'up' | 'down' | 'flat' --&gt;
&lt;!-- sparkline auto-colors: up=success, down=error, flat=primary --&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>label</code>, <code>value</code> (formatted string),
        <code>trend</code> (<code>'up'|'down'|'flat'</code>),
        <code>delta</code> (trend text), <code>sparkline</code> (number[]).
      </p>
    </div>

    <!-- ─── BAR CHART ─────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Bar Chart</h5>
      <p class="text-small text-mute">
        Vertical bar chart for comparing values across categories. Bars
        auto-color by index through the 6-series palette. Toggle options below
        to explore chart features.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-row flex-wrap gap-md items-center">
          <Toggle bind:checked={barShowValues} label="Values" />
          <Toggle bind:checked={barShowGrid} label="Grid" />
        </div>

        <BarChart
          data={revenueByQuarter}
          showValues={barShowValues}
          showGrid={barShowGrid}
          title="Revenue by quarter"
          id="bar-revenue"
        />
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;BarChart
  data=&#123;[
    &#123; label: 'Q1', value: 12400 &#125;,
    &#123; label: 'Q2', value: 18700 &#125;,
    &#123; label: 'Q3', value: 15200 &#125;,
    &#123; label: 'Q4', value: 22100 &#125;,
  ]&#125;
  showValues
  showGrid
  title="Revenue by quarter"
/&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>data</code> (&#123;label, value&#125;[]),
        <code>height</code> (default 240),
        <code>showValues</code>, <code>showGrid</code>,
        <code>title</code>, <code>id</code>. Each bar assigns
        <code>data-series</code> by index for auto-coloring.
      </p>
    </div>

    <!-- ─── LINE CHART ────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Line Chart</h5>
      <p class="text-small text-mute">
        Trend visualization with optional area fill, data point dots, and
        multi-series support. Toggle between single and multi-series views.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-row flex-wrap gap-md items-center">
          <Toggle bind:checked={lineFilled} label="Filled" />
          <Toggle bind:checked={lineShowDots} label="Dots" />
          <Toggle bind:checked={lineShowGrid} label="Grid" />
          <Toggle bind:checked={lineMultiSeries} label="Multi-series" />
        </div>

        {#if lineMultiSeries}
          <LineChart
            data={multiSeriesData}
            filled={lineFilled}
            showDots={lineShowDots}
            showGrid={lineShowGrid}
            showLegend
            title="Sessions vs Conversions"
            id="line-multi"
          />
        {:else}
          <LineChart
            data={userGrowth}
            filled={lineFilled}
            showDots={lineShowDots}
            showGrid={lineShowGrid}
            title="User growth"
            id="line-growth"
          />
        {/if}
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Single series --&gt;
&lt;LineChart
  data=&#123;[
    &#123; label: 'Jan', value: 1200 &#125;,
    &#123; label: 'Feb', value: 1850 &#125;,
  ]&#125;
  filled showDots showGrid
/&gt;

&lt;!-- Multi-series --&gt;
&lt;LineChart
  data=&#123;[
    &#123; name: 'Sessions', data: [...], series: 0 &#125;,
    &#123; name: 'Conversions', data: [...], series: 2 &#125;,
  ]&#125;
  showLegend filled
/&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>data</code> (single: &#123;label, value&#125;[], multi:
        &#123;name, data, series?&#125;[]),
        <code>filled</code>, <code>showDots</code>, <code>showGrid</code>,
        <code>showLegend</code>, <code>id</code>. Multi-series auto-detects from
        <code>name</code> property.
      </p>
    </div>

    <!-- ─── DONUT CHART ───────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Donut Chart</h5>
      <p class="text-small text-mute">
        Ring chart for proportional data with center metric and legend. Segments
        use <code>stroke-dasharray</code> on SVG circles &mdash; no complex path
        math needed.
      </p>

      <div class="surface-sunk p-md">
        <div class="grid grid-cols-1 tablet:grid-cols-2 gap-lg">
          <DonutChart
            data={trafficSources}
            centerMetric={{ label: 'Sources', value: '100%' }}
            title="Traffic sources"
            id="donut-traffic"
          />
          <DonutChart
            data={statusBreakdown}
            centerMetric={{ label: 'Tasks', value: '247' }}
            title="Task status breakdown"
            id="donut-status"
          />
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;DonutChart
  data=&#123;[
    &#123; label: 'Organic', value: 42 &#125;,
    &#123; label: 'Direct', value: 28 &#125;,
    &#123; label: 'Referral', value: 18 &#125;,
    &#123; label: 'Social', value: 12 &#125;,
  ]&#125;
  centerMetric=&#123;&#123; label: 'Sources', value: '100%' &#125;&#125;
/&gt;

&lt;!-- Explicit series colors --&gt;
&lt;DonutChart data=&#123;[
  &#123; label: 'Done', value: 64, series: 2 &#125;,
  &#123; label: 'Failed', value: 8, series: 4 &#125;,
]&#125; /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>data</code> (&#123;label, value, series?&#125;[]),
        <code>size</code> (default 200), <code>thickness</code> (0&ndash;1,
        default 0.3),
        <code>centerMetric</code> (&#123;label, value&#125;),
        <code>showLegend</code>, <code>id</code>.
      </p>
    </div>

    <!-- ─── SPARKLINES ────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Sparklines</h5>
      <p class="text-small text-mute">
        Compact inline trend lines for embedding in tables, lists, and cards. No
        axes or labels &mdash; just the shape of the data. All 6 series colors
        shown below.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex items-center gap-sm">
          <Toggle bind:checked={sparklineFilled} label="Filled" />
        </div>

        <div
          class="grid grid-cols-2 tablet:grid-cols-3 small-desktop:grid-cols-6 gap-md"
        >
          {#each sparklines as sp}
            <div class="flex flex-col items-center gap-xs">
              <Sparkline
                data={sp.data}
                series={sp.series}
                filled={sparklineFilled}
                width={100}
                height={32}
                label="{sp.label} trend"
                id="sparkline-{sp.label.toLowerCase()}"
              />
              <span class="text-caption text-mute">{sp.label}</span>
            </div>
          {/each}
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;Sparkline data=&#123;[45, 52, 48, 61, 55, 67, 72]&#125; /&gt;
&lt;Sparkline data=&#123;trend&#125; filled series=&#123;2&#125; width=&#123;160&#125; height=&#123;40&#125; /&gt;

&lt;!-- Series: 0=primary, 1=system, 2=success, 3=premium, 4=error, 5=secondary --&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>data</code> (number[]),
        <code>width</code> (default 120), <code>height</code> (default 32),
        <code>series</code> (0&ndash;5), <code>filled</code>,
        <code>label</code> (aria).
      </p>
    </div>
  </div>
</section>
