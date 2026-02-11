<script lang="ts">
  import PullRefresh from './ui/PullRefresh.svelte';
  import Icons from './ui-library/Icons.svelte';

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
    <Icons />

    <section class="flex flex-col gap-md my-md">
      <h2>02 // DATA UPLOAD</h2>

      <div class="p-md surface-glass">
        <div class="dropzone">
          <input type="file" />
          <div class="dropzone-content">
            <span class="btn-icon">📂</span>
            <p>Upload Neural Patterns</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</PullRefresh>
