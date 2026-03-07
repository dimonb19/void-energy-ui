<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<SVGElement> {
    id?: string;
    intensity?: number;
  }

  let {
    id = 'portal-ring',
    intensity = 1,
    class: className,
    ...rest
  }: Props = $props();

  let svgEl: SVGElement;
  let turbEl: SVGElement | undefined;

  let pointerX = $state(0);
  let pointerY = $state(0);
  let pointerDist = $state(0);
  let ringWobble = $state(0);
  let accretionTilt = $state(0);

  // Detect physics for conditional filter application
  let filtersActive = $state(false);

  // ── Particle generation (golden angle, deterministic) ──
  interface Particle {
    cx: number;
    cy: number;
    r: number;
    delay: number;
    duration: number;
    type: 'drift' | 'orbit';
  }

  const GOLDEN_ANGLE = 2.399963;
  const particles: Particle[] = Array.from({ length: 24 }, (_, i) => {
    const angle = i * GOLDEN_ANGLE;
    const isDrift = i < 16;
    const radius = isDrift ? 60 + (i / 16) * 120 : [170, 135, 95][i % 3];

    return {
      cx: 200 + Math.cos(angle) * radius,
      cy: 200 + Math.sin(angle) * radius,
      r: 1 + (i % 3) * 0.7, // void-ignore
      delay: (i * 0.4) % 6,
      duration: 2.5 + (i % 4) * 0.8,
      type: isDrift ? 'drift' : 'orbit',
    };
  });

  // ── Orbital markers along rings ──
  interface Orbital {
    angle: number;
    radius: number;
    r: number;
    speed: number;
    delay: number;
  }

  const orbitals: Orbital[] = [
    // Outer ring orbitals
    ...Array.from({ length: 6 }, (_, i) => ({
      angle: (i / 6) * 360,
      radius: 170,
      r: 2.5, // void-ignore
      speed: 45,
      delay: i * 2,
    })),
    // Mid ring orbitals
    ...Array.from({ length: 4 }, (_, i) => ({
      angle: (i / 4) * 360 + 22,
      radius: 130,
      r: 2, // void-ignore
      speed: 35,
      delay: i * 2.5,
    })),
  ];

  const px = $derived(pointerX * intensity);
  const py = $derived(pointerY * intensity);

  $effect(() => {
    if (!svgEl) return;

    // Detect physics preset
    const root = document.documentElement;
    filtersActive = root.dataset.physics === 'glass';

    // Watch for physics changes
    const observer = new MutationObserver(() => {
      filtersActive = root.dataset.physics === 'glass';
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-physics'],
    });

    // Reduced motion check
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReduced = motionQuery.matches;

    let targetX = 0;
    let targetY = 0;
    let time = 0;
    let frame: number;

    function onPointerMove(e: PointerEvent) {
      const rect = svgEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const halfW = rect.width / 2 || 1;
      const halfH = rect.height / 2 || 1;
      targetX = Math.max(-1, Math.min(1, (e.clientX - cx) / halfW));
      targetY = Math.max(-1, Math.min(1, (e.clientY - cy) / halfH));
    }

    function animate() {
      // Damped pointer tracking
      pointerX += (targetX - pointerX) * 0.06;
      pointerY += (targetY - pointerY) * 0.06;

      // Pointer distance from center (0-1)
      pointerDist = Math.min(
        1,
        Math.sqrt(pointerX * pointerX + pointerY * pointerY),
      );

      // Time counter
      time += 0.016;

      // Ring wobble: non-repeating sine composition
      const wobbleAmp = 0.5 + pointerDist * 0.5;
      ringWobble =
        (Math.sin(time * 0.7) * 0.008 +
          Math.sin(time * 1.3) * 0.005 +
          Math.sin(time * 2.1) * 0.003) *
        wobbleAmp;

      // Accretion disk tilt from pointer Y
      const targetTilt = pointerY * 8;
      accretionTilt += (targetTilt - accretionTilt) * 0.04;

      // Turbulence seed cycling (direct DOM mutation)
      if (!prefersReduced) {
        const seed = Math.floor(time * 0.5) % 1000;
        turbEl?.setAttribute('seed', String(seed));
      }

      frame = requestAnimationFrame(animate);
    }

    document.addEventListener('pointermove', onPointerMove);
    if (!prefersReduced) {
      frame = requestAnimationFrame(animate);
    }

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  });
</script>

<svg
  bind:this={svgEl}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 400 400"
  fill="none"
  class="icon-portal-ring icon {className ?? ''}"
  aria-hidden="true"
  {...rest}
>
  <defs>
    <!-- ── Filters ── -->
    <filter id="{id}-warp" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence
        bind:this={turbEl}
        type="fractalNoise"
        baseFrequency="0.015"
        numOctaves="3"
        seed="0"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="8"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>

    <!-- ── Gradients ── -->
    <radialGradient id="{id}-event-horizon" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="currentColor" stop-opacity="0.12" />
      <stop offset="25%" stop-color="currentColor" stop-opacity="0.06" />
      <stop offset="50%" stop-color="currentColor" stop-opacity="0.1" />
      <stop offset="70%" stop-color="currentColor" stop-opacity="0.04" />
      <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="{id}-void-depth" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="var(--bg-canvas)" stop-opacity="1" />
      <stop offset="15%" stop-color="var(--bg-canvas)" stop-opacity="0.98" />
      <stop offset="30%" stop-color="var(--bg-canvas)" stop-opacity="0.92" />
      <stop offset="45%" stop-color="var(--bg-canvas)" stop-opacity="0.8" />
      <stop offset="60%" stop-color="var(--bg-canvas)" stop-opacity="0.55" />
      <stop offset="75%" stop-color="var(--bg-canvas)" stop-opacity="0.3" />
      <stop offset="90%" stop-color="var(--bg-canvas)" stop-opacity="0.1" />
      <stop offset="100%" stop-color="var(--bg-canvas)" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- ── Layer 0: Event Horizon ── -->
  <g class="event-horizon" style:transform="translate({px * 4}px, {py * 4}px)">
    <circle
      cx="200"
      cy="200"
      r="190"
      fill="url(#{id}-event-horizon)"
      class="horizon-bg"
    />
  </g>

  <!-- ── Layer 1: Accretion Disk ── -->
  <g class="accretion-disk" style:transform="translate({px * 8}px, {py * 8}px)">
    <ellipse
      cx="200"
      cy="200"
      rx="175"
      ry={158 + accretionTilt}
      class="accretion-ellipse ae-1"
    />
    <ellipse
      cx="200"
      cy="200"
      rx="165"
      ry={145 + accretionTilt * 0.8}
      class="accretion-ellipse ae-2"
    />
    <ellipse
      cx="200"
      cy="200"
      rx="155"
      ry={132 + accretionTilt * 0.6}
      class="accretion-ellipse ae-3"
    />
  </g>

  <!-- ── Layer 2: Outer Ring System ── -->
  <g
    class="ring-outer-system"
    style:transform="translate({px * 12}px, {py * 12}px) scale({1 +
      ringWobble})"
    filter={filtersActive ? `url(#${id}-warp)` : undefined}
  >
    <circle cx="200" cy="200" r="175" class="ring ro-1" />
    <circle cx="200" cy="200" r="170" class="ring ro-2" />
    <circle cx="200" cy="200" r="165" class="ring ro-3" />
    <circle cx="200" cy="200" r="160" class="ring ro-4" />

    <!-- Energy arcs -->
    <path
      class="arc arc-a"
      d="M 200 25 A 175 175 0 0 1 350 110"
      pathLength="1"
    />
    <path
      class="arc arc-b"
      d="M 375 200 A 175 175 0 0 1 290 350"
      pathLength="1"
    />
    <path
      class="arc arc-c"
      d="M 200 375 A 175 175 0 0 1 50 290"
      pathLength="1"
    />
    <path
      class="arc arc-d"
      d="M 25 200 A 175 175 0 0 1 110 50"
      pathLength="1"
    />
  </g>

  <!-- ── Layer 3: Mid Ring System ── -->
  <g
    class="ring-mid-system"
    style:transform="translate({px * 18}px, {py * 18}px) scale({1 +
      ringWobble * 1.3})"
    filter={filtersActive ? `url(#${id}-warp)` : undefined}
  >
    <circle cx="200" cy="200" r="135" class="ring rm-1" />
    <circle cx="200" cy="200" r="128" class="ring rm-2" />
    <circle cx="200" cy="200" r="120" class="ring rm-3" />

    <!-- Energy arcs -->
    <path
      class="arc arc-mid-a"
      d="M 200 65 A 135 135 0 0 1 310 130"
      pathLength="1"
    />
    <path
      class="arc arc-mid-b"
      d="M 335 200 A 135 135 0 0 1 260 315"
      pathLength="1"
    />
    <path
      class="arc arc-mid-c"
      d="M 130 310 A 135 135 0 0 1 65 200"
      pathLength="1"
    />
    <path
      class="arc arc-mid-d"
      d="M 85 120 A 135 135 0 0 1 200 65"
      pathLength="1"
    />
    <path
      class="arc arc-mid-e"
      d="M 280 95 A 135 135 0 0 1 335 200"
      pathLength="1"
    />
    <path
      class="arc arc-mid-f"
      d="M 200 335 A 135 135 0 0 1 85 280"
      pathLength="1"
    />

    <!-- Glitch segments -->
    <path
      class="glitch glitch-a"
      d="M 200 65 A 135 135 0 0 1 310 130"
      pathLength="1"
    />
    <path
      class="glitch glitch-b"
      d="M 335 200 A 135 135 0 0 1 260 315"
      pathLength="1"
    />
    <path
      class="glitch glitch-c"
      d="M 130 310 A 135 135 0 0 1 65 200"
      pathLength="1"
    />
  </g>

  <!-- ── Layer 4: Inner Ring System ── -->
  <g
    class="ring-inner-system"
    style:transform="translate({px * 26}px, {py * 26}px) scale({1 +
      ringWobble * 1.8})"
    filter={filtersActive ? `url(#${id}-warp)` : undefined}
  >
    <circle cx="200" cy="200" r="95" class="ring ri-1" />
    <circle cx="200" cy="200" r="88" class="ring ri-2" />

    <!-- Inner energy arcs -->
    <path
      class="arc arc-inner-a"
      d="M 200 105 A 95 95 0 0 1 280 155"
      pathLength="1"
    />
    <path
      class="arc arc-inner-b"
      d="M 200 295 A 95 95 0 0 1 120 245"
      pathLength="1"
    />

    <!-- Discharge arcs (lightning between inner and mid rings) -->
    <polyline
      class="discharge discharge-a"
      points="200,105 195,95 205,85 198,75 203,65"
    />
    <polyline
      class="discharge discharge-b"
      points="280,155 290,148 285,140 295,130"
    />
    <polyline
      class="discharge discharge-c"
      points="120,245 115,255 125,265 118,275 122,285"
    />
  </g>

  <!-- ── Layer 5: Orbital Markers ── -->
  <g
    class="orbital-field"
    style:transform="translate({px * 15}px, {py * 15}px)"
  >
    {#each orbitals as orb, i}
      <circle
        cx="200"
        cy="200"
        r={orb.r}
        class="orbital orbital-{i}"
        style:transform="rotate({orb.angle}deg) translateY(-{orb.radius}px)"
        style:animation-duration="{orb.speed}s"
        style:animation-delay="-{orb.delay}s"
      />
    {/each}
  </g>

  <!-- ── Layer 6: Particle Field ── -->
  <g
    class="particle-field"
    style:transform="translate({px * 20}px, {py * 20}px)"
  >
    {#each particles as p, i}
      <circle
        cx={p.cx}
        cy={p.cy}
        r={p.r}
        class="particle particle-{p.type}"
        style:animation-delay="{p.delay}s"
        style:animation-duration="{p.duration}s"
      />
    {/each}
  </g>

  <!-- ── Layer 7: Core Void ── -->
  <g class="core-system" style:transform="translate({px * 32}px, {py * 32}px)">
    <!-- Dark void depth — static, no parallax, covers the full inner area -->
    <circle
      cx="200"
      cy="200"
      r="195"
      fill="url(#{id}-void-depth)"
      class="void-depth"
    />
    <text
      x="200"
      y="200"
      class="void-text"
      text-anchor="middle"
      dominant-baseline="central">404</text
    >
  </g>
</svg>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

  .icon-portal-ring {
    width: 100%;
    height: auto;
    color: var(--energy-primary);
    overflow: visible;

    // ── Layer groups ──
    .event-horizon,
    .accretion-disk,
    .ring-outer-system,
    .ring-mid-system,
    .ring-inner-system,
    .orbital-field,
    .particle-field,
    .core-system {
      will-change: transform;
      transform-origin: center;
    }

    // ── Event Horizon ──
    .horizon-bg {
      animation: event-horizon-pulse 15s ease-in-out infinite;
    }

    // ── Accretion Disk ──
    .accretion-ellipse {
      fill: none;
      stroke: currentColor;
      transform-box: fill-box;
      transform-origin: center;
    }

    .ae-1 {
      stroke-width: 0.5; // void-ignore
      stroke-opacity: 0.15;
      animation: accretion-spin 120s linear infinite reverse;
    }

    .ae-2 {
      stroke-width: 0.75; // void-ignore
      stroke-opacity: 0.2;
      animation: accretion-spin 90s linear infinite;
    }

    .ae-3 {
      stroke-width: 1; // void-ignore
      stroke-opacity: 0.25;
      animation: accretion-spin 70s linear infinite reverse;
    }

    // ── Ring base ──
    .ring {
      fill: none;
      stroke: currentColor;
      transform-box: fill-box;
      transform-origin: center;
    }

    // Outer ring circles
    .ro-1 {
      stroke-width: 0.4; // void-ignore
      stroke-dasharray: 3 12 8 20; // void-ignore
      opacity: 0.3;
      animation:
        ring-spin 80s linear infinite reverse,
        ring-flicker 6s ease-in-out infinite;
    }

    .ro-2 {
      stroke-width: 0.6; // void-ignore
      stroke-dasharray: 5 15 2 10; // void-ignore
      opacity: 0.25;
      animation:
        ring-spin 65s linear infinite,
        ring-flicker 7s ease-in-out infinite 1s;
    }

    .ro-3 {
      stroke-width: 0.3; // void-ignore
      stroke-dasharray: 2 18 6 14; // void-ignore
      opacity: 0.2;
      animation:
        ring-spin 55s linear infinite reverse,
        ring-flicker 8s ease-in-out infinite 2s;
    }

    .ro-4 {
      stroke-width: 0.5; // void-ignore
      stroke-dasharray: 10 8 3 20; // void-ignore
      opacity: 0.35;
      animation:
        ring-spin 45s linear infinite,
        ring-breathe 9s ease-in-out infinite;
    }

    // Mid ring circles
    .rm-1 {
      stroke-width: 0.8; // void-ignore
      stroke-dasharray: 6 10 12 16; // void-ignore
      opacity: 0.4;
      animation:
        ring-spin 50s linear infinite,
        ring-breathe 8s ease-in-out infinite;
    }

    .rm-2 {
      stroke-width: 1; // void-ignore
      stroke-dasharray: 4 14 8 12; // void-ignore
      opacity: 0.45;
      animation:
        ring-spin 40s linear infinite reverse,
        ring-flicker 6s ease-in-out infinite 0.5s;
    }

    .rm-3 {
      stroke-width: 0.6; // void-ignore
      stroke-dasharray: 2 20 5 10; // void-ignore
      opacity: 0.35;
      animation:
        ring-spin 35s linear infinite,
        ring-breathe 7s ease-in-out infinite 1s;
    }

    // Inner ring circles
    .ri-1 {
      stroke-width: 1.2; // void-ignore
      stroke-dasharray: 4 8 2 12; // void-ignore
      opacity: 0.6;
      animation:
        ring-spin 30s linear infinite reverse,
        ring-flicker 5s ease-in-out infinite 1.5s;
    }

    .ri-2 {
      stroke-width: 1.5; // void-ignore
      stroke-dasharray: 3 6 8 10; // void-ignore
      opacity: 0.55;
      animation:
        ring-spin 25s linear infinite,
        ring-breathe 6s ease-in-out infinite;
    }

    // ── Energy arcs ──
    .arc {
      fill: none;
      stroke: currentColor;
      stroke-width: 2; // void-ignore
      stroke-linecap: round;
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      opacity: 0;
      animation: arc-draw 4s cubic-bezier(0.76, 0, 0.24, 1) infinite;
    }

    .arc-b {
      animation-delay: 1s;
    }
    .arc-c {
      animation-delay: 2s;
    }
    .arc-d {
      animation-delay: 3s;
    }

    .arc-mid-a {
      animation-delay: 0.3s;
      animation-duration: 3.5s;
    }
    .arc-mid-b {
      animation-delay: 0.9s;
      animation-duration: 3.8s;
    }
    .arc-mid-c {
      animation-delay: 1.5s;
      animation-duration: 3.2s;
    }
    .arc-mid-d {
      animation-delay: 2.1s;
      animation-duration: 3.6s;
    }
    .arc-mid-e {
      animation-delay: 2.7s;
      animation-duration: 3.4s;
    }
    .arc-mid-f {
      animation-delay: 3.3s;
      animation-duration: 3.9s;
    }

    .arc-inner-a {
      stroke-width: 2.5; // void-ignore
      animation-duration: 3s;
      animation-delay: 0.5s;
    }

    .arc-inner-b {
      stroke-width: 2.5; // void-ignore
      animation-duration: 3s;
      animation-delay: 2s;
    }

    // ── Glitch segments ──
    .glitch {
      fill: none;
      stroke: currentColor;
      stroke-width: 3; // void-ignore
      stroke-linecap: round;
      stroke-dasharray: 1;
      stroke-dashoffset: 0;
      animation: glitch-flash 6s ease-in-out infinite;
    }

    .glitch-b {
      animation-delay: 2s;
    }
    .glitch-c {
      animation-delay: 4s;
    }

    // ── Discharge arcs ──
    .discharge {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5; // void-ignore
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0;
      animation: discharge-flash 8s ease-in-out infinite;
    }

    .discharge-b {
      animation-delay: 3s;
    }
    .discharge-c {
      animation-delay: 5.5s;
    }

    // ── Orbital markers ──
    .orbital {
      fill: currentColor;
      opacity: 0.5;
      transform-box: fill-box;
      transform-origin: center;
      animation: orbital-rotate 45s linear infinite;
    }

    // ── Particles ──
    .particle {
      fill: currentColor;
      transform-box: fill-box;
      transform-origin: center;
    }

    .particle-drift {
      opacity: 0;
      animation: particle-drift 3s ease-in-out infinite;
    }

    .particle-orbit {
      opacity: 0;
      animation: particle-orbit 4s ease-in-out infinite;
    }

    // ── Core ──
    .void-depth {
      animation: event-horizon-pulse 15s ease-in-out infinite;
    }

    .void-text {
      font-size: 64px; // void-ignore
      font-weight: 700;
      fill: currentColor;
      opacity: 0.12;
      letter-spacing: 0.15em; // void-ignore
      user-select: none;
      pointer-events: none;
    }
  }

  // ── Retro physics: stepped, hard edges ──
  :global([data-physics='retro'] .icon-portal-ring) {
    .ring {
      stroke-dasharray: 6 6; // void-ignore
    }

    .accretion-ellipse {
      stroke-dasharray: 8 8; // void-ignore
    }

    .ro-1,
    .ro-2,
    .ro-3,
    .ro-4,
    .rm-1,
    .rm-2,
    .rm-3,
    .ri-1,
    .ri-2 {
      animation-timing-function: steps(60);
      stroke-width: 1.5; // void-ignore
    }

    .ae-1,
    .ae-2,
    .ae-3 {
      animation-timing-function: steps(60);
      stroke-width: 1; // void-ignore
    }

    .arc {
      stroke-width: 2; // void-ignore
      animation-timing-function: steps(6);
      animation-duration: 6s;
    }

    .glitch {
      stroke-width: 3; // void-ignore
      animation-timing-function: steps(4);
    }

    .discharge {
      animation-timing-function: steps(3);
    }

    .particle {
      animation-timing-function: steps(4);
    }

    .orbital {
      animation-timing-function: steps(8);
    }

    .void-text {
      opacity: 0.2;
      font-family: monospace;
    }

    .ring-outer-system,
    .ring-mid-system,
    .ring-inner-system,
    .core-system,
    .particle-field,
    .orbital-field,
    .event-horizon,
    .accretion-disk {
      filter: none !important;
    }
  }

  // ── Light mode: solid color, no glow ──
  :global([data-mode='light'] .icon-portal-ring) {
    .ring-outer-system,
    .ring-mid-system,
    .ring-inner-system,
    .core-system,
    .particle-field,
    .orbital-field,
    .event-horizon,
    .accretion-disk {
      filter: none !important;
    }

    .ring {
      opacity: 0.5;
    }

    .ri-1,
    .ri-2 {
      opacity: 0.7;
    }

    .accretion-ellipse {
      stroke-opacity: 0.3;
    }

    .void-text {
      opacity: 0.15;
    }
  }

  // ── Reduced motion ──
  @media (prefers-reduced-motion: reduce) {
    .icon-portal-ring {
      // Freeze all animations
      .ro-1,
      .ro-2,
      .ro-3,
      .ro-4,
      .rm-1,
      .rm-2,
      .rm-3,
      .ri-1,
      .ri-2,
      .ae-1,
      .ae-2,
      .ae-3,
      .arc,
      .glitch,
      .discharge,
      .orbital,
      .particle,
      .void-depth,
      .horizon-bg {
        animation: none;
      }

      .ro-1,
      .ro-2,
      .ro-3,
      .ro-4 {
        opacity: 0.25;
      }
      .rm-1,
      .rm-2,
      .rm-3 {
        opacity: 0.35;
      }
      .ri-1,
      .ri-2 {
        opacity: 0.5;
      }

      .arc,
      .glitch {
        stroke-dashoffset: 0.3; // void-ignore
        opacity: 0.4;
      }

      .particle {
        opacity: 0.3;
      }
      .orbital {
        opacity: 0.4;
      }

      .void-depth {
        opacity: 0.8;
      }

      .discharge {
        display: none;
      }
    }
  }

  // ── Keyframes ──

  @keyframes ring-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes ring-breathe {
    0%,
    100% {
      transform: scale(1);
      opacity: inherit;
    }
    30% {
      transform: scale(1.012);
    }
    60% {
      transform: scale(0.988);
    }
    80% {
      transform: scale(1.005);
    }
  }

  @keyframes ring-flicker {
    0%,
    100% {
      opacity: inherit;
    }
    8% {
      opacity: 0.6;
    }
    16% {
      opacity: 0.15;
    }
    24% {
      opacity: 0.7;
    }
    32% {
      opacity: 0.3;
    }
    48% {
      opacity: 0.55;
    }
    56% {
      opacity: 0.2;
    }
    72% {
      opacity: 0.65;
    }
    80% {
      opacity: 0.25;
    }
    92% {
      opacity: 0.5;
    }
  }

  @keyframes arc-draw {
    0% {
      stroke-dashoffset: 1;
      opacity: 0;
    }
    8% {
      opacity: 0.7;
    }
    20% {
      opacity: 1;
    }
    45% {
      stroke-dashoffset: 0;
      opacity: 0.8;
    }
    55% {
      stroke-dashoffset: 0;
      opacity: 0.6;
    }
    65% {
      opacity: 0.9;
    }
    85% {
      stroke-dashoffset: 0.8;
      opacity: 0.2;
    } // void-ignore
    95% {
      stroke-dashoffset: 1;
      opacity: 0.05;
    }
    100% {
      stroke-dashoffset: 1;
      opacity: 0;
    }
  }

  @keyframes glitch-flash {
    0%,
    100% {
      stroke-dashoffset: 0.5;
      opacity: 0;
    } // void-ignore
    8% {
      opacity: 0;
    }
    12% {
      stroke-dashoffset: 0;
      opacity: 0.8;
    }
    18% {
      opacity: 0.3;
    }
    22% {
      opacity: 0.9;
    }
    28% {
      stroke-dashoffset: 0;
      opacity: 0.6;
    }
    35% {
      stroke-dashoffset: 0.3;
      opacity: 0;
    } // void-ignore
    100% {
      opacity: 0;
    }
  }

  @keyframes discharge-flash {
    0%,
    100% {
      opacity: 0;
    }
    5% {
      opacity: 0;
    }
    6% {
      opacity: 0.9;
    }
    8% {
      opacity: 0.3;
    }
    9% {
      opacity: 1;
    }
    11% {
      opacity: 0;
    }
    50% {
      opacity: 0;
    }
    51% {
      opacity: 0.7;
    }
    52% {
      opacity: 0;
    }
    53% {
      opacity: 0.8;
    }
    55% {
      opacity: 0;
    }
  }

  @keyframes particle-drift {
    0%,
    100% {
      opacity: 0;
      transform: scale(0.6) translate(0, 0);
    }
    15% {
      opacity: 0;
    }
    30% {
      opacity: 0.7;
      transform: scale(1) translate(4px, -4px);
    } // void-ignore
    50% {
      opacity: 0.5;
      transform: scale(1.1) translate(8px, -8px);
    } // void-ignore
    70% {
      opacity: 0.6;
      transform: scale(0.9) translate(12px, -6px);
    } // void-ignore
    85% {
      opacity: 0.1;
      transform: scale(0.5) translate(16px, -10px);
    } // void-ignore
  }

  @keyframes particle-orbit {
    0%,
    100% {
      opacity: 0;
      transform: rotate(0deg) scale(0.8);
    }
    20% {
      opacity: 0.6;
      transform: rotate(72deg) scale(1);
    }
    50% {
      opacity: 0.8;
      transform: rotate(180deg) scale(1.1);
    }
    80% {
      opacity: 0.4;
      transform: rotate(288deg) scale(0.9);
    }
  }

  @keyframes orbital-rotate {
    to {
      transform: rotate(360deg) translateY(-170px);
    } // void-ignore
  }

  @keyframes event-horizon-pulse {
    0%,
    100% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.03);
    }
  }

  @keyframes accretion-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
