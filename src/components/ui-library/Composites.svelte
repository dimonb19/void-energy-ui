<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import { createPasswordValidation } from '@lib/password-validation.svelte';

  import SearchField from '../ui/SearchField.svelte';
  import PasswordField from '../ui/PasswordField.svelte';
  import PasswordMeter from '../ui/PasswordMeter.svelte';
  import PasswordChecklist from '../ui/PasswordChecklist.svelte';
  import FormField from '../ui/FormField.svelte';
  import EditField from '../ui/EditField.svelte';
  import EditTextarea from '../ui/EditTextarea.svelte';
  import CopyField from '../ui/CopyField.svelte';
  import GenerateField from '../ui/GenerateField.svelte';
  import GenerateTextarea from '../ui/GenerateTextarea.svelte';
  import MediaSlider from '../ui/MediaSlider.svelte';
  import SliderField from '../ui/SliderField.svelte';
  import type { Component } from 'svelte';
  import ActionBtn from '../ui/ActionBtn.svelte';
  import IconBtn from '../ui/IconBtn.svelte';
  import ThemesBtn from '../ui/ThemesBtn.svelte';
  import Selector from '../ui/Selector.svelte';
  import SettingsRow from '../ui/SettingsRow.svelte';
  import Toggle from '../ui/Toggle.svelte';

  import PlayPause from '../icons/PlayPause.svelte';
  import Refresh from '../icons/Refresh.svelte';
  import Remove from '../icons/Remove.svelte';
  import Contract from '../icons/Contract.svelte';
  import Quit from '../icons/Quit.svelte';
  import Restart from '../icons/Restart.svelte';
  import Edit from '../icons/Edit.svelte';
  import Undo from '../icons/Undo.svelte';
  import Switch from '../icons/Switch.svelte';
  import Sort from '../icons/Sort.svelte';
  import DoorIn from '../icons/DoorIn.svelte';
  import DoorOut from '../icons/DoorOut.svelte';

  // Demo state — Input Fields
  let searchValue = $state('');
  let passwordValue = $state('');
  let confirmPasswordValue = $state('');

  const pv = createPasswordValidation(
    () => passwordValue,
    () => confirmPasswordValue,
    { requireConfirm: true },
  );

  let editValue = $state('VOID-7G-NEXUS');
  let editTextareaValue = $state(
    'Void energy reactor status: all subsystems nominal. Containment field stable at 99.7% integrity.',
  );
  let copyValue = 'sk-void-4f8a-9c2e-7d1b-3e6f';
  let generateValue = $state('');
  let generateTextareaValue = $state('');

  // Mock AI generation handler (simulates async generation)
  async function mockGenerate({
    currentValue,
    instructions,
    signal,
  }: {
    currentValue: string;
    instructions?: string;
    signal: AbortSignal;
  }): Promise<string> {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 6000);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
    if (currentValue) {
      return `${currentValue} — enhanced by AI`;
    }
    return instructions ?? 'AI-generated content';
  }

  // Demo state — Slider Fields
  let renderQuality = $state(50);
  const renderQualityPresets = [
    { label: 'MIN', value: 1 },
    { label: 'STANDARD', value: 2 },
    { label: 'MAX', value: 3 },
  ];

  let playbackSpeed = $state(1.0);
  const playbackSpeedPresets = [
    { label: 'x0.25', value: 0.25 },
    { label: 'x0.5', value: 0.5 },
    { label: 'x0.75', value: 0.75 },
    { label: 'x1', value: 1.0 },
    { label: 'x1.25', value: 1.25 },
    { label: 'x1.5', value: 1.5 },
  ];

  let plainValue = $state(42);

  // Demo state — Icon Buttons
  let playing = $state(true);

  // Demo state — Media Controls
  let volume = $state(65);
  let voiceMuted = $state(false);
  let voicePaused = $state(false);
  let musicVolume = $state(40);
  let musicMuted = $state(false);
  let musicPaused = $state(false);

  // ActionBtn interactive demo
  const iconMap: Record<string, Component> = {
    PlayPause,
    Refresh,
    Restart,
    Contract,
    Remove,
    Quit,
    Edit,
    Undo,
    Switch,
    Sort,
    DoorIn,
    DoorOut,
  };

  const iconList = [
    { value: 'PlayPause', label: 'PlayPause' },
    { value: 'Refresh', label: 'Refresh' },
    { value: 'Restart', label: 'Restart' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Remove', label: 'Remove' },
    { value: 'Quit', label: 'Quit' },
    { value: 'Edit', label: 'Edit' },
    { value: 'Undo', label: 'Undo' },
    { value: 'Switch', label: 'Switch' },
    { value: 'Sort', label: 'Sort' },
    { value: 'DoorIn', label: 'DoorIn' },
    { value: 'DoorOut', label: 'DoorOut' },
  ];

  const variantList = [
    { value: '', label: 'Default' },
    { value: 'btn-cta', label: 'CTA' },
    { value: 'btn-premium', label: 'Premium' },
    { value: 'btn-system', label: 'System' },
    { value: 'btn-success', label: 'Success' },
    { value: 'btn-error', label: 'Error' },
  ];

  const btnLabel: Record<string, string> = {
    DoorIn: 'Sign In',
    DoorOut: 'Sign Out',
  };

  let selectedIcon = $state('DoorIn');
  let selectedVariant = $state('');
  let activeIcon = $derived(iconMap[selectedIcon]);
  let activeLabel = $derived(btnLabel[selectedIcon] ?? selectedIcon);

  // SettingsRow demo state
  let notificationsEnabled = $state(true);
  let settingsLayout = $state('comfortable');
  const layoutOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'spacious', label: 'Spacious' },
  ];
</script>

<section id="composites" class="flex flex-col gap-md">
  <h2>09 // COMPOSITES</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Higher-order components that combine icons, inputs, and buttons into
      ready-to-use patterns. Search fields, password fields with visibility
      toggles, editable fields with confirm/reset, copy-to-clipboard fields,
      media volume controls, and action buttons with animated icons &mdash; all
      pre-wired and accessible.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Input fields use the <code>.field</code> overlay pattern: icons are
        <strong>absolutely positioned</strong> inside the native input, which
        keeps its own <code>surface-sunk</code> styling untouched. Padding
        adjusts automatically via <code>:has()</code> selectors. Icons provide
        visual state feedback &mdash; rotation, checkmarks, cross-outs &mdash;
        driven by <code>data-state</code> and <code>data-muted</code> attributes.
      </p>
    </details>

    <!-- ─── INPUT FIELDS ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Input Fields</h5>
      <p class="text-small text-mute">
        Each field wraps a native <code>&lt;input&gt;</code> inside a
        <code>.field</code> container. The input keeps all native styling (<code
          >surface-sunk</code
        >, focus ring, border). Icon slots are absolutely positioned via
        <code>.field-slot-left</code>
        /
        <code>.field-slot-right</code>, with input padding adjusting
        automatically to make room.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <!-- SearchField -->
        <div class="flex flex-col gap-xs">
          <label for="search-field" class="text-small px-xs">SearchField</label>
          <SearchField
            id="search-field"
            bind:value={searchValue}
            placeholder="Search modules..."
            onsubmit={(v) => toast.show(`Search: "${v}"`, 'info')}
          />
          <p class="text-caption text-mute px-xs">
            Search icon rotates on focus. Enter only intercepts native behavior
            when <code>onsubmit</code> is provided. Supports
            <code>zoom</code> variants.
          </p>
        </div>

        <!-- PasswordField + PasswordMeter + PasswordChecklist -->
        <div class="flex flex-col gap-md">
          <FormField
            label="PasswordField + Validation"
            error={pv.error}
            fieldId="password-field"
          >
            {#snippet children({ fieldId, descriptionId, invalid })}
              <PasswordField
                id={fieldId}
                bind:value={passwordValue}
                placeholder="Enter access key..."
                {invalid}
                describedby={descriptionId}
                autocomplete="new-password"
              />
            {/snippet}
          </FormField>
          <PasswordMeter password={passwordValue} validation={pv} />
          <PasswordChecklist password={passwordValue} validation={pv} />
          <PasswordField
            id="confirm-password-field"
            bind:value={confirmPasswordValue}
            placeholder="Confirm access key..."
            autocomplete="new-password"
          />
          <button
            disabled={!pv.isValid}
            onclick={() => toast.show('Password accepted', 'success')}
          >
            Submit
          </button>
          <p class="text-caption text-mute px-xs">
            Full validation flow via <code>createPasswordValidation()</code>.
            PasswordMeter and PasswordChecklist read from the shared
            <code>validation</code> state. Restricted characters trigger a FormField
            error. Submit is disabled until all rules pass.
          </p>
        </div>

        <!-- EditField -->
        <div class="flex flex-col gap-xs">
          <label for="edit-field" class="text-small px-xs">EditField</label>
          <EditField
            id="edit-field"
            bind:value={editValue}
            placeholder="Agent identifier..."
            onconfirm={(v) => toast.show(`Saved: "${v}"`, 'success')}
          />
          <p class="text-caption text-mute px-xs">
            Readonly until unlocked. Click Edit to enable, then Check to confirm
            or Undo to reset. <code>Enter</code> confirms,
            <code>Escape</code> resets.
          </p>
        </div>

        <!-- EditTextarea -->
        <div class="flex flex-col gap-xs">
          <label for="edit-textarea" class="text-small px-xs"
            >EditTextarea</label
          >
          <EditTextarea
            id="edit-textarea"
            bind:value={editTextareaValue}
            placeholder="System notes..."
            rows={3}
            onconfirm={(v) =>
              toast.show(`Saved: "${v.slice(0, 40)}..."`, 'success')}
          />
          <p class="text-caption text-mute px-xs">
            Same edit/confirm/cancel pattern as EditField, adapted for
            multi-line text. Icons anchor to top-right.
            <code>Ctrl/Cmd+Enter</code> confirms, <code>Escape</code> resets.
          </p>
        </div>

        <!-- CopyField -->
        <div class="flex flex-col gap-xs">
          <label for="copy-field" class="text-small px-xs">CopyField</label>
          <CopyField id="copy-field" value={copyValue} />
          <p class="text-caption text-mute px-xs">
            Always readonly. Copy icon shows checkmark feedback for 2 seconds
            after copying to clipboard.
          </p>
        </div>

        <!-- GenerateField -->
        <div class="flex flex-col gap-xs">
          <label for="generate-field" class="text-small px-xs"
            >GenerateField</label
          >
          <GenerateField
            id="generate-field"
            bind:value={generateValue}
            placeholder="Project title..."
            instructions="Generate a catchy project title for a SaaS product"
            ongenerate={mockGenerate}
          />
          <p class="text-caption text-mute px-xs">
            Always editable. Click Sparkle to trigger AI generation. Input shows
            shimmer during loading. <code>Escape</code> aborts without closing a
            parent modal or sidebar.
          </p>
        </div>

        <!-- GenerateTextarea -->
        <div class="flex flex-col gap-xs">
          <label for="generate-textarea" class="text-small px-xs"
            >GenerateTextarea</label
          >
          <GenerateTextarea
            id="generate-textarea"
            bind:value={generateTextareaValue}
            placeholder="Describe your project..."
            instructions="Generate a professional project description"
            ongenerate={mockGenerate}
            rows={4}
          />
          <p class="text-caption text-mute px-xs">
            Textarea variant. Same sparkle/shimmer/abort behavior, with Escape
            intercepted before parent layers dismiss. Icons anchor to top-right.
          </p>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import SearchField from './ui/SearchField.svelte';
  import &#123; createPasswordValidation &#125; from '@lib/password-validation.svelte';
  import PasswordField from './ui/PasswordField.svelte';
  import PasswordMeter from './ui/PasswordMeter.svelte';
  import PasswordChecklist from './ui/PasswordChecklist.svelte';
  import FormField from './ui/FormField.svelte';
  import EditField from './ui/EditField.svelte';
  import EditTextarea from './ui/EditTextarea.svelte';
  import CopyField from './ui/CopyField.svelte';
  import GenerateField from './ui/GenerateField.svelte';
  import GenerateTextarea from './ui/GenerateTextarea.svelte';

  let password = $state('');
  let confirm = $state('');

  const pv = createPasswordValidation(
    () =&gt; password,
    () =&gt; confirm,
    &#123; requireConfirm: true &#125;,
  );
&lt;/script&gt;

&lt;SearchField
  bind:value=&#123;query&#125;
  placeholder="Search..."
  onsubmit=&#123;(v) =&gt; console.log(v)&#125;
/&gt;

&lt;FormField error=&#123;pv.error&#125;&gt;
  &#123;#snippet children(&#123; fieldId, descriptionId, invalid &#125;)&#125;
    &lt;PasswordField
      id=&#123;fieldId&#125;
      bind:value=&#123;password&#125;
      &#123;invalid&#125;
      describedby=&#123;descriptionId&#125;
      autocomplete="new-password"
    /&gt;
  &#123;/snippet&#125;
&lt;/FormField&gt;
&lt;PasswordMeter password=&#123;password&#125; validation=&#123;pv&#125; /&gt;
&lt;PasswordChecklist password=&#123;password&#125; validation=&#123;pv&#125; /&gt;
&lt;PasswordField bind:value=&#123;confirm&#125; autocomplete="new-password" /&gt;
&lt;button disabled=&#123;!pv.isValid&#125;&gt;Submit&lt;/button&gt;

&lt;EditField
  bind:value=&#123;name&#125;
  placeholder="Identifier..."
  onconfirm=&#123;(v) =&gt; save(v)&#125;
/&gt;

&lt;EditTextarea
  bind:value=&#123;notes&#125;
  placeholder="Notes..."
  rows=&#123;4&#125;
  onconfirm=&#123;(v) =&gt; save(v)&#125;
/&gt;

&lt;CopyField value="sk-secret-key-here" /&gt;

&lt;GenerateField
  bind:value=&#123;title&#125;
  placeholder="Project title..."
  instructions="Generate a catchy title"
  ongenerate=&#123;generateText&#125;
/&gt;

&lt;GenerateTextarea
  bind:value=&#123;bio&#125;
  placeholder="About..."
  instructions="Generate a professional bio"
  ongenerate=&#123;generateText&#125;
  rows=&#123;4&#125;
/&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        <strong>SearchField</strong> &mdash; <code>value</code> (bindable),
        <code>placeholder</code>, <code>zoom</code> ("in" | "out"),
        <code>autocomplete</code> (default "off"),
        <code>onsubmit</code>, <code>oninput</code>.
        <strong>PasswordField</strong> &mdash; <code>value</code> (bindable),
        <code>placeholder</code>, <code>invalid</code>,
        <code>describedby</code>,
        <code>autocomplete</code> (default "current-password").
        <strong>PasswordMeter</strong> &mdash; <code>password</code> (string),
        <code>validation</code> (PasswordValidationState). Hidden when empty.
        Four levels: Weak, Fair, Good, Strong.
        <strong>PasswordChecklist</strong> &mdash; <code>password</code>
        (string),
        <code>validation</code> (PasswordValidationState). Hidden when empty.
        <strong>EditField</strong> &mdash; <code>value</code> (bindable),
        <code>placeholder</code>, <code>autocomplete</code>,
        <code>onconfirm</code>.
        <strong>EditTextarea</strong> &mdash; <code>value</code> (bindable),
        <code>placeholder</code>, <code>rows</code> (number),
        <code>onconfirm</code>. Ctrl/Cmd+Enter confirms.
        <strong>CopyField</strong> &mdash; <code>value</code> (readonly string).
        <strong>GenerateField</strong> &mdash; <code>value</code> (bindable),
        <code>placeholder</code>, <code>instructions</code> (AI prompt context),
        <code>ongenerate</code> (async handler).
        <strong>GenerateTextarea</strong> &mdash; same as GenerateField plus
        <code>rows</code> (number). All accept <code>id</code>,
        <code>disabled</code>, and
        <code>class</code>.
      </p>
    </div>

    <!-- ─── SLIDER FIELD ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Slider Field</h5>
      <p class="text-small text-mute">
        A range slider with optional preset snap points. When presets are
        provided, the slider locks to those values only &mdash; like a visual
        <code>&lt;select&gt;</code>. Without presets it degrades to a plain
        labeled range input. Works at any scale: 3 presets or 7.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <!-- 3 presets — classic small set -->
        <div class="flex flex-col gap-xs">
          <SliderField
            bind:value={renderQuality}
            label="Render Quality"
            presets={renderQualityPresets}
            onchange={(v) => toast.show(`Quality: ${v}`, 'info')}
          />
          <p class="text-caption text-mute px-xs">
            Three presets. Active label highlights in
            <code>--energy-primary</code>.
          </p>
        </div>

        <!-- 6 presets — medium scale, non-integer values -->
        <div class="flex flex-col gap-xs">
          <SliderField
            bind:value={playbackSpeed}
            label="Playback Speed"
            presets={playbackSpeedPresets}
            onchange={(v) => toast.show(`Speed: ${v}×`, 'info')}
          />
          <p class="text-caption text-mute px-xs">
            Six presets with non-integer values. Labels compress gracefully.
          </p>
        </div>

        <!-- No presets — plain labeled slider -->
        <div class="flex flex-col gap-xs">
          <SliderField
            bind:value={plainValue}
            label="Plain Slider (no presets)"
            min={0}
            max={100}
          />
          <p class="text-caption text-mute px-xs">
            Without presets, degrades to a labeled native
            <code>&lt;input type="range"&gt;</code>.
          </p>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import SliderField from './ui/SliderField.svelte';

  let quality = $state(50);
  const presets = [
    &#123; label: 'MIN', value: 0 &#125;,
    &#123; label: 'STANDARD', value: 50 &#125;,
    &#123; label: 'MAX', value: 100 &#125;,
  ];
&lt;/script&gt;

&lt;!-- With presets: locks to preset values --&gt;
&lt;SliderField bind:value=&#123;quality&#125; label="Quality" presets=&#123;presets&#125; /&gt;

&lt;!-- Without presets: plain continuous range --&gt;
&lt;SliderField bind:value=&#123;volume&#125; label="Volume" /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>value</code> (bindable), <code>presets</code> (Preset[]
        &mdash; label/value pairs; locks slider to preset values),
        <code>min</code>, <code>max</code>, <code>step</code> (ignored when
        presets are provided), <code>label</code>, <code>onchange</code>,
        <code>disabled</code>, <code>class</code>. Presets should be sorted
        ascending by value.
      </p>
    </div>

    <!-- ─── MEDIA CONTROLS ───────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Media Controls</h5>
      <p class="text-small text-mute">
        Horizontal control bars for audio and media. The mute toggle uses
        <code>data-muted</code> to cross out the icon and dim the slider. The
        play/pause icon cross-fades smoothly via <code>data-paused</code>.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <!-- Voice Slider -->
        <div class="flex flex-col gap-xs">
          <label for="voice-slider" class="text-small px-xs"
            >MediaSlider — Voice</label
          >
          <MediaSlider
            bind:volume
            bind:muted={voiceMuted}
            bind:paused={voicePaused}
            icon="voice"
            playback
            replay
            onreplay={() => toast.show('Voice replay triggered', 'info')}
          />
          <p class="text-caption text-mute px-xs">
            Voice icon with mute toggle, range slider, pause/play toggle, and
            replay button.
          </p>
        </div>

        <!-- Music Slider -->
        <div class="flex flex-col gap-xs">
          <label for="music-slider" class="text-small px-xs"
            >MediaSlider — Music</label
          >
          <MediaSlider
            bind:volume={musicVolume}
            bind:muted={musicMuted}
            bind:paused={musicPaused}
            icon="music"
            playback
          />
          <p class="text-caption text-mute px-xs">
            Music icon variant with <code>playback</code> enabled, no replay.
          </p>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import MediaSlider from './ui/MediaSlider.svelte';
  let volume = $state(65);
  let muted = $state(false);
  let paused = $state(false);
&lt;/script&gt;

&lt;MediaSlider bind:volume bind:muted bind:paused icon="voice" playback replay /&gt;
&lt;MediaSlider bind:volume bind:muted bind:paused icon="music" playback /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>volume</code> (bindable), <code>muted</code> (bindable),
        <code>icon</code> ("voice" | "music"), <code>playback</code> (boolean),
        <code>paused</code> (bindable), <code>replay</code> (boolean),
        <code>onchange</code>, <code>onmute</code>, <code>onpause</code>,
        <code>onreplay</code> (callbacks).
      </p>
    </div>

    <!-- ─── ACTION BUTTON ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Action Button</h5>
      <p class="text-small text-mute">
        <code>ActionBtn</code> composes any interactive icon with a text label.
        The button's hover state drives the icon animation via
        <code>data-state</code> forwarding. Pass any
        <code>btn-*</code> variant class to change the visual style.
      </p>

      <div class="surface-sunk p-md flex justify-center">
        <ActionBtn
          icon={activeIcon}
          text={activeLabel}
          class={selectedVariant}
          onclick={() => toast.show(`${selectedIcon} triggered`, 'info')}
        />
      </div>

      <p class="text-small text-mute">
        Try different icon and style combinations. Hover the button to see the
        icon animate.
      </p>

      <div class="flex flex-col gap-md small-desktop:flex-row">
        <Selector
          bind:value={selectedIcon}
          options={iconList}
          id="action-icon"
          label="Icon"
          class="flex-1"
        />
        <Selector
          bind:value={selectedVariant}
          options={variantList}
          id="action-variant"
          label="Variant"
          class="flex-1"
        />
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import ActionBtn from './ui/ActionBtn.svelte';
  import PlayPause from './icons/PlayPause.svelte';
&lt;/script&gt;

&lt;!-- Default --&gt;
&lt;ActionBtn icon=&#123;PlayPause&#125; text="Play" onclick=&#123;handler&#125; /&gt;

&lt;!-- With variant --&gt;
&lt;ActionBtn icon=&#123;PlayPause&#125; text="Play" class="btn-cta" /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>icon</code> (Component), <code>text</code> (label),
        <code>class</code> (btn-* variant). All native button attributes pass through.
      </p>
    </div>

    <!-- ─── ICON BUTTON ────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Icon Button</h5>
      <p class="text-small text-mute">
        <code>IconBtn</code> is a circular icon-only button (<code
          >.btn-icon</code
        >) that forwards hover state to the icon via <code>data-state</code>. It
        encapsulates the hover tracking boilerplate — no manual
        <code>onpointerenter</code>/<code>onpointerleave</code> needed. Compare
        with <code>ActionBtn</code> which adds a text label and styled button variants.
      </p>

      <div class="surface-sunk p-md flex justify-center items-center gap-md">
        <IconBtn
          icon={PlayPause}
          iconProps={{ 'data-paused': !playing }}
          onclick={() => {
            playing = !playing;
            toast.show(playing ? 'Playing' : 'Paused', 'info');
          }}
          aria-label={playing ? 'Pause' : 'Play'}
        />
        <IconBtn
          icon={Refresh}
          onclick={() => toast.show('Refresh triggered', 'info')}
          aria-label="Refresh"
        />
        <IconBtn
          icon={Remove}
          onclick={() => toast.show('Remove triggered', 'info')}
          aria-label="Remove"
        />
        <IconBtn
          icon={Undo}
          onclick={() => toast.show('Undo triggered', 'info')}
          aria-label="Undo"
        />
        <IconBtn
          icon={Sort}
          onclick={() => toast.show('Sort triggered', 'info')}
          aria-label="Sort"
        />
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import IconBtn from './ui/IconBtn.svelte';
  import Refresh from './icons/Refresh.svelte';
&lt;/script&gt;

&lt;IconBtn icon=&#123;Refresh&#125; aria-label="Refresh" /&gt;
&lt;IconBtn icon=&#123;Refresh&#125; size="xl" onclick=&#123;handler&#125; /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>icon</code> (Component),
        <code>size</code> (icon size scale, default <code>lg</code>),
        <code>class</code> (additional classes). All native button attributes
        pass through (<code>onclick</code>,
        <code>disabled</code>, <code>aria-*</code>).
      </p>
    </div>

    <!-- ─── THEME BUTTON ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Theme Button</h5>
      <p class="text-small text-mute">
        <code>ThemesBtn</code> combines a Lucide Moon/Sun icon with a button
        that opens the theme modal. The icon switches reactively based on the
        current color mode. Supports a labeled variant (default) and an
        icon-only variant via the <code>icon</code> prop.
      </p>

      <div class="surface-sunk p-md flex justify-center items-center gap-md">
        <ThemesBtn />
        <ThemesBtn icon size="xl" />
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import ThemesBtn from './ui/ThemesBtn.svelte';
&lt;/script&gt;

&lt;!-- Labeled button (default) --&gt;
&lt;ThemesBtn /&gt;

&lt;!-- Icon-only --&gt;
&lt;ThemesBtn icon size="xl" /&gt;

&lt;!-- With variant class --&gt;
&lt;ThemesBtn class="btn-cta" /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>icon</code> (boolean — icon-only mode),
        <code>size</code> (icon size scale), <code>class</code> (style variants).
      </p>
    </div>

    <!-- ─── SETTINGS ROW ────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Settings Row</h5>
      <p class="text-small text-mute">
        <code>SettingsRow</code> is a label + content layout for settings panels.
        On desktop it renders as a two-column grid (label left, controls right);
        on mobile it stacks vertically. Used throughout the Settings modal and the
        intro page sandbox.
      </p>

      <div class="flex flex-col gap-md">
        <hr />

        <SettingsRow label="Notifications">
          <Toggle
            bind:checked={notificationsEnabled}
            id="settings-notifications"
            label={notificationsEnabled ? 'Enabled' : 'Disabled'}
          />
        </SettingsRow>

        <hr />

        <SettingsRow label="Density">
          <Selector
            bind:value={settingsLayout}
            options={layoutOptions}
            id="settings-layout"
          />
        </SettingsRow>

        <hr />

        <SettingsRow label="Actions">
          <div class="flex flex-row gap-md">
            <button onclick={() => toast.show('Settings exported', 'success')}>
              Export
            </button>
            <button
              class="btn-error"
              onclick={() => toast.show('Settings reset', 'warning')}
            >
              Reset
            </button>
          </div>
        </SettingsRow>

        <hr />
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import SettingsRow from './ui/SettingsRow.svelte';
  import Toggle from './ui/Toggle.svelte';
  import Selector from './ui/Selector.svelte';
&lt;/script&gt;

&lt;SettingsRow label="Notifications"&gt;
  &lt;Toggle bind:checked label="Enabled" /&gt;
&lt;/SettingsRow&gt;

&lt;SettingsRow label="Density"&gt;
  &lt;Selector bind:value options=&#123;layoutOptions&#125; /&gt;
&lt;/SettingsRow&gt;

&lt;SettingsRow label="Actions"&gt;
  &lt;button&gt;Export&lt;/button&gt;
  &lt;button class="btn-error"&gt;Reset&lt;/button&gt;
&lt;/SettingsRow&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>label</code> (string &mdash; left column heading). Content
        is passed as a Svelte snippet (slot). The label column is
        <code>12rem</code> wide on desktop.
      </p>
    </div>
  </div>
</section>
