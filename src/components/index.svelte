<script lang="ts">
  import { theme } from '../adapters/themes.svelte';
  import { showModal } from '../stores/modal.svelte';
  import { tooltip } from '../actions/tooltip';
  import { toast } from '../stores/toast.svelte';
  import { live, singularity } from '../lib/transitions.svelte';
  import ThemeSelector from './Themes.svelte';

  const engine = theme.raw;

  // 1. Initialize State
  let atmosphere = $state(engine.atmosphere);
  let currentScale = $state(engine.userConfig.scale);
  let currentDensity = $state(engine.userConfig.density);

  // 2. Handle the Engine Instance
  $effect.root(() => {
    return engine.subscribe((eng) => {
      atmosphere = eng.atmosphere;
      currentScale = eng.userConfig.scale;
      currentDensity = eng.userConfig.density;
    });
  });

  // 3. Push Atmosphere changes back
  $effect(() => {
    if (atmosphere !== engine.atmosphere) {
      theme.atmosphere = atmosphere;
    }
  });

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
    { label: 'XS', value: 0.75, name: 'Minimal' }, // Matches Engine Min
    { label: 'S', value: 0.85, name: 'Compact' },
    { label: 'M', value: 1.0, name: 'Standard' }, // Default
    { label: 'L', value: 1.25, name: 'Large' },
    { label: 'XL', value: 1.5, name: 'Extra' },
    { label: 'MAX', value: 2.0, name: 'Maximum' }, // Matches Engine Max
  ];

  let activeScaleStep = $derived(
    scaleLevels.reduce((prev, curr) =>
      Math.abs(curr.value - currentScale) < Math.abs(prev.value - currentScale)
        ? curr
        : prev,
    ),
  );

  function setScale(value: number) {
    theme.setScale(value);
    currentScale = value;
  }

  const densityOptions = [
    { value: 'high', label: 'Compact', icon: '🥓' },
    { value: 'standard', label: 'Standard', icon: '🍔' },
    { value: 'low', label: 'Relaxed', icon: '🥗' },
  ];

  const setDensity = (d: 'high' | 'standard' | 'low') => theme.setDensity(d);

  // Sample small tiles for the "Active Modules" section
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
    <h1 class="text-highlight">VOID ENERGY</h1>

    <div class="flex flex-col p-md gap-sm surface-glass">
      <p>System Architecture // Component Library</p>

      <ThemeSelector />

      <label for="font-heading" class="text-small">Headings</label>
      <select
        id="font-heading"
        value={theme.config.fontHeading}
        onchange={(e) =>
          theme.setFonts(e.currentTarget.value || null, theme.config.fontBody!)}
      >
        {#each fontOptions as font}
          <option value={font.value}>{font.label}</option>
        {/each}
      </select>

      <label for="font-body" class="text-small">Body Text</label>
      <select
        id="font-body"
        value={theme.config.fontBody}
        onchange={(e) =>
          theme.setFonts(
            theme.config.fontHeading!,
            e.currentTarget.value || null,
          )}
      >
        {#each fontOptions as font}
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
          {#each scaleLevels as level}
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
            ({currentDensity})
          </span>
        </div>

        <div
          class="surface-sunk p-xs rounded-md flex flex-row gap-xs justify-between"
        >
          {#each densityOptions as opt}
            <button
              aria-pressed={currentDensity === opt.value}
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
            onclick={() => {
              $showModal = true;
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
        <div class="settings-grid">
          <div class="settings-label">Rendering</div>
          <div class="settings-content flow-row">
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
        </div>

        <hr />

        <div class="settings-grid">
          <div class="settings-label">Active Modules</div>
          <div class="settings-content">
            <div
              class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
            >
              {#if moduleTiles.length === 0}
                <p class="text-uppercase text-dim text-caption">
                  No active modules
                </p>
              {:else}
                {#each moduleTiles as btn, i (i)}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <button class="tile-small" animate:live out:singularity>
                    <p class="tile-label">{btn}</p>
                    <span
                      class="tile-remove"
                      role="button"
                      tabindex="0"
                      onclick={() => {
                        moduleTiles = moduleTiles.filter(
                          (tile, index) => index !== i,
                        );
                      }}
                    >
                      ✕
                    </span>
                  </button>
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
                  moduleTiles.push(newModuleTile!);
                }}
                disabled={!newModuleTile}
              >
                Add Module
              </button>
            </div>
          </div>
        </div>

        <hr />

        <div class="settings-grid">
          <div class="settings-label">Environment</div>
          <div class="settings-content">
            <div
              class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
            >
              {#if environmentTiles.length === 0}
                <p class="text-uppercase text-dim text-caption">
                  No environments selected
                </p>
              {:else}
                {#each environmentTiles as btn, i (i)}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <button
                    class="tile-small-system"
                    animate:live
                    out:singularity
                  >
                    <p class="tile-label">{btn}</p>
                    <span
                      class="tile-remove"
                      role="button"
                      tabindex="0"
                      onclick={() => {
                        environmentTiles = environmentTiles.filter(
                          (tile, index) => index !== i,
                        );
                      }}
                    >
                      ✕
                    </span>
                  </button>
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
                  environmentTiles.push(newEnvironmentTile!);
                }}
                disabled={!newEnvironmentTile}
              >
                Add Module
              </button>
            </div>
          </div>
        </div>

        <hr />

        <div class="settings-grid">
          <div class="settings-label">Premium Modules</div>
          <div class="settings-content">
            <div
              class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
            >
              {#if premiumTiles.length === 0}
                <p class="text-uppercase text-dim text-caption">
                  No premium modules
                </p>
              {:else}
                {#each premiumTiles as btn, i (i)}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <button
                    class="tile-small-premium"
                    animate:live
                    out:singularity
                  >
                    <p class="tile-label">{btn}</p>
                    <span
                      class="tile-remove"
                      role="button"
                      tabindex="0"
                      onclick={() => {
                        premiumTiles = premiumTiles.filter(
                          (tile, index) => index !== i,
                        );
                      }}
                    >
                      ✕
                    </span>
                  </button>
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
                  premiumTiles.push(newPremiumTile!);
                }}
                disabled={!newPremiumTile}
              >
                Add Module
              </button>
            </div>
          </div>
        </div>
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
      <a href="/" class="tile" onclick={(e) => e.preventDefault()}>
        <img
          src="https://media.dgrslabs.ink/conexus-sections/dischordiansaga.avif"
          alt="Cyber"
        />
        <div class="tile-data">
          <h5>Sector 7G</h5>
          <p>
            Status: <strong class="text-success">Active</strong>
          </p>
        </div>
      </a>

      <a href="/" class="tile" onclick={(e) => e.preventDefault()}>
        <img
          src="https://media.dgrslabs.ink/conexus-sections/communitypicks.avif"
          alt="Fluid"
        />
        <div class="tile-data">
          <h5>Core Dump</h5>
          <p>Size: 4.2 TB</p>
        </div>
      </a>

      <a href="/" class="tile" onclick={(e) => e.preventDefault()}>
        <img
          src="https://media.dgrslabs.ink/conexus-sections/collabs.avif"
          alt="Fluid"
        />
        <div class="tile-data">
          <h5>Collaborations</h5>
        </div>
      </a>

      <a href="/" class="tile" onclick={(e) => e.preventDefault()}>
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
          alt="Abstract"
        />
        <div class="tile-data">
          <h5>Deep Net</h5>
          <p>Signal: 98%</p>
        </div>
      </a>

      <div class="loading-tile"></div>

      <div class="loading-tile"></div>

      <div class="loading-tile"></div>
    </div>
  </section>
</main>
