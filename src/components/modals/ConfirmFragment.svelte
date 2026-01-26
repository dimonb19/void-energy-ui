<script lang="ts">
  import { tooltip } from '@actions/tooltip';

  import Warning from '../icons/Warning.svelte';

  let {
    title = 'Confirm Action',
    body,
    cost = 0,
    confirmText = 'Confirm',
    cancelText = 'Abort',
    onConfirm,
    onCancel = () => {},
  } = $props();
</script>

<div
  class="modal-content"
  onclick={(e) => e.stopPropagation()}
  role="presentation"
>
  <div class="text-center flex flex-col gap-md">
    <h2 id="modal-title" class="text-h3">{title}</h2>
    <p>{@html body}</p>

    {#if cost > 0}
      <div
        class="surface-sunk p-md flex flex-row gap-md items-center justify-center text-premium"
      >
        <Warning />
        <span>Consumes <strong>{cost} Credits</strong></span>
      </div>
    {/if}
  </div>

  <div class="flex flex-row justify-center gap-md">
    <button class="btn-alert" onclick={() => onCancel()}>
      {cancelText}
    </button>
    <button
      class="btn-signal"
      onclick={onConfirm}
      use:tooltip={'Click to execute'}
    >
      {confirmText}
    </button>
  </div>
</div>
