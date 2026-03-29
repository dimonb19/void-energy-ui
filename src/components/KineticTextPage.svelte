<script lang="ts">
  import { RotateCcw } from '@lucide/svelte';
  import Selector from '@components/ui/Selector.svelte';
  import SliderField from '@components/ui/SliderField.svelte';
  import KineticText from '@dgrslabs/void-energy-kinetic-text/component';
  import { createVoidEnergyTextStyleSnapshot } from '@dgrslabs/void-energy-kinetic-text/adapters/void-energy-host';
  import type {
    KineticTextEffect,
    EffectScope,
    RevealMode,
    RevealStyle,
    StaggerPattern,
    KineticCue,
    TextStyleSnapshot,
  } from '@dgrslabs/void-energy-kinetic-text/types';

  // ── Snapshot ─────────────────────────────────────────────────────
  let snapshotEl: HTMLElement | undefined = $state();
  let snapshotTick = $state(0);

  const snapshot: TextStyleSnapshot | null = $derived(
    snapshotEl && snapshotTick >= 0
      ? createVoidEnergyTextStyleSnapshot(snapshotEl)
      : null,
  );

  // Force re-derive when atmosphere changes
  $effect(() => {
    const observer = new MutationObserver(() => {
      snapshotTick++;
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-atmosphere', 'data-physics', 'data-mode'],
    });
    return () => observer.disconnect();
  });

  // ── Sample text ──────────────────────────────────────────────────

  const SAMPLE_CHAR = 'System initializing... all modules online.';
  const SAMPLE_WORD =
    'The void engine adapts to every atmosphere. Glass physics create translucent surfaces with depth and glow. Flat physics produce clean, minimal interfaces. Retro physics channel the warmth of CRT phosphor.';
  const SAMPLE_SENTENCE =
    'The ancient door groaned open. Light spilled across the stone floor. Something moved in the shadows beyond.';
  const SAMPLE_DECODE = 'VOID ENERGY :: PREMIUM KINETIC TEXT';
  const SAMPLE_EFFECT =
    'The darkness crept closer, whispering promises of forgotten power.';
  const SAMPLE_STAGGER =
    'Every character arrives on its own schedule, creating rhythm from timing alone.';

  // ── Replay counters ──────────────────────────────────────────────

  let replayChar = $state(0);
  let replayWord = $state(0);
  let replaySentence = $state(0);
  let replaySentencePair = $state(0);
  let replayDecode = $state(0);
  let replayStyles = $state(0);
  let replayEffects = $state(0);
  let replayStagger = $state(0);
  let replayCues = $state(0);
  let replayPlayground = $state(0);

  // ── Reveal styles demo ───────────────────────────────────────────

  const revealStyleOptions: SelectorOption[] = [
    { value: 'instant', label: 'Instant' },
    { value: 'fade', label: 'Fade' },
    { value: 'rise', label: 'Rise' },
    { value: 'drop', label: 'Drop' },
    { value: 'scale', label: 'Scale' },
    { value: 'blur', label: 'Blur' },
  ];

  let selectedRevealStyle: string | number | null = $state('fade');

  // ── Effects demo ─────────────────────────────────────────────────

  const oneShotEffects: KineticTextEffect[] = [
    'shake',
    'quake',
    'jolt',
    'glitch',
    'surge',
    'warp',
  ];
  const continuousEffects: KineticTextEffect[] = [
    'drift',
    'flicker',
    'breathe',
    'tremble',
    'pulse',
    'whisper',
    'fade',
    'freeze',
    'burn',
    'static',
    'distort',
    'sway',
  ];

  const effectOptions: SelectorOption[] = [
    { value: '', label: 'None' },
    ...continuousEffects.map((e) => ({
      value: e,
      label: e.charAt(0).toUpperCase() + e.slice(1),
    })),
  ];

  const scopeOptions: SelectorOption[] = [
    { value: 'block', label: 'Block' },
    { value: 'line', label: 'Line' },
    { value: 'word', label: 'Word' },
    { value: 'glyph', label: 'Glyph' },
  ];

  let selectedEffect: string | number | null = $state('drift');
  let selectedScope: string | number | null = $state('block');

  // ── Stagger demo ─────────────────────────────────────────────────

  const staggerPatterns: StaggerPattern[] = [
    'sequential',
    'wave',
    'cascade',
    'random',
  ];

  // ── Cue demo ─────────────────────────────────────────────────────

  const cueDemoText = 'The ground shook. Thunder rolled across the sky!';
  const cueDemoCues: KineticCue[] = [
    {
      id: 'shake-ground',
      effect: 'shake',
      scope: 'block',
      trigger: 'at-time',
      atMs: 800,
    },
    {
      id: 'end-surge',
      effect: 'surge',
      scope: 'block',
      trigger: 'on-complete',
    },
  ];

  // ── Interactive playground ───────────────────────────────────────

  const modeOptions: SelectorOption[] = [
    { value: 'char', label: 'Character' },
    { value: 'word', label: 'Word' },
    { value: 'sentence', label: 'Sentence' },
    { value: 'sentence-pair', label: 'Sentence Pair' },
    { value: 'decode', label: 'Decode' },
  ];

  let pgMode: string | number | null = $state('char');
  let pgStyle: string | number | null = $state('fade');
  let pgEffect: string | number | null = $state('');
  let pgScope: string | number | null = $state('block');
  let pgStagger: string | number | null = $state('sequential');
  let pgSpeed = $state(200);
  let pgCharSpeed = $state(8);
  let pgRevealDuration = $state(300);
  let pgCursor = $state(true);

  const staggerOptions: SelectorOption[] = staggerPatterns.map((p) => ({
    value: p,
    label: p.charAt(0).toUpperCase() + p.slice(1),
  }));

  const PLAYGROUND_TEXT =
    'In the depths of the void, energy pulses through crystalline networks. Each node hums with purpose, carrying data across infinite dark. The system breathes. The system lives.';
</script>

<div class="container flex flex-col gap-2xl py-2xl" bind:this={snapshotEl}>
  <!-- ─── HERO ─────────────────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <p class="text-caption text-mute">@dgrslabs/void-energy-kinetic-text</p>
        <h1>Kinetic Text</h1>
        <p class="text-dim max-w-3xl">
          Premium character-level kinetic typography for Void Energy hosts.
          Per-character DOM rendering, 5 reveal modes, 6 reveal styles, 18
          narrative effects with granular scope targeting, physics-aware
          animations, and a cue system for TTS synchronization.
        </p>
      </div>

      {#if snapshot}
        <div class="surface-sunk p-lg">
          {#key replayChar}
            <KineticText
              text="The void engine awakens. Every character, every word, alive with purpose."
              styleSnapshot={snapshot}
              revealMode="char"
              revealStyle="fade"
              activeEffect="drift"
              effectScope="glyph"
              cursor
              speed={55}
            />
          {/key}
        </div>
      {/if}
    </div>
  </section>

  <!-- ─── REVEAL MODES ─────────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Reveal Modes</h2>
        <p class="text-dim">
          Five modes control how text enters the viewport. Each mode adapts its
          timing, cursor behavior, and physics response automatically.
        </p>
      </div>

      {#if snapshot}
        <!-- Character -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Character</h6>
            <button class="btn-icon" onclick={() => replayChar++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayChar}
              <KineticText
                text={SAMPLE_CHAR}
                styleSnapshot={snapshot}
                revealMode="char"
                revealStyle="instant"
                cursor
                speed={55}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            One character at a time with blinking cursor. Classic typewriter
            feel. Retro physics adds per-tick timing jitter.
          </p>
        </div>

        <!-- Word -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Word</h6>
            <button class="btn-icon" onclick={() => replayWord++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayWord}
              <KineticText
                text={SAMPLE_WORD}
                styleSnapshot={snapshot}
                revealMode="word"
                revealStyle="fade"
                speed={80}
                charSpeed={8}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Word-by-word with fast internal character reveal. Creates an
            AI-generation streaming feel.
          </p>
        </div>

        <!-- Sentence -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Sentence</h6>
            <button class="btn-icon" onclick={() => replaySentence++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replaySentence}
              <KineticText
                text={SAMPLE_SENTENCE}
                styleSnapshot={snapshot}
                revealMode="sentence"
                revealStyle="rise"
                speed={200}
                charSpeed={6}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Sentence-by-sentence reveal. Each sentence appears as a burst, with
            characters flowing in rapidly.
          </p>
        </div>

        <!-- Sentence Pair -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Sentence Pair</h6>
            <button class="btn-icon" onclick={() => replaySentencePair++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replaySentencePair}
              <KineticText
                text={SAMPLE_SENTENCE}
                styleSnapshot={snapshot}
                revealMode="sentence-pair"
                revealStyle="fade"
                speed={300}
                charSpeed={6}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Two sentences at a time. Useful for dialogue pacing in narrative
            contexts.
          </p>
        </div>

        <!-- Decode -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Decode</h6>
            <button class="btn-icon" onclick={() => replayDecode++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayDecode}
              <KineticText
                text={SAMPLE_DECODE}
                styleSnapshot={snapshot}
                revealMode="decode"
                stagger={30}
                scramblePasses={6}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            All characters visible immediately as scrambled glyphs, then resolve
            left-to-right. Retro physics uses a limited uppercase charset.
          </p>
        </div>
      {/if}
    </div>
  </section>

  <!-- ─── REVEAL STYLES ────────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Reveal Styles</h2>
        <p class="text-dim">
          Each character's entrance animation. Combine with any reveal mode.
        </p>
      </div>

      <Selector
        label="Reveal Style"
        options={revealStyleOptions}
        bind:value={selectedRevealStyle}
        onchange={() => replayStyles++}
      />

      {#if snapshot}
        <div class="surface-sunk p-lg">
          {#key replayStyles}
            <KineticText
              text="Watch how each character enters the scene with its own animation."
              styleSnapshot={snapshot}
              revealMode="char"
              revealStyle={selectedRevealStyle as RevealStyle}
              speed={40}
              cursor
            />
          {/key}
        </div>
      {/if}

      <p class="text-caption text-mute px-xs">
        Styles: <code>instant</code> (no animation), <code>fade</code>
        (opacity), <code>rise</code> (slide up), <code>drop</code> (fall down),
        <code>scale</code> (grow in), <code>blur</code> (focus in). Each adapts easing
        per physics preset.
      </p>
    </div>
  </section>

  <!-- ─── EFFECTS GALLERY ──────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Effects Gallery</h2>
        <p class="text-dim">
          18 narrative effects: 6 one-shot (fire once, auto-cleanup) and 12
          continuous (loop until cleared). Effects can target different scopes.
        </p>
      </div>

      <div class="flex flex-wrap gap-md">
        <Selector
          label="Continuous Effect"
          options={effectOptions}
          bind:value={selectedEffect}
        />
        <Selector
          label="Scope"
          options={scopeOptions}
          bind:value={selectedScope}
        />
      </div>

      {#if snapshot}
        <div class="surface-sunk p-lg">
          <KineticText
            text={SAMPLE_EFFECT}
            styleSnapshot={snapshot}
            revealMode="char"
            revealStyle="instant"
            speed={0}
            activeEffect={selectedEffect
              ? (selectedEffect as KineticTextEffect)
              : null}
            effectScope={selectedScope as EffectScope}
          />
        </div>
      {/if}

      <details>
        <summary>One-Shot Effects</summary>
        <div class="p-lg flex flex-col gap-md">
          <p class="text-dim">
            One-shot effects play once and auto-cleanup via
            <code>animationend</code>. Typically triggered by the cue system on
            reveal completion.
          </p>
          <div class="flex flex-wrap gap-sm">
            {#each oneShotEffects as effect}
              <span class="surface-sunk p-sm text-caption font-mono">
                {effect}
              </span>
            {/each}
          </div>
        </div>
      </details>

      <details>
        <summary>Continuous Effects</summary>
        <div class="p-lg flex flex-col gap-md">
          <p class="text-dim">
            Continuous effects loop indefinitely as ambient atmosphere. Applied
            via the <code>activeEffect</code> prop.
          </p>
          <div class="flex flex-wrap gap-sm">
            {#each continuousEffects as effect}
              <span class="surface-sunk p-sm text-caption font-mono">
                {effect}
              </span>
            {/each}
          </div>
        </div>
      </details>

      <p class="text-caption text-mute px-xs">
        Scopes: <code>block</code> (entire text), <code>line</code> (per line),
        <code>word</code> (per word, skips spaces), <code>glyph</code> (per
        character), <code>range</code> (arbitrary character range via cues).
      </p>
    </div>
  </section>

  <!-- ─── STAGGER PATTERNS ─────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Stagger Patterns</h2>
        <p class="text-dim">
          Control the timing distribution across characters. Each pattern
          creates a different visual rhythm.
        </p>
      </div>

      {#if snapshot}
        <div class="flex flex-col gap-lg">
          {#each staggerPatterns as pattern}
            <div class="flex flex-col gap-xs">
              <div class="flex items-center justify-between">
                <h6 class="capitalize">{pattern}</h6>
                <button class="btn-icon" onclick={() => replayStagger++}>
                  <RotateCcw class="icon" data-size="sm" />
                </button>
              </div>
              <div class="surface-sunk p-lg">
                {#key replayStagger}
                  <KineticText
                    text={SAMPLE_STAGGER}
                    styleSnapshot={snapshot}
                    revealMode="char"
                    revealStyle="fade"
                    staggerPattern={pattern}
                    speed={30}
                  />
                {/key}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <p class="text-caption text-mute px-xs">
        <code>sequential</code> (left to right), <code>wave</code> (sine
        distribution), <code>cascade</code> (center-out), <code>random</code>
        (seeded PRNG with retro jitter).
      </p>
    </div>
  </section>

  <!-- ─── CUE SYSTEM ──────────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Cue System</h2>
        <p class="text-dim">
          Fire one-shot effects at specific times or on reveal completion.
          Designed for TTS synchronization where word timestamps drive per-word
          effects as speech progresses.
        </p>
      </div>

      {#if snapshot}
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Time + Completion Cues</h6>
            <button class="btn-icon" onclick={() => replayCues++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayCues}
              <KineticText
                text={cueDemoText}
                styleSnapshot={snapshot}
                revealMode="word"
                revealStyle="fade"
                cues={cueDemoCues}
                speed={100}
                charSpeed={6}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            <code>shake</code> fires at 800ms (time cue) while text is still
            revealing. <code>surge</code> fires on completion.
          </p>
        </div>
      {/if}

      <details>
        <summary>Cue Configuration</summary>
        <div class="p-lg flex flex-col gap-md">
          <pre
            class="surface-sunk p-md text-caption font-mono overflow-x-auto"><code
              >{`const cues: KineticCue[] = [
  {
    id: 'shake-ground',
    effect: 'shake',
    scope: 'block',
    trigger: 'at-time',
    atMs: 800,
  },
  {
    id: 'end-surge',
    effect: 'surge',
    scope: 'block',
    trigger: 'on-complete',
  },
];`}</code
            ></pre>
        </div>
      </details>
    </div>
  </section>

  <!-- ─── INTERACTIVE PLAYGROUND ───────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Interactive Playground</h2>
        <p class="text-dim">
          Combine any reveal mode, style, effect, and stagger pattern. All props
          adapt to the current atmosphere automatically.
        </p>
      </div>

      <div class="flex flex-wrap gap-md">
        <Selector
          label="Mode"
          options={modeOptions}
          bind:value={pgMode}
          onchange={() => replayPlayground++}
        />
        <Selector
          label="Style"
          options={revealStyleOptions}
          bind:value={pgStyle}
          onchange={() => replayPlayground++}
        />
        <Selector
          label="Effect"
          options={effectOptions}
          bind:value={pgEffect}
        />
        <Selector label="Scope" options={scopeOptions} bind:value={pgScope} />
        <Selector
          label="Stagger"
          options={staggerOptions}
          bind:value={pgStagger}
          onchange={() => replayPlayground++}
        />
      </div>

      <div class="flex flex-wrap gap-md">
        <SliderField
          label="Speed"
          bind:value={pgSpeed}
          min={10}
          max={500}
          step={10}
          presets={[
            { value: 40, label: 'Fast' },
            { value: 200, label: 'Normal' },
            { value: 400, label: 'Slow' },
          ]}
        />
        <SliderField
          label="Reveal Duration"
          bind:value={pgRevealDuration}
          min={100}
          max={1000}
          step={50}
          presets={[
            { value: 150, label: 'Quick' },
            { value: 300, label: 'Normal' },
            { value: 600, label: 'Long' },
          ]}
        />
      </div>

      <div class="flex items-center gap-md">
        <label class="flex items-center gap-xs">
          <input type="checkbox" bind:checked={pgCursor} />
          <span class="text-small">Cursor</span>
        </label>
        <button class="btn-ghost" onclick={() => replayPlayground++}>
          Replay
        </button>
      </div>

      {#if snapshot}
        <div class="surface-sunk p-lg">
          {#key replayPlayground}
            <KineticText
              text={PLAYGROUND_TEXT}
              styleSnapshot={snapshot}
              revealMode={pgMode as RevealMode}
              revealStyle={pgStyle as RevealStyle}
              staggerPattern={pgStagger as StaggerPattern}
              activeEffect={pgEffect ? (pgEffect as KineticTextEffect) : null}
              effectScope={pgScope as EffectScope}
              speed={pgSpeed}
              charSpeed={pgCharSpeed}
              revealDuration={pgRevealDuration}
              cursor={pgCursor}
            />
          {/key}
        </div>
      {/if}

      <details>
        <summary>Current Props</summary>
        <div class="p-lg">
          <pre
            class="surface-sunk p-md text-caption font-mono overflow-x-auto"><code
              >{`<KineticText
  text="..."
  styleSnapshot={snapshot}
  revealMode="${pgMode}"
  revealStyle="${pgStyle}"
  staggerPattern="${pgStagger}"${pgEffect ? `\n  activeEffect="${pgEffect}"` : ''}${pgEffect ? `\n  effectScope="${pgScope}"` : ''}
  speed={${pgSpeed}}
  charSpeed={${pgCharSpeed}}
  revealDuration={${pgRevealDuration}}${pgCursor ? '\n  cursor' : ''}
/>`}</code
            ></pre>
        </div>
      </details>
    </div>
  </section>
</div>
