<script lang="ts">
  import type { AtmosphereLayerProps, AmbientLevel } from '../types';
  import { ATMOSPHERE_PARAMS } from '../core/effects/params';
  import { startDecay } from '../core/runtime/decay';

  let {
    variant,
    intensity = 'medium',
    durationMs,
    enabled = true,
    reducedMotion = 'respect',
    onChange,
    onEnd,
    class: className = '',
  }: AtmosphereLayerProps = $props();

  // Unique id for SVG filter defs (fog/underwater/heat).
  const uid = $props.id();
  const underwaterFilterId = `uw-distort-${uid}`;

  // Semantic level — used for mount gating, `onChange`, and locking the
  // particle count. Starts at `intensity` and only flips to 'off' when the
  // continuous fade reaches zero.
  let level = $state<AmbientLevel>('medium');
  // Continuous float (0..3) driven by rAF. Fed to `--ambient-level` so every
  // SCSS `calc()` consumer scales smoothly instead of jumping between rungs.
  let levelNum = $state<number>(2);

  // Re-sync if the consumer changes `intensity` or `variant` prop.
  $effect(() => {
    level = intensity;
    levelNum = intensity === 'low' ? 1 : intensity === 'medium' ? 2 : 3;
    onChange?.(intensity);
  });

  $effect(() => {
    const ms = durationMs ?? ATMOSPHERE_PARAMS[variant].durationMs;
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

  // Particle count is locked to the *initial* intensity for the lifetime of
  // the layer. Regenerating particles mid-fade would pop; instead we spawn
  // the full field once and let `--ambient-level` fade it out continuously.
  const count = $derived(ATMOSPHERE_PARAMS[variant].counts[intensity]);

  // Particle-field variants share an x-y scatter model.
  // - rain/snow/ash/storm: vertical fall (storm reuses the rain particle shape).
  // - wind: horizontal streaks (dust/leaves), distinct keyframe in SCSS.
  // SVG-filter variants (fog/underwater/heat) render inline <svg> turbulence.
  const isParticleField = $derived(
    variant === 'rain' ||
      variant === 'snow' ||
      variant === 'ash' ||
      variant === 'storm' ||
      variant === 'wind' ||
      variant === 'spores' ||
      variant === 'fireflies',
  );
  const isSvgFilter = $derived(
    variant === 'fog' || variant === 'underwater' || variant === 'heat',
  );

  // Storm-only: occasional lightning strike. Random interval 2.5–6s. Each
  // strike generates a fresh jagged bolt path (with 0–2 forks) and fires a
  // natural double-flicker so the sky lights up, darkens briefly, then
  // re-strikes. SCSS drives the wash via [data-lightning='true']; the bolt
  // SVG is rendered while `bolt` is non-null.
  let lightning = $state(false);
  let bolt = $state<{ main: string; forks: string[] } | null>(null);

  function buildBolt(): { main: string; forks: string[] } {
    // Percent-based coordinates so the bolt scales to the viewport via
    // SVG viewBox="0 0 100 100" preserveAspectRatio="none".
    const segments = 10 + Math.floor(Math.random() * 5);
    const startX = 20 + Math.random() * 60;
    const points: Array<{ x: number; y: number }> = [{ x: startX, y: 0 }];
    let x = startX;
    const totalY = 70 + Math.random() * 25; // bolt ends mid-to-lower sky
    for (let i = 1; i <= segments; i++) {
      const y = (i / segments) * totalY;
      // Lateral jitter grows slightly with depth.
      x += (Math.random() * 2 - 1) * (4 + (i / segments) * 4);
      points.push({ x, y });
    }
    const main = points
      .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(' ');

    // 0–2 forks branching from a mid segment.
    const forkCount = Math.random() < 0.7 ? (Math.random() < 0.4 ? 2 : 1) : 0;
    const forks: string[] = [];
    for (let f = 0; f < forkCount; f++) {
      const from = points[2 + Math.floor(Math.random() * (points.length - 4))];
      if (!from) continue;
      const forkSegs = 3 + Math.floor(Math.random() * 3);
      const dir = Math.random() < 0.5 ? -1 : 1;
      const fpts: Array<{ x: number; y: number }> = [{ x: from.x, y: from.y }];
      let fx = from.x;
      let fy = from.y;
      for (let i = 1; i <= forkSegs; i++) {
        fx += dir * (2 + Math.random() * 4);
        fy += 3 + Math.random() * 5;
        fpts.push({ x: fx, y: fy });
      }
      forks.push(
        fpts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' '),
      );
    }
    return { main, forks };
  }

  $effect(() => {
    if (variant !== 'storm' || level === 'off') return;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(fn, ms));
    };
    const schedule = () => {
      const base = 2500 + Math.random() * 3500;
      at(base, () => {
        // Strike: generate bolt + flash on.
        bolt = buildBolt();
        lightning = true;
        // Brief dip (~40ms off), then re-strike (~80ms on), then fade.
        at(120, () => {
          lightning = false;
        });
        at(170, () => {
          lightning = true;
        });
        at(290, () => {
          lightning = false;
          bolt = null;
          schedule();
        });
      });
    };
    schedule();
    return () => {
      timers.forEach(clearTimeout);
    };
  });

  const particles = $derived.by(() => {
    if (!isParticleField) return [];
    // Rain/storm streaks rotate 15–24° clockwise via `rotate` (individual CSS
    // transform property). Because individual props compose as rotate *before*
    // the keyframe's translate3d, the entire streak drifts leftward as it falls
    // — roughly sin(angle) × 120vh. This leaves a bare triangle in the
    // bottom-right. Extending the spawn range past 100% fills that gap; the
    // excess on the right is clipped by overflow:hidden on .ambient-layer.
    const xMax = variant === 'rain' ? 140 : variant === 'storm' ? 150 : 100;
    return Array.from({ length: count }, (_, i) => {
      const x = Math.random() * xMax;
      const y = Math.random() * 100;
      // Three depth bands (near=0, mid=1, far=2) via modulo.
      const band = (i % 3) as 0 | 1 | 2;
      // Size by band: near biggest, far smallest.
      // Spores and fireflies are intentionally tiny — they must read as
      // unresolved points so only their motion/blink pattern identifies them.
      const sizeBase =
        variant === 'spores'
          ? band === 0
            ? 0.18
            : band === 1
              ? 0.14
              : 0.1
          : variant === 'fireflies'
            ? band === 0
              ? 0.22
              : band === 1
                ? 0.17
                : 0.13
            : band === 0
              ? 0.7
              : band === 1
                ? 0.5
                : 0.35;
      const sizeJitter =
        variant === 'spores' || variant === 'fireflies' ? 0.08 : 0.4;
      const size = sizeBase + Math.random() * sizeJitter;
      // Storm composes rain drops + occasional wind streaks. Wind variant is
      // all streaks. Everything else renders as its variant default.
      const kind: 'rain' | 'wind' =
        variant === 'wind'
          ? 'wind'
          : variant === 'storm' && Math.random() < 0.18
            ? 'wind'
            : 'rain';
      // Wind streaks are long and horizontal; everything else uses the
      // original short particle length.
      const length =
        kind === 'wind' ? 4 + Math.random() * 8 : 0.8 + Math.random() * 1.6;
      const opacityBase =
        (band === 0 ? 0.7 : band === 1 ? 0.5 : 0.35) + Math.random() * 0.3;
      // Wind streaks read as atmosphere, not precipitation — pull their
      // apparent density way down so they sit behind the scene.
      const opacity = kind === 'wind' ? opacityBase * 0.25 : opacityBase;
      // Per-variant fall duration — near falls faster than far.
      const bandSpeed = band === 0 ? 0.7 : band === 1 ? 1 : 1.4;
      const duration =
        kind === 'wind'
          ? (1.6 + Math.random() * 2.4) * bandSpeed
          : variant === 'rain'
            ? 0.5 + Math.random() * 0.9
            : variant === 'storm'
              ? 0.35 + Math.random() * 0.6 // faster than rain
              : variant === 'snow'
                ? (8 + Math.random() * 14) * bandSpeed
                : variant === 'spores'
                  ? // Pollen/dust terminal velocity in still air is tiny —
                    // we fake "hanging" with a very long traversal. No
                    // bandSpeed multiplier: depth reads from size/blur/
                    // opacity, not from differential rise speed (that would
                    // fight the "all particles hanging" illusion).
                    40 + Math.random() * 30
                  : variant === 'fireflies'
                    ? // very slow wander — long period so motion reads organic
                      (18 + Math.random() * 14) * bandSpeed
                    : (10 + Math.random() * 16) * bandSpeed;
      const delay = -Math.random() * duration;
      const drift = (Math.random() * 2 - 1) * 12; // vw
      // ~10% of ash particles are embers.
      const ember = variant === 'ash' && Math.random() < 0.1;
      return {
        i,
        x,
        y,
        size,
        length,
        duration,
        delay,
        drift,
        opacity,
        band,
        ember,
        kind,
      };
    });
  });
</script>

{#if enabled && level !== 'off'}
  <div
    class="ambient-layer ambient-atmosphere ambient-{variant} {className}"
    aria-hidden="true"
    data-variant={variant}
    data-reduced-motion={reducedMotion}
    data-lightning={variant === 'storm' && lightning ? 'true' : undefined}
    style={variant === 'underwater'
      ? `--ambient-level: ${levelNum}; backdrop-filter: url(#${underwaterFilterId}); -webkit-backdrop-filter: url(#${underwaterFilterId});`
      : `--ambient-level: ${levelNum};`}
  >
    {#if isParticleField}
      {#each particles as p (p.i)}
        <span
          class="ambient-atmosphere__particle"
          data-band={p.band}
          data-kind={p.kind}
          data-ember={p.ember ? 'true' : undefined}
          style="
            --x: {p.x}%;
            --y: {p.y}%;
            --size: {p.size}rem;
            --length: {p.length}rem;
            --duration: {p.duration}s;
            --delay: {p.delay}s;
            --drift: {p.drift}vw;
            --p-opacity: {p.opacity};
          "
        ></span>
      {/each}
      {#if variant === 'storm' && bolt}
        <svg
          class="ambient-atmosphere__bolt"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polyline class="ambient-atmosphere__bolt-glow" points={bolt.main} />
          {#each bolt.forks as f}
            <polyline class="ambient-atmosphere__bolt-glow" points={f} />
          {/each}
          <polyline class="ambient-atmosphere__bolt-core" points={bolt.main} />
          {#each bolt.forks as f}
            <polyline class="ambient-atmosphere__bolt-core" points={f} />
          {/each}
        </svg>
      {/if}
    {:else if isSvgFilter && variant === 'fog'}
      <!-- Volumetric fog: vertical gradient base + two turbulence-masked banks. -->
      <span class="ambient-atmosphere__wash ambient-atmosphere__wash--a"></span>
      <svg
        class="ambient-atmosphere__svg ambient-atmosphere__svg--fog-near"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id="fog-near-{uid}"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.004 0.008"
              numOctaves="2"
              seed="3"
            >
              <animate
                attributeName="baseFrequency"
                dur="32s"
                values="0.004 0.008;0.006 0.010;0.004 0.008"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -0.15"
            />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="var(--text-main)"
          filter="url(#fog-near-{uid})"
        />
      </svg>
      <svg
        class="ambient-atmosphere__svg ambient-atmosphere__svg--fog-far"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id="fog-far-{uid}"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.010 0.014"
              numOctaves="3"
              seed="7"
            >
              <animate
                attributeName="baseFrequency"
                dur="60s"
                values="0.010 0.014;0.013 0.017;0.010 0.014"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.2"
            />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="var(--text-dim)"
          filter="url(#fog-far-{uid})"
        />
      </svg>
    {:else if isSvgFilter && variant === 'underwater'}
      <span class="ambient-atmosphere__wash ambient-atmosphere__wash--info"
      ></span>
      <span class="ambient-atmosphere__caustic"></span>
      <span class="ambient-atmosphere__caustic ambient-atmosphere__caustic--b"
      ></span>
      <svg
        class="ambient-atmosphere__svg ambient-atmosphere__svg--defs"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter
          id={underwaterFilterId}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.018"
            numOctaves="2"
            seed="2"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.010 0.016;0.014 0.020;0.010 0.016"
              dur="34s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6">
            <animate
              attributeName="scale"
              values="4;8;4"
              dur="24s"
              repeatCount="indefinite"
            />
          </feDisplacementMap>
        </filter>
      </svg>
    {:else if isSvgFilter && variant === 'heat'}
      <span class="ambient-atmosphere__wash ambient-atmosphere__wash--warm"
      ></span>
      <svg
        class="ambient-atmosphere__svg ambient-atmosphere__svg--heat-defs"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="heat-melt-{uid}"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.022"
              numOctaves="2"
              seed="7"
            >
              <animate
                attributeName="baseFrequency"
                dur="18s"
                values="0.008 0.022;0.010 0.030;0.008 0.022"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="30">
              <animate
                attributeName="scale"
                dur="9s"
                values="24;44;24"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>
      <div
        class="ambient-atmosphere__heat-melt"
        style="--heat-filter: url(#heat-melt-{uid})"
      ></div>
      <div
        class="ambient-atmosphere__heat-shimmer"
        style="--heat-filter: url(#heat-melt-{uid})"
      ></div>
      <div class="ambient-atmosphere__heat-sag"></div>
    {/if}
  </div>
{/if}
