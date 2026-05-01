<script lang="ts">
  import { TriangleAlert } from '@lucide/svelte';
  import { fontShift } from '@actions/font-shift';
  import { FONTS } from '@config/fonts';
  import { VOID_TOKENS } from '@config/design-tokens';
  import { voidEngine } from '@adapters/void-engine.svelte';

  // Resolve the active heading family. User override (set via the Themes
  // modal) wins; otherwise fall back to the atmosphere's font-atmos-heading
  // from the built-in token registry. The runtime `voidEngine.currentTheme`
  // strips palette data — VOID_TOKENS.themes is the SSOT.
  const activeHeadingFamily = $derived.by(() => {
    const override = voidEngine.userConfig.fontHeading;
    if (override) return override;
    const themeDef =
      VOID_TOKENS.themes[
        voidEngine.atmosphere as keyof typeof VOID_TOKENS.themes
      ];
    return themeDef?.palette?.['font-atmos-heading'] ?? '';
  });

  // Match against the canonical FONTS registry. Unknown families (custom or
  // runtime-registered atmospheres) stay silent rather than claim "static".
  const headingFontDef = $derived(
    Object.values(FONTS).find((def) => def.family === activeHeadingFamily) ??
      null,
  );

  const isStaticHeading = $derived(
    headingFontDef !== null && headingFontDef.variable === undefined,
  );

  const headingDisplayName = $derived(
    activeHeadingFamily.match(/^'([^']+)'/)?.[1] ?? activeHeadingFamily,
  );
</script>

<section id="font-shift" class="flex flex-col gap-md">
  <h2>21 // FONT SHIFT</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Scroll-driven <code>wght</code> modulation via the
      <code>use:fontShift</code> Svelte action. Variable fonts gain a third
      dimension when their weight axis is tied to viewport position &mdash; type
      thickens or thins as elements cross the screen. Each instance uses
      <code>animation-timeline: view()</code>, so there is no JS scroll listener
      and no per-frame work on the main thread.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-md">
        <p>
          The animated custom property <code>--void-font-shift-wght</code> is
          registered once via <code>CSS.registerProperty</code> with
          <code>syntax: '&lt;number&gt;'</code>. Without registration, every
          browser treats custom properties as opaque token streams and flips
          them discretely at 50% &mdash; registration is what makes the value
          interpolate smoothly each frame. The action then reads it via
          <code
            >font-variation-settings: 'wght' var(--void-font-shift-wght)</code
          >.
        </p>
        <p>
          <strong>Atmosphere defaults:</strong> all three physics presets
          default to a generous 100 &rarr; 900 sweep &mdash; only the timing
          function differs. Glass and flat use <code>linear</code>; retro uses
          <code>steps(4, end)</code> for a quantized digital stepping. The
          action queries the resolved font's actual <code>wght</code> axis via
          <code>document.fonts</code> and clamps the defaults to that axis, so a
          font like Space Grotesk (300&ndash;700) animates over its full visible
          range without dead zones. Explicit <code>from</code>/<code>to</code> values
          bypass clamping.
        </p>
        <p>
          <strong>State surfacing</strong> via <code>data-font-shift</code>:
          <code>active</code> (animating), <code>reduced</code>
          (<code>prefers-reduced-motion</code> on &mdash; renders at cascade
          weight),
          <code>static</code> (resolved font has no wght axis &mdash; renders at
          cascade weight). Browsers without view-timeline support (Firefox
          stable) fall back via <code>@supports</code>.
        </p>
        <p>
          <strong>Variable fonts only.</strong> Static fonts hold their cascade
          weight &mdash; the action becomes a no-op. See
          <code>src/config/fonts.ts</code> for the canonical list (entries with
          a <code>variable</code> block).
        </p>
      </div>
    </details>

    {#if isStaticHeading}
      <div
        class="surface-sunk p-md flex flex-row gap-sm items-star"
        role="status"
      >
        <p class="text-small">
          <strong class="text-premium">Static heading font detected.</strong>
          The active atmosphere uses <em>{headingDisplayName}</em>, which has no
          <code>wght</code> axis. Demos below render at their cascade weight. Switch
          to an atmosphere with a variable heading font to see the effect.
        </p>
      </div>
    {/if}

    <!-- ─── HEADING DEMO ───────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Heading</h5>
      <p class="text-small text-mute">
        Apply directly to a display heading. As the element crosses the
        viewport, its weight glides from <em>from</em> to <em>to</em>. Scroll
        slowly to feel the effect.
      </p>

      <div class="surface-sunk p-lg">
        <h2 use:fontShift={{ from: 100, to: 900 }}>
          Type that breathes with the page.
        </h2>
      </div>

      <p class="text-caption text-mute px-xs">
        <code
          >&lt;h2 use:fontShift=&#123;&#123; from: 100, to: 900 &#125;&#125;&gt;</code
        >. Omit <code>from</code>/<code>to</code> to inherit atmosphere defaults
        (auto-clamped to the font's wght axis).
      </p>
    </div>

    <!-- ─── INLINE DEMO ────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Paragraph</h5>
      <p class="text-small text-mute">
        The action also works on smaller type. Wrap a single phrase to add
        weight emphasis without disturbing the surrounding paragraph rhythm.
      </p>

      <div class="surface-sunk p-lg">
        <p class="text-body">
          The action is unobtrusive on body type.
          <strong use:fontShift>This phrase shifts weight as you scroll</strong
          >, even though it lives inside an ordinary paragraph. Subtle on first
          read, deliberate on the second. The atmosphere preset still drives the
          timing function &mdash; retro physics will quantize the shift here
          too, so the inline phrase reads as deliberate digital stepping rather
          than smooth interpolation.
        </p>
      </div>

      <p class="text-caption text-mute px-xs">
        <code>&lt;strong use:fontShift&gt;</code>. Atmosphere defaults
        (100&nbsp;&rarr;&nbsp;900) clamp to the resolved font's actual wght
        axis.
      </p>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;script&gt;
  import &#123; fontShift &#125; from '@actions/font-shift';
&lt;/script&gt;

&lt;!-- Explicit full range --&gt;
&lt;h1 use:fontShift=&#123;&#123; from: 100, to: 900 &#125;&#125;&gt;Type that breathes&lt;/h1&gt;

&lt;!-- Atmosphere defaults (auto-clamped to the font's wght axis) --&gt;
&lt;h2 use:fontShift&gt;Section heading&lt;/h2&gt;

&lt;!-- Inline emphasis inside body type --&gt;
&lt;p&gt;The action works on &lt;strong use:fontShift&gt;short phrases&lt;/strong&gt; too.&lt;/p&gt;

&lt;!-- Custom animation-range --&gt;
&lt;p use:fontShift=&#123;&#123; range: 'entry' &#125;&#125;&gt;...&lt;/p&gt;

&lt;!-- Disabled --&gt;
&lt;p use:fontShift=&#123;&#123; enabled: false &#125;&#125;&gt;...&lt;/p&gt;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Source: <code>src/actions/font-shift.ts</code>. Apply to display copy and
      short emphasized phrases on tall scrollable pages &mdash; the effect needs
      viewport runway to be visible. Use sparingly; stacking it on every heading
      dilutes the effect.
    </p>
  </div>
</section>
