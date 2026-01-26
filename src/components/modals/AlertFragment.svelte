<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';

  let { title = 'System Alert', body } = $props();
</script>

<div class="text-center flex flex-col gap-md">
  <h2 id="modal-title" class="text-h3">{title}</h2>
  <p>{@html body}</p>
</div>

<div class="flex flex-row justify-center">
  <button class="btn-system" onclick={() => modal.close()}>
    Acknowledge
  </button>
</div>
