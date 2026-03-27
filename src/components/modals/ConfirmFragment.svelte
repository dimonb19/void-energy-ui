<script lang="ts">
  import { TriangleAlert } from '@lucide/svelte';

  let {
    title = 'Confirm Action',
    body = '',
    bodyHtml,
    cost = 0,
    confirmText = 'Confirm',
    cancelText = 'Abort',
    onConfirm,
    onCancel = () => {},
  }: {
    title?: string;
    body?: string;
    bodyHtml?: string;
    cost?: number;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } = $props();
</script>

<div
  class="modal-content"
  onclick={(e) => e.stopPropagation()}
  role="presentation"
>
  <div class="text-center flex flex-col gap-md">
    <h2 id="modal-title" class="text-h3">{title}</h2>
    {#if bodyHtml != null}
      <p>{@html bodyHtml}</p>
    {:else}
      <p>{body}</p>
    {/if}

    {#if cost > 0}
      <div
        class="surface-sunk p-md flex flex-row gap-md items-center justify-center text-premium"
      >
        <TriangleAlert class="icon" />
        <span>Consumes <strong>{cost} Credits</strong></span>
      </div>
    {/if}
  </div>

  <div class="flex flex-row justify-center gap-md">
    <button class="btn-ghost btn-error" onclick={() => onCancel()}>
      {cancelText}
    </button>
    <!-- svelte-ignore a11y_autofocus -- Dialog primary action; focus is already trapped by showModal() -->
    <button class="btn-success" onclick={onConfirm} autofocus>
      {confirmText}
    </button>
  </div>
</div>
