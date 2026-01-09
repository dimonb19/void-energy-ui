<script lang="ts">
  import { modal } from '../../lib/modal-manager.svelte';
  import { modalRegistry } from '../../config/modal-registry';
  import type { Component } from 'svelte';

  let dialog = $state<HTMLDialogElement | null>(null);

  // Visual buffers to avoid flicker during close animation.
  // Problem: If we immediately null the component on close, the exit transition
  // renders an empty modal (flicker). Solution: Keep the component mounted until
  // CSS transition completes (see handleTransitionEnd function below).
  let ActiveComponent = $state<Component<any> | null>(null);

  // Hold size/props until fade-out completes.
  // Rationale: Modal width/content must remain stable during exit animation.
  // Without this buffer, closing a large modal would snap to default size before fading.
  let renderedSize = $state(modal.state.size);
  let renderedProps = $state(modal.state.props);

  // Sync dialog state on open/close.
  // This effect handles the dialog lifecycle:
  // 1. When modal.state.key changes from null → 'alert', lazy-load component and showModal()
  // 2. When modal.state.key changes from 'alert' → null, close() and wait for transition
  $effect(() => {
    if (modal.state.key) {
      renderedSize = modal.state.size;
      renderedProps = modal.state.props;

      // Lazy-load the modal fragment.
      const loader = modalRegistry[modal.state.key];
      if (loader) {
        loader()
          .then((module) => {
            // Only mount if the key is still active.
            if (modal.state.key) {
              ActiveComponent = module.default;
              if (dialog && !dialog.open) dialog.showModal();
            }
          })
          .catch((err) => {
            console.error(
              `Void: Failed to load modal "${modal.state.key}"`,
              err,
            );
            modal.close();
          });
      }

      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    } else if (!modal.state.key && dialog?.open) {
      dialog.close();
      // Keep renderedProps to preserve the fading element.
    }
  });

  // Cleanup after transition ends.
  // This ensures the modal content remains visible during the exit animation.
  const handleTransitionEnd = (e: TransitionEvent) => {
    if (e.target === dialog && !dialog?.open) {
      ActiveComponent = null;
      renderedProps = {};
    }
  };

  // Close modal when clicking the backdrop (dark overlay).
  // The stopPropagation on modal-content prevents closing when clicking inside.
  const handleBackdrop = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      modal.close();
    }
  };
</script>

<dialog
  bind:this={dialog}
  data-size={renderedSize}
  aria-labelledby="modal-title"
  aria-modal="true"
  onclick={handleBackdrop}
  ontransitionend={handleTransitionEnd}
>
  <div
    class="modal-content"
    onclick={(e) => e.stopPropagation()}
    role="presentation"
  >
    {#if ActiveComponent}
      <ActiveComponent {...renderedProps} />
    {/if}
  </div>
</dialog>
