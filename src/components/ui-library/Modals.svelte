<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { toast } from '@stores/toast.svelte';
  import { MODAL_KEYS } from '@config/modal-registry';
</script>

<section id="modals" class="flex flex-col gap-md">
  <h2>14 // MODALS & DIALOGS</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Dialogs for confirmations, alerts, and complex interactions. Focus is
      trapped inside the modal and restored on close. Four sizes (small, medium,
      large, full) adapt to content complexity. Built-in convenience methods
      handle the most common patterns &mdash; alerts, confirms with cost badges,
      theme selection, settings panels, keyboard shortcuts, and the command
      palette.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Modals use the native <code>&lt;dialog&gt;</code> element managed by the
        <code>modal</code> singleton. Opening captures the trigger element's
        focus; closing restores it. Escape dismissal is handled by the
        <code>layerStack</code> &mdash; if a dropdown is open above a modal,
        Escape closes the dropdown first. The dialog uses
        <code>glass-float</code> + <code>glass-blur</code> physics and
        transitions via CSS <code>@starting-style</code>. Four sizes:
        <code>sm</code>, <code>md</code>, <code>lg</code>,
        <code>full</code>.
      </p>
    </details>

    <!-- ALERT -->
    <div class="flex flex-col gap-md">
      <h5>Alert</h5>
      <p class="text-small text-mute">
        <code>modal.alert(title, body)</code> opens a small informational dialog
        with a single acknowledge button. The helper body is plain text. Use
        <code>modal.open(...)</code> with <code>bodyHtml</code> when trusted
        internal markup is required. Size defaults to <code>sm</code>.
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
            modal.open(
              MODAL_KEYS.ALERT,
              {
                title: 'Maintenance Window',
                bodyHtml:
                  'Scheduled downtime: <strong>02:00 — 04:00 UTC</strong>. Non-critical systems will be unavailable during this period.',
              },
              'sm',
            )}
        >
          Alert (trusted HTML)
        </button>
      </div>
    </div>

    <!-- CONFIRM -->
    <div class="flex flex-col gap-md">
      <h5>Confirm</h5>
      <p class="text-small text-mute">
        <code>modal.confirm(title, body, actions)</code> opens a dialog with
        confirm and cancel buttons. The helper body is plain text. Use
        <code>modal.open(...)</code> with <code>bodyHtml</code> for trusted
        internal markup. Supports an optional <code>cost</code> badge displayed
        on the confirm button via tooltip. Size defaults to <code>md</code>.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button
          onclick={() =>
            modal.confirm(
              'Purge Cache',
              'This will clear all cached data and force a full resync. Continue?',
              {
                onConfirm: () => toast.show('Cache purged', 'success'),
              },
            )}
        >
          Confirm
        </button>
        <button
          class="btn-premium"
          onclick={() =>
            modal.open(
              MODAL_KEYS.CONFIRM,
              {
                title: 'Delete Module',
                bodyHtml:
                  'This action is <strong>irreversible</strong>. The module and all associated data will be permanently removed.',
                onConfirm: () => toast.show('Module deleted', 'success'),
                cost: 150,
              },
              'md',
            )}
        >
          Confirm (trusted HTML)
        </button>
      </div>

      <p class="text-caption text-mute px-xs">
        Actions: <code>onConfirm</code> (required), <code>onCancel</code>
        (optional), <code>cost</code> (optional number shown as badge).
      </p>
    </div>

    <!-- THEMES & SETTINGS -->
    <div class="flex flex-col gap-md">
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

    <!-- COMMAND PALETTE & SHORTCUTS -->
    <div class="flex flex-col gap-md">
      <h5>Command Palette & Shortcuts</h5>
      <p class="text-small text-mute">
        <code>modal.palette()</code> opens a fuzzy-search command palette (<code
          >md</code
        >
        size). <code>modal.shortcuts()</code> opens a keyboard shortcut
        reference grouped by category (<code>sm</code> size). The command
        palette is also wired to <kbd>Cmd</kbd> + <kbd>K</kbd> /
        <kbd>Ctrl</kbd> + <kbd>K</kbd> globally.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button onclick={() => modal.palette()}> Command Palette </button>
        <button onclick={() => modal.shortcuts()}> Shortcuts </button>
      </div>

      <p class="text-caption text-mute px-xs">
        The shortcuts modal reads from <code>shortcutRegistry.entries</code>
        &mdash; any shortcut registered via the registry appears automatically.
      </p>
    </div>

    <!-- SIZE COMPARISON -->
    <div class="flex flex-col gap-md">
      <h5>Sizes</h5>
      <p class="text-small text-mute">
        Four dialog sizes control width: <code>sm</code> (alerts,
        confirmations), <code>md</code> (forms, selections),
        <code>lg</code> (complex panels), <code>full</code> (immersive
        experiences that fill the viewport). Pass the size as the third argument
        to <code>modal.open()</code>.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button
          onclick={() =>
            modal.open(
              MODAL_KEYS.ALERT,
              {
                title: 'Small Dialog',
                bodyHtml:
                  'This alert uses the <code>sm</code> size — compact, focused, minimal.',
              },
              'sm',
            )}
        >
          Small (sm)
        </button>
        <button
          onclick={() =>
            modal.open(
              MODAL_KEYS.ALERT,
              {
                title: 'Medium Dialog',
                bodyHtml:
                  'This alert uses the <code>md</code> size — the default for most interactions.',
              },
              'md',
            )}
        >
          Medium (md)
        </button>
        <button
          onclick={() =>
            modal.open(
              MODAL_KEYS.ALERT,
              {
                title: 'Large Dialog',
                bodyHtml:
                  'This alert uses the <code>lg</code> size — for complex panels with more content.',
              },
              'lg',
            )}
        >
          Large (lg)
        </button>
        <button
          onclick={() =>
            modal.open(
              MODAL_KEYS.ALERT,
              {
                title: 'Full Dialog',
                bodyHtml:
                  'This alert uses the <code>full</code> size — fills the viewport with safe area inset awareness. Use for immersive layouts like editors, galleries, or configuration wizards.',
              },
              'full',
            )}
        >
          Full (full)
        </button>
      </div>
    </div>

    <!-- CUSTOM FRAGMENTS -->
    <div class="flex flex-col gap-md">
      <h5>Custom Fragments</h5>
      <p class="text-small text-mute">
        Add your own modal content by creating a fragment component, registering
        it in the modal registry, and opening it via <code>modal.open()</code>.
        Three steps:
      </p>

      <details>
        <summary>View Pattern</summary>
        <pre><code
            >// 1. Create the fragment component
// src/components/modals/InviteFragment.svelte
&lt;script lang="ts"&gt;
  let &#123; email, onInvite &#125;: &#123;
    email: string;
    onInvite: (email: string) =&gt; void;
  &#125; = $props();
&lt;/script&gt;

&lt;div class="flex flex-col gap-lg p-xl"&gt;
  &lt;h2 id="modal-title"&gt;Invite User&lt;/h2&gt;
  &lt;p&gt;Send an invitation to &lt;strong&gt;&#123;email&#125;&lt;/strong&gt;&lt;/p&gt;
  &lt;div class="flex justify-end gap-md"&gt;
    &lt;button class="btn-ghost btn-error" onclick=&#123;() =&gt; modal.close()&#125;&gt;
      Cancel
    &lt;/button&gt;
    &lt;button class="btn-cta" onclick=&#123;() =&gt; onInvite(email)&#125;&gt;
      Send Invite
    &lt;/button&gt;
  &lt;/div&gt;
&lt;/div&gt;

// 2. Register in src/config/modal-registry.ts
import InviteFragment from '@components/modals/InviteFragment.svelte';

export const MODAL_KEYS = &#123;
  // ...existing keys
  INVITE: 'invite',
&#125; as const;

export const modalRegistry = &#123;
  // ...existing entries
  invite: InviteFragment,
&#125;;

// 3. Open from anywhere
modal.open(MODAL_KEYS.INVITE, &#123;
  email: 'user@example.com',
  onInvite: (email) =&gt; sendInvite(email),
&#125;, 'md');</code
          ></pre>
      </details>

      <p class="text-caption text-mute px-xs">
        Fragment props are type-checked via
        <code>ModalContract</code> in
        <code>src/types/modal.d.ts</code>. Add a matching entry there to get
        full type safety on <code>modal.open()</code> calls.
      </p>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >import &#123; modal &#125; from '@lib/modal-manager.svelte';
import &#123; MODAL_KEYS &#125; from '@config/modal-registry';

// Alert helper (informational, sm size, plain text only)
modal.alert('Title', 'Body text only.');

// Confirm (with callbacks, md size)
modal.confirm('Delete Item?', 'This cannot be undone.', &#123;
  onConfirm: () =&gt; handleDelete(),
  onCancel: () =&gt; console.log('Cancelled'),
  cost: 500,  // optional badge on confirm button
&#125;);

// Trusted HTML via low-level open
modal.open(MODAL_KEYS.ALERT, &#123;
  title: 'Title',
  bodyHtml: 'Trusted &lt;strong&gt;markup&lt;/strong&gt; only.',
&#125;, 'sm');

// Built-in modals
modal.themes();      // lg — atmosphere selector
modal.settings();    // lg — display preferences
modal.palette();     // md — Cmd+K command palette
modal.shortcuts();   // sm — keyboard shortcut reference

// Generic open (any registered fragment + explicit size)
modal.open(MODAL_KEYS.ALERT, &#123; title: '...', body: '...' &#125;, 'lg');
modal.close();</code
        ></pre>
    </details>
  </div>
</section>
