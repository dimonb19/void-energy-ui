<script lang="ts">
  import AtmosphereScope from '@components/core/AtmosphereScope.svelte';

  let {
    theme,
    label = 'Scoped atmosphere',
  }: {
    theme: string | PartialThemeDefinition;
    label?: string;
  } = $props();
</script>

<AtmosphereScope {theme} {label}>
  <div data-testid="scope-content">Scoped content</div>
</AtmosphereScope>
