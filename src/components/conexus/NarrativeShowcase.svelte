<script lang="ts">
  import { tick } from 'svelte';
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { narrative, isOneShotEffect } from '@actions/narrative';
  import { kinetic } from '@actions/kinetic';
  import { morph } from '@actions/morph';
  import Selector from '@components/ui/Selector.svelte';
  import IconBtn from '@components/ui/IconBtn.svelte';
  import Restart from '@components/icons/Restart.svelte';
  import Switch from '@components/icons/Switch.svelte';
  import PlayPause from '@components/icons/PlayPause.svelte';

  // ── Types ────────────────────────────────────────────────────────────────

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

  // ── Demo data ────────────────────────────────────────────────────────────

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

  // ── One-shot / continuous toggle state ──────────────────────────────────

  let activeOneShotEffects = $state<
    Record<OneShotNarrativeEffect, OneShotNarrativeEffect | null>
  >({
    shake: null,
    quake: null,
    jolt: null,
    glitch: null,
    surge: null,
    warp: null,
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

  async function playNarrativeOneShot(effect: OneShotNarrativeEffect) {
    activeOneShotEffects[effect] = null;
    await tick();
    activeOneShotEffects[effect] = effect;
  }

  function clearNarrativeOneShot(effect: OneShotNarrativeEffect) {
    activeOneShotEffects[effect] = null;
  }

  function toggleNarrativeLoop(effect: ContinuousNarrativeEffect) {
    activeContinuousEffects[effect] = activeContinuousEffects[effect]
      ? null
      : effect;
  }

  // ── Test container state ───────────────────────────────────────────────
  let testOneShotEffect = $state<OneShotNarrativeEffect>('shake');
  let activeTestOneShot = $state<OneShotNarrativeEffect | null>(null);
  let testContinuousEffect = $state<ContinuousNarrativeEffect>('drift');
  let testContinuousActive = $state(false);

  const oneShotOptions = [
    { value: 'shake', label: 'Shake' },
    { value: 'quake', label: 'Quake' },
    { value: 'jolt', label: 'Jolt' },
    { value: 'glitch', label: 'Glitch' },
    { value: 'surge', label: 'Surge' },
    { value: 'warp', label: 'Warp' },
  ];

  const continuousOptions = [
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

  // ── Kinetic + Narrative chained demo ──────────────────────────────────
  const chainedSteps = [
    // ── One-shot effects ──
    {
      text: 'The blast door slammed shut behind them. For a moment the corridor was nothing but ringing silence and the faint taste of iron in the air.',
      narrativeEffect: 'shake' as NarrativeEffect,
    },
    {
      text: 'Stone dust rained from the ceiling as the chamber buckled under the shockwave. The floor split in two places and the far wall folded inward like wet paper.',
      narrativeEffect: 'quake' as NarrativeEffect,
    },
    {
      text: 'A cold hand brushed the back of her neck and every muscle snapped awake. The corridor was empty, but the air where the touch had been was still warm.',
      narrativeEffect: 'jolt' as NarrativeEffect,
    },
    {
      text: 'The console screen tore itself apart. Characters bled sideways, reforming into words that had no business being there — coordinates she had never entered, names she had never spoken aloud.',
      narrativeEffect: 'glitch' as NarrativeEffect,
    },
    {
      text: 'Light gathered in her palms and erupted skyward. The air itself buckled and sang, and for one bright instant she was the source of everything.',
      narrativeEffect: 'surge' as NarrativeEffect,
    },
    {
      text: 'The doorway stretched sideways and pulled itself thin. She felt her edges dissolve, scatter across impossible distance, and reassemble somewhere that smelled of copper and static.',
      narrativeEffect: 'warp' as NarrativeEffect,
    },
    // ── Continuous effects ──
    {
      text: 'The lantern drifted beside her, its flame barely stirring. Every sound arrived late, softened, as if the water between them and the surface had swallowed the sharp edges of the world.',
      narrativeEffect: 'drift' as NarrativeEffect,
    },
    {
      text: 'Something flickered at the edge of her vision — not light, but the absence of it. A shape that existed only in the gaps between blinks, patient and watching.',
      narrativeEffect: 'flicker' as NarrativeEffect,
    },
    {
      text: 'She steadied herself and let the room inhale with her before the answer came. The walls seemed to expand and contract in time with her breathing, slow and deliberate.',
      narrativeEffect: 'breathe' as NarrativeEffect,
    },
    {
      text: 'His confession arrived in a shiver, barely held together by breath. Every word trembled at the edges, threatening to break apart before it reached her.',
      narrativeEffect: 'tremble' as NarrativeEffect,
    },
    {
      text: 'The seal under the altar throbbed once, then again, brighter every time. She could feel it in her ribs now — not sound, but pressure, rhythmic and patient and getting closer.',
      narrativeEffect: 'pulse' as NarrativeEffect,
    },
    {
      text: 'A voice slipped past her ear so softly it felt borrowed from another room. The words dissolved before she could hold them, leaving only the shape of a warning.',
      narrativeEffect: 'whisper' as NarrativeEffect,
    },
    {
      text: 'The room grew distant, each detail retreating behind a thickening veil. She tried to hold onto the lamplight but it slid through her awareness like water through open fingers.',
      narrativeEffect: 'fade' as NarrativeEffect,
    },
    {
      text: 'The frost arrived without warning. One breath she was warm, the next her joints locked and the air itself turned brittle around her. Even sound seemed to slow.',
      narrativeEffect: 'freeze' as NarrativeEffect,
    },
    {
      text: 'Heat poured from the cracked ground in visible waves. The air trembled and the edges of everything shimmered as if reality itself was sweating.',
      narrativeEffect: 'burn' as NarrativeEffect,
    },
    {
      text: 'The broadcast fractured into noise. Words surfaced and drowned in rapid succession — coordinates, a name, a warning — each one clawing for coherence before the static swallowed it whole.',
      narrativeEffect: 'static' as NarrativeEffect,
    },
    {
      text: "The potion hit her bloodstream and the room tilted. Walls leaned at angles that couldn't exist, her own hands rippled at the edges, and every thought arrived sideways.",
      narrativeEffect: 'distort' as NarrativeEffect,
    },
    {
      text: 'The deck pitched hard to starboard and she grabbed the railing with both hands. Every step was a guess, every surface a betrayal, and the sea had no intention of holding still.',
      narrativeEffect: 'sway' as NarrativeEffect,
    },
  ];

  const chainedRevealOptions = [
    { value: 'char', label: 'Char' },
    { value: 'word', label: 'Word' },
    { value: 'sentence', label: 'Sentence' },
  ];

  let chainedStepIndex = $state(0);
  let chainedKey = $state(0);
  let chainedRevealing = $state(true);
  let chainedRevealMode = $state<string>('sentence');

  // First step: continuous starts immediately, one-shot waits
  const firstEffect = chainedSteps[0].narrativeEffect;
  let chainedNarrativeEffect = $state<NarrativeEffect | null>(
    isOneShotEffect(firstEffect) ? null : firstEffect,
  );

  const chainedStep = $derived(chainedSteps[chainedStepIndex]);

  function startChainedStep() {
    chainedRevealing = true;
    // Continuous effects start immediately (ambient atmosphere during reveal).
    // One-shot effects wait for kinetic to finish (punctuation on full text).
    const effect = chainedSteps[chainedStepIndex].narrativeEffect;
    chainedNarrativeEffect = isOneShotEffect(effect) ? null : effect;
  }

  function chainedNext() {
    chainedStepIndex = (chainedStepIndex + 1) % chainedSteps.length;
    chainedKey++;
    startChainedStep();
  }

  function chainedPrev() {
    chainedStepIndex =
      (chainedStepIndex - 1 + chainedSteps.length) % chainedSteps.length;
    chainedKey++;
    startChainedStep();
  }

  function chainedReplay() {
    chainedKey++;
    startChainedStep();
  }

  function onChainedKineticDone() {
    chainedRevealing = false;
    // Continuous effects are already active; one-shot effects fire now.
    if (isOneShotEffect(chainedStep.narrativeEffect)) {
      chainedNarrativeEffect = chainedStep.narrativeEffect;
    }
  }
</script>

<!-- ─── NARRATIVE EFFECTS ─────────────────────────────────────── -->
<div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
  <h3 class="text-dim">Narrative Effects</h3>
  <p class="text-small text-mute">
    All effects below respect the global preference toggle in the Themes panel
    under Preferences.
  </p>
</div>

<div class="surface-raised p-lg flex flex-col gap-lg">
  <p>
    Text doesn't just appear — it can <em>react</em>. Narrative effects add
    physical motion to text after it's revealed: a paragraph can shake from an
    impact, drift through a dreamlike scene, or flicker under failing lights.
    One-shot effects punctuate a single moment; continuous effects sustain an
    atmosphere for as long as the scene demands.
  </p>
  <details>
    <summary>Technical Details</summary>
    <div class="p-md flex flex-col gap-md">
      <p>
        Narrative Effects are designed to run <em>after</em> Kinetic reveal. Kinetic
        controls how text arrives; narrative controls how the already-visible block
        physically reacts once it is on screen.
      </p>
      <p>
        The six one-shot effects (<code>shake</code>, <code>quake</code>,
        <code>jolt</code>, <code>glitch</code>, <code>surge</code>,
        <code>warp</code>) auto-clean through the action&apos;s
        <code>animationend</code> guard. The twelve continuous effects (<code
          >drift</code
        >, <code>flicker</code>, <code>breathe</code>,
        <code>tremble</code>, <code>pulse</code>, <code>whisper</code>,
        <code>fade</code>, <code>freeze</code>, <code>burn</code>,
        <code>static</code>, <code>distort</code>, <code>sway</code>) loop until
        the consumer clears them or disables the system.
      </p>
      <p>
        Physics styling lives entirely in SCSS. Glass adds motion blur on
        displacement-heavy effects, flat keeps the raw curves clean, and retro
        applies per-effect stepped timing without flattening
        <code>glitch</code> or <code>tremble</code> into the same motion.
      </p>
      <p>
        Every demo below respects the live global preference toggle. Turn
        Narrative Effects off and the text stays static while the same action
        lifecycle continues to run under the hood.
      </p>
    </div>
  </details>

  <div class="flex flex-col gap-md">
    <div class="flex flex-col gap-xs">
      <h5>One-Shot Effects</h5>
      <p class="text-caption text-mute">
        Punctuation moments. Each demo replays a short impact or corruption
        effect, then auto-clears through <code>onComplete</code>.
      </p>
    </div>

    <div class="grid gap-lg tablet:grid-cols-2">
      {#each narrativeOneShotDemos as demo}
        <div class="surface-sunk p-md flex flex-col gap-md h-full">
          <div class="flex items-start justify-between gap-md">
            <div class="flex flex-col gap-xs">
              <h6 class="text-small text-dim">{demo.label}</h6>
              <p class="text-caption text-mute">{demo.context}</p>
            </div>

            <IconBtn
              aria-label="Play"
              icon={PlayPause}
              onclick={() => playNarrativeOneShot(demo.effect)}
            />
          </div>

          <p
            use:narrative={{
              effect: activeOneShotEffects[demo.effect],
              enabled: narrativeEffectsEnabled,
              onComplete: () => clearNarrativeOneShot(demo.effect),
            }}
          >
            {demo.text}
          </p>

          <p class="text-caption text-mute">{demo.note}</p>
        </div>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-md">
    <div class="flex flex-col gap-xs">
      <h5>Continuous Effects</h5>
      <p class="text-caption text-mute">
        Sustained atmosphere loops. Start and stop each effect manually to
        compare readability, cadence, and physics adaptation.
      </p>
    </div>

    <div class="grid gap-lg tablet:grid-cols-2 large-desktop:grid-cols-3">
      {#each narrativeContinuousDemos as demo}
        <div class="surface-sunk p-md flex flex-col gap-md h-full">
          <div class="flex items-start justify-between gap-md">
            <div class="flex flex-col gap-xs">
              <h6 class="text-small text-dim">{demo.label}</h6>
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

          <p
            use:narrative={{
              effect: activeContinuousEffects[demo.effect],
              enabled: narrativeEffectsEnabled,
            }}
          >
            {demo.text}
          </p>

          <p class="text-caption text-mute">{demo.note}</p>
        </div>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-md">
    <div class="flex flex-col gap-xs">
      <h5>Kinetic Reveal + Narrative Effect</h5>
      <p class="text-caption text-mute">
        The real-world pattern: text is revealed with kinetic typography while
        narrative effects set the mood. Continuous effects (drift, flicker,
        etc.) run during the reveal as ambient atmosphere; one-shot effects
        (shake, jolt, etc.) fire once the text is fully visible. Switch the
        reveal mode and navigate between steps to compare.
      </p>
    </div>

    <div
      class="surface-sunk p-lg flex flex-col gap-lg"
      use:morph={{ width: false }}
    >
      <div class="flex items-end justify-center gap-md flex-wrap">
        <Selector
          label="Reveal"
          options={chainedRevealOptions}
          bind:value={chainedRevealMode}
          onchange={() => {
            chainedKey++;
            startChainedStep();
          }}
        />

        <div class="w-full flex gap-xs items-center flex-1">
          <p class="text-caption text-mute mr-auto">
            Step {chainedStepIndex + 1} of {chainedSteps.length}
          </p>
          <IconBtn icon={Restart} aria-label="Replay" onclick={chainedReplay} />
          <IconBtn icon={Switch} aria-label="Previous" onclick={chainedPrev} />
          <IconBtn
            icon={Switch}
            aria-label="Next"
            onclick={chainedNext}
            class="rotate-180"
          />
        </div>
      </div>

      {#key chainedKey}
        <p
          class="text-body"
          use:kinetic={{
            text: chainedStep.text,
            mode: chainedRevealMode === 'char' ? 'char' : 'word',
            chunk: chainedRevealMode === 'sentence' ? 'sentence' : 'word',
            speed: chainedRevealMode === 'char' ? 25 : 40,
            cursor: chainedRevealMode === 'char',
            onComplete: onChainedKineticDone,
          }}
          use:narrative={{
            effect: chainedNarrativeEffect,
            enabled: narrativeEffectsEnabled,
          }}
        ></p>
      {/key}

      <p class="text-caption text-mute">
        {#if chainedRevealing && chainedNarrativeEffect}
          Revealing with <code>{chainedNarrativeEffect}</code>
        {:else if chainedRevealing}
          Revealing text…
        {:else if chainedNarrativeEffect}
          Narrative effect <code>{chainedNarrativeEffect}</code> active
        {/if}
      </p>
    </div>
  </div>

  <div class="flex flex-col gap-md">
    <div class="flex flex-col gap-xs">
      <h5>Long-Form Test</h5>
      <p class="text-caption text-mute">
        Scrollable text containers for testing effects on longer passages. Pick
        an effect, then scroll through to see how it reads at scale.
      </p>
    </div>

    <div class="grid gap-lg large-desktop:grid-cols-2">
      <div class="flex flex-col gap-md">
        <div class="flex items-end gap-sm">
          <Selector
            label="One-Shot"
            options={oneShotOptions}
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
              steps the overhead lights would buzz and settle, buzz and settle,
              casting long unsteady shadows across the concrete floor. There was
              no sound except the distant hum of ventilation and the quiet
              percussion of their own footsteps echoing off bare walls.
            </p>
            <p>
              At the far end a heavy blast door stood half-open, a sliver of
              pale blue light spilling through the gap. Beyond it they could see
              a chamber — vast, empty, its ceiling lost in darkness. The floor
              was polished stone, cracked in places, with hairline fractures
              radiating out from a central point like the memory of an impact.
            </p>
            <p>
              She pressed her palm flat against the door and pushed. The metal
              groaned, reluctant, then gave way with a low shudder that traveled
              up through her arm and into her teeth. The sound rolled through
              the chamber and came back changed — deeper, longer, as if the room
              itself had answered.
            </p>
            <p>
              Something was different about the air in here. It tasted of ozone
              and old copper, the kind of atmosphere that settles into places
              where energy has been spent violently and never quite dissipated.
              The cracks in the floor glowed faintly, a dull amber that pulsed
              once and faded.
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
            options={continuousOptions}
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
              A lantern hung from the prow on a rusted hook, its flame barely
              moving. The light it cast was warm and small, touching only the
              nearest few inches of water before surrendering to the grey. She
              trailed her fingers over the side and watched the ripples spread
              outward in perfect circles that never came back.
            </p>
            <p>
              Somewhere beneath the surface, very far down, something luminous
              drifted. It was too deep to have a shape — just a slow greenish
              glow that moved like a thought trying to surface. She watched it
              for a long time, and it watched her back, and neither of them
              blinked.
            </p>
            <p>
              The silence here was not the silence of absence. It was thick,
              textured, full of tiny sounds folded into one another: the creak
              of old wood, the soft lap of water against the hull, a distant
              tone that might have been a bell or might have been her own pulse
              amplified by the stillness.
            </p>
            <p>
              She closed her eyes and let the boat carry her. There was no
              current but the boat moved anyway, slow and sure, as if it knew
              where she needed to go even when she did not. The lantern
              flickered once, then steadied. The glow beneath the water followed
              like a companion.
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
        <h6 class="text-dim">One-Shot Effects</h6>
        <p class="text-caption text-mute">
          Fire once after text is fully revealed. Use for punctuation moments.
        </p>
        <dl class="flex flex-col gap-md">
          <div>
            <dt><code>shake</code> — Physical Impact</dt>
            <dd class="text-small text-mute">
              Rapid horizontal jitter, decaying to rest. Door slams, collisions,
              nearby explosions, heavy objects crashing.
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
              Single sharp displacement with an elastic snap-back. Jump scares,
              sudden grabs, betrayals revealed, waking from nightmares.
            </dd>
          </div>
          <div>
            <dt><code>glitch</code> — Digital Corruption</dt>
            <dd class="text-small text-mute">
              Choppy skewed displacement with stepped timing. Simulation
              malfunctions, memory rewrites, hacking, signal failure, reality
              fractures.
            </dd>
          </div>
          <div>
            <dt><code>surge</code> — Power Activation</dt>
            <dd class="text-small text-mute">
              Ascending scale with brightness flash. Magic cast, transformation,
              divine intervention, power activation, epiphany.
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
        <h6 class="text-dim">Continuous Effects</h6>
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
              Irregular opacity drops with hard cuts. Failing lights, unstable
              power, haunted spaces, fading transmissions, phasing presence.
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
              Fast micro-vibration, deliberately small. Freezing cold, bodily
              fear, physical fragility, suppressed emotion about to overflow.
            </dd>
          </div>
          <div>
            <dt><code>pulse</code> — Building Pressure</dt>
            <dd class="text-small text-mute">
              Heartbeat-tempo scale with sharp attack. Audible heartbeat, ritual
              energy charging, countdowns, approaching something powerful.
            </dd>
          </div>
          <div>
            <dt><code>whisper</code> — Fading Presence</dt>
            <dd class="text-small text-mute">
              Opacity and scale recede together. Ghosts speaking, fading
              memories, telepathy, secrets shared in near-silence, dying words.
            </dd>
          </div>
          <div>
            <dt><code>fade</code> — Consciousness Dissolve</dt>
            <dd class="text-small text-mute">
              Gradual opacity drift to half visibility. Losing consciousness,
              drugged, time skip, memory dissolving, falling asleep.
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
              transmission, broken comms, digital interference, corrupted data.
            </dd>
          </div>
          <div>
            <dt><code>distort</code> — Woozy Perception</dt>
            <dd class="text-small text-mute">
              Subtle rotation with asymmetric scale oscillation. Drunk,
              poisoned, hallucinating, vertigo, psychic influence, concussion.
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
        Most steps should have no effect. Effects are seasoning — contrast and
        restraint make them land. Full AI reference with detailed scenario
        triggers available in <code>NARRATIVE-EFFECTS.md</code>.
      </p>
    </div>
  </details>
</div>

<style lang="scss">
  .narrative-test-scroll {
    max-height: 320px; // void-ignore
    overflow-y: auto;
    padding: var(--space-md);
    flex: 1;
  }
</style>
