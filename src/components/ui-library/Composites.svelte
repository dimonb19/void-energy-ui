<script lang="ts">
  import { toast } from '@stores/toast.svelte';

  import SearchField from '../ui/SearchField.svelte';
  import PasswordField from '../ui/PasswordField.svelte';
  import EditField from '../ui/EditField.svelte';
  import CopyField from '../ui/CopyField.svelte';
  import MediaSlider from '../ui/MediaSlider.svelte';
  import type { Component } from 'svelte';
  import ActionBtn from '../ui/ActionBtn.svelte';
  import IconBtn from '../ui/IconBtn.svelte';
  import ThemesBtn from '../ui/ThemesBtn.svelte';
  import Selector from '../ui/Selector.svelte';
  import SettingsRow from '../ui/SettingsRow.svelte';
  import Toggle from '../ui/Toggle.svelte';

  import Play from '../icons/Play.svelte';
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
  let editValue = $state('VOID-7G-NEXUS');
  let copyValue = 'sk-void-4f8a-9c2e-7d1b-3e6f';

  // Demo state — Media Controls
  let volume = $state(65);
  let voiceMuted = $state(false);
  let musicVolume = $state(40);
  let musicMuted = $state(false);

  // ActionBtn interactive demo
  const iconMap: Record<string, Component> = {
    Play,
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
    { value: 'Play', label: 'Play' },
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

  let selectedIcon = $state('Play');
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
  <h2>07 // COMPOSITES</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
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
        keeps its own <code>glass-sunk</code> styling untouched. Padding adjusts
        automatically via <code>:has()</code> selectors. Icons provide visual
        state feedback &mdash; rotation, checkmarks, cross-outs &mdash; driven
        by <code>data-state</code> and <code>data-muted</code> attributes.
      </p>
    </details>

    <!-- ─── INPUT FIELDS ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Input Fields</h5>
      <p class="text-small text-mute">
        Each field wraps a native <code>&lt;input&gt;</code> inside a
        <code>.field</code> container. The input keeps all native styling (<code
          >glass-sunk</code
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
            Search icon rotates on focus. Enter key triggers
            <code>onsubmit</code>. Supports <code>zoom</code> variants.
          </p>
        </div>

        <!-- PasswordField -->
        <div class="flex flex-col gap-xs">
          <label for="password-field" class="text-small px-xs"
            >PasswordField</label
          >
          <PasswordField
            id="password-field"
            bind:value={passwordValue}
            placeholder="Enter access key..."
          />
          <p class="text-caption text-mute px-xs">
            Eye icon toggles visibility via <code>data-muted</code>. Input type
            switches between <code>password</code> and <code>text</code>.
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

        <!-- CopyField -->
        <div class="flex flex-col gap-xs">
          <label for="copy-field" class="text-small px-xs">CopyField</label>
          <CopyField id="copy-field" value={copyValue} />
          <p class="text-caption text-mute px-xs">
            Always readonly. Copy icon shows checkmark feedback for 2 seconds
            after copying to clipboard.
          </p>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import SearchField from './ui/SearchField.svelte';
  import PasswordField from './ui/PasswordField.svelte';
  import EditField from './ui/EditField.svelte';
  import CopyField from './ui/CopyField.svelte';
&lt;/script&gt;

&lt;SearchField
  bind:value=&#123;query&#125;
  placeholder="Search..."
  onsubmit=&#123;(v) =&gt; console.log(v)&#125;
/&gt;

&lt;PasswordField
  bind:value=&#123;password&#125;
  placeholder="Enter password..."
/&gt;

&lt;EditField
  bind:value=&#123;name&#125;
  placeholder="Identifier..."
  onconfirm=&#123;(v) =&gt; save(v)&#125;
/&gt;

&lt;CopyField value="sk-secret-key-here" /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        <strong>SearchField</strong> &mdash; <code>value</code> (bindable),
        <code>placeholder</code>, <code>zoom</code> ("in" | "out"),
        <code>onsubmit</code>, <code>oninput</code>.
        <strong>PasswordField</strong> &mdash; <code>value</code> (bindable),
        <code>placeholder</code>.
        <strong>EditField</strong> &mdash; <code>value</code> (bindable),
        <code>placeholder</code>, <code>onconfirm</code>.
        <strong>CopyField</strong> &mdash; <code>value</code> (readonly string).
        All accept <code>id</code>, <code>disabled</code>, and
        <code>class</code>.
      </p>
    </div>

    <!-- ─── MEDIA CONTROLS ───────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Media Controls</h5>
      <p class="text-small text-mute">
        Horizontal control bars for audio and media. The mute toggle uses
        <code>data-muted</code> to cross out the icon and dim the slider. The
        replay button animates on hover via <code>data-state</code>.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <!-- Voice Slider -->
        <div class="flex flex-col gap-xs">
          <label for="voice-slider" class="text-small px-xs"
            >MediaSlider — Voice</label
          >
          <MediaSlider
            bind:value={volume}
            bind:muted={voiceMuted}
            icon="voice"
            onreplay={() => toast.show('Voice replay triggered', 'info')}
          />
          <p class="text-caption text-mute px-xs">
            Voice icon with mute toggle, range slider, and replay button.
          </p>
        </div>

        <!-- Music Slider -->
        <div class="flex flex-col gap-xs">
          <label for="music-slider" class="text-small px-xs"
            >MediaSlider — Music</label
          >
          <MediaSlider
            bind:value={musicVolume}
            bind:muted={musicMuted}
            icon="music"
            replay={false}
          />
          <p class="text-caption text-mute px-xs">
            Music icon variant with <code>replay=false</code> to hide the replay
            button.
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
&lt;/script&gt;

&lt;MediaSlider bind:value=&#123;volume&#125; bind:muted icon="voice" /&gt;
&lt;MediaSlider bind:value=&#123;volume&#125; bind:muted icon="music" replay=&#123;false&#125; /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>value</code> (bindable), <code>muted</code> (bindable),
        <code>icon</code> ("voice" | "music"), <code>replay</code> (boolean),
        <code>onreplay</code> (callback).
      </p>
    </div>

    <!-- ─── ACTION BUTTON ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
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
  import Play from './icons/Play.svelte';
&lt;/script&gt;

&lt;!-- Default --&gt;
&lt;ActionBtn icon=&#123;Play&#125; text="Play" onclick=&#123;handler&#125; /&gt;

&lt;!-- With variant --&gt;
&lt;ActionBtn icon=&#123;Play&#125; text="Play" class="btn-cta" /&gt;</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Props: <code>icon</code> (Component), <code>text</code> (label),
        <code>class</code> (btn-* variant). All native button attributes pass through.
      </p>
    </div>

    <!-- ─── ICON BUTTON ────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
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
          icon={Play}
          onclick={() => toast.show('Play triggered', 'info')}
          aria-label="Play"
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
    <div class="flex flex-col gap-sm">
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
    <div class="flex flex-col gap-sm">
      <h5>Settings Row</h5>
      <p class="text-small text-mute">
        <code>SettingsRow</code> is a label + content layout for settings panels.
        On desktop it renders as a two-column grid (label left, controls right);
        on mobile it stacks vertically. Used throughout the Settings modal and the
        intro page sandbox.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
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
          <div class="flex flex-row gap-sm">
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
