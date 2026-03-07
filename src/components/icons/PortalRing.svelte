<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<SVGElement> {
    id?: string;
    intensity?: number;
  }

  let { id, intensity = 1, class: className, ...rest }: Props = $props();

  const componentId = $props.id();
  const defsId = `portal-ring-defs-${componentId}`;
  const warpGlassId = `${defsId}-warp-glass`;
  const warpFlatId = `${defsId}-warp-flat`;
  const warpTextId = `${defsId}-warp-text`;
  const voidDepthId = `${defsId}-void-depth`;

  let svgEl = $state<SVGSVGElement | null>(null);

  let pointerX = $state(0);
  let pointerY = $state(0);
  let pointerDist = $state(0);
  let ringWobble = $state(0);
  let prefersReducedMotion = $state(false);
  let isVisible = $state(false);

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
  const particles: Particle[] = Array.from({ length: 12 }, (_, i) => {
    const angle = i * GOLDEN_ANGLE;
    const isDrift = i < 8;
    const radius = isDrift ? 60 + (i / 8) * 120 : [170, 135, 95][i % 3];

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

  const orbitals: Orbital[] = Array.from({ length: 6 }, (_, i) => ({
    angle: (i / 6) * 360,
    radius: 170,
    r: 2.5, // void-ignore
    speed: 45,
    delay: i * 2,
  }));

  const px = $derived(pointerX * intensity);
  const py = $derived(pointerY * intensity);

  const SMOOTHING = 0.06;
  const WOBBLE_SMOOTHING = 0.08;
  const MOTION_EPSILON = 0.001;

  let targetX = 0;
  let targetY = 0;
  let targetWobble = 0;
  let wobbleEnergy = 0;
  let time = 0;
  let lastTimestamp = 0;
  let frameId: number | null = null;
  let rectCache: DOMRect | null = null;
  let lastPointerX: number | null = null;
  let lastPointerY: number | null = null;

  $effect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = motionQuery.matches;

    function handleMotionChange(event: MediaQueryListEvent) {
      prefersReducedMotion = event.matches;
    }

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }

    return () => {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }
    };
  });

  $effect(() => {
    if (!svgEl) return;

    const node = svgEl;
    const resizeObserver = new ResizeObserver(() => {
      rectCache = node.getBoundingClientRect();
    });

    let intersectionObserver: IntersectionObserver | null = null;

    resizeObserver.observe(node);

    if (typeof IntersectionObserver === 'undefined') {
      isVisible = true;
    } else {
      intersectionObserver = new IntersectionObserver((entries) => {
        isVisible = Boolean(entries[0]?.isIntersecting);

        if (isVisible) {
          invalidateRectCache();
        } else {
          resetMotion();
          stopAnimation();
        }
      });

      intersectionObserver.observe(node);
    }

    return () => {
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      isVisible = false;
      rectCache = null;
      resetMotion();
      stopAnimation();
    };
  });

  function resetMotion() {
    lastPointerX = null;
    lastPointerY = null;
    targetX = 0;
    targetY = 0;
    targetWobble = 0;
    wobbleEnergy = 0;
    time = 0;
    lastTimestamp = 0;
    pointerX = 0;
    pointerY = 0;
    pointerDist = 0;
    ringWobble = 0;
  }

  function stopAnimation() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    lastTimestamp = 0;
  }

  function shouldContinueAnimating() {
    return (
      Math.abs(targetX - pointerX) > MOTION_EPSILON ||
      Math.abs(targetY - pointerY) > MOTION_EPSILON ||
      Math.abs(targetWobble - wobbleEnergy) > MOTION_EPSILON ||
      (targetWobble <= MOTION_EPSILON && Math.abs(ringWobble) > MOTION_EPSILON)
    );
  }

  function animate(timestamp: number) {
    frameId = null;

    const dt = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0.016; // void-ignore
    lastTimestamp = timestamp;

    pointerX += (targetX - pointerX) * SMOOTHING;
    pointerY += (targetY - pointerY) * SMOOTHING;
    pointerDist = Math.min(
      1,
      Math.sqrt(pointerX * pointerX + pointerY * pointerY),
    );
    wobbleEnergy += (targetWobble - wobbleEnergy) * WOBBLE_SMOOTHING;

    time += dt;

    ringWobble =
      (Math.sin(time * 0.7) * 0.008 +
        Math.sin(time * 1.3) * 0.005 +
        Math.sin(time * 2.1) * 0.003) *
      wobbleEnergy;

    if (shouldContinueAnimating()) {
      frameId = requestAnimationFrame(animate);
    }
  }

  function startAnimation() {
    if (frameId !== null || prefersReducedMotion || intensity <= 0) return;
    frameId = requestAnimationFrame(animate);
  }

  function invalidateRectCache() {
    rectCache = null;
  }

  function updateRectCache() {
    if (!svgEl) return null;
    rectCache = svgEl.getBoundingClientRect();
    return rectCache;
  }

  function updateTargetFromPoint(clientX: number, clientY: number) {
    const rect = rectCache ?? updateRectCache();
    if (!rect) return;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const halfW = rect.width / 2 || 1;
    const halfH = rect.height / 2 || 1;

    targetX = Math.max(-1, Math.min(1, (clientX - cx) / halfW));
    targetY = Math.max(-1, Math.min(1, (clientY - cy) / halfH));

    const distance = Math.min(
      1,
      Math.sqrt(targetX * targetX + targetY * targetY),
    );
    targetWobble = 0.5 + distance * 0.5;
  }

  function handlePointerMove(event: PointerEvent) {
    if (!isVisible || prefersReducedMotion || intensity <= 0) return;

    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    updateTargetFromPoint(event.clientX, event.clientY);
    startAnimation();
  }

  function handlePointerLeave() {
    lastPointerX = null;
    lastPointerY = null;
    targetX = 0;
    targetY = 0;
    targetWobble = 0;
    startAnimation();
  }

  function handlePointerOut(event: PointerEvent) {
    if (event.relatedTarget === null) {
      handlePointerLeave();
    }
  }

  function handleViewportChange() {
    invalidateRectCache();

    if (
      !isVisible ||
      prefersReducedMotion ||
      intensity <= 0 ||
      lastPointerX === null ||
      lastPointerY === null
    ) {
      return;
    }

    updateTargetFromPoint(lastPointerX, lastPointerY);
    startAnimation();
  }

  function handleDocumentVisibilityChange() {
    if (document.hidden) {
      handlePointerLeave();
    }
  }

  $effect(() => {
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined' ||
      !svgEl ||
      !isVisible ||
      prefersReducedMotion ||
      intensity <= 0
    ) {
      resetMotion();
      stopAnimation();
      return;
    }

    const scrollOptions = { capture: true, passive: true } as const;

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('pointerout', handlePointerOut);
    window.addEventListener('resize', handleViewportChange, { passive: true });
    window.addEventListener('scroll', handleViewportChange, scrollOptions);
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener(
      'visibilitychange',
      handleDocumentVisibilityChange,
    );

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerout', handlePointerOut);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, scrollOptions);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener(
        'visibilitychange',
        handleDocumentVisibilityChange,
      );
      resetMotion();
      stopAnimation();
    };
  });
</script>

<svg
  bind:this={svgEl}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 400 400"
  fill="none"
  {id}
  class="icon-portal-ring icon {className ?? ''}"
  aria-hidden="true"
  style:--portal-warp-glass="url(#{warpGlassId})"
  style:--portal-warp-flat="url(#{warpFlatId})"
  style:--portal-warp-text="url(#{warpTextId})"
  {...rest}
>
  <defs>
    <!-- ── Filters ── -->
    <filter id={warpGlassId} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.12"
        numOctaves="3"
        seed="0"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="10"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
    <filter id={warpFlatId} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.04"
        numOctaves="3"
        seed="0"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="14"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
    <filter id={warpTextId} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.08"
        numOctaves="2"
        seed="0"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="4"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>

    <!-- ── Gradient ── -->
    <radialGradient id={voidDepthId} cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="var(--bg-canvas)" stop-opacity="0.5" />
      <stop offset="100%" stop-color="var(--bg-canvas)" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- ── Layer 0: Void Depth (static, no parallax) ── -->
  <circle
    cx="200"
    cy="200"
    r="195"
    fill={`url(#${voidDepthId})`}
    class="void-depth"
  />

  <!-- ── Layer 1: Outer Ring System ── -->
  <g
    class="ring-outer-system"
    style:transform="translate({px * 12}px, {py * 12}px) scale({1 +
      ringWobble})"
  >
    <circle cx="200" cy="200" r="175" class="ring ro-1" />
    <circle cx="200" cy="200" r="170" class="ring ro-2" />
    <circle cx="200" cy="200" r="160" class="ring ro-3" />

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

  <!-- ── Layer 2: Mid Ring System ── -->
  <g
    class="ring-mid-system"
    style:transform="translate({px * 18}px, {py * 18}px) scale({1 +
      ringWobble * 1.3})"
  >
    <circle cx="200" cy="200" r="135" class="ring rm-1" />
    <circle cx="200" cy="200" r="128" class="ring rm-2" />

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
    <!-- Glitch segment -->
    <path class="glitch" d="M 200 65 A 135 135 0 0 1 310 130" pathLength="1" />
  </g>

  <!-- ── Layer 3: Inner Ring System ── -->
  <g
    class="ring-inner-system"
    style:transform="translate({px * 26}px, {py * 26}px) scale({1 +
      ringWobble * 1.8})"
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
  </g>

  <!-- ── Layer 4: Orbital Markers ── -->
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

  <!-- ── Layer 5: Particle Field ── -->
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

  <!-- ── Layer 6: Core Text ── -->
  <g class="core-system" style:transform="translate({px * 32}px, {py * 32}px)">
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
    .ring-outer-system,
    .ring-mid-system,
    .ring-inner-system,
    .orbital-field,
    .particle-field,
    .core-system {
      transform-origin: center;
    }

    .ring-outer-system,
    .ring-mid-system,
    .ring-inner-system,
    .orbital-field,
    .particle-field {
      will-change: transform;
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
      stroke-width: 0.5; // void-ignore
      stroke-dasharray: 10 8 3 20; // void-ignore
      opacity: 0.35;
      animation:
        ring-spin 45s linear infinite,
        ring-flicker 8s ease-in-out infinite 2s;
    }

    // Mid ring circles
    .rm-1 {
      stroke-width: 0.8; // void-ignore
      stroke-dasharray: 6 10 12 16; // void-ignore
      opacity: 0.4;
      animation:
        ring-spin 50s linear infinite,
        ring-flicker 8s ease-in-out infinite;
    }

    .rm-2 {
      stroke-width: 1; // void-ignore
      stroke-dasharray: 4 14 8 12; // void-ignore
      opacity: 0.45;
      animation:
        ring-spin 40s linear infinite reverse,
        ring-flicker 6s ease-in-out infinite 0.5s;
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
        ring-flicker 6s ease-in-out infinite;
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
    .void-text {
      font-size: 64px; // void-ignore
      font-weight: 700;
      fill: currentColor;
      opacity: 0.5;
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

    .ro-1,
    .ro-2,
    .ro-3,
    .rm-1,
    .rm-2,
    .ri-1,
    .ri-2 {
      animation-timing-function: steps(60);
      stroke-width: 1.5; // void-ignore
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

    .particle {
      animation-timing-function: steps(4);
    }

    .orbital {
      animation-timing-function: steps(8);
    }

    .void-text {
      font-family: var(--font-code);
    }

    .ring-outer-system,
    .ring-mid-system,
    .ring-inner-system,
    .core-system,
    .particle-field,
    .orbital-field {
      filter: none !important;
    }
  }

  // ── Glass physics: displacement warp + bloom glow ──
  :global([data-physics='glass'] .icon-portal-ring) {
    .ring-outer-system,
    .ring-mid-system,
    .ring-inner-system,
    .orbital-field,
    .particle-field {
      filter: var(--portal-warp-glass)
        drop-shadow(0 0 12px var(--energy-primary)); // void-ignore
    }

    .void-text {
      filter: var(--portal-warp-text);
    }
  }

  // ── Flat physics: subtle displacement warp, no glow ──
  :global([data-physics='flat'] .icon-portal-ring) {
    .ring-outer-system,
    .ring-mid-system,
    .ring-inner-system,
    .orbital-field,
    .particle-field {
      filter: var(--portal-warp-flat);
    }

    .void-text {
      filter: var(--portal-warp-text);
    }
  }

  // ── Light mode: solid color, no glow ──
  :global([data-mode='light'] .icon-portal-ring) {
    .ring {
      opacity: 0.5;
    }

    .ri-1,
    .ri-2 {
      opacity: 0.7;
    }
  }

  // ── Reduced motion ──
  @media (prefers-reduced-motion: reduce) {
    .icon-portal-ring {
      // Freeze all animations
      .ro-1,
      .ro-2,
      .ro-3,
      .rm-1,
      .rm-2,
      .ri-1,
      .ri-2,
      .arc,
      .glitch,
      .orbital,
      .particle {
        animation: none;
      }

      .ro-1,
      .ro-2,
      .ro-3 {
        opacity: 0.25;
      }
      .rm-1,
      .rm-2 {
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
    }
  }

  // ── Keyframes ──

  @keyframes ring-spin {
    to {
      transform: rotate(360deg);
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
      transform: scale(1) translate(4px, -4px); // void-ignore
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1) translate(8px, -8px); // void-ignore
    }
    70% {
      opacity: 0.6;
      transform: scale(0.9) translate(12px, -6px); // void-ignore
    }
    85% {
      opacity: 0.1;
      transform: scale(0.5) translate(16px, -10px); // void-ignore
    }
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
      transform: rotate(360deg) translateY(-170px); // void-ignore
    }
  }
</style>
