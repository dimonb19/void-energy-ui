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
  import { dissolve, emerge } from '@lib/transitions.svelte';

  // ── Tabs ────────────────────────────────────────────────────────────
  // ── Atmosphere controls ────────────────────────────────────────────
  const atmosphereVariants: {
    value: AtmosphereLayerId;
    label: string;
    description: string;
  }[] = [
    {
      value: 'rain',
      label: 'Rain',
      description:
        'Vertical downpour drifting behind the scene for noir, melancholy, and cleansing moments.',
    },
    {
      value: 'snow',
      label: 'Snow',
      description:
        'Soft flakes swaying down for hushed stillness, winter forests, and fragile beauty.',
    },
    {
      value: 'ash',
      label: 'Ash',
      description:
        'Burned flakes and embers tumbling through post-apocalypse and scorched aftermath.',
    },
    {
      value: 'fog',
      label: 'Fog',
      description:
        'Volumetric mist banks for lost bearings, horror beats, and liminal transitions.',
    },
    {
      value: 'underwater',
      label: 'Underwater',
      description:
        'Cool displacement and caustics for submersion, drowning, and amniotic dreams.',
    },
    {
      value: 'heat',
      label: 'Heat',
      description:
        'Warm shimmer melt for desert exteriors, forges, and fever delirium.',
    },
    {
      value: 'wind',
      label: 'Wind',
      description:
        'Horizontal dust streaks for dry tension, deserts, and the stillness before a fight.',
    },
    {
      value: 'storm',
      label: 'Storm',
      description:
        'Dense rain with lightning and wind drift for peak weather drama and climactic chaos.',
    },
    {
      value: 'spores',
      label: 'Spores',
      description:
        'Slow floating motes for alien forests, fungal zones, and enchanted decay.',
    },
    {
      value: 'fireflies',
      label: 'Fireflies',
      description:
        'Soft drifting lights for summer nights, tranquil clearings, and quiet wonder.',
    },
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
    description: string;
  }[] = [
    {
      value: 'danger',
      label: 'Danger',
      description:
        'Crimson heartbeat vignette for active threats, predators, and low-health moments.',
    },
    {
      value: 'tension',
      label: 'Tension',
      description:
        'Constricting edges and micro-tremors for pressure building toward a break.',
    },
    {
      value: 'dizzy',
      label: 'Dizzy',
      description:
        'Off-center dark lobes for concussion, drunkenness, poison, and vertigo.',
    },
    {
      value: 'focus',
      label: 'Focus',
      description:
        'Breathing tunnel vision for flow state, final shots, and sniper patience.',
    },
    {
      value: 'filmGrain',
      label: 'Film Grain',
      description:
        'Sepia wash and flicker for flashbacks, noir, and unreliable memory.',
    },
    {
      value: 'haze',
      label: 'Haze',
      description:
        'Drifting bloom and hue shift for psychedelic visions and romantic overwhelm.',
    },
    {
      value: 'calm',
      label: 'Calm',
      description:
        'Cool breathing vignette for relief, healing, and quiet after exertion.',
    },
    {
      value: 'serenity',
      label: 'Serenity',
      description:
        "Pale outer glow for deep meditation, transcendence, and the journey's end.",
    },
    {
      value: 'success',
      label: 'Success',
      description:
        'Warm green bloom for quests completed, level-ups, and plans paying off.',
    },
    {
      value: 'fail',
      label: 'Fail',
      description:
        'Sharp red edge flash for failed actions, denials, and critical misses.',
    },
    {
      value: 'awe',
      label: 'Awe',
      description:
        'Pale gold brightening for sublime revelations and first sight of vastness.',
    },
    {
      value: 'melancholy',
      label: 'Melancholy',
      description:
        'Desaturated cool vignette for held grief, bittersweet endings, and loss.',
    },
  ];
  let psychologyEnabled = $state(false);
  let psychologyVariant = $state<PsychologyLayerId>('danger');
  let psychologyIntensity = $state<AmbientIntensity>('medium');
  let psychologyReplayKey = $state(0);
  let psychologyDecayOn = $state(false);
  let psychologyLiveLevel = $state<AmbientLevel>('medium');

  // ── Action controls ────────────────────────────────────────────────
  const actionVariants: {
    value: ActionLayerId;
    label: string;
    description: string;
  }[] = [
    {
      value: 'impact',
      label: 'Impact',
      description:
        'Radial shockwave for heavy hits, landings, collisions, and breached doors.',
    },
    {
      value: 'speed',
      label: 'Speed',
      description:
        'Parallax sweep for dashes, sprints, launches, and chase sequences.',
    },
    {
      value: 'glitch',
      label: 'Glitch',
      description:
        'Brief chromatic aberration for simulation hiccups, hacks, and reality tears.',
    },
    {
      value: 'flash',
      label: 'Flash',
      description:
        'Full-screen pulse for lightning, flashbangs, and sudden revelations.',
    },
    {
      value: 'reveal',
      label: 'Reveal',
      description:
        'Radial curtain wipe for scene openings, chapter starts, and unveilings.',
    },
    {
      value: 'dissolve',
      label: 'Dissolve',
      description:
        'Soft blurred fade for scene endings, dreams, and gentle transitions.',
    },
    {
      value: 'shake',
      label: 'Shake',
      description:
        'Damped tremor for nearby explosions, earthquakes, and structural damage.',
    },
    {
      value: 'zoomBurst',
      label: 'Zoom Burst',
      description:
        'Radial scale punch for dramatic reveals, decision beats, and boss spawns.',
    },
  ];
  const actionIntensities: { value: AmbientIntensity; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
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
    presetIndex = null;
    actionIntensity = v as AmbientIntensity;
  }

  // ── Environment controls ───────────────────────────────────────────
  const environmentVariants: {
    value: EnvironmentLayerId;
    label: string;
    description: string;
  }[] = [
    {
      value: 'night',
      label: 'Night',
      description:
        'Deep-blue wash for generic night, moonlit stealth, and calm nocturnal dialogue.',
    },
    {
      value: 'neon',
      label: 'Neon',
      description:
        'Cyan and magenta cast for cyberpunk streets, clubs, and wet city nights.',
    },
    {
      value: 'dawn',
      label: 'Dawn',
      description:
        'Cool sky and warm horizon for sunrise beginnings and emotional recovery.',
    },
    {
      value: 'dusk',
      label: 'Dusk',
      description:
        'Orange bleeding into violet for sunsets, final conversations, and elegiac beats.',
    },
    {
      value: 'sickly',
      label: 'Sickly',
      description:
        'Green-yellow glow for plague zones, cursed villages, and fever delirium.',
    },
    {
      value: 'toxic',
      label: 'Toxic',
      description:
        'Irradiated green cast for radioactive zones, acid swamps, and biohazard interiors.',
    },
    {
      value: 'underground',
      label: 'Underground',
      description:
        'Dark grey radial for caves, catacombs, bunkers, and claustrophobic depths.',
    },
    {
      value: 'candlelit',
      label: 'Candlelit',
      description:
        'Warm golden spotlight for fire-lit interiors, confessions, and ritual chambers.',
    },
    {
      value: 'overcast',
      label: 'Overcast',
      description:
        'Flat desaturated wash for bleak exteriors, cemeteries, and emotional numbness.',
    },
  ];
  let environmentEnabled = $state(false);
  let environmentVariant = $state<EnvironmentLayerId>('night');
  let environmentIntensity = $state<AmbientIntensity>('medium');

  function setEnvironmentIntensity(v: string | number | null) {
    presetIndex = null;
    environmentIntensity = v as AmbientIntensity;
  }

  // ── Preset showcase ─────────────────────────────────────────────────
  interface AmbientPreset {
    label: string;
    tagline: string;
    atmosphere?: { variant: AtmosphereLayerId; intensity: AmbientIntensity };
    environment?: { variant: EnvironmentLayerId; intensity: AmbientIntensity };
    psychology?: { variant: PsychologyLayerId; intensity: AmbientIntensity };
  }

  const presets: AmbientPreset[] = [
    {
      label: 'Abyss',
      tagline:
        'Heavy currents push through buried stone. The surface is a memory — down here there is only pressure and drift.',
      atmosphere: { variant: 'underwater', intensity: 'high' },
      environment: { variant: 'underground', intensity: 'low' },
    },
    {
      label: 'Wrath',
      tagline:
        'The sky splits open at sundown. Lightning tears through dying orange light while pressure builds from every edge.',
      atmosphere: { variant: 'storm', intensity: 'high' },
      environment: { variant: 'dusk', intensity: 'medium' },
      psychology: { variant: 'tension', intensity: 'medium' },
    },
    {
      label: 'Remnant',
      tagline:
        'Embers tumble through a brightening sky. What burned is behind — the dawn carries what survived into stillness.',
      atmosphere: { variant: 'ash', intensity: 'medium' },
      environment: { variant: 'dawn', intensity: 'high' },
      psychology: { variant: 'serenity', intensity: 'high' },
    },
    {
      label: 'Solace',
      tagline:
        'Soft drifting lights pulse through cool darkness. A summer clearing after the world has gone quiet — earned rest.',
      atmosphere: { variant: 'fireflies', intensity: 'high' },
      environment: { variant: 'night', intensity: 'medium' },
      psychology: { variant: 'calm', intensity: 'high' },
    },
    {
      label: 'Plague',
      tagline:
        'Mist rolls through a poisoned haze. The air itself is wrong — thick with threat and the slow pulse of something watching.',
      atmosphere: { variant: 'fog', intensity: 'high' },
      environment: { variant: 'sickly', intensity: 'high' },
      psychology: { variant: 'danger', intensity: 'high' },
    },
  ];

  const presetOptions = presets.map((p, i) => ({
    value: i,
    label: p.label,
  }));

  let presetIndex = $state<number | null>(null);

  const activePreset = $derived(
    presetIndex !== null ? presets[presetIndex] : null,
  );

  function setPreset(v: string | number | null) {
    presetIndex = v as number | null;
    const preset = v !== null ? presets[v as number] : null;
    if (!preset) return;

    // Sync preset choices into individual controls — single rendering path
    if (preset.atmosphere) {
      atmosphereVariant = preset.atmosphere.variant;
      atmosphereIntensity = preset.atmosphere.intensity;
      atmosphereEnabled = true;
      atmosphereDecayOn = false;
      atmosphereReplayKey++;
    } else {
      atmosphereEnabled = false;
    }

    if (preset.psychology) {
      psychologyVariant = preset.psychology.variant;
      psychologyIntensity = preset.psychology.intensity;
      psychologyEnabled = true;
      psychologyDecayOn = false;
      psychologyReplayKey++;
    } else {
      psychologyEnabled = false;
    }

    if (preset.environment) {
      environmentVariant = preset.environment.variant;
      environmentIntensity = preset.environment.intensity;
      environmentEnabled = true;
    } else {
      environmentEnabled = false;
    }
  }

  function clearPreset() {
    presetIndex = null;
    atmosphereEnabled = false;
    psychologyEnabled = false;
    environmentEnabled = false;
  }

  // Switcher coerces to string|number; wrap setters for type narrowing.
  // Selecting any variant activates that section's layer.
  function setAtmosphereVariant(v: string | number | null) {
    presetIndex = null; // clear preset when using individual controls
    atmosphereVariant = v as AtmosphereLayerId;
    atmosphereEnabled = true;
    // Remount so decay restarts from full intensity on the new variant.
    atmosphereReplayKey++;
  }
  function setPsychologyVariant(v: string | number | null) {
    presetIndex = null;
    psychologyVariant = v as PsychologyLayerId;
    psychologyEnabled = true;
    psychologyReplayKey++;
  }
  function setEnvironmentVariant(v: string | number | null) {
    presetIndex = null;
    environmentVariant = v as EnvironmentLayerId;
    environmentEnabled = true;
  }
  function setAtmosphereIntensity(v: string | number | null) {
    presetIndex = null;
    atmosphereIntensity = v as AmbientIntensity;
    atmosphereReplayKey++;
  }
  function setPsychologyIntensity(v: string | number | null) {
    presetIndex = null;
    psychologyIntensity = v as AmbientIntensity;
    psychologyReplayKey++;
  }

  const intensityOptions: { value: AmbientIntensity; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  // Dynamic one-sentence caption per section, based on current selection.
  const atmosphereCaption = $derived(
    atmosphereVariants.find((v) => v.value === atmosphereVariant)
      ?.description ?? '',
  );
  const psychologyCaption = $derived(
    psychologyVariants.find((v) => v.value === psychologyVariant)
      ?.description ?? '',
  );
  const environmentCaption = $derived(
    environmentVariants.find((v) => v.value === environmentVariant)
      ?.description ?? '',
  );
  const actionCaption = $derived(
    actionVariants.find((v) => v.value === actionVariant)?.description ?? '',
  );
</script>

<!-- Live ambient layers — mounted at page root, pointer-events:none -->
{#if environmentEnabled}
  <EnvironmentLayer
    variant={environmentVariant}
    intensity={environmentIntensity}
  />
{/if}

{#if atmosphereEnabled}
  {#key atmosphereReplayKey}
    <AtmosphereLayer
      variant={atmosphereVariant}
      intensity={atmosphereIntensity}
      durationMs={atmosphereDecayOn ? undefined : 0}
      onChange={(l: AmbientLevel) => (atmosphereLiveLevel = l)}
    />
  {/key}
{/if}

{#if psychologyEnabled}
  {#key psychologyReplayKey}
    <PsychologyLayer
      variant={psychologyVariant}
      intensity={psychologyIntensity}
      durationMs={psychologyDecayOn ? undefined : 0}
      onChange={(l: AmbientLevel) => (psychologyLiveLevel = l)}
    />
  {/key}
{/if}

{#if actionActive}
  {#key actionFireKey}
    <ActionLayer
      variant={actionVariant}
      intensity={actionIntensity}
      onEnd={() => (actionActive = false)}
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
      <div class="flex flex-col gap-xs">
        <p class="text-dim">
          Ambient Layers wrap the world around your content in four distinct
          ways. <strong class="text-main">Atmosphere</strong>
          brings the weather — rain, snow, ash, fog — drifting quietly behind everything.
          <strong class="text-main">Psychology</strong> shapes how a moment
          feels, framing the edges with danger, tension, focus, or dreamlike
          haze.
          <strong class="text-main">Environment</strong> sets the hour and
          place, tinting the whole scene like dawn, neon, or candlelight.
          <strong class="text-main">Action</strong> reacts to a single beat: a hit,
          a flash, a burst of speed that comes and goes. They all live behind your
          content and never get in its way.
        </p>
      </div>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <Switcher
          class="text-center"
          label="Preset"
          options={presetOptions}
          value={presetIndex}
          onchange={setPreset}
        />

        <p use:morph class="text-caption text-dim text-center">
          {#if activePreset}
            {activePreset.tagline}
          {:else}
            <span class="text-mute">Choose a preset to set the scene</span>
          {/if}
        </p>

        {#if activePreset}
          <div
            in:emerge
            out:dissolve
            class="flex flex-wrap gap-md justify-center text-caption text-mute"
          >
            {#if activePreset.atmosphere}
              <span>
                Atmosphere: <strong class="badge text-main uppercase"
                  >{activePreset.atmosphere.variant}</strong
                >
                ({activePreset.atmosphere.intensity})
              </span>
            {/if}
            {#if activePreset.environment}
              <span>
                Environment: <strong class="badge text-main uppercase"
                  >{activePreset.environment.variant}</strong
                >
                ({activePreset.environment.intensity})
              </span>
            {/if}
            {#if activePreset.psychology}
              <span>
                Psychology: <strong class="badge text-main uppercase"
                  >{activePreset.psychology.variant}</strong
                >
                ({activePreset.psychology.intensity})
              </span>
            {/if}
          </div>
        {/if}

        <div class="flex flex-row flex-wrap gap-sm justify-center">
          <button class="btn" onclick={() => fireActionVariant('glitch')}>
            Glitch
          </button>
          <button class="btn" onclick={() => fireActionVariant('flash')}>
            Flash
          </button>
          <button class="btn" onclick={() => fireActionVariant('zoomBurst')}>
            Zoom Burst
          </button>
        </div>

        <p class="text-caption text-mute text-center">
          One-shot transient effects that punch through the frame and auto-clear
        </p>

        <ActionBtn
          icon={Remove}
          text="Clear scene"
          class="btn-ghost btn-error self-center"
          onclick={clearPreset}
          disabled={!activePreset}
        />
      </div>

      <details>
        <summary>How It Works</summary>
        <div class="flex flex-col gap-md p-md">
          <p class="text-small text-dim">
            Every effect is <strong>pure CSS and SVG</strong> &mdash; no
            <code>&lt;canvas&gt;</code>, no WebGL, no JavaScript animation
            loops. Particle fields (rain, snow, ash, storm) are real DOM
            elements animated via CSS <code>@keyframes</code> and
            <code>transform3d</code>, which the browser composites on the GPU
            automatically. Complex distortions (underwater caustics, heat
            shimmer, film grain, glitch) use inline SVG filters &mdash;
            <code>feTurbulence</code>
            and
            <code>feDisplacementMap</code> &mdash; with
            <code>&lt;animate&gt;</code>
            elements for real-time parameter mutation.
          </p>

          <p class="text-small text-dim">
            The result is a zero-dependency rendering pipeline that doesn't
            fight the browser &mdash; it <em>is</em> the browser. Every effect
            runs on the same compositor that paints the rest of the page,
            respects
            <code>prefers-reduced-motion</code>, and costs no additional
            JavaScript per frame. The only JS is a single
            <code>requestAnimationFrame</code> callback that drives one float (<code
              >--ambient-level</code
            >) for smooth intensity decay &mdash; not per-particle, per
            <em>layer</em>.
          </p>

          <div class="surface-void p-md flex flex-col gap-sm">
            <p class="text-small font-medium text-main">
              Why not Canvas or WebGL?
            </p>
            <p class="text-small text-dim">
              Canvas-based rendering requires manual hit-testing, breaks native
              accessibility, and forces every visual update through JavaScript.
              The new <strong>HTML-in-Canvas</strong> proposal (WICG, currently
              behind a Chrome flag) can rasterize live HTML into a
              <code>&lt;canvas&gt;</code> for shader effects &mdash; but drawn
              elements <strong>lose interactivity</strong> inside the canvas, and
              the API is experimental with no cross-browser support. Our CSS/SVG
              approach delivers the same atmospheric effects with zero runtime cost,
              full browser compatibility, and inherent accessibility.
            </p>
            <p class="text-small text-dim">
              For effects that genuinely need per-pixel shaders
              (physically-based refraction, volumetric lighting), we're
              exploring targeted
              <code>feDisplacementMap</code> pipelines and will evaluate HTML-in-Canvas
              when it ships &mdash; as an opt-in enhancement, not a foundation rewrite.
            </p>
          </div>
        </div>
      </details>
    </div>
  </section>

  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
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

            <p use:morph class="text-caption text-dim text-center">
              {#if atmosphereEnabled}{atmosphereCaption}{/if}
            </p>

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
                  Will fade out high → medium → low → off after firing
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

            <p use:morph class="text-caption text-dim text-center">
              {#if psychologyEnabled}{psychologyCaption}{/if}
            </p>

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
                  Will fade out high → medium → low → off after firing
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

            <p use:morph class="text-caption text-dim text-center">
              {#if environmentEnabled}{environmentCaption}{/if}
            </p>

            <Switcher
              class="text-center"
              label="Intensity"
              options={intensityOptions}
              value={environmentIntensity}
              onchange={setEnvironmentIntensity}
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

            <p use:morph class="text-caption text-dim text-center">
              {#if actionActive}{actionCaption}{/if}
            </p>

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

      <details>
        <summary>Reference</summary>
        <div class="p-md flex flex-col gap-lg">
          <div class="flex flex-col gap-md">
            <h6>Atmosphere</h6>
            <p class="text-caption text-mute">
              Weather and physical sensory layers. Persistent with auto-decay.
              Sits behind your content.
            </p>
            <dl class="flex flex-col gap-md">
              <div>
                <dt><code>rain</code> — Vertical Downpour</dt>
                <dd class="text-small text-mute">
                  Vertical particle field across three parallax depth bands.
                  Noir scenes, melancholy, cleansing moments, night city
                  streets.
                </dd>
              </div>
              <div>
                <dt><code>snow</code> — Quiet Fall</dt>
                <dd class="text-small text-mute">
                  Soft radial flakes with gentle sway and slow rotation. Winter
                  forests, hushed stillness, fragile beauty, memorial scenes.
                </dd>
              </div>
              <div>
                <dt><code>ash</code> — Burned Aftermath</dt>
                <dd class="text-small text-mute">
                  Torn-paper flakes tumbling down with ~10% glowing embers.
                  Post-apocalypse, scorched cities, funeral pyres, nuclear
                  winter.
                </dd>
              </div>
              <div>
                <dt><code>storm</code> — Hostile Sky</dt>
                <dd class="text-small text-mute">
                  Dense rain with lightning flashes and horizontal wind drift.
                  Peak weather drama, climactic chaos, sea voyages in peril.
                </dd>
              </div>
              <div>
                <dt><code>wind</code> — Dry Tension</dt>
                <dd class="text-small text-mute">
                  Horizontal dust or leaf streaks without precipitation.
                  Deserts, plains, the stillness before a fight, dust storms
                  building.
                </dd>
              </div>
              <div>
                <dt><code>fog</code> — Lost Bearings</dt>
                <dd class="text-small text-mute">
                  Volumetric turbulence with vertical gradient and two masked
                  banks. Misty moors, horror scenes, liminal transitions, dream
                  logic.
                </dd>
              </div>
              <div>
                <dt><code>underwater</code> — Submerged Drift</dt>
                <dd class="text-small text-mute">
                  Soft SVG displacement with cool tint and drifting caustics.
                  Diving, drowning, amniotic dreams, near-death submersion.
                </dd>
              </div>
              <div>
                <dt><code>heat</code> — Oppressive Warp</dt>
                <dd class="text-small text-mute">
                  Real SVG displacement melt above a warm wash. Desert
                  exteriors, forges, volcanic vents, fever delirium.
                </dd>
              </div>
            </dl>
          </div>

          <div class="flex flex-col gap-md">
            <h6>Psychology</h6>
            <p class="text-caption text-mute">
              Edge-framed emotional states. Persistent with auto-decay. Colors
              mood without obscuring the scene center.
            </p>
            <dl class="flex flex-col gap-md">
              <div>
                <dt><code>danger</code> — Active Threat</dt>
                <dd class="text-small text-mute">
                  Crimson vignette pulsing on a heartbeat rhythm from the edges.
                  Predators nearby, boss encounters, low-health moments, red
                  alert.
                </dd>
              </div>
              <div>
                <dt><code>tension</code> — Pressure Building</dt>
                <dd class="text-small text-mute">
                  Staccato micro-tremors with a slowly constricting vignette.
                  Negotiations about to break, sneaking past patrols, withheld
                  truths cracking.
                </dd>
              </div>
              <div>
                <dt><code>dizzy</code> — Lost Equilibrium</dt>
                <dd class="text-small text-mute">
                  Two off-center dark lobes in slow counter-orbits. Concussion,
                  drunk or poisoned perception, vertigo on a high ledge, waking
                  disoriented.
                </dd>
              </div>
              <div>
                <dt><code>focus</code> — Locked In</dt>
                <dd class="text-small text-mute">
                  Living tunnel vision that breathes and tightens toward center.
                  Aiming the final shot, flow state, sniper patience, surgical
                  precision.
                </dd>
              </div>
              <div>
                <dt><code>filmGrain</code> — Memory Recording</dt>
                <dd class="text-small text-mute">
                  Heavy sepia wash with irregular frame-drop flickers.
                  Flashbacks, noir stylization, found footage, unreliable
                  narrators.
                </dd>
              </div>
              <div>
                <dt><code>haze</code> — Dreamlike Layer</dt>
                <dd class="text-small text-mute">
                  Multi-bloom drift with wide hue rotation. Psychedelic
                  sequences, visions, romantic overwhelm, reveries softening.
                </dd>
              </div>
              <div>
                <dt><code>calm</code> — Earned Relief</dt>
                <dd class="text-small text-mute">
                  Cool vignette with a slow breathing pulse. Returning to safety
                  after combat, healing scenes, reconciliation, quiet after
                  exertion.
                </dd>
              </div>
              <div>
                <dt><code>serenity</code> — Deep Stillness</dt>
                <dd class="text-small text-mute">
                  Pale outer glow with near-imperceptible drift. Deep
                  meditation, chosen death, journey's end, transcendence.
                </dd>
              </div>
              <div>
                <dt><code>success</code> — Earned Victory</dt>
                <dd class="text-small text-mute">
                  Warm green vignette with a single outward bloom from center.
                  Quest completed, lock opened, level-up, plan visibly working.
                </dd>
              </div>
              <div>
                <dt><code>fail</code> — Rejection Beat</dt>
                <dd class="text-small text-mute">
                  Red edge flash with sharp attack and quick decay. Failed
                  action, wrong answer, denied access, critical miss, companion
                  lost.
                </dd>
              </div>
              <div>
                <dt><code>awe</code> — Sublime Revelation</dt>
                <dd class="text-small text-mute">
                  Pale gold-white radial brightening from center. First sight of
                  a cathedral or cosmic vista, witnessing a miracle, a reframing
                  revelation.
                </dd>
              </div>
              <div>
                <dt><code>melancholy</code> — Held Grief</dt>
                <dd class="text-small text-mute">
                  Desaturated cool vignette with slow downward drift. After
                  permanent loss, bittersweet endings, rain-soaked goodbyes, the
                  weight carried forward.
                </dd>
              </div>
            </dl>
          </div>

          <div class="flex flex-col gap-md">
            <h6>Environment</h6>
            <p class="text-caption text-mute">
              Sticky baseline color grades. Sets hour and place. No decay, no
              animation — the LUT of the scene.
            </p>
            <dl class="flex flex-col gap-md">
              <div>
                <dt><code>dawn</code> — Sunrise Bloom</dt>
                <dd class="text-small text-mute">
                  Cool blue sky above, warm peach horizon, slow sunrise glow.
                  Morning beginnings, long darkness ending, emotional recovery.
                </dd>
              </div>
              <div>
                <dt><code>dusk</code> — Dying Light</dt>
                <dd class="text-small text-mute">
                  Deep orange bleeding vertically into violet. Sunset scenes,
                  final conversations, romantic and elegiac moments outdoors.
                </dd>
              </div>
              <div>
                <dt><code>candlelit</code> — Intimate Firelight</dt>
                <dd class="text-small text-mute">
                  Warm golden radial spotlight with strong edge falloff.
                  Fire-lit interiors, quiet confessions, ritual chambers, gothic
                  libraries.
                </dd>
              </div>
              <div>
                <dt><code>night</code> — Cool Darkness</dt>
                <dd class="text-small text-mute">
                  Even deep-blue wash across the viewport. Generic night,
                  moonlit stealth, calm night dialogue without immediate danger.
                </dd>
              </div>
              <div>
                <dt><code>neon</code> — Synthetic Glow</dt>
                <dd class="text-small text-mute">
                  Cyan and magenta cast bleeding across the scene. Cyberpunk
                  streets, clubs, arcades, wet reflective city nights.
                </dd>
              </div>
              <div>
                <dt><code>overcast</code> — Drained Sky</dt>
                <dd class="text-small text-mute">
                  Flat grey-blue desaturated wash with slight green undertone.
                  Bleak daytime exteriors, cemeteries, battlefields, emotional
                  numbness.
                </dd>
              </div>
              <div>
                <dt><code>sickly</code> — Quiet Wrongness</dt>
                <dd class="text-small text-mute">
                  Green-yellow radial glow with vignette darkening. Plague
                  zones, cursed villages, fever delirium, abandoned medical
                  facilities.
                </dd>
              </div>
              <div>
                <dt><code>toxic</code> — Active Hazard</dt>
                <dd class="text-small text-mute">
                  Saturated irradiated green, even chemical cast. Radioactive
                  zones, chemical spills, acid swamps, biohazard interiors.
                </dd>
              </div>
              <div>
                <dt><code>underground</code> — Buried Pressure</dt>
                <dd class="text-small text-mute">
                  Dark cool-grey radial with heavy edge darkening. Caves,
                  catacombs, deep mines, bunker depths, claustrophobic darkness.
                </dd>
              </div>
            </dl>
          </div>

          <div class="flex flex-col gap-md">
            <h6>Action</h6>
            <p class="text-caption text-mute">
              Transient one-shot beats. Fire once, auto-unmount. Use for
              discrete moments, never for sustained mood.
            </p>
            <dl class="flex flex-col gap-md">
              <div>
                <dt><code>impact</code> — Shockwave Hit</dt>
                <dd class="text-small text-mute">
                  Radial shockwave ring expanding from center. Heavy punches,
                  landings, collisions, critical hits, doors being breached.
                </dd>
              </div>
              <div>
                <dt><code>speed</code> — Acceleration Sweep</dt>
                <dd class="text-small text-mute">
                  Three-layer parallax sweep with radial edge mask. Dashes,
                  sprints, launches, chase sequences, vehicles taking off.
                </dd>
              </div>
              <div>
                <dt><code>glitch</code> — Reality Stutter</dt>
                <dd class="text-small text-mute">
                  RGB chromatic aberration applied briefly to underlying
                  content. Simulation hiccups, hack attacks, reality tears, AI
                  masks slipping.
                </dd>
              </div>
              <div>
                <dt><code>flash</code> — White Pulse</dt>
                <dd class="text-small text-mute">
                  Full-screen bright pulse with quick rise and decay. Lightning
                  strikes, flash grenades, sudden revelations, teleport
                  arrivals.
                </dd>
              </div>
              <div>
                <dt><code>reveal</code> — Curtain Rise</dt>
                <dd class="text-small text-mute">
                  Radial expand wipe from center outward. Scene openings,
                  chapter starts, unveiling locations, scan pulses finding
                  targets.
                </dd>
              </div>
              <div>
                <dt><code>dissolve</code> — Soft Exit</dt>
                <dd class="text-small text-mute">
                  Soft fade to transparent across a gentle blur. Scene endings,
                  dreams dissolving, gentle death transitions, time-skip exits.
                </dd>
              </div>
              <div>
                <dt><code>shake</code> — World Tremor</dt>
                <dd class="text-small text-mute">
                  Damped translate random walk on the layer root. Nearby
                  explosions rattling the environment, large creatures
                  approaching, earthquakes, structural damage.
                </dd>
              </div>
              <div>
                <dt><code>zoomBurst</code> — Focus Punch</dt>
                <dd class="text-small text-mute">
                  Brief radial scale with outward motion blur from center.
                  Dramatic reveals, decision beats, boss spawns, attention
                  collapsing to one point.
                </dd>
              </div>
            </dl>
          </div>

          <p class="text-caption text-mute">
            Most scenes need at most one or two layers. One variant per category
            at a time. Ambient is seasoning — contrast and restraint make it
            land.
          </p>
        </div>
      </details>
    </div>
  </section>
</div>
