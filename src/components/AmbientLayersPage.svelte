<script lang="ts">
  import {
    AtmosphereLayer,
    PsychologyLayer,
    ActionLayer,
    EnvironmentLayer,
  } from '@dgrslabs/void-energy-ambient-layers';
  import type {
    AtmosphereLayerId,
    PsychologyLayerId,
    ActionLayerId,
    EnvironmentLayerId,
    AmbientIntensity,
    AmbientLevel,
  } from '@dgrslabs/void-energy-ambient-layers';
  import '@dgrslabs/void-energy-ambient-layers/styles';

  import Switcher from '@components/ui/Switcher.svelte';
  import Toggle from '@components/ui/Toggle.svelte';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import { morph } from '@actions/morph';
  import Remove from '@components/icons/Remove.svelte';
  import Restart from '@components/icons/Restart.svelte';

  // ── Tabs ────────────────────────────────────────────────────────────
  // ── Atmosphere controls ────────────────────────────────────────────
  const atmosphereVariants: {
    value: AtmosphereLayerId;
    label: string;
  }[] = [
    { value: 'rain', label: 'Rain' },
    { value: 'snow', label: 'Snow' },
    { value: 'ash', label: 'Ash' },
    { value: 'fog', label: 'Fog' },
    { value: 'underwater', label: 'Underwater' },
    { value: 'heat', label: 'Heat' },
  ];
  let atmosphereEnabled = $state(false);
  let atmosphereVariant = $state<AtmosphereLayerId>('rain');
  let atmosphereIntensity = $state<AmbientIntensity>('medium');
  let atmosphereReplayKey = $state(0);
  let atmosphereDecayOn = $state(false);
  let atmosphereLiveLevel = $state<AmbientLevel>('medium');

  // ── Psychology controls ────────────────────────────────────────────
  const psychologyVariants: {
    value: PsychologyLayerId;
    label: string;
  }[] = [
    { value: 'danger', label: 'Danger' },
    { value: 'tension', label: 'Tension' },
    { value: 'dizzy', label: 'Dizzy' },
    { value: 'focus', label: 'Focus' },
    { value: 'flashback', label: 'Flashback' },
    { value: 'dreaming', label: 'Dreaming' },
  ];
  let psychologyEnabled = $state(false);
  let psychologyVariant = $state<PsychologyLayerId>('danger');
  let psychologyIntensity = $state<AmbientIntensity>('medium');
  let psychologyReplayKey = $state(0);
  let psychologyDecayOn = $state(false);
  let psychologyLiveLevel = $state<AmbientLevel>('medium');

  // ── Action controls ────────────────────────────────────────────────
  const actionVariants: { value: ActionLayerId; label: string }[] = [
    { value: 'impact', label: 'Impact' },
    { value: 'speed', label: 'Speed' },
    { value: 'glitch', label: 'Glitch' },
    { value: 'flash', label: 'Flash' },
    { value: 'reveal', label: 'Reveal' },
  ];
  const actionIntensities: { value: AmbientIntensity; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'heavy', label: 'Heavy' },
  ];
  let actionVariant = $state<ActionLayerId>('impact');
  let actionIntensity = $state<AmbientIntensity>('medium');
  let actionActive = $state(false);
  let actionFireKey = $state(0);

  function fireActionVariant(v: ActionLayerId) {
    actionVariant = v;
    // Remount via key so consecutive fires always replay cleanly.
    actionFireKey++;
    actionActive = true;
  }
  function setActionIntensity(v: string | number | null) {
    actionIntensity = v as AmbientIntensity;
  }

  // ── Environment controls ───────────────────────────────────────────
  const environmentVariants: {
    value: EnvironmentLayerId;
    label: string;
  }[] = [
    { value: 'night', label: 'Night' },
    { value: 'neon', label: 'Neon' },
    { value: 'dawn', label: 'Dawn' },
    { value: 'dusk', label: 'Dusk' },
    { value: 'sickly', label: 'Sickly' },
    { value: 'toxic', label: 'Toxic' },
    { value: 'underground', label: 'Underground' },
    { value: 'candlelit', label: 'Candlelit' },
  ];
  let environmentEnabled = $state(false);
  let environmentVariant = $state<EnvironmentLayerId>('night');

  // Switcher coerces to string|number; wrap setters for type narrowing.
  // Selecting any variant activates that section's layer.
  function setAtmosphereVariant(v: string | number | null) {
    atmosphereVariant = v as AtmosphereLayerId;
    atmosphereEnabled = true;
    // Remount so decay restarts from full intensity on the new variant.
    atmosphereReplayKey++;
  }
  function setPsychologyVariant(v: string | number | null) {
    psychologyVariant = v as PsychologyLayerId;
    psychologyEnabled = true;
    psychologyReplayKey++;
  }
  function setEnvironmentVariant(v: string | number | null) {
    environmentVariant = v as EnvironmentLayerId;
    environmentEnabled = true;
  }
  function setAtmosphereIntensity(v: string | number | null) {
    atmosphereIntensity = v as AmbientIntensity;
    atmosphereReplayKey++;
  }
  function setPsychologyIntensity(v: string | number | null) {
    psychologyIntensity = v as AmbientIntensity;
    psychologyReplayKey++;
  }

  const intensityOptions: { value: AmbientIntensity; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'heavy', label: 'Heavy' },
  ];
</script>

<!-- Live ambient layers — mounted at page root, pointer-events:none -->
{#if environmentEnabled}
  <EnvironmentLayer variant={environmentVariant} />
{/if}

{#if atmosphereEnabled}
  {#key atmosphereReplayKey}
    <AtmosphereLayer
      variant={atmosphereVariant}
      intensity={atmosphereIntensity}
      decayMs={atmosphereDecayOn ? undefined : 0}
      onLevelChange={(l: AmbientLevel) => (atmosphereLiveLevel = l)}
    />
  {/key}
{/if}

{#if psychologyEnabled}
  {#key psychologyReplayKey}
    <PsychologyLayer
      variant={psychologyVariant}
      intensity={psychologyIntensity}
      decayMs={psychologyDecayOn ? undefined : 0}
      onLevelChange={(l: AmbientLevel) => (psychologyLiveLevel = l)}
    />
  {/key}
{/if}

{#if actionActive}
  {#key actionFireKey}
    <ActionLayer
      variant={actionVariant}
      intensity={actionIntensity}
      onComplete={() => (actionActive = false)}
    />
  {/key}
{/if}

<div class="container flex flex-col gap-2xl py-2xl">
  <header class="flex flex-col gap-lg items-center text-center">
    <h1 class="text-primary">Ambient Layers</h1>
    <p class="text-body text-dim max-w-3xl">
      The room around the room. Weather drifts in, mood bleeds from the edges,
      impact ripples through the frame, and the whole world tints to match the
      hour — all behind your content, never in its way.
    </p>
  </header>

  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <p class="text-dim">
        Ambient Layers wrap the world around your content in four distinct ways. <strong
          class="text-main">Atmosphere</strong
        >
        brings the weather — rain, snow, ash, fog — drifting quietly behind everything.
        <strong class="text-main">Psychology</strong> shapes how a moment feels,
        framing the edges with danger, tension, focus, or dreamlike haze.
        <strong class="text-main">Environment</strong> sets the hour and place,
        tinting the whole scene like dawn, neon, or candlelight.
        <strong class="text-main">Action</strong> reacts to a single beat: a hit,
        a flash, a burst of speed that comes and goes. They all live behind your
        content and never get in its way.
      </p>

      <div class="grid grid-cols-1 large-desktop:grid-cols-2 gap-md">
        <div class="surface-sunk p-md flex flex-col gap-md">
          <div class="flex flex-col gap-xs">
            <h3>Atmosphere</h3>
            <p class="text-dim">
              The weather of the world. A continuous physical presence drifting
              behind everything, setting the climate of the scene.
            </p>
          </div>

          <div class="surface-spotlight p-md flex flex-col gap-md">
            <Switcher
              class="text-center"
              label="Variant"
              options={atmosphereVariants}
              value={atmosphereEnabled ? atmosphereVariant : null}
              onchange={setAtmosphereVariant}
            />

            <Switcher
              class="text-center"
              label="Intensity"
              options={intensityOptions}
              value={atmosphereIntensity}
              onchange={setAtmosphereIntensity}
            />
          </div>

          <div class="flex flex-col gap-xs">
            <Toggle bind:checked={atmosphereDecayOn} label="Auto-decay" />
            <div use:morph class="text-caption text-mute">
              {#if atmosphereDecayOn}
                {#if atmosphereEnabled && atmosphereLiveLevel !== 'off'}
                  Decaying — {atmosphereLiveLevel}
                {:else if atmosphereEnabled}
                  Faded out
                {:else}
                  Will fade out heavy → medium → light → off after firing
                {/if}
              {:else}
                Pinned at the chosen intensity
              {/if}
            </div>
          </div>

          <div class="flex flex-row gap-md">
            <ActionBtn
              icon={Restart}
              text="Replay"
              disabled={!atmosphereEnabled}
              onclick={() => atmosphereReplayKey++}
            />
            <ActionBtn
              icon={Remove}
              text="Clear"
              class="btn-ghost btn-error"
              disabled={!atmosphereEnabled}
              onclick={() => (atmosphereEnabled = false)}
            />
          </div>
        </div>

        <div class="surface-sunk p-md flex flex-col gap-md">
          <div class="flex flex-col gap-xs">
            <h3>Psychology</h3>
            <p class="text-dim">
              The inside of someone's head. Edge-framed mental states that
              colour how a moment feels without touching what's on screen.
            </p>
          </div>

          <div class="surface-spotlight p-md flex flex-col gap-md">
            <Switcher
              class="text-center"
              label="Variant"
              options={psychologyVariants}
              value={psychologyEnabled ? psychologyVariant : null}
              onchange={setPsychologyVariant}
            />

            <Switcher
              class="text-center"
              label="Intensity"
              options={intensityOptions}
              value={psychologyIntensity}
              onchange={setPsychologyIntensity}
            />
          </div>

          <div class="flex flex-col gap-xs">
            <Toggle bind:checked={psychologyDecayOn} label="Auto-decay" />
            <div use:morph class="text-caption text-mute">
              {#if psychologyDecayOn}
                {#if psychologyEnabled && psychologyLiveLevel !== 'off'}
                  Decaying — {psychologyLiveLevel}
                {:else if psychologyEnabled}
                  Faded out
                {:else}
                  Will fade out heavy → medium → light → off after firing
                {/if}
              {:else}
                Pinned at the chosen intensity
              {/if}
            </div>
          </div>

          <div class="flex flex-row gap-md">
            <ActionBtn
              icon={Restart}
              text="Replay"
              disabled={!psychologyEnabled}
              onclick={() => psychologyReplayKey++}
            />
            <ActionBtn
              icon={Remove}
              text="Clear"
              class="btn-ghost btn-error"
              disabled={!psychologyEnabled}
              onclick={() => (psychologyEnabled = false)}
            />
          </div>
        </div>

        <div class="surface-sunk p-md flex flex-col gap-md">
          <div class="flex flex-col gap-xs">
            <h3>Environment</h3>
            <p class="text-dim">
              The hour and the place. A sticky colour grade that tints the whole
              scene to set time of day and location.
            </p>
          </div>

          <div class="surface-spotlight p-md flex flex-col gap-md">
            <Switcher
              class="text-center"
              label="Variant"
              options={environmentVariants}
              value={environmentEnabled ? environmentVariant : null}
              onchange={setEnvironmentVariant}
            />
          </div>

          <div class="flex flex-row gap-md">
            <ActionBtn
              icon={Remove}
              text="Clear"
              class="btn-ghost btn-error"
              disabled={!environmentEnabled}
              onclick={() => (environmentEnabled = false)}
            />
          </div>
        </div>

        <div class="surface-sunk p-md flex flex-col gap-md">
          <div class="flex flex-col gap-xs">
            <h3>Action</h3>
            <p class="text-dim">
              A single beat that punches through the frame, then gets out of the
              way. Use it when something happens — a hit, a flash, a burst.
            </p>
          </div>

          <div class="surface-spotlight p-md flex flex-col gap-md">
            <div class="flex flex-row flex-wrap gap-sm justify-center">
              {#each actionVariants as v (v.value)}
                <button class="btn" onclick={() => fireActionVariant(v.value)}>
                  {v.label}
                </button>
              {/each}
            </div>
            <Switcher
              class="text-center"
              label="Intensity"
              options={actionIntensities}
              value={actionIntensity}
              onchange={setActionIntensity}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
