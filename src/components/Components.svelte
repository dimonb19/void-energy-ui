<script lang="ts">
  import PullRefresh from './ui/PullRefresh.svelte';

  import Buttons from './ui-library/Buttons.svelte';
  import Inputs from './ui-library/Inputs.svelte';
  import Icons from './ui-library/Icons.svelte';
  import Composites from './ui-library/Composites.svelte';
  import DataUpload from './ui-library/DataUpload.svelte';
  import FloatingUI from './ui-library/FloatingUI.svelte';
  import Typography from './ui-library/Typography.svelte';
  import Surfaces from './ui-library/Surfaces.svelte';
  import Toasts from './ui-library/Toasts.svelte';
  import Modals from './ui-library/Modals.svelte';

  // Pull-to-refresh handlers
  async function handleRefresh(): Promise<void> {
    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  function handleRefreshError(error: unknown): void {
    console.error('Refresh error:', error);
  }
</script>

<PullRefresh onrefresh={handleRefresh} onerror={handleRefreshError}>
  <div class="container flex flex-col gap-xl py-md">
    <p class="text-small text-mute">
      This page is wrapped in a <code>PullRefresh</code> component — pull down (or
      scroll past the top) to see it in action.
    </p>

    <Buttons />

    <Inputs />

    <Icons />

    <Composites />

    <DataUpload />

    <FloatingUI />

    <Typography />

    <Surfaces />

    <Toasts />

    <Modals />
  </div>
</PullRefresh>
