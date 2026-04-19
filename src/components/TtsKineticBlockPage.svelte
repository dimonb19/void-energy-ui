<!--
  TtsKineticBlockPage — runnable quick-start for <TtsKineticBlock>.

  Demonstrates the three pieces consumers wire together:
    1. Kinetic reveal (char-by-char)
    2. Timed cues (flash/shake on chosen words)
    3. Timed ambient bursts (ambient.fire payload at chosen words)

  TTS is optional in the component; this page uses the stagger fallback so
  visitors don't need an InWorld key to see the pattern working. When audio
  is added, the only change is passing `audio` + `wordTimestamps` props.
-->
<script lang="ts">
  import TtsKineticBlock from '@dgrslabs/void-energy-kinetic-text/tts-block';
  import { createVoidEnergyTextStyleSnapshot } from '@dgrslabs/void-energy-kinetic-text/adapters/void-energy-host';
  import type {
    KineticSpeedPreset,
    KineticTextEffect,
    RevealStyle,
    TextStyleSnapshot,
  } from '@dgrslabs/void-energy-kinetic-text/types';
  import type {
    TimedAction,
    TimedCue,
  } from '@dgrslabs/void-energy-kinetic-text/tts';
  import { ambient } from '@dgrslabs/void-energy-ambient-layers';
  import type {
    ActionLayer,
    AmbientIntensity,
  } from '@dgrslabs/void-energy-ambient-layers/types';
  import '@dgrslabs/void-energy-kinetic-text/styles';

  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import Selector from '@components/ui/Selector.svelte';
  import Sparkle from '@components/icons/Sparkle.svelte';
  import Restart from '@components/icons/Restart.svelte';

  const TEXT =
    'The reactor hums awake, then roars. Glass shivers, lights flare, silence returns.';

  const REVEAL_STYLES: RevealStyle[] = [
    'pop',
    'scramble',
    'rise',
    'drop',
    'blur',
    'scale',
  ];
  const CONTINUOUS_EFFECTS: Array<{
    value: KineticTextEffect | '';
    label: string;
  }> = [
    { value: '', label: 'none' },
    { value: 'drift', label: 'drift' },
    { value: 'breathe', label: 'breathe' },
    { value: 'tremble', label: 'tremble' },
    { value: 'pulse', label: 'pulse' },
    { value: 'flicker', label: 'flicker' },
    { value: 'glow', label: 'glow' },
    { value: 'haunt', label: 'haunt' },
  ];
  const SPEEDS = [
    { value: 'slow', label: 'slow' },
    { value: 'default', label: 'default' },
    { value: 'fast', label: 'fast' },
  ];

  type Burst = { variant: ActionLayer; intensity: AmbientIntensity };
  const cues: TimedCue[] = [
    { atWord: 2, effect: 'shake' }, // 'hums'
    { atWord: 5, effect: 'flash' }, // 'roars'
    { atWord: 11, effect: 'surge' }, // 'lights flare'
    { onComplete: true, effect: 'ripple' },
  ];
  const actions: TimedAction<Burst>[] = [
    { atWord: 5, payload: { variant: 'impact', intensity: 'high' } },
    { atWord: 11, payload: { variant: 'flash', intensity: 'medium' } },
  ];

  let revealStyle = $state<string | number | null>('drop');
  let continuousEffect = $state<string | number | null>('pulse');
  let speed = $state<string | number | null>('default');

  const resolvedRevealStyle = $derived(
    (REVEAL_STYLES as string[]).includes(revealStyle as string)
      ? (revealStyle as RevealStyle)
      : 'drop',
  );
  const resolvedSpeed = $derived(
    ['slow', 'default', 'fast'].includes(speed as string)
      ? (speed as KineticSpeedPreset)
      : 'default',
  );

  let replay = $state(0);
  let playing = $state(false);

  let snapshotEl = $state<HTMLElement>();
  const snapshot: TextStyleSnapshot | null = $derived(
    snapshotEl ? createVoidEnergyTextStyleSnapshot(snapshotEl) : null,
  );

  function start() {
    replay++;
    playing = true;
    ambient.push('environment', 'neon', 'low');
  }

  function reset() {
    playing = false;
    ambient.clear('all');
  }

  function onRevealComplete() {
    // Leave the environment layer up until the user explicitly resets, so the
    // "done" state has somewhere for the user to sit and read.
    playing = false;
  }
</script>

<div class="container flex flex-col gap-2xl py-2xl">
  <section class="flex flex-col gap-xl min-w-0">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <p class="text-caption text-mute">TTS + Kinetic + Ambient</p>
        <h1>TtsKineticBlock</h1>
        <p class="text-dim max-w-2xl">
          One component for TTS-synced kinetic text with timed ambient bursts.
          This demo runs the stagger-based fallback (no TTS key required) so you
          can see cues and actions firing without wiring an audio source. Adding
          audio is two more props.
        </p>
      </div>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-wrap gap-md">
          <Selector
            label="Reveal style"
            options={REVEAL_STYLES.map((v) => ({ value: v, label: v }))}
            bind:value={revealStyle}
          />
          <Selector
            label="Continuous effect"
            options={CONTINUOUS_EFFECTS}
            bind:value={continuousEffect}
          />
          <Selector label="Speed" options={SPEEDS} bind:value={speed} />
        </div>

        <div
          class="surface-spotlight p-lg flex flex-col gap-md text-body"
          bind:this={snapshotEl}
        >
          {#if !playing}
            <p class="text-mute text-center p-lg">
              Press “Play reveal” to see kinetic text, timed kinetic cues, and
              audio-clock-independent ambient bursts composed together.
            </p>
          {:else if snapshot}
            {#key replay}
              <TtsKineticBlock
                text={TEXT}
                styleSnapshot={snapshot}
                revealMode="char"
                revealStyle={resolvedRevealStyle}
                activeEffect={(continuousEffect as KineticTextEffect) || null}
                speedPreset={resolvedSpeed}
                {cues}
                {actions}
                onaction={(p) => ambient.fire(p.variant, p.intensity)}
                onrevealcomplete={onRevealComplete}
              />
            {/key}
          {/if}
        </div>

        <div class="flex flex-wrap gap-md">
          <ActionBtn
            class="btn-system"
            icon={Sparkle}
            text={playing ? 'Playing…' : 'Play reveal'}
            onclick={start}
            disabled={playing}
          />
          <ActionBtn
            icon={Restart}
            text="Reset"
            onclick={reset}
            disabled={playing}
          />
        </div>
      </div>

      <div class="flex flex-col gap-xs">
        <h3>What's wired</h3>
        <ul class="text-small text-dim flex flex-col gap-xs">
          <li>
            <span class="text-main">3 kinetic cues + 1 on-complete</span> — one-shot
            effects fire on specific words and at reveal end.
          </li>
          <li>
            <span class="text-main">2 ambient bursts</span> — `<code
              >onaction</code
            > → ambient.fire(variant, intensity)`.
          </li>
          <li>
            <span class="text-main">1 persistent environment layer</span> — pushed
            on play, released on reset.
          </li>
          <li>
            Add <code>audio</code> (Blob/URL/HTMLAudioElement) and
            <code>wordTimestamps</code> to switch on TTS sync without changing anything
            else.
          </li>
        </ul>
      </div>

      <div class="flex flex-col gap-xs">
        <h3>Full working example</h3>
        <p class="text-dim max-w-2xl">
          <code>src/components/conexus/VibeMachine.svelte</code> wires this component
          end-to-end with InWorld TTS, replay cache, playback-rate selector, and
          a story-beat-driven cue/action schema.
        </p>
      </div>
    </div>
  </section>
</div>
