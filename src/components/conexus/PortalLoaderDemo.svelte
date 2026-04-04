<script lang="ts">
  import PortalLoader from '../../../packages/dgrs/src/components/PortalLoader.svelte';
  import LoadingTextCycler from '../../../packages/dgrs/src/components/LoadingTextCycler.svelte';
  import IconBtn from '@components/ui/IconBtn.svelte';
  import PlayPause from '@components/icons/PlayPause.svelte';

  let portalStatus = $state<'idle' | 'loading'>('loading');
</script>

<!-- ─── PORTAL LOADER ─────────────────────────────────────────── -->
<div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
  <h3 class="text-dim">Portal Loader</h3>
  <p class="text-small text-mute">
    The animated loading screen for CoNexus story worlds.
  </p>
</div>

<div class="surface-raised p-lg flex flex-col gap-lg">
  <details>
    <summary>Technical Details</summary>
    <div class="p-md flex flex-col gap-md">
      <p>
        The portal is a 4-layer absolute stack: a circuit-board texture at 5%
        opacity, a vignette overlay at 50% opacity, an SVG circuitry layer with
        draw-on path animation, and a centered quill icon. All layers fill the
        same <code>aspect-ratio: 2048/1228</code>
        container with responsive max-width scaling up to
        <code>1024px</code>.
      </p>
      <p>
        <strong>LoadingPortal</strong> renders 4 staggered path groups (<code
          >.draw-a</code
        >
        through <code>.draw-d</code>) using
        <code>stroke-dasharray</code>/<code>stroke-dashoffset</code>
        animation on a 6s draw cycle with 1.5s stagger between groups. The entire
        circuitry rotates 360&deg; over 120s.
      </p>
      <p>
        <strong>LoadingQuill</strong> cycles a 3s lifecycle: the stroke traces the
        quill outline, the body fill fades in with a scale pulse, and an accent dot
        levitates from the pen tip before being absorbed back. A gentle breath translation
        keeps the whole quill alive.
      </p>
      <p>
        Two states control the animation:
        <code>idle</code> (frozen, dimmed) and
        <code>loading</code> (animated).
      </p>
    </div>
  </details>

  <div class="flex flex-col gap-sm items-center">
    <p class="text-small text-mute">
      Toggle between <code>idle</code> and <code>loading</code> states. In idle,
      all layers freeze and dim. In loading, circuitry paths draw on in staggered
      waves while the quill cycles its trace&ndash;fill&ndash;absorb animation.
    </p>

    <PortalLoader status={portalStatus} />
    <IconBtn
      icon={PlayPause}
      aria-label={portalStatus === 'loading' ? 'Stop' : 'Start'}
      aria-pressed={portalStatus === 'loading'}
      onclick={() =>
        (portalStatus = portalStatus === 'loading' ? 'idle' : 'loading')}
      iconProps={{
        'data-paused': portalStatus === 'loading' ? 'true' : undefined,
      }}
    />

    <p class="text-caption text-mute">
      The loader fills its container width, scaling from <code>640px</code>
      at tablet to <code>1024px</code> at full-HD. Pass
      <code>status="idle"</code> to hold the portal in a dormant state, or
      <code>status="loading"</code> to activate all animations.
    </p>
  </div>

  <!-- ─── LOADING TEXT CYCLER ──────────────────────────────────────── -->
  <div class="flex flex-col gap-xs">
    <h4>Loading Text Cycler</h4>
    <p class="text-small text-mute">
      A rotating text label that cycles through branded loading words with a
      typewriter effect. Used inside the portal loader, but works standalone for
      any loading state that needs dynamic copy.
    </p>
  </div>

  <div class="surface-sunk p-md flex flex-col items-center gap-md">
    <LoadingTextCycler />
    <p class="text-caption text-mute">
      Accepts custom <code>words</code>, <code>interval</code>, and
      <code>speed</code> props. Defaults to the branded word set.
    </p>
  </div>
</div>

<style lang="scss">
  :global(.portal-ring-demo) {
    width: 100%;
    max-width: 480px; // void-ignore
  }
</style>
