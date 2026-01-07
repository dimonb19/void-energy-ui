<script lang="ts">
  import { modal } from '../../lib/modal-manager.svelte';

  let { title = 'System Alert', body } = $props();
</script>

<div class="text-center flex flex-col gap-md">
  <h2 id="modal-title" class="text-h3 text-error">{title}</h2>
  <p class="text-dim">{@html body}</p>
</div>

<div class="flex flex-row justify-center pt-lg">
  <button class="btn-system min-w-[120px]" onclick={() => modal.close()}>
    Acknowledge
  </button>
</div>
