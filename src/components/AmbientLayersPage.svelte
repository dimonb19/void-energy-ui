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
    { value: 'storm', label: 'Storm' },
    { value: 'wind', label: 'Wind' },
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
    { value: 'filmGrain', label: 'Film Grain' },
    { value: 'haze', label: 'Haze' },
    { value: 'calm', label: 'Calm' },
    { value: 'serenity', label: 'Serenity' },
    { value: 'success', label: 'Success' },
    { value: 'fail', label: 'Fail' },
    { value: 'awe', label: 'Awe' },
    { value: 'melancholy', label: 'Melancholy' },
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
    { value: 'dissolve', label: 'Dissolve' },
    { value: 'shake', label: 'Shake' },
    { value: 'zoomBurst', label: 'Zoom Burst' },
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
    { value: 'overcast', label: 'Overcast' },
  ];
  let environmentEnabled = $state(false);
  let environmentVariant = $state<EnvironmentLayerId>('night');
  let environmentIntensity = $state<AmbientIntensity>('medium');

  function setEnvironmentIntensity(v: string | number | null) {
    environmentIntensity = v as AmbientIntensity;
  }

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
