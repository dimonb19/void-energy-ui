<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { toast } from '@stores/toast.svelte';
</script>

<section class="flex flex-col gap-md mt-md">
  <h2>10 // MODALS & DIALOGS</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Modals use the native <code>&lt;dialog&gt;</code> element managed by the
      <code>modal</code> singleton. Opening captures the trigger element's
      focus; closing restores it. The dialog scales with
      <code>glass-float</code> + <code>glass-blur</code> physics and transitions
      via CSS <code>@starting-style</code>. Three sizes:
      <code>sm</code>, <code>md</code>, <code>lg</code>.
    </p>

    <!-- ALERT -->
    <div class="flex flex-col gap-xs">
      <h5>Alert</h5>
      <p class="text-small text-mute">
        <code>modal.alert(title, body)</code> opens a small informational dialog
        with a single acknowledge button. The body supports HTML. Size defaults
        to <code>sm</code>.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-sm">
        <button
          onclick={() =>
            modal.alert(
              'System Notice',
              'All subsystems are operating within normal parameters. No action required.',
            )}
        >
          Alert
        </button>
        <button
          onclick={() =>
            modal.alert(
              'Maintenance Window',
              'Scheduled downtime: <strong>02:00 — 04:00 UTC</strong>. Non-critical systems will be unavailable during this period.',
            )}
        >
          Alert (HTML body)
        </button>
      </div>
    </div>

    <!-- CONFIRM -->
    <div class="flex flex-col gap-xs">
      <h5>Confirm</h5>
      <p class="text-small text-mute">
        <code>modal.confirm(title, body, actions)</code> opens a dialog with
        confirm and cancel buttons. Supports an optional <code>cost</code>
        badge displayed on the confirm button via tooltip. Size defaults to
        <code>md</code>.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-sm">
        <button
          onclick={() =>
            modal.confirm(
              'Purge Cache',
              'This will clear all cached data and force a full resync. Continue?',
              {
                onConfirm: () => toast.show('Cache purged', 'success'),
                onCancel: () => toast.show('Cancelled', 'info'),
              },
            )}
        >
          Confirm
        </button>
        <button
          class="btn-alert"
          onclick={() =>
            modal.confirm(
              'Delete Module',
              'This action is <strong>irreversible</strong>. The module and all associated data will be permanently removed.',
              {
                onConfirm: () => toast.show('Module deleted', 'error'),
                cost: 150,
              },
            )}
        >
          Confirm (with cost)
        </button>
      </div>

      <p class="text-caption text-mute px-xs">
        Actions: <code>onConfirm</code> (required), <code>onCancel</code>
        (optional), <code>cost</code> (optional number shown as badge).
      </p>
    </div>

    <!-- THEMES & SETTINGS -->
    <div class="flex flex-col gap-xs">
      <h5>Themes & Settings</h5>
      <p class="text-small text-mute">
        Convenience methods for built-in modals. <code>modal.themes()</code>
        opens the atmosphere/theme selector. <code>modal.settings()</code>
        opens the display preferences demo. Both use the <code>lg</code> size.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-sm">
        <button onclick={() => modal.themes()}> Themes </button>
        <button onclick={() => modal.settings()}> Settings </button>
      </div>

      <p class="text-caption text-mute px-xs">
        API: <code>modal.open(key, props, size?)</code>,
        <code>modal.close()</code>,
        <code>modal.alert(title, body)</code>,
        <code>modal.confirm(title, body, actions)</code>,
        <code>modal.themes()</code>,
        <code>modal.settings(options?)</code>.
      </p>
    </div>
  </div>
</section>
