<script lang="ts">
  import { Moon, Sun } from '@lucide/svelte';

  import Toggle from '../ui/Toggle.svelte';
  import Switcher from '../ui/Switcher.svelte';
  import Selector from '../ui/Selector.svelte';
  import FormField from '../ui/FormField.svelte';
  import DropZone from '../ui/DropZone.svelte';
  import { toast } from '@stores/toast.svelte';

  // Text input demo
  let textValue = $state('');

  // Textarea demo
  let textareaValue = $state('');

  // Selector demo
  let selectorValue = $state('');

  // Range demo
  let rangeValue = $state(50);

  // Toggle demos
  let telemetry = $state(true);
  let systemMode = $state(true);
  let stealth = $state(false);
  let aiSentiment = $state(true);
  let rootAccess = $state(false);

  // Switcher demo
  let physicsMode = $state<string | number | null>('glass');

  // FormField validation demos
  let emailValue = $state('');
  let emailError = $state('');

  const BIO_MAX = 100;
  let bioValue = $state('');
  let bioError = $derived(
    bioValue.length > BIO_MAX
      ? `${bioValue.length - BIO_MAX} characters over the limit.`
      : '',
  );

  function validateEmail() {
    if (!emailValue) {
      emailError = 'Email is required.';
    } else if (!emailValue.includes('@')) {
      emailError = 'Please enter a valid email address.';
    } else {
      emailError = '';
    }
  }

  // Details demo
  let detailsRange = $state(75);

  // Progress demo
  let progressValue = $state(65);

  // Output demo
  let outputA = $state(50);
  let outputB = $state(25);
  const outputSum = $derived(outputA + outputB);
</script>

<section id="inputs" class="flex flex-col gap-md">
  <h2>07 // INPUTS & CONTROLS</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Standard form elements &mdash; text inputs, selects, checkboxes, radios,
      range sliders, and toggles &mdash; all styled to match the active
      atmosphere. Validation states, disabled states, and keyboard navigation
      work out of the box because these are native HTML elements, not
      reimplementations.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Form elements follow the native-first protocol &mdash; thin wrappers
        around browser controls with <code>glass-sunk</code> physics applied via
        SCSS. The browser owns interaction, accessibility, and form integration.
        Accent colors, focus rings, and error states are token-driven.
        <code>Toggle</code> and <code>Switcher</code> are the only custom controls
        &mdash; they exist because no native element provides the same interaction.
      </p>
    </details>

    <!-- ─── TEXT INPUT ─────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Text Input</h5>
      <p class="text-small text-mute">
        Native <code>&lt;input type="text"&gt;</code> with
        <code>glass-sunk</code> physics. Focus shows the energy-primary border
        and focus ring. Supports <code>placeholder</code>,
        <code>disabled</code>, and <code>aria-invalid</code> for error state.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <label class="text-small px-xs" for="demo-text">Full Name</label>
          <input
            id="demo-text"
            type="text"
            placeholder="Enter your name..."
            bind:value={textValue}
          />
        </div>
        <div class="flex flex-col gap-xs">
          <label class="text-small px-xs" for="demo-text-disabled"
            >Account ID (locked)</label
          >
          <input
            id="demo-text-disabled"
            type="text"
            value="USR-4F8A-9C2E"
            disabled
          />
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;label for="my-input"&gt;Label&lt;/label&gt;
&lt;input id="my-input" type="text" placeholder="Enter value..." bind:value /&gt;

&lt;!-- Disabled --&gt;
&lt;input type="text" value="Locked" disabled /&gt;

&lt;!-- Validation error --&gt;
&lt;input type="text" aria-invalid="true" /&gt;
&lt;p class="text-caption text-error"&gt;Error message.&lt;/p&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        All text-like inputs (<code>text</code>, <code>email</code>,
        <code>password</code>, <code>url</code>) share the same sunk styling. No
        wrapper component needed.
      </p>
    </div>

    <!-- ─── TEXTAREA ───────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Textarea</h5>
      <p class="text-small text-mute">
        Native <code>&lt;textarea&gt;</code> with vertical resize. Same sunk physics
        as text inputs. Min-height scales with the density token.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <label class="text-small px-xs" for="demo-textarea">Description</label
          >
          <textarea
            id="demo-textarea"
            placeholder="Enter project details..."
            bind:value={textareaValue}
          ></textarea>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;label for="notes"&gt;Description&lt;/label&gt;
&lt;textarea id="notes" placeholder="Enter details..." bind:value&gt;&lt;/textarea&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─── VALIDATION & FORMFIELD ────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Validation & FormField</h5>
      <p class="text-small text-mute">
        The <code>FormField</code> wrapper handles label association, error
        messages with icons, hint text, and full ARIA wiring (<code>for</code>,
        <code>aria-describedby</code>, <code>aria-invalid</code>) automatically.
        Error borders also activate via the native <code>:user-invalid</code>
        pseudo-class after user interaction.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-lg">
        <!-- Demo 1: Interactive email validation -->
        <FormField
          label="Email Address"
          error={emailError}
          required
          hint="We'll never share your email."
          fieldId="demo-email"
        >
          {#snippet children({ fieldId, descriptionId, invalid })}
            <input
              type="email"
              id={fieldId}
              required
              placeholder="you@example.com"
              bind:value={emailValue}
              onblur={validateEmail}
              aria-invalid={invalid}
              aria-describedby={descriptionId}
            />
          {/snippet}
        </FormField>

        <!-- Demo 2: Textarea with character limit -->
        <FormField
          label="Bio"
          error={bioError}
          hint="Max {BIO_MAX} characters."
          fieldId="demo-bio"
        >
          {#snippet children({ fieldId, descriptionId, invalid })}
            <textarea
              id={fieldId}
              placeholder="Tell us about yourself..."
              bind:value={bioValue}
              aria-invalid={invalid}
              aria-describedby={descriptionId}
            ></textarea>
          {/snippet}
        </FormField>

        <!-- Demo 3: Static aria-invalid (low-level approach) -->
        <div class="flex flex-col gap-xs">
          <label class="text-small px-xs" for="demo-raw-invalid">
            Raw Validation (no wrapper)
          </label>
          <input
            id="demo-raw-invalid"
            type="text"
            value="not-a-valid-email"
            aria-invalid="true"
          />
          <p class="text-caption text-mute px-xs">
            For simple cases, <code>aria-invalid="true"</code> alone activates
            the error border without needing <code>FormField</code>.
          </p>
        </div>
      </div>

      <p class="text-caption text-mute px-xs">
        Use <code>FormField</code> when you need label + error + hint + ARIA
        wiring. Use raw <code>aria-invalid</code> for standalone inputs that
        only need a red border. The <code>:user-invalid</code> pseudo-class
        fires automatically for native constraints (<code>required</code>,
        <code>pattern</code>, <code>type="email"</code>) after interaction.
      </p>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import FormField from './ui/FormField.svelte';
  let email = $state('');
  let error = $state('');
&lt;/script&gt;

&lt;!-- FormField with label, error, hint, and ARIA wiring --&gt;
&lt;FormField label="Email" error=&#123;error&#125; required hint="We won't share it."&gt;
  &#123;#snippet children(&#123; fieldId, descriptionId, invalid &#125;)&#125;
    &lt;input
      type="email"
      id=&#123;fieldId&#125;
      required
      aria-invalid=&#123;invalid&#125;
      aria-describedby=&#123;descriptionId&#125;
    /&gt;
  &#123;/snippet&#125;
&lt;/FormField&gt;

&lt;!-- Low-level: border-only error (no wrapper needed) --&gt;
&lt;input type="text" aria-invalid="true" /&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─── SELECT ─────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Select</h5>
      <p class="text-small text-mute">
        The <code>Selector</code> component wraps a native
        <code>&lt;select&gt;</code> with label association and layout. Zero
        custom dropdown JS — the browser handles the dropdown entirely. Native
        form attributes pass through to the underlying
        <code>&lt;select&gt;</code>.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col tablet:flex-row gap-md">
          <Selector
            bind:value={selectorValue}
            id="demo-selector"
            label="Role"
            options={[
              { value: 'viewer', label: 'Viewer' },
              { value: 'editor', label: 'Editor' },
              { value: 'admin', label: 'Administrator' },
            ]}
            class="flex-1"
          />
          <Selector
            id="demo-selector-disabled"
            label="Region (locked)"
            options={[{ value: 'us-east', label: 'US East' }]}
            value="us-east"
            disabled={true}
            class="flex-1"
          />
        </div>
      </div>

      <p class="text-caption text-mute px-xs">
        Props: <code>options</code>, <code>value</code> (bindable),
        <code>label</code>, <code>placeholder</code>, <code>disabled</code>.
        Supports <code>align="start"</code> for left-aligned labels. Native form
        submission serializes <code>String(option.value)</code>.
      </p>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import Selector from './ui/Selector.svelte';
&lt;/script&gt;

&lt;Selector
  bind:value
  label="Role"
  options=&#123;[
    &#123; value: 'viewer', label: 'Viewer' &#125;,
    &#123; value: 'editor', label: 'Editor' &#125;,
    &#123; value: 'admin', label: 'Admin' &#125;,
  ]&#125;
/&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─── RANGE SLIDER ───────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Range Slider</h5>
      <p class="text-small text-mute">
        Native <code>&lt;input type="range"&gt;</code> with
        <code>accent-color</code> set to the energy-primary token. The browser draws
        the track and thumb natively.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <label class="text-small px-xs" for="demo-range">
            Volume — {rangeValue}%
          </label>
          <input
            id="demo-range"
            type="range"
            bind:value={rangeValue}
            min="0"
            max="100"
          />
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;label for="volume"&gt;Volume — &#123;value&#125;%&lt;/label&gt;
&lt;input id="volume" type="range" bind:value min="0" max="100" /&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─── CHECKBOX & RADIO ───────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Checkbox & Radio</h5>
      <p class="text-small text-mute">
        Native <code>&lt;input type="checkbox"&gt;</code> and
        <code>&lt;input type="radio"&gt;</code> with
        <code>accent-color</code>. Size scales with the density token. No custom
        styling — the browser handles checked states, focus, and accessibility.
      </p>

      <div class="surface-sunk p-md flex flex-row flex-wrap gap-lg">
        <fieldset>
          <legend>Notifications</legend>
          <label class="flex flex-row items-center gap-xs">
            <input type="checkbox" checked />
            <span>Email alerts</span>
          </label>
          <label class="flex flex-row items-center gap-xs">
            <input type="checkbox" />
            <span>Push notifications</span>
          </label>
          <label class="flex flex-row items-center gap-xs">
            <input type="checkbox" disabled />
            <span>SMS (plan upgrade required)</span>
          </label>
        </fieldset>

        <fieldset>
          <legend>Display</legend>
          <label class="flex flex-row items-center gap-xs">
            <input type="radio" name="demo-mode" checked />
            <span>Grid view</span>
          </label>
          <label class="flex flex-row items-center gap-xs">
            <input type="radio" name="demo-mode" />
            <span>List view</span>
          </label>
          <label class="flex flex-row items-center gap-xs">
            <input type="radio" name="demo-mode" disabled />
            <span>Table view (locked)</span>
          </label>
        </fieldset>

        <fieldset disabled>
          <legend>Admin Only</legend>
          <label class="flex flex-row items-center gap-xs">
            <input type="checkbox" checked />
            <span>Audit logging</span>
          </label>
          <label class="flex flex-row items-center gap-xs">
            <input type="radio" name="demo-restricted" />
            <span>Force logout</span>
          </label>
        </fieldset>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;fieldset&gt;
  &lt;legend&gt;Notifications&lt;/legend&gt;
  &lt;label class="flex flex-row items-center gap-xs"&gt;
    &lt;input type="checkbox" checked /&gt;
    &lt;span&gt;Email alerts&lt;/span&gt;
  &lt;/label&gt;
  &lt;label class="flex flex-row items-center gap-xs"&gt;
    &lt;input type="checkbox" /&gt;
    &lt;span&gt;Push notifications&lt;/span&gt;
  &lt;/label&gt;
&lt;/fieldset&gt;

&lt;fieldset&gt;
  &lt;legend&gt;Layout&lt;/legend&gt;
  &lt;label class="flex flex-row items-center gap-xs"&gt;
    &lt;input type="radio" name="layout" checked /&gt;
    &lt;span&gt;Grid&lt;/span&gt;
  &lt;/label&gt;
  &lt;label class="flex flex-row items-center gap-xs"&gt;
    &lt;input type="radio" name="layout" /&gt;
    &lt;span&gt;List&lt;/span&gt;
  &lt;/label&gt;
&lt;/fieldset&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Checkboxes and radios have physics-aware enhancements: glass mode adds a
        glow on <code>:checked</code>, retro mode scales controls up by 15%.
        Fieldsets highlight with energy-primary border and legend color on
        <code>:focus-within</code>. Switch to glass or retro atmospheres and
        interact with the controls above to see the effects.
      </p>
    </div>

    <!-- ─── TOGGLE ─────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Toggle</h5>
      <p class="text-small text-mute">
        Physics-aware switch for boolean states. Supports custom Lucide icons,
        emoji icons, hidden icons, and disabled state. The thumb animates
        between positions using spring transitions. Retro mode uses instant
        snapping.
      </p>

      <div
        class="surface-sunk p-md flex flex-col flex-wrap justify-center items-center gap-md tablet:flex-row"
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

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import Toggle from './ui/Toggle.svelte';
  import &#123; Sun, Moon &#125; from '@lucide/svelte';
  let checked = $state(false);
&lt;/script&gt;

&lt;Toggle bind:checked label="Dark Mode" /&gt;
&lt;Toggle bind:checked label="Theme" iconOn=&#123;Sun&#125; iconOff=&#123;Moon&#125; /&gt;
&lt;Toggle bind:checked label="Minimal" hideIcons /&gt;
&lt;Toggle checked=&#123;false&#125; label="Locked" disabled /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>checked</code> (bindable), <code>label</code>,
        <code>iconOn</code>/<code>iconOff</code> (Component or string),
        <code>hideIcons</code>, <code>disabled</code>.
      </p>
    </div>

    <!-- ─── SWITCHER ───────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Switcher</h5>
      <p class="text-small text-mute">
        Segmented control for selecting between N options. Built on native radio
        inputs with a shared group name, so keyboard behavior follows
        browser-default radio interaction (Tab + Arrow keys). Native form
        submission uses the browser's string value for the checked option.
      </p>

      <div class="surface-sunk p-md flex flex-col items-center gap-md">
        <Switcher
          bind:value={physicsMode}
          label="Physics Preset"
          options={[
            { value: 'glass', label: 'Glass' },
            { value: 'flat', label: 'Flat' },
            { value: 'retro', label: 'Retro' },
          ]}
        />
        <p class="text-caption text-mute">
          Selected: <code>{physicsMode}</code>
        </p>
      </div>

      <p class="text-caption text-mute px-xs">
        Props: <code>options</code> (value, label, icon?),
        <code>value</code> (bindable), <code>label</code>,
        <code>name</code>, <code>required</code>, <code>form</code>, and
        <code>disabled</code>.
      </p>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import Switcher from './ui/Switcher.svelte';
  let value = $state('option-a');
&lt;/script&gt;

&lt;Switcher
  bind:value
  label="View Mode"
  options=&#123;[
    &#123; value: 'grid', label: 'Grid' &#125;,
    &#123; value: 'list', label: 'List' &#125;,
    &#123; value: 'table', label: 'Table' &#125;,
  ]&#125;
/&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─── DETAILS & SUMMARY ────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Details & Summary</h5>
      <p class="text-small text-mute">
        Native <code>&lt;details&gt;</code> disclosure element for collapsible
        sections. Zero JS — the browser handles open/close, keyboard support
        (Enter/Space), and accessibility. SCSS adds border, chevron indicator,
        and smooth expand/collapse animation via
        <code>::details-content</code>. Use the <code>name</code> attribute for exclusive
        accordion groups.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <!-- Single disclosure -->
        <details>
          <summary>Energy Output Configuration</summary>
          <div class="flex flex-col gap-xs p-md">
            <label class="text-small px-xs" for="demo-details-range">
              Output Level — {detailsRange}%
            </label>
            <input
              id="demo-details-range"
              type="range"
              bind:value={detailsRange}
              min="0"
              max="100"
            />
          </div>
        </details>

        <!-- Accordion group (exclusive via name attribute) -->
        <details name="demo-accordion" open>
          <summary>Navigation Subsystem</summary>
          <div class="flex flex-col gap-xs p-md">
            <label class="flex flex-row items-center gap-xs">
              <input type="checkbox" checked />
              <span>Inertial Guidance</span>
            </label>
            <label class="flex flex-row items-center gap-xs">
              <input type="checkbox" />
              <span>Star Tracker</span>
            </label>
          </div>
        </details>
        <details name="demo-accordion">
          <summary>Propulsion Subsystem</summary>
          <div class="flex flex-col gap-xs p-md">
            <label class="flex flex-row items-center gap-xs">
              <input type="checkbox" checked />
              <span>Main Engine</span>
            </label>
            <label class="flex flex-row items-center gap-xs">
              <input type="checkbox" />
              <span>Reaction Control</span>
            </label>
          </div>
        </details>
        <details name="demo-accordion">
          <summary>Communications Subsystem</summary>
          <div class="flex flex-col gap-xs p-md">
            <label class="flex flex-row items-center gap-xs">
              <input type="checkbox" checked />
              <span>High-Gain Antenna</span>
            </label>
            <label class="flex flex-row items-center gap-xs">
              <input type="checkbox" />
              <span>Low-Gain Backup</span>
            </label>
          </div>
        </details>

        <!-- Nested with fieldset -->
        <details>
          <summary>Restricted Zone Settings</summary>
          <fieldset class="m-md">
            <legend>Core Permissions</legend>
            <label class="flex flex-row items-center gap-xs">
              <input type="checkbox" />
              <span>Core Dump Access</span>
            </label>
            <label class="flex flex-row items-center gap-xs">
              <input type="checkbox" />
              <span>Emergency Override</span>
            </label>
            <label class="flex flex-row items-center gap-xs">
              <input type="checkbox" disabled />
              <span>Quantum Entanglement (locked)</span>
            </label>
          </fieldset>
        </details>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Single disclosure --&gt;
&lt;details&gt;
  &lt;summary&gt;Section Title&lt;/summary&gt;
  &lt;div class="p-md"&gt;Content here&lt;/div&gt;
&lt;/details&gt;

&lt;!-- Exclusive accordion group --&gt;
&lt;details name="my-group" open&gt;
  &lt;summary&gt;Panel A&lt;/summary&gt;
  &lt;div class="p-md"&gt;...&lt;/div&gt;
&lt;/details&gt;
&lt;details name="my-group"&gt;
  &lt;summary&gt;Panel B&lt;/summary&gt;
  &lt;div class="p-md"&gt;...&lt;/div&gt;
&lt;/details&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Add <code>name="group"</code> to multiple <code>&lt;details&gt;</code>
        elements for exclusive accordion behavior (only one open at a time). Nest
        <code>&lt;fieldset&gt;</code> inside for semantic form grouping.
      </p>
    </div>

    <!-- ─── PROGRESS BAR ─────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Progress Bar</h5>
      <p class="text-small text-mute">
        Fully custom-styled <code>&lt;progress&gt;</code> element. Pill-shaped fill
        bar with energy-primary color, density-scaled height. Glass mode adds a glow
        to the fill. Retro squares the bar and uses a stepped shimmer for indeterminate
        state.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <label class="text-small px-xs" for="demo-progress">
            Determinate &mdash; {progressValue}%
          </label>
          <input
            id="demo-progress"
            type="range"
            bind:value={progressValue}
            min="0"
            max="100"
          />
          <progress value={progressValue} max="100"></progress>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs text-dim">
            Indeterminate (no value attribute):
          </p>
          <progress></progress>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Determinate --&gt;
&lt;progress value="65" max="100"&gt;&lt;/progress&gt;

&lt;!-- Indeterminate --&gt;
&lt;progress&gt;&lt;/progress&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        The indeterminate state activates when the <code>value</code> attribute is
        absent. Glass adds a glowing fill; retro uses a stepped scan-line shimmer.
      </p>
    </div>

    <!-- ─── METER ────────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Meter</h5>
      <p class="text-small text-mute">
        Native <code>&lt;meter&gt;</code> element for scalar measurements. Three
        semantic color ranges &mdash; optimum (success green), sub-optimum
        (premium amber), and danger (error red). The browser selects the color
        based on <code>low</code>/<code>high</code>/<code>optimum</code>
        attributes.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs text-dim">
            Optimum range (value=90, optimum=80):
          </p>
          <meter min="0" max="100" low="25" high="75" optimum="80" value="90"
          ></meter>
        </div>
        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs text-dim">Sub-optimum range (value=50):</p>
          <meter min="0" max="100" low="25" high="75" optimum="80" value="50"
          ></meter>
        </div>
        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs text-dim">Danger range (value=10):</p>
          <meter min="0" max="100" low="25" high="75" optimum="80" value="10"
          ></meter>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Optimum (green) --&gt;
&lt;meter min="0" max="100" low="25" high="75" optimum="80" value="90"&gt;&lt;/meter&gt;

&lt;!-- Sub-optimum (amber) --&gt;
&lt;meter min="0" max="100" low="25" high="75" optimum="80" value="50"&gt;&lt;/meter&gt;

&lt;!-- Danger (red) --&gt;
&lt;meter min="0" max="100" low="25" high="75" optimum="80" value="10"&gt;&lt;/meter&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Same dimensions as <code>&lt;progress&gt;</code> for visual consistency.
        Glass mode adds a glow on the optimum value. No classes needed &mdash; the
        browser determines the color zone from the attributes.
      </p>
    </div>

    <!-- ─── OUTPUT ───────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Output</h5>
      <p class="text-small text-mute">
        The <code>&lt;output&gt;</code> element for computed/calculated values.
        Styled as a data pill &mdash; monospace font with
        <code>tabular-nums</code>, energy-primary tinted background, pill shape.
        Retro mode shows a bordered box.
      </p>

      <div class="surface-sunk p-md">
        <div class="flex flex-row items-center gap-sm">
          <input
            id="demo-output-a"
            type="number"
            bind:value={outputA}
            min="0"
            max="100"
            aria-label="Value A"
          />
          <span class="text-dim">+</span>
          <input
            id="demo-output-b"
            type="number"
            bind:value={outputB}
            min="0"
            max="100"
            aria-label="Value B"
          />
          <span class="text-dim">=</span>
          <output>{outputSum}</output>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;output&gt;&#123;computedValue&#125;&lt;/output&gt;

&lt;!-- With form association --&gt;
&lt;form oninput="result.value = parseInt(a.value) + parseInt(b.value)"&gt;
  &lt;input type="range" id="a" value="50"&gt; +
  &lt;input type="number" id="b" value="25"&gt; =
  &lt;output name="result" for="a b"&gt;75&lt;/output&gt;
&lt;/form&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Monospace font with <code>tabular-nums</code> ensures numbers align
        consistently. The pill background uses
        <code>alpha(energy-primary, 10%)</code>.
      </p>
    </div>

    <!-- ─── FILE UPLOAD ──────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>File Upload</h5>
      <p class="text-small text-mute">
        Drag-and-drop file upload via the <code>DropZone</code> component. Wraps
        a native <code>&lt;input type="file"&gt;</code> with drag detection, type/size
        validation, and physics-aware active state. Drop files onto the zone or click
        to browse.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-lg">
        <!-- Basic upload -->
        <div class="flex flex-col gap-xs">
          <p class="text-small text-dim">
            Basic &mdash; any file type or size:
          </p>
          <DropZone
            onfiles={(files) => {
              toast.show(
                `Uploaded: ${files.map((f) => f.name).join(', ')}`,
                'success',
              );
            }}
          />
        </div>

        <!-- Restricted upload -->
        <div class="flex flex-col gap-xs">
          <p class="text-small text-dim">
            Restricted &mdash; <code>.json</code> and <code>.csv</code> only, max
            2 MB:
          </p>
          <DropZone
            accept=".json,.csv"
            maxSize={2 * 1024 * 1024}
            onfiles={(files) => {
              toast.show(`Valid upload: ${files[0].name}`, 'success');
            }}
          />
        </div>

        <!-- Multiple files -->
        <div class="flex flex-col gap-xs">
          <p class="text-small text-dim">
            Multiple &mdash; select or drop several files at once:
          </p>
          <DropZone
            multiple
            onfiles={(files) => {
              toast.show(
                `${files.length} file${files.length > 1 ? 's' : ''} received`,
                'info',
              );
            }}
          />
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import DropZone from './ui/DropZone.svelte';
&lt;/script&gt;

&lt;!-- Basic (any file) --&gt;
&lt;DropZone onfiles=&#123;(files) =&gt; console.log(files)&#125; /&gt;

&lt;!-- Restricted (type + size) --&gt;
&lt;DropZone
  accept=".json,.csv"
  maxSize=&#123;2 * 1024 * 1024&#125;
  onfiles=&#123;handleFiles&#125;
/&gt;

&lt;!-- Multiple files --&gt;
&lt;DropZone multiple onfiles=&#123;handleFiles&#125; /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>accept</code> (file type filter), <code>maxSize</code>
        (bytes), <code>multiple</code>, <code>onfiles</code> (callback). Invalid
        files are rejected with toast errors. Drag-over triggers
        <code>data-state="active"</code> with shadow elevation and subtle scale-up;
        retro physics uses a thicker border instead.
      </p>
    </div>
  </div>
</section>
