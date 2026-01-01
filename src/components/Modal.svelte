<script lang="ts">
  import { modal } from '../lib/modal-manager.svelte';
  import { UI_MODALS } from '../config/constants'; // Import constants

  let dialog = $state<HTMLDialogElement | null>(null);
  let inputValue = $state('');

  $effect(() => {
    if (modal.activeId === UI_MODALS.INPUT) {
      inputValue = modal.options.inputValue || '';
    }
  });

  $effect(() => {
    if (!dialog) return;
    if (modal.activeId && !dialog.open) {
      dialog.showModal();
    } else if (!modal.activeId && dialog.open) {
      dialog.close();
    }
  });

  const handleClose = () => {
    if (modal.activeId) modal.close(false);
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) modal.close(false);
  };

  let sizeClass = $derived.by(() => {
    const s = modal.options.size ?? 'md';
    if (s === 'md') return '';
    return `dialog-${s}`;
  });
</script>

<dialog
  bind:this={dialog}
  onclose={handleClose}
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
    {#if modal.activeId === UI_MODALS.CONFIRM}
      <div class="text-center flex flex-col gap-md">
        <h2 id="modal-title">{modal.options.title ?? 'Confirm Action'}</h2>
        <p class="text-dim">{@html modal.options.body}</p>

        {#if modal.options.cost}
          <div
            class="surface-sunk rounded-md p-md flex flex-row gap-md items-center justify-center"
          >
            <span class="text-highlight">⚠</span>
            <span>Consumes <strong>{modal.options.cost} Credits</strong></span>
          </div>
        {/if}
      </div>

      <div class="flex flex-row justify-end gap-md pt-sm">
        <button class="btn-alert" onclick={() => modal.close(false)}>
          {modal.options.cancelText ?? 'Abort'}
        </button>
        <button class="btn-signal" onclick={() => modal.close(true)}>
          {modal.options.confirmText ?? 'Confirm'}
        </button>
      </div>
    {:else if modal.activeId === UI_MODALS.INPUT}
      <div class="flex flex-col gap-md">
        <h2 id="modal-title">{modal.options.title}</h2>
        <div class="flex flex-col gap-xs">
          <input
            type="text"
            bind:value={inputValue}
            placeholder={modal.options.placeholder}
            class="w-full"
            onkeydown={(e) => e.key === 'Enter' && modal.close(inputValue)}
          />
        </div>
      </div>

      <div class="flex flex-row justify-end gap-md pt-sm">
        <button class="btn-void text-mute" onclick={() => modal.close(null)}
          >Cancel</button
        >
        <button class="btn-cta" onclick={() => modal.close(inputValue)}>
          {modal.options.confirmText ?? 'Submit'}
        </button>
      </div>
    {:else if modal.activeId === UI_MODALS.ALERT}
      <div class="text-center flex flex-col gap-md">
        <h2 id="modal-title">{modal.options.title ?? 'System Alert'}</h2>
        <p>{@html modal.options.body}</p>
      </div>
      <div class="flex flex-row justify-center pt-sm">
        <button class="btn-system" onclick={() => modal.close(true)}
          >Acknowledge</button
        >
      </div>
    {/if}
  </div>
</dialog>
