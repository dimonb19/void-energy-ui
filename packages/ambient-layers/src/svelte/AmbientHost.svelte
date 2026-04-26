<script lang="ts">
  /**
   * Mount once in your app shell. Renders every active entry from the
   * `ambient` singleton — environment (deepest), atmosphere, psychology,
   * and one-shot action bursts (top).
   *
   * Persistent atmosphere/psychology entries default to pinned (durationMs=0),
   * so their lifecycle is owned by the singleton's handle-stack. Callers can
   * opt into auto-decay per-entry via `push(..., decay: true)` or
   * `update(handle, ..., decay: true)`; when decay completes the host
   * auto-releases the handle so the entry doesn't linger as a zero-level ghost.
   *
   * Any persistent entry — atmosphere, psychology, or environment — can be
   * faded out explicitly via `ambient.fade(handle)`, which sets `fadeMs` on
   * the entry; the layer animates to zero over that duration and self-releases.
   * One-shot actions self-clear via `onEnd`.
   */
  import { ambient } from './ambient.svelte';
  import EnvironmentLayer from './EnvironmentLayer.svelte';
  import AtmosphereLayer from './AtmosphereLayer.svelte';
  import PsychologyLayer from './PsychologyLayer.svelte';
  import ActionLayer from './ActionLayer.svelte';
</script>

{#each ambient.environment as entry (entry.handle)}
  {#key `${entry.variant}-${entry.intensity}`}
    <EnvironmentLayer
      variant={entry.variant}
      intensity={entry.intensity}
      fadeMs={entry.fadeMs}
      onEnd={() => ambient._releaseImmediate(entry.handle)}
    />
  {/key}
{/each}

{#each ambient.atmosphere as entry (entry.handle)}
  {#key `${entry.variant}-${entry.intensity}`}
    <AtmosphereLayer
      variant={entry.variant}
      intensity={entry.intensity}
      durationMs={entry.durationMs}
      fadeMs={entry.fadeMs}
      onEnd={() => ambient._releaseImmediate(entry.handle)}
    />
  {/key}
{/each}

{#each ambient.psychology as entry (entry.handle)}
  {#key `${entry.variant}-${entry.intensity}`}
    <PsychologyLayer
      variant={entry.variant}
      intensity={entry.intensity}
      durationMs={entry.durationMs}
      fadeMs={entry.fadeMs}
      onEnd={() => ambient._releaseImmediate(entry.handle)}
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
