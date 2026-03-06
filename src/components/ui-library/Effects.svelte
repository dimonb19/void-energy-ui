<script lang="ts">
  import { RotateCcw, Plus } from '@lucide/svelte';
  import Restart from '@components/icons/Restart.svelte';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import KineticText from '@components/ui/KineticText.svelte';
  import LoadingTextCycler from '@components/ui/LoadingTextCycler.svelte';
  import Skeleton from '@components/ui/Skeleton.svelte';
  import { morph } from '@actions/morph';
  import { navlink } from '@actions/navlink';
  import {
    emerge,
    dissolve,
    materialize,
    dematerialize,
    implode,
    live,
  } from '@lib/transitions.svelte';

  let replayChar = $state(0);
  let replayWord = $state(0);
  let replayDecode = $state(0);
  let replaySpeed = $state(0);
  let replayCursor = $state(0);
  let replayCycle = $state(0);
  let replaySentence = $state(0);
  let replaySentencePair = $state(0);

  // Morph demo
  let morphExpanded = $state(false);

  // Transition demos
  let showEmerge = $state(false);
  let showMaterialize = $state(false);
  let implodeItems = $state(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon']);
  let implodeNextId = $state(6);

  function shuffleImplodeItems() {
    const shuffled = [...implodeItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    implodeItems = shuffled;
  }

  function addImplodeItem() {
    implodeItems = [...implodeItems, `Item ${implodeNextId++}`];
  }

  function resetImplodeItems() {
    implodeItems = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
    implodeNextId = 6;
  }
</script>

<section id="effects" class="flex flex-col gap-md">
  <h2>13 // EFFECTS</h2>

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
    <div class="flex flex-col gap-md">
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
    <div class="flex flex-col gap-md">
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

    <!-- ─── KINETIC TEXT ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
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
          <button class="btn-icon" onclick={() => replayChar++}>
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
          <button class="btn-icon" onclick={() => replayWord++}>
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

      <!-- Sentence chunk (word mode) -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Sentence Chunk</h6>
          <button class="btn-icon" onclick={() => replaySentence++}>
            <RotateCcw class="icon" data-size="sm" />
          </button>
        </div>
        <div class="surface-sunk p-lg flex flex-col gap-lg">
          {#key replaySentence}
            <KineticText
              tag="p"
              text="The void engine processes your request through multiple layers of semantic analysis. It identifies patterns across dimensional boundaries and cross-references them with known signal archetypes. Each refinement pass discards noise and amplifies intent, narrowing the solution space. Contextual synthesis then weaves the surviving fragments into a coherent response. The final output materializes once all layers converge and the signal stabilizes. This entire pipeline executes in fractions of a second, invisible to the observer."
              mode="word"
              chunk="sentence"
              speed={400}
              cursor
            />
          {/key}
        </div>
        <p class="text-caption text-mute px-xs">
          Sentence-level reveal using <code>chunk="sentence"</code>. Each tick
          reveals one full sentence. Ideal for AI streaming where responses
          arrive in sentence-sized bursts.
        </p>
      </div>

      <!-- Sentence-pair chunk (word mode) -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Sentence Pair Chunk</h6>
          <button class="btn-icon" onclick={() => replaySentencePair++}>
            <RotateCcw class="icon" data-size="sm" />
          </button>
        </div>
        <div class="surface-sunk p-lg flex flex-col gap-lg">
          {#key replaySentencePair}
            <KineticText
              tag="p"
              text="The void engine processes your request through multiple layers of semantic analysis. It identifies patterns across dimensional boundaries and cross-references them with known signal archetypes. Each refinement pass discards noise and amplifies intent, narrowing the solution space. Contextual synthesis then weaves the surviving fragments into a coherent response. The final output materializes once all layers converge and the signal stabilizes. This entire pipeline executes in fractions of a second, invisible to the observer."
              mode="word"
              chunk="sentence-pair"
              speed={600}
              cursor
            />
          {/key}
        </div>
        <p class="text-caption text-mute px-xs">
          Two-sentence reveal using <code>chunk="sentence-pair"</code>. Each
          tick reveals a pair of sentences. Use for faster streaming where
          content should appear in larger blocks.
        </p>
      </div>

      <!-- Decode reveal -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Decode</h6>
          <button class="btn-icon" onclick={() => replayDecode++}>
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
          random noise. Retro physics uses an uppercase-only character set with
          reduced symbols for an authentic CRT look.
        </p>
      </div>

      <!-- Speed comparison -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Speed Comparison</h6>
          <button class="btn-icon" onclick={() => replaySpeed++}>
            <RotateCcw class="icon" data-size="sm" />
          </button>
        </div>
        <div class="surface-sunk p-lg flex flex-col gap-md">
          {#key replaySpeed}
            <div class="flex items-center gap-md">
              <span class="text-caption text-mute min-w-2xl">30ms</span>
              <KineticText text="Fast streaming feel" mode="char" speed={30} />
            </div>
            <div class="flex items-center gap-md">
              <span class="text-caption text-mute min-w-2xl">65ms</span>
              <KineticText text="Deliberate typing" mode="char" speed={65} />
            </div>
            <div class="flex items-center gap-md">
              <span class="text-caption text-mute min-w-2xl">120ms</span>
              <KineticText text="Dramatic pacing" mode="char" speed={120} />
            </div>
          {/key}
        </div>
        <p class="text-caption text-mute px-xs">
          Speed is configurable per instance via the <code>speed</code> prop (milliseconds
          per unit). Physics multipliers apply on top: flat slows to 0.8&times; speed,
          retro keeps normal speed but adds &plusmn;30% per-tick jitter.
        </p>
      </div>

      <!-- Cursor toggle -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Cursor</h6>
          <button class="btn-icon" onclick={() => replayCursor++}>
            <RotateCcw class="icon" data-size="sm" />
          </button>
        </div>
        <div class="surface-sunk p-lg flex flex-col gap-md">
          {#key replayCursor}
            <div class="flex items-center gap-md">
              <span class="text-caption text-mute min-w-3xl">With cursor</span>
              <KineticText
                text="Cursor enabled"
                mode="char"
                speed={65}
                cursor
              />
            </div>
            <div class="flex items-center gap-md">
              <span class="text-caption text-mute min-w-3xl">No cursor</span>
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

      <!-- Cycle mode -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <h6 class="text-small text-dim">Cycle</h6>
          <button class="btn-icon" onclick={() => replayCycle++}>
            <RotateCcw class="icon" data-size="sm" />
          </button>
        </div>
        <div class="surface-sunk p-lg flex flex-col gap-lg">
          {#key replayCycle}
            <KineticText
              words={[
                'Initializing...',
                'Calibrating...',
                'Optimizing...',
                'Deploying...',
              ]}
              mode="cycle"
              cycleTransition="type"
              speed={55}
              cursor
              loop
            />
          {/key}
        </div>
        <p class="text-caption text-mute px-xs">
          Cycles through a <code>words</code> array using the
          <code>cycleTransition="type"</code> animation (type in, pause, erase,
          next word). The <code>loop</code> prop restarts after all words are shown.
          Use this mode directly for custom loading messages or status rotations.
        </p>
      </div>
    </div>

    <!-- ─── LOADING TEXT CYCLER ──────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Loading Text Cycler</h5>
      <p class="text-small text-mute">
        Cycles through a set of loading status words using the kinetic
        action&rsquo;s type transition (character-by-character type and erase).
        &ldquo;Synthesizing&hellip;&rdquo; always appears first; remaining words
        shuffle randomly per mount. Each word holds for ~2s before cycling.
      </p>

      <div
        class="surface-sunk p-lg flex flex-col items-center justify-center gap-lg"
      >
        <LoadingTextCycler />
      </div>

      <p class="text-caption text-mute px-xs">
        Uses the kinetic action&rsquo;s <code>cycleTransition="type"</code>
        &mdash; each word is typed in character-by-character, then erased before
        the next. Timing adapts to physics: glass runs smooth, flat slows to 0.8x,
        retro adds &plusmn;30% per-tick jitter. Reduced motion: words switch instantly
        with no animation.
      </p>
    </div>

    <!-- ─── SKELETON LOADING ──────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
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

    <!-- ─── SVELTE ACTIONS ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Svelte Actions</h5>
      <p class="text-small text-mute">
        Reusable directives that add behavior to any element via
        <code>use:action</code>. These are the building blocks behind several
        composite components.
      </p>

      <!-- Morph -->
      <div class="flex flex-col gap-xs">
        <h6 class="text-small text-dim">use:morph</h6>
        <p class="text-small text-mute">
          Content-driven resize animation. Watches a container via
          <code>ResizeObserver</code> and smoothly animates
          <code>width</code> and/or <code>height</code> changes using FLIP transitions.
          Click the button below to toggle content length.
        </p>
        <div class="surface-sunk p-md flex flex-col gap-md">
          <button onclick={() => (morphExpanded = !morphExpanded)}>
            {morphExpanded ? 'Collapse' : 'Expand'}
          </button>
          <div
            class="surface-glass p-md"
            use:morph={{ height: true, width: false, threshold: 2 }}
          >
            {#if morphExpanded}
              <p class="text-small">
                The void engine processes your request through multiple layers
                of semantic analysis, pattern matching, and contextual synthesis
                before materializing the final response. Each layer refines the
                signal, discarding noise and amplifying intent until the output
                crystallizes into form.
              </p>
            {:else}
              <p class="text-small">Compact content.</p>
            {/if}
          </div>
        </div>
        <p class="text-caption text-mute px-xs">
          Options: <code>height</code>, <code>width</code> (booleans),
          <code>threshold</code> (minimum px change to animate). Reads
          <code>--speed-base</code> and <code>--ease-spring-gentle</code>
          from CSS tokens. Retro physics: instant. Reduced motion: instant.
        </p>
      </div>

      <!-- Navlink -->
      <div class="flex flex-col gap-xs">
        <h6 class="text-small text-dim">use:navlink</h6>
        <p class="text-small text-mute">
          Sets <code>data-status="loading"</code> and
          <code>aria-busy="true"</code> on click for MPA navigation links. The DOM
          is replaced on page load, clearing the state naturally. Click the link
          below &mdash; the loading state appears until the browser navigates.
        </p>
        <div class="surface-sunk p-md flex justify-center">
          <a href="/components" class="link" use:navlink>
            Reload this page (with loading state)
          </a>
        </div>
        <p class="text-caption text-mute px-xs">
          No options. Skips modified clicks (Ctrl/Cmd, Shift, middle button).
          Pair with SCSS <code>@include when-state('loading')</code> for visual feedback.
        </p>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import &#123; morph &#125; from '@actions/morph';
  import &#123; navlink &#125; from '@actions/navlink';
&lt;/script&gt;

&lt;!-- Morph: smooth height animation on content change --&gt;
&lt;div use:morph=&#123;&#123; height: true, width: false, threshold: 2 &#125;&#125;&gt;
  &#123;#if expanded&#125;
    &lt;p&gt;Long content...&lt;/p&gt;
  &#123;:else&#125;
    &lt;p&gt;Short content.&lt;/p&gt;
  &#123;/if&#125;
&lt;/div&gt;

&lt;!-- Navlink: loading state on navigation --&gt;
&lt;a href="/page" use:navlink&gt;Go to page&lt;/a&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─── SVELTE TRANSITIONS ─────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Svelte Transitions</h5>
      <p class="text-small text-mute">
        Physics-aware motion primitives for Svelte&rsquo;s <code>in:</code>,
        <code>out:</code>, and <code>animate:</code> directives. Each transition
        reads the active physics preset (glass/flat/retro) and adapts timing, easing,
        and filters automatically.
      </p>

      <!-- emerge / dissolve -->
      <div class="flex flex-col gap-xs">
        <h6 class="text-small text-dim">in:emerge &amp; out:dissolve</h6>
        <p class="text-small text-mute">
          Layout-aware entry/exit pair. Animates height, padding, and margin
          alongside blur, scale, and Y-translate &mdash; surrounding content
          reflows smoothly. Use for elements in normal document flow.
        </p>
        <div class="surface-sunk p-md flex flex-col gap-md">
          <button onclick={() => (showEmerge = !showEmerge)}>
            {showEmerge ? 'Remove' : 'Show'} element
          </button>
          <p class="text-small text-mute">Content above</p>
          {#if showEmerge}
            <div class="surface-glass p-md" in:emerge out:dissolve>
              <p class="text-small">
                This block grows into the layout on entry and collapses out on
                exit. Notice how the content below shifts smoothly.
              </p>
            </div>
          {/if}
          <p class="text-small text-mute">Content below</p>
        </div>
        <p class="text-caption text-mute px-xs">
          Glass: blur + scale + Y + height growth/collapse. Flat: same without
          blur. Retro: instant (0ms). Options: <code>delay</code>,
          <code>duration</code>, <code>y</code> (translate distance, default 15px).
        </p>
      </div>

      <!-- materialize / dematerialize -->
      <div class="flex flex-col gap-xs">
        <h6 class="text-small text-dim">
          in:materialize &amp; out:dematerialize
        </h6>
        <p class="text-small text-mute">
          Visual-only entry/exit pair for positioned or overlaid elements
          (modals, tooltips, toasts). No layout animation &mdash; just opacity,
          blur, scale, and Y-translate.
        </p>
        <div class="surface-sunk p-md flex flex-col gap-md">
          <button onclick={() => (showMaterialize = !showMaterialize)}>
            {showMaterialize ? 'Dematerialize' : 'Materialize'}
          </button>
          <div class="relative h-4xl">
            {#if showMaterialize}
              <div
                class="surface-glass p-md absolute inset-x-0 top-0"
                in:materialize
                out:dematerialize
              >
                <p class="text-small">
                  This element fades in with scale and blur &mdash; no layout
                  shift. Used for modals, tooltips, and toast notifications.
                </p>
              </div>
            {/if}
          </div>
        </div>
        <p class="text-caption text-mute px-xs">
          Glass: blur fade + scale + Y. Flat: sharp fade + scale (no blur).
          Retro: instant opacity in, stepped grayscale dissolve out. Same
          <code>delay</code>, <code>duration</code>, <code>y</code> options.
        </p>
      </div>

      <!-- implode + live -->
      <div class="flex flex-col gap-xs">
        <h6 class="text-small text-dim">out:implode &amp; animate:live</h6>
        <p class="text-small text-mute">
          <code>out:implode</code> collapses a removed element horizontally
          (width, padding, margin &rarr; zero) with blur dissolution.
          <code>animate:live</code> is a FLIP reflow animation that smoothly
          slides remaining items into their new positions. Used together, they
          create seamless list removal &mdash; the exiting item collapses while
          siblings glide to fill the gap. Click a chip to remove it; use Shuffle
          and Add to see <code>animate:live</code> reflow.
        </p>
        <div class="surface-sunk p-md flex flex-col gap-md">
          <div class="flex gap-md">
            <button class="btn-system" onclick={shuffleImplodeItems}>
              Shuffle
            </button>
            <ActionBtn
              class="btn-success"
              icon={Plus}
              text="Add"
              size="sm"
              onclick={addImplodeItem}
            />
            <ActionBtn
              icon={Restart}
              text="Reset"
              size="sm"
              onclick={resetImplodeItems}
            />
          </div>
          <div class="flex flex-wrap gap-sm" use:morph={{ height: true }}>
            {#each implodeItems as item (item)}
              <button
                class="chip"
                animate:live
                onclick={() =>
                  (implodeItems = implodeItems.filter((i) => i !== item))}
                out:implode
              >
                {item}
              </button>
            {/each}
          </div>
          {#if implodeItems.length === 0}
            <p class="text-mute text-center text-small">All removed</p>
          {/if}
        </div>
        <p class="text-caption text-mute px-xs">
          <code>implode</code> uses <code>speedFast</code> timing with blur
          (glass/flat) or grayscale (retro). <code>live</code> wraps
          Svelte&rsquo;s <code>flip</code> with physics-aware defaults (<code
            >speedBase</code
          >
          timing, stepped easing in retro). Both require stable keys on the
          <code>&#123;#each&#125;</code> block.
        </p>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import &#123; emerge, dissolve, materialize, dematerialize, implode, live &#125; from '@lib/transitions.svelte';
&lt;/script&gt;

&lt;!-- Layout-aware entry/exit (normal flow) --&gt;
&#123;#if visible&#125;
  &lt;div in:emerge out:dissolve&gt;
    Content grows in, collapses out.
  &lt;/div&gt;
&#123;/if&#125;

&lt;!-- Visual-only entry/exit (positioned/overlay) --&gt;
&#123;#if visible&#125;
  &lt;div class="absolute" in:materialize out:dematerialize&gt;
    Fades in with blur + scale, floats up on exit.
  &lt;/div&gt;
&#123;/if&#125;

&lt;!-- Implode + live: collapse removed item, reflow siblings --&gt;
&#123;#each items as item (item)&#125;
  &lt;button animate:live out:implode onclick=&#123;() =&gt; remove(item)&#125;&gt;
    &#123;item&#125;
  &lt;/button&gt;
&#123;/each&#125;</code
          ></pre>
      </details>
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
&lt;Skeleton variant="text" width="60%" /&gt;

&lt;!-- Loading text cycler --&gt;
&lt;LoadingTextCycler /&gt;
&lt;LoadingTextCycler interval=&#123;1500&#125; /&gt;

&lt;!-- Kinetic text: typewriter --&gt;
&lt;KineticText text="Hello world" mode="char" speed=&#123;65&#125; cursor /&gt;

&lt;!-- Kinetic text: word-by-word paragraph --&gt;
&lt;KineticText tag="p" text="Long paragraph..." mode="word" speed=&#123;80&#125; cursor /&gt;

&lt;!-- Kinetic text: sentence-level reveal --&gt;
&lt;KineticText tag="p" text="First sentence. Second sentence." mode="word" chunk="sentence" speed=&#123;300&#125; cursor /&gt;

&lt;!-- Kinetic text: sentence-pair reveal --&gt;
&lt;KineticText tag="p" text="First. Second. Third. Fourth." mode="word" chunk="sentence-pair" speed=&#123;500&#125; cursor /&gt;

&lt;!-- Kinetic text: decode reveal --&gt;
&lt;KineticText text="ACCESS GRANTED" mode="decode" speed=&#123;30&#125; cursor /&gt;

&lt;!-- Kinetic text: cycle through words --&gt;
&lt;KineticText
  words=&#123;['Synthesizing...', 'Calibrating...']&#125;
  mode="cycle"
  cycleTransition="type"
  speed=&#123;65&#125;
  cursor
/&gt;

&lt;!-- Actions --&gt;
&lt;div use:morph=&#123;&#123; height: true &#125;&#125;&gt;...&lt;/div&gt;
&lt;a href="/page" use:navlink&gt;Link&lt;/a&gt;

&lt;!-- Transitions --&gt;
&lt;div in:emerge out:dissolve&gt;Layout-aware enter/exit&lt;/div&gt;
&lt;div in:materialize out:dematerialize&gt;Overlay enter/exit&lt;/div&gt;
&lt;span out:implode&gt;Horizontal collapse&lt;/span&gt;
&#123;#each items as item (item.id)&#125;
  &lt;div animate:live&gt;&#123;item.name&#125;&lt;/div&gt;
&#123;/each&#125;</code
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
