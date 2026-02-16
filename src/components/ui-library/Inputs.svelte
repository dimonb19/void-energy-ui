<script lang="ts">
  import { Moon, Sun } from '@lucide/svelte';

  import Toggle from '../ui/Toggle.svelte';
  import Switcher from '../ui/Switcher.svelte';
  import Selector from '../ui/Selector.svelte';

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
</script>

<section class="flex flex-col gap-md mt-md">
  <h2>02 // INPUTS & CONTROLS</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Form elements follow the native-first protocol — thin wrappers around
      browser controls with <code>glass-sunk</code> physics applied via SCSS.
      The browser owns interaction, accessibility, and form integration. Accent
      colors, focus rings, and error states are token-driven.
      <code>Toggle</code> and <code>Switcher</code> are the only custom controls
      here — they exist because no native element provides the same interaction.
    </p>

    <!-- ─── TEXT INPUT ─────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Text Input</h5>
      <p class="text-small text-mute">
        Native <code>&lt;input type="text"&gt;</code> with
        <code>glass-sunk</code> physics. Focus shows the energy-primary border
        and focus ring. Supports <code>placeholder</code>,
        <code>disabled</code>, and <code>aria-invalid</code> for error state.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <label class="text-small px-xs" for="demo-text"
            >System Identifier</label
          >
          <input
            id="demo-text"
            type="text"
            placeholder="Enter Agent ID..."
            bind:value={textValue}
          />
        </div>
        <div class="flex flex-col gap-xs">
          <label class="text-small px-xs" for="demo-text-disabled"
            >Locked Field</label
          >
          <input
            id="demo-text-disabled"
            type="text"
            value="VOID-CORE-9X"
            disabled
          />
        </div>
      </div>

      <p class="text-caption text-mute px-xs">
        All text-like inputs (<code>text</code>, <code>email</code>,
        <code>password</code>, <code>url</code>) share the same sunk styling. No
        wrapper component needed.
      </p>
    </div>

    <!-- ─── TEXTAREA ───────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Textarea</h5>
      <p class="text-small text-mute">
        Native <code>&lt;textarea&gt;</code> with vertical resize. Same sunk physics
        as text inputs. Min-height scales with the density token.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-xs">
        <label class="text-small px-xs" for="demo-textarea">Mission Brief</label
        >
        <textarea
          id="demo-textarea"
          placeholder="Enter mission parameters..."
          bind:value={textareaValue}
        ></textarea>
      </div>
    </div>

    <!-- ─── SELECT ─────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
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
            label="Security Clearance"
            options={[
              { value: 'observer', label: 'Level 1 — Observer' },
              { value: 'operator', label: 'Level 2 — Operator' },
              { value: 'admin', label: 'Level 3 — Administrator' },
            ]}
            class="flex-1"
          />
          <Selector
            id="demo-selector-disabled"
            label="Region (locked)"
            options={[{ value: 'sector-7g', label: 'Sector 7-G' }]}
            value="sector-7g"
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
    </div>

    <!-- ─── RANGE SLIDER ───────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Range Slider</h5>
      <p class="text-small text-mute">
        Native <code>&lt;input type="range"&gt;</code> with
        <code>accent-color</code> set to the energy-primary token. The browser draws
        the track and thumb natively.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-xs">
        <label class="text-small px-xs" for="demo-range">
          Energy Output — {rangeValue}%
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

    <!-- ─── CHECKBOX & RADIO ───────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Checkbox & Radio</h5>
      <p class="text-small text-mute">
        Native <code>&lt;input type="checkbox"&gt;</code> and
        <code>&lt;input type="radio"&gt;</code> with
        <code>accent-color</code>. Size scales with the density token. No custom
        styling — the browser handles checked states, focus, and accessibility.
      </p>

      <div class="surface-sunk p-md flex flex-row flex-wrap gap-lg">
        <fieldset>
          <legend>Subsystems</legend>
          <label class="flex flex-row items-center gap-xs">
            <input type="checkbox" checked />
            <span>Enable Telemetry</span>
          </label>
          <label class="flex flex-row items-center gap-xs">
            <input type="checkbox" />
            <span>Allow External Connections</span>
          </label>
          <label class="flex flex-row items-center gap-xs">
            <input type="checkbox" disabled />
            <span>Root Access (locked)</span>
          </label>
        </fieldset>

        <fieldset>
          <legend>Operating Mode</legend>
          <label class="flex flex-row items-center gap-xs">
            <input type="radio" name="demo-mode" checked />
            <span>Manual Override</span>
          </label>
          <label class="flex flex-row items-center gap-xs">
            <input type="radio" name="demo-mode" />
            <span>Auto-Pilot</span>
          </label>
          <label class="flex flex-row items-center gap-xs">
            <input type="radio" name="demo-mode" disabled />
            <span>Quantum Mode (locked)</span>
          </label>
        </fieldset>

        <fieldset disabled>
          <legend>Restricted Zone</legend>
          <label class="flex flex-row items-center gap-xs">
            <input type="checkbox" checked />
            <span>Core Dump</span>
          </label>
          <label class="flex flex-row items-center gap-xs">
            <input type="radio" name="demo-restricted" />
            <span>Emergency Shutdown</span>
          </label>
        </fieldset>
      </div>
    </div>

    <!-- ─── TOGGLE ─────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Toggle</h5>
      <p class="text-small text-mute">
        Physics-aware switch for boolean states. Supports custom Lucide icons,
        emoji icons, hidden icons, and disabled state. The thumb animates
        between positions using spring transitions. Retro mode uses instant
        snapping.
      </p>

      <div
        class="surface-sunk p-md flex flex-col flex-wrap justify-center items-center gap-sm tablet:flex-row"
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

      <p class="text-caption text-mute px-xs">
        Props: <code>checked</code> (bindable), <code>label</code>,
        <code>iconOn</code>/<code>iconOff</code> (Component or string),
        <code>hideIcons</code>, <code>disabled</code>.
      </p>
    </div>

    <!-- ─── SWITCHER ───────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Switcher</h5>
      <p class="text-small text-mute">
        Segmented control for selecting between N options. Uses
        <code>role="radiogroup"</code> with roving tabindex for keyboard navigation
        (arrow keys, Home, End). Only the selected option is tabbable.
      </p>

      <div class="surface-sunk p-md flex flex-col items-center gap-sm">
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
    </div>
  </div>
</section>
