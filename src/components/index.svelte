<script lang="ts">
  import { voidEngine } from '../adapters/void-engine.svelte';
  import { modal } from '../lib/modal-manager.svelte';
  import { tooltip } from '../actions/tooltip';
  import { toast } from '../stores/toast.svelte';
  import { live, singularity } from '../lib/transitions.svelte';

  import ThemeSelector from './ui/Themes.svelte';
  import SettingsRow from './ui/SettingsRow.svelte';

  // CONSTANTS
  const fontOptions = [
    { label: 'System Default (Atmosphere)', value: null },
    { label: 'Hanken Grotesk (Tech)', value: "'Hanken Grotesk', sans-serif" },
    { label: 'Inter (Clean)', value: "'Inter', sans-serif" },
    { label: 'Courier Prime (Code)', value: "'Courier Prime', monospace" },
    { label: 'Lora (Serif)', value: "'Lora', serif" },
    { label: 'Open Sans (Standard)', value: "'Open Sans', sans-serif" },
    { label: 'Comic Neue (Casual)', value: "'Comic Neue', sans-serif" },
  ];

  const scaleLevels = [
    { label: 'XS', value: 0.85, name: 'Minimal' },
    { label: 'S', value: 0.925, name: 'Compact' },
    { label: 'M', value: 1.0, name: 'Standard' },
    { label: 'L', value: 1.125, name: 'Large' },
    { label: 'XL', value: 1.25, name: 'Extra' },
  ];

  const densityOptions = [
    { value: 'high', label: 'Compact', icon: '🥓' },
    { value: 'standard', label: 'Standard', icon: '🍔' },
    { value: 'low', label: 'Relaxed', icon: '🥗' },
  ];

  // LOGIC: Derived State from Engine
  let activeScaleStep = $derived(
    scaleLevels.reduce((prev, curr) =>
      Math.abs(curr.value - voidEngine.userConfig.scale) <
      Math.abs(prev.value - voidEngine.userConfig.scale)
        ? curr
        : prev,
    ),
  );

  // ACTIONS: Direct Engine Updates
  function setScale(value: number) {
    voidEngine.setPreferences({ scale: value });
  }

  function setDensity(d: 'high' | 'standard' | 'low') {
    voidEngine.setPreferences({ density: d });
  }

  // LOCAL STATE (UI Only)
  let moduleTiles = $state(['Neural Net', 'Firewall', 'Log v.1']);
  let newModuleTile = $state(null);
  let environmentTiles = $state([
    'Physics Engine',
    'Audio Synth',
    'Visual Renderer',
  ]);
  let newEnvironmentTile = $state(null);
  let premiumTiles = $state(['Quantum Core', 'AI Supervisor']);
  let newPremiumTile = $state(null);
</script>

<main class="w-full min-h-screen">
  <header class="container flex flex-col items-center gap-md mt-md">
    <h1>VOID ENERGY</h1>

    <div class="flex flex-col p-md gap-sm surface-glass">
      <p>System Architecture // Component Library</p>

      <ThemeSelector />

      <label for="font-heading" class="text-small">Headings</label>
      <select
        id="font-heading"
        value={voidEngine.userConfig.fontHeading}
        onchange={(e) =>
          voidEngine.setPreferences({
            fontHeading: e.currentTarget.value || null,
          })}
      >
        {#each fontOptions as font}
          <option value={font.value}>{font.label}</option>
        {/each}
      </select>

      <label for="font-body" class="text-small">Body Text</label>
      <select
        id="font-body"
        value={voidEngine.userConfig.fontBody}
        onchange={(e) =>
          voidEngine.setPreferences({
            fontBody: e.currentTarget.value || null,
          })}
      >
        {#each fontOptions as font (font.label)}
          <option value={font.value}>{font.label}</option>
        {/each}
      </select>

      <div class="flex-col gap-xs pt-sm hidden tablet:flex">
        <div class="flex flex-row justify-between items-end">
          <label for="">Interface Scale</label>
          <span>
            {activeScaleStep.name} ({Math.round(activeScaleStep.value * 100)}%)
          </span>
        </div>

        <div
          class="surface-sunk p-xs rounded-md flex flex-row gap-xs justify-between"
        >
          {#each scaleLevels as level (level.value)}
            <button
              aria-pressed={activeScaleStep.value === level.value}
              onclick={() => setScale(level.value)}
            >
              {level.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="hidden tablet:flex flex-col gap-xs pt-sm">
        <div class="flex flex-row justify-between items-end">
          <label for="density">Spacing Density</label>
          <span>
            ({voidEngine.userConfig.density})
          </span>
        </div>

        <div
          class="surface-sunk p-xs rounded-md flex flex-row gap-xs justify-between"
        >
          {#each densityOptions as opt (opt.value)}
            <button
              aria-pressed={voidEngine.userConfig.density === opt.value}
              onclick={() =>
                setDensity(opt.value as 'high' | 'standard' | 'low')}
            >
              {opt.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </header>

  <div class="container flex flex-col gap-xl">
    <section class="flex flex-col gap-md mt-md">
      <div class="flex flex-row justify-between items-end">
        <h2>01 // CONFIGURATION</h2>
        <p class="hidden tablet:block">SECURE CONNECTION</p>
      </div>

      <div class="surface-glass p-lg flex flex-col gap-lg">
        <div class="flex flex-row flex-wrap gap-md">
          <div class="flex flex-col gap-xs flex-1">
            <label for="system-identifier"> System Identifier </label>
            <input
              id="system-identifier"
              type="text"
              placeholder="Enter Agent ID..."
            />
          </div>

          <div class="flex flex-col gap-xs flex-1">
            <label for="security-clearance"> Security Clearance </label>
            <select id="security-clearance">
              <option>Level 1 - Observer</option>
              <option>Level 2 - Operator</option>
              <option>Level 3 - Administrator</option>
            </select>
          </div>
        </div>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>

        <div class="flex flex-col gap-xs flex-1">
          <label for="energy-output">Energy Output</label>
          <input id="energy-output" type="range" value="50" min="0" max="100" />
        </div>

        <div class="flex flex-row flex-wrap gap-lg pt-lg border-top">
          <div class="flex flex-col gap-sm">
            <label>
              <input type="radio" name="mode" checked />
              <span>Manual Override</span>
            </label>
            <label>
              <input type="radio" name="mode" />
              <span>Auto-Pilot</span>
            </label>
          </div>

          <div class="flex flex-col gap-sm">
            <label>
              <input type="checkbox" checked />
              <span>Enable Telemetry</span>
            </label>
            <label>
              <input type="checkbox" />
              <span>Allow External Connections</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-md mt-md">
      <h2>02 // COMMAND DECK</h2>

      <div class="surface-glass p-lg flex flex-col gap-lg">
        <div class="flex flex-col items-center gap-md">
          <a class="link" href="https://dgrslabs.ink/"
            >Visit DGRS LABS website</a
          >
          <button
            class="btn-cta"
            onclick={async () => {
              // 1. Trigger the Modal and PAUSE execution here
              const confirmed = await modal.confirm(
                'INITIATE SEQUENCE?',
                'You are about to deploy the production build.<br>This action cannot be undone by standard protocols.',
                500, // Cost
              );

              // 2. Only run this if user clicked "Confirm"
              if (confirmed) {
                toast.show(
                  'Sequence Initiated. Void Energy consuming...',
                  'success',
                );
              } else {
                toast.show('Sequence Aborted.', 'info');
              }
            }}
          >
            INITIATE SEQUENCE
          </button>
        </div>

        <div class="flex flex-row flex-wrap justify-center gap-sm">
          <button
            class="btn-premium"
            onclick={() => {
              toast.show('No permission to upgrade core', 'warning');
            }}
          >
            Upgrade Core
          </button>
          <button
            class="btn-system"
            onclick={() => {
              toast.show('Running system diagnostics...', 'loading');
            }}
          >
            Diagnostics
          </button>
          <button
            class="btn-signal"
            use:tooltip={'Success Button Styling'}
            onclick={() => {
              toast.show('Connection Established Successfully!', 'success');
            }}
          >
            Secure Channel
          </button>
          <button
            class="btn-alert"
            use:tooltip={'Error Button Styling'}
            onclick={() => {
              toast.show('Cache Purge Failed!', 'error');
            }}
          >
            Purge Cache
          </button>
          <button
            use:tooltip={'Standard Button Styling'}
            onclick={() => {
              toast.show('Default action executed.', 'info');
            }}
          >
            Default Action
          </button>
          <button disabled>Offline</button>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-md mt-md">
      <h2>03 // PARAMETERS</h2>

      <div class="surface-glass p-lg flex flex-col gap-lg">
        <SettingsRow label="Rendering">
          <div class="flex flex-row flex-wrap gap-md w-full">
            <div class="flex flex-col flex-1 gap-xs">
              <label for="visual-fidelity" class="text-small text-center"
                >Visual Fidelity</label
              >
              <select id="visual-fidelity">
                <option>ULTRA (4K)</option>
                <option>HIGH (1440p)</option>
                <option>PERFORMANCE (1080p)</option>
              </select>
            </div>
            <div class="flex flex-col flex-1 gap-xs">
              <label for="frame-rate" class="text-small text-center"
                >Frame Rate</label
              >
              <select id="frame-rate">
                <option>120 HZ</option>
                <option>60 HZ</option>
                <option>30 HZ</option>
              </select>
            </div>
          </div>
        </SettingsRow>

        <hr />

        <SettingsRow label="Active Modules">
          <div
            class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center rounded-md"
          >
            {#if moduleTiles.length === 0}
              <p class="text-uppercase text-dim text-caption">
                No active modules
              </p>
            {:else}
              {#each moduleTiles as btn, i (btn)}
                <div class="tile-small" animate:live out:singularity>
                  <p class="tile-label">{btn}</p>
                  <button
                    type="button"
                    class="btn-void tile-remove"
                    aria-label="Remove {btn}"
                    onclick={() => {
                      moduleTiles = moduleTiles.filter(
                        (_, index) => index !== i,
                      );
                    }}>✕</button
                  >
                </div>
              {/each}
            {/if}
          </div>
          <div class="flex flex-row gap-sm">
            <select class="flex-1" bind:value={newModuleTile}>
              <option value={null} hidden>Select Module...</option>
              <option value="Physics Engine">Physics Engine</option>
              <option value="Audio Synth">Audio Synth</option>
              <option value="Visual Renderer">Visual Renderer</option>
              <option value="Data Analyzer">Data Analyzer</option>
              <option value="Network Monitor">Network Monitor</option>
            </select>
            <button
              onclick={() => {
                if (newModuleTile) moduleTiles.push(newModuleTile);
              }}
              disabled={!newModuleTile}>Add Module</button
            >
          </div>
        </SettingsRow>

        <hr />

        <SettingsRow label="Environment">
          <div
            class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center rounded-md"
          >
            {#if environmentTiles.length === 0}
              <p class="text-uppercase text-dim text-caption">
                No environments selected
              </p>
            {:else}
              {#each environmentTiles as btn, i (btn)}
                <div class="tile-small-system" animate:live out:singularity>
                  <p class="tile-label">{btn}</p>
                  <button
                    type="button"
                    class="btn-void tile-remove"
                    aria-label="Remove {btn}"
                    onclick={() => {
                      environmentTiles = environmentTiles.filter(
                        (_, index) => index !== i,
                      );
                    }}>✕</button
                  >
                </div>
              {/each}
            {/if}
          </div>
          <div class="flex flex-row gap-sm">
            <select class="flex-1" bind:value={newEnvironmentTile}>
              <option value={null} hidden>Select Environment...</option>
              <option value="Physics Engine">Physics Engine</option>
              <option value="Audio Synth">Audio Synth</option>
              <option value="Visual Renderer">Visual Renderer</option>
              <option value="Data Analyzer">Data Analyzer</option>
              <option value="Network Monitor">Network Monitor</option>
            </select>
            <button
              class="btn-system"
              onclick={() => {
                if (newEnvironmentTile)
                  environmentTiles.push(newEnvironmentTile);
              }}
              disabled={!newEnvironmentTile}>Add Module</button
            >
          </div>
        </SettingsRow>

        <hr />

        <SettingsRow label="Premium Modules">
          <div
            class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center rounded-md"
          >
            {#if premiumTiles.length === 0}
              <p class="text-uppercase text-dim text-caption">
                No premium modules
              </p>
            {:else}
              {#each premiumTiles as btn, i (btn)}
                <div class="tile-small-premium" animate:live out:singularity>
                  <p class="tile-label">{btn}</p>
                  <button
                    type="button"
                    class="btn-void tile-remove"
                    aria-label="Remove {btn}"
                    onclick={() => {
                      premiumTiles = premiumTiles.filter(
                        (_, index) => index !== i,
                      );
                    }}>✕</button
                  >
                </div>
              {/each}
            {/if}
          </div>
          <div class="flex flex-row gap-sm">
            <select class="flex-1" bind:value={newPremiumTile}>
              <option value={null} hidden>Select Premium Module...</option>
              <option value="Quantum Core">Quantum Core</option>
              <option value="AI Supervisor">AI Supervisor</option>
              <option value="Neural Interface">Neural Interface</option>
              <option value="Temporal Anchor">Temporal Anchor</option>
              <option value="Network Monitor">Network Monitor</option>
            </select>
            <button
              class="btn-premium"
              onclick={() => {
                if (newPremiumTile) premiumTiles.push(newPremiumTile);
              }}
              disabled={!newPremiumTile}>Add Module</button
            >
          </div>
        </SettingsRow>
      </div>
    </section>

    <section class="flex flex-col gap-md mt-md">
      <h2>04 // DATA UPLOAD</h2>

      <div class="p-md surface-glass">
        <div class="dropzone">
          <input type="file" />
          <div class="dropzone-content">
            <span class="btn-icon">📂</span>
            <p>Upload Neural Patterns</p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <section class="flex flex-col gap-md mt-2xl">
    <h2 class="container">05 // RECENT ANOMALIES</h2>

    <div class="tiles-collection">
      <button type="button" class="btn-void tile">
        <img
          src="https://media.dgrslabs.ink/conexus-sections/dischordiansaga.avif"
          alt="Sector 7G Cover"
        />
        <div class="tile-data">
          <h5>Sector 7G</h5>
          <p>
            Status: <strong>Active</strong>
          </p>
        </div>
      </button>

      <button type="button" class="btn-void tile">
        <img
          src="https://media.dgrslabs.ink/conexus-sections/communitypicks.avif"
          alt="Core Dump Cover"
        />
        <div class="tile-data">
          <h5>Core Dump</h5>
          <p>Size: 4.2 TB</p>
        </div>
      </button>

      <button type="button" class="btn-void tile">
        <img
          src="https://media.dgrslabs.ink/conexus-sections/collabs.avif"
          alt="Collaborations Cover"
        />
        <div class="tile-data">
          <h5>Collaborations</h5>
        </div>
      </button>

      <button type="button" class="btn-void tile">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
          alt="Deep Net Cover"
        />
        <div class="tile-data">
          <h5>Deep Net</h5>
          <p>Signal: 98%</p>
        </div>
      </button>

      <div class="loading-tile"></div>

      <div class="loading-tile"></div>

      <div class="loading-tile"></div>
    </div>
  </section>
</main>
