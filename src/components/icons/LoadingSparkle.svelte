<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<SVGElement> {
    status?: 'idle' | 'loading';
  }

  let { status = 'loading', class: className, ...rest }: Props = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  stroke="currentColor"
  fill="none"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon-loading-sparkle icon {className ?? ''}"
  data-status={status}
  aria-hidden="true"
  {...rest}
>
  <!-- Main 4-point star -->
  <path
    class="sparkle-main"
    d="M12 4 L13.5 10.5 L20 12 L13.5 13.5 L12 20 L10.5 13.5 L4 12 L10.5 10.5 Z"
  />
  <!-- Accent: cross (top-right) -->
  <g class="sparkle-accent sparkle-accent-tr">
    <path d="M19 3v4" />
    <path d="M21 5h-4" />
  </g>
  <!-- Accent: dot (bottom-left) -->
  <circle class="sparkle-accent sparkle-accent-bl" cx="5" cy="19" r="1.5" />
</svg>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

  .icon-loading-sparkle {
    --twinkle-duration: 3s;
    --twinkle-stagger: 0.45s;

    .sparkle-main,
    .sparkle-accent {
      transform-box: fill-box;
      transform-origin: center;
    }

    // ── Idle: settled at rest, matches static Sparkle look ──
    &[data-status='idle'] {
      .sparkle-main {
        opacity: 1;
      }

      .sparkle-accent {
        opacity: 0.4;
      }
    }

    // ── Loading: continuous breath, brightness wave staggered across elements ──
    &[data-status='loading'] {
      .sparkle-main {
        will-change: transform, opacity;
        animation: twinkle var(--twinkle-duration) var(--ease-flow) infinite;
      }

      .sparkle-accent-tr {
        will-change: transform, opacity;
        animation: twinkle var(--twinkle-duration) var(--ease-flow) infinite;
        animation-delay: var(--twinkle-stagger);
      }

      .sparkle-accent-bl {
        will-change: transform, opacity;
        animation: twinkle var(--twinkle-duration) var(--ease-flow) infinite;
        animation-delay: calc(var(--twinkle-stagger) * 2);
      }
    }
  }

  // ── Retro: stepped, no scale bounce ──
  :global([data-physics='retro'] .icon-loading-sparkle[data-status='loading']) {
    .sparkle-main,
    .sparkle-accent-tr,
    .sparkle-accent-bl {
      animation-name: twinkle-retro;
      animation-timing-function: steps(4);
    }
  }

  // ── Reduced motion: static fallback ──
  // Global kill switch (_accessibility.scss) handles animation: none !important.
  // We only need to set the visual resting state.
  @media (prefers-reduced-motion: reduce) {
    .icon-loading-sparkle[data-status='loading'] {
      .sparkle-main {
        opacity: 1;
      }

      .sparkle-accent {
        opacity: 0.7;
      }
    }
  }

  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.45;
      scale: 0.96; // void-ignore
    }
    30% {
      opacity: 1;
      scale: 1.08; // void-ignore
    }
    60% {
      opacity: 0.7;
      scale: 1;
    }
  }

  @keyframes twinkle-retro {
    0%,
    100% {
      opacity: 0;
    }
    20%,
    50% {
      opacity: 1;
    }
    70% {
      opacity: 0.4;
    }
  }
</style>
