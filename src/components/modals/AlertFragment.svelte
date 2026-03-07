<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';

  let {
    title = 'System Alert',
    body = '',
    bodyHtml,
  }: {
    title?: string;
    body?: string;
    bodyHtml?: string;
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
  </div>

  <div class="flex flex-row justify-center">
    <!-- svelte-ignore a11y_autofocus -- Dialog primary action; focus is already trapped by showModal() -->
    <button class="btn-system" onclick={() => modal.close()} autofocus>
      Acknowledge
    </button>
  </div>
</div>
