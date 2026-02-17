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

<section class="flex flex-col gap-md mt-md">
  <h2>09 // TOASTS</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Toast notifications use the <code>toast</code> singleton for ephemeral
      feedback. Four semantic types map to accent colors:
      <code>info</code> (system), <code>success</code>, <code>error</code>, and
      <code>warning</code>. The <code>loading</code> type persists until explicitly
      resolved. Toasts auto-dismiss after 4 seconds by default. The toast region
      uses the Popover API and is positioned above all other layers.
    </p>

    <!-- BASIC TYPES -->
    <div class="flex flex-col gap-xs">
      <h5>Semantic Types</h5>
      <p class="text-small text-mute">
        Each type sets the border, background blend, and icon color via the
        <code>--toast-accent</code> variable. Click to trigger each type.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-sm">
        <button onclick={() => toast.show('Telemetry sync active', 'info')}>
          Info
        </button>
        <button
          class="btn-signal"
          onclick={() => toast.show('Module deployed successfully', 'success')}
        >
          Success
        </button>
        <button
          class="btn-alert"
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
    </div>

    <!-- LOADING CONTROLLER -->
    <div class="flex flex-col gap-xs">
      <h5>Loading Controller</h5>
      <p class="text-small text-mute">
        <code>toast.loading()</code> returns a controller with
        <code>.update()</code>, <code>.success()</code>,
        <code>.error()</code>, <code>.warning()</code>, and
        <code>.close()</code>. The toast persists until a terminal method is
        called.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-sm">
        <button onclick={triggerLoading}> Loading → Success </button>
        <button onclick={triggerLoadingError}> Loading → Error </button>
      </div>

      <p class="text-caption text-mute px-xs">
        The first button updates the message mid-flight, then resolves as
        success. The second resolves as error after a delay.
      </p>
    </div>

    <!-- PROMISE WRAPPER -->
    <div class="flex flex-col gap-xs">
      <h5>Promise Wrapper</h5>
      <p class="text-small text-mute">
        <code>toast.promise()</code> wraps any <code>Promise</code> with automatic
        loading → success/error transitions. The success message can be a function
        that receives the resolved value.
      </p>

      <div class="surface-sunk p-md flex flex-wrap justify-center gap-sm">
        <button onclick={triggerPromise}> toast.promise() </button>
      </div>

      <p class="text-caption text-mute px-xs">
        API: <code>toast.show(message, type?, duration?)</code>,
        <code>toast.loading(message)</code>,
        <code>toast.promise(promise, messages)</code>,
        <code>toast.close(id)</code>,
        <code>toast.clearAll()</code>.
      </p>
    </div>
  </div>
</section>
