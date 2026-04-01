<script lang="ts">
  import { RotateCcw } from '@lucide/svelte';
  import Selector from '@components/ui/Selector.svelte';
  import Switcher from '@components/ui/Switcher.svelte';
  import SliderField from '@components/ui/SliderField.svelte';
  import Toggle from '@components/ui/Toggle.svelte';
  import IconBtn from '@components/ui/IconBtn.svelte';
  import PlayPause from '@components/icons/PlayPause.svelte';
  import KineticText from '@dgrslabs/void-energy-kinetic-text/component';
  import { createVoidEnergyTextStyleSnapshot } from '@dgrslabs/void-energy-kinetic-text/adapters/void-energy-host';
  import type {
    KineticTextEffect,
    RevealMode,
    RevealStyle,
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
  const SAMPLE_DECODE = 'VOID ENERGY :: PREMIUM KINETIC TEXT';
  const SAMPLE_SCRAMBLE =
    'Letters scattered across dimensions reassemble into meaning.';
  const SAMPLE_RISE =
    'From the depths below, each letter climbs toward the light.';
  const SAMPLE_DROP =
    'Gravity pulls every word into place, heavy and deliberate.';
  const SAMPLE_POP =
    'Chaos snaps into order. Every glyph finds its home in an instant.';
  const SAMPLE_RANDOM =
    'Positions fill at random, each letter finding its place unpredictably.';

  // ── Replay counters ──────────────────────────────────────────────

  let replayChar = $state(0);
  let replayWord = $state(0);
  let replayDecode = $state(0);
  let replayRevealStyle = $state(0);
  let replayRevealScramble = $state(0);
  let replayRevealRise = $state(0);
  let replayRevealDrop = $state(0);
  let replayRevealPop = $state(0);
  let replayRevealRandom = $state(0);

  // ── Interactive Sandbox ──────────────────────────────────────────

  const SANDBOX_TEXT =
    'There is a place between the signal and the silence where light forgets its name. Columns of pale geometry rise from nothing, casting shadows that fall upward into a sky made entirely of distance. The air does not move but somehow carries the memory of motion — a low hum, a half-breath, the faintest pressure of something vast deciding whether to arrive. Surfaces shift without changing. Edges soften and re-harden in cycles too slow to watch but too fast to ignore. Somewhere beneath the visible layer, a rhythm persists: not sound, not quite vibration, but the kind of presence that makes dust pause mid-fall. Time here is not broken — it is simply optional. Things happen in the order they choose, and the space between moments stretches wide enough to walk through. Nothing begins. Nothing ends. Everything is already in the middle of becoming something it will never finish being.';

  const speedPresetOptions: SelectorOption[] = [
    { value: 'fast', label: 'Fast' },
    { value: 'rapid', label: 'Rapid' },
    { value: 'instant', label: 'Instant' },
  ];

  const sandboxRevealStyleOptions: SelectorOption[] = [
    { value: 'auto', label: 'Auto (Pop)' },
    { value: 'pop', label: 'Pop' },
    { value: 'blur', label: 'Blur' },
    { value: 'scale', label: 'Scale' },
    { value: 'scramble', label: 'Scramble' },
    { value: 'rise', label: 'Rise' },
    { value: 'drop', label: 'Drop' },
    { value: 'random', label: 'Random' },
    { value: 'instant', label: 'Instant' },
  ];

  const sandboxContinuousOptions: SelectorOption[] = [
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
    { value: 'glow', label: 'Glow' },
    { value: 'wave', label: 'Wave' },
    { value: 'float', label: 'Float' },
    { value: 'wobble', label: 'Wobble' },
    { value: 'sparkle', label: 'Sparkle' },
    { value: 'drip', label: 'Drip' },
    { value: 'stretch', label: 'Stretch' },
    { value: 'vibrate', label: 'Vibrate' },
    { value: 'haunt', label: 'Haunt' },
  ];

  const sandboxOneShotOptions: SelectorOption[] = [
    { value: '', label: 'None' },
    { value: 'shake', label: 'Shake' },
    { value: 'quake', label: 'Quake' },
    { value: 'jolt', label: 'Jolt' },
    { value: 'glitch', label: 'Glitch' },
    { value: 'surge', label: 'Surge' },
    { value: 'warp', label: 'Warp' },
    { value: 'explode', label: 'Explode' },
    { value: 'collapse', label: 'Collapse' },
    { value: 'scatter', label: 'Scatter' },
    { value: 'spin', label: 'Spin' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'flash', label: 'Flash' },
    { value: 'shatter', label: 'Shatter' },
    { value: 'vortex', label: 'Vortex' },
    { value: 'ripple', label: 'Ripple' },
    { value: 'slam', label: 'Slam' },
  ];

  let sbRevealStyle: string | number | null = $state('auto');
  let sbContinuous: string | number | null = $state('');
  let sbOneShot: string | number | null = $state('');
  let sbSpeed = $state(40);
  let sbReplay = $state(0);
  let sbOneShotFire = $state(0);

  // ── Reveal Modes section state ───────────────────────────────────
  let rmSpeedPreset: string | number | null = $state('fast');
  let rmCursor = $state(false);

  function fireOneShot() {
    if (!sbOneShot) return;
    sbOneShotFire++;
  }

  function replaySandbox() {
    sbOneShotFire = 0;
    sbReplay++;
  }

  // ── Narrative effects demo data ────────────────────────────────

  type OneShotEffect =
    | 'shake'
    | 'quake'
    | 'jolt'
    | 'glitch'
    | 'surge'
    | 'warp'
    | 'explode'
    | 'collapse'
    | 'scatter'
    | 'spin'
    | 'bounce'
    | 'flash'
    | 'shatter'
    | 'vortex'
    | 'ripple'
    | 'slam';
  type ContinuousEffect =
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

  interface EffectDemo<T extends KineticTextEffect> {
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
    {
      effect: 'explode',
      label: 'Explode',
      context: 'Detonation, supernova, rage unleashed, catastrophic failure',
      text: 'The reactor core breached and the entire deck erupted outward in a bloom of white fire.',
      note: 'Radial blast — each character flies outward from center with full rotation, then reassembles.',
    },
    {
      effect: 'collapse',
      label: 'Collapse',
      context: 'Building demolition, cave-in, defeat, structural failure',
      text: 'The ceiling gave way in slow sections, each beam dragging the next down into rubble.',
      note: 'Gravity-driven fall with tumbling rotation. Characters drop and spring back.',
    },
    {
      effect: 'scatter',
      label: 'Scatter',
      context:
        'Wind dispersal, crowd fleeing, memory fragmenting, ash drifting',
      text: 'The ashes caught the wind and drifted apart, each fragment carrying a piece of what was.',
      note: 'Gentle drift in random directions with slow rotation and fade. Softer than explode.',
    },
    {
      effect: 'spin',
      label: 'Spin',
      context:
        'Vertigo, tornado, magical transformation, mechanical activation',
      text: 'The lock mechanism turned and every gear in the vault door began to spin in sequence.',
      note: 'Full 360° rotation per character with scale pulse at midpoint. Staggered domino wave.',
    },
    {
      effect: 'bounce',
      label: 'Bounce',
      context: 'Landing impact, playful energy, rubber physics, ground pound',
      text: 'She hit the trampoline and the whole surface launched her three stories into the air.',
      note: 'Characters drop, hit a floor, and bounce with decreasing amplitude. Elastic timing.',
    },
    {
      effect: 'flash',
      label: 'Flash',
      context: 'Lightning, camera flash, revelation, energy discharge',
      text: 'Lightning split the sky and for one instant everything was visible — every face, every weapon, every lie.',
      note: 'Quick scale-up pulse with brightness burst rippling across characters. Short and punchy.',
    },
    {
      effect: 'shatter',
      label: 'Shatter',
      context: 'Glass breaking, reality cracking, shield failure, ice fracture',
      text: 'The barrier cracked along invisible fault lines and fell apart like a dropped mirror.',
      note: 'Sharp angular displacement with skew — like broken glass pieces flying apart and reforming.',
    },
    {
      effect: 'vortex',
      label: 'Vortex',
      context: 'Black hole, whirlpool, summoning ritual, dimensional tear',
      text: 'The air began to spiral inward, pulling sound and light and breath toward a single impossible point.',
      note: 'Characters spiral inward with accelerating rotation and scale-down, then release back.',
    },
    {
      effect: 'ripple',
      label: 'Ripple',
      context: 'Shockwave, water surface, sonic boom, psychic wave',
      text: 'The impact sent a visible wave through the ground that reached them two heartbeats later.',
      note: 'Vertical wave propagating left-to-right through text. Phase-based delay creates traveling motion.',
    },
    {
      effect: 'slam',
      label: 'Slam',
      context: 'Heavy impact, dramatic entrance, gavel strike, boss landing',
      text: 'The creature landed from impossible height and the stone crater beneath it spread in every direction.',
      note: 'Characters scale up huge then slam to normal with downward overshoot. Heavy, impactful.',
    },
  ] satisfies EffectDemo<OneShotEffect>[];

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
  ] satisfies EffectDemo<ContinuousEffect>[];

  // ── Effects state (KineticText per-character) ────────────────────

  let oneShotReplay = $state<Record<OneShotEffect, number>>({
    shake: 0,
    quake: 0,
    jolt: 0,
    glitch: 0,
    surge: 0,
    warp: 0,
    explode: 0,
    collapse: 0,
    scatter: 0,
    spin: 0,
    bounce: 0,
    flash: 0,
    shatter: 0,
    vortex: 0,
    ripple: 0,
    slam: 0,
  });

  let activeContinuousEffects = $state<
    Record<ContinuousEffect, ContinuousEffect | null>
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

  function toggleContinuousLoop(effect: ContinuousEffect) {
    activeContinuousEffects[effect] = activeContinuousEffects[effect]
      ? null
      : effect;
  }

  function buildOneShotCue(effect: OneShotEffect): KineticCue[] {
    return [
      {
        id: `${effect}-punch`,
        effect,
        trigger: 'on-complete',
      },
    ];
  }
</script>

<div class="container flex flex-col gap-2xl py-2xl" bind:this={snapshotEl}>
  <!-- ─── INTERACTIVE SANDBOX ──────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <header class="flex flex-col gap-xs items-center text-center">
      <h1 class="text-primary">Kinetic Text</h1>
      <p class="text-body text-dim max-w-3xl">
        Premium character-level kinetic typography. 3 reveal modes, 7 reveal
        styles, 3 speed presets, 34 effects, physics-aware motion, and
        per-character animation parameters.
      </p>
    </header>

    <div class="surface-raised p-lg flex flex-col gap-lg">
      {#if snapshot}
        <div class="surface-sunk p-lg">
          {#key sbReplay}
            <KineticText
              text={SANDBOX_TEXT}
              styleSnapshot={snapshot}
              revealMode="word"
              revealStyle={sbRevealStyle === 'auto'
                ? undefined
                : (sbRevealStyle as RevealStyle)}
              activeEffect={sbContinuous
                ? (sbContinuous as KineticTextEffect)
                : null}
              speed={sbSpeed}
              oneShotEffect={sbOneShot
                ? (sbOneShot as KineticTextEffect)
                : null}
              oneShotTrigger={sbOneShotFire}
            />
          {/key}
        </div>
      {/if}

      <!-- Reveal settings -->
      <div class="flex flex-col gap-xs">
        <h6 class="text-mute">Reveal</h6>
        <div class="flex flex-wrap items-end gap-md">
          <Selector
            label="Reveal Style"
            options={sandboxRevealStyleOptions}
            bind:value={sbRevealStyle}
            onchange={() => replaySandbox()}
          />
          <SliderField
            label="Speed"
            bind:value={sbSpeed}
            min={4}
            max={80}
            step={2}
            presets={[
              { value: 40, label: 'Fast' },
              { value: 20, label: 'Rapid' },
              { value: 8, label: 'Instant' },
            ]}
          />
        </div>
      </div>

      <!-- Effects -->
      <div class="flex flex-col gap-xs">
        <h6 class="text-mute">Effects</h6>
        <div class="flex flex-wrap items-end gap-md">
          <Selector
            label="Continuous"
            options={sandboxContinuousOptions}
            bind:value={sbContinuous}
          />
          <div class="flex items-end gap-sm">
            <Selector
              label="One-Shot"
              options={sandboxOneShotOptions}
              bind:value={sbOneShot}
            />
            <IconBtn
              aria-label="Fire one-shot effect"
              icon={PlayPause}
              onclick={fireOneShot}
              disabled={!sbOneShot}
            />
          </div>
        </div>
      </div>

      <!-- Playback controls -->
      <div class="flex items-center gap-md">
        <button
          class="btn-icon"
          aria-label="Replay from beginning"
          onclick={replaySandbox}
        >
          <RotateCcw class="icon" data-size="sm" />
        </button>
      </div>
    </div>
  </section>

  <!-- ─── REVEAL MODES ─────────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Reveal Modes</h2>
        <p class="text-dim">
          Three modes control how text enters the viewport. Each mode adapts its
          timing, cursor behavior, and physics response automatically.
        </p>
      </div>

      <div class="flex flex-wrap items-end gap-md">
        <Selector
          label="Speed"
          options={speedPresetOptions}
          bind:value={rmSpeedPreset}
          onchange={() => {
            replayChar++;
            replayWord++;
            replayDecode++;
          }}
        />
        <Toggle label="Cursor" bind:checked={rmCursor} hideIcons />
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
                speedPreset={rmSpeedPreset as 'fast' | 'rapid' | 'instant'}
                cursor={rmCursor}
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
                speedPreset={rmSpeedPreset as 'fast' | 'rapid' | 'instant'}
                cursor={rmCursor}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Word-by-word with fast internal character reveal. Creates an
            AI-generation streaming feel.
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
                speedPreset={rmSpeedPreset as 'fast' | 'rapid' | 'instant'}
                stagger={30}
                scramblePasses={6}
                cursor={rmCursor}
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

  <!-- ─── REVEAL STYLES ─────────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Reveal Styles</h2>
        <p class="text-dim">
          Seven visual transitions for how characters enter the viewport. Each
          style uses per-character parameters for organic, unique motion.
          Physics presets auto-select blur (glass), scale (flat), or instant
          (retro) — or override explicitly.
        </p>
      </div>

      {#if snapshot}
        <!-- Auto (default = Pop) -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Auto (Default)</h6>
            <button class="btn-icon" onclick={() => replayRevealStyle++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayRevealStyle}
              <KineticText
                text="Pop is the universal default. Characters snap into place from random offsets on every physics preset."
                styleSnapshot={snapshot}
                revealMode="char"
                speed={45}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Pop is used for all physics presets by default. The reveal style is
            physics-agnostic — same animation on glass, flat, and retro.
          </p>
        </div>

        <!-- Scramble -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Scramble</h6>
            <button class="btn-icon" onclick={() => replayRevealScramble++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayRevealScramble}
              <KineticText
                text={SAMPLE_SCRAMBLE}
                styleSnapshot={snapshot}
                revealStyle="scramble"
                revealMode="char"
                speed={45}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Each character flies in from a random position and rotation,
            settling with spring overshoot. Wide radius, heavy rotation.
          </p>
        </div>

        <!-- Rise -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Rise</h6>
            <button class="btn-icon" onclick={() => replayRevealRise++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayRevealRise}
              <KineticText
                text={SAMPLE_RISE}
                styleSnapshot={snapshot}
                revealStyle="rise"
                revealMode="char"
                speed={45}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Characters ascend from below with slight rotation and scale. Glass
            adds blur trail during ascent. Elegant, uplifting entrance.
          </p>
        </div>

        <!-- Drop -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Drop</h6>
            <button class="btn-icon" onclick={() => replayRevealDrop++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayRevealDrop}
              <KineticText
                text={SAMPLE_DROP}
                styleSnapshot={snapshot}
                revealStyle="drop"
                revealMode="char"
                speed={45}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Characters fall from above with gravity feel. Overshoots on landing
            with a subtle bounce. Heavy, deliberate entrance.
          </p>
        </div>

        <!-- Pop -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Pop</h6>
            <button class="btn-icon" onclick={() => replayRevealPop++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayRevealPop}
              <KineticText
                text={SAMPLE_POP}
                styleSnapshot={snapshot}
                revealStyle="pop"
                revealMode="char"
                speed={30}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Characters pop in from random offsets — fast, chaotic entrance.
            Universal default for all physics presets. Snappy and energetic.
          </p>
        </div>

        <!-- Random -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Random</h6>
            <button class="btn-icon" onclick={() => replayRevealRandom++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayRevealRandom}
              <KineticText
                text={SAMPLE_RANDOM}
                styleSnapshot={snapshot}
                revealStyle="random"
                revealMode="char"
                speed={30}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Characters appear in randomized order with a simple fade. The reveal
            order is shuffled — positions fill unpredictably rather than
            left-to-right.
          </p>
        </div>
      {/if}
    </div>
  </section>

  <!-- ─── NARRATIVE EFFECTS ─────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Per-Character Effects</h2>
        <p class="text-dim">
          28 effects with unique per-character animation parameters. Every
          character gets its own displacement, rotation, and timing — creating
          organic, alive motion. One-shot effects fire via the cue system after
          reveal completes; continuous effects loop immediately.
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
            Every character receives unique CSS custom properties (<code
              >--kt-dx</code
            >, <code>--kt-dy</code>,
            <code>--kt-rotate</code>, <code>--kt-scale</code>, etc.) computed by
            a seeded PRNG. Parametric keyframes read these variables, so the
            same animation produces different motion per character — shake makes
            each letter jitter with its own amplitude, drift floats each
            character at a different height.
          </p>
          <p>
            Physics styling adapts automatically. Glass adds motion blur on
            displacement-heavy effects, flat keeps the raw curves clean, and
            retro applies per-effect stepped timing.
          </p>
        </div>
      </details>

      <div class="flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <h5>One-Shot Effects</h5>
          <p class="text-caption text-mute">
            Punctuation moments. Text reveals word-by-word, then each character
            animates independently via the cue system on completion.
          </p>
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
                    revealMode="char"
                    revealStyle="instant"
                    stagger={0}
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
        <div class="flex flex-col gap-xs">
          <h5>Continuous Effects</h5>
          <p class="text-caption text-mute">
            Sustained atmosphere loops. Each character animates independently
            with unique parameters — toggle to see per-character motion.
          </p>
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
                    onclick={() => toggleContinuousLoop(demo.effect)}
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
                  speed={0}
                  activeEffect={activeContinuousEffects[demo.effect]}
                />

                <p class="text-caption text-mute">{demo.note}</p>
              </div>
            {/each}
          </div>
        {/if}
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
              <div>
                <dt><code>explode</code> — Radial Blast</dt>
                <dd class="text-small text-mute">
                  Characters fly outward from center with full rotation and
                  scale-to-zero, then reassemble. Detonations, supernovae,
                  catastrophic failure.
                </dd>
              </div>
              <div>
                <dt><code>collapse</code> — Gravity Fall</dt>
                <dd class="text-small text-mute">
                  Characters fall downward with tumbling rotation, then spring
                  back. Building demolition, cave-ins, structural failure.
                </dd>
              </div>
              <div>
                <dt><code>scatter</code> — Gentle Dispersal</dt>
                <dd class="text-small text-mute">
                  Characters drift apart in random directions with slow rotation
                  and fade. Wind dispersal, memory fragmenting, ash drifting.
                </dd>
              </div>
              <div>
                <dt><code>spin</code> — Full Rotation</dt>
                <dd class="text-small text-mute">
                  Each character does a full 360° rotation with scale pulse.
                  Staggered domino wave. Vertigo, mechanical activation.
                </dd>
              </div>
              <div>
                <dt><code>bounce</code> — Elastic Impact</dt>
                <dd class="text-small text-mute">
                  Characters drop, hit a floor, and bounce with decreasing
                  amplitude. Landing impacts, playful energy, ground pounds.
                </dd>
              </div>
              <div>
                <dt><code>flash</code> — Brightness Burst</dt>
                <dd class="text-small text-mute">
                  Quick scale-up pulse with brightness burst rippling across
                  characters. Lightning, camera flash, energy discharge.
                </dd>
              </div>
              <div>
                <dt><code>shatter</code> — Fragmentation</dt>
                <dd class="text-small text-mute">
                  Sharp angular displacement with skew, like broken glass
                  pieces. Glass breaking, reality cracking, shield failure.
                </dd>
              </div>
              <div>
                <dt><code>vortex</code> — Spiral Collapse</dt>
                <dd class="text-small text-mute">
                  Characters spiral inward with accelerating rotation and
                  scale-down. Black holes, whirlpools, summoning rituals.
                </dd>
              </div>
              <div>
                <dt><code>ripple</code> — Traveling Wave</dt>
                <dd class="text-small text-mute">
                  Vertical wave propagating left-to-right through text.
                  Shockwaves, water surfaces, sonic booms.
                </dd>
              </div>
              <div>
                <dt><code>slam</code> — Heavy Impact</dt>
                <dd class="text-small text-mute">
                  Characters scale up huge then slam to normal with overshoot.
                  Heavy impacts, dramatic entrances, boss landings.
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
</div>
