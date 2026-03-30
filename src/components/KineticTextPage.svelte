<script lang="ts">
  import { tick } from 'svelte';
  import { RotateCcw } from '@lucide/svelte';
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { narrative } from '@actions/narrative';
  import Selector from '@components/ui/Selector.svelte';
  import SliderField from '@components/ui/SliderField.svelte';
  import IconBtn from '@components/ui/IconBtn.svelte';
  import PlayPause from '@components/icons/PlayPause.svelte';
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
  const SAMPLE_STAGGER =
    'Every character arrives on its own schedule, creating rhythm from timing alone.';

  // ── Replay counters ──────────────────────────────────────────────

  let replayChar = $state(0);
  let replayWord = $state(0);
  let replaySentence = $state(0);
  let replaySentencePair = $state(0);
  let replayDecode = $state(0);
  let replayStagger = $state(0);
  let replayPlayground = $state(0);

  // ── Stagger demo ─────────────────────────────────────────────────

  const staggerPatterns: StaggerPattern[] = [
    'sequential',
    'wave',
    'cascade',
    'random',
  ];

  // ── Interactive playground ───────────────────────────────────────

  const revealStyleOptions: SelectorOption[] = [
    { value: 'instant', label: 'Instant' },
    { value: 'fade', label: 'Fade' },
    { value: 'rise', label: 'Rise' },
    { value: 'drop', label: 'Drop' },
    { value: 'scale', label: 'Scale' },
    { value: 'blur', label: 'Blur' },
  ];

  const effectOptions: SelectorOption[] = [
    { value: '', label: 'None' },
    { value: 'drift', label: 'Drift' },
    { value: 'flicker', label: 'Flicker' },
    { value: 'breathe', label: 'Breathe' },
    { value: 'tremble', label: 'Tremble' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'whisper', label: 'Whisper' },
    { value: 'fade', label: 'Fade' },
    { value: 'freeze', label: 'Freeze' },
    { value: 'burn', label: 'Burn' },
    { value: 'static', label: 'Static' },
    { value: 'distort', label: 'Distort' },
    { value: 'sway', label: 'Sway' },
  ];

  const scopeOptions: SelectorOption[] = [
    { value: 'block', label: 'Block' },
    { value: 'line', label: 'Line' },
    { value: 'word', label: 'Word' },
    { value: 'glyph', label: 'Glyph' },
  ];

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

  // ── Narrative effects demo data ────────────────────────────────

  type OneShotNarrativeEffect =
    | 'shake'
    | 'quake'
    | 'jolt'
    | 'glitch'
    | 'surge'
    | 'warp';
  type ContinuousNarrativeEffect =
    | 'drift'
    | 'flicker'
    | 'breathe'
    | 'tremble'
    | 'pulse'
    | 'whisper'
    | 'fade'
    | 'freeze'
    | 'burn'
    | 'static'
    | 'distort'
    | 'sway';

  interface NarrativeDemo<T extends NarrativeEffect> {
    effect: T;
    label: string;
    context: string;
    text: string;
    note: string;
  }

  const narrativeOneShotDemos = [
    {
      effect: 'shake',
      label: 'Shake',
      context: 'Door slam, collision, sudden impact',
      text: 'The blast door slammed shut and the whole corridor lurched sideways.',
      note: 'One-shot punctuation effect. Decays quickly back to rest.',
    },
    {
      effect: 'quake',
      label: 'Quake',
      context: 'Collapse, thunder, large-scale destruction',
      text: 'Stone dust rained from the ceiling as the chamber buckled under the shockwave.',
      note: 'Heavy two-axis jitter with a longer settle than shake.',
    },
    {
      effect: 'jolt',
      label: 'Jolt',
      context: 'Jump scare, shock, sudden realization',
      text: 'A cold hand brushed the back of her neck and every muscle snapped awake.',
      note: 'Single violent displacement with an elastic return.',
    },
    {
      effect: 'glitch',
      label: 'Glitch',
      context: 'Reality corruption, hacking, signal failure',
      text: 'For one breath, the memory fractured into static and rewrote itself.',
      note: 'Choppy skewed displacement tuned for digital instability.',
    },
    {
      effect: 'surge',
      label: 'Surge',
      context: 'Magic cast, transformation, power activation, epiphany',
      text: 'Light gathered in her palms and erupted skyward, burning through the dark like a second dawn.',
      note: 'Ascending power buildup with scale overshoot and brightness flash.',
    },
    {
      effect: 'warp',
      label: 'Warp',
      context: 'Teleportation, portal entry, dimensional shift, time warp',
      text: 'The doorway stretched sideways, pulled itself thin, and snapped her through before she could scream.',
      note: 'Horizontal scaleX oscillation with subtle skew for spatial distortion.',
    },
  ] satisfies NarrativeDemo<OneShotNarrativeEffect>[];

  const narrativeContinuousDemos = [
    {
      effect: 'drift',
      label: 'Drift',
      context: 'Underwater, dreaming, weightless travel',
      text: 'The lantern floated beside them as the tide carried every word into blue silence.',
      note: 'Slow atmospheric lift. Best for calm sustained scenes.',
    },
    {
      effect: 'flicker',
      label: 'Flicker',
      context: 'Failing lights, unstable power, haunted spaces',
      text: 'The emergency strip kept dimming, brightening, and dimming again in uneasy bursts.',
      note: 'Irregular opacity drops with hard cuts between states.',
    },
    {
      effect: 'breathe',
      label: 'Breathe',
      context: 'Suspense, calm focus, emotional weight',
      text: 'She steadied herself and let the room inhale with her before the answer came.',
      note: 'Subtle scale pulse that stays readable over long scenes.',
    },
    {
      effect: 'tremble',
      label: 'Tremble',
      context: 'Cold, fear, fragility, exposed nerves',
      text: 'His confession arrived in a shiver, barely held together by breath.',
      note: 'Fast micro-vibration. Continuous but intentionally restrained.',
    },
    {
      effect: 'pulse',
      label: 'Pulse',
      context: 'Heartbeat, ritual energy, imminent countdown',
      text: 'The seal under the altar throbbed once, then again, brighter every time.',
      note: 'Sharper rhythmic beat than breathe, tuned for tension.',
    },
    {
      effect: 'whisper',
      label: 'Whisper',
      context: 'Secrets, ghosts, fading memory, telepathy',
      text: 'A voice slipped past her ear so softly it felt borrowed from another room.',
      note: 'Opacity and scale recede together for a fragile presence.',
    },
    {
      effect: 'fade',
      label: 'Fade',
      context: 'Losing consciousness, drugged, time skip, falling asleep',
      text: 'The edges of the room softened and blurred away. Her thoughts dissolved one by one until only the dark remained.',
      note: 'Gradual opacity drift. Pure visibility change, no scale or position.',
    },
    {
      effect: 'freeze',
      label: 'Freeze',
      context: 'Ice magic, paralysis, time freeze, petrification, stasis',
      text: 'The frost crept up her fingers and locked every joint in place. Even her breath hung motionless in the air.',
      note: 'Micro contraction and brightness reduction. Extremely subtle, reads as stillness.',
    },
    {
      effect: 'burn',
      label: 'Burn',
      context: 'Fire scenes, desert heat, rage, fever, volcanic environments',
      text: 'Heat rolled off the sand in visible waves, warping the horizon into a shimmering ribbon of light.',
      note: 'Vertical micro-wobble with skew oscillation. Faster rhythm than drift.',
    },
    {
      effect: 'static',
      label: 'Static',
      context:
        'Radio transmission, broken comms, digital interference, corrupted data',
      text: 'The signal dissolved into noise. Fragments of a voice fought through the interference, barely holding shape.',
      note: 'Rapid micro-jitter layered with opacity flicker. Tighter than tremble.',
    },
    {
      effect: 'distort',
      label: 'Distort',
      context: 'Drunk, poisoned, hallucinating, vertigo, psychic influence',
      text: 'The walls bent without moving. Every surface tilted just enough to be wrong, and her own hands looked like they belonged to someone standing in a different room.',
      note: 'Subtle rotation + asymmetric scale. Perception unreliable but still conscious.',
    },
    {
      effect: 'sway',
      label: 'Sway',
      context: 'Ship travel, storms, unstable footing, earthquake aftermath',
      text: 'The deck rolled beneath her feet and every step became a negotiation with gravity. The horizon tilted left, then right, then left again.',
      note: 'Lateral translateX sine wave. Distinct from drift (vertical) and burn (vertical+skew).',
    },
  ] satisfies NarrativeDemo<ContinuousNarrativeEffect>[];

  // ── Narrative effects state (KineticText-driven) ────────────────

  let oneShotReplay = $state<Record<OneShotNarrativeEffect, number>>({
    shake: 0,
    quake: 0,
    jolt: 0,
    glitch: 0,
    surge: 0,
    warp: 0,
  });

  let activeContinuousEffects = $state<
    Record<ContinuousNarrativeEffect, ContinuousNarrativeEffect | null>
  >({
    drift: null,
    flicker: null,
    breathe: null,
    tremble: null,
    pulse: null,
    whisper: null,
    fade: null,
    freeze: null,
    burn: null,
    static: null,
    distort: null,
    sway: null,
  });

  const narrativeEffectsEnabled = $derived(
    voidEngine.userConfig.narrativeEffects,
  );

  let oneShotScope = $state<string | number | null>('block');
  let continuousScope = $state<string | number | null>('glyph');

  function toggleNarrativeLoop(effect: ContinuousNarrativeEffect) {
    activeContinuousEffects[effect] = activeContinuousEffects[effect]
      ? null
      : effect;
  }

  function buildOneShotCue(effect: OneShotNarrativeEffect): KineticCue[] {
    return [
      {
        id: `${effect}-punch`,
        effect,
        scope: oneShotScope as EffectScope,
        trigger: 'on-complete',
      },
    ];
  }

  // ── Narrative test container state ─────────────────────────────

  let testOneShotEffect = $state<OneShotNarrativeEffect>('shake');
  let activeTestOneShot = $state<OneShotNarrativeEffect | null>(null);
  let testContinuousEffect = $state<ContinuousNarrativeEffect>('drift');
  let testContinuousActive = $state(false);

  const narrativeOneShotOptions: SelectorOption[] = [
    { value: 'shake', label: 'Shake' },
    { value: 'quake', label: 'Quake' },
    { value: 'jolt', label: 'Jolt' },
    { value: 'glitch', label: 'Glitch' },
    { value: 'surge', label: 'Surge' },
    { value: 'warp', label: 'Warp' },
  ];

  const narrativeContinuousOptions: SelectorOption[] = [
    { value: 'drift', label: 'Drift' },
    { value: 'flicker', label: 'Flicker' },
    { value: 'breathe', label: 'Breathe' },
    { value: 'tremble', label: 'Tremble' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'whisper', label: 'Whisper' },
    { value: 'fade', label: 'Fade' },
    { value: 'freeze', label: 'Freeze' },
    { value: 'burn', label: 'Burn' },
    { value: 'static', label: 'Static' },
    { value: 'distort', label: 'Distort' },
    { value: 'sway', label: 'Sway' },
  ];

  async function playTestOneShot() {
    activeTestOneShot = null;
    await tick();
    activeTestOneShot = testOneShotEffect;
  }

  function toggleTestContinuous() {
    testContinuousActive = !testContinuousActive;
  }
</script>

<div class="container flex flex-col gap-2xl py-2xl" bind:this={snapshotEl}>
  <!-- ─── HERO ─────────────────────────────────────────────────────── -->
  <header class="flex flex-col gap-lg items-center text-center">
    <h1 class="text-primary">Kinetic Text</h1>

    <p class="text-h3 max-w-3xl">
      Premium character-level kinetic typography for Void Energy hosts.
    </p>

    <p class="text-body text-dim max-w-3xl">
      Per-character DOM rendering, 5 reveal modes, 18 narrative effects with
      granular scope targeting, physics-aware animations, and a cue system for
      TTS synchronization.
    </p>
  </header>

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

  <!-- ─── NARRATIVE EFFECTS ─────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Narrative Effects</h2>
        <p class="text-dim">
          18 narrative effects rendered through per-character DOM. One-shot
          effects fire via the cue system after reveal completes; continuous
          effects loop at any scope — block, line, word, or individual glyph.
          Switch scopes to see how character-level targeting transforms each
          effect.
        </p>
      </div>

      <details>
        <summary>Technical Details</summary>
        <div class="p-md flex flex-col gap-md">
          <p>
            Every demo below uses the <code>KineticText</code> component with
            per-character DOM. One-shot effects are triggered via the
            <strong>cue system</strong> (<code>on-complete</code> trigger) —
            text reveals word-by-word, then the effect fires on the fully
            visible text. Continuous effects are applied via the
            <code>activeEffect</code> prop with instant reveal.
          </p>
          <p>
            The scope selector controls targeting granularity. At
            <strong>glyph</strong> scope, each character animates independently
            — drift becomes a wave of individually floating letters, tremble
            gives each glyph its own micro-vibration. At
            <strong>block</strong> scope, the entire text moves as one unit.
            <strong>Line</strong> and <strong>word</strong> scopes fall between the
            two.
          </p>
          <p>
            Physics styling adapts automatically. Glass adds motion blur on
            displacement-heavy effects, flat keeps the raw curves clean, and
            retro applies per-effect stepped timing. The long-form test
            containers below use the <code>use:narrative</code> action for block-level
            comparison.
          </p>
        </div>
      </details>

      <div class="flex flex-col gap-md">
        <div class="flex items-end justify-between gap-md">
          <div class="flex flex-col gap-xs">
            <h5>One-Shot Effects</h5>
            <p class="text-caption text-mute">
              Punctuation moments. Text reveals word-by-word, then the effect
              fires via the cue system on completion.
            </p>
          </div>
          <Selector
            label="Scope"
            options={scopeOptions}
            bind:value={oneShotScope}
          />
        </div>

        {#if snapshot}
          <div class="grid gap-lg tablet:grid-cols-2">
            {#each narrativeOneShotDemos as demo}
              <div class="surface-sunk p-md flex flex-col gap-md h-full">
                <div class="flex items-start justify-between gap-md">
                  <div class="flex flex-col gap-xs">
                    <h6>{demo.label}</h6>
                    <p class="text-caption text-mute">{demo.context}</p>
                  </div>

                  <IconBtn
                    aria-label="Replay"
                    icon={PlayPause}
                    onclick={() => oneShotReplay[demo.effect]++}
                  />
                </div>

                {#key oneShotReplay[demo.effect]}
                  <KineticText
                    text={demo.text}
                    styleSnapshot={snapshot}
                    revealMode="word"
                    revealStyle="rise"
                    speed={80}
                    charSpeed={8}
                    cues={buildOneShotCue(demo.effect)}
                  />
                {/key}

                <p class="text-caption text-mute">{demo.note}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="flex flex-col gap-md">
        <div class="flex items-end justify-between gap-md">
          <div class="flex flex-col gap-xs">
            <h5>Continuous Effects</h5>
            <p class="text-caption text-mute">
              Sustained atmosphere loops at character level. Toggle each effect
              to see per-glyph motion — compare with block scope via the
              selector.
            </p>
          </div>
          <Selector
            label="Scope"
            options={scopeOptions}
            bind:value={continuousScope}
          />
        </div>

        {#if snapshot}
          <div class="grid gap-lg tablet:grid-cols-2 large-desktop:grid-cols-3">
            {#each narrativeContinuousDemos as demo}
              <div class="surface-sunk p-md flex flex-col gap-md h-full">
                <div class="flex items-start justify-between gap-md">
                  <div class="flex flex-col gap-xs">
                    <h6>{demo.label}</h6>
                    <p class="text-caption text-mute">{demo.context}</p>
                  </div>

                  <IconBtn
                    icon={PlayPause}
                    aria-label={activeContinuousEffects[demo.effect]
                      ? 'Stop'
                      : 'Start'}
                    aria-pressed={Boolean(activeContinuousEffects[demo.effect])}
                    onclick={() => toggleNarrativeLoop(demo.effect)}
                    iconProps={{
                      'data-paused': activeContinuousEffects[demo.effect]
                        ? 'true'
                        : undefined,
                    }}
                  />
                </div>

                <KineticText
                  text={demo.text}
                  styleSnapshot={snapshot}
                  revealMode="char"
                  revealStyle="instant"
                  speed={0}
                  activeEffect={activeContinuousEffects[demo.effect]}
                  effectScope={continuousScope as EffectScope}
                />

                <p class="text-caption text-mute">{demo.note}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <h5>Long-Form Test</h5>
          <p class="text-caption text-mute">
            Scrollable text containers for testing effects on longer passages.
            Pick an effect, then scroll through to see how it reads at scale.
          </p>
        </div>

        <div class="grid gap-lg large-desktop:grid-cols-2">
          <div class="flex flex-col gap-md">
            <div class="flex items-end gap-sm">
              <Selector
                label="One-Shot"
                options={narrativeOneShotOptions}
                bind:value={testOneShotEffect}
                onchange={() => {
                  playTestOneShot();
                }}
                class="flex-1"
              />
              <IconBtn
                aria-label="Play"
                icon={PlayPause}
                onclick={playTestOneShot}
              />
            </div>

            <div class="surface-sunk narrative-test-scroll">
              <div
                class="flex flex-col gap-md"
                use:narrative={{
                  effect: activeTestOneShot,
                  enabled: narrativeEffectsEnabled,
                  onComplete: () => {
                    activeTestOneShot = null;
                  },
                }}
              >
                <p>
                  The corridor stretched on for what felt like hours. Every few
                  steps the overhead lights would buzz and settle, buzz and
                  settle, casting long unsteady shadows across the concrete
                  floor. There was no sound except the distant hum of
                  ventilation and the quiet percussion of their own footsteps
                  echoing off bare walls.
                </p>
                <p>
                  At the far end a heavy blast door stood half-open, a sliver of
                  pale blue light spilling through the gap. Beyond it they could
                  see a chamber — vast, empty, its ceiling lost in darkness. The
                  floor was polished stone, cracked in places, with hairline
                  fractures radiating out from a central point like the memory
                  of an impact.
                </p>
                <p>
                  She pressed her palm flat against the door and pushed. The
                  metal groaned, reluctant, then gave way with a low shudder
                  that traveled up through her arm and into her teeth. The sound
                  rolled through the chamber and came back changed — deeper,
                  longer, as if the room itself had answered.
                </p>
                <p>
                  Something was different about the air in here. It tasted of
                  ozone and old copper, the kind of atmosphere that settles into
                  places where energy has been spent violently and never quite
                  dissipated. The cracks in the floor glowed faintly, a dull
                  amber that pulsed once and faded.
                </p>
                <p>
                  They stood at the threshold for a long time, neither speaking,
                  both aware that whatever had happened in this room was not
                  finished. The silence was not empty — it was patient. It was
                  waiting for the next sentence to arrive.
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-md">
            <div class="flex items-end gap-sm">
              <Selector
                label="Continuous"
                options={narrativeContinuousOptions}
                bind:value={testContinuousEffect}
                onchange={() => {
                  testContinuousActive = true;
                }}
                class="flex-1"
              />
              <IconBtn
                icon={PlayPause}
                aria-label={testContinuousActive ? 'Stop' : 'Start'}
                aria-pressed={testContinuousActive}
                onclick={toggleTestContinuous}
                iconProps={{
                  'data-paused': testContinuousActive ? 'true' : undefined,
                }}
              />
            </div>

            <div class="surface-sunk narrative-test-scroll">
              <div
                class="flex flex-col gap-md"
                use:narrative={{
                  effect: testContinuousActive ? testContinuousEffect : null,
                  enabled: narrativeEffectsEnabled,
                }}
              >
                <p>
                  The lake had no edges that she could see. It simply went on,
                  silver and flat, until it became indistinguishable from the
                  low-hanging sky. The boat rocked gently beneath her — not from
                  wind, there was no wind, but from some deep slow rhythm in the
                  water itself, as if the lake were breathing.
                </p>
                <p>
                  A lantern hung from the prow on a rusted hook, its flame
                  barely moving. The light it cast was warm and small, touching
                  only the nearest few inches of water before surrendering to
                  the grey. She trailed her fingers over the side and watched
                  the ripples spread outward in perfect circles that never came
                  back.
                </p>
                <p>
                  Somewhere beneath the surface, very far down, something
                  luminous drifted. It was too deep to have a shape — just a
                  slow greenish glow that moved like a thought trying to
                  surface. She watched it for a long time, and it watched her
                  back, and neither of them blinked.
                </p>
                <p>
                  The silence here was not the silence of absence. It was thick,
                  textured, full of tiny sounds folded into one another: the
                  creak of old wood, the soft lap of water against the hull, a
                  distant tone that might have been a bell or might have been
                  her own pulse amplified by the stillness.
                </p>
                <p>
                  She closed her eyes and let the boat carry her. There was no
                  current but the boat moved anyway, slow and sure, as if it
                  knew where she needed to go even when she did not. The lantern
                  flickered once, then steadied. The glow beneath the water
                  followed like a companion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <details>
        <summary>Reference</summary>
        <div class="p-md flex flex-col gap-lg">
          <div class="flex flex-col gap-md">
            <h6>One-Shot Effects</h6>
            <p class="text-caption text-mute">
              Fire once after text is fully revealed. Use for punctuation
              moments.
            </p>
            <dl class="flex flex-col gap-md">
              <div>
                <dt><code>shake</code> — Physical Impact</dt>
                <dd class="text-small text-mute">
                  Rapid horizontal jitter, decaying to rest. Door slams,
                  collisions, nearby explosions, heavy objects crashing.
                </dd>
              </div>
              <div>
                <dt><code>quake</code> — Massive Force</dt>
                <dd class="text-small text-mute">
                  Violent two-axis displacement with a rolling settle. Building
                  collapses, close detonations, structural failure, the ground
                  splitting open.
                </dd>
              </div>
              <div>
                <dt><code>jolt</code> — Sudden Shock</dt>
                <dd class="text-small text-mute">
                  Single sharp displacement with an elastic snap-back. Jump
                  scares, sudden grabs, betrayals revealed, waking from
                  nightmares.
                </dd>
              </div>
              <div>
                <dt><code>glitch</code> — Digital Corruption</dt>
                <dd class="text-small text-mute">
                  Choppy skewed displacement with stepped timing. Simulation
                  malfunctions, memory rewrites, hacking, signal failure,
                  reality fractures.
                </dd>
              </div>
              <div>
                <dt><code>surge</code> — Power Activation</dt>
                <dd class="text-small text-mute">
                  Ascending scale with brightness flash. Magic cast,
                  transformation, divine intervention, power activation,
                  epiphany.
                </dd>
              </div>
              <div>
                <dt><code>warp</code> — Spatial Distortion</dt>
                <dd class="text-small text-mute">
                  Horizontal scaleX oscillation with subtle skew. Teleportation,
                  portal entry, dimensional shift, time warp, gravity anomaly.
                </dd>
              </div>
            </dl>
          </div>

          <div class="flex flex-col gap-md">
            <h6>Continuous Effects</h6>
            <p class="text-caption text-mute">
              Loop from the moment the step starts, sustaining atmosphere
              throughout.
            </p>
            <dl class="flex flex-col gap-md">
              <div>
                <dt><code>drift</code> — Weightlessness</dt>
                <dd class="text-small text-mute">
                  Slow vertical sine wave. Underwater scenes, dreaming, zero
                  gravity, fog, meditative calm after intense action.
                </dd>
              </div>
              <div>
                <dt><code>flicker</code> — Unstable Environment</dt>
                <dd class="text-small text-mute">
                  Irregular opacity drops with hard cuts. Failing lights,
                  unstable power, haunted spaces, fading transmissions, phasing
                  presence.
                </dd>
              </div>
              <div>
                <dt><code>breathe</code> — Held Tension</dt>
                <dd class="text-small text-mute">
                  Slow rhythmic scale pulse. Suspense, centering before action,
                  emotional weight (grief, awe), meditation, charged stillness.
                </dd>
              </div>
              <div>
                <dt><code>tremble</code> — Fragile Vulnerability</dt>
                <dd class="text-small text-mute">
                  Fast micro-vibration, deliberately small. Freezing cold,
                  bodily fear, physical fragility, suppressed emotion about to
                  overflow.
                </dd>
              </div>
              <div>
                <dt><code>pulse</code> — Building Pressure</dt>
                <dd class="text-small text-mute">
                  Heartbeat-tempo scale with sharp attack. Audible heartbeat,
                  ritual energy charging, countdowns, approaching something
                  powerful.
                </dd>
              </div>
              <div>
                <dt><code>whisper</code> — Fading Presence</dt>
                <dd class="text-small text-mute">
                  Opacity and scale recede together. Ghosts speaking, fading
                  memories, telepathy, secrets shared in near-silence, dying
                  words.
                </dd>
              </div>
              <div>
                <dt><code>fade</code> — Consciousness Dissolve</dt>
                <dd class="text-small text-mute">
                  Gradual opacity drift to half visibility. Losing
                  consciousness, drugged, time skip, memory dissolving, falling
                  asleep.
                </dd>
              </div>
              <div>
                <dt><code>freeze</code> — Cold Stillness</dt>
                <dd class="text-small text-mute">
                  Micro scale contraction with brightness reduction. Ice magic,
                  paralysis, time freeze, petrification, stasis.
                </dd>
              </div>
              <div>
                <dt><code>burn</code> — Heat Distortion</dt>
                <dd class="text-small text-mute">
                  Vertical micro-wobble with skew at fast rhythm. Fire scenes,
                  desert heat, rage, fever, volcanic environments.
                </dd>
              </div>
              <div>
                <dt><code>static</code> — Signal Noise</dt>
                <dd class="text-small text-mute">
                  Rapid micro-jitter layered with opacity flicker. Radio
                  transmission, broken comms, digital interference, corrupted
                  data.
                </dd>
              </div>
              <div>
                <dt><code>distort</code> — Woozy Perception</dt>
                <dd class="text-small text-mute">
                  Subtle rotation with asymmetric scale oscillation. Drunk,
                  poisoned, hallucinating, vertigo, psychic influence,
                  concussion.
                </dd>
              </div>
              <div>
                <dt><code>sway</code> — Lateral Oscillation</dt>
                <dd class="text-small text-mute">
                  Horizontal sine wave. Ship travel, storms, unstable footing,
                  earthquake aftermath, rope bridges, moving vehicles.
                </dd>
              </div>
            </dl>
          </div>

          <p class="text-caption text-mute">
            Most steps should have no effect. Effects are seasoning — contrast
            and restraint make them land.
          </p>
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

<style lang="scss">
  .narrative-test-scroll {
    max-height: 320px; // void-ignore
    overflow-y: auto;
    padding: var(--space-md);
    flex: 1;
  }
</style>
