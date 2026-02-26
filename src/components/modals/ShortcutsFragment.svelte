<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
</script>

<div
  class="modal-content"
  onclick={(e) => e.stopPropagation()}
  role="presentation"
>
  <h2 id="modal-title" class="text-h3 text-center">Keyboard Shortcuts</h2>

  <dl class="surface-sunk p-md flex flex-col gap-md">
    <div class="flex flex-row items-center justify-between">
      <dt class="text-dim">Toggle fullscreen</dt>
      <dd><kbd>F</kbd></dd>
    </div>
    <div class="flex flex-row items-center justify-between">
      <dt class="text-dim">Open atmospheres</dt>
      <dd><kbd>T</kbd></dd>
    </div>
    <div class="flex flex-row items-center justify-between">
      <dt class="text-dim">Show this help</dt>
      <dd><kbd>?</kbd></dd>
    </div>
  </dl>

  <div class="flex flex-row justify-center">
    <button class="btn-ghost btn-error" onclick={() => modal.close()}>
      Close
    </button>
  </div>
</div>
