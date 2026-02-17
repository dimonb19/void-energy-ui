<script lang="ts">
  import PullRefresh from './ui/PullRefresh.svelte';

  // Foundations
  import Typography from './ui-library/Typography.svelte';
  import Surfaces from './ui-library/Surfaces.svelte';
  // Primitives
  import Icons from './ui-library/Icons.svelte';
  import Buttons from './ui-library/Buttons.svelte';
  // Form Controls
  import Inputs from './ui-library/Inputs.svelte';
  import DataUpload from './ui-library/DataUpload.svelte';
  // Composites
  import Composites from './ui-library/Composites.svelte';
  // Overlays & Feedback
  import FloatingUI from './ui-library/FloatingUI.svelte';
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

    <h3 class="text-mute">Foundations</h3>
    <Typography />
    <Surfaces />

    <h3 class="text-mute">Primitives</h3>
    <Icons />
    <Buttons />

    <h3 class="text-mute">Form Controls</h3>
    <Inputs />
    <DataUpload />

    <h3 class="text-mute">Composites</h3>
    <Composites />

    <h3 class="text-mute">Overlays & Feedback</h3>
    <FloatingUI />
    <Toasts />
    <Modals />
  </div>
</PullRefresh>
