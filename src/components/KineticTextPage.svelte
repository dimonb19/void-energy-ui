<script lang="ts">
  import { RotateCcw } from '@lucide/svelte';
  import Restart from '@components/icons/Restart.svelte';
  import Selector from '@components/ui/Selector.svelte';
  import Switcher from '@components/ui/Switcher.svelte';

  import ActionBtn from '@components/ui/ActionBtn.svelte';
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
  import { emerge, dissolve } from '@lib/transitions.svelte';

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

  const SAMPLE_CHAR =
    'System initializing... scanning environment. All modules online. Reactor stable at nominal output. Navigation locked. Awaiting command input.';
  const SAMPLE_WORD =
    'The void engine adapts to every atmosphere. Glass physics create translucent surfaces with depth and glow — layers of light stacked behind frosted panes. Flat physics produce clean, minimal interfaces where geometry speaks louder than ornament. Retro physics channel the warmth of CRT phosphor, every edge hard-cut, every transition instant, every surface lit from within by a memory of analog light.';
  const SAMPLE_DECODE =
    'VOID ENERGY :: PREMIUM KINETIC TEXT :: DECODE SEQUENCE ACTIVE';
  const SAMPLE_SCRAMBLE =
    'Letters scattered across dimensions reassemble into meaning. Each glyph tumbles through space, spinning from impossible angles, converging on the exact coordinate where language begins to make sense again.';
  const SAMPLE_RISE =
    'From the depths below, each letter climbs toward the light. They rise one after another, buoyant and unhurried, ascending through invisible layers of atmosphere until they settle into the sentence they were always meant to form.';
  const SAMPLE_DROP =
    'Gravity pulls every word into place, heavy and deliberate. Each character falls from somewhere above the frame, accelerating downward with the weight of certainty, landing with just enough force to know it belongs exactly where it stopped.';
  const SAMPLE_POP =
    'Chaos snaps into order. Every glyph finds its home in an instant — a burst of motion collapsing into stillness. One moment the space is empty, the next a complete thought exists, assembled from nothing in a single frame of controlled disorder.';
  const SAMPLE_RANDOM =
    'Positions fill at random, each letter finding its place unpredictably. The sequence defies expectation — a character from the middle appears first, then one from the end, then the start. Order emerges not from left to right but from chance itself.';
  const SAMPLE_SCALE =
    'Every character starts as nothing — a dimensionless point — and expands outward into its full shape. The growth is swift and precise, each letter claiming its space with the confidence of something that knows exactly how large it is meant to be.';
  const SAMPLE_BLUR =
    'Focus sharpens one letter at a time. Each glyph emerges from a soft haze, its edges resolving from diffuse light into crisp geometry. The effect is cinematic — a rack focus pulling meaning out of visual noise, word by word.';

  // ── Replay counters ──────────────────────────────────────────────

  let replayChar = $state(0);
  let replayWord = $state(0);
  let replayDecode = $state(0);
  let replayRevealScramble = $state(0);
  let replayRevealRise = $state(0);
  let replayRevealDrop = $state(0);
  let replayRevealPop = $state(0);
  let replayRevealRandom = $state(0);
  let replayRevealScale = $state(0);
  let replayRevealBlur = $state(0);

  // ── Hero Showcase Scenes ──────────────────────────────────────────

  interface HeroScene {
    id: string;
    label: string;
    description: string;
    text: string;
    revealMode: RevealMode;
    revealStyle: RevealStyle;
    continuous: KineticTextEffect | null;
    oneShot: KineticTextEffect;
    cues: KineticCue[];
    speed: number;
  }

  const heroScenes: HeroScene[] = [
    {
      id: 'digital-corruption',
      label: 'Corruption',
      description: 'Distort continuous · Spin on demand · Scramble reveal',
      text: "The signal fractured into static and rebuilt itself from noise. Every fragment carried a different version of the truth, reassembling into something that looked correct but felt borrowed from a parallel transmission. She disconnected the feed, reconnected — and heard her own voice reading back the log entry she hadn't written yet. The timestamp was three hours ahead. The words described a corridor she hadn't entered and a door she hadn't opened. She deleted the log, but the next morning it was back, longer this time, written in a hand she almost recognized as her own.",
      revealMode: 'word',
      revealStyle: 'scramble',
      continuous: 'distort',
      oneShot: 'spin',

      cues: [],
      speed: 40,
    },
    {
      id: 'signal-interference',
      label: 'Interference',
      description: 'Static continuous · Glitch on demand · Rise reveal',
      text: 'The transmission broke apart three hundred kilometers from the relay tower. What arrived was half language, half noise — consonants sheared off mid-syllable, vowels stretched into tones no human mouth could hold. Buried in the interference she could almost hear a rhythm, something that repeated every eleven seconds like a heartbeat made of broken glass. The technician ran the recording backward and found words nested inside the static — coordinates, a name, a date six weeks from now. The signal was not failing. It was answering a question nobody had asked yet.',
      revealMode: 'word',
      revealStyle: 'rise',
      continuous: 'static',
      oneShot: 'glitch',
      cues: [],
      speed: 35,
    },
    {
      id: 'heartbeat-protocol',
      label: 'Heartbeat',
      description: 'Pulse continuous · Surge on demand · Drop reveal',
      text: 'The seal beneath the altar began to glow in a slow, deliberate rhythm — bright enough to cast shadows on the vaulted ceiling above. Each pulse traveled outward through the stone floor in concentric rings. At pulse sixty the light shifted from amber to deep arterial red and the temperature dropped by exactly four degrees. Nobody moved. The priest counted under his breath, matching each beat. At pulse ninety the walls began to hum, a low vibration that climbed through the soles of their boots and settled behind their teeth. The light was no longer pulsing. It was breathing.',
      revealMode: 'word',
      revealStyle: 'drop',
      continuous: 'pulse',
      oneShot: 'surge',
      cues: [],
      speed: 40,
    },
    {
      id: 'ghost-frequency',
      label: 'Ghost',
      description: 'Whisper continuous · Ripple on demand · Blur reveal',
      text: 'The voice arrived so quietly that she mistook it for the building settling. It came again — not through her ears but somewhere behind them, a presence that occupied the space between sounds. Words formed at the edge of recognition: fragments of a conversation she had never had, spoken in a cadence that matched her own breathing. She held perfectly still and let it continue. The voice described the room she was standing in — the cracked tile near the window, the water stain on the ceiling, the exact number of steps between the door and the place where she stood listening to a ghost describe her own silence.',
      revealMode: 'word',
      revealStyle: 'blur',
      continuous: 'whisper',
      oneShot: 'ripple',
      cues: [],
      speed: 45,
    },
    {
      id: 'thermal-overload',
      label: 'Thermal',
      description: 'Burn continuous · Quake on demand · Scale reveal',
      text: 'Heat rolled off the sand in visible waves, warping the horizon into a shimmering ribbon of light. The thermometer read sixty-three degrees and was still climbing. The asphalt had gone viscous, holding bootprints like wet clay. Somewhere to the south the fire line advanced at walking pace, consuming everything it touched with a patience that felt almost deliberate. Metal fences ticked and pinged as they expanded. The air tasted of copper and burnt resin. By noon the sky had turned the color of old paper and the shadows had disappeared entirely, swallowed by a light so total it erased depth itself.',
      revealMode: 'word',
      revealStyle: 'scale',
      continuous: 'burn',
      oneShot: 'quake',
      cues: [],
      speed: 35,
    },
  ];

  const heroSceneOptions: SwitcherOption[] = heroScenes.map((s) => ({
    value: s.id,
    label: s.label,
  }));

  let activeSceneId: string | number | null = $state('digital-corruption');
  let heroReplay = $state(0);
  let heroOneShotTrigger = $state(0);

  const activeScene = $derived(
    heroScenes.find((s) => s.id === activeSceneId) ?? heroScenes[0],
  );

  function replayHero() {
    heroOneShotTrigger = 0;
    heroReplay++;
  }

  function fireHeroOneShot() {
    heroOneShotTrigger++;
  }

  const speedPresetOptions: SelectorOption[] = [
    { value: 'slow', label: 'Slow' },
    { value: 'default', label: 'Default' },
    { value: 'fast', label: 'Fast' },
    { value: 'instant', label: 'Instant' },
  ];

  // Word mode: `speed` = inter-word delay, `charSpeed` = within-word stagger.
  // Char/Decode modes: `stagger` drives all timing (speed prop is ignored).
  const REVEAL_SPEEDS: Record<
    string,
    { wordSpeed: number; wordCharSpeed: number; charStagger: number }
  > = {
    slow: { wordSpeed: 120, wordCharSpeed: 12, charStagger: 80 },
    default: { wordSpeed: 60, wordCharSpeed: 6, charStagger: 40 },
    fast: { wordSpeed: 25, wordCharSpeed: 2, charStagger: 15 },
    instant: { wordSpeed: 8, wordCharSpeed: 0, charStagger: 4 },
  };

  // ── Reveal Modes section state ───────────────────────────────────
  let revealSpeedPreset: string | number | null = $state('default');
  const revealSpeeds = $derived(
    REVEAL_SPEEDS[String(revealSpeedPreset)] ?? REVEAL_SPEEDS.default,
  );

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
    | 'sway'
    | 'glow'
    | 'wave'
    | 'float'
    | 'wobble'
    | 'sparkle'
    | 'drip'
    | 'stretch'
    | 'vibrate'
    | 'haunt';

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
    {
      effect: 'glow',
      label: 'Glow',
      context:
        'Enchantment, bioluminescence, divine presence, energy radiation',
      text: 'The runes carved into the archway began to shine, each symbol brightening in slow succession until the whole frame radiated a steady, sourceless light.',
      note: 'Brightness emission cycle. Characters pulse luminosity independently.',
    },
    {
      effect: 'wave',
      label: 'Wave',
      context: 'Ocean, crowd motion, musical rhythm, energy propagation',
      text: 'The crowd moved as one body, a slow undulation that traveled from the front rows to the back like a tide pulled by invisible hands.',
      note: 'Y sine wave with scale swell. Has secondary harmonic on word wrappers.',
    },
    {
      effect: 'float',
      label: 'Float',
      context:
        'Zero gravity, levitation, underwater suspension, astral projection',
      text: 'Objects lifted from the table without urgency — the pen, the glass, the folded letter — each drifting upward on its own slow trajectory, weightless and indifferent to the floor below.',
      note: 'Dual-axis drift with micro rotation. Has secondary harmonic. Gentler than drift.',
    },
    {
      effect: 'wobble',
      label: 'Wobble',
      context: 'Instability, jelly physics, cartoon impact, uncertain footing',
      text: 'The tower of stacked crates swayed dangerously with each footstep, every layer shifting just enough to keep everyone holding their breath.',
      note: 'Micro rotation oscillation. Quick, playful instability.',
    },
    {
      effect: 'sparkle',
      label: 'Sparkle',
      context:
        'Magic particles, starlight, treasure glint, fairy dust, celebration',
      text: 'Dust caught the last ray of sunlight and the whole cavern erupted in pinpoints of gold, each mote flickering at its own rhythm like a sky full of earthbound stars.',
      note: 'Opacity twinkle with randomized phase per character. Shimmer effect.',
    },
    {
      effect: 'drip',
      label: 'Drip',
      context: 'Rain, melting, decay, liquid surfaces, cave dripping',
      text: 'Water gathered along the ceiling in slow beads, each one stretching downward until gravity won and it fell, replaced immediately by the next.',
      note: 'Gravity-like downward Y drift. Characters slowly sink and reset.',
    },
    {
      effect: 'stretch',
      label: 'Stretch',
      context:
        'Distortion fields, elastic matter, body horror, spatial warping',
      text: 'The reflection in the funhouse mirror elongated her face until she no longer recognized the shape looking back. Every feature pulled in a direction it was never meant to go.',
      note: 'Scale Y elongation cycle. Characters stretch vertically and compress back.',
    },
    {
      effect: 'vibrate',
      label: 'Vibrate',
      context: 'Machinery, engines, electrical charge, intense energy, alarm',
      text: 'The generator hummed at a frequency she could feel in her teeth. Every surface in the room buzzed with sympathetic resonance, blurring the edges of solid objects.',
      note: 'High-frequency positional jitter. Faster and tighter than tremble.',
    },
    {
      effect: 'haunt',
      label: 'Haunt',
      context: 'Ghosts, afterimages, fading memories, liminal spaces, echoes',
      text: 'The figure stood at the end of the corridor, visible only in the way smoke is visible — present and absent at the same time, fading in and out of the dim light with the patience of something that had been waiting for centuries.',
      note: 'Ghostly drift with deep opacity cycling. Has secondary harmonic. Very slow, unsettling.',
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
    glow: null,
    wave: null,
    float: null,
    wobble: null,
    sparkle: null,
    drip: null,
    stretch: null,
    vibrate: null,
    haunt: null,
  });

  function toggleContinuousLoop(effect: ContinuousEffect) {
    activeContinuousEffects[effect] = activeContinuousEffects[effect]
      ? null
      : effect;
  }
</script>

<div class="container flex flex-col gap-2xl py-2xl" bind:this={snapshotEl}>
  <!-- ─── HERO ─────────────────────────────────────────────────────── -->
  <header class="flex flex-col gap-lg items-center text-center">
    <h1 class="text-primary">Kinetic Text</h1>
    <p class="text-body text-dim max-w-3xl">
      Character-level kinetic typography. Every letter is an independent element
      — revealed, animated, and reactive in real time.
    </p>
  </header>

  <!-- ─── SHOWCASE ────────────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <p class="text-dim">
        Three effect layers run simultaneously and compose together.
        <strong>Reveal</strong> controls how text first appears — typewriter,
        word-by-word, decode, scramble, rise, drop.
        <strong>Continuous</strong> effects keep text alive after reveal —
        drift, breathe, flicker, burn, distort.
        <strong>One-shot</strong> effects fire on demand for dramatic punctuation
        — shake, explode, shatter, surge, glitch. A single block of text can be revealing
        with one style, settling into a living continuous rhythm, and reacting to
        one-shot events — all at the same time.
      </p>

      {#if snapshot}
        <div class="surface-sunk p-lg" in:emerge out:dissolve>
          {#key `${activeScene.id}-${heroReplay}`}
            <KineticText
              text={activeScene.text}
              styleSnapshot={snapshot}
              revealMode={activeScene.revealMode}
              revealStyle={activeScene.revealStyle}
              activeEffect={activeScene.continuous}
              speed={activeScene.speed}
              cues={activeScene.cues}
              oneShotEffect={activeScene.oneShot}
              oneShotTrigger={heroOneShotTrigger}
            />
          {/key}
        </div>
      {/if}

      <div class="flex items-center justify-center gap-md">
        <ActionBtn
          class="btn-system"
          icon={Restart}
          text="Replay"
          onclick={replayHero}
        />
        <ActionBtn
          class="btn-premium"
          icon={PlayPause}
          text="Fire {activeScene.oneShot}"
          onclick={fireHeroOneShot}
        />
      </div>

      <div class="flex flex-col gap-xs">
        <Switcher
          options={heroSceneOptions}
          bind:value={activeSceneId}
          onchange={() => replayHero()}
        />
        <p class="text-caption text-mute text-center">
          {activeScene.description}
        </p>
      </div>

      <!-- ─── Technical Context ──────────────────────────────────────── -->
      <details>
        <summary class="text-dim">How it works</summary>
        <div class="p-md flex flex-col gap-md">
          <p>
            Kinetic Text is built on <a
              href="https://github.com/chenglou/pretext"
              target="_blank"
              rel="noopener noreferrer"
              class="text-link">Pretext</a
            > — Cheng Lou's zero-DOM text measurement engine. Pretext solves the
            hard problem of measuring and laying out text without triggering browser
            reflow, using pure arithmetic over the browser's font engine. Kinetic
            Text uses Pretext to compute per-character positions, then animates every
            glyph independently.
          </p>
          <p class="text-caption text-mute">
            Pretext is MIT-licensed open source. Kinetic Text bundles it as a
            direct dependency.
          </p>
        </div>
      </details>
    </div>
  </section>

  <!-- ─── PER-CHARACTER EFFECTS ──────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Per-Character Effects</h2>
        <p class="text-dim">
          Kinetic Text runs three independent effect layers in parallel on every
          block of text. <strong>Reveal</strong> controls how text first appears
          — the entrance animation covered above. <strong>Continuous</strong>
          effects loop after reveal completes, sustaining mood and atmosphere throughout
          a scene — drift, breathe, flicker, burn, distort.
          <strong>One-shot</strong> effects fire on demand for dramatic punctuation
          — shake, explode, shatter, surge, glitch. All three compose simultaneously:
          text can be revealing word-by-word while a continuous pulse loop runs,
          and a one-shot slam fires mid-scene. For TTS-driven narrative, one-shots
          pair naturally with speech events — fire a glitch when the voice falters,
          a surge when tension peaks.
        </p>
      </div>

      <details>
        <summary>Technical Details</summary>
        <div class="p-md flex flex-col gap-md">
          <p>
            The three layers are fully independent. Reveal is driven by the
            tick-based reveal engine. Continuous effects are applied via the
            <code>activeEffect</code> prop — an infinite CSS animation that
            starts immediately and persists until the prop changes. One-shot
            effects fire through the <strong>cue system</strong>
            (<code>on-complete</code> trigger after reveal, or imperative
            <code>oneShotTrigger</code> counter at any time). Swapping one layer
            does not interrupt the others.
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
            Punctuation moments. Hover a card to fire the effect, or click the
            button to replay.
          </p>
        </div>

        {#if snapshot}
          <div class="grid gap-lg tablet:grid-cols-2">
            {#each narrativeOneShotDemos as demo}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="kt-demo-card surface-sunk p-md flex flex-col gap-md h-full"
                onclick={() => oneShotReplay[demo.effect]++}
                onpointerenter={() => oneShotReplay[demo.effect]++}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    oneShotReplay[demo.effect]++;
                }}
              >
                <div class="flex items-start justify-between gap-md">
                  <div class="flex flex-col gap-xs">
                    <h6>{demo.label}</h6>
                    <p class="text-caption text-mute">{demo.context}</p>
                  </div>

                  <IconBtn aria-label="Replay {demo.label}" icon={PlayPause} />
                </div>

                <KineticText
                  text={demo.text}
                  styleSnapshot={snapshot}
                  preRevealed
                  oneShotEffect={demo.effect}
                  oneShotTrigger={oneShotReplay[demo.effect]}
                />

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
            with unique parameters. Pause any effect to compare.
          </p>
        </div>

        {#if snapshot}
          <div class="grid gap-lg tablet:grid-cols-2 large-desktop:grid-cols-3">
            {#each narrativeContinuousDemos as demo}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="kt-demo-card surface-sunk p-md flex flex-col gap-md h-full"
                onclick={() => toggleContinuousLoop(demo.effect)}
                onpointerenter={() => {
                  if (!activeContinuousEffects[demo.effect])
                    activeContinuousEffects[demo.effect] = demo.effect;
                }}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    toggleContinuousLoop(demo.effect);
                }}
              >
                <div class="flex items-start justify-between gap-md">
                  <div class="flex flex-col gap-xs">
                    <h6>{demo.label}</h6>
                    <p class="text-caption text-mute">{demo.context}</p>
                  </div>

                  <IconBtn
                    icon={PlayPause}
                    aria-label={activeContinuousEffects[demo.effect]
                      ? 'Pause'
                      : 'Play'}
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
                  preRevealed
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
              <div>
                <dt><code>glow</code> — Luminous Emission</dt>
                <dd class="text-small text-mute">
                  Brightness emission cycle. Enchantment, bioluminescence,
                  divine presence, energy radiation, rune activation.
                </dd>
              </div>
              <div>
                <dt><code>wave</code> — Propagating Motion</dt>
                <dd class="text-small text-mute">
                  Y sine wave with scale swell and secondary harmonic. Ocean,
                  crowd motion, musical rhythm, energy propagation.
                </dd>
              </div>
              <div>
                <dt><code>float</code> — Weightless Suspension</dt>
                <dd class="text-small text-mute">
                  Dual-axis drift with micro rotation and secondary harmonic.
                  Zero gravity, levitation, underwater, astral projection.
                </dd>
              </div>
              <div>
                <dt><code>wobble</code> — Playful Instability</dt>
                <dd class="text-small text-mute">
                  Micro rotation oscillation. Instability, jelly physics,
                  cartoon impact, uncertain footing, balancing acts.
                </dd>
              </div>
              <div>
                <dt><code>sparkle</code> — Light Twinkle</dt>
                <dd class="text-small text-mute">
                  Opacity twinkle with randomized phase per character. Magic
                  particles, starlight, treasure glint, fairy dust.
                </dd>
              </div>
              <div>
                <dt><code>drip</code> — Gravity Pull</dt>
                <dd class="text-small text-mute">
                  Downward Y drift with slow reset. Rain, melting, decay, liquid
                  surfaces, cave dripping, candle wax.
                </dd>
              </div>
              <div>
                <dt><code>stretch</code> — Vertical Distortion</dt>
                <dd class="text-small text-mute">
                  Scale Y elongation cycle. Distortion fields, elastic matter,
                  body horror, spatial warping, funhouse mirrors.
                </dd>
              </div>
              <div>
                <dt><code>vibrate</code> — High-Frequency Energy</dt>
                <dd class="text-small text-mute">
                  Rapid positional jitter, faster and tighter than tremble.
                  Machinery, engines, electrical charge, intense energy.
                </dd>
              </div>
              <div>
                <dt><code>haunt</code> — Ghostly Presence</dt>
                <dd class="text-small text-mute">
                  Ghostly drift with deep opacity cycling and secondary
                  harmonic. Ghosts, afterimages, fading memories, echoes.
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

  <!-- ─── REVEAL STYLES ─────────────────────────────────────────────── -->
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h2>Reveal Styles</h2>
        <p class="text-dim">
          Reveal styles control the visual entrance animation — how each
          character physically arrives at its target position. While reveal mode
          sets granularity (word vs character), reveal style sets the motion:
          characters can scramble in from random positions, rise from below,
          drop with gravity, pop into place, or appear in shuffled order. Every
          style generates unique per-character parameters so no two letters move
          identically.
        </p>
      </div>

      <details>
        <summary>Technical Details</summary>
        <div class="p-md flex flex-col gap-md">
          <p>
            Each reveal style computes per-character CSS custom properties (<code
              >--kt-dx</code
            >, <code>--kt-dy</code>,
            <code>--kt-rotate</code>, <code>--kt-scale</code>) from a seeded
            PRNG. The same keyframe animation reads these variables, producing
            different motion per character from a single animation definition.
            Spring-based easing controls the settle — overshoot and bounce are
            tuned per style.
          </p>
          <p>
            Physics presets adapt the entrance automatically: glass adds motion
            blur during displacement-heavy moves, flat keeps curves clean and
            mechanical, retro uses stepped timing with instant snaps. The
            <code>revealStyle</code> prop overrides the default — or omit it to get
            Pop on all presets.
          </p>
        </div>
      </details>

      {#if snapshot}
        <!-- Pop (default) -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Pop <span class="text-caption text-mute">— default</span></h6>
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
            Characters snap in from random offsets — fast, chaotic entrance.
            Universal default for all physics presets. Physics-agnostic: same
            animation on glass, flat, and retro.
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

        <!-- Scale -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Scale</h6>
            <button class="btn-icon" onclick={() => replayRevealScale++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayRevealScale}
              <KineticText
                text={SAMPLE_SCALE}
                styleSnapshot={snapshot}
                revealStyle="scale"
                revealMode="char"
                speed={30}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Characters grow from zero scale to full size. Compact, precise
            entrance with no positional offset.
          </p>
        </div>

        <!-- Blur -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h6>Blur</h6>
            <button class="btn-icon" onclick={() => replayRevealBlur++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key replayRevealBlur}
              <KineticText
                text={SAMPLE_BLUR}
                styleSnapshot={snapshot}
                revealStyle="blur"
                revealMode="char"
                speed={30}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Characters emerge from a gaussian blur into sharp focus. Cinematic
            rack-focus feel. Glass physics adds extra depth with motion blur.
          </p>
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
          Reveal mode sets the granularity of how text enters the viewport. Word
          mode is the default — it reveals whole words at a time and is the mode
          used with all narrative effects. Character mode reveals one letter at
          a time for a classic typewriter feel, with Decode as a character-level
          variant where all glyphs appear immediately as scrambled noise and
          resolve left-to-right.
        </p>
      </div>

      <details>
        <summary>Technical Details</summary>
        <div class="p-md flex flex-col gap-md">
          <p>
            Each mode uses <a
              href="https://github.com/chenglou/pretext"
              target="_blank"
              rel="noopener noreferrer"
              class="text-link">Pretext</a
            >
            to compute per-character target positions up front. The reveal engine
            then steps through characters according to the mode's granularity — one
            character per tick (<code>char</code>), one word per tick (<code
              >word</code
            >), or all characters simultaneously with staggered decode passes (<code
              >decode</code
            >).
          </p>
          <p>
            Timing adapts to physics automatically: glass uses smooth spring
            easing with motion blur on fast reveals, flat uses clean linear
            curves, and retro adds per-tick jitter and stepped timing for a
            mechanical feel. The <code>speed</code> and
            <code>speedPreset</code> props control base tick interval — character
            mode exposes a speed selector below for testing.
          </p>
        </div>
      </details>

      <Selector
        label="Speed"
        options={speedPresetOptions}
        bind:value={revealSpeedPreset}
        onchange={() => {
          replayWord++;
          replayChar++;
          replayDecode++;
        }}
      />

      {#if snapshot}
        <!-- Word (default) -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h5>Word <span class="text-caption text-mute">— default</span></h5>
            <button class="btn-icon" onclick={() => replayWord++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key `${replayWord}-${revealSpeedPreset}`}
              <KineticText
                text={SAMPLE_WORD}
                styleSnapshot={snapshot}
                revealMode="word"
                speed={revealSpeeds.wordSpeed}
                charSpeed={revealSpeeds.wordCharSpeed}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            Word-by-word with fast internal character reveal. This is the
            primary mode — it creates a natural reading pace similar to AI
            streaming output and pairs with all continuous and one-shot effects.
          </p>
        </div>

        <!-- Character -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <h5>Character</h5>
            <button class="btn-icon" onclick={() => replayChar++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key `${replayChar}-${revealSpeedPreset}`}
              <KineticText
                text={SAMPLE_CHAR}
                styleSnapshot={snapshot}
                revealMode="char"
                stagger={revealSpeeds.charStagger}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            One character at a time. Classic typewriter feel. Retro physics adds
            per-tick timing jitter.
          </p>
        </div>

        <!-- Decode (Character variant) -->
        <div
          class="flex flex-col gap-xs ml-lg border-0 border-l border-solid border-primary pl-md"
        >
          <div class="flex items-center justify-between">
            <h6>
              Decode
              <span class="text-caption text-mute">— character variant</span>
            </h6>
            <button class="btn-icon" onclick={() => replayDecode++}>
              <RotateCcw class="icon" data-size="sm" />
            </button>
          </div>
          <div class="surface-sunk p-lg">
            {#key `${replayDecode}-${revealSpeedPreset}`}
              <KineticText
                text={SAMPLE_DECODE}
                styleSnapshot={snapshot}
                revealMode="decode"
                stagger={revealSpeeds.charStagger}
                scramblePasses={6}
              />
            {/key}
          </div>
          <p class="text-caption text-mute px-xs">
            All characters visible immediately as scrambled glyphs, then resolve
            left-to-right. Same character-level timing as above. Retro physics
            uses a limited uppercase charset for the scramble pass.
          </p>
        </div>
      {/if}
    </div>
  </section>
</div>

<style>
  .kt-demo-card {
    cursor: pointer;
    transition:
      background-color var(--speed-fast) var(--ease-flow),
      border-color var(--speed-fast) var(--ease-flow);
  }

  .kt-demo-card:hover {
    background-color: var(--bg-spotlight);
    border-color: var(--energy-primary);

    :global(button) {
      color: var(--energy-primary);
    }
  }
</style>
