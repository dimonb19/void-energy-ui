<section id="surfaces" class="flex flex-col gap-md">
  <h2>02 // SURFACES</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Surfaces define the physical depth of an element. Floating surfaces rise
      above the page for cards and panels. Sunk surfaces recess into it for
      input areas. Solid surfaces sit flush for backgrounds. Apply a single
      class and the physics engine handles shadow, blur, and border treatment
      across all presets automatically.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Surfaces are atomic texture classes that apply Void Physics without
        enforcing layout or spacing. Two families: floating (<code
          >glass-float</code
        >) and sunk (<code>glass-sunk</code>). Solid surfaces provide opaque
        backgrounds. All adapt to the active physics preset and color mode.
        Glass mode adds backdrop blur and luminous borders. Flat mode uses
        subtle shadows and muted borders. Retro mode uses hard borders with zero
        radius and no blur.
      </p>
    </details>

    <!-- FLOATING SURFACES -->
    <div class="flex flex-col gap-sm">
      <h5>Floating Surfaces</h5>
      <p class="text-small text-mute">
        <code>.surface-glass</code> applies <code>glass-float</code> physics:
        border, shadow, and backdrop blur (glass preset). The
        <code>-action</code> variant adds interactive states (hover lift, cursor
        pointer) for clickable cards. Use <b>glass</b> for content wrappers and
        panels; use <b>glass-action</b> for anything the user can click or select.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md tablet:flex-row">
        <div class="surface-glass p-lg flex-1 flex flex-col gap-lg">
          <h5>.surface-glass</h5>
          <p class="text-small text-mute">
            Static floating card. No hover interaction. Use for decorative
            wrappers, panels, and content groupings.
          </p>
        </div>

        <div class="surface-glass-action p-lg flex-1 flex flex-col gap-lg">
          <h5>.surface-glass-action</h5>
          <p class="text-small text-mute">
            Interactive floating card. Hover lifts with glow and shadow. Cursor
            becomes pointer. Use for clickable cards and selectable items.
          </p>
        </div>
      </div>
    </div>

    <!-- SUNK SURFACE -->
    <div class="flex flex-col gap-sm">
      <h5>Sunk Surface</h5>
      <p class="text-small text-mute">
        <code>.surface-sunk</code> applies <code>glass-sunk</code> physics: inset
        shadow and recessed background. Use for input groupings, sidebars, or demo
        containers like the ones on this page.
      </p>

      <div class="surface-sunk p-lg flex flex-col gap-md">
        <h5>.surface-sunk</h5>
        <p class="text-small text-mute">
          Recessed container. Inset shadow creates depth. Background uses
          <code>--bg-sink</code> token.
        </p>
      </div>
    </div>

    <!-- SOLID SURFACES -->
    <div class="flex flex-col gap-sm">
      <h5>Solid Surfaces</h5>
      <p class="text-small text-mute">
        Opaque backgrounds with a thin physics border. No blur or shadow.
        <code>.surface-void</code> uses <code>--bg-canvas</code> (the page
        background) &mdash; use for masking overlaps or solid bars.
        <code>.surface-spotlight</code> uses <code>--bg-spotlight</code>
        (slightly lighter) &mdash; use for highlighted sections or active rows.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md tablet:flex-row">
        <div class="surface-void p-lg flex-1 flex flex-col gap-md">
          <h5>.surface-void</h5>
          <p class="text-small text-mute">
            Solid canvas background. Matches the page base.
          </p>
        </div>

        <div class="surface-spotlight p-lg flex-1 flex flex-col gap-md">
          <h5>.surface-spotlight</h5>
          <p class="text-small text-mute">
            Slightly lighter solid background. For active sections and callouts.
          </p>
        </div>
      </div>
    </div>

    <!-- NESTING DEPTH -->
    <div class="flex flex-col gap-sm">
      <h5>Nesting Depth</h5>
      <p class="text-small text-mute">
        Surfaces nest to create visual hierarchy. A floating glass card contains
        a sunk area for inputs or secondary content, which can itself contain
        spotlight rows or void panels. This layering is how real layouts are
        built &mdash; each level communicates depth and purpose.
      </p>

      <div class="surface-glass p-lg flex flex-col gap-md">
        <h5 class="text-dim">Glass panel (outer)</h5>

        <div class="surface-sunk p-md flex flex-col gap-md">
          <p class="text-small text-mute">
            Sunk container (inner) &mdash; recessed area for grouped content
          </p>

          <div class="surface-spotlight p-md flex flex-col gap-xs">
            <p class="text-small">Spotlight row &mdash; highlighted item</p>
          </div>

          <div class="surface-void p-md flex flex-col gap-xs">
            <p class="text-small text-dim">Void row &mdash; baseline item</p>
          </div>
        </div>
      </div>

      <p class="text-caption text-mute px-xs">
        Pattern: <code>.surface-glass</code> &rarr;
        <code>.surface-sunk</code> &rarr;
        <code>.surface-spotlight</code> / <code>.surface-void</code>. This
        three-level nesting covers most real-world layouts.
      </p>
    </div>

    <!-- QUICK REFERENCE -->
    <div class="flex flex-col gap-sm">
      <h5>Quick Reference</h5>

      <div class="surface-sunk p-md">
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Depth</th>
              <th>Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>.surface-glass</code></td>
              <td>Floating</td>
              <td>Panels, cards, content wrappers</td>
            </tr>
            <tr>
              <td><code>.surface-glass-action</code></td>
              <td>Floating</td>
              <td>Clickable cards, selectable items</td>
            </tr>
            <tr>
              <td><code>.surface-sunk</code></td>
              <td>Recessed</td>
              <td>Input areas, demo containers, sidebars</td>
            </tr>
            <tr>
              <td><code>.surface-void</code></td>
              <td>Flush</td>
              <td>Canvas-matching backgrounds, solid bars</td>
            </tr>
            <tr>
              <td><code>.surface-spotlight</code></td>
              <td>Flush</td>
              <td>Highlighted rows, active sections, callouts</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;!-- Floating card (static) --&gt;
&lt;div class="surface-glass p-lg"&gt;Card content&lt;/div&gt;

&lt;!-- Floating card (interactive — lifts on hover) --&gt;
&lt;div class="surface-glass-action p-lg"&gt;Clickable card&lt;/div&gt;

&lt;!-- Recessed container --&gt;
&lt;div class="surface-sunk p-md"&gt;Input area&lt;/div&gt;

&lt;!-- Solid backgrounds --&gt;
&lt;div class="surface-void p-lg"&gt;Canvas match&lt;/div&gt;
&lt;div class="surface-spotlight p-lg"&gt;Highlighted section&lt;/div&gt;

&lt;!-- Nesting pattern --&gt;
&lt;div class="surface-glass p-lg"&gt;
  &lt;div class="surface-sunk p-md"&gt;
    &lt;div class="surface-spotlight p-md"&gt;Highlighted row&lt;/div&gt;
    &lt;div class="surface-void p-md"&gt;Baseline row&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;

&lt;!-- Selectable card --&gt;
&lt;button
  class="surface-glass-action p-lg"
  data-state=&#123;selected ? 'active' : ''&#125;
  aria-pressed=&#123;selected&#125;
  onclick=&#123;() =&gt; (selected = !selected)&#125;
&gt;
  Card content
&lt;/button&gt;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Surfaces only set background, border, and shadow. Combine them with
      Tailwind layout classes (<code>p-lg</code>, <code>flex</code>,
      <code>gap-md</code>) for spacing. All surfaces adapt to glass, flat, and
      retro physics presets automatically.
    </p>
  </div>
</section>
