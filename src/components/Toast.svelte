<script lang="ts">
  import { toast } from '../stores/toast.svelte';
  import { dematerialize, materialize } from '../lib/transitions.svelte';

  const icons: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '🛑',
  };

  // Popover region reference.
  let region = $state<HTMLElement | null>(null);

  // Keep toast region ahead of modals in the Top Layer.
  $effect(() => {
    if (!region) return;

    if (toast.items.length > 0) {
      // Re-show to bump insertion order.
      try {
        region.hidePopover();
        region.showPopover();
      } catch (e) {
        // Ignore transient popover state errors.
      }
    } else {
      // Close when empty to avoid blocking clicks.
      try {
        region.hidePopover();
      } catch (e) {}
    }
  });
</script>

<div
  bind:this={region}
  class="toast-region"
  popover="manual"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {#each toast.items as item (item.id)}
    <button
      class="toast-message"
      type="button"
      data-type={item.type}
      onclick={() => toast.close(item.id)}
      in:materialize
      out:dematerialize={{ y: 0 }}
    >
      <span class="toast-icon">
        {#if item.type === 'loading'}
          <svg class="spin-loader" viewBox="0 0 24 24">
            <circle class="track" cx="12" cy="12" r="10" />
            <circle class="car" cx="12" cy="12" r="10" />
          </svg>
        {:else}
          {icons[item.type] ?? icons.info}
        {/if}
      </span>

      <span class="toast-text">{item.message}</span>

      <div class="toast-glow"></div>
    </button>
  {/each}
</div>
