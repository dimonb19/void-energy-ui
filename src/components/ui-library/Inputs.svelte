<script lang="ts">
  import { Moon, Sun } from '@lucide/svelte';

  import Toggle from '../ui/Toggle.svelte';
  import Switcher from '../ui/Switcher.svelte';
  import Selector from '../ui/Selector.svelte';
  import FormField from '../ui/FormField.svelte';

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
</script>

<section id="inputs" class="flex flex-col gap-md">
  <h2>06 // INPUTS & CONTROLS</h2>

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
        <code>&lt;select&gt;</code> with label association and layout. Zero custom
        dropdown JS — the browser handles the dropdown entirely.
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
        Supports <code>align="start"</code> for left-aligned labels.
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
        Segmented control for selecting between N options. Uses
        <code>role="radiogroup"</code> with roving tabindex for keyboard navigation
        (arrow keys, Home, End). Only the selected option is tabbable.
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
  </div>
</section>
