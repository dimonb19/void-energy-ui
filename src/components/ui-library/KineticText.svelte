<script lang="ts">
  import Restart from '@components/icons/Restart.svelte';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import Selector from '@components/ui/Selector.svelte';
  import { kinetic } from '@actions/kinetic';
  import { morph } from '@actions/morph';

  // ── Char mode ───────────────────────────────────────────────
  let charKey = $state(0);

  // ── Word mode ───────────────────────────────────────────────
  let wordKey = $state(0);

  // ── Cycle mode ──────────────────────────────────────────────
  let cycleTransition = $state<'type' | 'fade' | 'decode'>('type');
  let cycleKey = $state(0);

  const cycleWords = [
    'Synthesizing reality…',
    'Calibrating atmosphere…',
    'Traversing the void…',
    'Decoding signal…',
    'Materializing response…',
  ];

  const cycleTransitionOptions = [
    { value: 'type', label: 'Type' },
    { value: 'fade', label: 'Fade' },
    { value: 'decode', label: 'Decode' },
  ];

  // ── Decode mode ─────────────────────────────────────────────
  let decodeKey = $state(0);

  // ── Speed tiers ─────────────────────────────────────────────
  // slow/default/fast map to named presets; instant uses explicit ms values.
  type SpeedTier = 'slow' | 'default' | 'fast' | 'instant';
  let speedTier = $state<SpeedTier>('default');

  const INSTANT_SPEED = { speed: 4, charSpeed: 0 };

  const speedConfig = $derived(
    speedTier === 'instant'
      ? INSTANT_SPEED
      : { speedPreset: speedTier as KineticSpeedPreset },
  );

  const speedOptions = [
    { value: 'slow', label: 'Slow' },
    { value: 'default', label: 'Default' },
    { value: 'fast', label: 'Fast' },
    { value: 'instant', label: 'Instant' },
  ];
</script>

<section id="kinetic-text" class="flex flex-col gap-md">
  <h2>19 // KINETIC TEXT</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Physics-aware text animation via the <code>use:kinetic</code> Svelte action.
      Four modes &mdash; typewriter, word-by-word, cycling rotation, and scramble-to-resolve
      &mdash; each adapting to the active physics preset. Flat runs 20% faster with
      fewer scramble passes. Retro adds tick-delay jitter and uses uppercase-only
      scramble characters. Glass is the smooth default.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-md">
        <p>
          The kinetic engine is an imperative <code>KineticEngine</code> class
          exposed as a Svelte action. It reads <code>data-physics</code> from
          the <code>&lt;html&gt;</code> element to derive a physics profile
          (speed multiplier, scramble character set, delay variance, forced
          cycle transition). Speed presets (<code>slow</code>,
          <code>default</code>, <code>fast</code>) set base timing; explicit
          <code>speed</code>/<code>charSpeed</code> values override them.
        </p>
        <p>
          <strong>Reduced motion:</strong> when
          <code>prefers-reduced-motion: reduce</code> is active, all modes skip directly
          to the final text with no animation.
        </p>
        <p>
          <strong>Standalone usage:</strong> the exported
          <code>typewrite(el, text, options)</code> helper returns a Promise
          with an <code>abort()</code> method for non-Svelte contexts.
        </p>
      </div>
    </details>

    <!-- ─── SPEED PRESET SELECTOR ──────────────────────────────────── -->
    <Selector
      aria-label="Speed preset"
      label="Speed preset"
      options={speedOptions}
      bind:value={speedTier}
    />

    <!-- ─── CHAR MODE ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <div class="flex items-center justify-between">
        <h5>Char Mode</h5>
        <ActionBtn
          icon={Restart}
          text="Replay"
          size="sm"
          onclick={() => charKey++}
        />
      </div>
      <p class="text-small text-mute">
        Classic typewriter effect. Each character appears one at a time with
        physics-adapted timing. The simplest mode &mdash; ideal for short
        headings and status messages.
      </p>

      <div class="surface-sunk p-lg flex flex-col gap-md" use:morph>
        {#key charKey}
          <h3
            aria-label="Initializing void engine…"
            use:kinetic={{
              text: 'Initializing void engine…',
              mode: 'char',
              ...speedConfig,
            }}
          ></h3>
          <p
            class="text-dim"
            use:kinetic={{
              text: 'The system calibrates atmospheric density, aligns physics presets, and resolves token hierarchies before rendering begins.',
              mode: 'char',
              ...speedConfig,
              delay: 600,
            }}
          ></p>
        {/key}
      </div>

      <p class="text-caption text-mute px-xs">
        <code
          >use:kinetic=&#123;&#123; text: '…', mode: 'char', speedPreset:
          'default' &#125;&#125;</code
        >. Use <code>delay</code> to stagger multiple elements.
      </p>
    </div>

    <!-- ─── WORD MODE ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <div class="flex items-center justify-between">
        <h5>Word Mode</h5>
        <ActionBtn
          icon={Restart}
          text="Replay"
          size="sm"
          onclick={() => wordKey++}
        />
      </div>
      <p class="text-small text-mute">
        Word-by-word reveal with rapid character fill within each chunk.
        Simulates streaming text output &mdash; ideal for longer paragraphs
        where char-by-char would be too slow.
      </p>

      <div class="surface-sunk p-lg" use:morph>
        {#key wordKey}
          <p
            class="text-dim"
            use:kinetic={{
              text: 'The void engine processes your request through multiple layers of semantic analysis, pattern matching, and contextual synthesis before materializing the final response. Each layer refines the signal, discarding noise and amplifying intent until the output crystallizes into form.',
              mode: 'word',
              ...speedConfig,
            }}
          ></p>
        {/key}
      </div>

      <p class="text-caption text-mute px-xs">
        <code
          >use:kinetic=&#123;&#123; text: '…', mode: 'word' &#125;&#125;</code
        >. Words reveal with fast per-character fill (<code>charSpeed</code>),
        then pause (<code>speed</code>) before the next word.
      </p>
    </div>

    <!-- ─── CYCLE MODE ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <div class="flex items-center justify-between">
        <h5>Cycle Mode</h5>
        <ActionBtn
          icon={Restart}
          text="Replay"
          size="sm"
          onclick={() => cycleKey++}
        />
      </div>
      <p class="text-small text-mute">
        Rotates through a word list with configurable transitions. Three
        transition styles: <strong>type</strong> (re-types each word),
        <strong>fade</strong> (crossfade between words), and
        <strong>decode</strong> (scramble into each new word). Retro physics
        forces the <code>type</code> transition &mdash; CRTs don&rsquo;t fade.
      </p>

      <div class="flex items-center gap-md">
        <span class="text-small text-mute">Transition:</span>
        <Selector
          aria-label="Cycle transition"
          options={cycleTransitionOptions}
          bind:value={cycleTransition}
          onchange={() => cycleKey++}
        />
      </div>

      <div class="surface-sunk p-lg flex items-center justify-center" use:morph>
        {#key cycleKey}
          <p
            aria-label="Cycling status text"
            use:kinetic={{
              words: cycleWords,
              mode: 'cycle',
              cycleTransition,
              ...speedConfig,
              pauseDuration: 1800,
            }}
          ></p>
        {/key}
      </div>

      <p class="text-caption text-mute px-xs">
        <code
          >use:kinetic=&#123;&#123; words: [...], mode: 'cycle',
          cycleTransition: 'type' &#125;&#125;</code
        >. Options: <code>pauseDuration</code> (ms between words),
        <code>loop</code> (default true), <code>fadeDuration</code> (for fade transition).
      </p>
    </div>

    <!-- ─── DECODE MODE ────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <div class="flex items-center justify-between">
        <h5>Decode Mode</h5>
        <ActionBtn
          icon={Restart}
          text="Replay"
          size="sm"
          onclick={() => decodeKey++}
        />
      </div>
      <p class="text-small text-mute">
        Scramble-to-resolve effect. Characters cycle through random noise before
        settling into the final text, resolving left-to-right. Retro physics
        uses uppercase-only scramble characters for a terminal feel. Glass and
        flat use the full mixed-case alphanumeric set.
      </p>

      <div class="surface-sunk p-lg flex flex-col gap-md">
        {#key decodeKey}
          <p
            aria-label="SIGNAL DECODED"
            use:kinetic={{
              text: 'SIGNAL DECODED',
              mode: 'decode',
              ...speedConfig,
            }}
          ></p>
        {/key}
      </div>

      <p class="text-caption text-mute px-xs">
        <code
          >use:kinetic=&#123;&#123; text: '…', mode: 'decode' &#125;&#125;</code
        >. Options: <code>scramblePasses</code> (iterations per character,
        default 4), <code>scrambleChars</code> (custom character set).
      </p>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;script&gt;
  import &#123; kinetic &#125; from '@actions/kinetic';
&lt;/script&gt;

&lt;!-- Char mode: typewriter --&gt;
&lt;h3 use:kinetic=&#123;&#123; text: 'Hello world', mode: 'char' &#125;&#125;&gt;&lt;/h3&gt;

&lt;!-- Word mode: streaming reveal --&gt;
&lt;p use:kinetic=&#123;&#123; text: 'Long paragraph...', mode: 'word' &#125;&#125;&gt;&lt;/p&gt;

&lt;!-- Cycle mode: rotating words --&gt;
&lt;span use:kinetic=&#123;&#123;
  words: ['Loading…', 'Processing…', 'Complete.'],
  mode: 'cycle',
  cycleTransition: 'decode',
  pauseDuration: 2000
&#125;&#125;&gt;&lt;/span&gt;

&lt;!-- Decode mode: scramble → resolve --&gt;
&lt;h3 use:kinetic=&#123;&#123; text: 'DECODED', mode: 'decode' &#125;&#125;&gt;&lt;/h3&gt;

&lt;!-- Staggered elements with delay --&gt;
&lt;h3 use:kinetic=&#123;&#123; text: 'Title', mode: 'char' &#125;&#125;&gt;&lt;/h3&gt;
&lt;p use:kinetic=&#123;&#123; text: 'Body text…', mode: 'char', delay: 500 &#125;&#125;&gt;&lt;/p&gt;

&lt;!-- Speed presets --&gt;
&lt;span use:kinetic=&#123;&#123; text: 'Fast', speedPreset: 'fast' &#125;&#125;&gt;&lt;/span&gt;
&lt;span use:kinetic=&#123;&#123; text: 'Slow', speedPreset: 'slow' &#125;&#125;&gt;&lt;/span&gt;

&lt;!-- Standalone helper (non-Svelte) --&gt;
&lt;script&gt;
  import &#123; typewrite &#125; from '@actions/kinetic';
  const handle = typewrite(el, 'Hello', &#123; speed: 30 &#125;);
  handle.abort(); // cancel mid-animation
&lt;/script&gt;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Source: <code>src/actions/kinetic.ts</code>. Types:
      <code>src/types/kinetic.d.ts</code>. The action cleans up automatically on
      element destroy; re-attaching aborts any running animation. For the full
      effect engine with 37 narrative effects, skeleton loading, and cue system,
      see the premium Kinetic Text package.
    </p>
  </div>
</section>
