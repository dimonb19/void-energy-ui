<script lang="ts">
  import { toast } from '../stores/toast.svelte';
  import { dematerialize, materialize } from '../lib/transitions.svelte';

  const icons = {
    info: 'ℹ️', // Standard Info
    success: '✅', // Clear Check
    warning: '⚠️', // Standard Warning
    error: '🛑', // Stop Sign (Cleaner than X)
  };
</script>

<div class="toast-region" aria-live="polite">
  {#each toast.items as item (item.id)}
    <button
      class="toast-message"
      type="button"
      data-type={item.type}
      onclick={() => toast.close(item.id)}
      in:materialize
      out:dematerialize={{ y: 0 }}
    >
      <span class="toast-icon">
        {#if item.type === 'loading'}
          <svg class="spin-loader" viewBox="0 0 24 24">
            <circle class="track" cx="12" cy="12" r="10" />
            <circle class="car" cx="12" cy="12" r="10" />
          </svg>
        {:else}
          {icons[item.type] ?? icons.info}
        {/if}
      </span>

      <span class="toast-text">{item.message}</span>

      <div class="toast-glow"></div>
    </button>
  {/each}
</div>
