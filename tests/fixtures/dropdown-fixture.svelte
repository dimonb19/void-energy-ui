<script lang="ts">
  import Dropdown from '@components/ui/Dropdown.svelte';

  let open = $state(false);
</script>

<Dropdown label="Fixture dropdown" bind:open>
  {#snippet trigger()}
    <span>Open menu</span>
  {/snippet}

  <div class="p-md">
    <button type="button">Panel action</button>
  </div>
</Dropdown>
