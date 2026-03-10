<script lang="ts">
  import Skeleton from '@components/ui/Skeleton.svelte';
</script>

<section id="loading-states" class="flex flex-col gap-md">
  <h2>14 // LOADING STATES</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Physics-aware loading indicators. The shimmer system provides two mixins
      &mdash; <code>@include shimmer</code> for container overlays and
      <code>@include text-shimmer</code> for text-clipped gradients &mdash; plus
      the <code>Skeleton</code> component built on top of them. All shimmer-based
      effects share one keyframe and adapt to physics presets and color modes automatically.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-md">
        <p>
          Container shimmer uses a <code>background-image</code> gradient
          animated via <code>background-position</code> (400% width, 4s infinite
          linear), applied to a <code>::before</code> pseudo-element with
          <code>position: absolute; inset: 0</code>. Text shimmer uses a
          focused-beam technique: two-layer <code>background-clip: text</code>
          with a solid muted base and a narrow bright beam that sweeps across (250%
          width, 3s).
        </p>
        <p>
          <strong>Container &mdash; Glass/Flat dark:</strong> energy-primary at
          15%.
          <strong>Light:</strong> full white.
          <strong>Retro:</strong> 2% scan line.
          <strong>Text &mdash; Dark:</strong> energy-primary beam over muted
          base.
          <strong>Light:</strong> text-main beam.
          <strong>Retro:</strong> sharp scan-line beam.
        </p>
      </div>
    </details>

    <!-- ─── TEXT SHIMMER ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Text Shimmer</h5>
      <p class="text-small text-mute">
        <code>@include text-shimmer</code> uses a focused-beam technique: a
        solid muted base layer with a narrow bright beam that sweeps across text
        glyphs via <code>background-clip: text</code>. Use on any text element
        during loading states.
      </p>

      <div class="surface-sunk p-lg flex flex-col gap-lg">
        <h3 class="text-shimmer">Generating response...</h3>
        <p class="text-shimmer">
          Analyzing project structure and preparing recommendations. This may
          take a moment while we process your request.
        </p>
        <p class="text-small text-shimmer">
          Loading configuration &mdash; please wait
        </p>
      </div>

      <p class="text-caption text-mute px-xs">
        Apply <code>.text-shimmer</code> class or
        <code>@include text-shimmer</code> in SCSS. Physics-aware: energy beam in
        dark/glass, text-main beam in light, sharp scan-line in retro.
      </p>
    </div>

    <!-- ─── CONTAINER SHIMMER ────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Container Shimmer</h5>
      <p class="text-small text-mute">
        <code>@include shimmer</code> sweeps a light band across a surface
        background. Apply via a <code>::before</code> pseudo-element for
        skeleton loaders. The shimmer clips to the container's
        <code>border-radius</code>.
      </p>

      <div class="surface-sunk p-lg flex flex-col gap-lg">
        <!-- Row of shaped containers -->
        <div class="flex flex-wrap gap-lg items-end">
          <!-- Card -->
          <div class="shimmer-surface surface-glass w-5xl h-4xl"></div>

          <!-- Pill -->
          <div
            class="shimmer-surface surface-glass rounded-full w-5xl h-xl"
          ></div>

          <!-- Square -->
          <div class="shimmer-surface surface-glass w-2xl h-2xl"></div>

          <!-- Circle -->
          <div
            class="shimmer-surface surface-glass rounded-full w-2xl h-2xl"
          ></div>
        </div>

        <!-- Wide bar -->
        <div class="shimmer-surface surface-glass h-xl"></div>
      </div>

      <p class="text-caption text-mute px-xs">
        The shimmer gradient inherits <code>border-radius</code> from the
        container. Use on cards, pills, bars, circles &mdash; any shape. The
        <code>.shimmer-surface</code> class adds
        <code>position: relative; overflow: hidden</code> and a
        <code>::before</code> overlay with the shimmer animation.
      </p>
    </div>

    <!-- ─── SKELETON LOADING ──────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Skeleton Loading</h5>
      <p class="text-small text-mute">
        Placeholder shapes that shimmer while content loads. Built on the same
        shimmer infrastructure as other loading effects. Four variants: text
        lines, avatars, cards, and paragraphs.
      </p>

      <div class="surface-sunk p-lg flex flex-col gap-lg">
        <!-- Single text line -->
        <Skeleton variant="text" />

        <!-- Avatar + text combo -->
        <div class="flex flex-row items-center gap-md">
          <Skeleton variant="avatar" />
          <div class="flex flex-col gap-sm flex-1">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>

        <!-- Card -->
        <Skeleton variant="card" />

        <!-- Paragraph -->
        <Skeleton variant="paragraph" lines={4} />
      </div>

      <p class="text-caption text-mute px-xs">
        Use <code>&lt;Skeleton variant="text|avatar|card|paragraph" /&gt;</code
        >. Override dimensions with <code>width</code> and <code>height</code>
        props. Paragraph variant accepts a <code>lines</code> prop (default 3).
      </p>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;!-- Text shimmer --&gt;
&lt;h3 class="text-shimmer"&gt;Loading...&lt;/h3&gt;
&lt;p class="text-shimmer"&gt;Processing your request...&lt;/p&gt;

&lt;!-- Container shimmer (skeleton loader) --&gt;
&lt;div class="shimmer-surface surface-glass" style="height: 8rem"&gt;&lt;/div&gt;

&lt;!-- SCSS usage --&gt;
.loading-label &#123;
  @include text-shimmer;
&#125;

.skeleton-card &#123;
  position: relative;
  overflow: hidden;

  &amp;::before &#123;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    @include shimmer;
  &#125;
&#125;

&lt;!-- Skeleton loading --&gt;
&lt;Skeleton variant="text" /&gt;
&lt;Skeleton variant="avatar" /&gt;
&lt;Skeleton variant="card" /&gt;
&lt;Skeleton variant="paragraph" lines=&#123;4&#125; /&gt;
&lt;Skeleton variant="text" width="60%" /&gt;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Shimmer mixins are defined in
      <code>src/styles/abstracts/_mixins.scss</code>. Container shimmer uses the
      <code>shimmer</code>
      keyframe (4s infinite linear); text shimmer uses a separate
      <code>shimmer-beam</code>
      keyframe (2s infinite linear). Reduced motion: animation stops globally via
      <code>_accessibility.scss</code>, text falls back to static 30%
      <code>--text-main</code>.
    </p>
  </div>
</section>
