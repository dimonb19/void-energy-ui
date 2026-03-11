<script lang="ts">
  import Tabs from '@components/ui/Tabs.svelte';

  interface TabsFixtureProps {
    tabs: Array<{ id: string; label: string; disabled?: boolean }>;
    value?: string;
    onchange?: (id: string) => void;
  }

  let { tabs, value = $bindable(), onchange }: TabsFixtureProps = $props();
</script>

<Tabs {tabs} bind:value {onchange}>
  {#snippet panel(tab)}
    <p data-testid="panel-content">Content for {tab.id}</p>
  {/snippet}
</Tabs>
