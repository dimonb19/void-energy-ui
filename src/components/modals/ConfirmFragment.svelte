<script lang="ts">
  import { tooltip } from '../../actions/tooltip';

  let {
    title = 'Confirm Action',
    body,
    cost = 0,
    confirmText = 'Confirm',
    cancelText = 'Abort',
    onConfirm,
    onCancel,
  } = $props();
</script>

<div class="text-center flex flex-col gap-md">
  <h2 id="modal-title" class="text-h3 text-main">{title}</h2>
  <p class="text-dim">{@html body}</p>

  {#if cost > 0}
    <div
      class="surface-sunk rounded-md p-md flex flex-row gap-md items-center justify-center text-error border border-error/30"
    >
      <span>⚠</span>
      <span>Consumes <strong>{cost} Credits</strong></span>
    </div>
  {/if}
</div>

<div class="flex flex-row justify-end gap-md pt-lg">
  <button class="btn-alert" onclick={onCancel}>
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
