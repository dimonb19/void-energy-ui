<script lang="ts">
  import { aura } from '@actions/aura';
  import { extractAura } from '@lib/aura';

  // Six synthesized 320×200 canvas images. Each has a clearly distinct
  // dominant color so cycling produces a visibly different extracted glow.
  // Gradients and radial fills keep the samples readable as "an image"
  // rather than a flat swatch — extraction has to actually pick a hue.
  type Sample = { label: string; draw: (c: HTMLCanvasElement) => void };

  const samples: Sample[] = [
    {
      label: 'Sunset',
      draw: (c) => {
        const ctx = c.getContext('2d')!;
        const g = ctx.createLinearGradient(0, 0, 0, c.height);
        g.addColorStop(0, '#ff7a3a');
        g.addColorStop(0.55, '#c93a6a');
        g.addColorStop(1, '#3a1860');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);
      },
    },
    {
      label: 'Forest',
      draw: (c) => {
        const ctx = c.getContext('2d')!;
        const g = ctx.createLinearGradient(0, 0, c.width, c.height);
        g.addColorStop(0, '#1e5a2e');
        g.addColorStop(1, '#7ab055');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);
      },
    },
    {
      label: 'Ocean',
      draw: (c) => {
        const ctx = c.getContext('2d')!;
        const g = ctx.createLinearGradient(0, 0, 0, c.height);
        g.addColorStop(0, '#56b8e8');
        g.addColorStop(1, '#0d3b66');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);
      },
    },
    {
      label: 'Crimson',
      draw: (c) => {
        const ctx = c.getContext('2d')!;
        const g = ctx.createRadialGradient(
          c.width / 2,
          c.height / 2,
          0,
          c.width / 2,
          c.height / 2,
          c.width / 1.4,
        );
        g.addColorStop(0, '#ff4a4a');
        g.addColorStop(1, '#5a0808');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);
      },
    },
    {
      label: 'Twilight',
      draw: (c) => {
        const ctx = c.getContext('2d')!;
        const g = ctx.createLinearGradient(0, 0, 0, c.height);
        g.addColorStop(0, '#3a2658');
        g.addColorStop(0.5, '#a06adb');
        g.addColorStop(1, '#241147');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);
      },
    },
    {
      label: 'Gold',
      draw: (c) => {
        const ctx = c.getContext('2d')!;
        const g = ctx.createRadialGradient(
          c.width / 2,
          c.height / 2,
          0,
          c.width / 2,
          c.height / 2,
          c.width / 1.2,
        );
        g.addColorStop(0, '#ffce5b');
        g.addColorStop(1, '#7a4a08');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);
      },
    },
  ];

  let dataUrls = $state<string[]>([]);
  let sampleIndex = $state(0);
  let demoImg: HTMLImageElement | undefined = $state();
  let demoColor = $state('#5d8bb8');

  $effect(() => {
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 200;
    dataUrls = samples.map((s) => {
      s.draw(c);
      return c.toDataURL('image/png');
    });
  });

  $effect(() => {
    // Track sampleIndex directly so the effect re-runs on cycle.
    void sampleIndex;
    if (!demoImg) return;
    extractAura(demoImg).then((c) => (demoColor = c));
  });

  function cycleSample() {
    sampleIndex = (sampleIndex + 1) % samples.length;
  }
</script>

<section id="aura" class="flex flex-col gap-md">
  <h2>24 // AURA</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Ambient colored glow that bleeds from a surface into the space around it.
      <code>use:aura</code> attaches a layered atmosphere-reactive box-shadow to
      any element. Active on dark glass and dark flat physics — light mode and
      retro disable the effect. Color defaults to the active atmosphere's
      <code>--energy-primary</code>; pass an explicit hex or extract one from an
      image. Full reference in the cheat sheet.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-md">
        <p>
          Three layers. <strong>Tokens:</strong> five entries at
          <code>:root</code> (<code>--aura-spread-near</code>,
          <code>--aura-spread-far</code>, <code>--aura-opacity-near</code>,
          <code>--aura-opacity-far</code>,
          <code>--aura-transition-duration</code>) define the glow geometry and
          crossfade timing. Single set of values — not physics-adaptive.
          <strong>Action:</strong> <code>use:aura</code> is a state setter only.
          When a <code>color</code> is passed it writes
          <code>--aura-color</code> inline; otherwise it does nothing. Always
          toggles <code>data-aura="on" | "off"</code>.
          <strong>SCSS:</strong> a single global selector
          <code>[data-aura='on']</code> attaches the visual via an
          <code>::after</code> pseudo-element, so it does not clobber
          <code>surface-raised</code>'s own box-shadow lift contract.
        </p>
        <p>
          The glow uses CSS relative color syntax —
          <code
            >rgb(from var(--aura-color, var(--energy-primary)) r g b /
            var(--aura-opacity-near))</code
          >
          — so when no color is set, the
          <code>var()</code> fallback resolves to the active atmosphere's
          primary at compute time. Switching atmospheres re-resolves
          <code>--energy-primary</code>, the box-shadow recomputes, and
          <code>transition: box-shadow</code> handles the crossfade.
        </p>
        <p>
          <strong>Physics &amp; mode gating.</strong> The pseudo-element is
          disabled under <code>@include when-light</code> and
          <code>@include when-retro</code>. The engine's invariants (glass
          forces dark, retro forces dark) mean Aura is reachable on three
          combinations: glass-dark, flat-dark, flat-light — with flat-light
          opting out. So in practice: dark-mode only.
          <strong>Reduced motion.</strong>
          <code>prefers-reduced-motion: reduce</code> collapses the crossfade to
          <code>0s</code>
          — no slow color drift for users opting out of motion.
          <strong>Caveats.</strong> The host gets
          <code>position: relative</code>
          for the pseudo-element. If you need <code>position: absolute</code>
          or <code>fixed</code> on the host, wrap aura on a child instead. On a
          surface that also uses <code>use:navlink</code>, the navlink loading
          shimmer (also <code>::after</code>) temporarily replaces the aura glow
          during navigation — by design.
        </p>
      </div>
    </details>

    <div class="surface-sunk p-md flex flex-col gap-md">
      <div class="flex flex-col gap-xs">
        <h3>Atmosphere-driven default</h3>
        <p class="text-dim text-small">
          No <code>color</code> prop — SCSS falls back to
          <code>var(--energy-primary)</code>. Switch atmospheres in the header
          to recolor every <code>use:aura</code> on the page automatically.
        </p>
      </div>

      <div class="flex items-center justify-center p-2xl">
        <div use:aura class="surface-raised p-lg flex flex-col gap-sm">
          <h4>Atmosphere-tinted</h4>
          <p class="text-dim text-small">
            The surrounding glow tracks the active atmosphere.
          </p>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script lang="ts"&gt;
  import &#123; aura &#125; from '@actions/aura';
&lt;/script&gt;

&lt;div use:aura&gt;
  Surface that glows in the active atmosphere's primary color.
&lt;/div&gt;</code
          ></pre>
      </details>
    </div>

    <div class="surface-sunk p-md flex flex-col gap-md">
      <div class="flex flex-col gap-xs">
        <h3>Extracted from image</h3>
        <p class="text-dim text-small">
          <code>extractAura()</code> samples a dominant color from an image and clamps
          it into a glow-friendly HSL range (saturation ≤ 65%, lightness 35–75%).
          Cycle through the samples to watch the glow follow the image.
        </p>
        <p class="text-mute text-small">
          Built on <code>fast-average-color</code> by Denis Seleznev (MIT, ~3 KB
          gzipped) — handles canvas pixel sampling and image-load orchestration.
          We add HSL clamping to keep AI-generated imagery from producing muddy
          or neon glows, plus a graceful fallback to
          <code>var(--energy-primary)</code> when an image is CORS-tainted or fails
          to decode. Always returns a valid color — never throws.
        </p>
      </div>

      <div class="flex flex-wrap gap-md items-center">
        <button class="btn btn-primary" onclick={cycleSample}>
          Cycle sample ({samples[sampleIndex].label})
        </button>
        <span class="text-mute text-small font-mono">{demoColor}</span>
      </div>

      <div class="flex items-center justify-center p-2xl">
        <div
          use:aura={{ color: demoColor }}
          class="surface-raised p-lg flex flex-col gap-md items-center"
        >
          {#if dataUrls.length > 0}
            <img
              bind:this={demoImg}
              src={dataUrls[sampleIndex]}
              alt={samples[sampleIndex].label}
              width="320"
              height="200"
              class="rounded"
            />
          {/if}
          <p class="text-dim text-small">{samples[sampleIndex].label}</p>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script lang="ts"&gt;
  import &#123; aura &#125; from '@actions/aura';
  import &#123; extractAura &#125; from '@lib/aura';

  let img: HTMLImageElement | undefined = $state();
  let color = $state('#5d8bb8');

  $effect(() =&gt; &#123;
    if (img) extractAura(img).then((c) =&gt; (color = c));
  &#125;);
&lt;/script&gt;

&lt;div use:aura=&#123;&#123; color &#125;&#125;&gt;
  &lt;img bind:this=&#123;img&#125; src="/scene.jpg" alt="" /&gt;
&lt;/div&gt;</code
          ></pre>
      </details>
    </div>
  </div>
</section>
