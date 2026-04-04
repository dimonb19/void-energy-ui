<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import PullRefresh from '@components/ui/PullRefresh.svelte';
  import StoryFeed from './StoryFeed.svelte';
  import ReorderShowcase from './ReorderShowcase.svelte';
  import PortalLoaderDemo from './PortalLoaderDemo.svelte';

  function interceptDemoLink(e: MouseEvent | KeyboardEvent) {
    if (e instanceof KeyboardEvent && e.key !== 'Enter') return;
    const anchor = (e.target as HTMLElement).closest('a');
    if (anchor?.getAttribute('href') === '#') {
      e.preventDefault();
      toast.show('Demo link — no navigation', 'info');
    }
  }

  async function handleRefresh(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  function handleRefreshError(error: unknown): void {
    console.error('Refresh error:', error);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<PullRefresh onrefresh={handleRefresh} onerror={handleRefreshError}>
  <div
    class="flex flex-col gap-xl pt-2xl"
    onclick={interceptDemoLink}
    onkeydown={interceptDemoLink}
  >
    <StoryFeed />

    <hr />

    <ReorderShowcase />
  </div>

  <hr />

  <div class="container py-2xl flex flex-col gap-lg">
    <PortalLoaderDemo />
  </div>
</PullRefresh>
