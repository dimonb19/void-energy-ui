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
  <h2>10 // TOASTS</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Non-blocking notifications for success, error, warning, and informational
      feedback. Toasts appear, deliver the message, and auto-dismiss. A loading
      variant tracks async operations with real-time status updates and
      automatic success/error resolution.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Toast notifications use the <code>toast</code> singleton for ephemeral
        feedback. Four semantic types map to accent colors:
        <code>info</code> (system), <code>success</code>, <code>error</code>,
        and <code>warning</code>. The <code>loading</code> type persists until explicitly
        resolved. Toasts auto-dismiss after 4 seconds by default.
      </p>
    </details>

    <!-- BASIC TYPES -->
    <div class="flex flex-col gap-sm">
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

    <!-- LOADING CONTROLLER -->
    <div class="flex flex-col gap-sm">
      <h5>Loading Controller</h5>
      <p class="text-small text-mute">
        <code>toast.loading()</code> returns a controller with
        <code>.update()</code>, <code>.success()</code>,
        <code>.error()</code>, <code>.warning()</code>, and
        <code>.close()</code>. The toast persists until a terminal method is
        called.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <button onclick={triggerLoading}> Loading &rarr; Success </button>
        <button onclick={triggerLoadingError}> Loading &rarr; Error </button>
      </div>

      <p class="text-caption text-mute px-xs">
        The first button updates the message mid-flight, then resolves as
        success. The second resolves as error after a delay.
      </p>
    </div>

    <!-- PROMISE WRAPPER -->
    <div class="flex flex-col gap-sm">
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

// Utility
toast.close(id);   // Remove specific toast
toast.clearAll();  // Remove all toasts</code
        ></pre>
    </details>
  </div>
</section>
