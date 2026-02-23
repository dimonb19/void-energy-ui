<script lang="ts">
  import PullRefresh from '@components/ui/PullRefresh.svelte';
  import PortalLoader from '@components/ui/PortalLoader.svelte';

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
      <ul class="flex flex-col gap-md">
        <li>
          <strong>Portal loader</strong> — transition sequence that plays when entering
          a portal.
        </li>
        <li>
          <strong>Kinetic typography</strong> — motion-driven text animations that
          adds narrative rhythm to content.
        </li>

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

    <div class="surface-glass flex justify-center p-lg">
      <PortalLoader />
    </div>
  </div>
</PullRefresh>
