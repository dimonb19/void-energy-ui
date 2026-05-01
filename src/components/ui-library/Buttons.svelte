<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { toast } from '@stores/toast.svelte';
  import { tooltip } from '@actions/tooltip';
  import { live, implode } from '@lib/transitions.svelte';
  import { morph } from '@actions/morph';
  import { laserAim } from '@actions/laser-aim';
  import Selector from '../ui/Selector.svelte';

  // Chip demo state
  let chipIdCounter = $state(5);
  let chips = $state([
    { id: 1, name: 'Neural Net', variant: 'chip' },
    { id: 2, name: 'Firewall', variant: 'chip-system' },
    { id: 3, name: 'Quantum Core', variant: 'chip-premium' },
    { id: 4, name: 'Status OK', variant: 'chip-success' },
    { id: 5, name: 'Overload', variant: 'chip-error' },
  ]);

  let newChipName = $state('Audio Synth');
  let newChipVariant = $state('chip');

  const chipVariantOptions = [
    { value: 'chip', label: 'Default' },
    { value: 'chip-system', label: 'System' },
    { value: 'chip-premium', label: 'Premium' },
    { value: 'chip-success', label: 'Success' },
    { value: 'chip-error', label: 'Error' },
  ];

  const chipNameOptions = [
    { value: 'Audio Synth', label: 'Audio Synth' },
    { value: 'Physics Engine', label: 'Physics Engine' },
    { value: 'Visual Renderer', label: 'Visual Renderer' },
    { value: 'Data Analyzer', label: 'Data Analyzer' },
    { value: 'Network Monitor', label: 'Network Monitor' },
  ];

  // Active state demo
  let activeBase = $state(false);
  let activePremium = $state(true);
  let activeSystem = $state(false);
</script>

<section id="buttons" class="flex flex-col gap-md">
  <h2>08 // BUTTONS, CHIPS & BADGES</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Interactive elements for actions and selections. Six semantic variants
      communicate intent at a glance: Default for standard actions, CTA for the
      primary action on a page, and semantic colors (Premium, System, Success,
      Error) for contextual meaning. Ghost variants provide secondary actions.
      Chips use the same color system for tags, filters, and removable
      selections. Badges are the non-interactive counterpart &mdash; lightweight
      status pills for lists and tables.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Buttons adapt to all 3 physics presets. Glass mode uses glowing hover
        states and blur. Flat mode signals hover with tint and border-color
        shifts only — no elevation shadow. Retro mode uses hard borders and
        instant transitions. All buttons use semantic color tokens and
        spring-based transitions. State is exposed via
        <code>data-state</code> and <code>aria-pressed</code>, targeted in SCSS
        with <code>@include when-state('active')</code>.
      </p>
    </details>

    <!-- ─── BUTTON VARIANTS ────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Button Variants</h5>
      <p class="text-small text-mute">
        The base <code>&lt;button&gt;</code> gets full physics styling
        automatically. Add a <code>btn-*</code> class for semantic color variants.
        Each variant adjusts border, background, hover glow, and active press colors.
      </p>

      <div class="surface-sunk p-md">
        <div
          class="grid grid-cols-1 tablet:grid-cols-2 small-desktop:grid-cols-4 gap-md"
        >
          <button
            onclick={() => toast.show('Default action triggered', 'info')}
          >
            Default
          </button>
          <button
            class="btn-cta"
            use:laserAim
            onclick={() => toast.show('CTA activated', 'success')}
          >
            Call to Action
          </button>
          <button
            class="btn-premium"
            onclick={() => toast.show('Premium unlocked', 'info')}
          >
            Premium
          </button>
          <button
            class="btn-system"
            onclick={() => toast.show('System check complete', 'info')}
          >
            System
          </button>
          <button
            class="btn-success"
            onclick={() => toast.show('Success confirmed', 'success')}
          >
            Success
          </button>
          <button
            class="btn-error"
            onclick={() => toast.show('Error acknowledged', 'warning')}
          >
            Error
          </button>
          <button disabled>Disabled</button>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;button&gt;Default&lt;/button&gt;
&lt;button class="btn-cta" use:laserAim&gt;Call to Action&lt;/button&gt;
&lt;button class="btn-premium"&gt;Premium&lt;/button&gt;
&lt;button class="btn-system"&gt;System&lt;/button&gt;
&lt;button class="btn-success"&gt;Success&lt;/button&gt;
&lt;button class="btn-error"&gt;Error&lt;/button&gt;
&lt;button disabled&gt;Disabled&lt;/button&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        CTA uses an animated gradient border (Gemini Laser) in glass mode and a
        double border in retro mode.
      </p>

      <p class="text-caption text-mute px-xs">
        <strong>When to use:</strong> Default for most actions. CTA for the single
        most important action on a page (one per view). Premium/System/Success/Error
        for semantically meaningful actions. Ghost for secondary or dismissive actions
        (Cancel, Skip, Close).
      </p>
    </div>

    <!-- ─── GHOST BUTTONS ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Ghost Buttons</h5>
      <p class="text-small text-mute">
        Ghost buttons have no background or border at rest — just uppercase
        text. Use them for secondary actions like Cancel, Dismiss, or Skip.
        Compose with semantic variants for colored ghosts:
        <code>btn-ghost btn-error</code>.
      </p>

      <div class="surface-sunk p-md">
        <div
          class="grid grid-cols-1 tablet:grid-cols-2 small-desktop:grid-cols-3 gap-md"
        >
          <button
            class="btn-ghost"
            onclick={() => toast.show('Ghost action', 'info')}
          >
            Ghost
          </button>
          <button
            class="btn-ghost btn-premium"
            onclick={() => toast.show('Ghost Premium', 'info')}
          >
            Ghost Premium
          </button>
          <button
            class="btn-ghost btn-system"
            onclick={() => toast.show('Ghost System', 'info')}
          >
            Ghost System
          </button>
          <button
            class="btn-ghost btn-success"
            onclick={() => toast.show('Ghost Success', 'success')}
          >
            Ghost Success
          </button>
          <button
            class="btn-ghost btn-error"
            onclick={() => toast.show('Ghost Error', 'warning')}
          >
            Ghost Error
          </button>
          <button class="btn-ghost" disabled>Ghost Disabled</button>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;button class="btn-ghost"&gt;Ghost&lt;/button&gt;
&lt;button class="btn-ghost btn-premium"&gt;Ghost Premium&lt;/button&gt;
&lt;button class="btn-ghost btn-error"&gt;Ghost Error&lt;/button&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Hover reveals a subtle tinted surface. In retro mode, hover shows
        underline instead. Ghost stays grounded — no lift transform on hover.
      </p>
    </div>

    <!-- ─── ACTIVE / TOGGLE STATE ──────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Active State</h5>
      <p class="text-small text-mute">
        Buttons can act as toggles using <code>aria-pressed</code> and
        <code>data-state="active"</code>. The active state adds a filled
        background with the energy-primary border and glow. Click to toggle.
      </p>

      <div
        class="surface-sunk p-md flex flex-row flex-wrap gap-md justify-center"
      >
        <button
          aria-pressed={activeBase}
          data-state={activeBase ? 'active' : ''}
          onclick={() => (activeBase = !activeBase)}
        >
          {activeBase ? 'Active' : 'Inactive'}
        </button>
        <button
          class="btn-premium"
          aria-pressed={activePremium}
          data-state={activePremium ? 'active' : ''}
          onclick={() => (activePremium = !activePremium)}
        >
          {activePremium ? 'Active' : 'Inactive'}
        </button>
        <button
          class="btn-system"
          aria-pressed={activeSystem}
          data-state={activeSystem ? 'active' : ''}
          onclick={() => (activeSystem = !activeSystem)}
        >
          {activeSystem ? 'Active' : 'Inactive'}
        </button>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;button
  aria-pressed=&#123;isActive&#125;
  data-state=&#123;isActive ? 'active' : ''&#125;
  onclick=&#123;() =&gt; (isActive = !isActive)&#125;
&gt;
  &#123;isActive ? 'Active' : 'Inactive'&#125;
&lt;/button&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        State is exposed via <code>data-state="active"</code> and
        <code>aria-pressed="true"</code>. SCSS targets this with
        <code>@include when-state('active')</code>.
      </p>
    </div>

    <!-- ─── CHIP VARIANTS ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Chips</h5>
      <p class="text-small text-mute">
        Interactive data chips for tags, filters, and selections. Each chip has
        a label and an optional remove button. Chips share the same semantic
        color system as buttons: <code>chip-system</code>,
        <code>chip-premium</code>,
        <code>chip-success</code>, <code>chip-error</code>.
      </p>

      <div
        class="surface-sunk p-md flex flex-row gap-md flex-wrap justify-center"
        use:morph={{ width: false }}
      >
        {#if chips.length === 0}
          <p class="text-mute text-center p-lg">No chips — add some below</p>
        {:else}
          {#each chips as chip (chip.id)}
            <div class={chip.variant} animate:live out:implode>
              <p class="chip-label">{chip.name}</p>
              <button
                type="button"
                class="btn-void chip-remove"
                aria-label="Remove {chip.name}"
                onclick={() => {
                  chips = chips.filter((c) => c.id !== chip.id);
                }}>&#10005;</button
              >
            </div>
          {/each}
        {/if}
      </div>

      <div class="flex flex-col tablet:flex-row gap-xs">
        <Selector
          bind:value={newChipName}
          options={chipNameOptions}
          placeholder="Chip name..."
          class="flex-1"
        />
        <Selector
          bind:value={newChipVariant}
          options={chipVariantOptions}
          placeholder="Variant..."
          class="flex-1"
        />
        <button
          onclick={() => {
            if (newChipName) {
              chipIdCounter++;
              chips.push({
                id: chipIdCounter,
                name: newChipName,
                variant: newChipVariant,
              });
            }
          }}
          disabled={!newChipName}>Add Chip</button
        >
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;div class="chip"&gt;
  &lt;p class="chip-label"&gt;Tag Name&lt;/p&gt;
  &lt;button class="btn-void chip-remove" aria-label="Remove"&gt;&amp;#10005;&lt;/button&gt;
&lt;/div&gt;

&lt;!-- Semantic variants --&gt;
&lt;div class="chip-system"&gt;...&lt;/div&gt;
&lt;div class="chip-premium"&gt;...&lt;/div&gt;
&lt;div class="chip-success"&gt;...&lt;/div&gt;
&lt;div class="chip-error"&gt;...&lt;/div&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Inner elements:
        <code>.chip-label</code>, <code>.chip-remove</code>. Use chips for
        removable tags and filter selections. For persistent on/off states, use
        toggle buttons (<code>data-state="active"</code>) instead.
      </p>
    </div>

    <!-- ─── LABELED CHIPS ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Labeled Chips</h5>
      <p class="text-small text-mute">
        Add <code>chip-labeled</code> with a <code>data-label</code> attribute to
        show a floating label tab above the chip. The label tab inherits the chip's
        background and border — no extra elements needed.
      </p>

      <div
        class="surface-sunk p-md pt-lg flex flex-row gap-md flex-wrap justify-center"
      >
        <div class="chip chip-labeled" data-label="Module">
          <p class="chip-label">Neural Net</p>
        </div>
        <div class="chip-premium chip-labeled" data-label="Tier">
          <p class="chip-label">Quantum Core</p>
        </div>
        <div class="chip-system chip-labeled" data-label="Status">
          <p class="chip-label">Processing</p>
          <button type="button" class="btn-void chip-remove" aria-label="Remove"
            >&#10005;</button
          >
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;div class="chip chip-labeled" data-label="Module"&gt;
  &lt;p class="chip-label"&gt;Neural Net&lt;/p&gt;
&lt;/div&gt;

&lt;div class="chip-premium chip-labeled" data-label="Tier"&gt;
  &lt;p class="chip-label"&gt;Quantum Core&lt;/p&gt;
&lt;/div&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Requires <code>chip-labeled</code> class and
        <code>data-label="..."</code> attribute. The tab is rendered via
        <code>::before</code> pseudo-element.
      </p>
    </div>

    <!-- ─── BADGES ────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Badges</h5>
      <p class="text-small text-mute">
        Non-interactive status pills for lifecycle states in lists and tables.
        Same semantic color system as chips, but lighter &mdash; no surfaces, no
        hover, caption-sized. Use <code>.badge-*</code> classes on a bare
        <code>&lt;span&gt;</code>.
      </p>

      <div
        class="surface-sunk p-md flex flex-row gap-md flex-wrap justify-center items-center"
      >
        <span class="badge">Draft</span>
        <span class="badge-success">Active</span>
        <span class="badge-error">Failed</span>
        <span class="badge-premium">Pending</span>
        <span class="badge-system">Beta</span>
        <span class="badge-energy">v2.1</span>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;span class="badge"&gt;Draft&lt;/span&gt;
&lt;span class="badge-success"&gt;Active&lt;/span&gt;
&lt;span class="badge-error"&gt;Failed&lt;/span&gt;
&lt;span class="badge-premium"&gt;Pending&lt;/span&gt;
&lt;span class="badge-system"&gt;Beta&lt;/span&gt;
&lt;span class="badge-energy"&gt;v2.1&lt;/span&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Badges adapt across physics: glass gets tinted pill, flat/light gets
        lighter tint with darker text, retro gets hard border with no fill. Use
        badges for read-only status indicators; use chips when the user can
        add/remove tags.
      </p>
    </div>

    <!-- ─── BADGES IN CONTEXT ────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Badges in Context</h5>
      <p class="text-small text-mute">
        Badges are subordinate status indicators designed for list rows,
        multi-badge stacking, and table columns. They stay small enough to
        inform without dominating the primary content.
      </p>

      <h6>Status List</h6>
      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex items-center justify-between gap-md">
          <div class="flex flex-col">
            <span>Nexus Gateway</span>
            <span class="text-caption text-mute"
              >us-east-1 &middot; 3 replicas</span
            >
          </div>
          <span class="badge-success">Online</span>
        </div>
        <div class="flex items-center justify-between gap-md">
          <div class="flex flex-col">
            <span>Void Renderer</span>
            <span class="text-caption text-mute"
              >eu-west-2 &middot; 1 replica</span
            >
          </div>
          <div class="flex gap-xs">
            <span class="badge-premium">Deploying</span>
            <span class="badge-system">Beta</span>
          </div>
        </div>
        <div class="flex items-center justify-between gap-md">
          <div class="flex flex-col">
            <span>Quantum Relay</span>
            <span class="text-caption text-mute"
              >ap-south-1 &middot; 2 replicas</span
            >
          </div>
          <span class="badge-error">Offline</span>
        </div>
        <div class="flex items-center justify-between gap-md">
          <div class="flex flex-col">
            <span>Telemetry Sink</span>
            <span class="text-caption text-mute"
              >us-west-3 &middot; 5 replicas</span
            >
          </div>
          <div class="flex gap-xs">
            <span class="badge">Standby</span>
            <span class="badge-energy">v1.4</span>
          </div>
        </div>
      </div>

      <h6>Table Column</h6>
      <div class="surface-sunk p-md">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Module</th>
                <th>Version</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Void Core</td>
                <td><span class="badge-energy">v4.2</span></td>
                <td><span class="badge-success">Stable</span></td>
              </tr>
              <tr>
                <td>Physics Engine</td>
                <td><span class="badge-energy">v3.0-rc1</span></td>
                <td><span class="badge-premium">RC</span></td>
              </tr>
              <tr>
                <td>Neural Interface</td>
                <td><span class="badge-energy">v2.8</span></td>
                <td><span class="badge">Deprecated</span></td>
              </tr>
              <tr>
                <td>Atmosphere Renderer</td>
                <td><span class="badge-energy">v5.1-beta</span></td>
                <td><span class="badge-system">Beta</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Single badge --&gt;
&lt;div class="flex items-center justify-between gap-md"&gt;
  &lt;div class="flex flex-col"&gt;
    &lt;span&gt;Nexus Gateway&lt;/span&gt;
    &lt;span class="text-caption text-mute"&gt;us-east-1 &amp;middot; 3 replicas&lt;/span&gt;
  &lt;/div&gt;
  &lt;span class="badge-success"&gt;Online&lt;/span&gt;
&lt;/div&gt;

&lt;!-- Stacked badges (use gap-xs) --&gt;
&lt;div class="flex gap-xs"&gt;
  &lt;span class="badge-premium"&gt;Deploying&lt;/span&gt;
  &lt;span class="badge-system"&gt;Beta&lt;/span&gt;
&lt;/div&gt;

&lt;!-- Table cell --&gt;
&lt;td&gt;&lt;span class="badge-energy"&gt;v4.2&lt;/span&gt;&lt;/td&gt;
&lt;td&gt;&lt;span class="badge-success"&gt;Stable&lt;/span&gt;&lt;/td&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Stack multiple badges with <code>gap-xs</code>. In tables, badges sit
        naturally alongside version pills (<code>badge-energy</code>). Keep
        badge text short &mdash; one or two words maximum.
      </p>
    </div>

    <!-- ─── DISABLED STATES ────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Disabled States</h5>
      <p class="text-small text-mute">
        Both buttons and chips support the native <code>disabled</code>
        attribute. Disabled elements get muted colors, reduced opacity, and
        <code>cursor: not-allowed</code>.
      </p>

      <div
        class="surface-sunk p-md flex flex-row gap-md flex-wrap justify-center items-center"
      >
        <button disabled>Disabled Button</button>
        <button class="btn-premium" disabled>Disabled Premium</button>
        <button class="btn-ghost" disabled>Disabled Ghost</button>
        <div class="chip" aria-disabled="true">
          <p class="chip-label">Disabled Chip</p>
          <button
            type="button"
            class="btn-void chip-remove"
            disabled
            aria-label="Remove Disabled Chip">&#10005;</button
          >
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;button disabled&gt;Disabled&lt;/button&gt;
&lt;button class="btn-premium" disabled&gt;Disabled Premium&lt;/button&gt;
&lt;button class="btn-ghost" disabled&gt;Disabled Ghost&lt;/button&gt;
&lt;div class="chip" aria-disabled="true"&gt;
  &lt;p class="chip-label"&gt;Disabled Chip&lt;/p&gt;
  &lt;button class="btn-void chip-remove" disabled&gt;&amp;#10005;&lt;/button&gt;
&lt;/div&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─── VOID BUTTON ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Void Button</h5>
      <p class="text-small text-mute">
        <code>btn-void</code> strips all button styling &mdash; no background,
        border, padding, or text-transform. Use it for inline interactive
        elements inside other components (e.g., chip remove buttons, field slot
        icons). It still inherits <code>cursor: pointer</code> and focus styles.
      </p>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Used inside chips for the remove ✕ --&gt;
&lt;button class="btn-void chip-remove" aria-label="Remove"&gt;&amp;#10005;&lt;/button&gt;

&lt;!-- Used inside field overlays --&gt;
&lt;button class="btn-void field-slot-right"&gt;...&lt;/button&gt;</code
          ></pre>
      </details>
    </div>
  </div>
</section>
