<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { toast } from '@stores/toast.svelte';
</script>

<section id="modals" class="flex flex-col gap-md">
  <h2>10 // MODALS & DIALOGS</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Dialogs for confirmations, alerts, and complex interactions. Focus is
      trapped inside the modal and restored on close. Three sizes (small,
      medium, large) adapt to content complexity. Built-in convenience methods
      handle the most common patterns &mdash; alerts, confirms with cost badges,
      theme selection, and settings panels.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Modals use the native <code>&lt;dialog&gt;</code> element managed by the
        <code>modal</code> singleton. Opening captures the trigger element's
        focus; closing restores it. The dialog uses
        <code>glass-float</code> + <code>glass-blur</code> physics and
        transitions via CSS <code>@starting-style</code>. Three sizes:
        <code>sm</code>, <code>md</code>, <code>lg</code>.
      </p>
    </details>

    <!-- ALERT -->
    <div class="flex flex-col gap-sm">
      <h5>Alert</h5>
      <p class="text-small text-mute">
        <code>modal.alert(title, body)</code> opens a small informational dialog
        with a single acknowledge button. The body supports HTML. Size defaults
        to <code>sm</code>.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
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
    <div class="flex flex-col gap-sm">
      <h5>Confirm</h5>
      <p class="text-small text-mute">
        <code>modal.confirm(title, body, actions)</code> opens a dialog with
        confirm and cancel buttons. Supports an optional <code>cost</code>
        badge displayed on the confirm button via tooltip. Size defaults to
        <code>md</code>.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
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
          class="btn-error"
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
    <div class="flex flex-col gap-sm">
      <h5>Themes & Settings</h5>
      <p class="text-small text-mute">
        Convenience methods for built-in modals. <code>modal.themes()</code>
        opens the atmosphere/theme selector. <code>modal.settings()</code>
        opens the display preferences panel. Both use the <code>lg</code> size.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button onclick={() => modal.themes()}> Themes </button>
        <button onclick={() => modal.settings()}> Settings </button>
      </div>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >import &#123; modal &#125; from '@lib/modal-manager.svelte';

// Alert (informational, sm size)
modal.alert('Title', 'Body text supports &lt;strong&gt;HTML&lt;/strong&gt;.');

// Confirm (with callbacks, md size)
modal.confirm('Delete Item?', 'This cannot be undone.', &#123;
  onConfirm: () =&gt; handleDelete(),
  onCancel: () =&gt; console.log('Cancelled'),
  cost: 500,  // optional badge on confirm button
&#125;);

// Built-in modals (lg size)
modal.themes();
modal.settings();

// Custom modal via registry
modal.open('my-fragment', &#123; prop: value &#125;, 'md');
modal.close();</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Custom modal fragments are registered in
      <code>src/config/modal-registry.ts</code>. Add new fragments there to
      extend the modal system with project-specific dialogs.
    </p>
  </div>
</section>
