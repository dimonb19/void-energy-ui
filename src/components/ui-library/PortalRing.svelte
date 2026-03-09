<script lang="ts">
  import PortalRing from '@components/icons/PortalRing.svelte';
  import SliderField from '@components/ui/SliderField.svelte';

  let intensity = $state(1);
</script>

<section id="portal-ring" class="flex flex-col gap-md">
  <h2>17 // PORTAL RING</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      The 404 page centerpiece. A pointer-reactive parallax SVG with six
      composited animation layers &mdash; concentric rings, energy arcs, glitch
      segments, orbital markers, particles, and a core text element &mdash; each
      tracking the cursor at a different depth. Adapts to all physics presets
      and color modes.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-md">
        <p>
          <strong>Parallax system:</strong> Six layers with increasing depth multipliers
          &mdash; outer rings (12px), mid rings (18px), inner rings (26px), orbitals
          (15px), particles (20px), core text (32px). A static void-depth gradient
          anchors the center while everything else shifts around it.
        </p>
        <p>
          <strong>Pointer tracking:</strong> While the portal is in the
          viewport, a global <code>pointermove</code> listener normalizes coordinates
          to &minus;1&hellip;1, smoothed via damped interpolation (factor 0.06).
          Bounds are cached and refreshed on resize/scroll shifts instead of on every
          move. A non-repeating sine composition generates organic ring wobble, amplified
          by pointer proximity.
        </p>
        <p>
          <strong>Particles &amp; orbitals:</strong> 12 particles placed via golden-angle
          distribution (deterministic, no randomness). 6 orbital markers rotate on
          the outer ring track. All use CSS keyframe animations with staggered delays.
        </p>
        <p>
          <strong>SVG filters:</strong> Three displacement filters &mdash; glass
          (high-frequency warp, <code>scale="10"</code>), flat (subtle warp,
          <code>scale="14"</code>), and text (gentle warp,
          <code>scale="4"</code>). Applied via CSS custom properties bridging
          dynamic filter IDs to SCSS selectors.
        </p>
        <p>
          <strong>Performance:</strong> <code>will-change: transform</code> on
          animated layers. Delta-time <code>requestAnimationFrame</code> for
          framerate-independent wobble. Respects
          <code>prefers-reduced-motion</code> &mdash; freezes all animations and
          skips the rAF loop entirely.
        </p>
      </div>
    </details>

    <!-- ─── INTERACTIVE DEMO ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Interactive Demo</h5>
      <p class="text-small text-mute">
        Move your cursor anywhere on the page while the portal is visible to
        destabilize it. Each ring layer tracks at a different depth, creating a
        parallax tunnel effect. The closer your cursor to the center, the
        stronger the wobble.
      </p>

      <div class="flex flex-col items-center">
        <PortalRing class="portal-ring-showcase" {intensity} />
      </div>

      <p class="text-caption text-mute px-xs">
        The portal fills its container width (<code>width: 100%</code>,
        <code>height: auto</code>). Constrain with a
        <code>max-width</code> on the parent. Color inherits from
        <code>--energy-primary</code>.
      </p>
    </div>

    <!-- ─── INTENSITY CONTROL ─────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Intensity Control</h5>
      <p class="text-small text-mute">
        The <code>intensity</code> prop multiplies all parallax translations. At
        <code>0</code>
        the portal is static. At <code>1</code> (default) it responds naturally.
        Values above <code>1</code> exaggerate the effect for dramatic presentations.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <SliderField
          bind:value={intensity}
          label="Intensity"
          min={0}
          max={2}
          step={0.1}
        />
        <p class="text-caption text-mute text-center">
          Current: <code>{intensity.toFixed(1)}</code>
        </p>
      </div>

      <p class="text-caption text-mute px-xs">
        Use <code>intensity=&#123;0&#125;</code> to disable pointer interaction
        entirely (e.g., as a static background). Values between
        <code>0.3</code>&ndash;<code>0.7</code> work well for subtle ambient use.
      </p>
    </div>

    <!-- ─── PHYSICS ADAPTATION ────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Physics Adaptation</h5>
      <p class="text-small text-mute">
        The portal adapts its rendering to the active physics preset. Switch
        physics in Settings to see live changes.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <ul class="flex flex-col gap-sm">
          <li>
            <strong>Glass</strong> &mdash; SVG displacement warp +
            <code>drop-shadow</code> bloom glow on rings and particles. Text uses
            a gentler dedicated warp filter.
          </li>
          <li>
            <strong>Flat</strong> &mdash; Subtle displacement warp, no glow. Same
            gentle text filter.
          </li>
          <li>
            <strong>Retro</strong> &mdash; All filters disabled. Animations use
            <code>steps()</code> timing functions. Uniform dash patterns on
            rings. Text switches to <code>--font-code</code>.
          </li>
        </ul>
      </div>

      <p class="text-caption text-mute px-xs">
        Light mode reduces ring opacities for readability on bright backgrounds.
        All physics and mode combinations are supported automatically.
      </p>
    </div>

    <!-- ─── CODE EXAMPLES ─────────────────────────────────────────────── -->
    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;script&gt;
  import PortalRing from '@components/icons/PortalRing.svelte';
&lt;/script&gt;

&lt;!-- Basic usage --&gt;
&lt;PortalRing /&gt;

&lt;!-- Reduced parallax for subtle backgrounds --&gt;
&lt;PortalRing intensity=&#123;0.5&#125; /&gt;

&lt;!-- Static (no pointer interaction) --&gt;
&lt;PortalRing intensity=&#123;0&#125; /&gt;

&lt;!-- Constrained width --&gt;
&lt;div style="max-width: var(--space-5xl)"&gt;
  &lt;PortalRing /&gt;
&lt;/div&gt;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      <strong>Props:</strong> <code>id</code> (SVG DOM ID),
      <code>intensity</code> (parallax multiplier, default
      <code>1</code>), <code>class</code> (consumer classes), plus all
      <code>HTMLAttributes&lt;SVGElement&gt;</code> via rest spread.
      <code>aria-hidden="true"</code> &mdash; decorative only, not announced by screen
      readers.
    </p>
  </div>
</section>

<style lang="scss">
  :global(.portal-ring-showcase) {
    width: 100%;
    max-width: 480px; // void-ignore
  }
</style>
