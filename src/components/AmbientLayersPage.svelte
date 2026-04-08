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
    ActionLevel,
  } from '@dgrslabs/void-energy-ambient-layers';
  import '@dgrslabs/void-energy-ambient-layers/styles';

  import Tabs from '@components/ui/Tabs.svelte';
  import Switcher from '@components/ui/Switcher.svelte';
  import Toggle from '@components/ui/Toggle.svelte';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import { RotateCcw, Play } from '@lucide/svelte';

  // ── Tabs ────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'atmosphere', label: 'Atmosphere' },
    { id: 'psychology', label: 'Psychology' },
    { id: 'action', label: 'Action' },
    { id: 'environment', label: 'Environment' },
  ];
  let activeTab = $state('atmosphere');

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
  let atmosphereEnabled = $state(true);
  let atmosphereVariant = $state<AtmosphereLayerId>('rain');
  let atmosphereIntensity = $state<AmbientIntensity>(2);
  let atmosphereReplayKey = $state(0);
  let atmosphereDecayOn = $state(false);

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
  let psychologyIntensity = $state<AmbientIntensity>(2);
  let psychologyReplayKey = $state(0);
  let psychologyDecayOn = $state(false);

  // ── Action controls ────────────────────────────────────────────────
  const actionVariants: { value: ActionLayerId; label: string }[] = [
    { value: 'impact', label: 'Impact' },
    { value: 'speed', label: 'Speed' },
    { value: 'glitch', label: 'Glitch' },
    { value: 'flash', label: 'Flash' },
    { value: 'reveal', label: 'Reveal' },
  ];
  const actionLevels: { value: ActionLevel; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'heavy', label: 'Heavy' },
  ];
  let actionVariant = $state<ActionLayerId>('impact');
  let actionLevel = $state<ActionLevel>('medium');
  let actionActive = $state(false);
  let actionFireKey = $state(0);

  function fireAction() {
    // Remount via key so consecutive fires always replay cleanly.
    actionFireKey++;
    actionActive = true;
  }

  // ── Environment controls ───────────────────────────────────────────
  const environmentVariants: {
    value: EnvironmentLayerId;
    label: string;
  }[] = [
    { value: 'night', label: 'Night' },
    { value: 'indoor_warm', label: 'Indoor Warm' },
    { value: 'neon', label: 'Neon' },
    { value: 'dawn', label: 'Dawn' },
    { value: 'dusk', label: 'Dusk' },
    { value: 'overcast', label: 'Overcast' },
    { value: 'sickly', label: 'Sickly' },
    { value: 'toxic', label: 'Toxic' },
    { value: 'underground', label: 'Underground' },
    { value: 'candlelit', label: 'Candlelit' },
  ];
  let environmentEnabled = $state(false);
  let environmentVariant = $state<EnvironmentLayerId>('night');

  // Switcher coerces to string|number; wrap setters for type narrowing.
  function setAtmosphereVariant(v: string | number | null) {
    atmosphereVariant = v as AtmosphereLayerId;
  }
  function setPsychologyVariant(v: string | number | null) {
    psychologyVariant = v as PsychologyLayerId;
  }
  function setActionVariant(v: string | number | null) {
    actionVariant = v as ActionLayerId;
  }
  function setActionLevel(v: string | number | null) {
    actionLevel = v as ActionLevel;
  }
  function setEnvironmentVariant(v: string | number | null) {
    environmentVariant = v as EnvironmentLayerId;
  }
  function setAtmosphereIntensity(v: string | number | null) {
    atmosphereIntensity = Number(v) as AmbientIntensity;
  }
  function setPsychologyIntensity(v: string | number | null) {
    psychologyIntensity = Number(v) as AmbientIntensity;
  }

  const intensityOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
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
    />
  {/key}
{/if}

{#if psychologyEnabled}
  {#key psychologyReplayKey}
    <PsychologyLayer
      variant={psychologyVariant}
      intensity={psychologyIntensity}
      decayMs={psychologyDecayOn ? undefined : 0}
    />
  {/key}
{/if}

{#if actionActive}
  {#key actionFireKey}
    <ActionLayer
      variant={actionVariant}
      level={actionLevel}
      onComplete={() => (actionActive = false)}
    />
  {/key}
{/if}

<div class="container flex flex-col gap-2xl py-2xl">
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <p class="text-caption text-mute">Premium package</p>
        <h1>Ambient Layers</h1>
        <p class="text-dim max-w-2xl">
          Full-viewport overlay layers across four categories — atmosphere,
          psychology, action, environment. Twenty-six variants, four components,
          one SCSS file. Physics-agnostic: layers look identical across glass,
          flat, and retro except for a single global stepped-timing rule in
          retro. Pick a category, pick a variant, see it live.
        </p>
      </div>
    </div>

    <div class="surface-raised p-lg flex flex-col gap-lg">
      <Tabs {tabs} bind:value={activeTab}>
        {#snippet panel(tab)}
          {#if tab.id === 'atmosphere'}
            <div class="surface-sunk p-md flex flex-col gap-md">
              <div class="flex flex-col gap-xs">
                <h3>Atmosphere</h3>
                <p class="text-dim">
                  Persistent weather layers behind content. Rain and snow
                  particle-field, ash slow drift, fog/underwater/heat volumetric
                  blobs.
                </p>
              </div>

              <Toggle bind:checked={atmosphereEnabled} label="Enabled" />

              <Switcher
                label="Variant"
                options={atmosphereVariants}
                value={atmosphereVariant}
                onchange={setAtmosphereVariant}
              />

              <Switcher
                label="Intensity"
                options={intensityOptions}
                value={atmosphereIntensity}
                onchange={setAtmosphereIntensity}
              />

              <Toggle bind:checked={atmosphereDecayOn} label="Auto-decay" />

              <div class="flex flex-row gap-md">
                <ActionBtn
                  icon={RotateCcw}
                  text="Replay"
                  onclick={() => atmosphereReplayKey++}
                />
              </div>
            </div>
          {:else if tab.id === 'psychology'}
            <div class="surface-sunk p-md flex flex-col gap-md">
              <div class="flex flex-col gap-xs">
                <h3>Psychology</h3>
                <p class="text-dim">
                  Edge-framed mental/emotional layers. Danger and tension pulse
                  at the edges; dizzy/focus/flashback/dreaming shape the
                  viewport itself.
                </p>
              </div>

              <Toggle bind:checked={psychologyEnabled} label="Enabled" />

              <Switcher
                label="Variant"
                options={psychologyVariants}
                value={psychologyVariant}
                onchange={setPsychologyVariant}
              />

              <Switcher
                label="Intensity"
                options={intensityOptions}
                value={psychologyIntensity}
                onchange={setPsychologyIntensity}
              />

              <Toggle bind:checked={psychologyDecayOn} label="Auto-decay" />

              <div class="flex flex-row gap-md">
                <ActionBtn
                  icon={RotateCcw}
                  text="Replay"
                  onclick={() => psychologyReplayKey++}
                />
              </div>
            </div>
          {:else if tab.id === 'action'}
            <div class="surface-sunk p-md flex flex-col gap-md">
              <div class="flex flex-col gap-xs">
                <h3>Action</h3>
                <p class="text-dim">
                  One-shot transient layers. Fire, animate, auto-unmount. Level
                  scales amplitude and duration.
                </p>
              </div>

              <Switcher
                label="Variant"
                options={actionVariants}
                value={actionVariant}
                onchange={setActionVariant}
              />

              <Switcher
                label="Level"
                options={actionLevels}
                value={actionLevel}
                onchange={setActionLevel}
              />

              <div class="flex flex-row gap-md">
                <ActionBtn icon={Play} text="Fire" onclick={fireAction} />
              </div>
            </div>
          {:else if tab.id === 'environment'}
            <div class="surface-sunk p-md flex flex-col gap-md">
              <div class="flex flex-col gap-xs">
                <h3>Environment</h3>
                <p class="text-dim">
                  Sticky baseline tint layers — deepest z-slot, no decay, no
                  intensity. Night, warm indoor, and neon color grades.
                </p>
              </div>

              <Toggle bind:checked={environmentEnabled} label="Enabled" />

              <Switcher
                label="Variant"
                options={environmentVariants}
                value={environmentVariant}
                onchange={setEnvironmentVariant}
              />
            </div>
          {/if}
        {/snippet}
      </Tabs>
    </div>
  </section>
</div>
