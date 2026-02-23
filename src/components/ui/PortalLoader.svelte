<script lang="ts">
  import LoadingPortal from '@components/icons/LoadingPortal.svelte';
  import LoadingQuill from '@components/icons/LoadingQuill.svelte';

  interface Props {
    status?: 'idle' | 'loading';
    class?: string;
  }

  let { status = 'loading', class: className }: Props = $props();
</script>

<div
  class="portal-loader border-border border-solid rounded {className ?? ''}"
  data-status={status}
>
  <div class="portal-layer portal-neon"></div>
  <div class="portal-layer portal-glow"></div>
  <img
    src="/portal/circuits.webp"
    alt=""
    class="portal-layer portal-circuits"
    draggable="false"
  />
  <img
    src="/portal/vignette.webp"
    alt=""
    class="portal-layer shadow-vignette"
    draggable="false"
  />
  <div class="portal-layer portal-svg">
    <LoadingPortal {status} />
  </div>
  <div class="portal-layer portal-quill flex items-center justify-center">
    <LoadingQuill {status} data-size="4xl" />
  </div>
</div>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

  .portal-loader {
    position: relative;
    width: 100%;
    aspect-ratio: 1376 / 768; // void-ignore
    overflow: hidden;
    background-color: var(--bg-surface);
    max-width: 768px;
  }

  // ── Shared absolute fill ──
  .portal-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  // ── Neon Circle — energy-secondary ──
  .portal-neon {
    z-index: z('base');
    background: radial-gradient(
      circle at center,
      transparent 0%,
      alpha(var(--energy-primary), 0%) 15%,
      alpha(var(--energy-primary), 25%) 25%,
      alpha(var(--energy-primary), 0%) 35%,
      transparent 70%
    );
  }

  // ── Radial glow — energy-secondary ──
  .portal-glow {
    z-index: z('base');
    background: radial-gradient(
      circle at center,
      transparent 0%,
      alpha(var(--energy-secondary), 0%) 20%,
      alpha(var(--energy-secondary), 20%) 35%,
      alpha(var(--energy-secondary), 0%) 70%,
      transparent 70%
    );
  }

  // ── Shadow images ──
  .shadow-vignette,
  .portal-circuits {
    object-fit: cover;
    mix-blend-mode: multiply;
    z-index: z('floor');
    opacity: 0.4;
  }

  // ── SVG on top ──
  .portal-svg {
    z-index: z('decorate');
  }

  // ── Quill center icon ──
  .portal-quill {
    z-index: z('float');
    color: var(--energy-primary);
  }

  // ── Loading: breathing glow ──
  .portal-loader[data-status='loading'] {
    .portal-neon {
      will-change: transform, opacity;
      animation: neon-breathe 8s ease-in-out infinite;
    }

    .portal-glow {
      will-change: transform, opacity;
      animation: glow-breathe 10s ease-in-out infinite;
    }
  }

  // ── Idle: dim ──
  .portal-loader[data-status='idle'] {
    .portal-neon {
      opacity: 0.4;
    }

    .portal-glow {
      opacity: 0.3;
    }
  }

  // ── Retro physics: no glows, clean lines ──
  :global([data-physics='retro']) {
    .portal-neon,
    .portal-glow {
      opacity: 0 !important;
      animation: none !important;
    }

    .shadow-vignette {
      opacity: 0.1;
    }

    .portal-circuits {
      opacity: 0.5;
      mix-blend-mode: normal;
    }
  }

  // ── Light mode: kill glows, clean look ──
  :global([data-mode='light']) {
    .portal-neon {
      opacity: 0.08;
      animation: none !important;
    }

    .portal-glow {
      opacity: 0.06;
      animation: none !important;
    }

    .shadow-vignette {
      opacity: 0.15;
    }

    .portal-circuits {
      opacity: 0.6;
      mix-blend-mode: normal;
    }
  }

  // ── Flat physics: no breathing ──
  :global([data-physics='flat']) {
    .portal-neon,
    .portal-glow {
      animation: none !important;
    }
  }

  // ── Reduced motion ──
  @media (prefers-reduced-motion: reduce) {
    .portal-neon,
    .portal-glow {
      animation: none !important;
    }
  }

  @keyframes neon-breathe {
    0%,
    100% {
      opacity: 0.8;
      scale: 1;
    }
    50% {
      opacity: 1;
      scale: 1.06; // void-ignore
    }
  }

  @keyframes glow-breathe {
    0%,
    100% {
      opacity: 0.7;
      scale: 0.96; // void-ignore
    }
    50% {
      opacity: 1;
      scale: 1.08; // void-ignore
    }
  }
</style>
