<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { modalA11yNameRegistry, modalRegistry } from '@config/modal-registry';
  import { layerStack } from '@lib/layer-stack.svelte';

  let dialog = $state<HTMLDialogElement | null>(null);
  let layerId: number | null = null;

  // Visual buffers to avoid flicker during close animation.
  // Problem: If we immediately null the component on close, the exit transition
  // renders an empty modal (flicker). Solution: Keep the component mounted until
  // CSS transition completes (see handleTransitionEnd function below).
  let ActiveComponent = $state<ModalComponentType | null>(null);

  // Hold size/props until fade-out completes.
  // Rationale: Modal width/content must remain stable during exit animation.
  // Without this buffer, closing a large modal would snap to default size before fading.
  let renderedSize = $state(modal.state.size);
  let renderedProps = $state(modal.state.props);

  let ariaLabelledBy = $derived.by(() => {
    if (!modal.state.key) return undefined;
    const naming = modalA11yNameRegistry[modal.state.key];
    return 'labelledby' in naming ? naming.labelledby : undefined;
  });

  let ariaLabel = $derived.by(() => {
    if (!modal.state.key) return undefined;
    const naming = modalA11yNameRegistry[modal.state.key];
    return 'label' in naming ? naming.label : undefined;
  });

  // Sync dialog state on open/close.
  // 1. When modal.state.key changes from null → 'alert', set component and showModal()
  // 2. When modal.state.key changes from 'alert' → null, close() and wait for transition
  $effect(() => {
    if (modal.state.key) {
      renderedSize = modal.state.size;
      renderedProps = modal.state.props;
      ActiveComponent = modalRegistry[modal.state.key] as ModalComponentType;

      if (dialog && !dialog.open) {
        dialog.showModal();
        document.dispatchEvent(new CustomEvent('void:modal-opened'));
      }

      if (layerId !== null) {
        layerStack.remove(layerId);
      }
      layerId = layerStack.push(() => modal.close());
    } else if (!modal.state.key && dialog?.open) {
      if (layerId !== null) {
        layerStack.remove(layerId);
        layerId = null;
      }

      dialog.close();
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
  aria-labelledby={ariaLabelledBy}
  aria-label={ariaLabel}
  aria-modal="true"
  onclick={handleBackdrop}
  oncancel={(e) => e.preventDefault()}
  ontransitionend={handleTransitionEnd}
>
  {#if ActiveComponent}
    <ActiveComponent {...renderedProps} />
  {/if}
</dialog>
