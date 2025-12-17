<script lang="ts">
  import { theme } from '../adapters/themes.svelte';
  import { showModal } from '../stores/modal.svelte';
  import { tooltip } from '../actions/tooltip';
  import { toast } from '../stores/toast.svelte';

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
    { label: 'XS', value: 0.85, name: 'Compact' },
    { label: 'S', value: 1.0, name: 'Standard' },
    { label: 'M', value: 1.15, name: 'Comfort' },
    { label: 'L', value: 1.3, name: 'Large' },
    { label: 'XL', value: 1.5, name: 'Extra' },
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
</script>

<main class="w-full min-h-screen">
  <header class="container flex flex-col items-center gap-md mt-md">
    <h1 class="text-highlight">VOID ENERGY</h1>

    <div class="flex flex-col p-md gap-sm surface-glass">
      <p>System Architecture // Component Library</p>
      <select bind:value={atmosphere}>
        <option value="void">Void Atmosphere</option>
        <option value="onyx">Onyx Atmosphere</option>
        <option value="terminal">Terminal Atmosphere</option>
        <option value="crimson">Crimson Atmosphere</option>
        <option value="overgrowth">Overgrowth Atmosphere</option>
        <option value="velvet">Velvet Atmosphere</option>
        <option value="solar">Solar Atmosphere</option>
        <option value="nebula">Nebula Atmosphere</option>
        <option value="paper">Paper Atmosphere</option>
        <option value="laboratory">Laboratory Atmosphere</option>
        <option value="playground">Playground Atmosphere</option>
        <option value="focus">Focus Atmosphere</option>
      </select>

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
        <p>SECURE CONNECTION</p>
      </div>

      <div class="surface-glass p-lg flex flex-col gap-lg">
        <div class="flex flex-row flex-wrap gap-md">
          <div class="flex flex-col gap-xs flex-1">
            <label class="px-md" for="system-identifier">
              System Identifier
            </label>
            <input
              id="system-identifier"
              type="text"
              placeholder="Enter Agent ID..."
            />
          </div>

          <div class="flex flex-col gap-xs flex-1">
            <label class="px-md" for="security-clearance">
              Security Clearance
            </label>
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
          <label class="px-md" for="energy-output">Energy Output</label>
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
            class="btn-orb"
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
      <h2>03 // DATA UPLOAD</h2>

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

  <section class="flex flex-col gap-md my-md">
    <h2 class="container">04 // RECENT ANOMALIES</h2>

    <div class="tiles-collection">
      <a href="/" class="tile">
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

      <a href="/" class="tile">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
          alt="Abstract"
        />
        <div class="tile-data">
          <h5>Deep Net</h5>
          <p>Signal: 98%</p>
        </div>
      </a>

      <a href="/" class="tile">
        <img
          src="https://media.dgrslabs.ink/conexus-sections/communitypicks.avif"
          alt="Fluid"
        />
        <div class="tile-data">
          <h5>Core Dump</h5>
          <p>Size: 4.2 TB</p>
        </div>
      </a>

      <div class="loading-tile"></div>
    </div>
  </section>

  <section class="flex flex-col gap-md mt-md">
    <h2 class="container">05 // PARAMETERS</h2>

    <div class="container">
      <div class="card-glass my-0 px-md">
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
              <button class="tile-small">
                <p class="tile-label">Neural Net</p>
                <span class="tile-remove">✕</span>
              </button>
              <button class="tile-small">
                <p class="tile-label">Firewall</p>
                <span class="tile-remove">✕</span>
              </button>
              <button class="tile-small">
                <p class="tile-label">Log v.1</p>
                <span class="tile-remove">✕</span>
              </button>
            </div>

            <div class="flex flex-row gap-sm">
              <select class="flex-1">
                <option>Select Module...</option>
                <option>Physics Engine</option>
                <option>Audio Synth</option>
              </select>
              <button class="btn">Add Module</button>
            </div>
          </div>
        </div>

        <hr />

        <div class="settings-grid">
          <div class="settings-label">Sync Threshold</div>
          <div class="settings-content">
            <div
              class="flex flex-row justify-between text-highlight text-small"
            >
              <span>LATENCY</span>
              <span>SYNCED</span>
              <span>INSTANT</span>
            </div>
            <input type="range" min="0" max="100" value="75" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="container flex flex-col gap-md my-md">
    <h2>06 // ENTITY TAGS</h2>

    <div class="container card-glass mt-0">
      <div class="flex flex-col gap-sm">
        <h5 class="text-dim">Standard Entities</h5>
        <div class="flex flex-row flex-wrap gap-sm">
          <button class="tile-small-system">
            <p class="tile-label">System</p>
            <span class="tile-remove">✕</span>
          </button>

          <button class="tile-small-premium">
            <p class="tile-label">Premium</p>
            <span class="tile-remove">✕</span>
          </button>

          <button class="tile-small-success">
            <p class="tile-label">Status</p>
            <span class="tile-remove">✕</span>
          </button>

          <button class="tile-small-error">
            <p class="tile-label">Threat</p>
            <span class="tile-remove">✕</span>
          </button>

          <button class="tile-small">
            <p class="tile-label">Archive</p>
            <span class="tile-remove">✕</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-sm">
        <h5 class="text-dim">Labeled Entities (Data-Attribute)</h5>
        <div class="flex flex-row flex-wrap gap-sm pt-sm">
          <div class="tile-small-system tile-labeled" data-label="Config">
            <p class="tile-label">AI Model</p>
            <p class="tile-label-sunken">GPT-4</p>
          </div>

          <div class="tile-small-premium tile-labeled" data-label="Web3">
            <p class="tile-label">Wallet</p>
            <p class="tile-label-sunken">0x...8F</p>
          </div>

          <div class="tile-small-success tile-labeled" data-label="Active">
            <p class="tile-label">Connected</p>
            <span class="tile-remove">✕</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-sm">
        <h5 class="text-dim">Interactive States</h5>
        <div class="flex flex-row flex-wrap gap-sm">
          <button class="tile-small">
            <p class="tile-label">Hover Me</p>
            <p class="tile-label-sunken">Interactive</p>
            <span class="tile-remove">✕</span>
          </button>

          <button class="tile-small" disabled>
            <p class="tile-label">Disabled</p>
            <p class="tile-label-sunken">Offline</p>
            <span class="tile-remove">✕</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</main>
