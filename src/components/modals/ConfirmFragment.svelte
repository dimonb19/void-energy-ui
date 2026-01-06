<script lang="ts">
  import { modal } from '../../lib/modal-manager.svelte';
  import { tooltip } from '../../actions/tooltip';

  let {
    title = 'Confirm Action',
    body,
    cost = 0,
    confirmText = 'Confirm',
    cancelText = 'Abort',
  } = $props();
</script>

<div class="text-center flex flex-col gap-md">
  <h2 id="modal-title">{title}</h2>
  <p class="text-dim">{@html body}</p>

  {#if cost > 0}
    <div
      class="surface-sunk rounded-md p-md flex flex-row gap-md items-center justify-center"
    >
      <span>⚠</span>
      <span>Consumes <strong>{cost} Credits</strong></span>
    </div>
  {/if}
</div>

<div class="flex flex-row justify-end gap-md pt-sm">
  <button class="btn-alert" onclick={() => modal.close(false)}>
    {cancelText}
  </button>
  <button
    class="btn-signal"
    onclick={() => modal.close(true)}
    use:tooltip={'Click to confirm'}
  >
    {confirmText}
  </button>
</div>
