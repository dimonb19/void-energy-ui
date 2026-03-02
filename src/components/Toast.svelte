<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import { emerge, dissolve } from '@lib/transitions.svelte';
  import { Info, Check, TriangleAlert, X } from '@lucide/svelte';
  import LoadingSpin from './icons/LoadingSpin.svelte';
  import Undo from './icons/Undo.svelte';

  const icons: Record<string, typeof Info> = {
    info: Info,
    success: Check,
    warning: TriangleAlert,
    error: X,
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
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_click_events_have_key_events -->
    <div
      class="toast-message flex items-center justify-center gap-xs"
      role="status"
      data-type={item.type}
      onclick={() => toast.close(item.id)}
      in:emerge
      out:dissolve={{ y: 0 }}
      onoutrostart={() => (animatingOut = true)}
      onoutroend={() => (animatingOut = false)}
    >
      <span
        class="toast-icon flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        {#if item.type === 'loading'}
          <LoadingSpin class="text-main" data-size="lg" />
        {:else}
          {@const Icon = icons[item.type] ?? icons.info}
          <Icon class="icon" />
        {/if}
      </span>

      <span class="toast-text">{item.message}</span>

      {#if item.action}
        <button
          type="button"
          class="toast-action btn-ghost btn-sm inline-flex items-center gap-xs"
          onclick={(e) => {
            e.stopPropagation();
            item.action!.onclick();
          }}
        >
          {#if item.action.label === 'Undo'}
            <Undo data-size="sm" />
          {/if}
          {item.action.label}
        </button>
      {/if}
    </div>
  {/each}
</div>
