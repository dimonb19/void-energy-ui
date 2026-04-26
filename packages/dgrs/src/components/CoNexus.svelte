<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import PullRefresh from '@components/ui/PullRefresh.svelte';
  import StoryFeed from './StoryFeed.svelte';
  import ReorderShowcase from './ReorderShowcase.svelte';
  import PortalLoaderDemo from './PortalLoaderDemo.svelte';
  import VibeMachine from './VibeMachine.svelte';

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

<!--
  VibeMachine lives OUTSIDE PullRefresh. Its ambient layers use `position: fixed`
  and must attach to the viewport. `.pull-content` has a `transform` rule that
  makes it the containing block for any fixed descendant — which stretches the
  ambient layers to the full page height instead of 100vh. Keeping VibeMachine
  a sibling of PullRefresh restores viewport-scoped positioning.
-->
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

<hr />

<VibeMachine />
