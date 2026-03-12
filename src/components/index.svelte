<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { tooltip } from '@actions/tooltip';
  import { toast } from '@stores/toast.svelte';
  import { live, implode } from '@lib/transitions.svelte';
  import { morph } from '@actions/morph';
  import { navlink } from '@actions/navlink';

  import { voidEngine } from '@adapters/void-engine.svelte';

  import ThemesBtn from './ui/ThemesBtn.svelte';
  import Switcher from './ui/Switcher.svelte';
  import Selector from './ui/Selector.svelte';
  import MediaSlider from './ui/MediaSlider.svelte';

  import { Check, Wrench, Repeat, Shuffle } from '@lucide/svelte';
  import Toggle from './ui/Toggle.svelte';
  import AtmosphereGenerator from './AtmosphereGenerator.svelte';

  // ── Live Proof: atmosphere previewer ──────────────────────────────────
  const proofAtmospheres = [
    { value: 'void', label: 'Void' },
    { value: 'paper', label: 'Paper' },
    { value: 'terminal', label: 'Terminal' },
    { value: 'nebula', label: 'Nebula' },
    { value: 'playground', label: 'Playground' },
  ];

  // Derived: only highlights if current atmosphere is one of the curated set
  const proofIds = proofAtmospheres.map((a) => a.value);
  let proofSelection = $derived(
    proofIds.includes(voidEngine.atmosphere) ? voidEngine.atmosphere : null,
  );

  function switchProofAtmosphere(value: string | number | null) {
    if (typeof value === 'string') {
      voidEngine.setAtmosphere(value);
    }
  }

  // ── Sandbox: chip demo state ─────────────────────────────────────────
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

  // ── Media slider demo state ────────────────────────────────────────
  let mediaVolume = $state(65);
  let mediaMuted = $state(false);
  let mediaPaused = $state(false);

  // ── Toggle demo state ──────────────────────────────────────────────
  let toggleSimple = $state(true);
  let toggleIcons = $state(false);

  // ── Physics annotation ─────────────────────────────────────────────
  const physicsDescriptions: Record<string, string> = {
    glass: 'Translucent surfaces, glow shadows, spring easing, backdrop blur.',
    flat: 'Clean surfaces, minimal shadows, smooth motion.',
    retro: 'Zero radius, hard pixel shadows, instant transitions, 2px borders.',
  };

  let currentPhysics = $derived(voidEngine.currentTheme?.physics ?? 'glass');

  // ── Density demo ───────────────────────────────────────────────────
  const densityOptions = [
    { value: 'high', label: 'Compact' },
    { value: 'standard', label: 'Standard' },
    { value: 'low', label: 'Relaxed' },
  ];

  let currentDensity = $derived(voidEngine.userConfig.density);

  function switchDensity(value: string | number | null) {
    if (typeof value === 'string') {
      voidEngine.setPreferences({
        density: value as 'high' | 'standard' | 'low',
      });
    }
  }
</script>

<div class="container flex flex-col gap-2xl py-2xl">
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- 1. HERO                                                           -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <header class="flex flex-col gap-lg items-center text-center">
    <h1 class="text-primary">Void Energy</h1>

    <p class="text-h3 max-w-3xl">
      Atmospheres, physics, and density for any UI.
    </p>

    <p class="text-body text-dim max-w-3xl">
      Not just theming. Void Energy changes how surfaces feel &mdash;
      translucent glass, clean flat, or hard-pixel retro &mdash; while scaling
      every spacing value through a single density coefficient. One codebase,
      zero rebuilds.
    </p>

    <div class="flex flex-row flex-wrap gap-md justify-center">
      <span class="chip"><span class="chip-label">12 Atmospheres</span></span>
      <span class="chip"><span class="chip-label">3 Physics Presets</span></span
      >
      <span class="chip"><span class="chip-label">Runtime Theming</span></span>
      <span class="chip"><span class="chip-label">Density Scaling</span></span>
    </div>

    <ThemesBtn class="btn-cta" />
    <p class="text-caption text-mute">
      Switch the atmosphere &mdash; every element on this page adapts.
    </p>
  </header>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- 2. LIVE PROOF                                                     -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-lg">
    <div class="flex flex-col gap-sm items-center text-center">
      <h2>Your Components. Our Materials.</h2>
      <p class="text-dim max-w-2xl">
        These elements are standard HTML &mdash; buttons, inputs, cards. Void
        Energy applies the surface physics, palette, and typography. Switch the
        atmosphere and watch the same markup transform.
      </p>
    </div>

    <Switcher
      options={proofAtmospheres}
      value={proofSelection}
      onchange={switchProofAtmosphere}
      label="Try an Atmosphere"
      class="items-center"
    />

    <div class="grid grid-cols-1 tablet:grid-cols-2 gap-lg">
      <!-- Proof card: surface + text hierarchy -->
      <div class="surface-raised p-lg flex flex-col gap-md">
        <h3>Surface Card</h3>
        <p class="text-dim">
          This card uses <code>surface-raised</code> &mdash; a floating surface with
          physics-aware shadows, borders, and optional backdrop blur.
        </p>
        <div class="surface-sunk p-md flex flex-col gap-sm">
          <span class="text-main font-bold">Primary text</span>
          <span class="text-dim">Secondary text</span>
          <span class="text-mute">Tertiary text</span>
        </div>
        <div class="flex flex-row gap-sm flex-wrap">
          <span class="chip-success">
            <span class="chip-label">Success</span>
          </span>
          <span class="chip-error">
            <span class="chip-label">Error</span>
          </span>
          <span class="chip-premium">
            <span class="chip-label">Premium</span>
          </span>
          <span class="chip-system">
            <span class="chip-label">System</span>
          </span>
        </div>
      </div>

      <!-- Proof card: interactive elements -->
      <div class="surface-raised p-lg flex flex-col gap-md">
        <h3>Interactive Elements</h3>
        <MediaSlider
          bind:volume={mediaVolume}
          bind:muted={mediaMuted}
          bind:paused={mediaPaused}
          icon="music"
          playback
        />
        <div class="flex flex-row gap-sm flex-wrap">
          <button>Primary</button>
          <button class="btn-system">System</button>
          <button class="btn-premium">Premium</button>
          <button class="btn-error">Danger</button>
          <button class="btn-ghost">Ghost</button>
        </div>
        <div class="flex flex-row gap-lg flex-wrap">
          <Toggle bind:checked={toggleSimple} label="Auto-play" />
          <Toggle
            bind:checked={toggleIcons}
            label="Shuffle"
            iconOn={Shuffle}
            iconOff={Repeat}
          />
        </div>
        <p class="text-caption text-mute">
          Every button, input, and chip reads from the same CSS custom
          properties. The atmosphere changes the values &mdash; the components
          never change.
        </p>
      </div>
    </div>

    <p class="text-dim text-center text-small max-w-2xl mx-auto">
      Active physics: <b class="text-primary">{currentPhysics}</b> &mdash;
      {physicsDescriptions[currentPhysics]}
      Each atmosphere defines its own physics preset and typography.
    </p>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- 3. DENSITY SCALING                                                -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-lg">
    <div class="flex flex-col gap-sm items-center text-center">
      <h2>Density Scaling</h2>
      <p class="text-dim max-w-2xl">
        Every spacing value flows through a global density coefficient. One
        setting &mdash; every gap, padding, and control height adapts.
      </p>
    </div>

    <Switcher
      options={densityOptions}
      value={currentDensity}
      onchange={switchDensity}
      label="Density"
      class="items-center"
    />

    <div class="grid grid-cols-1 tablet:grid-cols-2 gap-lg">
      <div class="surface-raised p-lg flex flex-col gap-md">
        <h3>Sample Card</h3>
        <p class="text-dim">
          This card's padding, gaps, and control heights all scale with the
          density setting above. The content stays the same &mdash; only the
          whitespace changes.
        </p>
        <div class="surface-sunk p-md flex flex-col gap-sm">
          <span class="text-main font-bold">Primary text</span>
          <span class="text-dim">Secondary text</span>
          <span class="text-mute">Tertiary text</span>
        </div>
        <div class="flex flex-row gap-sm flex-wrap">
          <button>Action</button>
          <button class="btn-system">System</button>
          <button class="btn-ghost">Cancel</button>
        </div>
      </div>

      <div class="surface-raised p-lg flex flex-col gap-md">
        <h3>Use Cases</h3>
        <ul class="flex flex-col gap-sm text-dim">
          <li>
            <b class="text-main">Compact</b> &mdash; data-heavy dashboards, admin
            panels, tables with many rows
          </li>
          <li>
            <b class="text-main">Standard</b> &mdash; balanced default, general-purpose
            applications
          </li>
          <li>
            <b class="text-main">Relaxed</b> &mdash; reading experiences, accessibility,
            content-focused layouts
          </li>
        </ul>
        <p class="text-caption text-mute">
          Density is a user preference, independent of the active atmosphere.
          All 12 atmospheres respect the same density setting.
        </p>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- 4. HOW IT WORKS                                                   -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-lg">
    <h2 class="text-center">How It Works</h2>

    <div class="grid grid-cols-1 tablet:grid-cols-2 gap-lg">
      <!-- JS side -->
      <div class="surface-raised p-lg flex flex-col gap-md">
        <h3>Register &amp; Switch</h3>
        <pre class="surface-sunk p-md text-caption overflow-x-auto"><code
            >{`// Register a custom atmosphere
voidEngine.registerTheme('brand', {
  mode: 'dark',
  physics: 'glass',
  palette: {
    'bg-canvas':      '#060816',
    'bg-surface':     'rgba(20, 24, 44, 0.72)',
    'energy-primary': '#6ee7ff',
    'text-main':      '#f8fafc',
  }
});

// Switch — every component adapts instantly
voidEngine.setAtmosphere('brand');`}</code
          ></pre>
      </div>

      <!-- CSS side -->
      <div class="surface-raised p-lg flex flex-col gap-md">
        <h3>Your Component Styles</h3>
        <pre class="surface-sunk p-md text-caption overflow-x-auto"><code
            >{`/* Your existing CSS — just use the tokens */
.card {
  background: var(--bg-surface);
  border: var(--physics-border-width) solid
    var(--border-color);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-float);
  color: var(--text-main);
}

.card:hover {
  border-color: var(--energy-primary);
  box-shadow: var(--shadow-lift);
}`}</code
          ></pre>
      </div>
    </div>

    <!-- What you get vs what you build -->
    <div class="grid grid-cols-1 tablet:grid-cols-2 gap-lg">
      <div class="surface-raised p-lg flex flex-col gap-md">
        <h3 class="text-success">What You Get</h3>
        <ul class="flex flex-col gap-sm">
          <li class="flex flex-row gap-sm items-center">
            <Check class="icon text-success shrink-0" data-size="sm" />
            <span>12 built-in atmospheres with complete palettes</span>
          </li>
          <li class="flex flex-row gap-sm items-center">
            <Check class="icon text-success shrink-0" data-size="sm" />
            <span>3 physics presets (glass, flat, retro)</span>
          </li>
          <li class="flex flex-row gap-sm items-center">
            <Check class="icon text-success shrink-0" data-size="sm" />
            <span>Runtime theme engine with scoped &amp; temporary themes</span>
          </li>
          <li class="flex flex-row gap-sm items-center">
            <Check class="icon text-success shrink-0" data-size="sm" />
            <span>Density scaling (compact / standard / relaxed)</span>
          </li>
          <li class="flex flex-row gap-sm items-center">
            <Check class="icon text-success shrink-0" data-size="sm" />
            <span>Token pipeline &amp; build tooling</span>
          </li>
          <li class="flex flex-row gap-sm items-center">
            <Check class="icon text-success shrink-0" data-size="sm" />
            <span>Physics-aware transitions &amp; animations</span>
          </li>
        </ul>
      </div>

      <div class="surface-raised p-lg flex flex-col gap-md">
        <h3 class="text-premium">What You Build</h3>
        <ul class="flex flex-col gap-sm">
          <li class="flex flex-row gap-sm items-center">
            <Wrench class="icon text-premium shrink-0" data-size="sm" />
            <span
              >Token aliasing &mdash; map your CSS properties to Void's semantic
              tokens (<code>--bg-surface</code>, <code>--energy-primary</code>,
              etc.)</span
            >
          </li>
          <li class="flex flex-row gap-sm items-center">
            <Wrench class="icon text-premium shrink-0" data-size="sm" />
            <span
              >Component style mapping &mdash; update your component styles to
              read from CSS custom properties instead of hardcoded values</span
            >
          </li>
          <li class="flex flex-row gap-sm items-center">
            <Wrench class="icon text-premium shrink-0" data-size="sm" />
            <span
              >Custom atmospheres &mdash; define palettes that match your brand
              identity using the token contract</span
            >
          </li>
        </ul>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- 4.5. AI ATMOSPHERE GENERATOR                                      -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-lg">
    <div class="flex flex-col gap-sm items-center text-center">
      <h2>Create Your Own</h2>
      <p class="text-dim max-w-2xl">
        Type a vibe, get a complete atmosphere. Powered by Claude &mdash; uses
        your own API key, runs entirely in your browser.
      </p>
    </div>

    <AtmosphereGenerator class="max-w-3xl mx-auto w-full" />
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- 5. BEST FOR                                                       -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-lg">
    <h2 class="text-center">Is Void Energy Right For You?</h2>

    <div class="surface-raised p-lg flex flex-col tablet:flex-row gap-lg">
      <div class="flex-1 flex flex-col gap-sm">
        <h4 class="text-success">Best For</h4>
        <ul class="flex flex-col gap-sm text-dim text-small">
          <li>White-label platforms and multi-tenant products</li>
          <li>Narrative or immersive experiences</li>
          <li>Multi-brand apps where visual identity is a feature</li>
          <li>Products that need runtime theme customization</li>
        </ul>
      </div>
      <div class="flex-1 flex flex-col gap-sm">
        <h4 class="text-mute">Not Needed When</h4>
        <ul class="flex flex-col gap-sm text-dim text-small">
          <li>
            Your product has one fixed brand and one theme is fine forever
          </li>
          <li>You need a massive component library out of the box</li>
          <li>You prefer copy-paste component ownership (see shadcn)</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- 6. INTERACTIVE SANDBOX                                            -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-lg">
    <div class="flex flex-col gap-sm items-center text-center">
      <h2>Interactive Sandbox</h2>
      <p class="text-dim max-w-2xl">
        Try the components below. Modals, toasts, animated chips &mdash; all
        reacting to the active atmosphere.
      </p>
    </div>

    <div class="surface-raised p-lg flex flex-col gap-lg">
      <!-- Feedback patterns -->
      <div class="flex flex-col gap-md">
        <h3>Feedback Patterns</h3>
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
      </div>

      <hr />

      <!-- Chip builder -->
      <div class="flex flex-col gap-md">
        <h3>Chip Variants</h3>
        <div
          class="surface-sunk p-sm flex flex-row gap-xs flex-wrap justify-center"
          use:morph={{ width: false }}
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
        <div class="flex flex-col gap-md tablet:flex-row tablet:items-end">
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
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- 7. CTA                                                            -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section class="flex flex-col gap-md items-center text-center">
    <p class="text-dim max-w-2xl">
      One codebase. Zero rebuilds. Every component adapts across 12 atmospheres,
      3 physics presets, and 2 color modes &mdash; without touching a single
      line of component code.
    </p>
    <a href="/components" class="btn" use:navlink>
      Explore the Component Library
    </a>
  </section>
</div>
