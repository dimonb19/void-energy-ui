<script lang="ts">
  import { toast } from '../stores/toast.svelte';
  import { dematerialize, materialize } from '../lib/transitions.svelte';

  const icons: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '🛑',
  };

  let region = $state<HTMLElement | null>(null);
  let animatingOut = $state(false);

  // Show popover when items exist.
  $effect(() => {
    if (!region || toast.items.length === 0) return;
    try {
      region.showPopover();
    } catch (e) {}
  });

  // Re-bump toast above modal when modal opens.
  $effect(() => {
    const rebump = () => {
      if (region?.matches(':popover-open') && toast.items.length > 0) {
        region.hidePopover();
        region.showPopover();
      }
    };
    document.addEventListener('void:modal-opened', rebump);
    return () => document.removeEventListener('void:modal-opened', rebump);
  });

  // Hide popover when empty AND not animating.
  $effect(() => {
    if (!region || toast.items.length > 0 || animatingOut) return;
    if (region.matches(':popover-open')) {
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
      onoutrostart={() => (animatingOut = true)}
      onoutroend={() => (animatingOut = false)}
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
    </button>
  {/each}
</div>
