<script lang="ts">
  import { modal } from '../../lib/modal-manager.svelte';
  import { modalRegistry } from '../../config/modal-registry';
  import type { Component } from 'svelte';

  let dialog = $state<HTMLDialogElement | null>(null);

  // 1. VISUAL BUFFERS (Hold state during close animation)
  let ActiveComponent = $state<Component<any> | null>(null);

  // Buffer the size and props so they don't reset during the fade-out
  let renderedSize = $state(modal.state.size);
  let renderedProps = $state(modal.state.props);

  // 2. Sync DOM State
  $effect(() => {
    // A. Opening: Sync EVERYTHING immediately
    if (modal.state.key) {
      renderedSize = modal.state.size;
      renderedProps = modal.state.props;

      // Lazy Load the component
      const loader = modalRegistry[modal.state.key];
      if (loader) {
        loader().then((module) => {
          // Only mount if we are still on the same key (prevent race conditions)
          if (modal.state.key) {
            ActiveComponent = module.default;
            if (dialog && !dialog.open) dialog.showModal();
          }
        });
      }

      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    }
    // B. Closing: Close dialog, but DO NOT CLEAR BUFFERS yet
    else if (!modal.state.key && dialog?.open) {
      dialog.close();
      // ⚠️ IMPORTANT: We intentionally DO NOT update renderedProps here.
      // So the ghost element looks correct while fading out.
    }
  });

  // 3. Cleanup after animation
  const handleTransitionEnd = (e: TransitionEvent) => {
    if (e.target === dialog && !dialog?.open) {
      ActiveComponent = null;
      renderedProps = {};
    }
  };

  const handleBackdrop = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      modal.close();
    }
  };
</script>

<dialog
  bind:this={dialog}
  class:dialog-sm={renderedSize === 'sm'}
  class:dialog-lg={renderedSize === 'lg'}
  class:dialog-full={renderedSize === 'full'}
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
