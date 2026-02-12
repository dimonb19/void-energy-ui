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

  import Moon from './icons/Moon.svelte';
  import Sun from './icons/Sun.svelte';

  // Pull-to-refresh handlers
  async function handleRefresh(): Promise<void> {
    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  function handleRefreshError(error: unknown): void {
    console.error('Refresh error:', error);
  }

  // Local demo state with stable IDs for list animations.
  let tokenIdCounter = $state(3);
  let tokenTags = $state([
    { id: 1, name: 'Spacing' },
    { id: 2, name: 'Typography' },
    { id: 3, name: 'Color' },
  ]);
  let newTokenTag = $state('Motion');

  let layerIdCounter = $state(3);
  let systemLayers = $state([
    { id: 1, name: 'Surfaces' },
    { id: 2, name: 'Components' },
    { id: 3, name: 'Layouts' },
  ]);
  let newSystemLayer = $state('Inputs');

  let featureIdCounter = $state(2);
  let premiumFeatures = $state([
    { id: 1, name: 'Runtime Theming' },
    { id: 2, name: 'Density Engine' },
  ]);
  let newPremiumFeature = $state('Physics Presets');

  // Local state for the showcase
  let animations = $state(true);
  let colorMode = $state(true);
  let reducedMotion = $state(false);
  let satisfaction = $state(true);
  let adminOverride = $state(false); // Disabled state

  // Temporary theme preview functions
  function previewCustomAtmosphere() {
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
    toast.show('Custom atmosphere applied', 'success');
  }

  function previewBuiltInAtmosphere() {
    const applied = voidEngine.applyTemporaryTheme('crimson', 'Blood Moon');
    if (applied) {
      toast.show('Crimson atmosphere active', 'success');
    } else {
      toast.show(
        'Enable "Adapt Atmosphere" to allow theme changes.',
        'warning',
      );
    }
  }
</script>

<PullRefresh onrefresh={handleRefresh} onerror={handleRefreshError}>
  <div class="container flex flex-col gap-2xl py-2xl">
    <h1 class="text-center text-primary">Void Energy</h1>

    <div class="surface-glass p-lg flex flex-col gap-lg">
      <p class="text-center">
        We have discarded static pixels in favor of <strong
          >reactive materials</strong
        >. In this system, we do not paint screens; we simulate environments.
        This is an engine where interfaces obey strict laws of light, motion,
        and depth. Here, <strong>atmosphere is context</strong>. Content does
        not float in a vacuum; it exists within a living environment that exerts
        physical force on the user's experience. Every element is a living
        object that instinctively adapts to the narrative of the user, expanding
        and contracting its geometry to match the density of the task at hand.
      </p>
      <span class="flex justify-center">
        <ThemeSelector class="btn-cta" />
      </span>
      <div class="surface-sunk p-lg flex flex-col gap-sm">
        <h3>The Hybrid Protocol</h3>
        <p>
          We separate <strong>Geometry</strong> (Layout) from
          <strong>Physics</strong> (Material).
        </p>
        <ul class="list-disc list-inside">
          <li>
            <b>Layout:</b> Defined by rigid grids and fluid spacing (Tailwind).
          </li>
          <li>
            <b>Material:</b> Defined by texture, motion, and light (SCSS).
          </li>
        </ul>

        <br />

        <h3>The Triad Architecture</h3>
        <p>Every pixel is calculated by the intersection of three variables.</p>
        <h4>1. Atmosphere (The Soul)</h4>
        <p>Defines the mood, color palette, and typography.</p>
        <ul class="list-disc list-inside">
          <li>
            <i>Examples:</i> Void (Sci-Fi), Onyx (Stealth), Terminal (Retro), Paper
            (Light).
          </li>
        </ul>

        <h4>2. Physics (The Laws)</h4>
        <p>Defines how materials react to light and interaction.</p>
        <ul class="list-disc list-inside">
          <li>
            <b>Glass:</b> Translucent, blurred backgrounds, glowing borders. High
            GPU cost.
          </li>
          <li>
            <b>Flat:</b> Opaque, sharp borders, efficient rendering, clean lines.
          </li>
          <li>
            <b>Retro:</b> Hard pixels, no anti-aliasing, stepped animation (CRT style).
          </li>
        </ul>

        <h4>3. Mode (The Polarity)</h4>
        <p>Defines the contrast environment.</p>
        <ul class="list-disc list-inside">
          <li>
            <b>Dark:</b> Low luminosity background, light text.
          </li>
          <li>
            <b>Light:</b> High luminosity background, dark text.
          </li>
        </ul>

        <br />

        <p>
          <b>Engineering Note:</b> The system automatically enforces the Physics
          Compatibility Matrix. For example, Glass and Retro physics are physically
          impossible in Light mode and will auto-resolve to Flat to preserve contrast.
          Flat physics is the only universally compatible protocol that maintains
          absolute optical integrity across all environments. Refractive blurs and
          glow-emitters render as invisible noise against high-luminosity backgrounds,
          while CRT phosphor simulations require a pure black substrate to maintain
          scanline definition.
        </p>

        <br />

        <h3>The Density Engine & T-Shirt Sizing</h3>
        <p>
          We do not manually reduce pixels for compact views. Instead, the
          system uses <b>Fluid Spacing</b>, where every margin, padding, and gap
          is calculated relative to a global density coefficient.
        </p>
        <h4>The T-Shirt Size Protocol</h4>
        <p>
          We have abolished raw pixel values in favor of a semantic <b
            >T-Shirt Scale</b
          >. Developers must describe the <i>intent of the space</i>, not the
          measurement.
        </p>
        <ul class="list-disc list-inside">
          <li>
            <b>Micro (<code>xs</code>, <code>sm</code>)</b>: Atomic grouping.
            Used for spacing inside buttons or between an icon and text.
          </li>
          <li>
            <b>Structure (<code>md</code>, <code>lg</code>)</b>: Component
            definition. Used for padding inside cards or gaps between form
            elements.
          </li>
          <li>
            <b>Macro (<code>xl</code>, <code>2xl</code>, <code>4xl</code>)</b>:
            Layout geometry. Used for separating major sections or defining the
            page grid.
          </li>
        </ul>
        <h4>The Density Multipliers</h4>
        <p>
          Because we use tokens, the engine can mathematically scale the
          interface to match the user's cognitive load.
        </p>
        <ul class="list-disc list-inside">
          <li>
            <b>Standard (1x):</b> The default target. Balanced for general readability
            and touch targets.
          </li>
          <li>
            <b>High Density (0.75x):</b> The system automatically tightens the
            gravitational constant of the UI. All md and lg gaps contract. Ideal
            for complex <b>Data Grids</b> and command centers.
          </li>
          <li>
            <b>Low Density (1.25x):</b> The system expands the atmosphere.
            Spacing relaxes to improve focus. Ideal for <b>Reading Modes</b>.
          </li>
        </ul>
      </div>
    </div>

    <section class="flex flex-col gap-md">
      <h2>01 // THE PALETTE CONTRACT</h2>

      <div class="surface-glass p-lg flex flex-col gap-lg">
        <p class="text-center">
          Colors are semantic, not absolute. Every palette is organized into a <strong
            >5-Layer System</strong
          > — from the deepest canvas to the highest text signal. Each layer has
          a fixed role. Atmospheres change the values; the architecture never moves.
        </p>

        <div class="surface-sunk p-lg flex flex-col gap-md">
          <div class="flex flex-col gap-sm">
            <h4>Layer 1: Canvas (Foundation)</h4>
            <p>
              The absolute floor. Recessed areas are carved into it; ambient
              light radiates from above.
            </p>
            <div class="flex flex-row gap-sm flex-wrap">
              <div class="flex flex-col items-center gap-xs">
                <span
                  class="block w-2xl h-lg rounded-sm bg-canvas border-solid border-2 border-mute"
                ></span>
                <code class="text-caption">bg-canvas</code>
              </div>
              <div class="flex flex-col items-center gap-xs">
                <span
                  class="block w-2xl h-lg rounded-sm bg-sink border-solid border-2 border-mute"
                ></span>
                <code class="text-caption">bg-sink</code>
              </div>
              <div class="flex flex-col items-center gap-xs">
                <span
                  class="block w-2xl h-lg rounded-sm bg-spotlight border-solid border-2 border-mute"
                ></span>
                <code class="text-caption">bg-spotlight</code>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-sm">
            <h4>Layer 2: Surface (Float)</h4>
            <p>
              Floating elements — cards, modals, headers. Rendered above the
              canvas with depth.
            </p>
            <div class="flex flex-row gap-sm">
              <div class="flex flex-col items-center gap-xs">
                <span
                  class="block w-2xl h-lg rounded-sm bg-surface border-solid border-2 border-mute"
                ></span>
                <code class="text-caption">bg-surface</code>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-sm">
            <h4>Layer 3: Energy (Interaction)</h4>
            <p>
              Brand and interaction colors. Drives buttons, focus states, and
              emphasis.
            </p>
            <div class="flex flex-row gap-sm">
              <div class="flex flex-col items-center gap-xs">
                <span class="block w-2xl h-lg rounded-sm bg-primary"></span>
                <code class="text-caption">energy-primary</code>
              </div>
              <div class="flex flex-col items-center gap-xs">
                <span class="block w-2xl h-lg rounded-sm bg-secondary"></span>
                <code class="text-caption">energy-secondary</code>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-sm">
            <h4>Layer 4: Structure (Borders)</h4>
            <p>Unified border system. 1px in Glass and Flat, 2px in Retro.</p>
            <div class="flex flex-row gap-sm">
              <div class="flex flex-col items-center gap-xs">
                <span
                  class="block w-2xl h-lg rounded-sm bg-surface border-solid border border-border"
                ></span>
                <code class="text-caption">border-color</code>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-sm">
            <h4>Layer 5: Signal (Text Hierarchy)</h4>
            <p>Three levels of emphasis for information hierarchy.</p>
            <div class="flex flex-row gap-lg items-baseline">
              <span class="text-main font-bold">Main</span>
              <span class="text-dim">Dim</span>
              <span class="text-mute">Mute</span>
            </div>
          </div>
        </div>

        <div class="surface-sunk p-lg flex flex-col gap-md">
          <h3>Semantic Colors</h3>
          <p>
            Four signal colors provide consistent meaning across all
            atmospheres. Each generates light, dark, and subtle variants
            automatically via OKLCH.
          </p>
          <div class="grid grid-cols-2 tablet:grid-cols-4 gap-sm">
            <div
              class="flex flex-col items-center gap-xs p-sm rounded-sm bg-success-subtle"
            >
              <span class="block w-lg h-lg rounded-full bg-success"></span>
              <b class="text-success">Success</b>
              <p class="text-caption text-center">
                Positive outcome, confirmation
              </p>
            </div>
            <div
              class="flex flex-col items-center gap-xs p-sm rounded-sm bg-error-subtle"
            >
              <span class="block w-lg h-lg rounded-full bg-error"></span>
              <b class="text-error">Error</b>
              <p class="text-caption text-center">Destructive, failure</p>
            </div>
            <div
              class="flex flex-col items-center gap-xs p-sm rounded-sm bg-premium-subtle"
            >
              <span class="block w-lg h-lg rounded-full bg-premium"></span>
              <b class="text-premium">Premium</b>
              <p class="text-caption text-center">Attention, cost, exclusive</p>
            </div>
            <div
              class="flex flex-col items-center gap-xs p-sm rounded-sm bg-system-subtle"
            >
              <span class="block w-lg h-lg rounded-full bg-system"></span>
              <b class="text-system">System</b>
              <p class="text-caption text-center">Informational, neutral</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-md">
      <h2>02 // INTERACTIVE SANDBOX</h2>

      <div class="surface-glass p-lg flex flex-col gap-md">
        <SettingsRow label="Atmosphere Preview">
          <div
            class="surface-sunk flex flex-col justify-center tablet:flex-row gap-sm p-sm"
          >
            <button class="btn-premium" onclick={previewCustomAtmosphere}>
              Apply Custom Palette
            </button>
            <button class="btn-system" onclick={previewBuiltInAtmosphere}>
              Preview Built-in Atmosphere
            </button>
          </div>
        </SettingsRow>

        <hr />

        <SettingsRow label="Feedback Patterns">
          <div
            class="surface-sunk p-lg flex flex-row flex-wrap gap-md justify-center"
          >
            <button
              onclick={() => {
                modal.confirm(
                  'Confirm Deployment?',
                  'You are about to push changes to the production environment. This action requires authorization.',
                  {
                    cost: 500,
                    onConfirm: () => {
                      toast.show('Deployment initiated', 'success');
                    },
                    onCancel: () => {
                      toast.show('Deployment cancelled', 'info');
                    },
                  },
                );
              }}
            >
              Confirm Action
            </button>
            <button
              class="btn-premium"
              onclick={() => {
                modal.settings({
                  onSave: (prefs) => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: `Applying ${prefs.settings} preferences...`,
                        success: 'Preferences saved successfully',
                        error: 'Failed to save preferences',
                      },
                    );
                    console.log('Selected preferences:', prefs);
                  },
                });
              }}
            >
              Open Settings
            </button>
            <button
              class="btn-system"
              onclick={() => {
                modal.alert(
                  'Maintenance Scheduled',
                  'A maintenance window is approaching. Review pending changes before the system enters read-only mode.',
                );
              }}
            >
              System Alert
            </button>
            <button
              class="btn-alert"
              use:tooltip={'Demonstrates error toast notification'}
              onclick={() => {
                toast.show('Connection timeout — retry in 30s', 'error');
              }}
            >
              Show Error
            </button>
          </div>
        </SettingsRow>

        <hr />

        <SettingsRow label="Token Tags">
          <div
            class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
            use:morph={{ height: true, width: false }}
          >
            {#if tokenTags.length === 0}
              <p
                class="text-caption min-h-control flex items-center justify-center"
              >
                No tokens selected
              </p>
            {:else}
              {#each tokenTags as tile (tile.id)}
                <div class="chip" animate:live out:implode>
                  <p class="chip-label">{tile.name}</p>
                  <button
                    type="button"
                    class="btn-void chip-remove"
                    aria-label="Remove {tile.name}"
                    onclick={() => {
                      tokenTags = tokenTags.filter((t) => t.id !== tile.id);
                    }}>✕</button
                  >
                </div>
              {/each}
            {/if}
          </div>
          <div class="flex flex-row gap-xs">
            <Selector
              bind:value={newTokenTag}
              placeholder="Select token..."
              class="flex-1"
              options={[
                { value: 'Spacing', label: 'Spacing' },
                { value: 'Typography', label: 'Typography' },
                { value: 'Color', label: 'Color' },
                { value: 'Motion', label: 'Motion' },
                { value: 'Elevation', label: 'Elevation' },
              ]}
            />
            <button
              onclick={() => {
                if (newTokenTag) {
                  tokenIdCounter++;
                  tokenTags.push({
                    id: tokenIdCounter,
                    name: newTokenTag,
                  });
                }
              }}
              disabled={!newTokenTag}>Add Tag</button
            >
          </div>
        </SettingsRow>

        <hr />

        <SettingsRow label="System Layers">
          <div
            class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
            use:morph={{ height: true, width: false }}
          >
            {#if systemLayers.length === 0}
              <p
                class="text-caption min-h-control flex items-center justify-center"
              >
                No layers selected
              </p>
            {:else}
              {#each systemLayers as tile (tile.id)}
                <div class="chip-system" animate:live out:implode>
                  <p class="chip-label">{tile.name}</p>
                  <button
                    type="button"
                    class="btn-void chip-remove"
                    aria-label="Remove {tile.name}"
                    onclick={() => {
                      systemLayers = systemLayers.filter(
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
              bind:value={newSystemLayer}
              placeholder="Select layer..."
              class="flex-1"
              options={[
                { value: 'Surfaces', label: 'Surfaces' },
                { value: 'Components', label: 'Components' },
                { value: 'Layouts', label: 'Layouts' },
                { value: 'Inputs', label: 'Inputs' },
                { value: 'Navigation', label: 'Navigation' },
              ]}
            />
            <button
              class="btn-system"
              onclick={() => {
                if (newSystemLayer) {
                  layerIdCounter++;
                  systemLayers.push({
                    id: layerIdCounter,
                    name: newSystemLayer,
                  });
                }
              }}
              disabled={!newSystemLayer}>Add Layer</button
            >
          </div>
        </SettingsRow>

        <hr />

        <SettingsRow label="Premium Features">
          <div
            class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
            use:morph={{ height: true, width: false }}
          >
            {#if premiumFeatures.length === 0}
              <p
                class="text-caption min-h-control flex items-center justify-center"
              >
                No features selected
              </p>
            {:else}
              {#each premiumFeatures as tile (tile.id)}
                <div class="chip-premium" animate:live out:implode>
                  <p class="chip-label">{tile.name}</p>
                  <button
                    type="button"
                    class="btn-void chip-remove"
                    aria-label="Remove {tile.name}"
                    onclick={() => {
                      premiumFeatures = premiumFeatures.filter(
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
              bind:value={newPremiumFeature}
              placeholder="Select feature..."
              class="flex-1"
              options={[
                { value: 'Runtime Theming', label: 'Runtime Theming' },
                { value: 'Density Engine', label: 'Density Engine' },
                { value: 'Physics Presets', label: 'Physics Presets' },
                { value: 'Adaptive Typography', label: 'Adaptive Typography' },
                { value: 'Token Generation', label: 'Token Generation' },
              ]}
            />
            <button
              class="btn-premium"
              onclick={() => {
                if (newPremiumFeature) {
                  featureIdCounter++;
                  premiumFeatures.push({
                    id: featureIdCounter,
                    name: newPremiumFeature,
                  });
                }
              }}
              disabled={!newPremiumFeature}>Add Feature</button
            >
          </div>
        </SettingsRow>

        <hr />

        <SettingsRow label="Toggle Variants">
          <div
            class="surface-sunk p-sm flex flex-col flex-wrap justify-center items-center gap-sm tablet:flex-row"
          >
            <Toggle
              bind:checked={animations}
              id="toggle-animations"
              label="Animations"
            />
            <Toggle
              bind:checked={colorMode}
              id="toggle-color-mode"
              label="Color Mode"
              iconOn={Sun}
              iconOff={Moon}
            />
            <Toggle
              bind:checked={reducedMotion}
              id="toggle-reduced-motion"
              label="Reduced Motion"
              hideIcons={true}
            />
            <Toggle
              bind:checked={satisfaction}
              id="toggle-satisfaction"
              label="Satisfaction"
              iconOn="😄"
              iconOff="😡"
            />
            <Toggle
              bind:checked={adminOverride}
              id="toggle-admin"
              label="Admin Override"
              disabled={true}
            />
          </div>
        </SettingsRow>
      </div>
    </section>
  </div>
</PullRefresh>
