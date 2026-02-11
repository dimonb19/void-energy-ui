<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { tooltip } from '@actions/tooltip';
  import { toast } from '@stores/toast.svelte';
  import { live, implode } from '@lib/transitions.svelte';

  import { FONTS } from '@config/design-tokens';
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { morph } from '@actions/morph';

  import ThemeSelector from './ui/Themes.svelte';
  import SettingsRow from './ui/SettingsRow.svelte';
  import PullRefresh from './ui/PullRefresh.svelte';
  import Toggle from './ui/Toggle.svelte';
  import Selector from './ui/Selector.svelte';

  import Arrow from './icons/Arrow.svelte';
  import BackArrow from './icons/BackArrow.svelte';
  import Book from './icons/Book.svelte';
  import Burger from './icons/Burger.svelte';
  import Checkmark from './icons/Checkmark.svelte';
  import Copy from './icons/Copy.svelte';
  import Delete from './icons/Delete.svelte';
  // import Discord from './icons/Discord.svelte';
  import DoorIn from './icons/DoorIn.svelte';
  import DoorOut from './icons/DoorOut.svelte';
  import Dream from './icons/Dream.svelte';
  import Edit from './icons/Edit.svelte';
  import Eye from './icons/Eye.svelte';
  import Filter from './icons/Filter.svelte';
  import Fullscreen from './icons/Fullscreen.svelte';
  import Gear from './icons/Gear.svelte';
  import Grid from './icons/Grid.svelte';
  import Home from './icons/Home.svelte';
  import Info from './icons/Info.svelte';
  import Lock from './icons/Lock.svelte';
  import LogoDGRS from './icons/LogoDGRS.svelte';
  import LogoCoNexus from './icons/LogoCoNexus.svelte';
  import Moon from './icons/Moon.svelte';
  import Music from './icons/Music.svelte';
  import Picker from './icons/Picker.svelte';
  import Play from './icons/Play.svelte';
  import Profile from './icons/Profile.svelte';
  // import Quill from './icons/Quill.svelte';
  import Quit from './icons/Quit.svelte';
  import Reset from './icons/Reset.svelte';
  import Restart from './icons/Restart.svelte';
  import Search from './icons/Search.svelte';
  import Sorting from './icons/Sorting.svelte';
  import SpinLoader from './icons/SpinLoader.svelte';
  import Star from './icons/Star.svelte';
  // import Step from './icons/Step.svelte';
  import Sun from './icons/Sun.svelte';
  import Switch from './icons/Switch.svelte';
  import Voice from './icons/Voice.svelte';
  import Warning from './icons/Warning.svelte';
  import XMark from './icons/XMark.svelte';

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
  let telemetry = $state(true);
  let systemMode = $state(true);
  let stealth = $state(false);
  let aiSentiment = $state(true);
  let rootAccess = $state(false); // Disabled state

  // Local sate for icons
  let iconSize = $state('4xl');
  let sizeList = $state([
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: '2xl', label: 'Double Extra Large' },
    { value: '3xl', label: 'Triple Extra Large' },
    { value: '4xl', label: 'Quadra Extra Large' },
  ]);

  // Interactive icons state
  let burgerActive = $state(false);
  let copyActive = $state(false);
  let eyeActive = $state(false);
  let fullscreenActive = $state(false);
  let musicActive = $state(false);
  let voiceActive = $state(false);

  let deleteFocus = $state(false);
  let doorInFocus = $state(false);
  let doorOutFocus = $state(false);
  let editFocus = $state(false);
  let fullscreenFocus = $state(false);
  let pickerFocus = $state(false);
  let playFocus = $state(false);
  let profileFocus = $state(false);
  let quitFocus = $state(false);
  let resetFocus = $state(false);
  let restartFocus = $state(false);
  let searchFocus = $state(false);
  let searchZoomInFocus = $state(false);
  let searchZoomOutFocus = $state(false);
  let sortingFocus = $state(false);
  let switchFocus = $state(false);

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
    voidEngine.applyTemporaryTheme('cyberpunk', 'Neon Dreams');
    toast.show('Cyberpunk theme applied temporarily', 'success');
  }

  function testExistingTheme() {
    const applied = voidEngine.applyTemporaryTheme('crimson', 'Blood Moon');
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
        <h2>01 // VOID ENERGY</h2>

        <div class="surface-glass p-lg flex flex-col gap-lg">
          <div class="flex flex-row flex-wrap gap-md">
            <div class="flex flex-col gap-xs flex-1">
              <label class="text-small px-xs" for="system-identifier">
                System Identifier
              </label>
              <input
                id="system-identifier"
                type="text"
                placeholder="Enter Agent ID..."
              />
            </div>

            <Selector
              id="security-clearance"
              label="Security Clearance"
              options={[
                { value: 'observer', label: 'Level 1 - Observer' },
                { value: 'operator', label: 'Level 2 - Operator' },
                { value: 'admin', label: 'Level 3 - Administrator' },
              ]}
              class="flex-1"
              align="start"
            />
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
            <ThemeSelector class="btn-cta" />
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
              <label class="flex flex-row items-center gap-xs">
                <input type="radio" name="mode" checked />
                <span>Manual Override</span>
              </label>
              <label class="flex flex-row items-center gap-xs">
                <input type="radio" name="mode" />
                <span>Auto-Pilot</span>
              </label>
            </div>

            <div class="flex flex-col gap-sm">
              <label class="flex flex-row items-center gap-xs">
                <input type="checkbox" checked />
                <span>Enable Telemetry</span>
              </label>
              <label class="flex flex-row items-center gap-xs">
                <input type="checkbox" />
                <span>Allow External Connections</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-md mt-md">
        <h2>02 // COMPONENT LIBRARY</h2>

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
              class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
              use:morph={{ height: true, width: false }}
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
            <div class="flex flex-row gap-xs">
              <Selector
                bind:value={newModuleTile}
                placeholder="Select Module..."
                class="flex-1"
                options={[
                  { value: 'Physics Engine', label: 'Physics Engine' },
                  { value: 'Audio Synth', label: 'Audio Synth' },
                  { value: 'Visual Renderer', label: 'Visual Renderer' },
                  { value: 'Data Analyzer', label: 'Data Analyzer' },
                  { value: 'Network Monitor', label: 'Network Monitor' },
                ]}
              />
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
              class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
              use:morph={{ height: true, width: false }}
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
            <div class="flex flex-row gap-xs">
              <Selector
                bind:value={newEnvironmentTile}
                placeholder="Select Environment..."
                class="flex-1"
                options={[
                  { value: 'Physics Engine', label: 'Physics Engine' },
                  { value: 'Audio Synth', label: 'Audio Synth' },
                  { value: 'Visual Renderer', label: 'Visual Renderer' },
                  { value: 'Data Analyzer', label: 'Data Analyzer' },
                  { value: 'Network Monitor', label: 'Network Monitor' },
                ]}
              />
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
              class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
              use:morph={{ height: true, width: false }}
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
            <div class="flex flex-row gap-xs">
              <Selector
                bind:value={newPremiumTile}
                placeholder="Select Premium Module..."
                class="flex-1"
                options={[
                  { value: 'Quantum Core', label: 'Quantum Core' },
                  { value: 'AI Supervisor', label: 'AI Supervisor' },
                  { value: 'Neural Interface', label: 'Neural Interface' },
                  { value: 'Temporal Anchor', label: 'Temporal Anchor' },
                  { value: 'Network Monitor', label: 'Network Monitor' },
                ]}
              />
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

          <SettingsRow label="System Controls">
            <div
              class="surface-sunk p-sm flex flex-col flex-wrap justify-center items-center gap-sm tablet:flex-row"
            >
              <Toggle
                bind:checked={telemetry}
                id="toggle-telemetry"
                label="Telemetry Sync"
              />
              <Toggle
                bind:checked={systemMode}
                id="toggle-mode"
                label="System Mode"
                iconOn={Sun}
                iconOff={Moon}
              />
              <Toggle
                bind:checked={stealth}
                id="toggle-stealth"
                label="Stealth Protocol"
                hideIcons={true}
              />
              <Toggle
                bind:checked={aiSentiment}
                id="toggle-sentiment"
                label="AI Sentiment"
                iconOn="😄"
                iconOff="😡"
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
        <h2>03 // RENDERING</h2>
        <div class="surface-glass p-lg flex flex-col gap-md">
          <div class="flex flex-col gap-xs items-center">
            <h5>Interactive Icons</h5>
            <div
              class="w-full surface-sunk p-md flex flex-wrap justify-center gap-sm"
            >
              <button
                class="btn-void"
                onclick={() => (burgerActive = !burgerActive)}
              >
                <Burger
                  data-state={burgerActive ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onclick={() => {
                  let timeout: any;
                  clearTimeout(timeout);
                  copyActive = true;
                  timeout = setTimeout(() => {
                    copyActive = false;
                  }, 1000);
                }}
              >
                <Copy
                  data-state={copyActive ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (doorInFocus = true)}
                onpointerleave={() => (doorInFocus = false)}
              >
                <DoorIn
                  data-state={doorInFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (doorOutFocus = true)}
                onpointerleave={() => (doorOutFocus = false)}
              >
                <DoorOut
                  data-state={doorOutFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (deleteFocus = true)}
                onpointerleave={() => (deleteFocus = false)}
              >
                <Delete
                  data-state={deleteFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onclick={() => (fullscreenActive = !fullscreenActive)}
                onpointerenter={() => (fullscreenFocus = true)}
                onpointerleave={() => (fullscreenFocus = false)}
              >
                <Fullscreen
                  data-state={fullscreenFocus ? 'active' : ''}
                  data-size={iconSize}
                  data-fullscreen={fullscreenActive}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (playFocus = true)}
                onpointerleave={() => (playFocus = false)}
              >
                <Play
                  data-state={playFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (pickerFocus = true)}
                onpointerleave={() => (pickerFocus = false)}
              >
                <Picker
                  data-state={pickerFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button class="btn-void" onclick={() => (eyeActive = !eyeActive)}>
                <Eye data-size={iconSize} data-muted={eyeActive} />
              </button>
              <button
                class="btn-void"
                onclick={() => (musicActive = !musicActive)}
              >
                <Music data-size={iconSize} data-muted={musicActive} />
              </button>
              <button
                class="btn-void"
                onclick={() => (voiceActive = !voiceActive)}
              >
                <Voice data-size={iconSize} data-muted={voiceActive} />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (editFocus = true)}
                onpointerleave={() => (editFocus = false)}
              >
                <Edit
                  data-state={editFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (quitFocus = true)}
                onpointerleave={() => (quitFocus = false)}
              >
                <Quit
                  data-state={quitFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (resetFocus = true)}
                onpointerleave={() => (resetFocus = false)}
              >
                <Reset
                  data-state={resetFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (restartFocus = true)}
                onpointerleave={() => (restartFocus = false)}
              >
                <Restart
                  data-state={restartFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (switchFocus = true)}
                onpointerleave={() => (switchFocus = false)}
              >
                <Switch
                  data-state={switchFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (searchFocus = true)}
                onpointerleave={() => (searchFocus = false)}
              >
                <Search
                  data-state={searchFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (searchZoomInFocus = true)}
                onpointerleave={() => (searchZoomInFocus = false)}
              >
                <Search
                  data-state={searchZoomInFocus ? 'active' : ''}
                  data-size={iconSize}
                  data-zoom="in"
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (searchZoomOutFocus = true)}
                onpointerleave={() => (searchZoomOutFocus = false)}
              >
                <Search
                  data-state={searchZoomOutFocus ? 'active' : ''}
                  data-size={iconSize}
                  data-zoom="out"
                />
              </button>
              <button
                class="btn-void"
                onpointerenter={() => (sortingFocus = true)}
                onpointerleave={() => (sortingFocus = false)}
              >
                <Sorting
                  data-state={sortingFocus ? 'active' : ''}
                  data-size={iconSize}
                />
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-xs items-center">
            <h5>Static Icons</h5>
            <div
              class="w-full surface-sunk p-md flex flex-wrap justify-center gap-sm"
            >
              <Arrow data-size={iconSize} />
              <BackArrow data-size={iconSize} />
              <Book data-size={iconSize} />
              <Checkmark data-size={iconSize} />
              <Dream data-size={iconSize} />
              <Filter data-size={iconSize} />
              <Gear data-size={iconSize} />
              <Grid data-size={iconSize} />
              <Home data-size={iconSize} />
              <Info data-size={iconSize} />
              <Lock data-size={iconSize} />
              <Moon data-size={iconSize} />
              <Profile data-size={iconSize} />
              <SpinLoader data-size={iconSize} />
              <Star data-size={iconSize} />
              <Sun data-size={iconSize} />
              <Switch data-size={iconSize} />
              <Warning data-size={iconSize} />
              <XMark data-size={iconSize} />
            </div>
          </div>

          <Selector
            bind:value={iconSize}
            options={sizeList}
            id="icon-size"
            label="Icons Size"
          />
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
  </main>
</PullRefresh>
