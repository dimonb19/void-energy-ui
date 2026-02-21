<section id="effects" class="flex flex-col gap-md">
  <h2>11 // EFFECTS</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Physics-aware visual effects for loading states. The shimmer system
      provides two mixins: <code>@include shimmer</code> for container overlays
      and <code>@include text-shimmer</code> for text-clipped gradients. Both reuse
      the same keyframe and adapt to all physics presets and color modes automatically.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-md">
        <p>
          Both shimmer variants use a <code>background-image</code> gradient
          animated via <code>background-position</code> (400% width, 4s infinite
          linear). Container shimmer applies to a
          <code>::before</code> pseudo-element with
          <code>position: absolute; inset: 0</code>. Text shimmer composes
          <code>@include shimmer</code> with
          <code>background-clip: text</code> to clip the same gradient to text glyphs,
          with text at 30% opacity as the base.
        </p>
        <p>
          <strong>Glass/Flat dark:</strong> energy-primary at 15%.
          <strong>Light:</strong> full white.
          <strong>Retro:</strong> 2% scan line using border-color. Text shimmer inherits
          the same physics variants &mdash; it just clips the gradient to glyphs
          instead of the surface.
        </p>
      </div>
    </details>

    <!-- ─── TEXT SHIMMER ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Text Shimmer</h5>
      <p class="text-small text-mute">
        <code>@include text-shimmer</code> composes
        <code>@include shimmer</code> with <code>background-clip: text</code>
        to clip the gradient to text glyphs. Text renders at 30% opacity with the
        shimmer band sweeping across. Use on any text element during loading states.
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
        <code>@include text-shimmer</code> in SCSS. Inherits all physics
        variants from <code>@include shimmer</code> automatically.
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
          <div
            class="shimmer-surface surface-glass"
            style="width: 10rem; height: 8rem;"
          ></div>

          <!-- Pill -->
          <div
            class="shimmer-surface surface-glass rounded-full"
            style="width: 10rem; height: 2.5rem;"
          ></div>

          <!-- Square -->
          <div
            class="shimmer-surface surface-glass"
            style="width: 4rem; height: 4rem;"
          ></div>

          <!-- Circle -->
          <div
            class="shimmer-surface surface-glass rounded-full"
            style="width: 4rem; height: 4rem;"
          ></div>
        </div>

        <!-- Wide bar -->
        <div
          class="shimmer-surface surface-glass"
          style="height: 2.5rem;"
        ></div>
      </div>

      <p class="text-caption text-mute px-xs">
        The shimmer gradient inherits <code>border-radius</code> from the
        container. Use on cards, pills, bars, circles &mdash; any shape. The
        <code>.shimmer-surface</code> class adds
        <code>position: relative; overflow: hidden</code> and a
        <code>::before</code> overlay with the shimmer animation.
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
&#125;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Both mixins are defined in
      <code>src/styles/abstracts/_mixins.scss</code>. They reuse the
      <code>shimmer</code> keyframe (4s infinite linear). Reduced motion:
      animation stops globally via <code>_accessibility.scss</code>, text falls
      back to static 30% <code>--text-main</code>.
    </p>
  </div>
</section>
