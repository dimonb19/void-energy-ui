<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { tooltip } from '@actions/tooltip';
  import { toast } from '@stores/toast.svelte';
  import { live, implode } from '@lib/transitions.svelte';

  import { FONTS } from '@config/design-tokens';
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { morph } from '@actions/morph';
  import { navlink } from '@actions/navlink';

  import ThemesBtn from './ui/ThemesBtn.svelte';
  import SettingsRow from './ui/SettingsRow.svelte';
  import Toggle from './ui/Toggle.svelte';
  import Selector from './ui/Selector.svelte';

  import { Moon, Sun, Sparkles, Palette, Undo2 } from '@lucide/svelte';

  // Consolidated chip demo state
  const chipVariants = [
    { value: 'chip', label: 'Default' },
    { value: 'chip-system', label: 'System' },
    { value: 'chip-success', label: 'Success' },
    { value: 'chip-premium', label: 'Premium' },
    { value: 'chip-error', label: 'Error' },
  ];

  const chipOptions = [
    { value: 'Spacing', label: 'Spacing' },
    { value: 'Typography', label: 'Typography' },
    { value: 'Color', label: 'Color' },
    { value: 'Motion', label: 'Motion' },
    { value: 'Elevation', label: 'Elevation' },
    { value: 'Surfaces', label: 'Surfaces' },
    { value: 'Components', label: 'Components' },
  ];

  let chipVariant = $state('chip');
  let chipIdCounter = $state(3);
  let chipTags = $state([
    { id: 1, name: 'Spacing' },
    { id: 2, name: 'Typography' },
    { id: 3, name: 'Color' },
  ]);
  let newChipTag = $state('Motion');

  // Local state for toggle showcase
  let animations = $state(true);
  let colorMode = $state(true);
  let reducedMotion = $state(false);
  let satisfaction = $state(true);
  let adminOverride = $state(false);

  // Temporary theme preview functions
  function ensureAdaptAtmosphere() {
    if (!voidEngine.userConfig.adaptAtmosphere) {
      voidEngine.setPreferences({ adaptAtmosphere: true });
    }
  }

  function previewCustomAtmosphere() {
    ensureAdaptAtmosphere();

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
    ensureAdaptAtmosphere();
    voidEngine.applyTemporaryTheme('crimson', 'Blood Moon');
    toast.show('Crimson atmosphere active', 'success');
  }
</script>

<div class="container flex flex-col gap-2xl py-2xl">
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- HERO                                                              -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <header class="flex flex-col gap-lg items-center text-center">
    <h1 class="text-primary">Void Energy</h1>

    <p class="text-body text-dim max-w-3xl">
      Design systems break when products need to support multiple brands,
      themes, or visual contexts. Rebuilding components for every palette is
      expensive; maintaining parallel style sheets is worse. Most teams settle
      for one look and live with the rigidity.
    </p>

    <p class="text-body max-w-3xl">
      Void Energy solves this. One UI system. 12 atmospheres. 3 physics engines.
      Instant theming at runtime. Every element adapts to light, motion, and
      density &mdash; build once, and the interface shapes itself to the
      context.
    </p>

    <p class="text-small text-mute max-w-2xl">
      We replaced static pixels with reactive materials. Interfaces don't float
      in a vacuum &mdash; they exist within living environments that exert
      physical force on the user's experience. Atmosphere is context. Content
      adapts to narrative.
    </p>

    <span class="flex justify-center">
      <ThemesBtn class="btn-cta" />
    </span>
    <p class="text-caption text-mute">
      Try switching the atmosphere &mdash; every element on this page will
      adapt.
    </p>
  </header>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- CORE CONCEPTS — 4 CARDS                                           -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-xl">
    <h2 class="text-center">Core Concepts</h2>

    <div class="grid grid-cols-1 tablet:grid-cols-2 gap-lg">
      <!-- Card 1: Hybrid Protocol -->
      <div class="surface-glass p-lg flex flex-col gap-md">
        <h3>The Hybrid Protocol</h3>
        <p class="text-dim">
          Geometry and physics are separate concerns. Layout (flex, grid,
          spacing) lives in Tailwind. Material (surfaces, shadows, blur,
          animation) lives in SCSS. They never cross.
        </p>

        <div class="flex flex-row flex-wrap gap-md">
          <div class="surface-sunk p-md flex-1 flex flex-col gap-sm">
            <b class="text-small">Geometry</b>
            <code class="text-caption">flex gap-md p-lg</code>
          </div>
          <div class="surface-sunk p-md flex-1 flex flex-col gap-sm">
            <b class="text-small">Physics</b>
            <code class="text-caption">glass-float, glass-blur</code>
          </div>
        </div>

        <details>
          <summary>Technical Details</summary>
          <p class="p-md">
            Tailwind handles rigid grids and fluid spacing. SCSS handles
            texture, motion, and light via mixins like
            <code>glass-float</code>, <code>glass-sunk</code>, and
            <code>glass-blur</code>. This separation means layout never breaks
            when the physics preset changes, and visual materials never leak
            into structural code.
          </p>
        </details>
      </div>

      <!-- Card 2: Triad Architecture -->
      <div class="surface-glass p-lg flex flex-col gap-md">
        <h3>The Triad Architecture</h3>
        <p class="text-dim">
          Every pixel is the intersection of three variables: Atmosphere (color,
          typography, mood), Physics (glass, flat, or retro rendering), and Mode
          (light or dark polarity).
        </p>

        <div class="flex flex-row gap-md flex-wrap">
          <span class="chip-premium">
            <span class="chip-label">Atmosphere</span>
          </span>
          <span class="chip-system">
            <span class="chip-label">Physics</span>
          </span>
          <span class="chip">
            <span class="chip-label">Mode</span>
          </span>
        </div>

        <details>
          <summary>Technical Details</summary>
          <div class="p-md flex flex-col gap-xs">
            <p>
              <b>Atmosphere</b> defines the mood, palette, and typography. Examples:
              Void (Sci-Fi), Onyx (Stealth), Terminal (Retro), Paper (Light).
            </p>
            <p>
              <b>Physics</b> defines how materials react. Glass: translucent, blurred,
              glowing. Flat: opaque, sharp, efficient. Retro: hard pixels, stepped
              animation (CRT style).
            </p>
            <p>
              <b>Mode</b> defines contrast. Dark: low luminosity background. Light:
              high luminosity background.
            </p>
            <p>
              <b>Compatibility Matrix:</b> Glass and Retro require dark mode (glows
              need darkness, CRT phosphor needs a black substrate). Flat works in
              both modes. The engine auto-enforces this.
            </p>
          </div>
        </details>
      </div>

      <!-- Card 3: Density Engine -->
      <div class="surface-glass p-lg flex flex-col gap-md">
        <h3>The Density Engine</h3>
        <p class="text-dim">
          Every margin, padding, and gap scales from a global density
          coefficient. Developers describe the <em>intent</em> of the space using
          a semantic T-shirt scale &mdash; the engine calculates the rest.
        </p>

        <div
          class="surface-sunk p-md flex flex-row gap-md items-end justify-center flex-wrap"
        >
          <div class="flex flex-col items-center gap-xs">
            <span class="block w-xs h-xs bg-primary rounded"></span>
            <code class="text-caption">xs</code>
          </div>
          <div class="flex flex-col items-center gap-xs">
            <span class="block w-sm h-sm bg-primary rounded"></span>
            <code class="text-caption">sm</code>
          </div>
          <div class="flex flex-col items-center gap-xs">
            <span class="block w-md h-md bg-primary rounded"></span>
            <code class="text-caption">md</code>
          </div>
          <div class="flex flex-col items-center gap-xs">
            <span class="block w-lg h-lg bg-primary rounded"></span>
            <code class="text-caption">lg</code>
          </div>
          <div class="flex flex-col items-center gap-xs">
            <span class="block w-xl h-xl bg-primary rounded"></span>
            <code class="text-caption">xl</code>
          </div>
          <div class="hidden tablet:flex flex-col items-center gap-xs">
            <span class="block w-2xl h-2xl bg-primary rounded"></span>
            <code class="text-caption">2xl</code>
          </div>
        </div>

        <details>
          <summary>Technical Details</summary>
          <div class="p-md flex flex-col gap-xs">
            <p>
              <b>Micro</b> (<code>xs</code>, <code>sm</code>): Atomic grouping.
              Inside buttons, between icon and text.
            </p>
            <p>
              <b>Structure</b> (<code>md</code>, <code>lg</code>): Component
              definition. Padding inside cards, gaps between form elements.
            </p>
            <p>
              <b>Macro</b> (<code>xl</code>, <code>2xl</code>,
              <code>4xl</code>): Layout geometry. Section separation, page
              grids.
            </p>
            <p>
              Density multipliers: Standard (1x), High Density (0.75x) for data
              grids, Low Density (1.25x) for reading modes.
            </p>
          </div>
        </details>
      </div>

      <!-- Card 4: Native Protocol -->
      <div class="surface-glass p-lg flex flex-col gap-md">
        <h3>The Native Protocol</h3>
        <p class="text-dim">
          Components are thin wrappers around native HTML elements. The browser
          owns behavior and accessibility; SCSS owns the material. No
          reimplementations.
        </p>

        <div class="flex flex-row gap-xs flex-wrap">
          <code class="chip"
            ><span class="chip-label">&lt;button&gt;</span></code
          >
          <code class="chip"
            ><span class="chip-label">&lt;select&gt;</span></code
          >
          <code class="chip"
            ><span class="chip-label">&lt;dialog&gt;</span></code
          >
          <code class="chip"
            ><span class="chip-label">&lt;details&gt;</span></code
          >
          <code class="chip"><span class="chip-label">&lt;input&gt;</span></code
          >
          <code class="chip"
            ><span class="chip-label">&lt;fieldset&gt;</span></code
          >
        </div>

        <details>
          <summary>Technical Details</summary>
          <p class="p-md">
            Buttons are <code>&lt;button&gt;</code>, selects are
            <code>&lt;select&gt;</code>, dialogs are
            <code>&lt;dialog&gt;</code>. Custom components are only built when
            no native element exists for the interaction (e.g., combobox,
            multi-thumb slider). Simplicity is the architecture.
          </p>
        </details>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- PALETTE CONTRACT                                                  -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-md">
    <h2>The Palette Contract</h2>

    <div class="surface-glass p-lg flex flex-col gap-lg">
      <p class="text-center text-dim">
        Colors are semantic, not absolute. Every palette is organized into a
        <strong>5-Layer System</strong> &mdash; from the deepest canvas to the highest
        text signal. Each layer has a fixed role. Atmospheres change the values;
        the architecture never moves.
      </p>

      <div class="surface-sunk p-lg flex flex-col gap-md">
        <div class="flex flex-col gap-sm">
          <h4>Layer 1: Canvas (Foundation)</h4>
          <p class="text-small text-dim">
            The absolute floor. Recessed areas are carved into it; ambient light
            radiates from above.
          </p>
          <div class="flex flex-row gap-sm flex-wrap">
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--bg-canvas)'}
            >
              <span
                class="block w-3xl h-xl rounded-sm bg-canvas border-solid border-border"
              ></span>
              <code class="text-caption">bg-canvas</code>
            </div>
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--bg-sink)'}
            >
              <span
                class="block w-3xl h-xl rounded-sm bg-sink border-solid border-border"
              ></span>
              <code class="text-caption">bg-sink</code>
            </div>
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--bg-spotlight)'}
            >
              <span
                class="block w-3xl h-xl rounded-sm bg-spotlight border-solid border-border"
              ></span>
              <code class="text-caption">bg-spotlight</code>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-sm">
          <h4>Layer 2: Surface (Float)</h4>
          <p class="text-small text-dim">
            Floating elements &mdash; cards, modals, headers. Rendered above the
            canvas with depth.
          </p>
          <div class="flex flex-row gap-sm">
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--bg-surface)'}
            >
              <span
                class="block w-3xl h-xl rounded-sm bg-surface border-solid border-border"
              ></span>
              <code class="text-caption">bg-surface</code>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-sm">
          <h4>Layer 3: Energy (Interaction)</h4>
          <p class="text-small text-dim">
            Brand and interaction colors. Drives buttons, focus states, and
            emphasis.
          </p>
          <div class="flex flex-row gap-sm">
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--energy-primary)'}
            >
              <span
                class="block w-3xl h-xl rounded-sm bg-primary border-solid border-border"
              ></span>
              <code class="text-caption">energy-primary</code>
            </div>
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--energy-secondary)'}
            >
              <span
                class="block w-3xl h-xl rounded-sm bg-secondary border-solid border-border"
              ></span>
              <code class="text-caption">energy-secondary</code>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-sm">
          <h4>Layer 4: Structure (Borders)</h4>
          <p class="text-small text-dim">
            Unified border system. 1px in Glass and Flat, 2px in Retro.
          </p>
          <div class="flex flex-row gap-sm">
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--border-color)'}
            >
              <span
                class="block w-3xl h-xl rounded-sm bg-border border-solid border-border"
              ></span>
              <code class="text-caption">border-color</code>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-sm">
          <h4>Layer 5: Signal (Text Hierarchy)</h4>
          <p class="text-small text-dim">
            Three levels of emphasis for information hierarchy.
          </p>
          <div class="flex flex-row gap-lg items-baseline">
            <span class="text-main font-bold">Main</span>
            <span class="text-dim">Dim</span>
            <span class="text-mute">Mute</span>
          </div>
        </div>
      </div>

      <div class="surface-sunk p-lg flex flex-col gap-md">
        <h3>Semantic Colors</h3>
        <p class="text-small text-dim">
          Four signal colors provide consistent meaning across all atmospheres.
          Each generates light, dark, and subtle variants automatically via
          OKLCH.
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

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- INTERACTIVE SANDBOX                                               -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-md">
    <h2>Interactive Sandbox</h2>

    <div class="surface-glass p-lg flex flex-col gap-md">
      <p class="text-dim text-center">
        Try the components below. Every element reacts to the active atmosphere,
        physics preset, and density setting. Change the theme to see the entire
        page adapt in real-time.
      </p>

      <SettingsRow label="Atmosphere Preview">
        <div
          class="surface-sunk flex flex-col justify-center tablet:flex-row gap-md p-md"
        >
          {#if voidEngine.temporaryThemeInfo?.id === 'cyberpunk'}
            <button
              class="btn-error"
              onclick={() => voidEngine.restoreUserTheme()}
            >
              <Undo2 class="icon" />
              Disable Custom Palette
            </button>
          {:else}
            <button class="btn-premium" onclick={previewCustomAtmosphere}>
              <Sparkles class="icon" />
              Apply Custom Palette
            </button>
          {/if}
          {#if voidEngine.temporaryThemeInfo?.id === 'crimson'}
            <button
              class="btn-error"
              onclick={() => voidEngine.restoreUserTheme()}
            >
              <Undo2 class="icon" />
              Disable Built-in Atmosphere
            </button>
          {:else}
            <button class="btn-system" onclick={previewBuiltInAtmosphere}>
              <Palette class="icon" />
              Preview Built-in Atmosphere
            </button>
          {/if}
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
                      loading: `Applying ${prefs.layout} layout...`,
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
            class="btn-error"
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

      <SettingsRow label="Chip Variants">
        <div
          class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
          use:morph={{ height: true, width: false }}
        >
          {#if chipTags.length === 0}
            <p
              class="text-caption min-h-control flex items-center justify-center"
            >
              No tags selected
            </p>
          {:else}
            {#each chipTags as tag (tag.id)}
              <div class={chipVariant} animate:live out:implode>
                <p class="chip-label">{tag.name}</p>
                <button
                  type="button"
                  class="btn-void chip-remove"
                  aria-label="Remove {tag.name}"
                  onclick={() => {
                    chipTags = chipTags.filter((t) => t.id !== tag.id);
                  }}>&#10005;</button
                >
              </div>
            {/each}
          {/if}
        </div>
        <div class="flex flex-col gap-xs tablet:flex-row tablet:items-end">
          <Selector
            bind:value={chipVariant}
            options={chipVariants}
            id="chip-variant"
            label="Style"
            class="flex-1"
          />
          <Selector
            bind:value={newChipTag}
            options={chipOptions}
            placeholder="Select tag..."
            label="Tag"
            class="flex-1"
          />
          <button
            onclick={() => {
              if (newChipTag) {
                chipIdCounter++;
                chipTags.push({
                  id: chipIdCounter,
                  name: newChipTag,
                });
              }
            }}
            disabled={!newChipTag}>Add Tag</button
          >
        </div>
      </SettingsRow>

      <hr />

      <SettingsRow label="Toggle Variants">
        <p class="text-caption text-mute">
          Demo toggles &mdash; these showcase visual variants, not functional
          controls.
        </p>
        <div
          class="surface-sunk p-md flex flex-col flex-wrap justify-center items-center gap-md tablet:flex-row"
        >
          <Toggle
            bind:checked={animations}
            id="toggle-animations"
            label="Default"
          />
          <Toggle
            bind:checked={colorMode}
            id="toggle-color-mode"
            label="Custom Icons"
            iconOn={Sun}
            iconOff={Moon}
          />
          <Toggle
            bind:checked={reducedMotion}
            id="toggle-reduced-motion"
            label="No Icons"
            hideIcons={true}
          />
          <Toggle
            bind:checked={satisfaction}
            id="toggle-satisfaction"
            label="Emoji Icons"
            iconOn="😄"
            iconOff="😡"
          />
          <Toggle
            bind:checked={adminOverride}
            id="toggle-admin"
            label="Disabled"
            disabled={true}
          />
        </div>
      </SettingsRow>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- CONCLUSION                                                        -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-md items-center text-center">
    <p class="text-dim max-w-2xl">
      One codebase. Zero rebuilds. Every component you've seen adapts across 12
      atmospheres, 3 physics presets, and 2 color modes &mdash; without touching
      a single line of component code. Ship a product, change the brand, and the
      entire interface follows.
    </p>
    <a href="/components" class="btn" use:navlink>
      Explore the Component Library
    </a>
  </section>
</div>
