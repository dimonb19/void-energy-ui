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
    { value: 'btn-signal', label: 'Signal' },
    { value: 'btn-alert', label: 'Alert' },
  ];

  const btnLabel: Record<string, string> = {
    DoorIn: 'Sign In',
    DoorOut: 'Sign Out',
  };

  let selectedIcon = $state('Play');
  let selectedVariant = $state('');
  let activeIcon = $derived(iconMap[selectedIcon]);
  let activeLabel = $derived(btnLabel[selectedIcon] ?? selectedIcon);
</script>

<section class="flex flex-col gap-md mt-md">
  <h2>04 // COMPOSITES</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Composite components combine animated icons with native inputs and
      buttons. Input fields use the <code>.field</code> overlay pattern: icons
      are <strong>absolutely positioned</strong> inside the native input, which
      keeps its own <code>glass-sunk</code> styling untouched. Padding adjusts
      automatically via <code>:has()</code> selectors. Icons provide visual
      state feedback — rotation, checkmarks, cross-outs — driven by
      <code>data-state</code>
      and <code>data-muted</code>
      attributes.
    </p>

    <!-- ─── INPUT FIELDS ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
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
          <CopyField value={copyValue} />
          <p class="text-caption text-mute px-xs">
            Always readonly. Copy icon shows checkmark feedback for 2 seconds
            after copying to clipboard.
          </p>
        </div>
      </div>
    </div>

    <!-- ─── MEDIA CONTROLS ───────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
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
          icon={Play}
          onclick={() => toast.show('Play triggered', 'info')}
        />
        <IconBtn
          icon={Refresh}
          onclick={() => toast.show('Refresh triggered', 'info')}
        />
        <IconBtn
          icon={Remove}
          onclick={() => toast.show('Remove triggered', 'info')}
        />
        <IconBtn
          icon={Undo}
          onclick={() => toast.show('Undo triggered', 'info')}
        />
        <IconBtn
          icon={Sort}
          onclick={() => toast.show('Sort triggered', 'info')}
        />
      </div>

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

      <p class="text-caption text-mute px-xs">
        Props: <code>icon</code> (boolean — icon-only mode),
        <code>size</code> (icon size scale), <code>class</code> (style variants).
      </p>
    </div>
  </div>
</section>
