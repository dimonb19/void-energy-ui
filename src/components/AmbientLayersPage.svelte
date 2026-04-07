<script lang="ts">
  import {
    SnowLayer,
    RainLayer,
    FogLayer,
    BloodLayer,
  } from '@dgrslabs/void-energy-ambient-layers';
  import type {
    FlakeDensity,
    RainDensity,
    FogDrift,
  } from '@dgrslabs/void-energy-ambient-layers/types';
  import SliderField from '@components/ui/SliderField.svelte';
  import Switcher from '@components/ui/Switcher.svelte';
  import Toggle from '@components/ui/Toggle.svelte';

  // ── Snow controls ───────────────────────────────────────────────────────
  let snowEnabled = $state(true);
  let snowIntensity = $state(0.7);
  let snowWind = $state(0.4);
  let snowFlakeCount = $state<FlakeDensity>('medium');

  const flakeOptions: { value: FlakeDensity; label: string }[] = [
    { value: 'sparse', label: 'Sparse' },
    { value: 'medium', label: 'Medium' },
    { value: 'heavy', label: 'Heavy' },
  ];

  // ── Rain controls ───────────────────────────────────────────────────────
  let rainEnabled = $state(false);
  let rainIntensity = $state(0.7);
  let rainAngle = $state(15);
  let rainDensity = $state<RainDensity>('medium');

  const rainDensityOptions: { value: RainDensity; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'heavy', label: 'Heavy' },
  ];

  // ── Fog controls ────────────────────────────────────────────────────────
  let fogEnabled = $state(false);
  let fogIntensity = $state(0.7);
  let fogOpacity = $state(0.5);
  let fogDrift = $state<FogDrift>('slow');

  const fogDriftOptions: { value: FogDrift; label: string }[] = [
    { value: 'still', label: 'Still' },
    { value: 'slow', label: 'Slow' },
    { value: 'fast', label: 'Fast' },
  ];

  // ── Blood controls ──────────────────────────────────────────────────────
  let bloodEnabled = $state(false);
  let bloodIntensity = $state(0.7);
  let bloodPulse = $state(true);
  let bloodDripRate = $state(12);
</script>

<!-- Live ambient layers mounted at page root -->
<SnowLayer
  enabled={snowEnabled}
  intensity={snowIntensity}
  wind={snowWind}
  flakeCount={snowFlakeCount}
/>
<RainLayer
  enabled={rainEnabled}
  intensity={rainIntensity}
  angle={rainAngle}
  density={rainDensity}
/>
<FogLayer
  enabled={fogEnabled}
  intensity={fogIntensity}
  opacity={fogOpacity}
  drift={fogDrift}
/>
<BloodLayer
  enabled={bloodEnabled}
  intensity={bloodIntensity}
  pulse={bloodPulse}
  dripRate={bloodDripRate}
/>

<div class="container flex flex-col gap-2xl py-2xl">
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <p class="text-caption text-mute">Premium package</p>
        <h1>Ambient Layers</h1>
        <p class="text-dim max-w-2xl">
          Full-viewport overlay layers that add environmental atmosphere — snow,
          rain, fog, blood — without ever blocking interaction. Each layer
          adapts to the active physics preset and color mode automatically.
          Switch atmospheres while the snow is falling to see it re-skin in
          place.
        </p>
      </div>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <h3>SnowLayer</h3>
          <p class="text-dim">
            CSS-particle snowfall. Tune intensity, wind, and density live.
          </p>
        </div>

        <Toggle bind:checked={snowEnabled} label="Enabled" />

        <SliderField
          label="Intensity"
          min={0}
          max={1}
          step={0.05}
          bind:value={snowIntensity}
        />

        <SliderField
          label="Wind"
          min={0}
          max={1}
          step={0.05}
          bind:value={snowWind}
        />

        <Switcher
          label="Flake density"
          options={flakeOptions}
          bind:value={snowFlakeCount}
        />
      </div>
    </div>

    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <h3>RainLayer</h3>
          <p class="text-dim">
            Angled CSS streak rainfall. Tune intensity, angle, and density live.
          </p>
        </div>

        <Toggle bind:checked={rainEnabled} label="Enabled" />

        <SliderField
          label="Intensity"
          min={0}
          max={1}
          step={0.05}
          bind:value={rainIntensity}
        />

        <SliderField
          label="Angle"
          min={-45}
          max={45}
          step={1}
          bind:value={rainAngle}
        />

        <Switcher
          label="Drop density"
          options={rainDensityOptions}
          bind:value={rainDensity}
        />
      </div>
    </div>

    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <h3>FogLayer</h3>
          <p class="text-dim">
            Drifting volumetric mist blobs. Tune intensity, opacity ceiling, and
            drift speed live.
          </p>
        </div>

        <Toggle bind:checked={fogEnabled} label="Enabled" />

        <SliderField
          label="Intensity"
          min={0}
          max={1}
          step={0.05}
          bind:value={fogIntensity}
        />

        <SliderField
          label="Opacity"
          min={0}
          max={1}
          step={0.05}
          bind:value={fogOpacity}
        />

        <Switcher
          label="Drift speed"
          options={fogDriftOptions}
          bind:value={fogDrift}
        />
      </div>
    </div>

    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <h3>BloodLayer</h3>
          <p class="text-dim">
            Horror vignette with a heartbeat pulse plus configurable falling
            drips. Toggle pulse independently from drip rate — set drips to 0
            for just the vignette, or disable pulse for just drips.
          </p>
        </div>

        <Toggle bind:checked={bloodEnabled} label="Enabled" />

        <SliderField
          label="Intensity"
          min={0}
          max={1}
          step={0.05}
          bind:value={bloodIntensity}
        />

        <Toggle bind:checked={bloodPulse} label="Heartbeat pulse" />

        <SliderField
          label="Drip rate (per minute)"
          min={0}
          max={60}
          step={1}
          bind:value={bloodDripRate}
        />
      </div>
    </div>
  </section>
</div>
