<script lang="ts">
  /**
   * Mount once in your app shell. Renders every active entry from the
   * `ambient` singleton — environment (deepest), atmosphere, psychology,
   * and one-shot action bursts (top).
   *
   * Persistent layers are rendered with `durationMs={0}` — their lifecycle
   * is owned by the singleton's handle-stack, not the layer's built-in
   * auto-decay. One-shot actions self-clear via `onEnd`.
   */
  import { ambient } from './ambient.svelte';
  import EnvironmentLayer from './EnvironmentLayer.svelte';
  import AtmosphereLayer from './AtmosphereLayer.svelte';
  import PsychologyLayer from './PsychologyLayer.svelte';
  import ActionLayer from './ActionLayer.svelte';
</script>

{#each ambient.environment as entry (entry.handle)}
  {#key `${entry.variant}-${entry.intensity}`}
    <EnvironmentLayer variant={entry.variant} intensity={entry.intensity} />
  {/key}
{/each}

{#each ambient.atmosphere as entry (entry.handle)}
  {#key `${entry.variant}-${entry.intensity}`}
    <AtmosphereLayer
      variant={entry.variant}
      intensity={entry.intensity}
      durationMs={0}
    />
  {/key}
{/each}

{#each ambient.psychology as entry (entry.handle)}
  {#key `${entry.variant}-${entry.intensity}`}
    <PsychologyLayer
      variant={entry.variant}
      intensity={entry.intensity}
      durationMs={0}
    />
  {/key}
{/each}

{#each ambient.actions as entry (entry.id)}
  <ActionLayer
    variant={entry.variant}
    intensity={entry.intensity}
    onEnd={() => ambient._removeAction(entry.id)}
  />
{/each}
