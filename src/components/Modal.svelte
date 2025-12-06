<script lang="ts">
  import { showModal } from "../stores/modal.svelte";

  let dialog = $state<HTMLDialogElement | null>(null);

  const closeDialog = () => {
    $showModal = false;
    dialog?.close();
  };

  $effect(() => {
    if (!dialog) return;
    if ($showModal) {
      dialog.classList.remove("dialog-fade-out");
      dialog.showModal();
    } else if (dialog.open) {
      closeDialog();
    }
  });

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  };

  const stopPropagation = (event: Event) => {
    event.stopPropagation();
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<dialog
  bind:this={dialog}
  onclose={closeDialog}
  onclick={handleBackdropClick}
  aria-label="Modal"
  aria-modal="true"
>
  <div onclick={stopPropagation} role="dialog" tabindex="-1">
    <h2 class="text-highlight">CONFIRM INITIATION?</h2>
    <p>
      You are about to deploy the production build. This action cannot be undone
      by standard protocols.
    </p>

    <div class="surface-sunk round-8 pad-16 flex-row gap-16 items-center">
      <span class="text-highlight">⚠</span>
      <span>This action will consume 500 Credits.</span>
    </div>

    <div class="flex-row justify-end gap-16 margin-top-16">
      <button onclick={() => ($showModal = false)}>Abort</button>
      <button class="btn-signal" onclick={() => ($showModal = false)}
        >Confirm</button
      >
    </div>
  </div>
</dialog>
