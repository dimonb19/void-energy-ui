<script lang="ts">
  import { toast } from '@stores/toast.svelte';

  function triggerLoading() {
    const loader = toast.loading('Processing request...');

    setTimeout(() => loader.update('Validating payload...'), 1000);
    setTimeout(() => loader.success('Operation complete'), 2500);
  }

  function triggerLoadingError() {
    const loader = toast.loading('Connecting to server...');

    setTimeout(() => loader.error('Connection timed out'), 2000);
  }

  function triggerLoadingWarning() {
    const loader = toast.loading('Syncing data...');

    setTimeout(() => loader.update('Partial response received...'), 1000);
    setTimeout(
      () => loader.warning('Sync completed with warnings — 3 items skipped'),
      2500,
    );
  }

  function triggerClearAll() {
    toast.show('Reactor 1 online', 'info');
    setTimeout(() => toast.show('Reactor 2 online', 'success'), 200);
    setTimeout(() => toast.show('Reactor 3 standby', 'warning'), 400);
  }

  function triggerPromise() {
    const fakeRequest = new Promise<string>((resolve) =>
      setTimeout(() => resolve('42 records'), 2000),
    );

    toast
      .promise(fakeRequest, {
        loading: 'Fetching data...',
        success: (data) => `Loaded ${data}`,
        error: 'Failed to fetch',
      })
      .catch(() => {});
  }
</script>

<section id="toasts" class="flex flex-col gap-md">
  <h2>14 // TOASTS</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Non-blocking notifications for success, error, warning, and informational
      feedback. Toasts appear, deliver the message, and auto-dismiss. A loading
      variant tracks async operations with real-time status updates and
      automatic success/error resolution. Toasts can also carry inline action
      buttons for "undo over confirmation" workflows.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Toast notifications use the <code>toast</code> singleton for ephemeral
        feedback. Four semantic types map to accent colors:
        <code>info</code> (system), <code>success</code>, <code>error</code>,
        and <code>warning</code>. The <code>loading</code> type persists until
        explicitly resolved. Toasts auto-dismiss after 4 seconds by default. Any
        toast can carry an optional <code>action</code> button; the
        <code>toast.undo()</code> convenience method wraps this pattern with a 6-second
        window.
      </p>
    </details>

    <!-- BASIC TYPES -->
    <div class="flex flex-col gap-md">
      <h5>Semantic Types</h5>
      <p class="text-small text-mute">
        Each type sets the border, background blend, and icon color via the
        <code>--toast-accent</code> variable. Click to trigger each type.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button onclick={() => toast.show('Telemetry sync active', 'info')}>
          Info
        </button>
        <button
          class="btn-success"
          onclick={() => toast.show('Module deployed successfully', 'success')}
        >
          Success
        </button>
        <button
          class="btn-error"
          onclick={() => toast.show('Core temperature critical', 'error')}
        >
          Error
        </button>
        <button
          class="btn-premium"
          onclick={() => toast.show('Energy reserves below 20%', 'warning')}
        >
          Warning
        </button>
      </div>

      <p class="text-caption text-mute px-xs">
        Warning toasts use the Premium accent color &mdash; both signal
        &ldquo;pay attention&rdquo; and share the same visual weight.
      </p>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="flex flex-col gap-md">
      <h5>Action Buttons</h5>
      <p class="text-small text-mute">
        Toasts can include an inline action button for "undo over confirmation"
        patterns. The <code>toast.undo()</code> convenience method shows a success
        toast with an Undo button that fires a callback when clicked.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button
          class="btn-success"
          onclick={() =>
            toast.undo('Item deleted', () =>
              toast.show('Item restored', 'success'),
            )}
        >
          Undo Toast
        </button>
        <button
          onclick={() =>
            toast.show('File uploaded', 'success', 5000, {
              label: 'View',
              onclick: () => toast.show('Navigating to files...', 'info'),
            })}
        >
          Action Toast
        </button>
      </div>

      <p class="text-caption text-mute px-xs">
        Click the action button inside the toast to trigger the callback. Use
        the X button to dismiss a toast early, or wait for auto-dismiss.
      </p>
    </div>

    <!-- LONG MESSAGES -->
    <div class="flex flex-col gap-md">
      <h5>Long Messages</h5>
      <p class="text-small text-mute">
        Toasts gracefully handle longer content. The capsule stretches
        horizontally to fit, capped by the region&rsquo;s max-width.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button
          onclick={() =>
            toast.show(
              'Your session will expire in 5 minutes due to inactivity. Save your work to avoid losing unsaved changes.',
              'warning',
            )}
        >
          Warning
        </button>
        <button
          class="btn-error"
          onclick={() =>
            toast.show(
              'Failed to save document — the server returned a 503 error. Please check your connection and try again.',
              'error',
            )}
        >
          Error
        </button>
        <button
          class="btn-success"
          onclick={() =>
            toast.undo(
              '3 items moved to trash. This action will be permanent after 30 days.',
              () => toast.show('Items restored', 'success'),
            )}
        >
          Undo
        </button>
      </div>

      <p class="text-caption text-mute px-xs">
        Keep messages concise when possible, but longer text is fully supported
        for cases that need additional context.
      </p>
    </div>

    <!-- LOADING CONTROLLER -->
    <div class="flex flex-col gap-md">
      <h5>Loading Controller</h5>
      <p class="text-small text-mute">
        <code>toast.loading()</code> returns a controller with
        <code>.update()</code>, <code>.success()</code>,
        <code>.error()</code>, <code>.warning()</code>, and
        <code>.close()</code>. The toast persists until a terminal method is
        called.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button class="btn-success" onclick={triggerLoading}>
          Loading &rarr; Success
        </button>
        <button class="btn-error" onclick={triggerLoadingError}>
          Loading &rarr; Error
        </button>
        <button class="btn-premium" onclick={triggerLoadingWarning}>
          Loading &rarr; Warning
        </button>
      </div>

      <p class="text-caption text-mute px-xs">
        Each button demonstrates a different resolution path. The loading toast
        persists until a terminal method (<code>.success()</code>,
        <code>.error()</code>, or <code>.warning()</code>) is called.
      </p>
    </div>

    <!-- PROMISE WRAPPER -->
    <div class="flex flex-col gap-md">
      <h5>Promise Wrapper</h5>
      <p class="text-small text-mute">
        <code>toast.promise()</code> wraps any <code>Promise</code> with automatic
        loading &rarr; success/error transitions. The success message can be a function
        that receives the resolved value.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button onclick={triggerPromise}> toast.promise() </button>
      </div>
    </div>

    <!-- CLEAR ALL -->
    <div class="flex flex-col gap-md">
      <h5>Clear All</h5>
      <p class="text-small text-mute">
        <code>toast.clearAll()</code> removes every active toast at once. Click &ldquo;Stack
        Toasts&rdquo; to fire several in quick succession, then &ldquo;Clear All&rdquo;
        to sweep them away.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button onclick={triggerClearAll}> Stack Toasts </button>
        <button class="btn-ghost btn-error" onclick={() => toast.clearAll()}>
          Clear All
        </button>
      </div>

      <p class="text-caption text-mute px-xs">
        Useful for page transitions or state resets where stale notifications
        should not persist.
      </p>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >import &#123; toast &#125; from '@stores/toast.svelte';

// Basic toast
toast.show('File saved', 'success');
toast.show('Connection lost', 'error');

// Loading with controller
const loader = toast.loading('Uploading...');
loader.update('Processing...');
loader.success('Upload complete');
// or: loader.error('Upload failed');

// Promise wrapper (auto loading &rarr; result)
toast.promise(fetchData(), &#123;
  loading: 'Fetching data...',
  success: (data) =&gt; `Loaded $&#123;data.length&#125; items`,
  error: 'Failed to fetch',
&#125;);

// Undo pattern
toast.undo('Item deleted', () =&gt; restoreItem(backup));

// Generic action button
toast.show('File uploaded', 'success', 5000, &#123;
  label: 'View',
  onclick: () =&gt; navigateTo('/files'),
&#125;);

// Utility
toast.close(id);   // Remove specific toast
toast.clearAll();  // Remove all toasts</code
        ></pre>
    </details>
  </div>
</section>
