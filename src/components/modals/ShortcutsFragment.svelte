<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { shortcutRegistry } from '@lib/shortcut-registry.svelte';
</script>

<div
  class="modal-content"
  onclick={(e) => e.stopPropagation()}
  role="presentation"
>
  <h2 id="modal-title" class="text-h3 text-center">Keyboard Shortcuts</h2>

  {#each shortcutRegistry.grouped as { group, items }}
    {#if shortcutRegistry.grouped.length > 1}
      <h3 class="text-label text-dim">{group}</h3>
    {/if}
    <dl class="surface-sunk p-md flex flex-col gap-md">
      {#each items as entry (entry.key)}
        <div class="flex flex-row items-center justify-between">
          <dt class="text-dim">{entry.label}</dt>
          <dd>
            {#if entry.modifier}
              <kbd>{entry.modifier === 'meta' ? '⌘' : '⌥'}</kbd>
            {/if}
            <kbd>{entry.key.toUpperCase()}</kbd>
          </dd>
        </div>
      {/each}
    </dl>
  {/each}

  <div class="flex flex-row justify-center">
    <button class="btn-ghost btn-error" onclick={() => modal.close()}>
      Close
    </button>
  </div>
</div>
