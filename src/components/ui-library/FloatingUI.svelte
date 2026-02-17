<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import { tooltip } from '@actions/tooltip';
  import Dropdown from '../ui/Dropdown.svelte';
  import { ChevronDown, Settings, Bell, Filter } from '@lucide/svelte';

  let controlledOpen = $state(false);
</script>

<section class="flex flex-col gap-md mt-md">
  <h2>06 // FLOATING UI</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Both <code>Dropdown</code> and <code>use:tooltip</code> share the same
      foundation: the <b>Popover API</b> for top-layer positioning and
      <code>@floating-ui/dom</code> for smart placement with flip and shift.
      Dropdown is a declarative Svelte component (click-triggered, arbitrary
      content). Tooltip is an imperative Svelte action (hover/focus-triggered,
      text-only). Physics come from
      <code>_dropdown.scss</code> and <code>_tooltips.scss</code> respectively &mdash;
      both use glass-float, glass-blur, and spring transitions.
    </p>

    <hr />

    <h4>Dropdown</h4>

    <!-- ─── BASIC USAGE ──────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Basic Usage</h5>
      <p class="text-small text-mute">
        A simple dropdown with a text trigger and arbitrary panel content. Click
        the trigger to open, click outside or press <code>Escape</code> to close.
      </p>

      <div class="surface-sunk p-md flex flex-row gap-md justify-center">
        <Dropdown label="Options menu">
          {#snippet trigger()}
            <span class="flex items-center gap-xs">
              Options <ChevronDown class="icon" data-size="sm" />
            </span>
          {/snippet}
          <div class="flex flex-col gap-xs p-md">
            <button
              class="btn-ghost"
              onclick={() => toast.show('Edit selected', 'info')}
            >
              Edit
            </button>
            <button
              class="btn-ghost"
              onclick={() => toast.show('Duplicated', 'success')}
            >
              Duplicate
            </button>
            <button
              class="btn-ghost btn-alert"
              onclick={() => toast.show('Deleted', 'error')}
            >
              Delete
            </button>
          </div>
        </Dropdown>
      </div>
    </div>

    <!-- ─── PLACEMENT VARIANTS ───────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Placement</h5>
      <p class="text-small text-mute">
        The <code>placement</code> prop controls where the panel appears relative
        to the trigger. Floating UI automatically flips when there isn't enough space.
      </p>

      <div
        class="surface-sunk p-md flex flex-row flex-wrap gap-md justify-center"
      >
        <Dropdown label="Bottom start" placement="bottom-start">
          {#snippet trigger()}
            <span class="flex items-center gap-xs">
              bottom-start <ChevronDown class="icon" data-size="sm" />
            </span>
          {/snippet}
          <p class="p-md text-small">Default placement</p>
        </Dropdown>

        <Dropdown label="Bottom end" placement="bottom-end">
          {#snippet trigger()}
            <span class="flex items-center gap-xs">
              bottom-end <ChevronDown class="icon" data-size="sm" />
            </span>
          {/snippet}
          <p class="p-md text-small">Right-aligned panel</p>
        </Dropdown>

        <Dropdown label="Top start" placement="top-start">
          {#snippet trigger()}
            <span class="flex items-center gap-xs">
              top-start <ChevronDown class="icon" data-size="sm" />
            </span>
          {/snippet}
          <p class="p-md text-small">Opens above the trigger</p>
        </Dropdown>
      </div>

      <p class="text-caption text-mute px-xs">
        Props: <code>placement="bottom-start"</code>,
        <code>placement="bottom-end"</code>,
        <code>placement="top-start"</code>
      </p>
    </div>

    <!-- ─── CONTROLLED STATE ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Controlled State</h5>
      <p class="text-small text-mute">
        Use <code>bind:open</code> to control the dropdown programmatically. The
        <code>onchange</code> callback fires when the state changes.
      </p>

      <div
        class="surface-sunk p-md flex flex-row flex-wrap gap-md justify-center items-center"
      >
        <Dropdown
          label="Controlled dropdown"
          bind:open={controlledOpen}
          onchange={(isOpen) =>
            toast.show(isOpen ? 'Opened' : 'Closed', 'info')}
        >
          {#snippet trigger()}
            <span class="flex items-center gap-xs">
              Controlled <ChevronDown class="icon" data-size="sm" />
            </span>
          {/snippet}
          <div class="p-md flex flex-col gap-xs">
            <p class="text-small">Panel content here.</p>
            <button
              class="btn-ghost"
              onclick={() => {
                controlledOpen = false;
              }}
            >
              Close from inside
            </button>
          </div>
        </Dropdown>

        <button
          onclick={() => {
            controlledOpen = true;
          }}
          disabled={controlledOpen}
        >
          Open externally
        </button>

        <p class="text-caption text-mute">
          State: <code>{controlledOpen ? 'open' : 'closed'}</code>
        </p>
      </div>

      <p class="text-caption text-mute px-xs">
        Props: <code>bind:open</code>, <code>onchange</code>
      </p>
    </div>

    <!-- ─── ICON TRIGGERS ────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Icon Triggers</h5>
      <p class="text-small text-mute">
        The trigger snippet accepts any content. Icon-only triggers work well
        for compact UI. Combine with <code>offset</code> to adjust spacing.
      </p>

      <div
        class="surface-sunk p-md flex flex-row flex-wrap gap-lg justify-center"
      >
        <Dropdown label="Settings" offset={8}>
          {#snippet trigger()}
            <Settings class="icon" />
          {/snippet}
          <div class="p-md flex flex-col gap-xs">
            <p class="text-small text-dim">Settings panel</p>
          </div>
        </Dropdown>

        <Dropdown label="Notifications" placement="bottom-end" offset={8}>
          {#snippet trigger()}
            <Bell class="icon" />
          {/snippet}
          <div class="p-md flex flex-col gap-xs">
            <p class="text-small text-dim">No new notifications</p>
          </div>
        </Dropdown>

        <Dropdown label="Filters" offset={8}>
          {#snippet trigger()}
            <Filter class="icon" />
          {/snippet}
          <div class="p-md flex flex-col gap-xs">
            <p class="text-small text-dim">Filter options</p>
          </div>
        </Dropdown>
      </div>

      <p class="text-caption text-mute px-xs">
        Props: <code>offset=&#123;4&#125;</code>
      </p>
    </div>

    <hr />

    <h4>Tooltip</h4>

    <!-- ─── TOOLTIP PLACEMENT ────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Placement</h5>
      <p class="text-small text-mute">
        The <code>use:tooltip</code> action accepts a string shorthand or an
        options object with <code>content</code> and <code>placement</code>.
        Hover or focus any element to trigger the tooltip. Default placement is
        <code>top</code>.
      </p>

      <div
        class="surface-sunk p-md flex flex-row flex-wrap gap-md justify-center"
      >
        <button use:tooltip={'Default (top)'}>Top</button>
        <button use:tooltip={{ content: 'Placed below', placement: 'bottom' }}>
          Bottom
        </button>
        <button use:tooltip={{ content: 'Placed left', placement: 'left' }}>
          Left
        </button>
        <button use:tooltip={{ content: 'Placed right', placement: 'right' }}>
          Right
        </button>
      </div>

      <p class="text-caption text-mute px-xs">
        Shorthand: <code>use:tooltip=&#123;'text'&#125;</code>. Options:
        <code>use:tooltip=&#123;&#123; content, placement &#125;&#125;</code>
      </p>
    </div>

    <!-- ─── TOOLTIP ON ELEMENTS ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>On Different Elements</h5>
      <p class="text-small text-mute">
        Tooltips work on any element. They show on <code>pointerenter</code> and
        <code>focus</code>, so keyboard users see tooltips when tabbing to
        focusable elements.
      </p>

      <div
        class="surface-sunk p-md flex flex-row flex-wrap gap-md justify-center items-center"
      >
        <button class="btn-cta" use:tooltip={'Tooltip on a CTA button'}>
          CTA Button
        </button>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <span
          class="flex gap-xs items-center text-dim cursor-help underline decoration-dashed"
          tabindex="0"
          use:tooltip={'Tooltip on a text span (focusable via tabindex)'}
        >
          Hover this text
        </span>
        <input
          type="text"
          placeholder="Focus me..."
          use:tooltip={{ content: 'Tooltip on an input', placement: 'bottom' }}
          class="max-w-[12rem]"
        />
      </div>

      <p class="text-caption text-mute px-xs">
        Triggers: <code>pointerenter</code> / <code>focus</code> (show),
        <code>pointerleave</code> / <code>blur</code> (hide)
      </p>
    </div>
  </div>
</section>
