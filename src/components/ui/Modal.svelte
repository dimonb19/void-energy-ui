<script lang="ts">
  import { modal } from '../../lib/modal-manager.svelte';
  import { modalRegistry } from '../../config/modal-registry';

  let dialog = $state<HTMLDialogElement | null>(null);

  // 1. LOGIC: Watch for activeKey to Open/Close native dialog
  $effect(() => {
    if (!dialog) return;
    if (modal.activeKey && !dialog.open) {
      dialog.showModal();
    } else if (!modal.activeKey && dialog.open) {
      dialog.close();
    }
  });

  // 2. LOGIC: Handle Backdrop Click
  const handleBackdropClick = (e: MouseEvent) => {
    // If preventClose is on, we do nothing when clicking outside
    if (modal.windowOptions.preventClose) return;

    if (e.target === e.currentTarget) modal.close(null);
  };

  // 3. LOGIC: Handle "Escape" Key (The 'cancel' event)
  const handleCancel = (e: Event) => {
    // By default, Escape closes a dialog. We must prevent this if the option is set.
    if (modal.windowOptions.preventClose) {
      e.preventDefault();
    } else {
      // If we allow it, we must ensure our manager knows it closed
      modal.close(null);
    }
  };

  // 4. LOGIC: Handle "close" event (Cleanup)
  const handleClose = () => {
    // This catches if the dialog was closed via code or other means
    if (modal.activeKey) modal.close(null);
  };

  // Style: Dynamic Size Class
  let sizeClass = $derived.by(() => {
    const s = modal.windowOptions.size ?? 'md';
    return s === 'md' ? '' : `dialog-${s}`;
  });

  // Component Resolution
  let ActiveComponent = $derived(
    modal.activeKey ? modalRegistry[modal.activeKey] : null,
  );
</script>

<dialog
  bind:this={dialog}
  onclose={handleClose}
  oncancel={handleCancel}
  onclick={handleBackdropClick}
  class={sizeClass}
  aria-labelledby="modal-title"
  aria-modal="true"
>
  <div
    class="flex flex-col gap-lg"
    onclick={(e) => e.stopPropagation()}
    role="presentation"
  >
    {#if ActiveComponent}
      <ActiveComponent {...modal.props} />
    {/if}
  </div>
</dialog>
