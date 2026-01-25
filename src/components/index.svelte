<script lang="ts">
  import { modal } from '../lib/modal-manager.svelte';
  import { tooltip } from '../actions/tooltip';
  import { toast } from '../stores/toast.svelte';
  import { live, implode } from '../lib/transitions.svelte';

  import { FONTS } from '../config/design-tokens';
  import { voidEngine } from '../adapters/void-engine.svelte';

  import ThemeSelector from './ui/Themes.svelte';
  import SettingsRow from './ui/SettingsRow.svelte';
  import PullRefresh from './ui/PullRefresh.svelte';
  import Toggle from './ui/Toggle.svelte';

  import Sun from './icons/Sun.svelte';
  import Moon from './icons/Moon.svelte';

  // Pull-to-refresh handlers
  async function handleRefresh(): Promise<void> {
    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  function handleRefreshError(error: unknown): void {
    console.error('Refresh error:', error);
  }

  // Local demo state with stable IDs for list animations.
  let moduleIdCounter = $state(3);
  let moduleTiles = $state([
    { id: 1, name: 'Neural Net' },
    { id: 2, name: 'Firewall' },
    { id: 3, name: 'Log v.1' },
  ]);
  let newModuleTile = $state('Audio Synth');

  let environmentIdCounter = $state(3);
  let environmentTiles = $state([
    { id: 1, name: 'Physics Engine' },
    { id: 2, name: 'Audio Synth' },
    { id: 3, name: 'Visual Renderer' },
  ]);
  let newEnvironmentTile = $state('Physics Engine');

  let premiumIdCounter = $state(2);
  let premiumTiles = $state([
    { id: 1, name: 'Quantum Core' },
    { id: 2, name: 'AI Supervisor' },
  ]);
  let newPremiumTile = $state('Quantum Core');

  // Local state for the showcase
  let systemMode = $state(true);
  let aiSentiment = $state(true);
  let telemetry = $state(true);
  let stealth = $state(false);
  let rootAccess = $state(false); // Disabled state

  // Test functions for temporary theme feature
  function testCustomTheme() {
    // Don't register if adaptation is disabled
    if (!voidEngine.userConfig.adaptAtmosphere) {
      toast.show(
        'Enable "Adapt Atmosphere" to allow theme changes.',
        'warning',
      );
      return;
    }

    voidEngine.registerTheme('cyberpunk', {
      mode: 'dark',
      physics: 'glass',
      tagline: 'High Tech / Low Life',
      palette: {
        'font-atmos-heading': FONTS.mystic.family,
        'font-atmos-body': FONTS.tech.family,
        'bg-canvas': '#05010a',
        'bg-spotlight': '#1a0526',
        'bg-surface': 'rgba(20, 5, 30, 0.6)',
        'bg-sink': 'rgba(10, 0, 15, 0.8)',
        'energy-primary': '#ff0077',
        'energy-secondary': '#00e5ff',
        'border-color': 'rgba(255, 0, 119, 0.3)',
        'text-dim': 'rgba(255, 230, 240, 0.85)',
      },
    });
    voidEngine.applyTemporaryTheme('cyberpunk', 'Story: Neon Dreams');
    toast.show('Cyberpunk theme applied temporarily', 'success');
  }

  function testExistingTheme() {
    const applied = voidEngine.applyTemporaryTheme(
      'crimson',
      'Story: Blood Moon',
    );
    if (applied) {
      toast.show('Crimson theme applied temporarily', 'success');
    } else {
      toast.show(
        'Enable "Adapt Atmosphere" to allow theme changes.',
        'warning',
      );
    }
  }
</script>

<PullRefresh onrefresh={handleRefresh} onerror={handleRefreshError}>
  <main class="w-full min-h-screen">
    <div class="container flex flex-col gap-xl">
      <section class="flex flex-col gap-md mt-xl">
        <h2>01 // COMPONENT LIBRARY</h2>

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
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>

          <div
            class="grid grid-cols-1 tablet:grid-cols-2 small-desktop:grid-cols-3 full-hd:grid-cols-4 gap-md"
          >
            <button
              onclick={() => {
                modal.confirm(
                  'INITIATE SEQUENCE?',
                  'You are about to deploy the production build.',
                  {
                    cost: 500,
                    onConfirm: () => {
                      toast.show('Sequence Initiated', 'success');
                    },
                    onCancel: () => {
                      toast.show('Aborted', 'info');
                    },
                  },
                );
              }}
            >
              Initiate Sequence
            </button>
            <ThemeSelector className="btn-cta" />
            <button
              class="btn-premium"
              onclick={() => {
                modal.settings({
                  onSave: (prefs) => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: `Launching story with ${prefs.settings} settings...`,
                        success: 'Story is generated (test)',
                        error: 'Failed to generate story',
                      },
                    );
                    console.log('Selected preferences:', prefs);
                  },
                });
              }}
            >
              Upgrade Core
            </button>
            <button
              class="btn-system"
              onclick={() => {
                modal.alert(
                  'Anomaly Detected',
                  'Unusual energy fluctuation in sector 7-G. Manual inspection recommended before proceeding.',
                );
              }}
            >
              Diagnostics
            </button>
            <button
              class="btn-signal"
              use:tooltip={'Click to call SUCCESS message'}
              onclick={() => {
                toast.show('Connection Established Successfully!', 'success');
              }}
            >
              Secure Channel
            </button>
            <button
              class="btn-alert"
              use:tooltip={'Click to call ERROR message'}
              onclick={() => {
                toast.show('Cache Purge Failed!', 'error');
              }}
            >
              Purge Cache
            </button>
            <button disabled>Offline</button>
          </div>

          <div class="flex flex-col gap-xs flex-1">
            <label for="energy-output">Energy Output</label>
            <input
              id="energy-output"
              type="range"
              value="50"
              min="0"
              max="100"
            />
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
        <h2>03 // PARAMETERS</h2>

        <div class="surface-glass p-lg flex flex-col gap-md">
          <SettingsRow label="Theme Override">
            <div
              class="surface-sunk flex flex-col justify-center tablet:flex-row gap-sm p-sm"
            >
              <button class="btn-premium" onclick={testCustomTheme}>
                Test Custom Theme
              </button>
              <button class="btn-system" onclick={testExistingTheme}>
                Test Existing Theme
              </button>
            </div>
          </SettingsRow>

          <hr />

          <SettingsRow label="Active Modules">
            <div
              class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center rounded-md"
            >
              {#if moduleTiles.length === 0}
                <p
                  class="text-caption min-h-control flex items-center justify-center"
                >
                  No active modules
                </p>
              {:else}
                {#each moduleTiles as tile (tile.id)}
                  <div class="chip" animate:live out:implode>
                    <p class="chip-label">{tile.name}</p>
                    <button
                      type="button"
                      class="btn-void chip-remove"
                      aria-label="Remove {tile.name}"
                      onclick={() => {
                        moduleTiles = moduleTiles.filter(
                          (t) => t.id !== tile.id,
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
                  if (newModuleTile) {
                    moduleIdCounter++;
                    moduleTiles.push({
                      id: moduleIdCounter,
                      name: newModuleTile,
                    });
                  }
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
                <p
                  class="text-caption min-h-control flex items-center justify-center"
                >
                  No environments selected
                </p>
              {:else}
                {#each environmentTiles as tile (tile.id)}
                  <div class="chip-system" animate:live out:implode>
                    <p class="chip-label">{tile.name}</p>
                    <button
                      type="button"
                      class="btn-void chip-remove"
                      aria-label="Remove {tile.name}"
                      onclick={() => {
                        environmentTiles = environmentTiles.filter(
                          (t) => t.id !== tile.id,
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
                  if (newEnvironmentTile) {
                    environmentIdCounter++;
                    environmentTiles.push({
                      id: environmentIdCounter,
                      name: newEnvironmentTile,
                    });
                  }
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
                <p
                  class="text-caption min-h-control flex items-center justify-center"
                >
                  No premium modules
                </p>
              {:else}
                {#each premiumTiles as tile (tile.id)}
                  <div class="chip-premium" animate:live out:implode>
                    <p class="chip-label">{tile.name}</p>
                    <button
                      type="button"
                      class="btn-void chip-remove"
                      aria-label="Remove {tile.name}"
                      onclick={() => {
                        premiumTiles = premiumTiles.filter(
                          (t) => t.id !== tile.id,
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
                  if (newPremiumTile) {
                    premiumIdCounter++;
                    premiumTiles.push({
                      id: premiumIdCounter,
                      name: newPremiumTile,
                    });
                  }
                }}
                disabled={!newPremiumTile}>Add Module</button
              >
            </div>
          </SettingsRow>

          <hr />

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

          <SettingsRow label="System Controls">
            <div
              class="surface-sunk p-sm flex flex-col flex-wrap justify-center items-center tablet:flex-row gap-md"
            >
              <Toggle
                bind:checked={systemMode}
                id="toggle-mode"
                label="System Mode"
                iconOn={Sun}
                iconOff={Moon}
              />
              <Toggle
                bind:checked={aiSentiment}
                id="toggle-sentiment"
                label="AI Sentiment"
                iconOn="😄"
                iconOff="😡"
              />
              <Toggle
                bind:checked={telemetry}
                id="toggle-telemetry"
                label="Telemetry Sync"
              />
              <Toggle
                bind:checked={stealth}
                id="toggle-stealth"
                label="Stealth Protocol"
                hideIcons={true}
              />
              <Toggle
                bind:checked={rootAccess}
                id="toggle-root"
                label="Root Access"
                disabled={true}
              />
            </div>
          </SettingsRow>
        </div>
      </section>

      <section class="flex flex-col gap-md my-md">
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

    <!-- <section class="flex flex-col gap-md mt-2xl">
    <h2 class="container">04 // RECENT ANOMALIES</h2>

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
  </section> -->
  </main>
</PullRefresh>
