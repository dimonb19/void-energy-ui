<script lang="ts">
  import { RotateCcw } from '@lucide/svelte';
  import KineticText from '@components/ui/KineticText.svelte';
  import LoadingTextCycler from '@components/ui/LoadingTextCycler.svelte';

  let replayChar = $state(0);
  let replayWord = $state(0);
  let replayDecode = $state(0);
  let replaySpeed = $state(0);
  let replayCursor = $state(0);
  let replayCycle = $state(0);
  let replaySentence = $state(0);
  let replaySentencePair = $state(0);
</script>

<section id="kinetic-text" class="flex flex-col gap-md">
  <h2>18 // KINETIC TEXT</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Physics-aware kinetic typography engine with four animation modes:
      character reveal, word reveal (with sentence/sentence-pair chunking),
      scramble-to-decode, and cycling. Adapts to all physics presets
      automatically &mdash; glass gets smooth glow cursors, flat gets clean
      stepped blinks, retro gets jittery timing and hard block cursors.
      <code>LoadingTextCycler</code> is the built-in cycler component &mdash; a KineticText
      consumer pre-wired for loading status messages.
    </p>

    <!-- ─── TYPEWRITER ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <div class="flex items-center justify-between">
        <h6>Typewriter</h6>
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
        Character-by-character reveal. Speed: 65ms per character. Retro physics
        adds per-tick timing jitter for a terminal feel.
      </p>
    </div>

    <!-- ─── PARAGRAPH ───────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <div class="flex items-center justify-between">
        <h6>Paragraph</h6>
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
        <code>&lt;p&gt;</code> tag. Faster than char mode for paragraphs while maintaining
        readability.
      </p>
    </div>

    <!-- ─── SENTENCE CHUNK ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <div class="flex items-center justify-between">
        <h6>Sentence Chunk</h6>
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
        reveals one full sentence. Ideal for AI streaming where responses arrive
        in sentence-sized bursts.
      </p>
    </div>

    <!-- ─── SENTENCE PAIR CHUNK ─────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <div class="flex items-center justify-between">
        <h6>Sentence Pair Chunk</h6>
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
        Two-sentence reveal using <code>chunk="sentence-pair"</code>. Each tick
        reveals a pair of sentences. Use for faster streaming where content
        should appear in larger blocks.
      </p>
    </div>

    <!-- ─── DECODE ──────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <div class="flex items-center justify-between">
        <h6>Decode</h6>
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
        Scramble-to-resolve effect. Characters resolve progressively from random
        noise. Retro physics uses an uppercase-only character set with reduced
        symbols for an authentic CRT look.
      </p>
    </div>

    <!-- ─── SPEED COMPARISON ────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <div class="flex items-center justify-between">
        <h6>Speed Comparison</h6>
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

    <!-- ─── CURSOR ──────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <div class="flex items-center justify-between">
        <h6>Cursor</h6>
        <button class="btn-icon" onclick={() => replayCursor++}>
          <RotateCcw class="icon" data-size="sm" />
        </button>
      </div>
      <div class="surface-sunk p-lg flex flex-col gap-md">
        {#key replayCursor}
          <div class="flex items-center gap-md">
            <span class="text-caption text-mute min-w-3xl">With cursor</span>
            <KineticText text="Cursor enabled" mode="char" speed={65} cursor />
          </div>
          <div class="flex items-center gap-md">
            <span class="text-caption text-mute min-w-3xl">No cursor</span>
            <KineticText text="Cursor disabled" mode="char" speed={65} />
          </div>
        {/key}
      </div>
      <p class="text-caption text-mute px-xs">
        Cursor is optional via the <code>cursor</code> prop. Glass physics adds a
        glow effect to the cursor; retro uses a hard block blink. Cursor is removed
        automatically after animation completes.
      </p>
    </div>

    <!-- ─── CYCLE ───────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <div class="flex items-center justify-between">
        <h6>Cycle</h6>
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

    <!-- ─── LOADING TEXT CYCLER ─────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Loading Text Cycler</h5>
      <p class="text-small text-mute">
        Pre-built cycler component that wraps KineticText&rsquo;s cycle mode.
        Cycles through loading status words using the type transition
        (character-by-character type and erase).
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

    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;!-- Kinetic text: typewriter --&gt;
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

&lt;!-- Loading text cycler --&gt;
&lt;LoadingTextCycler /&gt;
&lt;LoadingTextCycler interval=&#123;1500&#125; /&gt;</code
        ></pre>
    </details>
  </div>
</section>
