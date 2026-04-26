<script lang="ts">
  import { untrack } from 'svelte';
  import type { PsychologyLayerProps, AmbientLevel } from '../types';
  import { PSYCHOLOGY_PARAMS } from '../core/effects/params';
  import { startDecay, startFall, startRise } from '../core/runtime/decay';

  let {
    variant,
    intensity = 'medium',
    durationMs,
    fadeMs,
    enabled = true,
    reducedMotion = 'respect',
    onChange,
    onEnd,
    class: className = '',
  }: PsychologyLayerProps = $props();

  const uid = $props.id();
  const grainFilterId = `ambient-psy-grain-${uid}`;
  const dizzyFilterId = `ambient-psy-dizzy-${uid}`;

  // Semantic level drives mount/onChange; continuous float drives SCSS.
  // Starts at 'off' and ramps up via `startRise` on mount.
  let level = $state<AmbientLevel>('off');
  let levelNum = $state<number>(0);
  let phase = $state<'rising' | 'settled'>('rising');

  // Phase 1: rise from 0 → intensity on mount. Bails when fading.
  $effect(() => {
    if (fadeMs !== undefined) return;
    const handle = startRise(
      intensity,
      PSYCHOLOGY_PARAMS[variant].riseMs,
      (value, lvl) => {
        levelNum = value;
        if (lvl !== level) {
          level = lvl;
          onChange?.(lvl);
        }
      },
      undefined,
      () => {
        phase = 'settled';
      },
    );
    return () => handle.stop();
  });

  // Phase 2: decay (or pinned) after rise completes. Bails when fading.
  $effect(() => {
    if (phase !== 'settled' || fadeMs !== undefined) return;
    const ms = durationMs ?? PSYCHOLOGY_PARAMS[variant].durationMs;
    if (ms <= 0) return;
    const handle = startDecay(
      intensity,
      ms,
      (value) => {
        levelNum = value;
      },
      (next) => {
        level = next;
        onChange?.(next);
      },
      onEnd,
    );
    return () => handle.stop();
  });

  // Phase 3 (interruptive): fade. Animates current → 0 over flat fadeMs,
  // then fires `onEnd`. Aborts rise/decay via the bails above.
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

  // Dizzy warp amount per intensity — subtle spread so levels feel distinct
  // without changing the character of the effect. Values: [min, max] for the
  // feDisplacementMap scale animation (resting-peak-resting).
  const dizzyScale = $derived(
    intensity === 'low'
      ? { min: 6, max: 13, dur: '11s' }
      : intensity === 'high'
        ? { min: 12, max: 26, dur: '9s' }
        : { min: 9, max: 20, dur: '10s' },
  );
  const dizzyScaleValues = $derived(
    `${dizzyScale.min};${dizzyScale.max};${dizzyScale.min}`,
  );

  // camelCase variants → kebab-case SCSS class suffix (filmGrain → film-grain).
  const variantClass = $derived(
    variant.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
  );
</script>

{#if enabled && level !== 'off'}
  <div
    class="ambient-layer ambient-psychology ambient-{variantClass} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    style={variant === 'dizzy'
      ? `--ambient-level: ${levelNum}; backdrop-filter: url(#${dizzyFilterId}); -webkit-backdrop-filter: url(#${dizzyFilterId});`
      : `--ambient-level: ${levelNum};`}
  >
    <span class="ambient-psychology__vignette"></span>
    {#if variant === 'dizzy'}
      <svg
        class="ambient-psychology__svg ambient-psychology__svg--defs"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id={dizzyFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0022 0.0028"
            numOctaves="1"
            seed="4"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.0022 0.0028;0.0030 0.0020;0.0020 0.0030;0.0022 0.0028"
              dur="16s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={dizzyScale.max}
          >
            <animate
              attributeName="scale"
              values={dizzyScaleValues}
              dur={dizzyScale.dur}
              repeatCount="indefinite"
            />
          </feDisplacementMap>
        </filter>
      </svg>
    {/if}
    {#if variant === 'filmGrain'}
      <svg
        class="ambient-psychology__svg"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id={grainFilterId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.4"
            numOctaves="2"
            seed="1"
          >
            <animate
              attributeName="baseFrequency"
              values="1.4;1.55;1.4"
              dur="6s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.6  0 0 0 0.5 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#{grainFilterId})" />
      </svg>
    {/if}
    {#if variant === 'haze' || variant === 'awe'}
      <span class="ambient-psychology__vignette ambient-psychology__vignette--b"
      ></span>
    {/if}
  </div>
{/if}
