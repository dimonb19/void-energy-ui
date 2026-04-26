<script lang="ts">
  import { untrack } from 'svelte';
  import type { EnvironmentLayerProps, AmbientLevel } from '../types';
  import { startFall, startRise } from '../core/runtime/decay';

  /**
   * Default rise duration for environment layers. Env is sticky baseline
   * tint, so it ramps up slowly — fast pop-in would feel out of place
   * when the rest of the scene materializes over a second or two.
   */
  const ENVIRONMENT_RISE_MS = 1500;

  let {
    variant,
    intensity = 'medium',
    fadeMs,
    enabled = true,
    reducedMotion = 'respect',
    onChange,
    onEnd,
    class: className = '',
  }: EnvironmentLayerProps = $props();

  // Continuous float (0..3) driven by rAF. Ramps from 0 → target on mount
  // so SCSS rules using `--ambient-level` / `--ambient-env-level` fade in
  // smoothly instead of popping. Env doesn't auto-decay (sticky baseline)
  // but supports explicit fade-out via the `fadeMs` prop.
  let levelNum = $state<number>(0);
  let level = $state<AmbientLevel>('off');

  const tint = $derived(levelNum / 3);

  // Rise on mount. Bails when fading so an explicit clear takes priority.
  $effect(() => {
    if (fadeMs !== undefined) return;
    const handle = startRise(intensity, ENVIRONMENT_RISE_MS, (value, lvl) => {
      levelNum = value;
      if (lvl !== level) {
        level = lvl;
        onChange?.(lvl);
      }
    });
    return () => handle.stop();
  });

  // Fade-out — animates current → 0 over flat fadeMs, then fires onEnd
  // so AmbientHost releases the handle and the layer unmounts.
  $effect(() => {
    if (fadeMs === undefined) return;
    const from = untrack(() => levelNum);
    const handle = startFall(
      from,
      fadeMs,
      (value, lvl) => {
        levelNum = value;
        if (lvl !== level) {
          level = lvl;
          onChange?.(lvl);
        }
      },
      undefined,
      onEnd,
    );
    return () => handle.stop();
  });
</script>

{#if enabled && level !== 'off'}
  <div
    class="ambient-layer ambient-environment ambient-{variant} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    style="--ambient-level: {levelNum}; --ambient-env-level: {tint};"
  ></div>
{/if}
