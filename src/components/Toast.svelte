<script lang="ts">
  import { toast } from '../stores/toast.svelte';
  import { dematerialize, materialize } from '../lib/transitions.svelte';

  const icons: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '🛑',
  };

  // 1. DOM Reference for the Popover API
  let region = $state<HTMLElement | null>(null);

  // 2. LOGIC: Top Layer Hoisting
  // The Popover API stacks elements by insertion order.
  // To ensure Toasts appear ABOVE an active Modal, we must re-insert
  // the Toast Region into the Top Layer whenever a new message arrives.
  $effect(() => {
    if (!region) return;

    if (toast.items.length > 0) {
      // A. Force Re-hoist (Remove and Add to Top Layer)
      // This ensures we jump ahead of any Modals opened recently.
      try {
        region.hidePopover();
        region.showPopover();
      } catch (e) {
        // Safety: Ignore errors if browser is fighting state
      }
    } else {
      // B. Cleanup (Close popover when empty to prevent blocking clicks)
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
