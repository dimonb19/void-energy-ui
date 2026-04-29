<script lang="ts">
  import { Printer } from '@lucide/svelte';
</script>

<section id="globals" class="flex flex-col gap-md">
  <h2>06 // GLOBAL TREATMENTS</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Global treatments that apply across every page without any component
      classes. Text selection, scrollbars, print optimization, and container
      query infrastructure &mdash; each adapts to the active physics preset and
      color mode automatically.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Selection styling lives in <code>_reset.scss</code> using
        <code>::selection</code> with the active
        <code>--energy-primary</code> token at 25% opacity. Scrollbars use the
        <code>@include laser-scrollbar</code> mixin from
        <code>_mixins.scss</code> with three physics variants (glass:
        translucent glow, flat: solid minimal, retro: chunky double-width).
        Print rules live in <code>_print.scss</code> &mdash; a
        <code>@media print</code> block that resets the canvas to white, hides
        chrome, and reveals link URLs. Container queries use
        <code>@include container-up($breakpoint)</code> in SCSS and
        <code>@sm:</code> / <code>@md:</code> / <code>@lg:</code> /
        <code>@xl:</code> Tailwind variants (built into Tailwind v4 core).
      </p>
    </details>

    <!-- ─── TEXT SELECTION ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Text Selection</h5>
      <p class="text-small text-mute">
        The <code>::selection</code> pseudo-element uses
        <code>alpha(var(--energy-primary), 25%)</code> as the background and
        <code>--text-main</code> for text color. Select any text on this page to
        see the themed highlight &mdash; it adapts automatically when you switch
        atmospheres.
      </p>
    </div>

    <!-- ─── SCROLLBARS ─────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Scrollbars</h5>
      <p class="text-small text-mute">
        The <code>@include laser-scrollbar</code> mixin styles all scrollable containers.
        Glass: translucent thumb with energy glow on hover. Flat: solid minimal thumb
        with subtle track. Retro: chunky double-width thumb with hard borders. Switch
        physics presets to compare.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <p class="text-small text-dim">
          Vertical scroll &mdash; applied globally to <code>html</code> and inherited
          by scrollable containers:
        </p>
        <!-- void-ignore: demo scroll container height -->
        <div
          class="surface-void p-md"
          style="max-height: 10rem; overflow-y: auto;"
        >
          <div class="flex flex-col gap-sm">
            <p>Reactor Module 01 &mdash; Core containment field active</p>
            <p>Reactor Module 02 &mdash; Plasma density nominal</p>
            <p>Reactor Module 03 &mdash; Coolant flow rate: 847 L/min</p>
            <p>Reactor Module 04 &mdash; Magnetic coil alignment: 99.2%</p>
            <p>Reactor Module 05 &mdash; Energy output: 51.3 TW</p>
            <p>Reactor Module 06 &mdash; Thermal regulation: stable</p>
            <p>Reactor Module 07 &mdash; Neutron flux: within tolerance</p>
            <p>Reactor Module 08 &mdash; Backup systems: standby</p>
            <p>Reactor Module 09 &mdash; Shield integrity: 100%</p>
            <p>Reactor Module 10 &mdash; External sensor array: online</p>
          </div>
        </div>

        <p class="text-small text-dim">
          Horizontal scroll &mdash; wide <code>&lt;pre&gt;</code> block overflows
          its container:
        </p>
        <pre><code
            >const energyMatrix = [[12.4, 8.1, 22.6, 4.8, 15.3, 9.7, 31.2, 7.5, 18.9, 42.1], [11.8, 7.4, 20.1, 5.2, 14.7, 10.3, 28.9, 8.1, 17.2, 39.8], [13.1, 8.7, 23.4, 4.5, 16.1, 9.2, 32.7, 7.9, 19.5, 43.6]];</code
          ></pre>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >// SCSS mixin (from _mixins.scss)
@mixin laser-scrollbar() &#123;
  // Glass (default): translucent thumb, energy glow on hover
  scrollbar-width: thin;
  scrollbar-color: alpha(var(--energy-secondary), 50%) transparent;

  &amp;::-webkit-scrollbar-thumb &#123;
    background: alpha(var(--energy-secondary), 50%);
    border-radius: var(--radius-full);
  &#125;

  // Flat: solid minimal
  @include when-flat &#123;
    scrollbar-color: var(--energy-secondary) var(--bg-sunk);
  &#125;

  // Retro: chunky double-width
  @include when-retro &#123;
    scrollbar-width: auto;
    scrollbar-color: var(--energy-primary) var(--bg-sunk);
  &#125;
&#125;

// Applied globally in _reset.scss:
html &#123;
  @include laser-scrollbar;
&#125;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Applied to <code>html</code>, <code>pre</code>, tables, dialogs,
        dropdowns, sidebar, and tile containers. The page scrollbar itself
        demonstrates the effect &mdash; scroll this page to see it.
      </p>
    </div>

    <!-- ─── PRINT STYLESHEET ───────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Print Stylesheet</h5>
      <p class="text-small text-mute">
        A comprehensive <code>@media print</code> stylesheet optimizes every
        page for physical output. White canvas, black ink, hidden chrome, and
        link URLs revealed inline. Use <kbd>Cmd</kbd> + <kbd>P</kbd> (macOS) or
        <kbd>Ctrl</kbd>
        + <kbd>P</kbd> (Windows/Linux) to preview.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-sm">
          <p class="text-small">
            <strong>What the print stylesheet does:</strong>
          </p>
          <div class="prose">
            <ul>
              <li>Resets canvas to white background, black text</li>
              <li>
                Strips all shadows, filters, backdrop-blur, and text-shadow
              </li>
              <li>
                Hides interactive chrome: navbar, sidebar, toasts, modals,
                breadcrumbs, bottom nav, popovers
              </li>
              <li>
                Preserves meaningful backgrounds:
                <code>&lt;mark&gt;</code> keeps yellow highlight,
                <code>&lt;code&gt;</code> / <code>&lt;kbd&gt;</code> keep gray background
              </li>
              <li>
                Reveals external link URLs inline:
                <code>a[href^="http"]::after</code> appends
                <code>(href)</code>
              </li>
              <li>Sets 2cm page margins via <code>@page</code></li>
              <li>
                Controls page breaks: avoids breaking inside images, figures,
                blockquotes, tables, and code blocks
              </li>
              <li>
                Enforces orphans/widows (minimum 3 lines) on paragraphs and
                headings
              </li>
              <li>
                Hides media elements that cannot print: video, audio, iframe,
                canvas
              </li>
              <li>
                Table headers repeat on every page via
                <code>display: table-header-group</code>
              </li>
              <li>Hides all scrollbars in print output</li>
            </ul>
          </div>
        </div>

        <button class="btn btn-system" onclick={() => window.print()}>
          <Printer class="icon" data-size="sm" />
          Print This Page
        </button>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >/* _print.scss — key rules */
@media print &#123;
  @page &#123; margin: 2cm; &#125;

  html, body &#123;
    background: white !important;
    color: black !important;
    padding-top: 0 !important;
  &#125;

  /* Hide chrome */
  .nav-bar, .bottom-nav, .breadcrumbs,
  .toast-region, dialog, .page-sidebar-header,
  [popover] &#123;
    display: none !important;
  &#125;

  /* Reveal link URLs */
  a[href^="http"]::after &#123;
    content: " (" attr(href) ")";
    font-size: 0.8em;
    font-style: italic;
  &#125;

  /* Page breaks */
  img, figure, blockquote, pre, table &#123;
    break-inside: avoid;
  &#125;
&#125;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Source: <code>src/styles/base/_print.scss</code>. Last in the
        <code>_index.scss</code> cascade so it overrides all other rules.
        <code>!important</code> is justified &mdash; print must win.
      </p>
    </div>

    <!-- ─── CONTAINER QUERIES ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Container Queries</h5>
      <p class="text-small text-mute">
        Component-scoped responsive styles based on container width, not
        viewport width. Infrastructure is ready &mdash; no production components
        use container queries yet. Two APIs: the
        <code>@include container-up($breakpoint)</code> SCSS mixin and Tailwind
        <code>@sm:</code>
        / <code>@md:</code> /
        <code>@lg:</code> / <code>@xl:</code> variants.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <table>
          <caption>Container Breakpoints</caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Width</th>
              <th>Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>sm</code></td>
              <td>320px</td>
              <td>Component minimum (icon grids, narrow chips)</td>
            </tr>
            <tr>
              <td><code>md</code></td>
              <td>480px</td>
              <td>Small component (basic card layouts)</td>
            </tr>
            <tr>
              <td><code>lg</code></td>
              <td>640px</td>
              <td>Medium component (two-column form grids)</td>
            </tr>
            <tr>
              <td><code>xl</code></td>
              <td>800px</td>
              <td>Large component (complex multi-column layouts)</td>
            </tr>
          </tbody>
        </table>

        <p class="text-small text-dim">
          Live demo &mdash; drag the bottom-right corner to resize this
          container and watch the layout reflow at 480px:
        </p>
        <!-- void-ignore: demo resize container min-width -->
        <div
          class="@container surface-void p-md"
          style="resize: horizontal; overflow: auto; min-width: 12rem; max-width: 100%; width: 100%; border: var(--physics-border-width) dashed var(--border-color); border-radius: var(--radius-base);"
        >
          <div class="flex flex-col @md:flex-row gap-md">
            <div class="surface-sunk p-md flex-1">
              <p class="text-small text-main">Panel A</p>
              <p class="text-caption text-mute">
                Stacks vertically below 480px, switches to row layout above.
              </p>
            </div>
            <div class="surface-sunk p-md flex-1">
              <p class="text-small text-main">Panel B</p>
              <p class="text-caption text-mute">
                Container queries respond to this container's width, not the
                viewport.
              </p>
            </div>
          </div>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Tailwind usage --&gt;
&lt;div class="@container"&gt;
  &lt;div class="flex flex-col @md:flex-row gap-md"&gt;
    &lt;div class="flex-1"&gt;Panel A&lt;/div&gt;
    &lt;div class="flex-1"&gt;Panel B&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;

// SCSS usage
.my-card &#123;
  container-type: inline-size;

  .my-card-body &#123;
    flex-direction: column;
    @include container-up('md') &#123;
      flex-direction: row;
    &#125;
  &#125;
&#125;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        SCSS: <code>@include container-up('sm' | 'md' | 'lg' | 'xl')</code>
        from <code>_mixins.scss</code>. Tailwind: <code>@sm:</code>,
        <code>@md:</code>, <code>@lg:</code>, <code>@xl:</code> variants. Parent
        needs <code>class="@container"</code> (Tailwind) or
        <code>container-type: inline-size</code> (SCSS).
      </p>
    </div>

    <p class="text-caption text-mute px-xs">
      Global treatments are defined in <code>_reset.scss</code>,
      <code>_mixins.scss</code>, and <code>_print.scss</code>. All adapt to
      physics presets and color modes automatically &mdash; switch the
      atmosphere or physics to see scrollbars and selection colors change.
    </p>
  </div>
</section>
