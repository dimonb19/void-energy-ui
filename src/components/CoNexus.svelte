<script lang="ts">
  import PullRefresh from '@components/ui/PullRefresh.svelte';
  import PortalLoader from '@components/ui/PortalLoader.svelte';

  let portalStatus = $state<'idle' | 'loading'>('loading');

  async function handleRefresh(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  function handleRefreshError(error: unknown): void {
    console.error('Refresh error:', error);
  }
</script>

<PullRefresh onrefresh={handleRefresh} onerror={handleRefreshError}>
  <div class="container flex flex-col gap-2xl py-2xl">
    <h1 class="text-center">Coming soon...</h1>

    <div class="surface-glass p-lg flex flex-col gap-lg">
      <span class="flex flex-col gap-md items-center">
        <PortalLoader status={portalStatus} />
        <button
          class="btn-ghost"
          onclick={() =>
            (portalStatus = portalStatus === 'loading' ? 'idle' : 'loading')}
        >
          {portalStatus === 'loading' ? 'Stop' : 'Start'}
        </button>
      </span>

      <ul class="flex flex-col gap-md">
        <hr />

        <li>
          <strong>Story categories</strong> — browsable tile grid that organizes
          stories by topic.
        </li>
        <li>
          <strong>Drag & drop</strong> — direct manipulation for reordering or organizing
          content by dragging elements into place.
        </li>

        <hr />

        <li>
          <strong>Ambient layers</strong> — atmospheric background visuals that shift
          with theme and context.
        </li>
      </ul>
    </div>

    <div class="surface-glass flex flex-col items-center gap-lg p-lg">
      
    </div>
  </div>
</PullRefresh>
