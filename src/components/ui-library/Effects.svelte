<script lang="ts">
  import { RotateCcw } from '@lucide/svelte';
  import KineticText from '@components/ui/KineticText.svelte';
  import LoadingTextCycler from '@components/ui/LoadingTextCycler.svelte';

  let replayChar = $state(0);
  let replayWord = $state(0);
  let replayDecode = $state(0);
  let replaySpeed = $state(0);
  let replayCursor = $state(0);
</script>

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

    <!-- ─── KINETIC TEXT ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Kinetic Text</h5>
      <p class="text-small text-mute">
        Physics-aware kinetic typography engine with four animation modes.
        Adapts to all physics presets: glass gets smooth glow cursors, flat gets
        clean stepped blinks, retro gets jittery timing and hard block cursors.
        Speed is configurable per instance.
      </p>

      <!-- Typewriter (char mode) -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Typewriter</h6>
          <button class="btn-ghost" onclick={() => replayChar++}>
            <RotateCcw class="icon" data-size="sm" />
          </button>
        </div>
        <div class="surface-sunk p-lg flex flex-col gap-lg">
          {#key replayChar}
            <KineticText
              text="System initializing... all modules online."
              mode="char"
              speed={65}
              cursor
            />
          {/key}
        </div>
        <p class="text-caption text-mute px-xs">
          Character-by-character reveal. Speed: 65ms per character. Retro
          physics adds per-tick timing jitter for a terminal feel.
        </p>
      </div>

      <!-- Paragraph (word mode) -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Paragraph</h6>
          <button class="btn-ghost" onclick={() => replayWord++}>
            <RotateCcw class="icon" data-size="sm" />
          </button>
        </div>
        <div class="surface-sunk p-lg flex flex-col gap-lg">
          {#key replayWord}
            <KineticText
              tag="p"
              text="The void engine processes your request through multiple layers of semantic analysis, pattern matching, and contextual synthesis before materializing the final response. Each layer refines the signal, discarding noise and amplifying intent until the output crystallizes."
              mode="word"
              speed={80}
              cursor
            />
          {/key}
        </div>
        <p class="text-caption text-mute px-xs">
          Word-by-word reveal for longer content. Renders as a
          <code>&lt;p&gt;</code> tag. Faster than char mode for paragraphs while
          maintaining readability.
        </p>
      </div>

      <!-- Decode reveal -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Decode</h6>
          <button class="btn-ghost" onclick={() => replayDecode++}>
            <RotateCcw class="icon" data-size="sm" />
          </button>
        </div>
        <div class="surface-sunk p-lg flex flex-col gap-lg">
          {#key replayDecode}
            <KineticText text="ACCESS GRANTED" mode="decode" speed={30} />
          {/key}
        </div>
        <p class="text-caption text-mute px-xs">
          Scramble-to-resolve effect. Characters resolve progressively from
          random noise. Retro physics uses an uppercase-only character set.
        </p>
      </div>

      <!-- Speed comparison -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Speed Comparison</h6>
          <button class="btn-ghost" onclick={() => replaySpeed++}>
            <RotateCcw class="icon" data-size="sm" />
          </button>
        </div>
        <div class="surface-sunk p-lg flex flex-col gap-md">
          {#key replaySpeed}
            <div class="flex items-center gap-md">
              <span class="text-caption text-mute" style="min-width: 3.5rem;"
                >30ms</span
              >
              <KineticText text="Fast streaming feel" mode="char" speed={30} />
            </div>
            <div class="flex items-center gap-md">
              <span class="text-caption text-mute" style="min-width: 3.5rem;"
                >65ms</span
              >
              <KineticText text="Deliberate typing" mode="char" speed={65} />
            </div>
            <div class="flex items-center gap-md">
              <span class="text-caption text-mute" style="min-width: 3.5rem;"
                >120ms</span
              >
              <KineticText text="Dramatic pacing" mode="char" speed={120} />
            </div>
          {/key}
        </div>
        <p class="text-caption text-mute px-xs">
          Speed is configurable per instance via the <code>speed</code> prop (milliseconds
          per character). Physics multipliers apply on top: flat runs at 0.8x, retro
          adds &plusmn;30% jitter.
        </p>
      </div>

      <!-- Cursor toggle -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Cursor</h6>
          <button class="btn-ghost" onclick={() => replayCursor++}>
            <RotateCcw class="icon" data-size="sm" />
          </button>
        </div>
        <div class="surface-sunk p-lg flex flex-col gap-md">
          {#key replayCursor}
            <div class="flex items-center gap-md">
              <span class="text-caption text-mute" style="min-width: 5rem;"
                >With cursor</span
              >
              <KineticText
                text="Cursor enabled"
                mode="char"
                speed={65}
                cursor
              />
            </div>
            <div class="flex items-center gap-md">
              <span class="text-caption text-mute" style="min-width: 5rem;"
                >No cursor</span
              >
              <KineticText text="Cursor disabled" mode="char" speed={65} />
            </div>
          {/key}
        </div>
        <p class="text-caption text-mute px-xs">
          Cursor is optional via the <code>cursor</code> prop. Glass physics adds
          a glow effect to the cursor; retro uses a hard block blink. Cursor is removed
          automatically after animation completes.
        </p>
      </div>
    </div>

    <!-- ─── LOADING TEXT CYCLER ──────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Loading Text Cycler</h5>
      <p class="text-small text-mute">
        Cycles through a set of loading status words with physics-aware
        enter/exit transitions. &ldquo;Synthesizing&hellip;&rdquo; always
        appears first; remaining words shuffle randomly per mount. Each word
        holds for ~2s before transitioning out.
      </p>

      <div
        class="surface-sunk p-lg flex flex-col items-center justify-center gap-lg"
      >
        <LoadingTextCycler />
      </div>

      <p class="text-caption text-mute px-xs">
        Transitions use <code>in:materialize</code> /
        <code>out:dematerialize</code> &mdash; automatically adapting to glass blur,
        flat sharp, and retro instant physics. Reduced motion: words switch instantly
        with no animation.
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

&lt;!-- Loading text cycler --&gt;
&lt;LoadingTextCycler /&gt;
&lt;LoadingTextCycler interval=&#123;1500&#125; /&gt;

&lt;!-- Kinetic text: typewriter --&gt;
&lt;KineticText text="Hello world" mode="char" speed=&#123;65&#125; cursor /&gt;

&lt;!-- Kinetic text: word-by-word paragraph --&gt;
&lt;KineticText tag="p" text="Long paragraph..." mode="word" speed=&#123;80&#125; cursor /&gt;

&lt;!-- Kinetic text: decode reveal --&gt;
&lt;KineticText text="ACCESS GRANTED" mode="decode" speed=&#123;30&#125; cursor /&gt;

&lt;!-- Kinetic text: cycle through words --&gt;
&lt;KineticText
  words=&#123;['Synthesizing...', 'Calibrating...']&#125;
  mode="cycle"
  cycleTransition="type"
  speed=&#123;65&#125;
  cursor
/&gt;</code
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
