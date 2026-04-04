<script lang="ts">
  import LoadingPortal from '@components/icons/LoadingPortal.svelte';
  import LoadingQuill from '@components/icons/LoadingQuill.svelte';
  import LoadingTextCycler from './LoadingTextCycler.svelte';

  interface PortalLoaderProps {
    status?: 'idle' | 'loading';
    class?: string;
  }

  let { status = 'loading', class: className }: PortalLoaderProps = $props();
</script>

<div class="portal-loader {className ?? ''}" role="status">
  <img
    src="/portal/circuits.webp"
    alt=""
    class="portal-layer portal-circuits"
    width="2048"
    height="1228"
    draggable="false"
  />
  <img
    src="/portal/vignette.webp"
    alt=""
    class="portal-layer shadow-vignette"
    width="2048"
    height="1228"
    draggable="false"
  />
  <div class="portal-layer portal-svg">
    <LoadingPortal {status} />
  </div>
  <div
    class="portal-layer portal-quill flex flex-col items-center justify-center gap-md"
  >
    {#if status === 'loading'}
      <LoadingQuill {status} data-size="4xl" />
      <span class="portal-label hidden tablet:block">
        <LoadingTextCycler />
      </span>
    {/if}
  </div>
  {#if status === 'loading'}
    <span class="sr-only">Loading</span>
  {/if}
</div>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

  .portal-loader {
    position: relative;
    width: 100%;
    aspect-ratio: 2048 / 1228; // void-ignore
    overflow: hidden;
    background-color: var(--bg-surface);
    border: var(--physics-border-width) solid var(--border-color);
    border-radius: var(--radius-base);
    @include respond-up('tablet') {
      max-width: 640px; // void-ignore
    }

    @include respond-up('small-desktop') {
      max-width: 768px; // void-ignore
    }

    @include respond-up('large-desktop') {
      max-width: 900px; // void-ignore
    }

    @include respond-up('full-hd') {
      max-width: 1024px; // void-ignore
    }
  }

  // ── Shared absolute fill ──
  .portal-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  // ── Shadow images ──
  .shadow-vignette,
  .portal-circuits {
    object-fit: cover;
    z-index: z('floor');
  }

  .shadow-vignette {
    opacity: 0.5;
  }

  .portal-circuits {
    opacity: 0.05;
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

  .portal-label {
    color: var(--energy-primary);
    font-size: var(--font-size-caption);
    animation: portal-label-pulse 3s var(--ease-spring-snappy) infinite;
  }

  // ── Glass physics: quill bloom ──
  :global([data-physics='glass']) {
    .portal-quill {
      filter: drop-shadow(0 0 6px var(--energy-primary)); // void-ignore
      color: tint(var(--energy-primary), 50%);
    }

    .portal-label {
      color: tint(var(--energy-primary), 50%);
    }
  }

  // ── Retro: stepped label pulse ──
  :global([data-physics='retro']) {
    .portal-label {
      animation-timing-function: steps(4);
      animation-duration: 3s;
    }
  }

  // ── Retro + Light: kill atmosphere layers ──
  :global([data-physics='retro']),
  :global([data-mode='light']) {
    .shadow-vignette,
    .portal-circuits {
      mix-blend-mode: normal;
    }
  }

  // ── Light-specific: dim textures ──
  :global([data-mode='light']) {
    .shadow-vignette {
      opacity: 0;
    }
  }

  // ── Reduced motion: static label ──
  @media (prefers-reduced-motion: reduce) {
    .portal-label {
      animation: none;
    }
  }

  // ── Label pulse keyframe ──
  @keyframes portal-label-pulse {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.9;
    }
  }
</style>
